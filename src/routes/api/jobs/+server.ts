import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createJob, listJobsForUser } from '$lib/server/jobs/service';
import type { GenerationProviderId, GenerationTool } from '$lib/server/providers';

const tools = new Set<GenerationTool>(['product', 'scene', 'remove-background']);
const providers = new Set<GenerationProviderId>(['auto', 'openai', 'tongyi']);

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') ?? 30), 50));
	return json({ jobs: await listJobsForUser(locals.user.id, limit) });
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ message: '请先登录' }, { status: 401 });
	const input = (await request.json()) as {
		tool?: GenerationTool;
		provider?: GenerationProviderId;
		prompt?: string;
		count?: number;
		aspectRatio?: string;
		sourceAssetId?: string;
		templateId?: string;
		parameters?: Record<string, unknown>;
	};
	if (!input.tool || !tools.has(input.tool))
		return json({ message: '无效的处理工具' }, { status: 400 });
	const provider = input.provider && providers.has(input.provider) ? input.provider : 'auto';
	if (input.prompt && input.prompt.length > 2000) {
		return json({ message: '提示词不能超过 2000 个字符' }, { status: 400 });
	}
	try {
		const job = await createJob(locals.user.id, {
			tool: input.tool,
			provider,
			prompt: input.prompt?.trim(),
			count: input.count ?? 1,
			aspectRatio: input.aspectRatio ?? '1:1',
			sourceAssetId: input.sourceAssetId,
			templateId: input.templateId,
			parameters: input.parameters
		});
		return json({ job }, { status: 201 });
	} catch (error) {
		if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
			return json({ message: '积分不足，请先购买积分或升级套餐' }, { status: 402 });
		}
		if (error instanceof Error && error.message === 'SOURCE_ASSET_NOT_FOUND') {
			return json({ message: '上传素材不存在或不属于当前账户' }, { status: 400 });
		}
		console.error('[jobs:create]', error);
		return json({ message: '创建任务失败，请稍后重试' }, { status: 500 });
	}
};
