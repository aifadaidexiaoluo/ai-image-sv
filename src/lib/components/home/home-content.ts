import * as m from '$lib/paraglide/messages';

export type TemplateCategory =
	| 'all'
	| 'product'
	| 'scene'
	| 'poster'
	| 'detail'
	| 'holiday'
	| 'render';

export interface NavItem {
	label: string;
	href: string;
	children?: { label: string; href: string }[];
}

export interface TemplateItem {
	id: string;
	title: string;
	description: string;
	image: string;
	category: Exclude<TemplateCategory, 'all'>;
}

export interface CaseStudy {
	id: string;
	title: string;
	scene: string;
	image: string;
	lift: number;
}

export interface MetricItem {
	value: string;
	label: string;
}

export const productImages = [
	'/images/home/earbuds.png',
	'/images/home/skincare.png',
	'/images/home/perfume.png',
	'/images/home/amber-care.png',
	'/images/home/pink-beauty.png',
	'/images/home/smartwatch.png'
];

export const navItems: NavItem[] = [
	{ label: m.home_nav_home(), href: '/' },
	{
		label: m.home_nav_ai(),
		href: '/ai-design',
		children: [
			{ label: m.home_dropdown_product(), href: '/ai-design' },
			{ label: m.home_dropdown_scene(), href: '/ai-design/scene' },
			{ label: m.home_dropdown_remove(), href: '/ai-design/remove-background' }
		]
	},
	{ label: m.home_nav_templates(), href: '#templates' },
	{
		label: m.home_nav_solutions(),
		href: '#capabilities',
		children: [
			{ label: m.home_dropdown_ecommerce(), href: '#capabilities' },
			{ label: m.home_dropdown_brand(), href: '#cases' }
		]
	},
	{ label: m.home_nav_pricing(), href: '/pricing' },
	{
		label: m.home_nav_resources(),
		href: '#cases',
		children: [
			{ label: m.home_dropdown_guide(), href: '#workflow' },
			{ label: m.home_dropdown_cases(), href: '#cases' }
		]
	}
];

export const categories: { id: TemplateCategory; label: string }[] = [
	{ id: 'all', label: m.home_category_all() },
	{ id: 'product', label: m.home_category_product() },
	{ id: 'scene', label: m.home_category_scene() },
	{ id: 'poster', label: m.home_category_poster() },
	{ id: 'detail', label: m.home_category_detail() },
	{ id: 'holiday', label: m.home_category_holiday() },
	{ id: 'render', label: m.home_category_render() }
];

export const templates: TemplateItem[] = [
	{
		id: 'earbuds',
		title: m.home_template_earbuds(),
		description: m.home_template_earbuds_desc(),
		image: productImages[0],
		category: 'product'
	},
	{
		id: 'skincare',
		title: m.home_template_skincare(),
		description: m.home_template_skincare_desc(),
		image: productImages[1],
		category: 'scene'
	},
	{
		id: 'perfume',
		title: m.home_template_perfume(),
		description: m.home_template_perfume_desc(),
		image: productImages[2],
		category: 'render'
	},
	{
		id: 'amber',
		title: m.home_template_amber(),
		description: m.home_template_amber_desc(),
		image: productImages[3],
		category: 'scene'
	},
	{
		id: 'pink',
		title: m.home_template_pink(),
		description: m.home_template_pink_desc(),
		image: productImages[4],
		category: 'poster'
	},
	{
		id: 'watch',
		title: m.home_template_watch(),
		description: m.home_template_watch_desc(),
		image: productImages[5],
		category: 'detail'
	}
];

export const caseStudies: CaseStudy[] = [
	{
		id: 'case-earbuds',
		title: m.home_case_earbuds(),
		scene: m.home_case_scene_3d(),
		image: productImages[0],
		lift: 38
	},
	{
		id: 'case-skincare',
		title: m.home_case_skincare(),
		scene: m.home_case_scene_beauty(),
		image: productImages[1],
		lift: 52
	},
	{
		id: 'case-perfume',
		title: m.home_case_perfume(),
		scene: m.home_case_scene_fragrance(),
		image: productImages[2],
		lift: 27
	},
	{
		id: 'case-watch',
		title: m.home_case_watch(),
		scene: m.home_case_scene_tech(),
		image: productImages[5],
		lift: 45
	}
];

export const metrics: MetricItem[] = [
	{ value: '100,000+', label: m.home_metric_templates() },
	{ value: '5,000,000+', label: m.home_metric_images() },
	{ value: '98.6%', label: m.home_metric_satisfaction() },
	{ value: '24/7', label: m.home_metric_support() }
];

export const footerGroups = [
	{
		title: m.home_footer_product(),
		links: [m.home_nav_ai(), m.home_nav_templates(), m.home_nav_pricing()]
	},
	{
		title: m.home_footer_help(),
		links: [m.home_dropdown_guide(), '设计教程', '常见问题', '联系客服']
	},
	{ title: m.home_footer_about(), links: ['公司介绍', '加入我们', '媒体报道', '合作伙伴'] },
	{ title: m.home_footer_terms(), links: ['用户协议', '隐私政策', '版权声明', '商用授权'] }
];
