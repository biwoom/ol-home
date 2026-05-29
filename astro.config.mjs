// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

export default defineConfig({
  // GitHub Pages URL
  site: 'https://biwoom.github.io',

  // 저장소 이름
  base: '/ol-home',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
});