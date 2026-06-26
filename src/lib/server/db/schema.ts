import {
	bigserial,
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

export const jobStatus = pgEnum('job_status', [
	'queued',
	'running',
	'succeeded',
	'partial',
	'failed',
	'canceled'
]);
export const jobStage = pgEnum('job_stage', [
	'queued',
	'validating',
	'preparing',
	'submitting',
	'generating',
	'downloading',
	'postprocessing',
	'uploading',
	'completed'
]);
export const jobTool = pgEnum('job_tool', ['product', 'scene', 'remove-background']);
export const assetKind = pgEnum('asset_kind', ['source', 'output', 'thumbnail', 'template']);
export const transactionType = pgEnum('credit_transaction_type', [
	'grant',
	'purchase',
	'subscription',
	'reserve',
	'consume',
	'refund',
	'adjustment'
]);
export const orderStatus = pgEnum('order_status', [
	'pending',
	'paid',
	'canceled',
	'refunded',
	'failed'
]);

export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		emailVerified: boolean('email_verified').notNull().default(false),
		image: text('image'),
		bio: text('bio'),
		avatarObjectKey: text('avatar_object_key'),
		role: text('role').notNull().default('user'),
		banned: boolean('banned').notNull().default(false),
		banReason: text('ban_reason'),
		banExpires: timestamp('ban_expires', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('user_email_idx').on(table.email)]
);

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		token: text('token').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [
		uniqueIndex('session_token_idx').on(table.token),
		index('session_user_idx').on(table.userId)
	]
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('account_user_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const jwks = pgTable('jwks', {
	id: text('id').primaryKey(),
	publicKey: text('public_key').notNull(),
	privateKey: text('private_key').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true })
});

export const rateLimit = pgTable(
	'rate_limit',
	{
		id: text('id').primaryKey(),
		key: text('key').notNull(),
		count: integer('count').notNull(),
		lastRequest: bigint('last_request', { mode: 'number' }).notNull()
	},
	(table) => [uniqueIndex('rate_limit_key_idx').on(table.key)]
);

export const assets = pgTable(
	'assets',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		kind: assetKind('kind').notNull(),
		objectKey: text('object_key').notNull(),
		fileName: text('file_name').notNull(),
		displayName: text('display_name').notNull(),
		mimeType: text('mime_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		width: integer('width'),
		height: integer('height'),
		style: text('style'),
		color: text('color'),
		favorite: boolean('favorite').notNull().default(false),
		expiresAt: timestamp('expires_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp('deleted_at', { withTimezone: true })
	},
	(table) => [index('assets_user_created_idx').on(table.userId, table.createdAt)]
);

export const assetTags = pgTable(
	'asset_tags',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		assetId: uuid('asset_id')
			.notNull()
			.references(() => assets.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		tag: text('tag').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('asset_tags_asset_idx').on(table.assetId),
		index('asset_tags_user_tag_idx').on(table.userId, table.tag)
	]
);

export const generationJobs = pgTable(
	'generation_jobs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		tool: jobTool('tool').notNull(),
		provider: text('provider').notNull().default('auto'),
		providerJobId: text('provider_job_id'),
		status: jobStatus('status').notNull().default('queued'),
		stage: jobStage('stage').notNull().default('queued'),
		progress: integer('progress'),
		completedCount: integer('completed_count').notNull().default(0),
		totalCount: integer('total_count').notNull().default(1),
		prompt: text('prompt'),
		parameters: jsonb('parameters').$type<Record<string, unknown>>().notNull().default({}),
		sourceAssetId: uuid('source_asset_id').references(() => assets.id, { onDelete: 'set null' }),
		reservedCredits: integer('reserved_credits').notNull().default(0),
		consumedCredits: integer('consumed_credits').notNull().default(0),
		errorCode: text('error_code'),
		errorMessage: text('error_message'),
		retryCount: integer('retry_count').notNull().default(0),
		heartbeatAt: timestamp('heartbeat_at', { withTimezone: true }),
		startedAt: timestamp('started_at', { withTimezone: true }),
		finishedAt: timestamp('finished_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('generation_jobs_user_created_idx').on(table.userId, table.createdAt),
		index('generation_jobs_status_idx').on(table.status, table.createdAt)
	]
);

export const generationOutputs = pgTable(
	'generation_outputs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		jobId: uuid('job_id')
			.notNull()
			.references(() => generationJobs.id, { onDelete: 'cascade' }),
		assetId: uuid('asset_id')
			.notNull()
			.references(() => assets.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('generation_outputs_job_position_idx').on(table.jobId, table.position)]
);

export const jobEvents = pgTable(
	'job_events',
	{
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		jobId: uuid('job_id')
			.notNull()
			.references(() => generationJobs.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('job_events_job_id_idx').on(table.jobId, table.id)]
);

export const templates = pgTable(
	'templates',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull(),
		name: text('name').notNull(),
		description: text('description').notNull(),
		tool: jobTool('tool').notNull(),
		category: text('category').notNull(),
		previewAssetId: uuid('preview_asset_id').references(() => assets.id, { onDelete: 'set null' }),
		promptPreset: text('prompt_preset').notNull(),
		parameters: jsonb('parameters').$type<Record<string, unknown>>().notNull().default({}),
		published: boolean('published').notNull().default(false),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('templates_slug_idx').on(table.slug)]
);

export const userSceneTemplates = pgTable(
	'user_scene_templates',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		category: text('category').notNull(),
		assetId: uuid('asset_id')
			.notNull()
			.references(() => assets.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('user_scene_templates_user_created_idx').on(table.userId, table.createdAt),
		index('user_scene_templates_user_category_idx').on(table.userId, table.category)
	]
);

export const creditWallets = pgTable('credit_wallets', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	balance: integer('balance').notNull().default(0),
	reserved: integer('reserved').notNull().default(0),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const creditTransactions = pgTable(
	'credit_transactions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		type: transactionType('type').notNull(),
		amount: integer('amount').notNull(),
		balanceAfter: integer('balance_after').notNull(),
		referenceType: text('reference_type'),
		referenceId: text('reference_id'),
		description: text('description').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('credit_transactions_user_created_idx').on(table.userId, table.createdAt),
		uniqueIndex('credit_transactions_reference_idx').on(
			table.userId,
			table.type,
			table.referenceType,
			table.referenceId
		)
	]
);

export const products = pgTable(
	'products',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull(),
		name: text('name').notNull(),
		type: text('type').notNull(),
		credits: integer('credits').notNull(),
		active: boolean('active').notNull().default(true),
		features: jsonb('features').$type<string[]>().notNull().default([]),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('products_slug_idx').on(table.slug)]
);

export const prices = pgTable(
	'prices',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		productId: uuid('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		currency: text('currency').notNull(),
		amount: integer('amount').notNull(),
		interval: text('interval'),
		active: boolean('active').notNull().default(true)
	},
	(table) => [
		uniqueIndex('prices_product_currency_interval_idx').on(
			table.productId,
			table.currency,
			table.interval
		)
	]
);

export const orders = pgTable(
	'orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		priceId: uuid('price_id')
			.notNull()
			.references(() => prices.id),
		status: orderStatus('status').notNull().default('pending'),
		amount: integer('amount').notNull(),
		currency: text('currency').notNull(),
		provider: text('provider').notNull().default('sandbox'),
		providerOrderId: text('provider_order_id'),
		idempotencyKey: text('idempotency_key').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('orders_idempotency_idx').on(table.idempotencyKey),
		index('orders_user_created_idx').on(table.userId, table.createdAt)
	]
);

export const subscriptions = pgTable('subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	productId: uuid('product_id')
		.notNull()
		.references(() => products.id),
	status: text('status').notNull().default('active'),
	currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
	currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
	cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
	providerSubscriptionId: text('provider_subscription_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const paymentEvents = pgTable(
	'payment_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		provider: text('provider').notNull(),
		providerEventId: text('provider_event_id').notNull(),
		type: text('type').notNull(),
		payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
		processedAt: timestamp('processed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('payment_events_provider_event_idx').on(table.provider, table.providerEventId)
	]
);

export const auditLogs = pgTable(
	'audit_logs',
	{
		id: serial('id').primaryKey(),
		actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
		action: text('action').notNull(),
		targetType: text('target_type').notNull(),
		targetId: text('target_id').notNull(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('audit_logs_created_idx').on(table.createdAt)]
);
