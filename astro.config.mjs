import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Hosting di GitHub Pages dengan alamat /nama-repo/ ? Tambahkan: base: '/nama-repo'
export default defineConfig({
  integrations: [react()],
});
