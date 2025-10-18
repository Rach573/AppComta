import { builtinModules } from 'module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    sourcemap: true,
    // Laisser le plugin Forge gérer l'outDir (sortie attendue: .vite/preload)
    lib: {
      entry: 'src/preload/preload.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((mod) => `node:${mod}`),
      ],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@main': path.resolve(__dirname, 'src', 'main'),
    },
  },
});
