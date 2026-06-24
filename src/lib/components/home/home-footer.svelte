<script lang="ts">
	import { MessageCircle, Music2, Radio, Share2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from './brand-logo.svelte';
	import { footerGroups } from './home-content';

	const socialIcons = [MessageCircle, Radio, Share2, Music2];
</script>

<footer class="border-t border-[#eeecf5] bg-white py-12">
	<div class="home-container">
		<div class="grid grid-cols-2 gap-9 sm:grid-cols-3 lg:grid-cols-[1.55fr_repeat(4,1fr)_0.8fr]">
			<div>
				<BrandLogo />
				<p class="mt-5 max-w-[260px] text-xs leading-6 text-[#7a8295]">
					{m.home_footer_description()}
				</p>
			</div>
			{#each footerGroups as group (group.title)}
				<div>
					<h3 class="text-sm font-semibold text-[#293044]">{group.title}</h3>
					<ul class="mt-4 space-y-2.5">
						{#each group.links as link (`${link.href}:${link.label}`)}<li>
								<a href={link.href} class="text-xs text-[#737b8e] hover:text-primary"
									>{link.label}</a
								>
							</li>{/each}
					</ul>
				</div>
			{/each}
			<div>
				<h3 class="text-sm font-semibold text-[#293044]">{m.home_footer_follow()}</h3>
				<div class="mt-5 flex gap-2.5">
					{#each socialIcons as Icon}<a
							href="/"
							aria-label="社交媒体"
							class="grid size-8 place-items-center rounded-full bg-[#f0edff] text-primary transition hover:bg-primary hover:text-white"
							><Icon class="size-4" /></a
						>{/each}
				</div>
			</div>
		</div>
		<div
			class="mt-10 flex items-center justify-center border-t border-[#f0eef6] pt-7 text-[11px] text-[#9298a8]"
		>
			{m.home_footer_copyright()}
		</div>
	</div>
</footer>
