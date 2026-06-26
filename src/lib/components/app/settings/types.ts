export type SettingsPageData = {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		bio?: string | null;
		role?: string | null;
		createdAt?: string | Date;
	};
	account: {
		planName: string;
		balance: number;
	};
	settings: UserSettings;
	sessions: UserSession[];
	apiKeys: ApiKeySummary[];
	organizations: OrganizationSummary[];
	activeOrganization: FullOrganization | null;
	billingSummary: BillingSummary;
	exportPreview: Record<string, number>;
};

export type SettingsActionData =
	| {
			message?: string;
			name?: string;
			bio?: string;
			createdApiKey?: { key: string };
	  }
	| null
	| undefined;

export type UserSettings = {
	language: string;
	timezone: string;
	defaultTool: string;
	defaultImageCount: number;
	defaultOutputFormat: string;
	emailProductUpdates: boolean;
	emailBillingReminders: boolean;
	emailMarketing: boolean;
	inAppJobUpdates: boolean;
	inAppCreditAlerts: boolean;
};

export type UserSession = {
	id: string;
	token: string;
	userAgent?: string | null;
	ipAddress?: string | null;
	expiresAt?: string | Date | null;
};

export type ApiKeySummary = {
	id: string;
	name?: string | null;
	prefix?: string | null;
	start?: string | null;
	enabled: boolean;
	requestCount: number;
	createdAt?: string | Date | null;
};

export type OrganizationSummary = {
	id: string;
	name: string;
	slug: string;
};

export type OrganizationMember = {
	id: string;
	userId: string;
	role: string;
	createdAt?: string | Date | null;
	user?: {
		name?: string | null;
		email?: string | null;
	};
};

export type FullOrganization = OrganizationSummary & {
	members: OrganizationMember[];
	teams?: Array<{ id: string; name: string }>;
};

export type BillingSummary = {
	wallet: {
		balance: number;
		reserved: number;
	};
	transactions: unknown[];
	orders: unknown[];
	subscriptions: unknown[];
};

export function formatDate(value: string | Date | null | undefined) {
	return value ? new Date(value).toLocaleString('zh-CN') : '暂无';
}

export function deviceName(userAgent: string | null | undefined) {
	if (!userAgent) return '未知设备';
	if (userAgent.includes('Chrome')) return 'Chrome 浏览器';
	if (userAgent.includes('Safari')) return 'Safari 浏览器';
	if (userAgent.includes('Firefox')) return 'Firefox 浏览器';
	return userAgent.slice(0, 48);
}
