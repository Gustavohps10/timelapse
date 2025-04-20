import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

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
    root: 'src/ui',
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/ui/index.html'),
      },
    },
    resolve: {
      alias: {
        // '@renderer': resolve('src/presentation/renderer/src'),
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
})
