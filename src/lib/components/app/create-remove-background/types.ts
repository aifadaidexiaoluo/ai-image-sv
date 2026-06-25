export type PreviewBackgroundId = 'transparent' | 'white' | 'light-gray' | 'dark' | 'soft';

export type PreviewBackground = {
	id: PreviewBackgroundId;
	name: string;
	description: string;
	className: string;
	swatchClass: string;
};

export const previewBackgrounds = [
	{
		id: 'transparent',
		name: '透明棋盘',
		description: '检查透明 PNG 边缘',
		className: 'checkerboard-bg',
		swatchClass: 'checkerboard-bg'
	},
	{
		id: 'white',
		name: '白色',
		description: '电商白底预览',
		className: 'bg-white',
		swatchClass: 'bg-white'
	},
	{
		id: 'light-gray',
		name: '浅灰',
		description: '弱化白色主体边缘',
		className: 'bg-[#eef1f7]',
		swatchClass: 'bg-[#eef1f7]'
	},
	{
		id: 'dark',
		name: '深色',
		description: '检查浅色毛边',
		className: 'bg-[#182033]',
		swatchClass: 'bg-[#182033]'
	},
	{
		id: 'soft',
		name: '柔彩',
		description: '营销卡片预览',
		className: 'bg-[linear-gradient(135deg,#f5efff,#e8fff8)]',
		swatchClass: 'bg-[linear-gradient(135deg,#f5efff,#e8fff8)]'
	}
] satisfies PreviewBackground[];
