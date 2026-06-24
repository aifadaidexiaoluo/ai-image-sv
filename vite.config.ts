import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Server modules and the standalone worker share process.env. Vite normally loads
	// .env values only into import.meta.env, so expose them to SSR modules as well.
	Object.assign(process.env, loadEnv(mode, '.', ''));

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter(),
				typescript: {
					config: (config) => ({
						...config,
						include: [...config.include, '../drizzle.config.ts']
					})
				}
			}),
			paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
		]
	};
});
