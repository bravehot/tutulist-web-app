import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import { resolve } from "path";

import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
// import viteImagemin from "vite-plugin-imagemin";
import { visualizer } from "rollup-plugin-visualizer";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin(),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
    // 在流水线中下载失败
    // viteImagemin({
    //   optipng: {
    //     optimizationLevel: 4,
    //   },
    // }),
    visualizer(),
    mkcert(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "/src"),
    },
  },
  server: {
    https: true,
    proxy: {
      // 本地开发环境
      "^/api/.*": {
        target: "http://127.0.0.1:7001",
      },

      // 测试环境
      // "^/api/.*": {
      //   target: "http://dev.tutulist.cn",
      // },

      // 生产环境
      // "^/api/.*": {
      //   secure: false,
      //   target: "https://api.tutulist.cn",
      //   changeOrigin: true,
      // },
    },
  },
});
