import { and, asc, count, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { assets, templates } from '$lib/server/db/schema';
import { pagination, writeAuditLog, type AdminListInput } from './audit';

const tools = new Set(['product', 'scene', 'remove-background']);

export async function listAdminTemplates(
	input: AdminListInput & { tool?: string; published?: string }
) {
	const { page, pageSize, offset } = pagination(input);
	const keyword = input.keyword?.trim();
	const filters: (SQL | undefined)[] = [
		input.tool && tools.has(input.tool) ? eq(templates.tool, input.tool as never) : undefined,
		input.published === 'true' ? eq(templates.published, true) : undefined,
		input.published === 'false' ? eq(templates.published, false) : undefined,
		keyword ? ilike(templates.name, `%${keyword}%`) : undefined
	];
	const where = and(...filters.filter((item): item is SQL => Boolean(item)));
	const [{ total }] = await db.select({ total: count() }).from(templates).where(where);
	const rows = await db
		.select({ template: templates, preview: assets })
		.from(templates)
		.leftJoin(assets, eq(templates.previewAssetId, assets.id))
		.where(where)
		.orderBy(asc(templates.sortOrder), desc(templates.createdAt))
		.limit(pageSize)
		.offset(offset);
	return {
		items: rows,
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
		filters: {
			keyword: keyword ?? '',
			tool: input.tool ?? 'all',
			published: input.published ?? 'all'
		}
	};
}

export function parseTemplateParameters(value: FormDataEntryValue | null) {
	const raw = String(value ?? '{}').trim() || '{}';
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
		return parsed as Record<string, unknown>;
	} catch {
		return null;
	}
}

export async function upsertAdminTemplate(actorId: string, form: FormData) {
	const id = String(form.get('id') ?? '').trim();
	const slug = String(form.get('slug') ?? '').trim();
	const name = String(form.get('name') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const tool = String(form.get('tool') ?? '').trim();
	const category = String(form.get('category') ?? '').trim();
	const previewAssetId = String(form.get('previewAssetId') ?? '').trim() || null;
	const promptPreset = String(form.get('promptPreset') ?? '').trim();
	const sortOrder = Number(form.get('sortOrder') ?? 0);
	const published = form.get('published') === 'on';
	const parameters = parseTemplateParameters(form.get('parameters'));

	if (!slug || !name || !description || !tools.has(tool) || !category || !promptPreset) {
		return fail(400, { message: '模板参数不完整' });
	}
	if (!Number.isInteger(sortOrder) || !parameters) {
		return fail(400, { message: '模板排序或 JSON 参数无效' });
	}

	const values = {
		slug,
		name,
		description,
		tool: tool as 'product' | 'scene' | 'remove-background',
		category,
		previewAssetId,
		promptPreset,
		parameters,
		published,
		sortOrder,
		updatedAt: new Date()
	};

	if (id) {
		await db.update(templates).set(values).where(eq(templates.id, id));
		await writeAuditLog(actorId, 'template.update', 'template', id, values);
		return { success: true };
	}
	const [created] = await db.insert(templates).values(values).returning({ id: templates.id });
	await writeAuditLog(actorId, 'template.create', 'template', created.id, values);
	return { success: true };
}

export async function toggleAdminTemplate(actorId: string, id: string, published: boolean) {
	const [updated] = await db
		.update(templates)
		.set({ published, updatedAt: new Date() })
		.where(eq(templates.id, id))
		.returning({ id: templates.id });
	if (!updated) return fail(404, { message: '模板不存在' });
	await writeAuditLog(
		actorId,
		published ? 'template.publish' : 'template.unpublish',
		'template',
		id
	);
	return { success: true };
}

export const adminTemplateTools = ['all', ...tools];
