
import { mdsvex } from 'mdsvex';

import adapter_vercel from '@sveltejs/adapter-vercel'
import preprocess from 'svelte-preprocess'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


// import { mdsvex } from 'mdsvex'
// import remarkAttr from 'remark-attr'
// import rehypeSlug from 'rehype-slug'

import { config as dotenvconf } from "dotenv"
dotenvconf()

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md', '.mdoc', '.markdoc'], // adding .md here screws up vite meta glob import
  preprocess: [
    mdsvex({
      extensions: ['.md', '.svx'],
    }),
    vitePreprocess(),
    preprocess({
      postcss: true,
    }),
  ],

  kit: {
    adapter: adapter_vercel({}),
  },
};

export default config;

