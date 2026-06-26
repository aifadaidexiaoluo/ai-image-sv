export type AssetOption = {
	value: string;
	label: string;
};

export type AssetItem = {
	id: string;
	kind: 'source' | 'output' | 'thumbnail' | 'template';
	fileName: string;
	displayName: string;
	mimeType: string;
	sizeBytes: number;
	width: number | null;
	height: number | null;
	style: string | null;
	color: string | null;
	favorite: boolean;
	createdAt: Date | string;
	url: string;
	tags: string[];
	format: string;
	ratio: string;
};

export type AssetCounts = {
	all: number;
	source: number;
	output: number;
	thumbnail: number;
	template: number;
	favorite: number;
	png: number;
	jpg: number;
	webp: number;
};

export type AssetTagSummary = {
	tag: string;
	total: number;
};

export type MetadataValues = {
	displayName: string;
	style: string;
	color: string;
	tags: string;
};
