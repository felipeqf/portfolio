import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            '@images': 'src/content/projects/images'
        }
    },

    assetsInclude: ['**/*.md','**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
});