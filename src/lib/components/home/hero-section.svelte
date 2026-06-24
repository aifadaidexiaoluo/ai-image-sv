<script lang="ts">
	import { ArrowRight, CirclePlay, Image, Play, Sparkles, WandSparkles, Zap } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';
	import { productImages } from './home-content';

	let activeImage = $state(0);
	let videoOpen = $state(false);

	const features = [
		{
			icon: Sparkles,
			title: m.home_feature_generate(),
			description: m.home_feature_generate_desc()
		},
		{
			icon: Image,
			title: m.home_feature_templates(),
			description: m.home_feature_templates_desc()
		},
		{
			icon: WandSparkles,
			title: m.home_feature_retouch(),
			description: m.home_feature_retouch_desc()
		},
		{ icon: Zap, title: m.home_feature_commerce(), description: m.home_feature_commerce_desc() }
	];
</script>

<section
	class="relative overflow-hidden bg-[radial-gradient(circle_at_68%_30%,#e8e3ff_0,transparent_34%),linear-gradient(135deg,#fff_8%,#f8f7ff_56%,#f0edff_100%)] pt-12 pb-8"
>
	<div
		class="pointer-events-none absolute top-14 left-[58%] size-[430px] rounded-full border border-white/90 bg-white/20 shadow-[0_0_100px_rgba(111,82,255,.16)]"
	></div>
	<div class="home-container relative grid min-h-[520px] grid-cols-[46%_54%] items-center">
		<div class="relative z-10 pr-8">
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f0edff] px-4 py-2 text-xs font-semibold text-primary"
			>
				<Sparkles class="size-3.5" />
				{m.home_eyebrow()}
			</div>
			<h1 class="text-[48px] leading-[1.14] font-extrabold tracking-[-0.045em] text-[#101522]">
				{m.home_hero_title_line1()}<br />{m.home_hero_title_line2()}<span
					class="bg-gradient-to-r from-[#6e4fff] to-[#4d2ce2] bg-clip-text text-transparent"
					>{m.home_hero_title_accent()}</span
				>
			</h1>
			<p class="mt-5 max-w-[520px] text-[14px] leading-7 text-[#667085]">
				{m.home_hero_description()}
			</p>
			<div class="mt-8 flex items-center gap-4">
				<a
					href="/ai-design"
					class="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,61,245,.27)] transition hover:-translate-y-0.5 hover:bg-[#4f31dc]"
				>
					{m.home_start_design()}
					<ArrowRight class="size-4" />
				</a>
				<button
					type="button"
					onclick={() => (videoOpen = true)}
					class="inline-flex h-12 items-center gap-2 rounded-xl border border-[#eceaf5] bg-white px-7 text-sm font-semibold text-[#293149] shadow-sm transition hover:border-primary/30 hover:text-primary"
				>
					<CirclePlay class="size-4 text-primary" />
					{m.home_watch_video()}
				</button>
			</div>
		</div>

		<div class="relative h-[490px]">
			<div
				class="absolute inset-6 overflow-hidden rounded-[44px] bg-white/40 shadow-[0_34px_90px_rgba(75,55,170,.16)] ring-1 ring-white/80"
			>
				<img
					src={productImages[activeImage]}
					alt="AI 生成的商品展示图"
					class="size-full object-cover transition duration-500"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-[#40307c]/8 via-transparent to-white/8"
				></div>
			</div>

			<div
				class="absolute top-4 left-0 w-[184px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(79,55,180,.12)] backdrop-blur-xl"
			>
				<div class="flex items-center gap-2 text-xs font-bold text-primary">
					<Sparkles class="size-4" /> AI
				</div>
				<p class="mt-3 text-xs font-semibold text-[#30384d]">{m.home_generating()}</p>
				<div class="mt-3 flex items-center gap-2">
					<span class="h-1.5 w-24 overflow-hidden rounded-full bg-[#e5e0ff]"
						><span class="block h-full w-4/5 rounded-full bg-primary"></span></span
					><span class="text-[10px] text-[#81889c]">80%</span>
				</div>
			</div>

			<div
				class="absolute right-0 bottom-24 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(79,55,180,.12)] backdrop-blur-xl"
			>
				<p class="text-xs font-semibold text-[#50586c]">{m.home_conversion()}</p>
				<div class="mt-2 flex items-end gap-3">
					<strong class="text-[25px] text-[#121726]">+38%</strong><svg
						aria-hidden="true"
						viewBox="0 0 68 30"
						class="h-8 w-16 text-primary"
						><path
							d="M2 27 15 17l10 6 12-14 10 8L66 2"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/></svg
					>
				</div>
			</div>

			<div
				class="absolute right-12 bottom-0 flex gap-2 rounded-2xl border border-white/90 bg-white/80 p-2 shadow-lg backdrop-blur-xl"
			>
				{#each productImages.slice(0, 3) as image, index (image)}
					<button
						type="button"
						aria-label={`查看商品图 ${index + 1}`}
						aria-pressed={activeImage === index}
						onclick={() => (activeImage = index)}
						class="size-14 overflow-hidden rounded-xl border-2 transition"
						class:border-primary={activeImage === index}
						class:border-transparent={activeImage !== index}
					>
						<img src={image} alt="" class="size-full object-cover" />
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="home-container relative mt-2 grid grid-cols-4 border-t border-white/80 pt-7">
		{#each features as feature (feature.title)}
			<div class="flex items-center gap-3 border-r border-[#ebe9f5] px-5 last:border-0 first:pl-0">
				<div class="grid size-10 place-items-center rounded-xl bg-[#f0edff] text-primary">
					<feature.icon class="size-5" />
				</div>
				<div>
					<h3 class="text-sm font-semibold text-[#202638]">{feature.title}</h3>
					<p class="mt-1 text-xs text-[#8a90a1]">{feature.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<Dialog.Root bind:open={videoOpen}>
	<Dialog.Content class="max-w-2xl overflow-hidden p-0">
		<div class="relative aspect-video bg-[radial-gradient(circle_at_center,#8170ff,#2b225c)]">
			<img
				src={productImages[0]}
				alt="DesignAI 商品图工作流预览"
				class="size-full object-cover opacity-55"
			/>
			<div class="absolute inset-0 grid place-items-center">
				<div
					class="grid size-20 place-items-center rounded-full bg-white/90 text-primary shadow-2xl"
				>
					<Play class="ml-1 size-8 fill-current" />
				</div>
			</div>
		</div>
		<Dialog.Header class="p-6">
			<Dialog.Title>{m.home_video_title()}</Dialog.Title>
			<Dialog.Description>{m.home_video_description()}</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
