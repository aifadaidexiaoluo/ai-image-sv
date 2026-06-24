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
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<div class="home-page min-w-[1180px] overflow-hidden">
	<HomeHeader />
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
