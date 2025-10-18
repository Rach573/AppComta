import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, 'src', 'renderer'),
  base: './',
  plugins: [vue()],
  build: {
    // Laisser le plugin Forge générer dans .vite/renderer en mode package
  },
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src', 'renderer'),
      '@main': path.resolve(__dirname, 'src', 'main'),
      '@preload': path.resolve(__dirname, 'src', 'preload'),
      '@shared': path.resolve(__dirname, 'src', 'shared'),
    },
  },
  server: {
    port: 3000,
  },
});
