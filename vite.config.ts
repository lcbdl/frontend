import tailwindcss from "@tailwindcss/vite";
import path from "path";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tailwindcss(),
      solidPlugin(),
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
    ],
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:8080/app",
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ""),
          //ws: true,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (__proxyReq, req, _res) => {
              console.log("Sending Request to the Target:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    esbuild: {
      minifyIdentifiers: false,
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/index.js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
      coverage: {
        reportsDirectory: "dist/coverage",
        reporter: ["text", "html"],
        exclude: [
          "src/**/*.test.tsx",
          "src/**/*.test.ts",
          "src/**/*.stories.tsx",
          "src/**/*.stories.ts",
          "src/**/*.stories.js",
          "src/**/*.stories.jsx",
          "src/i18n/**",
          "src/types/**",
          "**/node_modules/**",
          "**/dist/**",
          "**/build/**",
          "**/coverage/**",
          "**/public/**",
          "**/tests/**",
          "eslint.config.js",
          "vite.config.ts",
          "prettier.config.js",
          "src/**/*.element.tsx",
          "src/index.tsx",
          "src/layout.tsx",
          "src/routes.tsx",
          "src/pages/components.page.tsx",
        ],
      },
    },
  };
});
