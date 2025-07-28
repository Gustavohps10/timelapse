import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles/globals.css'],

  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  loader: {
    '.css': 'copy',
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.gif': 'dataurl',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic'
    return options
  },
  tsconfig: './tsconfig.build.json',
})
