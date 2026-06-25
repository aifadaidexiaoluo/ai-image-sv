import type { GenerationTool } from '$lib/server/providers';

const styleLabels: Record<string, string> = {
	'commerce-white': '电商白底棚拍，干净背景，商品主体清晰',
	lifestyle: '自然生活场景，真实光线，适合营销展示',
	'minimal-color': '极简纯色背景，留白充足，品牌感强',
	premium: '高级质感，柔和布光，细节精致',
	'render-3d': '3D 渲染质感，现代科技风',
	illustration: '手绘插画风格，轻盈装饰元素'
};

const sceneLabels: Record<string, string> = {
	'living-room': '简约客厅场景',
	'bathroom-counter': '浴室台面场景',
	'kitchen-counter': '厨房台面场景',
	bedside: '卧室床头柜场景',
	vanity: '化妆台场景',
	desk: '书桌办公场景',
	picnic: '户外野餐场景',
	cafe: '咖啡馆场景',
	gift: '节日礼盒场景',
	'natural-light': '自然光影场景',
	minimal: '极简背景'
};

export function buildGenerationPrompt(input: {
	tool: GenerationTool;
	prompt?: string | null;
	parameters?: Record<string, unknown>;
}) {
	const parameters = input.parameters ?? {};
	const parts = [input.prompt?.trim()].filter(Boolean) as string[];

	if (input.tool === 'product') {
		const styleIds = Array.isArray(parameters.styleIds) ? parameters.styleIds : [];
		const styleText = styleIds
			.map((id) => styleLabels[String(id)])
			.filter(Boolean)
			.join('，');
		if (styleText) parts.push(`视觉风格：${styleText}`);
		if (parameters.generationMode === 'reference') parts.push('参考上传图片的商品主体与材质特征');
	}

	if (input.tool === 'scene') {
		const scene = sceneLabels[String(parameters.sceneId ?? '')];
		if (scene) parts.push(`将商品自然融合到${scene}`);
		if (parameters.productPosition) parts.push(`商品位置：${parameters.productPosition}`);
		if (parameters.productScale) parts.push(`商品相对大小：${parameters.productScale}%`);
		if (parameters.lightingMatch) parts.push('匹配场景光线与商品阴影');
		if (parameters.colorBlend) parts.push('统一色彩氛围');
		if (parameters.detailEnhance) parts.push('增强真实细节与边缘融合');
	}

	if (parameters.size) parts.push(`输出尺寸偏好：${parameters.size}`);
	if (parameters.aspectRatio) parts.push(`画面比例：${parameters.aspectRatio}`);

	const fallback =
		input.tool === 'scene'
			? '高品质电商场景图，商品主体清晰，真实自然光线'
			: '高品质电商商品视觉，专业棚拍光线';
	return parts.length ? parts.join('。') : fallback;
}
