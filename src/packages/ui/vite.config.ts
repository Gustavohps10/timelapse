import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      rollupTypes: true,
    }),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/styles/*.css',
          dest: 'styles',
        },
        {
          src: 'src/assets/*',
          dest: 'assets',
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
