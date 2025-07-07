import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/contracts/index.ts',
    'src/services/index.ts',
    'src/dto/index.ts',
    'src/workflow/index.ts',
    'src/strategies/index.ts',
  ],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  splitting: true,
  tsconfig: './tsconfig.build.json',
})
