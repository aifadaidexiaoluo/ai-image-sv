import { json } from '@sveltejs/kit';
import { sceneCategories } from '$lib/app-catalog';
import { ensureWallet, reserveCredits, settleCredits } from '$lib/server/credits';
import { db } from '$lib/server/db';
import { assets, userSceneTemplates } from '$lib/server/db/schema';
import { getImageProvider, type GenerationProviderId } from '$lib/server/providers';
import { storageProvider } from '$lib/server/storage';
import type { RequestHandler } from './$types';

const templateGenerationCredits = 2;
const providers = new Set<GenerationProviderId>(['auto', 'openai', 'tongyi']);
const allowedCategories = new Set<string>(
	sceneCategories.filter((item) => item.id !== 'all').map((item) => item.id)
);

function validateInput(input: { title?: string; category?: string; prompt?: string }) {
	const title = input.title?.trim() ?? '';
	const prompt = input.prompt?.trim() ?? '';
	if (!title || title.length > 60) return '模板标题需填写且不能超过 60 个字符';
	if (!input.category || !allowedCategories.has(input.category)) return '请选择有效的场景分类';
	if (prompt.length < 8 || prompt.length > 500) return '场景描述需填写且不能超过 500 个字符';
	return '';
}

function extensionForMimeType(mimeType: string) {
	if (mimeType.includes('svg')) return 'svg';
	if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
	if (mimeType.includes('webp')) return 'webp';
	return 'png';
}

function buildTemplatePrompt(input: { title: string; prompt: string }) {
	return [
		`生成一张适合电商商品融合的无商品场景模板：${input.title}`,
		input.prompt,
		'画面必须没有商品、人物、品牌标识和文字',
		'构图为 16:9，保留干净可放置商品的区域',
		'真实商业摄影质感，自然光线，背景层次清晰'
	].join('。');
}

async function serializeTemplate(row: {
	template: typeof userSceneTemplates.$inferSelect;
	asset: typeof assets.$inferSelect;
}) {
	return {
		id: row.template.id,
		title: row.template.title,
		category: row.template.category,
		assetId: row.asset.id,
		image: await storageProvider.presignDownload(row.asset.objectKey),
		createdAt: row.template.createdAt.toISOString(),
		owner: 'user' as const
	};
}

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const input = (await request.json()) as {
		title?: string;
		category?: string;
		prompt?: string;
		provider?: GenerationProviderId;
	};
	const message = validateInput(input);
	if (message) return json({ message }, { status: 400 });

	const title = input.title!.trim();
	const prompt = input.prompt!.trim();
	const provider = input.provider && providers.has(input.provider) ? input.provider : 'auto';
	const creditReferenceId = crypto.randomUUID();

	await ensureWallet(locals.user.id);
	try {
		await reserveCredits(locals.user.id, templateGenerationCredits, `${creditReferenceId}:0`);
	} catch (error) {
		if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
			return json({ message: '积分不足，请先购买积分或升级套餐' }, { status: 402 });
		}
		throw error;
	}

	try {
		const [generated] = await getImageProvider(provider).generate({
			tool: 'product',
			prompt: buildTemplatePrompt({ title, prompt }),
			count: 1,
			aspectRatio: '16:9'
		});
		if (!generated) throw new Error('TEMPLATE_GENERATION_EMPTY');

		const assetId = crypto.randomUUID();
		const mimeType = generated.mimeType || 'image/png';
		const extension = extensionForMimeType(mimeType);
		const objectKey = `users/${locals.user.id}/scene-templates/${assetId}.${extension}`;
		await storageProvider.putObject(objectKey, generated.bytes, mimeType);

		const row = await db.transaction(async (tx) => {
			const [asset] = await tx
				.insert(assets)
				.values({
					id: assetId,
					userId: locals.user!.id,
					kind: 'template',
					objectKey,
					fileName: `${title}.${extension}`,
					displayName: title,
					mimeType,
					sizeBytes: generated.bytes.byteLength
				})
				.returning();
			const [template] = await tx
				.insert(userSceneTemplates)
				.values({
					userId: locals.user!.id,
					title,
					category: input.category!,
					assetId: asset.id
				})
				.returning();
			return { template, asset };
		});

		await settleCredits(
			locals.user.id,
			`${creditReferenceId}:0`,
			templateGenerationCredits,
			templateGenerationCredits
		);
		return json({ template: await serializeTemplate(row) }, { status: 201 });
	} catch (error) {
		await settleCredits(locals.user.id, `${creditReferenceId}:0`, templateGenerationCredits, 0);
		console.error('[scene-templates:generate]', error);
		return json({ message: '模板生成失败，请稍后重试' }, { status: 500 });
	}
};
