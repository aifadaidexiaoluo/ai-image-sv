<script lang="ts">
	import {
		CapabilitiesSection,
		CaseStudies,
		HeroSection,
		HomeFooter,
		HomeHeader,
		MetricsStrip,
		TemplateGallery,
		WorkflowSteps
	} from '$lib/components/home';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<div class="home-page overflow-hidden">
	<HomeHeader account={data.account} />
	<main>
		<HeroSection />
		<WorkflowSteps />
		<TemplateGallery />
		<CaseStudies />
		<MetricsStrip />
		<CapabilitiesSection />
	</main>
	<HomeFooter />
</div>
