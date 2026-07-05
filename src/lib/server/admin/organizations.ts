import { and, count, desc, eq, ilike, inArray, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { invitation, member, organization, team, teamMember, user } from '$lib/server/db/schema';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

export async function listAdminOrganizations(input: AdminListInput) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		keyword ? ilike(organization.name, `%${keyword}%`) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(organization).where(where);
	const rows = await db
		.select()
		.from(organization)
		.where(where)
		.orderBy(desc(organization.createdAt))
		.limit(pageSize)
		.offset(offset);
	const ids = rows.map((item) => item.id);
	const [memberRows, teamRows, invitationRows] = await Promise.all([
		ids.length
			? db
					.select({ organizationId: member.organizationId, total: count() })
					.from(member)
					.where(inArray(member.organizationId, ids))
					.groupBy(member.organizationId)
			: [],
		ids.length
			? db
					.select({ organizationId: team.organizationId, total: count() })
					.from(team)
					.where(inArray(team.organizationId, ids))
					.groupBy(team.organizationId)
			: [],
		ids.length
			? db
					.select({ organizationId: invitation.organizationId, total: count() })
					.from(invitation)
					.where(inArray(invitation.organizationId, ids))
					.groupBy(invitation.organizationId)
			: []
	]);
	return {
		items: rows.map((item) => ({
			organization: item,
			members: Number(memberRows.find((row) => row.organizationId === item.id)?.total ?? 0),
			teams: Number(teamRows.find((row) => row.organizationId === item.id)?.total ?? 0),
			invitations: Number(invitationRows.find((row) => row.organizationId === item.id)?.total ?? 0)
		})),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
		filters: { keyword: keyword ?? '' }
	};
}

export async function getAdminOrganizationDetail(id: string) {
	const item = await db.query.organization.findFirst({ where: eq(organization.id, id) });
	if (!item) return null;
	const [members, teams, invitations] = await Promise.all([
		db
			.select({ member, user })
			.from(member)
			.innerJoin(user, eq(member.userId, user.id))
			.where(eq(member.organizationId, id))
			.orderBy(desc(member.createdAt)),
		db.select().from(team).where(eq(team.organizationId, id)).orderBy(desc(team.createdAt)),
		db
			.select({ invitation, inviter: user })
			.from(invitation)
			.innerJoin(user, eq(invitation.inviterId, user.id))
			.where(eq(invitation.organizationId, id))
			.orderBy(desc(invitation.createdAt))
	]);
	const teamIds = teams.map((item) => item.id);
	const teamMembers = teamIds.length
		? await db
				.select({ teamMember, user })
				.from(teamMember)
				.innerJoin(user, eq(teamMember.userId, user.id))
				.where(inArray(teamMember.teamId, teamIds))
		: [];
	return { organization: item, members, teams, invitations, teamMembers };
}

export async function cancelAdminInvitation(actorId: string, id: string) {
	const [updated] = await db
		.update(invitation)
		.set({ status: 'canceled' })
		.where(eq(invitation.id, id))
		.returning({ id: invitation.id, organizationId: invitation.organizationId });
	if (!updated) return fail(404, { message: '邀请不存在' });
	await writeAuditLog(actorId, 'invitation.cancel', 'invitation', id, {
		organizationId: updated.organizationId
	});
	return { success: true };
}
