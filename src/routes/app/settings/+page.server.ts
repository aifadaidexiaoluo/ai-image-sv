import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	assets,
	auditLogs,
	creditTransactions,
	creditWallets,
	generationJobs,
	orders,
	products,
	subscriptions,
	user,
	userSettings
} from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { MAX_AVATAR_BYTES, validateAvatar } from '$lib/server/avatar';
import { storageProvider } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

const timezones = new Set(['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'UTC']);
const languages = new Set(['zh-CN', 'en-US']);
const tools = new Set(['product', 'scene', 'remove-background']);
const formats = new Set(['png', 'jpg', 'webp']);
const roles = new Set(['admin', 'member']);

const defaultSettings = {
	language: 'zh-CN',
	timezone: 'Asia/Shanghai',
	defaultTool: 'product',
	defaultImageCount: 4,
	defaultOutputFormat: 'png',
	emailProductUpdates: true,
	emailBillingReminders: true,
	emailMarketing: false,
	inAppJobUpdates: true,
	inAppCreditAlerts: true
};

function bool(form: FormData, key: string) {
	return form.get(key) === 'on' || form.get(key) === 'true';
}

function intInRange(value: FormDataEntryValue | null, fallback: number, min: number, max: number) {
	const number = Number(value);
	return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
}

function slugify(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
}

function actionError(error: unknown, fallback: string, status = 400) {
	if (error instanceof APIError) return fail(status, { message: error.message });
	if (error instanceof Error) return fail(status, { message: error.message || fallback });
	return fail(status, { message: fallback });
}

async function getSettings(userId: string) {
	const existing = await db.query.userSettings.findFirst({
		where: eq(userSettings.userId, userId)
	});
	if (existing) return existing;
	const [created] = await db
		.insert(userSettings)
		.values({ userId })
		.onConflictDoNothing()
		.returning();
	return (
		created ?? (await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) }))
	);
}

export const load: PageServerLoad = async ({ locals, request }) => {
	const userId = locals.user!.id;
	const headers = request.headers;
	const settings = await getSettings(userId);

	const [sessions, apiKeys, organizations, wallet, transactions, recentOrders, subscriptionRows] =
		await Promise.all([
			auth.api.listSessions({ headers }).catch(() => []),
			auth.api.listApiKeys({ headers }).catch(() => []),
			auth.api.listOrganizations({ headers }).catch(() => []),
			db.query.creditWallets.findFirst({ where: eq(creditWallets.userId, userId) }),
			db
				.select()
				.from(creditTransactions)
				.where(eq(creditTransactions.userId, userId))
				.orderBy(desc(creditTransactions.createdAt))
				.limit(8),
			db
				.select()
				.from(orders)
				.where(eq(orders.userId, userId))
				.orderBy(desc(orders.createdAt))
				.limit(5),
			db
				.select({
					id: subscriptions.id,
					status: subscriptions.status,
					cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
					currentPeriodEnd: subscriptions.currentPeriodEnd,
					productName: products.name
				})
				.from(subscriptions)
				.innerJoin(products, eq(subscriptions.productId, products.id))
				.where(eq(subscriptions.userId, userId))
				.orderBy(desc(subscriptions.createdAt))
				.limit(5)
		]);

	const activeOrganizationId =
		(locals.session as { activeOrganizationId?: string } | undefined)?.activeOrganizationId ??
		organizations[0]?.id;
	const activeOrganization = activeOrganizationId
		? await auth.api
				.getFullOrganization({ headers, query: { organizationId: activeOrganizationId } })
				.catch(() => null)
		: null;

	const [[assetCount], [jobCount], [transactionCount], [orderCount]] = await Promise.all([
		db
			.select({ value: count() })
			.from(assets)
			.where(and(eq(assets.userId, userId), isNull(assets.deletedAt))),
		db.select({ value: count() }).from(generationJobs).where(eq(generationJobs.userId, userId)),
		db
			.select({ value: count() })
			.from(creditTransactions)
			.where(eq(creditTransactions.userId, userId)),
		db.select({ value: count() }).from(orders).where(eq(orders.userId, userId))
	]);

	return {
		settings: settings ?? { userId, ...defaultSettings, updatedAt: new Date() },
		sessions,
		apiKeys,
		organizations,
		activeOrganization,
		billingSummary: {
			wallet: wallet ?? { userId, balance: 0, reserved: 0, updatedAt: new Date() },
			transactions,
			orders: recentOrders,
			subscriptions: subscriptionRows
		},
		exportPreview: {
			assets: assetCount.value,
			jobs: jobCount.value,
			transactions: transactionCount.value,
			orders: orderCount.value
		}
	};
};

export const actions: Actions = {
	profile: async ({ locals, request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const bio = String(form.get('bio') ?? '').trim();
		const timezone = String(form.get('timezone') ?? defaultSettings.timezone);
		const avatar = form.get('avatar');

		if (name.length < 2 || name.length > 60) {
			return fail(400, { kind: 'profile', message: '名称需要 2-60 个字符', name, bio });
		}
		if (bio.length > 200) {
			return fail(400, { kind: 'profile', message: '个人简介不能超过 200 个字符', name, bio });
		}
		if (!timezones.has(timezone)) {
			return fail(400, { kind: 'profile', message: '请选择有效时区', name, bio });
		}
		if (avatar instanceof File && avatar.size > MAX_AVATAR_BYTES) {
			return fail(400, { kind: 'profile', message: '头像大小不能超过 2 MB', name, bio });
		}

		const currentUser = await db.query.user.findFirst({
			where: eq(user.id, locals.user!.id),
			columns: { avatarObjectKey: true }
		});
		let newObjectKey: string | null = null;
		let newImage: string | undefined;

		try {
			if (avatar instanceof File && avatar.size > 0) {
				const bytes = new Uint8Array(await avatar.arrayBuffer());
				const detected = validateAvatar({
					declaredType: avatar.type,
					size: avatar.size,
					bytes
				});
				if (!detected) {
					return fail(400, {
						kind: 'profile',
						message: '头像仅支持 JPG、PNG 和 WebP 图片',
						name,
						bio
					});
				}
				const version = crypto.randomUUID();
				newObjectKey = `users/${locals.user!.id}/avatars/${version}.${detected.extension}`;
				newImage = `/api/account/avatar?v=${version}`;
				await storageProvider.putObject(newObjectKey, bytes, detected.contentType);
			}

			await Promise.all([
				db
					.update(user)
					.set({
						name,
						bio: bio || null,
						...(newObjectKey ? { avatarObjectKey: newObjectKey, image: newImage } : {}),
						updatedAt: new Date()
					})
					.where(eq(user.id, locals.user!.id)),
				db
					.insert(userSettings)
					.values({ userId: locals.user!.id, timezone, updatedAt: new Date() })
					.onConflictDoUpdate({
						target: userSettings.userId,
						set: { timezone, updatedAt: new Date() }
					})
			]);
		} catch (error) {
			if (newObjectKey) await storageProvider.deleteObject(newObjectKey).catch(() => undefined);
			console.error('PROFILE_UPDATE_FAILED', error);
			return fail(500, { kind: 'profile', message: '资料更新失败，请稍后重试', name, bio });
		}

		if (newObjectKey && currentUser?.avatarObjectKey) {
			await storageProvider.deleteObject(currentUser.avatarObjectKey).catch((error) => {
				console.error('OLD_AVATAR_DELETE_FAILED', error);
			});
		}
		return { kind: 'profile', success: true, message: '资料已更新' };
	},
	removeAvatar: async ({ locals }) => {
		const currentUser = await db.query.user.findFirst({
			where: eq(user.id, locals.user!.id),
			columns: { avatarObjectKey: true }
		});
		await db
			.update(user)
			.set({ avatarObjectKey: null, image: null, updatedAt: new Date() })
			.where(eq(user.id, locals.user!.id));
		if (currentUser?.avatarObjectKey) {
			await storageProvider.deleteObject(currentUser.avatarObjectKey).catch((error) => {
				console.error('AVATAR_DELETE_FAILED', error);
			});
		}
		return { kind: 'profile', success: true, message: '头像已删除' };
	},
	changePassword: async ({ request }) => {
		const form = await request.formData();
		const currentPassword = String(form.get('currentPassword') ?? '');
		const newPassword = String(form.get('newPassword') ?? '');
		if (newPassword.length < 12) {
			return fail(400, { kind: 'security', message: '新密码至少需要 12 个字符' });
		}
		try {
			await auth.api.changePassword({
				headers: request.headers,
				body: { currentPassword, newPassword, revokeOtherSessions: true }
			});
			return { kind: 'security', success: true, message: '密码已更新，其他设备会话已撤销' };
		} catch (error) {
			return actionError(error, '密码更新失败');
		}
	},
	sendPasswordReset: async ({ locals, url }) => {
		await auth.api.requestPasswordReset({
			body: { email: locals.user!.email, redirectTo: `${url.origin}/reset-password` }
		});
		return { kind: 'security', success: true, message: '重置邮件已发送' };
	},
	revokeSession: async ({ request }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? '');
		if (!token) return fail(400, { kind: 'security', message: '缺少会话标识' });
		try {
			await auth.api.revokeSession({ headers: request.headers, body: { token } });
			return { kind: 'security', success: true, message: '设备会话已撤销' };
		} catch (error) {
			return actionError(error, '撤销设备失败');
		}
	},
	revokeOtherSessions: async ({ request }) => {
		try {
			await auth.api.revokeOtherSessions({ headers: request.headers });
			return { kind: 'security', success: true, message: '其他设备已退出登录' };
		} catch (error) {
			return actionError(error, '撤销其他设备失败');
		}
	},
	preferences: async ({ locals, request }) => {
		const form = await request.formData();
		const language = String(form.get('language') ?? defaultSettings.language);
		const defaultTool = String(form.get('defaultTool') ?? defaultSettings.defaultTool);
		const defaultOutputFormat = String(
			form.get('defaultOutputFormat') ?? defaultSettings.defaultOutputFormat
		);
		const defaultImageCount = intInRange(form.get('defaultImageCount'), 4, 1, 8);
		if (!languages.has(language) || !tools.has(defaultTool) || !formats.has(defaultOutputFormat)) {
			return fail(400, { kind: 'preference', message: '偏好参数无效' });
		}
		await db
			.insert(userSettings)
			.values({
				userId: locals.user!.id,
				language,
				defaultTool,
				defaultOutputFormat,
				defaultImageCount,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: userSettings.userId,
				set: {
					language,
					defaultTool,
					defaultOutputFormat,
					defaultImageCount,
					updatedAt: new Date()
				}
			});
		return { kind: 'preference', success: true, message: '偏好设置已保存' };
	},
	notifications: async ({ locals, request }) => {
		const form = await request.formData();
		const values = {
			emailProductUpdates: bool(form, 'emailProductUpdates'),
			emailBillingReminders: bool(form, 'emailBillingReminders'),
			emailMarketing: bool(form, 'emailMarketing'),
			inAppJobUpdates: bool(form, 'inAppJobUpdates'),
			inAppCreditAlerts: bool(form, 'inAppCreditAlerts'),
			updatedAt: new Date()
		};
		await db
			.insert(userSettings)
			.values({ userId: locals.user!.id, ...values })
			.onConflictDoUpdate({ target: userSettings.userId, set: values });
		return { kind: 'notice', success: true, message: '通知设置已保存' };
	},
	createApiKey: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (name.length < 2 || name.length > 60) {
			return fail(400, { kind: 'api', message: '密钥名称需要 2-60 个字符' });
		}
		try {
			const key = await auth.api.createApiKey({
				headers: request.headers,
				body: {
					name,
					rateLimitEnabled: true,
					rateLimitTimeWindow: 60 * 1000,
					rateLimitMax: intInRange(form.get('rateLimitMax'), 120, 1, 10000),
					expiresIn: null,
					remaining: null
				}
			});
			return { kind: 'api', success: true, message: 'API Key 已创建', createdApiKey: key };
		} catch (error) {
			return actionError(error, '创建 API Key 失败');
		}
	},
	deleteApiKey: async ({ request }) => {
		const form = await request.formData();
		const keyId = String(form.get('keyId') ?? '');
		if (!keyId) return fail(400, { kind: 'api', message: '缺少 API Key 标识' });
		try {
			await auth.api.deleteApiKey({ headers: request.headers, body: { keyId } });
			return { kind: 'api', success: true, message: 'API Key 已删除' };
		} catch (error) {
			return actionError(error, '删除 API Key 失败');
		}
	},
	toggleApiKey: async ({ request }) => {
		const form = await request.formData();
		const keyId = String(form.get('keyId') ?? '');
		const enabled = String(form.get('enabled') ?? '') === 'true';
		if (!keyId) return fail(400, { kind: 'api', message: '缺少 API Key 标识' });
		try {
			await auth.api.updateApiKey({
				headers: request.headers,
				body: { keyId, enabled, expiresIn: null, permissions: null }
			});
			return { kind: 'api', success: true, message: enabled ? 'API Key 已启用' : 'API Key 已停用' };
		} catch (error) {
			return actionError(error, '更新 API Key 失败');
		}
	},
	createOrganization: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const slug = slugify(String(form.get('slug') ?? name));
		if (name.length < 2 || name.length > 80 || slug.length < 2) {
			return fail(400, { kind: 'team', message: '团队名称或标识无效' });
		}
		try {
			await auth.api.createOrganization({ headers: request.headers, body: { name, slug } });
			return { kind: 'team', success: true, message: '团队已创建' };
		} catch (error) {
			return actionError(error, '创建团队失败');
		}
	},
	setActiveOrganization: async ({ request }) => {
		const form = await request.formData();
		const organizationId = String(form.get('organizationId') ?? '');
		try {
			await auth.api.setActiveOrganization({
				headers: request.headers,
				body: { organizationId: organizationId || null }
			});
			return { kind: 'team', success: true, message: '当前团队已切换' };
		} catch (error) {
			return actionError(error, '切换团队失败');
		}
	},
	inviteMember: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const role = String(form.get('role') ?? 'member') as 'admin' | 'member';
		const organizationId = String(form.get('organizationId') ?? '');
		if (!email || !roles.has(role) || !organizationId) {
			return fail(400, { kind: 'team', message: '邀请参数无效' });
		}
		try {
			await auth.api.createInvitation({
				headers: request.headers,
				body: { email, role, organizationId, resend: true, teamId: undefined }
			});
			return { kind: 'team', success: true, message: '邀请已发送' };
		} catch (error) {
			return actionError(error, '发送邀请失败');
		}
	},
	updateMemberRole: async ({ request }) => {
		const form = await request.formData();
		const memberId = String(form.get('memberId') ?? '');
		const role = String(form.get('role') ?? 'member');
		const organizationId = String(form.get('organizationId') ?? '');
		if (!memberId || !roles.has(role) || !organizationId) {
			return fail(400, { kind: 'team', message: '成员参数无效' });
		}
		try {
			await auth.api.updateMemberRole({
				headers: request.headers,
				body: { memberId, role, organizationId }
			});
			return { kind: 'team', success: true, message: '成员角色已更新' };
		} catch (error) {
			return actionError(error, '更新成员角色失败');
		}
	},
	removeMember: async ({ request }) => {
		const form = await request.formData();
		const memberIdOrEmail = String(form.get('memberIdOrEmail') ?? '');
		const organizationId = String(form.get('organizationId') ?? '');
		if (!memberIdOrEmail || !organizationId) {
			return fail(400, { kind: 'team', message: '成员参数无效' });
		}
		try {
			await auth.api.removeMember({
				headers: request.headers,
				body: { memberIdOrEmail, organizationId }
			});
			return { kind: 'team', success: true, message: '成员已移除' };
		} catch (error) {
			return actionError(error, '移除成员失败');
		}
	},
	createTeam: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const organizationId = String(form.get('organizationId') ?? '');
		if (name.length < 2 || !organizationId)
			return fail(400, { kind: 'team', message: '小组名称无效' });
		try {
			await auth.api.createTeam({ headers: request.headers, body: { name, organizationId } });
			return { kind: 'team', success: true, message: '小组已创建' };
		} catch (error) {
			return actionError(error, '创建小组失败');
		}
	},
	deleteAccount: async ({ locals, request }) => {
		const form = await request.formData();
		const confirmation = String(form.get('confirmation') ?? '').trim();
		const password = String(form.get('password') ?? '');
		if (confirmation !== locals.user!.email) {
			return fail(400, { kind: 'danger', message: '请输入当前账户邮箱确认注销' });
		}
		try {
			await db.insert(auditLogs).values({
				actorId: locals.user!.id,
				action: 'account.delete.requested',
				targetType: 'user',
				targetId: locals.user!.id
			});
			await auth.api.deleteUser({ headers: request.headers, body: { password } });
		} catch (error) {
			return actionError(error, '注销账户失败');
		}
		redirect(303, '/login');
	},
	exportData: async () => {
		return { kind: 'danger', success: true, message: '请使用下载按钮导出账户数据' };
	}
};
