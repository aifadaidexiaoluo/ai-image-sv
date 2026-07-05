export type GenerationTool = 'product' | 'scene' | 'remove-background';
export type GenerationProviderId = 'auto' | 'openai' | 'tongyi';

export interface GenerationRequest {
	tool: Exclude<GenerationTool, 'remove-background'>;
	prompt: string;
	count: number;
	aspectRatio: string;
	source?: { bytes: Uint8Array; mimeType: string; url?: string };
	sources?: Array<{ bytes: Uint8Array; mimeType: string; url?: string }>;
}

export interface GeneratedImage {
	bytes: Uint8Array;
	mimeType: string;
}

export interface ImageGenerationProvider {
	id: Exclude<GenerationProviderId, 'auto'> | 'mock';
	generate(request: GenerationRequest): Promise<GeneratedImage[]>;
}

export interface BackgroundRemovalProvider {
	id: string;
	removeBackground(source: { bytes: Uint8Array; mimeType: string }): Promise<GeneratedImage>;
}
