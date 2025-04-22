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
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@Ioc': resolve(__dirname, 'src/Ioc'),
        '@entities': resolve(__dirname, 'src/domain/entities'),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: 'src/presentation/preload/index.ts',
      },
    },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@Ioc': resolve(__dirname, 'src/Ioc'),
        '@entities': resolve(__dirname, 'src/domain/entities'),
      },
    },
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
        '@': resolve(__dirname, 'src'),
        '@Ioc': resolve(__dirname, 'src/Ioc'),
        '@entities': resolve(__dirname, 'src/domain/entities'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
})
