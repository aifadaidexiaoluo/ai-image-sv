export type SupportedTool = 'product' | 'scene' | 'remove-background';

export function creditsPerOutput(tool: SupportedTool) {
	return tool === 'scene' ? 3 : tool === 'product' ? 2 : 1;
}

export function reservedCredits(tool: SupportedTool, requestedCount: number) {
	const count = tool === 'remove-background' ? 1 : Math.max(1, Math.min(requestedCount, 4));
	return { count, credits: count * creditsPerOutput(tool) };
}

export function isTerminalStatus(status: string) {
	return ['succeeded', 'partial', 'failed', 'canceled'].includes(status);
}
