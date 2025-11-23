/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  server: {
    fs: {
      // 允许访问项目根目录外的文件
      strict: false,
    },
    // 确保正确处理中文路径
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  publicDir: false, // 禁用默认publicDir，因为我们使用自定义静态资源处理
  build: {
    // 确保静态资源正确处理
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 处理文件名中的特殊字符
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  // 自定义静态资源中间件
  configureServer(server) {
    server.middlewares.use('/media', (req, res, next) => {
      // 确保正确处理中文URL
      if (req.url) {
        try {
          // 解码URL中的中文字符
          req.url = decodeURIComponent(req.url);
        } catch (error) {
          console.warn('URL解码失败:', error);
        }
      }
      next();
    });
  },
});
