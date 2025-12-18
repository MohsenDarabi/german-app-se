// TODO[WEB-BOOT-01]: Vite Konfiguration minimal halten
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [sveltekit()] });
