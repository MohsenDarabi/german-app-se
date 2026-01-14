import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    }),
    serviceWorker: {
      register: false,
    },
    prerender: {
      // Ignore 404 errors for links during prerendering (SPA mode handles them client-side)
      handleHttpError: ({ path, referrer, message }) => {
        // Ignore missing pages - they'll be handled by client-side router
        if (message.includes('Not found')) {
          console.warn(`Ignoring missing page during prerender: ${path} (linked from ${referrer})`);
          return;
        }
        // Throw on other errors
        throw new Error(message);
      }
    }
  },
  preprocess: vitePreprocess(),
}

export default config
