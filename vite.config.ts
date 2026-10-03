import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({ plugins: [sveltekit(), SvelteKitPWA({ registerType: 'autoUpdate', manifest: { name: 'Navyuvak Chhath Puja Samiti', short_name: 'Chhath Puja', description: 'Chhath Puja community transparency portal', theme_color: '#F27A1A', background_color: '#0b1020', display: 'standalone', start_url: '/', scope: '/', icons: [{ src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }, { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }] }, workbox: { importScripts: ['/push-sw.js'] } })] });