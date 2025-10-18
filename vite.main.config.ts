import { builtinModules } from 'module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/main/main.ts',
      formats: ['es'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((mod) => `node:${mod}`),
      ],
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@main': path.resolve(__dirname, 'src', 'main'),
      '@preload': path.resolve(__dirname, 'src', 'preload'),
    },
  },
});
