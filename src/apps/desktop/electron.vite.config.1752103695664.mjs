// electron.vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import { resolve } from "path";
var __electron_vite_injected_dirname = "C:\\myapps\\trackpoint\\src\\apps\\desktop";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: "src/main/index.ts",
        output: {
          format: "es"
        }
      }
    },
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: "src/preload/index.ts"
      }
    },
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  renderer: {
    root: "src/renderer",
    build: {
      rollupOptions: {
        input: resolve(__electron_vite_injected_dirname, "src/renderer/index.html")
      }
    },
    resolve: {
      alias: {
        react: resolve(__electron_vite_injected_dirname, "../../../node_modules/react"),
        "react-dom": resolve(__electron_vite_injected_dirname, "../../../node_modules/react-dom"),
        "react/jsx-runtime": resolve(
          __electron_vite_injected_dirname,
          "../../../node_modules/react/jsx-runtime"
        ),
        "@": resolve(__electron_vite_injected_dirname, "src")
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@trackpoint/ui",
        "@trackpoint/ui/hooks",
        "@trackpoint/ui/components",
        "@trackpoint/ui/providers",
        "@trackpoint/ui/pages",
        "@trackpoint/ui/layouts",
        "@trackpoint/ui/utils",
        "@trackpoint/ui/lib",
        "@trackpoint/ui/client",
        "@trackpoint/ui/assets"
      ]
    },
    optimizeDeps: {
      exclude: ["@trackpoint/ui"]
    },
    plugins: [react(), tailwindcss()]
  }
});
export {
  electron_vite_config_default as default
};
