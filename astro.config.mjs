import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Hosting di GitHub Pages dengan alamat /nama-repo/ ? Tambahkan: base: '/nama-repo'
export default defineConfig({
  integrations: [react()],
  // Astro hanya mengekspos variabel berawalan PUBLIC_. VITE_ ditambahkan agar VITE_GAS_WEBAPP_URL terbaca di browser.
  vite: { envPrefix: ['PUBLIC_', 'VITE_'] },
});
