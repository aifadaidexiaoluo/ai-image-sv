import type {
	BackgroundRemovalProvider,
	GeneratedImage,
	GenerationRequest,
	ImageGenerationProvider
} from './types';

function svgResult(index: number, prompt: string): GeneratedImage {
	const hue = 245 + index * 18;
	const safePrompt = prompt.replace(/[<>&"']/g, '').slice(0, 60);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 86% 64%)"/><stop offset="1" stop-color="hsl(${hue + 55} 78% 42%)"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><circle cx="512" cy="420" r="220" fill="white" fill-opacity=".16"/><text x="512" y="500" text-anchor="middle" fill="white" font-size="56" font-family="sans-serif" font-weight="700">DesignAI</text><text x="512" y="570" text-anchor="middle" fill="white" fill-opacity=".8" font-size="24" font-family="sans-serif">${safePrompt || 'AI 商品视觉'}</text></svg>`;
	return { bytes: new TextEncoder().encode(svg), mimeType: 'image/svg+xml' };
}

export class MockImageProvider implements ImageGenerationProvider {
	id = 'mock' as const;

	async generate(request: GenerationRequest) {
		await new Promise((resolve) => setTimeout(resolve, 600));
		return Array.from({ length: request.count }, (_, index) => svgResult(index, request.prompt));
	}
}

export class MockBackgroundRemovalProvider implements BackgroundRemovalProvider {
	id = 'mock';

	async removeBackground() {
		return svgResult(0, '透明背景商品图');
	}
}
