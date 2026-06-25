export type GenerationToolId = 'product' | 'scene' | 'remove-background';

export type GenerationJobStatus =
	| 'queued'
	| 'running'
	| 'succeeded'
	| 'partial'
	| 'failed'
	| 'canceled';

export type GenerationJobStage =
	| 'queued'
	| 'validating'
	| 'preparing'
	| 'submitting'
	| 'generating'
	| 'downloading'
	| 'postprocessing'
	| 'uploading'
	| 'completed';

export type GenerationProviderId = 'auto' | 'openai' | 'tongyi';

export type GenerationOutput = {
	id?: string;
	assetId?: string;
	position: number;
	url: string;
	mimeType?: string;
};

export type GenerationJob = {
	id: string;
	tool: GenerationToolId;
	status: GenerationJobStatus;
	stage: GenerationJobStage;
	progress: number | null;
	completedCount: number;
	totalCount: number;
	prompt?: string | null;
	parameters?: Record<string, unknown>;
	consumedCredits?: number;
	createdAt?: string | Date;
	errorMessage?: string | null;
	outputs?: GenerationOutput[];
};
