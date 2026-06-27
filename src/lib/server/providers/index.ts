import { env } from '$env/dynamic/private';
import { MockBackgroundRemovalProvider, MockImageProvider } from './mock';
import { OpenAIImageProvider } from './openai';
import { RemoveBgProvider } from './remove-bg';
import { TongyiImageProvider } from './tongyi';
import type { GenerationProviderId, ImageGenerationProvider } from './types';

export * from './types';

const mock = new MockImageProvider();
const openai = new OpenAIImageProvider();
const tongyi = new TongyiImageProvider();

export function getImageProvider(id: GenerationProviderId): ImageGenerationProvider {
	if (env.MOCK_AI === 'true') return mock;
	if (id === 'openai') return openai;
	if (id === 'tongyi') return tongyi;
	if (env.OPENAI_API_KEY) return openai;
	if (env.DASHSCOPE_API_KEY) return tongyi;
	return mock;
}

export const backgroundRemovalProvider =
	env.MOCK_AI === 'true' ? new MockBackgroundRemovalProvider() : new RemoveBgProvider();
