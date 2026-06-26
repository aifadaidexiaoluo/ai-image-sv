import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { admin } from 'better-auth/plugins/admin';
import { apiKey } from 'better-auth/plugins';
import { jwt } from 'better-auth/plugins/jwt';
import { organization } from 'better-auth/plugins/organization';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { emailProvider, resetPasswordEmail, verificationEmail } from '$lib/server/email';

const adminEmails = new Set(
	(env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean)
);

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	trustedOrigins: (env.TRUSTED_ORIGINS ?? env.ORIGIN ?? '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 12,
		maxPasswordLength: 256,
		resetPasswordTokenExpiresIn: 60 * 30,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await emailProvider.send(resetPasswordEmail(user.email, url));
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		expiresIn: 60 * 60,
		sendVerificationEmail: async ({ user, url }) => {
			await emailProvider.send(verificationEmail(user.email, url));
		}
	},
	user: {
		deleteUser: { enabled: true },
		additionalFields: {
			role: { type: 'string', required: false, defaultValue: 'user', input: false },
			bio: { type: 'string', required: false, input: false }
		}
	},
	rateLimit: { enabled: true, window: 60, max: 100, storage: 'database' },
	databaseHooks: {
		user: {
			create: {
				before: async (createdUser) => ({
					data: {
						...createdUser,
						role: adminEmails.has(createdUser.email.toLowerCase()) ? 'admin' : 'user'
					}
				})
			}
		}
	},
	advanced: { useSecureCookies: env.NODE_ENV === 'production' },
	plugins: [
		admin({ defaultRole: 'user', adminRoles: ['admin'] }),
		apiKey({
			defaultPrefix: 'dai',
			rateLimit: { enabled: true, timeWindow: 60 * 1000, maxRequests: 120 }
		}),
		organization({
			allowUserToCreateOrganization: true,
			organizationLimit: 5,
			membershipLimit: 50,
			invitationExpiresIn: 60 * 60 * 24 * 7,
			cancelPendingInvitationsOnReInvite: true,
			teams: { enabled: true },
			sendInvitationEmail: async ({ email, organization, inviter, invitation }) => {
				const acceptUrl = `${env.ORIGIN}/app/settings?tab=team&invitationId=${invitation.id}`;
				await emailProvider.send({
					to: email,
					subject: `加入 ${organization.name} - DesignAI`,
					html: `<p>${inviter.user.name} 邀请你加入 ${organization.name}。</p><p><a href="${acceptUrl}">查看邀请</a></p>`,
					text: `${inviter.user.name} 邀请你加入 ${organization.name}。查看邀请：${acceptUrl}`
				});
			}
		}),
		jwt(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
