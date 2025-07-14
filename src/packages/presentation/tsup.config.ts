import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'view-models/index': 'src/view-models/index.ts',
  },

  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  splitting: true,
  tsconfig: './tsconfig.build.json',
})
