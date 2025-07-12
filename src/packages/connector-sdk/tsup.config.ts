import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'contracts/index': 'src/contracts/index.ts',
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
