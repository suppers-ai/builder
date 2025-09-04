import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174,
		proxy: {
			'/api': {
				target: 'http://localhost:8091',
				changeOrigin: true,
				secure: false,
				ws: true,
				rewrite: (path) => path
			}
		}
	}
});