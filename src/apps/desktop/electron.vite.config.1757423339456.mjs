// electron.vite.config.ts
import image from "@rollup/plugin-image";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { readdirSync } from "fs";
import { resolve } from "path";
var __electron_vite_injected_dirname = "C:\\myapps\\code\\timelapse\\src\\apps\\desktop";
var uiSubpaths = readdirSync(resolve(__electron_vite_injected_dirname, "../../packages/ui/src"), {
  withFileTypes: true
}).filter((dirent) => dirent.isDirectory()).map((dirent) => `@timelapse/ui/${dirent.name}`);
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    },
    build: {
      rollupOptions: {
        input: "src/main/index.ts"
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    },
    build: {
      rollupOptions: {
        input: "src/preload/index.ts"
      }
    }
  },
  renderer: {
    root: "src/renderer",
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      },
      dedupe: ["react", "react-dom", "react-router", "react-router-dom"]
    },
    optimizeDeps: {
      exclude: ["@timelapse/ui", ...uiSubpaths]
    },
    plugins: [react(), tailwindcss(), image()],
    build: {
      sourcemap: true,
      rollupOptions: {
        input: resolve(__electron_vite_injected_dirname, "src/renderer/index.html")
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
