// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';

import mdx from '@astrojs/mdx';

export default defineConfig({
  // GitHub Pages URL
  site: 'https://biwoom.github.io',

  // 저장소 이름
  base: '/ol-home',

  markdown: {
    remarkPlugins: [remarkGfm],
    remarkRehype: {
      footnoteLabel: '각주',
      footnoteBackLabel: '본문으로 돌아가기',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
});