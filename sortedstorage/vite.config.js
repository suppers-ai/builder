import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174,
		proxy: {
			'/api': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				ws: true,
				rewrite: (path) => path
			},
			'/auth': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path
			},
			'/admin': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path
			},
			'/profile': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path
			},
			'/ext': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path
			},
			'/_app': {
				target: 'http://localhost:8095',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path
			}
		}
	}
});