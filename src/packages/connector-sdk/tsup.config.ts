// packages/connector-sdk/tsup.config.ts

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  splitting: true,
  tsconfig: './tsconfig.build.json',

  noExternal: [
    '@timelapse/application',
    '@timelapse/cross-cutting',
    '@timelapse/domain',
    '@timelapse/presentation',
  ],
})
