import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		
		// PWA support
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: 'SortedStorage',
				short_name: 'SortedStorage',
				description: 'Secure cloud storage solution',
				theme_color: '#1e40af',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\./,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 5 // 5 minutes
							}
						}
					},
					{
						urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					}
				]
			}
		}),
		
		// Gzip and Brotli compression
		compression({
			algorithm: 'gzip',
			ext: '.gz'
		}),
		compression({
			algorithm: 'brotliCompress',
			ext: '.br'
		}),
		
		// Bundle visualization (only in analyze mode)
		process.env.ANALYZE && visualizer({
			emitFile: true,
			filename: 'stats.html',
			open: true,
			gzipSize: true,
			brotliSize: true
		})
	].filter(Boolean),
	
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/lib/components'),
			$stores: path.resolve('./src/lib/stores'),
			$utils: path.resolve('./src/lib/utils'),
			$api: path.resolve('./src/lib/api'),
			$types: path.resolve('./src/lib/types')
		}
	},
	
	build: {
		target: 'esnext',
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: process.env.NODE_ENV === 'production',
				drop_debugger: true,
				pure_funcs: ['console.log', 'console.info', 'console.debug'],
				passes: 2
			},
			mangle: {
				safari10: true
			},
			format: {
				comments: false
			}
		},
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Vendor chunks
					if (id.includes('node_modules')) {
						if (id.includes('svelte') || id.includes('@sveltejs')) {
							return 'vendor-svelte';
						}
						if (id.includes('lucide')) {
							return 'vendor-icons';
						}
						if (id.includes('chart') || id.includes('d3')) {
							return 'vendor-charts';
						}
						return 'vendor';
					}
					
					// App chunks
					if (id.includes('src/lib/components')) {
						if (id.includes('modals')) return 'components-modals';
						if (id.includes('common')) return 'components-common';
						return 'components';
					}
					
					if (id.includes('src/lib/stores')) {
						return 'stores';
					}
					
					if (id.includes('src/lib/api')) {
						return 'api';
					}
				},
				chunkFileNames: (chunkInfo) => {
					const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
					return `assets/js/${chunkInfo.name}-[hash].js`;
				},
				entryFileNames: 'assets/js/[name]-[hash].js',
				assetFileNames: (assetInfo) => {
					const extType = assetInfo.name.split('.').pop();
					if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
						return `assets/images/[name]-[hash][extname]`;
					}
					if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
						return `assets/fonts/[name]-[hash][extname]`;
					}
					if (/css/i.test(extType)) {
						return `assets/css/[name]-[hash][extname]`;
					}
					return `assets/[name]-[hash][extname]`;
				}
			}
		},
		reportCompressedSize: true,
		chunkSizeWarningLimit: 1000,
		sourcemap: process.env.NODE_ENV !== 'production'
	},
	
	optimizeDeps: {
		include: ['svelte', '@sveltejs/kit'],
		exclude: ['@sveltejs/kit/node']
	},
	
	server: {
		port: 5173,
		host: true,
		fs: {
			allow: ['..']
		}
	},
	
	preview: {
		port: 4173,
		host: true
	},
	
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
		'__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
	}
});