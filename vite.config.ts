
import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $src: path.resolve('./src'),
      $routes: path.resolve('./src/routes')
    }
  }
});

