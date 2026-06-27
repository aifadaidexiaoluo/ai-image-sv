<script lang="ts">
	let {
		class: className = 'size-9',
		title = 'DesignAI'
	}: {
		class?: string;
		title?: string;
	} = $props();
</script>

<svg
	class={className}
	viewBox="0 0 48 48"
	role="img"
	aria-label={title}
	xmlns="http://www.w3.org/2000/svg"
>
	<defs>
		<linearGradient
			id="designai-logo-bg"
			x1="7"
			x2="42"
			y1="5"
			y2="43"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#8f7bff" />
			<stop offset="0.55" stop-color="#5b3df5" />
			<stop offset="1" stop-color="#2d1bc8" />
		</linearGradient>
		<linearGradient
			id="designai-logo-card"
			x1="15"
			x2="33"
			y1="16"
			y2="35"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#ffffff" />
			<stop offset="1" stop-color="#dfe6ff" />
		</linearGradient>
	</defs>
	<rect width="48" height="48" rx="14" fill="url(#designai-logo-bg)" />
	<path
		d="M13 19.5c0-3.6 2.9-6.5 6.5-6.5H29"
		fill="none"
		stroke="white"
		stroke-linecap="round"
		stroke-width="3.5"
		opacity="0.92"
	/>
	<path
		d="M35 28.5c0 3.6-2.9 6.5-6.5 6.5H19"
		fill="none"
		stroke="white"
		stroke-linecap="round"
		stroke-width="3.5"
		opacity="0.92"
	/>
	<rect
		x="16"
		y="17"
		width="16"
		height="18"
		rx="5"
		fill="url(#designai-logo-card)"
		stroke="white"
		stroke-opacity="0.55"
	/>
	<path d="M20 30.5l3.2-4.1 2.2 2.6 1.7-2.1 2.9 3.6H20z" fill="#5b3df5" opacity="0.86" />
	<circle cx="21" cy="22.5" r="1.8" fill="#735cff" opacity="0.9" />
	<path
		d="M34.8 10.5l1 3 3 .9-3 .9-1 3.2-.9-3.2-3-.9 3-.9.9-3zM10.9 32.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"
		fill="white"
	/>
</svg>
