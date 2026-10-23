import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { bats: 'src/index.ts' },
  format: ['esm', 'cjs', 'iife'],
  globalName: 'Bats',
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  outExtension({ format }) {
    if (format === 'cjs') return { js: '.cjs' };
    if (format === 'iife') return { js: '.global.js' };
    return { js: '.js' };
  },
});
