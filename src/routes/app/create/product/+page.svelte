<script lang="ts">
	import { promptSuggestions } from '$lib/app-catalog';
	import JobCard from '$lib/components/app/job-card.svelte';
	import {
		Check,
		ChevronDown,
		ChevronRight,
		CircleHelp,
		Coins,
		ImagePlus,
		Info,
		RefreshCw,
		SlidersHorizontal,
		Sparkles
	} from '@lucide/svelte';
	import { createForm } from '@tanstack/svelte-form';

	type GenerationMode = 'prompt' | 'reference';
	type Provider = 'auto' | 'openai' | 'tongyi';
	type ProductStyleId =
		| 'commerce-white'
		| 'lifestyle'
		| 'minimal-color'
		| 'premium'
		| 'render-3d'
		| 'illustration';

	type ProductFormValues = {
		generationMode: GenerationMode;
		prompt: string;
		provider: Provider;
		count: number;
		aspectRatio: string;
		size: string;
		styleIds: ProductStyleId[];
	};
	type Output = { id?: string; assetId?: string; position: number; url: string; mimeType?: string };
	type GeneratedJob = {
		id: string;
		tool: string;
		status: string;
		stage: string;
		progress: number | null;
		completedCount: number;
		totalCount: number;
		errorMessage?: string | null;
		outputs?: Output[];
	};

	const productStyles = [
		{
			id: 'commerce-white',
			name: '电商白底',
			image: '/images/app/create-product/commerce-white.png'
		},
		{
			id: 'lifestyle',
			name: '场景生活',
			image: '/images/app/create-product/lifestyle.png'
		},
		{
			id: 'minimal-color',
			name: '极简纯色',
			image: '/images/app/create-product/minimal-color.png'
		},
		{
			id: 'premium',
			name: '高级质感',
			image: '/images/app/create-product/premium.png'
		},
		{
			id: 'render-3d',
			name: '3D 渲染',
			image: '/images/app/create-product/render-3d.png'
		},
		{
			id: 'illustration',
			name: '手绘插画',
			image: '/images/app/create-product/illustration.png'
		}
	] satisfies { id: ProductStyleId; name: string; image: string }[];

	const examples = [
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
	];

	const form = createForm(() => ({
		defaultValues: {
			generationMode: 'prompt',
			prompt: '',
			provider: 'auto',
			count: 4,
			aspectRatio: '1:1',
			size: '1024x1024',
			styleIds: ['commerce-white']
		} as ProductFormValues,
		onSubmit: async ({ value }) => {
			await submit(value);
		}
	}));

	let file = $state<File>();
	let preview = $state('');
	let error = $state('');
	let activeJob = $state<GeneratedJob>();

	function selectFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!selected) return;
		if (preview) URL.revokeObjectURL(preview);
		file = selected;
		preview = URL.createObjectURL(selected);
	}

	function selectGenerationMode(mode: GenerationMode) {
		form.setFieldValue('generationMode', mode);
	}

	function toggleStyle(id: ProductStyleId) {
		const styleIds = form.getFieldValue('styleIds') ?? [];
		form.setFieldValue(
			'styleIds',
			styleIds.includes(id) ? styleIds.filter((item) => item !== id) : [...styleIds, id]
		);
	}

	async function uploadSource() {
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
		if (value.generationMode === 'reference' && !file) {
			error = '参考图生成需要先上传一张商品图片';
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
					prompt: value.prompt,
					count: value.count,
					aspectRatio: value.aspectRatio,
					sourceAssetId,
					parameters: {
						generationMode: value.generationMode,
						styleIds: value.styleIds,
						size: value.size
					}
				})
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.message);
			activeJob = { ...payload.job, outputs: [] };
		} catch (cause) {
			error = cause instanceof Error ? cause.message : '创建任务失败';
		}
	}
</script>

<svelte:head><title>商品图生成 - DesignAI</title></svelte:head>

<div class="mx-auto max-w-[1600px] pb-8">
	<div class="mb-8">
		<h1 class="text-[30px] font-black leading-tight text-[#121826]">商品图生成</h1>
		<p class="mt-2 text-[15px] text-[#65708a]">从描述或参考图生成电商级商品图，让商品更出彩</p>
	</div>

	<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
			class="rounded-[18px] border border-[#e1e5f2] bg-white px-8 py-8 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
		>
			<section>
				<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
					<span
						class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
						>1</span
					>
					选择生成方式
				</h2>

				<form.Subscribe selector={(state) => state.values.generationMode}>
					{#snippet children(generationMode)}
						<div class="mt-6 grid grid-cols-2 gap-5">
							<button
								type="button"
								onclick={() => selectGenerationMode('prompt')}
								class={`relative flex h-[106px] items-center gap-5 rounded-[10px] border bg-white px-6 text-left transition ${generationMode === 'prompt' ? 'border-primary ring-1 ring-primary' : 'border-[#e0e5f4] hover:border-primary/50'}`}
							>
								<span
									class="grid size-14 place-items-center rounded-[12px] bg-primary/10 text-primary"
								>
									<Sparkles class="size-8" />
								</span>
								<span>
									<strong class="block text-[16px] font-black text-[#121826]">AI 描述生成</strong>
									<small class="mt-2 block text-[14px] font-medium text-[#65708a]"
										>输入商品描述，AI 自动生成商品图</small
									>
								</span>
								{#if generationMode === 'prompt'}
									<span
										class="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-white"
									>
										<Check class="size-4 stroke-[3]" />
									</span>
								{/if}
							</button>

							<button
								type="button"
								onclick={() => selectGenerationMode('reference')}
								class={`relative flex h-[106px] items-center gap-5 rounded-[10px] border bg-white px-6 text-left transition ${generationMode === 'reference' ? 'border-primary ring-1 ring-primary' : 'border-[#e0e5f4] hover:border-primary/50'}`}
							>
								<span
									class="grid size-14 place-items-center rounded-[12px] bg-primary/10 text-primary"
								>
									<ImagePlus class="size-7" />
								</span>
								<span>
									<strong class="block text-[16px] font-black text-[#121826]">参考图生成</strong>
									<small class="mt-2 block text-[14px] font-medium text-[#65708a]"
										>上传参考图，AI 生成相似风格商品图</small
									>
								</span>
								{#if generationMode === 'reference'}
									<span
										class="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-white"
									>
										<Check class="size-4 stroke-[3]" />
									</span>
								{/if}
							</button>
						</div>
					{/snippet}
				</form.Subscribe>
			</section>

			<section class="mt-8">
				<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
					<span
						class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
						>2</span
					>
					输入商品描述
				</h2>

				<form.Field name="prompt">
					{#snippet children(field)}
						<label class="relative mt-5 block">
							<textarea
								value={field.state.value}
								oninput={(event) =>
									field.handleChange((event.currentTarget as HTMLTextAreaElement).value)}
								onblur={field.handleBlur}
								maxlength="300"
								rows="4"
								class="h-[96px] w-full resize-none rounded-[9px] border border-[#cbd3e7] bg-white px-4 py-4 text-[14px] leading-6 text-[#172033] outline-none transition placeholder:text-[#a8b1c5] focus:border-primary focus:ring-4 focus:ring-primary/10"
								placeholder="请输入商品名称、材质、颜色、风格、使用场景等描述"></textarea>
							<span class="absolute bottom-4 right-4 text-[13px] font-medium text-[#a0a9be]"
								>{field.state.value.length} / 300</span
							>
						</label>
					{/snippet}
				</form.Field>

				<div class="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
					<span class="font-medium text-[#65708a]">智能推荐：</span>
					{#each promptSuggestions as item (item)}
						<button
							type="button"
							onclick={() => form.setFieldValue('prompt', item)}
							class="h-8 rounded-[7px] border border-[#dce2f1] bg-white px-4 font-medium text-[#65708a] transition hover:border-primary hover:text-primary"
							>{item}</button
						>
					{/each}
					<button
						type="button"
						class="ml-1 inline-flex h-8 items-center gap-2 font-bold text-primary"
					>
						<RefreshCw class="size-4" />换一批
					</button>
				</div>
			</section>

			<section class="mt-8">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
						<span
							class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
							>3</span
						>
						选择风格 <small class="text-[14px] font-semibold text-[#65708a]">（可多选）</small>
					</h2>
					<button
						type="button"
						class="inline-flex items-center gap-1 text-[14px] font-bold text-primary"
					>
						全部风格 <ChevronRight class="size-4" />
					</button>
				</div>

				<form.Subscribe selector={(state) => state.values.styleIds}>
					{#snippet children(styleIds)}
						<div class="mt-5 grid grid-cols-6 gap-6">
							{#each productStyles as style (style.id)}
								<button
									type="button"
									onclick={() => toggleStyle(style.id)}
									class="group text-center"
								>
									<span
										class={`relative block aspect-square overflow-hidden rounded-[8px] border bg-[#f7f8fc] transition ${styleIds.includes(style.id) ? 'border-primary ring-1 ring-primary' : 'border-transparent group-hover:border-primary/40'}`}
									>
										<img
											src={style.image}
											alt={style.name}
											class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
										/>
										{#if styleIds.includes(style.id)}
											<span
												class="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-white shadow-[0_8px_16px_rgba(91,61,245,0.25)]"
											>
												<Check class="size-4 stroke-[3]" />
											</span>
										{/if}
									</span>
									<span class="mt-3 block text-[14px] font-semibold text-[#172033]"
										>{style.name}</span
									>
								</button>
							{/each}
						</div>
					{/snippet}
				</form.Subscribe>
			</section>

			<section class="mt-9">
				<h2 class="flex items-center gap-4 text-[18px] font-black text-[#121826]">
					<span
						class="grid size-7 place-items-center rounded-full bg-primary text-[14px] font-black text-white shadow-[0_8px_18px_rgba(91,61,245,0.28)]"
						>4</span
					>
					图片设置
				</h2>

				<div class="mt-5 grid grid-cols-[1fr_1fr_1fr_168px] gap-4">
					<form.Field name="aspectRatio">
						{#snippet children(field)}
							<label class="rounded-[8px] border border-[#e0e5f4] bg-white p-3">
								<span class="block text-[14px] font-black text-[#172033]">图片比例</span>
								<span class="relative mt-2 block">
									<select
										value={field.state.value}
										onchange={(event) =>
											field.handleChange((event.currentTarget as HTMLSelectElement).value)}
										onblur={field.handleBlur}
										class="h-10 w-full appearance-none rounded-[6px] border border-[#cfd6ea] bg-white px-3 pr-9 text-[14px] font-medium text-[#30405f] outline-none focus:border-primary"
									>
										<option value="1:1">1:1 (正方形)</option>
										<option value="4:5">4:5 (竖版)</option>
										<option value="16:9">16:9 (横版)</option>
									</select>
									<ChevronDown
										class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#65708a]"
									/>
								</span>
							</label>
						{/snippet}
					</form.Field>

					<form.Field name="size">
						{#snippet children(field)}
							<label class="rounded-[8px] border border-[#e0e5f4] bg-white p-3">
								<span class="block text-[14px] font-black text-[#172033]">图片尺寸</span>
								<span class="relative mt-2 block">
									<select
										value={field.state.value}
										onchange={(event) =>
											field.handleChange((event.currentTarget as HTMLSelectElement).value)}
										onblur={field.handleBlur}
										class="h-10 w-full appearance-none rounded-[6px] border border-[#cfd6ea] bg-white px-3 pr-9 text-[14px] font-medium text-[#30405f] outline-none focus:border-primary"
									>
										<option value="1024x1024">1024 × 1024</option>
										<option value="1024x1536">1024 × 1536</option>
										<option value="1536x1024">1536 × 1024</option>
									</select>
									<ChevronDown
										class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#65708a]"
									/>
								</span>
							</label>
						{/snippet}
					</form.Field>

					<form.Field name="count">
						{#snippet children(field)}
							<label class="rounded-[8px] border border-[#e0e5f4] bg-white p-3">
								<span class="block text-[14px] font-black text-[#172033]">生成数量</span>
								<span class="relative mt-2 block">
									<select
										value={field.state.value}
										onchange={(event) =>
											field.handleChange(Number((event.currentTarget as HTMLSelectElement).value))}
										onblur={field.handleBlur}
										class="h-10 w-full appearance-none rounded-[6px] border border-[#cfd6ea] bg-white px-3 pr-9 text-[14px] font-medium text-[#30405f] outline-none focus:border-primary"
									>
										<option value={1}>1 张</option>
										<option value={2}>2 张</option>
										<option value={4}>4 张</option>
									</select>
									<ChevronDown
										class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#65708a]"
									/>
								</span>
							</label>
						{/snippet}
					</form.Field>

					<button
						type="button"
						class="flex items-center justify-center gap-2 rounded-[8px] border border-[#e0e5f4] bg-white text-[14px] font-black text-[#30405f] transition hover:border-primary hover:text-primary"
					>
						<SlidersHorizontal class="size-4" />
						高级设置
					</button>
				</div>
			</section>

			{#if error}
				<p class="mt-5 rounded-[9px] bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600">
					{error}
				</p>
			{/if}

			<form.Subscribe
				selector={(state) => ({ count: state.values.count, isSubmitting: state.isSubmitting })}
			>
				{#snippet children(state)}
					<div class="mt-9 flex items-center justify-center gap-6">
						<button
							disabled={state.isSubmitting}
							class="h-12 w-[540px] rounded-[7px] bg-primary text-[16px] font-black text-white shadow-[0_18px_32px_rgba(91,61,245,0.24)] transition hover:bg-[#4d30e7] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{state.isSubmitting ? '正在创建任务...' : '立即生成'}
						</button>
						<span class="inline-flex items-center gap-2 text-[14px] font-bold text-[#65708a]">
							<Coins class="size-4 text-amber-500" />消耗 {state.count * 2} 积分
						</span>
					</div>
				{/snippet}
			</form.Subscribe>
		</form>

		<aside class="space-y-5">
			<section
				class="rounded-[18px] border border-[#e1e5f2] bg-white p-6 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
			>
				<h2 class="flex items-center gap-2 text-[17px] font-black text-[#121826]">
					上传参考图 <span class="text-[14px] font-semibold text-[#65708a]">（可选）</span>
					<CircleHelp class="size-4 text-[#8b95aa]" />
				</h2>
				<label
					class="mt-4 grid h-[184px] cursor-pointer place-items-center overflow-hidden rounded-[10px] border border-dashed border-primary/45 bg-[#fbfaff] text-center transition hover:border-primary"
				>
					{#if preview}
						<img src={preview} alt="上传预览" class="size-full object-contain" />
					{:else}
						<span class="px-8 text-[14px] font-semibold text-[#26324a]">
							<ImagePlus class="mx-auto mb-7 size-8 text-primary" />
							点击上传或拖拽图片到这里
							<small class="mt-3 block text-[12px] font-medium text-[#8994aa]"
								>支持 JPG、PNG 格式，大小不超过 10MB</small
							>
						</span>
					{/if}
					<input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectFile}
					/>
				</label>
			</section>

			<section
				class="rounded-[18px] border border-[#e1e5f2] bg-white p-6 shadow-[0_18px_50px_rgba(61,72,120,0.06)]"
			>
				<h2 class="text-[17px] font-black text-[#121826]">生成建议</h2>
				<ul
					class="mt-5 space-y-4 border-b border-[#e5e9f4] pb-7 text-[14px] font-medium text-[#65708a]"
				>
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary"
						>
							<Info class="size-3.5" />
						</span>
						描述越详细，生成效果越贴近需求
					</li>
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary"
						>
							<Info class="size-3.5" />
						</span>
						建议包含商品材质、颜色、风格等关键信息
					</li>
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 grid size-5 place-items-center rounded-full bg-primary/10 text-primary"
						>
							<Info class="size-3.5" />
						</span>
						参考图生成效果更稳定
					</li>
				</ul>

				<h2 class="mt-7 text-[17px] font-black text-[#121826]">示例描述</h2>
				<div class="mt-5 space-y-3">
					{#each examples as item (item.tag)}
						<button
							type="button"
							onclick={() => form.setFieldValue('prompt', item.text)}
							class="w-full rounded-[8px] border border-[#e1e5f2] bg-white px-4 py-4 text-left text-[14px] font-semibold leading-6 text-[#34405a] transition hover:border-primary/60 hover:bg-primary/5"
						>
							{item.text}
							<span class="mt-2 block text-[13px] font-black text-primary">{item.tag}</span>
						</button>
					{/each}
				</div>

				<button
					type="button"
					class="mx-auto mt-8 flex h-9 items-center gap-2 text-[14px] font-black text-primary"
				>
					换一换 <RefreshCw class="size-4" />
				</button>
			</section>

			{#if activeJob}
				<JobCard initialJob={activeJob} />
			{/if}
		</aside>
	</div>
</div>
