<script lang="ts">
	import { onDestroy } from 'svelte';
	import { sceneCategories, sceneTemplates } from '$lib/app-catalog';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Check, CircleAlert, ImagePlus, LoaderCircle, Sparkles, Upload, X } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { cn } from '$lib/utils';

	export type SceneCategoryId = (typeof sceneCategories)[number]['id'];
	export type SceneTemplateId = (typeof sceneTemplates)[number]['id'];
	export type UserSceneTemplate = {
		id: string;
		title: string;
		category: string;
		assetId: string;
		image: string;
		createdAt: string;
		owner: 'user';
	};
	export type SceneTemplateCard = {
		id: string;
		key: string;
		name: string;
		category: string;
		image: string;
		owner: 'public' | 'user';
		assetId?: string;
	};
	type TemplateUploadValues = {
		title: string;
		category: string;
	};
	type TemplateGenerateValues = TemplateUploadValues & {
		prompt: string;
	};

	let {
		category,
		selectedSceneId,
		userTemplates = [],
		onCategoryChange,
		onSceneSelect,
		onTemplateCreate,
		onTemplateGenerate
	}: {
		category: SceneCategoryId;
		selectedSceneId: string;
		userTemplates?: UserSceneTemplate[];
		onCategoryChange: (category: SceneCategoryId) => void;
		onSceneSelect: (sceneId: string) => void;
		onTemplateCreate: (input: TemplateUploadValues & { file: File }) => Promise<void>;
		onTemplateGenerate: (input: TemplateGenerateValues) => Promise<void>;
	} = $props();

	const realCategories = sceneCategories.filter((item) => item.id !== 'all');
	const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
	const maxFileBytes = 10 * 1024 * 1024;
	const uploadForm = createForm(() => ({
		defaultValues: {
			title: '',
			category: realCategories[0]?.id ?? 'home'
		} as TemplateUploadValues,
		onSubmit: async ({ value }) => {
			await createTemplate(value);
		}
	}));
	const generateForm = createForm(() => ({
		defaultValues: {
			title: '',
			category: realCategories[0]?.id ?? 'home',
			prompt: ''
		} as TemplateGenerateValues,
		onSubmit: async ({ value }) => {
			await generateTemplate(value);
		}
	}));

	let uploadOpen = $state(false);
	let generateOpen = $state(false);
	let templateFile = $state<File>();
	let templatePreview = $state('');
	let uploadError = $state('');
	let generateError = $state('');
	let fileInput = $state<HTMLInputElement>();

	const allScenes = $derived<SceneTemplateCard[]>([
		...sceneTemplates.map((scene) => ({
			id: scene.id,
			key: scene.id,
			name: scene.name,
			category: scene.category,
			image: scene.image,
			owner: 'public' as const
		})),
		...userTemplates.map((scene) => ({
			id: scene.id,
			key: `user:${scene.id}`,
			name: scene.title,
			category: scene.category,
			image: scene.image,
			owner: 'user' as const,
			assetId: scene.assetId
		}))
	]);
	const filteredScenes = $derived(
		category === 'all' ? allScenes : allScenes.filter((item) => item.category === category)
	);

	function categoryLabel(value: string) {
		return realCategories.find((item) => item.id === value)?.name ?? '选择分类';
	}

	onDestroy(() => {
		revokeTemplatePreview();
	});

	function revokeTemplatePreview() {
		if (templatePreview) URL.revokeObjectURL(templatePreview);
	}

	function validateTemplateFile(selected: File) {
		if (!allowedTypes.has(selected.type)) return '仅支持 JPG、PNG 和 WebP 图片';
		if (selected.size <= 0 || selected.size > maxFileBytes) return '图片大小不能超过 10 MB';
		return '';
	}

	function setTemplateFile(selected: File) {
		const message = validateTemplateFile(selected);
		if (message) {
			uploadError = message;
			return;
		}
		revokeTemplatePreview();
		templateFile = selected;
		templatePreview = URL.createObjectURL(selected);
		uploadError = '';
	}

	function clearTemplateFile() {
		revokeTemplatePreview();
		templateFile = undefined;
		templatePreview = '';
		if (fileInput) fileInput.value = '';
	}

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (selected) setTemplateFile(selected);
	}

	function dropFile(event: DragEvent) {
		event.preventDefault();
		const selected = event.dataTransfer?.files?.[0];
		if (selected) setTemplateFile(selected);
	}

	async function createTemplate(value: TemplateUploadValues) {
		uploadError = '';
		if (!templateFile) {
			uploadError = '请先选择场景模板图片';
			return;
		}
		try {
			await onTemplateCreate({ ...value, file: templateFile });
			clearTemplateFile();
			uploadForm.reset();
			uploadOpen = false;
		} catch (cause) {
			uploadError = cause instanceof Error ? cause.message : '模板上传失败';
		}
	}

	async function generateTemplate(value: TemplateGenerateValues) {
		generateError = '';
		try {
			await onTemplateGenerate(value);
			generateForm.reset();
			generateOpen = false;
		} catch (cause) {
			generateError = cause instanceof Error ? cause.message : '模板生成失败';
		}
	}
</script>

<section
	class="rounded-[18px] border border-[#e2e6f4] bg-white px-6 py-6 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
>
	<div class="flex flex-wrap gap-3">
		{#each sceneCategories as item (item.id)}
			<Button
				type="button"
				variant={category === item.id ? 'default' : 'outline'}
				size="sm"
				onclick={() => onCategoryChange(item.id)}
				class={cn(
					'h-9 rounded-[7px] px-4 text-[14px] font-black',
					category === item.id
						? 'shadow-[0_10px_20px_rgba(91,61,245,0.22)]'
						: 'border-[#dfe4f2] bg-white text-[#5f6b85] hover:border-primary/50 hover:bg-white hover:text-primary'
				)}
			>
				{item.name}
			</Button>
		{/each}
	</div>

	<div class="mt-8 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-[17px] font-black text-[#121826]">选择场景模板</h2>
			<p class="mt-1 text-[13px] font-medium text-[#7a859e]">
				可使用公共模板，也可以上传仅自己可见的场景模板
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button
				type="button"
				variant={generateOpen ? 'secondary' : 'outline'}
				size="sm"
				onclick={() => {
					generateOpen = !generateOpen;
					if (generateOpen) uploadOpen = false;
					generateError = '';
				}}
				class="h-9 rounded-[7px] border-primary/35 px-4 font-black text-primary hover:bg-primary/5 hover:text-primary"
			>
				{#if generateOpen}
					<X class="size-4" />收起生成
				{:else}
					<Sparkles class="size-4" />AI 生成模板
				{/if}
			</Button>
			<Button
				type="button"
				variant={uploadOpen ? 'secondary' : 'outline'}
				size="sm"
				onclick={() => {
					uploadOpen = !uploadOpen;
					if (uploadOpen) generateOpen = false;
					uploadError = '';
				}}
				class="h-9 rounded-[7px] border-primary/35 px-4 font-black text-primary hover:bg-primary/5 hover:text-primary"
			>
				{#if uploadOpen}
					<X class="size-4" />收起上传
				{:else}
					<Upload class="size-4" />上传模板
				{/if}
			</Button>
		</div>
	</div>

	{#if generateOpen}
		<div class="mt-5 rounded-[14px] border border-dashed border-primary/30 bg-[#fbfaff] p-4">
			{#if generateError}
				<Alert variant="destructive" class="mb-4">
					<CircleAlert class="size-4" />
					<AlertDescription>{generateError}</AlertDescription>
				</Alert>
			{/if}

			<div class="grid gap-4 lg:grid-cols-[1fr_1fr]">
				<generateForm.Field
					name="title"
					validators={{
						onChange: ({ value }) => {
							const title = value.trim();
							if (!title) return '请输入模板标题';
							if (title.length > 60) return '标题不能超过 60 个字符';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<div>
							<Label
								for="scene-template-generate-title"
								class="text-[13px] font-black text-[#26324a]"
							>
								模板标题
							</Label>
							<Input
								id="scene-template-generate-title"
								value={field.state.value}
								placeholder="例如：秋日窗边咖啡桌"
								class="mt-2 h-10 rounded-[8px] bg-white"
								onblur={() => field.handleBlur()}
								oninput={(event: Event) => {
									field.handleChange((event.target as HTMLInputElement).value);
								}}
							/>
							{#if field.state.meta.errors?.[0]}
								<p class="mt-1 text-[12px] font-medium text-destructive">
									{field.state.meta.errors[0]}
								</p>
							{/if}
						</div>
					{/snippet}
				</generateForm.Field>

				<generateForm.Field
					name="category"
					validators={{
						onChange: ({ value }) => (!value ? '请选择分类' : undefined)
					}}
				>
					{#snippet children(field)}
						<div>
							<Label
								for="scene-template-generate-category"
								class="text-[13px] font-black text-[#26324a]"
							>
								模板分类
							</Label>
							<Select.Root
								type="single"
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value)}
							>
								<Select.Trigger
									id="scene-template-generate-category"
									class="mt-2 h-10 w-full rounded-[8px] bg-white text-[14px] font-bold text-[#30405f]"
								>
									{categoryLabel(field.state.value)}
								</Select.Trigger>
								<Select.Content>
									{#each realCategories as item (item.id)}
										<Select.Item value={item.id}>{item.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					{/snippet}
				</generateForm.Field>
			</div>

			<generateForm.Field
				name="prompt"
				validators={{
					onChange: ({ value }) => {
						const prompt = value.trim();
						if (prompt.length < 8) return '请至少描述 8 个字符';
						if (prompt.length > 500) return '描述不能超过 500 个字符';
						return undefined;
					}
				}}
			>
				{#snippet children(field)}
					<div class="mt-4">
						<Label
							for="scene-template-generate-prompt"
							class="text-[13px] font-black text-[#26324a]"
						>
							场景描述
						</Label>
						<Textarea
							id="scene-template-generate-prompt"
							value={field.state.value}
							placeholder="描述背景、光线、材质、季节氛围和适合摆放商品的位置，例如：自然光洒入的木质厨房台面，浅色背景，中央留出干净商品摆放区"
							class="mt-2 min-h-24 rounded-[8px] bg-white"
							onblur={() => field.handleBlur()}
							oninput={(event: Event) => {
								field.handleChange((event.target as HTMLTextAreaElement).value);
							}}
						/>
						{#if field.state.meta.errors?.[0]}
							<p class="mt-1 text-[12px] font-medium text-destructive">
								{field.state.meta.errors[0]}
							</p>
						{/if}
					</div>
				{/snippet}
			</generateForm.Field>

			<div class="mt-4 flex flex-wrap items-center justify-between gap-3">
				<p class="text-[12px] font-medium text-[#8c96ac]">
					AI 会生成无商品的 16:9 场景模板，保存后仅你自己可见。消耗 2 积分。
				</p>
				<generateForm.Subscribe selector={(state) => state.isSubmitting}>
					{#snippet children(isSubmitting)}
						<Button
							type="button"
							size="sm"
							disabled={isSubmitting}
							onclick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								void generateForm.handleSubmit();
							}}
							class="h-9 rounded-[7px] px-4 font-black"
						>
							{#if isSubmitting}
								<LoaderCircle class="size-4 animate-spin" />生成中
							{:else}
								<Sparkles class="size-4" />生成并保存
							{/if}
						</Button>
					{/snippet}
				</generateForm.Subscribe>
			</div>
		</div>
	{/if}

	{#if uploadOpen}
		<div class="mt-5 rounded-[14px] border border-dashed border-primary/30 bg-[#fbfaff] p-4">
			{#if uploadError}
				<Alert variant="destructive" class="mb-4">
					<CircleAlert class="size-4" />
					<AlertDescription>{uploadError}</AlertDescription>
				</Alert>
			{/if}

			<div class="grid gap-4 lg:grid-cols-[1fr_1fr_210px]">
				<uploadForm.Field
					name="title"
					validators={{
						onChange: ({ value }) => {
							const title = value.trim();
							if (!title) return '请输入模板标题';
							if (title.length > 60) return '标题不能超过 60 个字符';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<div>
							<Label for="scene-template-title" class="text-[13px] font-black text-[#26324a]">
								模板标题
							</Label>
							<Input
								id="scene-template-title"
								value={field.state.value}
								placeholder="例如：自然光厨房台面"
								class="mt-2 h-10 rounded-[8px] bg-white"
								onblur={() => field.handleBlur()}
								oninput={(event: Event) => {
									field.handleChange((event.target as HTMLInputElement).value);
								}}
							/>
							{#if field.state.meta.errors?.[0]}
								<p class="mt-1 text-[12px] font-medium text-destructive">
									{field.state.meta.errors[0]}
								</p>
							{/if}
						</div>
					{/snippet}
				</uploadForm.Field>

				<uploadForm.Field
					name="category"
					validators={{
						onChange: ({ value }) => (!value ? '请选择分类' : undefined)
					}}
				>
					{#snippet children(field)}
						<div>
							<Label for="scene-template-category" class="text-[13px] font-black text-[#26324a]">
								模板分类
							</Label>
							<Select.Root
								type="single"
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value)}
							>
								<Select.Trigger
									id="scene-template-category"
									class="mt-2 h-10 w-full rounded-[8px] bg-white text-[14px] font-bold text-[#30405f]"
								>
									{categoryLabel(field.state.value)}
								</Select.Trigger>
								<Select.Content>
									{#each realCategories as item (item.id)}
										<Select.Item value={item.id}>{item.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					{/snippet}
				</uploadForm.Field>

				<div>
					<Label class="text-[13px] font-black text-[#26324a]">模板图片</Label>
					<div
						role="button"
						tabindex="0"
						class={cn(
							'mt-2 flex h-10 items-center gap-3 rounded-[8px] border border-dashed bg-white px-3 text-left text-[13px] font-bold transition',
							templatePreview
								? 'border-primary/45 text-[#26324a]'
								: 'border-[#d8def0] text-[#7a859e] hover:border-primary/45 hover:text-primary'
						)}
						ondragover={(event) => event.preventDefault()}
						ondrop={dropFile}
						onclick={() => fileInput?.click()}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								fileInput?.click();
							}
						}}
					>
						{#if templatePreview}
							<img src={templatePreview} alt="模板预览" class="size-7 rounded object-cover" />
							<span class="min-w-0 flex-1 truncate">{templateFile?.name}</span>
						{:else}
							<ImagePlus class="size-4" />
							<span>选择或拖拽图片</span>
						{/if}
					</div>
					<input
						bind:this={fileInput}
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectFile}
					/>
				</div>
			</div>

			<div class="mt-4 flex flex-wrap items-center justify-between gap-3">
				<p class="text-[12px] font-medium text-[#8c96ac]">模板会保存到你的账户，仅你自己可见。</p>
				<div class="flex items-center gap-2">
					{#if templateFile}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={clearTemplateFile}
							class="h-9 text-red-500 hover:text-red-600"
						>
							<X class="size-4" />移除图片
						</Button>
					{/if}
					<uploadForm.Subscribe selector={(state) => state.isSubmitting}>
						{#snippet children(isSubmitting)}
							<Button
								type="button"
								size="sm"
								disabled={isSubmitting}
								onclick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void uploadForm.handleSubmit();
								}}
								class="h-9 rounded-[7px] px-4 font-black"
							>
								{#if isSubmitting}
									<LoaderCircle class="size-4 animate-spin" />保存中
								{:else}
									<Upload class="size-4" />保存模板
								{/if}
							</Button>
						{/snippet}
					</uploadForm.Subscribe>
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
		{#each filteredScenes as scene (scene.key)}
			<div
				role="button"
				tabindex="0"
				onclick={() => onSceneSelect(scene.key)}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onSceneSelect(scene.key);
					}
				}}
				class="group cursor-pointer text-left"
			>
				<AspectRatio
					ratio={1.32}
					class={cn(
						'relative overflow-hidden rounded-[10px] border bg-[#f7f8fc] transition',
						selectedSceneId === scene.key
							? 'border-primary ring-2 ring-primary/20'
							: 'border-transparent group-hover:border-primary/40'
					)}
				>
					<img
						src={scene.image}
						alt={scene.name}
						class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
					/>
					{#if scene.owner === 'user'}
						<Badge variant="secondary" class="absolute left-2 top-2 h-6 rounded-full px-2">
							我的
						</Badge>
					{/if}
					{#if selectedSceneId === scene.key}
						<Badge class="absolute right-2 top-2 h-6 rounded-full px-2">
							<Check class="size-3" />已选
						</Badge>
					{/if}
				</AspectRatio>
				<span class="mt-3 block text-[14px] font-semibold text-[#26324a]">{scene.name}</span>
			</div>
		{/each}
	</div>
	{#if filteredScenes.length === 0}
		<div class="mt-5 rounded-[12px] border border-dashed border-[#d8def0] py-10 text-center">
			<p class="text-[14px] font-bold text-[#65708a]">这个分类还没有模板</p>
			<p class="mt-1 text-[12px] font-medium text-[#8c96ac]">上传一个自己的场景模板即可使用。</p>
		</div>
	{/if}
</section>
