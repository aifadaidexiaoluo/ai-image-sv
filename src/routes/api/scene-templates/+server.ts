import { json } from '@sveltejs/kit';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { sceneCategories } from '$lib/app-catalog';
import { db } from '$lib/server/db';
import { assets, userSceneTemplates } from '$lib/server/db/schema';
import { storageProvider } from '$lib/server/storage';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 10 * 1024 * 1024;
const allowedCategories = new Set<string>(
	sceneCategories.filter((item) => item.id !== 'all').map((item) => item.id)
);

function validateTemplateInput(input: {
	title?: string;
	category?: string;
	fileName?: string;
	contentType?: string;
	size?: number;
}) {
	const title = input.title?.trim() ?? '';
	if (!title || title.length > 60) return '模板标题需填写且不能超过 60 个字符';
	if (!input.category || !allowedCategories.has(input.category)) return '请选择有效的场景分类';
	if (!input.fileName || !input.contentType || !allowedTypes.has(input.contentType)) {
		return '仅支持 JPG、PNG 和 WebP 图片';
	}
	if (!input.size || input.size <= 0 || input.size > maxBytes) return '图片大小不能超过 10 MB';
	return '';
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

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const rows = await db
		.select({ template: userSceneTemplates, asset: assets })
		.from(userSceneTemplates)
		.innerJoin(assets, eq(userSceneTemplates.assetId, assets.id))
		.where(
			and(
				eq(userSceneTemplates.userId, locals.user.id),
				eq(assets.userId, locals.user.id),
				isNull(assets.deletedAt)
			)
		)
		.orderBy(desc(userSceneTemplates.createdAt))
		.limit(100);
	return json({ templates: await Promise.all(rows.map(serializeTemplate)) });
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const input = (await request.json()) as {
		title?: string;
		category?: string;
		fileName?: string;
		contentType?: string;
		size?: number;
	};
	const message = validateTemplateInput(input);
	if (message) return json({ message }, { status: 400 });

	const contentType = input.contentType!;
	const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
	const assetId = crypto.randomUUID();
	const objectKey = `users/${locals.user.id}/scene-templates/${assetId}.${extension}`;
	const title = input.title!.trim();

	const row = await db.transaction(async (tx) => {
		const [asset] = await tx
			.insert(assets)
			.values({
				id: assetId,
				userId: locals.user!.id,
				kind: 'template',
				objectKey,
				fileName: input.fileName!.slice(0, 180),
				mimeType: contentType,
				sizeBytes: input.size!
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

	return json(
		{
			template: await serializeTemplate(row),
			upload: {
				method: 'PUT',
				url: await storageProvider.presignUpload({ objectKey, contentType }),
				headers: { 'content-type': contentType },
				expiresIn: 900
			}
		},
		{ status: 201 }
	);
};
