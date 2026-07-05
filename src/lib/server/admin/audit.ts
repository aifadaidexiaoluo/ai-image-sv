import { and, count, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { auditLogs, user } from '$lib/server/db/schema';

export interface AdminListInput {
	page?: number;
	pageSize?: number;
	keyword?: string;
}

export function positiveInteger(value: unknown, fallback: number) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

export function pagination(input: AdminListInput, maxPageSize = 100) {
	const page = positiveInteger(input.page, 1);
	const pageSize = Math.min(positiveInteger(input.pageSize, 20), maxPageSize);
	return { page, pageSize, offset: (page - 1) * pageSize };
}

export async function writeAuditLog(
	actorId: string | null,
	action: string,
	targetType: string,
	targetId: string,
	metadata: Record<string, unknown> = {}
) {
	await db.insert(auditLogs).values({
		actorId,
		action,
		targetType,
		targetId,
		metadata
	});
}

export async function listAuditLogs(
	input: AdminListInput & { action?: string; targetType?: string }
) {
	const { page, pageSize, offset } = pagination(input);
	const filters: (SQL | undefined)[] = [
		input.action ? ilike(auditLogs.action, `%${input.action}%`) : undefined,
		input.targetType ? eq(auditLogs.targetType, input.targetType) : undefined,
		input.keyword ? ilike(auditLogs.targetId, `%${input.keyword.trim()}%`) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(auditLogs).where(where);
	const rows = await db
		.select({ log: auditLogs, actor: user })
		.from(auditLogs)
		.leftJoin(user, eq(auditLogs.actorId, user.id))
		.where(where)
		.orderBy(desc(auditLogs.createdAt))
		.limit(pageSize)
		.offset(offset);

	return {
		items: rows,
		total: Number(total ?? 0),
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(Number(total ?? 0) / pageSize))
	};
}
