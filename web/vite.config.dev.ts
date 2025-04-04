import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';

const data = JSON.parse(readFileSync('../dist/assets/data.json', 'utf-8'));

export default defineConfig({
  plugins: [tailwindcss()],
  define: {
    'import.meta.env.REPOS': JSON.stringify(data),
  },
});
