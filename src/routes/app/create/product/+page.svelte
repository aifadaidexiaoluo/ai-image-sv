<script lang="ts">
	import { page } from '$app/state';
	import { productStyles, promptSuggestions } from '$lib/app-catalog';
	import type { AssetItem } from '$lib/components/app/assets/types';
	import ModeSelector, {
		type GenerationMode
	} from '$lib/components/app/create-product/mode-selector.svelte';
	import ResultEmpty from '$lib/components/app/create-product/result-empty.svelte';
	import SettingSelect from '$lib/components/app/create-product/setting-select.svelte';
	import StepHeading from '$lib/components/app/create-product/step-heading.svelte';
	import StyleSelector, {
		type ProductStyleId
	} from '$lib/components/app/create-product/style-selector.svelte';
	import TipsCard from '$lib/components/app/create-product/tips-card.svelte';
	import UploadCard from '$lib/components/app/create-product/upload-card.svelte';
	import JobCard from '$lib/components/app/job-card.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { GenerationJob, GenerationProviderId } from '$lib/types/jobs';
	import { cn } from '$lib/utils';
	import { ChevronDown, CircleAlert, Coins, RefreshCw, Settings2 } from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { onDestroy, onMount } from 'svelte';

	type ProductFormValues = {
		generationMode: GenerationMode;
		prompt: string;
		provider: GenerationProviderId;
		count: number;
		aspectRatio: string;
		size: string;
		styleIds: ProductStyleId[];
		customStyle: string;
		quality: string;
	};

	const defaultStyleId = 'commerce-white' satisfies ProductStyleId;
	const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
	const maxFileBytes = 10 * 1024 * 1024;

	const suggestionBatches = [
		promptSuggestions,
		['磨砂玻璃香水瓶', '轻奢真皮手袋', '奶油色护肤套装', '复古陶瓷咖啡杯', '透明亚克力耳机盒'],
		['金属保温杯', '极简白色运动鞋', '木质香薰蜡烛', '北欧餐具套装', '儿童益智玩具']
	];

	const exampleBatches = [
		[
			{
				text: '玻璃精华瓶，透明质感，银色滴管，极简风格，白底拍摄',
				tag: '护肤品'
			},
			{
				text: '黑色真皮手提包，金色五金，简约时尚，摆在大理石台面上',
				tag: '包包'
			},
			{
				text: '白色无线耳机，科技感，产品特写，纯色背景',
				tag: '数码产品'
			}
		],
		[
			{
				text: '磨砂口红管，玫瑰金外壳，柔和棚拍光线，高级美妆广告风',
				tag: '彩妆'
			},
			{
				text: '米白色运动鞋，干净鞋面，悬浮构图，浅灰背景，电商主图',
				tag: '鞋履'
			},
			{
				text: '木质香薰蜡烛，温暖烛光，亚麻布背景，生活方式摄影',
				tag: '家居'
			}
		]
	];

	const providerOptions = [
		{ value: 'auto', label: '自动选择' },
		{ value: 'openai', label: 'OpenAI' },
		{ value: 'tongyi', label: '通义万相' }
	] satisfies { value: GenerationProviderId; label: string }[];

	const aspectRatioOptions = [
		{ value: '1:1', label: '1:1 (正方形)' },
		{ value: '4:5', label: '4:5 (竖版)' },
		{ value: '16:9', label: '16:9 (横版)' }
	];

	const sizeOptions = [
		{ value: '1024x1024', label: '1024 x 1024' },
		{ value: '1024x1536', label: '1024 x 1536' },
		{ value: '1536x1024', label: '1536 x 1024' }
	];

	const countOptions = [
		{ value: '1', label: '1 张' },
		{ value: '2', label: '2 张' },
		{ value: '4', label: '4 张' }
	];

	const qualityOptions = [
		{ value: 'standard', label: '标准清晰' },
		{ value: 'hd', label: '高清细节' },
		{ value: 'ultra', label: '超清精修' }
	];

	const form = createForm(() => ({
		defaultValues: {
			generationMode: 'prompt',
			prompt: '',
			provider: 'auto',
			count: 4,
			aspectRatio: '1:1',
			size: '1024x1024',
			styleIds: [defaultStyleId],
			customStyle: '',
			quality: 'hd'
		} as ProductFormValues,
		onSubmit: async ({ value }) => {
			await submit(value);
		}
	}));

	let file = $state<File>();
	let preview = $state('');
	let selectedAsset = $state<AssetItem>();
	let error = $state('');
	let activeJobs = $state<GenerationJob[]>([]);
	let advancedOpen = $state(false);
	let suggestionBatchIndex = $state(0);
	let exampleBatchIndex = $state(0);
	let prefillNotice = $state('');

	const visibleSuggestions = $derived(
		suggestionBatches[suggestionBatchIndex] ?? suggestionBatches[0]
	);
	const visibleExamples = $derived(exampleBatches[exampleBatchIndex] ?? exampleBatches[0]);
	const allStyleIds = productStyles.map((style) => style.id);

	onDestroy(() => {
		revokePreview();
	});

	onMount(() => {
		void prefillFromHistory();
	});

	function revokePreview() {
		if (preview) URL.revokeObjectURL(preview);
	}

	function setError(message: string) {
		error = message;
	}

	function selectGenerationMode(mode: GenerationMode) {
		error = '';
		form.setFieldValue('generationMode', mode);
	}

	function validateFile(selected: File) {
		if (!allowedTypes.has(selected.type)) return '仅支持 JPG、PNG 和 WebP 图片';
		if (selected.size <= 0 || selected.size > maxFileBytes) return '图片大小不能超过 10 MB';
		return '';
	}

	function setSourceFile(selected: File) {
		const message = validateFile(selected);
		if (message) {
			setError(message);
			return;
		}
		revokePreview();
		file = selected;
		preview = URL.createObjectURL(selected);
		selectedAsset = undefined;
		error = '';
	}

	function selectSourceAsset(asset: AssetItem) {
		revokePreview();
		file = undefined;
		preview = '';
		selectedAsset = asset;
		error = '';
	}

	function clearFile() {
		revokePreview();
		file = undefined;
		preview = '';
		selectedAsset = undefined;
	}

	function fillPrompt(text: string) {
		form.setFieldValue('prompt', text);
		error = '';
	}

	function nextSuggestionBatch() {
		suggestionBatchIndex = (suggestionBatchIndex + 1) % suggestionBatches.length;
	}

	function nextExampleBatch() {
		exampleBatchIndex = (exampleBatchIndex + 1) % exampleBatches.length;
	}

	function toggleStyle(id: ProductStyleId) {
		error = '';
		const styleIds = form.getFieldValue('styleIds') ?? [];
		const hasCustomStyle = Boolean(form.getFieldValue('customStyle').trim());
		if (styleIds.includes(id)) {
			if (styleIds.length === 1 && !hasCustomStyle) {
				setError('至少需要保留一种商品图风格');
				return;
			}
			form.setFieldValue(
				'styleIds',
				styleIds.filter((item) => item !== id)
			);
			return;
		}
		form.setFieldValue('styleIds', [...styleIds, id]);
	}

	function updateCustomStyle(value: string) {
		error = '';
		form.setFieldValue('customStyle', value);
		if (!value.trim()) return;
		const styleIds = form.getFieldValue('styleIds') ?? [];
		if (styleIds.length === 1 && styleIds[0] === defaultStyleId) {
			form.setFieldValue('styleIds', []);
		}
	}

	function toggleAllStyles() {
		const styleIds = form.getFieldValue('styleIds') ?? [];
		const allSelected = allStyleIds.every((id) => styleIds.includes(id));
		form.setFieldValue('styleIds', allSelected ? [defaultStyleId] : [...allStyleIds]);
		error = '';
	}

	async function prefillFromHistory() {
		const jobId = page.url.searchParams.get('fromJob');
		if (!jobId) return;

		const response = await fetch(`/api/jobs/${jobId}`);
		if (!response.ok) return;
		const payload = (await response.json()) as { job?: GenerationJob };
		const job = payload.job;
		if (!job || job.tool !== 'product') return;

		const parameters = job.parameters ?? {};
		const generationMode =
			parameters.generationMode === 'reference' || parameters.generationMode === 'prompt'
				? parameters.generationMode
				: 'prompt';
		const styleIds = Array.isArray(parameters.styleIds)
			? parameters.styleIds.filter((id): id is ProductStyleId =>
					allStyleIds.includes(id as ProductStyleId)
				)
			: [];

		form.setFieldValue('generationMode', generationMode);
		form.setFieldValue('prompt', job.prompt ?? '');
		form.setFieldValue('count', [1, 2, 4].includes(job.totalCount) ? job.totalCount : 4);
		if (typeof parameters.aspectRatio === 'string') {
			form.setFieldValue('aspectRatio', parameters.aspectRatio);
		}
		if (typeof parameters.size === 'string') {
			form.setFieldValue('size', parameters.size);
		}
		if (typeof parameters.customStyle === 'string') {
			form.setFieldValue('customStyle', parameters.customStyle);
		}
		if (typeof parameters.quality === 'string') {
			form.setFieldValue('quality', parameters.quality);
		}
		if (styleIds.length) {
			form.setFieldValue('styleIds', styleIds);
		}
		prefillNotice = '已加载历史任务参数；如需使用参考图生成，请重新上传源图片。';
	}

	function validateSubmission(value: ProductFormValues) {
		const prompt = value.prompt.trim();
		if (value.generationMode === 'prompt' && !prompt) return '请输入商品描述';
		if (prompt.length > 300) return '商品描述不能超过 300 个字符';
		if (value.generationMode === 'reference' && !file && !selectedAsset)
			return '参考图生成需要先上传或选择一张商品图片';
		if (value.customStyle.trim().length > 80) return '自定义风格不能超过 80 个字符';
		if (!value.styleIds.length && !value.customStyle.trim())
			return '至少需要选择一种商品图风格或填写自定义风格';
		return '';
	}

	async function uploadSource() {
		if (selectedAsset) return selectedAsset.id;
		if (!file) return undefined;
		const presign = await fetch('/api/uploads/presign', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size })
		});
		const descriptor = await presign.json();
		if (!presign.ok) throw new Error(descriptor.message);
		const uploaded = await fetch(descriptor.url, {
			method: 'PUT',
			headers: descriptor.headers,
			body: file
		});
		if (!uploaded.ok) throw new Error('图片上传失败，请检查存储配置');
		return descriptor.assetId as string;
	}

	async function submit(value: ProductFormValues) {
		error = '';
		const validationError = validateSubmission(value);
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			const sourceAssetId = await uploadSource();
			const response = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					tool: 'product',
					provider: value.provider,
					prompt: value.prompt.trim(),
					count: value.count,
					aspectRatio: value.aspectRatio,
					sourceAssetId,
					parameters: {
						generationMode: value.generationMode,
						styleIds: value.styleIds,
						customStyle: value.customStyle.trim(),
						size: value.size,
						quality: value.quality
					}
				})
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.message);
			activeJobs = [{ ...payload.job, outputs: [] }, ...activeJobs];
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '创建任务失败';
		}
	}
</script>

<svelte:head><title>商品图生成 - DesignAI</title></svelte:head>

<Tooltip.Provider>
	<div class="mx-auto max-w-[1600px] pb-8">
		<div class="mb-8">
			<h1 class="text-[30px] font-black leading-tight text-[#121826]">商品图生成</h1>
			<p class="mt-2 text-[15px] text-[#65708a]">从描述或参考图生成电商级商品图，让商品更出彩</p>
		</div>

		<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
			<Card.Root
				class="rounded-[18px] border border-[#e1e5f2] bg-white py-0 shadow-[0_18px_50px_rgba(61,72,120,0.06)] ring-0"
			>
				<Card.Content class="px-8 py-8">
					<form
						onsubmit={(event) => {
							event.preventDefault();
							void form.handleSubmit();
						}}
					>
						<section>
							<StepHeading step={1}>选择生成方式</StepHeading>

							<form.Subscribe selector={(state) => state.values.generationMode}>
								{#snippet children(generationMode)}
									<ModeSelector value={generationMode} onSelect={selectGenerationMode} />
								{/snippet}
							</form.Subscribe>
						</section>

						<section class="mt-8">
							<StepHeading step={2}>输入商品描述</StepHeading>

							<form.Field name="prompt">
								{#snippet children(field)}
									<Label class="relative mt-5 block">
										<Textarea
											value={field.state.value}
											oninput={(event) =>
												field.handleChange((event.currentTarget as HTMLTextAreaElement).value)}
											onblur={field.handleBlur}
											maxlength={300}
											rows={4}
											class="h-[112px] resize-none rounded-[9px] border-[#cbd3e7] px-4 py-4 text-[14px] leading-6 text-[#172033] placeholder:text-[#a8b1c5] focus-visible:border-primary focus-visible:ring-primary/10"
											placeholder="请输入商品名称、材质、颜色、风格、使用场景等描述"
										/>
										<span class="absolute bottom-4 right-4 text-[13px] font-medium text-[#a0a9be]"
											>{field.state.value.length} / 300</span
										>
									</Label>
								{/snippet}
							</form.Field>

							<div class="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
								<span class="font-medium text-[#65708a]">智能推荐：</span>
								{#each visibleSuggestions as item (item)}
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={() => fillPrompt(item)}
										class="h-8 rounded-[7px] border-[#dce2f1] px-4 font-medium text-[#65708a] hover:border-primary hover:bg-white hover:text-primary"
										>{item}</Button
									>
								{/each}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={nextSuggestionBatch}
									class="h-8 gap-2 px-2 font-bold text-primary hover:bg-primary/5 hover:text-primary"
								>
									<RefreshCw class="size-4" />换一批
								</Button>
							</div>
						</section>

						<section class="mt-8">
							<form.Subscribe selector={(state) => state.values.styleIds}>
								{#snippet children(styleIds)}
									<form.Field name="customStyle">
										{#snippet children(field)}
											<StyleSelector
												selectedStyleIds={styleIds}
												customStyle={field.state.value}
												onToggle={toggleStyle}
												onToggleAll={toggleAllStyles}
												onCustomStyleChange={updateCustomStyle}
												onCustomStyleBlur={field.handleBlur}
											/>
										{/snippet}
									</form.Field>
								{/snippet}
							</form.Subscribe>
						</section>

						<section class="mt-9">
							<StepHeading step={4}>图片设置</StepHeading>

							<div class="mt-5 rounded-2xl border border-[#e3e8f5] bg-[#f8faff] p-4">
								<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
									<form.Field name="aspectRatio">
										{#snippet children(field)}
											<SettingSelect
												label="图片比例"
												value={field.state.value}
												options={aspectRatioOptions}
												onChange={(value) => field.handleChange(value)}
											/>
										{/snippet}
									</form.Field>

									<form.Field name="size">
										{#snippet children(field)}
											<SettingSelect
												label="图片尺寸"
												value={field.state.value}
												options={sizeOptions}
												onChange={(value) => field.handleChange(value)}
											/>
										{/snippet}
									</form.Field>

									<form.Field name="count">
										{#snippet children(field)}
											<SettingSelect
												label="生成数量"
												value={String(field.state.value)}
												options={countOptions}
												onChange={(value) => field.handleChange(Number(value))}
											/>
										{/snippet}
									</form.Field>

									<form.Field name="quality">
										{#snippet children(field)}
											<SettingSelect
												label="图片清晰度"
												value={field.state.value}
												options={qualityOptions}
												onChange={(value) => field.handleChange(value)}
											/>
										{/snippet}
									</form.Field>

									<Button
										type="button"
										variant="outline"
										onclick={() => (advancedOpen = !advancedOpen)}
										class="h-full min-h-[86px] rounded-xl border-[#dfe5f4] bg-white text-[14px] font-black text-[#30405f] shadow-[0_10px_24px_rgba(31,42,84,0.04)] hover:border-primary/40 hover:bg-white hover:text-primary md:col-span-2 xl:col-span-4"
									>
										<Settings2 class="size-4" />
										高级设置
										<ChevronDown
											class={cn('size-4 transition-transform', advancedOpen && 'rotate-180')}
										/>
									</Button>
								</div>

								<Collapsible.Root bind:open={advancedOpen}>
									<Collapsible.Content>
										<div class="mt-3 grid gap-3 border-t border-[#e3e8f5] pt-3 md:grid-cols-2">
											<form.Field name="provider">
												{#snippet children(field)}
													<SettingSelect
														label="生成引擎"
														value={field.state.value}
														options={providerOptions}
														onChange={(value) => field.handleChange(value as GenerationProviderId)}
													/>
												{/snippet}
											</form.Field>
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
							</div>
						</section>

						{#if error}
							<Alert variant="destructive" class="mt-5">
								<CircleAlert class="size-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						{/if}

						{#if prefillNotice}
							<Alert class="mt-5 border-primary/20 bg-primary/5 text-[#4f3de0]">
								<AlertDescription>{prefillNotice}</AlertDescription>
							</Alert>
						{/if}

						<form.Subscribe
							selector={(state) => ({
								count: state.values.count,
								isSubmitting: state.isSubmitting
							})}
						>
							{#snippet children(state)}
								<div class="mt-9 flex flex-wrap items-center justify-center gap-6">
									<Button
										type="submit"
										disabled={state.isSubmitting}
										class="h-12 w-full max-w-[540px] rounded-[7px] text-[16px] font-black text-white shadow-[0_18px_32px_rgba(91,61,245,0.24)] hover:bg-[#4d30e7]"
									>
										{state.isSubmitting ? '正在创建任务...' : '立即生成'}
									</Button>
									<span class="inline-flex items-center gap-2 text-[14px] font-bold text-[#65708a]">
										<Coins class="size-4 text-amber-500" />消耗 {state.count * 2} 积分
									</span>
								</div>
							{/snippet}
						</form.Subscribe>
					</form>
				</Card.Content>
			</Card.Root>

			<aside class="space-y-5">
				<form.Subscribe selector={(state) => state.values.generationMode}>
					{#snippet children(generationMode)}
						{#if generationMode === 'reference'}
							<UploadCard
								{file}
								preview={selectedAsset?.url ?? preview}
								sourceName={selectedAsset?.displayName}
								selectedAssetId={selectedAsset?.id}
								onFileSelected={setSourceFile}
								onAssetSelected={selectSourceAsset}
								onClear={clearFile}
							/>
						{/if}
					{/snippet}
				</form.Subscribe>

				<TipsCard
					examples={visibleExamples}
					onSelectExample={fillPrompt}
					onNextExamples={nextExampleBatch}
				/>

				{#if activeJobs.length}
					<div class="space-y-4">
						{#each activeJobs as job (job.id)}
							<JobCard initialJob={job} />
						{/each}
					</div>
				{:else}
					<ResultEmpty />
				{/if}
			</aside>
		</div>
	</div>
</Tooltip.Provider>
