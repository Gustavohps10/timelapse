import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: 'src/presentation/main/index.ts',
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        input: 'src/presentation/preload/index.ts',
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: 'src/presentation/renderer',
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/presentation/renderer/index.html'),
      },
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/presentation/renderer/src'),
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
})
