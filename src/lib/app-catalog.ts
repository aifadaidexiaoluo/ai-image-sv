import {
	BadgePercent,
	BriefcaseBusiness,
	Coffee,
	Droplets,
	Home,
	Image,
	Leaf,
	Palette,
	Armchair,
	Sparkles,
	Sun,
	Utensils,
	WandSparkles
} from '@lucide/svelte';

export const productStyles = [
	{
		id: 'commerce-white',
		name: '电商白底',
		description: '干净棚拍质感',
		image: '/images/app/create-product/commerce-white.png'
	},
	{
		id: 'lifestyle',
		name: '场景生活',
		description: '自然生活场景',
		image: '/images/app/create-product/lifestyle.png'
	},
	{
		id: 'minimal-color',
		name: '极简纯色',
		description: '留白与品牌色',
		image: '/images/app/create-product/minimal-color.png'
	},
	{
		id: 'premium',
		name: '高级质感',
		description: '柔光与细节',
		image: '/images/app/create-product/premium.png'
	},
	{
		id: 'render-3d',
		name: '3D 渲染',
		description: '科技产品表达',
		image: '/images/app/create-product/render-3d.png'
	},
	{
		id: 'illustration',
		name: '手绘插画',
		description: '轻盈装饰感',
		image: '/images/app/create-product/illustration.png'
	}
] as const;

export const promptSuggestions = [
	'护肤品精华瓶',
	'简约白色耳机',
	'北欧风沙发',
	'INS 风咖啡杯',
	'磨砂口红'
];

export const sceneCategories = [
	{ id: 'all', name: '全部场景' },
	{ id: 'home', name: '家居生活' },
	{ id: 'beauty', name: '美妆个护' },
	{ id: 'digital', name: '数码科技' },
	{ id: 'food', name: '食品饮料' },
	{ id: 'fashion', name: '服饰箱包' },
	{ id: 'outdoor', name: '户外活动' },
	{ id: 'festival', name: '节日氛围' }
] as const;

export const sceneTemplates = [
	{
		id: 'living-room',
		category: 'home',
		name: '简约客厅',
		icon: Armchair,
		image: '/images/app/create-scene/living-room.png',
		tone: 'from-amber-50 to-white'
	},
	{
		id: 'bathroom-counter',
		category: 'beauty',
		name: '浴室台面',
		icon: Droplets,
		image: '/images/app/create-scene/bathroom-counter.png',
		tone: 'from-sky-50 to-white'
	},
	{
		id: 'kitchen-counter',
		category: 'food',
		name: '厨房台面',
		icon: Utensils,
		image: '/images/app/create-scene/kitchen-counter.png',
		tone: 'from-orange-50 to-white'
	},
	{
		id: 'bedside',
		category: 'home',
		name: '卧室床头柜',
		icon: Home,
		image: '/images/app/create-scene/bedside.png',
		tone: 'from-stone-100 to-white'
	},
	{
		id: 'vanity',
		category: 'beauty',
		name: '化妆台',
		icon: Sparkles,
		image: '/images/app/create-scene/vanity.png',
		tone: 'from-pink-50 to-white'
	},
	{
		id: 'desk',
		category: 'digital',
		name: '书桌办公',
		icon: BriefcaseBusiness,
		image: '/images/app/create-scene/desk.png',
		tone: 'from-blue-50 to-white'
	},
	{
		id: 'picnic',
		category: 'outdoor',
		name: '户外野餐',
		icon: Sun,
		image: '/images/app/create-scene/picnic.png',
		tone: 'from-lime-50 to-white'
	},
	{
		id: 'cafe',
		category: 'food',
		name: '咖啡馆',
		icon: Coffee,
		image: '/images/app/create-scene/cafe.png',
		tone: 'from-yellow-50 to-white'
	},
	{
		id: 'gift',
		category: 'festival',
		name: '节日礼盒',
		icon: BadgePercent,
		image: '/images/app/create-scene/gift.png',
		tone: 'from-red-50 to-white'
	},
	{
		id: 'natural-light',
		category: 'home',
		name: '自然光影',
		icon: Leaf,
		image: '/images/app/create-scene/natural-light.png',
		tone: 'from-emerald-50 to-white'
	},
	{
		id: 'minimal',
		category: 'fashion',
		name: '极简背景',
		icon: Palette,
		image: '/images/app/create-scene/minimal.png',
		tone: 'from-slate-50 to-white'
	}
] as const;

export const inspirationTemplates = [
	{
		name: '夏日美妆',
		description: '清新护肤系列',
		image: '/images/app/dashboard/template-beauty.png'
	},
	{
		name: '家居生活',
		description: '舒适简约空间',
		image: '/images/app/dashboard/template-home.png'
	},
	{
		name: '3C 数码',
		description: '科技改变生活',
		image: '/images/app/dashboard/template-digital.png'
	},
	{
		name: '食品饮料',
		description: '美味时刻分享',
		image: '/images/app/dashboard/template-food.png'
	},
	{
		name: '服饰配件',
		description: '时尚潮流穿搭',
		image: '/images/app/dashboard/template-fashion.png'
	}
] as const;

export const dashboardTools = [
	{
		href: '/app/create/product',
		title: 'AI 商品图',
		description: '从描述或参考图生成电商视觉',
		badge: '推荐',
		icon: Sparkles,
		image: '/images/app/dashboard/product-perfume.png',
		tone: 'from-[#fbf8ff] via-[#fbf9ff] to-[#efe6ff]'
	},
	{
		href: '/app/create/scene',
		title: '场景图编辑',
		description: '把商品自然融入营销场景',
		icon: WandSparkles,
		badge: undefined,
		image: '/images/app/dashboard/scene-chair.png',
		tone: 'from-[#f8fbff] via-[#f7fbff] to-[#eaf4ff]'
	},
	{
		href: '/app/create/remove-background',
		title: '智能抠图',
		description: '生成干净透明背景 PNG',
		icon: Image,
		badge: undefined,
		image: '/images/app/dashboard/remove-bg-plant.png',
		tone: 'from-[#f4fff9] via-[#f7fffb] to-[#e9fbf1]'
	}
] as const;

export const dashboardFallbackImages: Record<string, string> = {
	product: '/images/app/dashboard/product-perfume.png',
	scene: '/images/app/dashboard/scene-chair.png',
	'remove-background': '/images/app/dashboard/remove-bg-plant.png'
};

export const assetShowcase = [
	{
		name: '香水_主图',
		kind: 'PNG',
		size: '1024 x 1024',
		image: '/images/app/products/perfume-main.png'
	},
	{
		name: '简约客厅场景',
		kind: 'JPG',
		size: '1920 x 1280',
		image: '/images/app/products/amber-care.png'
	},
	{
		name: '耳机_白色',
		kind: 'PNG',
		size: '1024 x 1024',
		image: '/images/app/products/earbuds-white.png'
	},
	{
		name: '护肤霜_紫色',
		kind: 'PNG',
		size: '1024 x 1024',
		image: '/images/app/products/skincare-cream.png'
	},
	{ name: '促销标签_绿色', kind: 'PNG', size: '512 x 512', image: '/images/home/pink-beauty.png' },
	{
		name: '电商图标_线性',
		kind: 'PNG',
		size: '1024 x 1024',
		image: '/images/app/products/perfume-main.png'
	}
] as const;

export const toolLabels: Record<string, string> = {
	product: '商品图',
	scene: '场景图',
	'remove-background': '智能抠图'
};

export const toolTypeLabels: Record<string, string> = {
	product: '商品图生成',
	scene: '场景图编辑',
	'remove-background': '智能抠图'
};

export const assetTypeLabels: Record<string, string> = {
	all: '全部素材',
	source: '产品素材',
	output: '生成结果',
	thumbnail: '缩略图',
	template: '模板素材'
};

export const colorSwatches = [
	'#ef4444',
	'#f97316',
	'#facc15',
	'#22c55e',
	'#3b82f6',
	'#8b5cf6',
	'#111827',
	'#e5e7eb'
];
