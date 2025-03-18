import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import generateFile from 'vite-plugin-generate-file'
import { visualizer } from 'rollup-plugin-visualizer'

const getMetaData = () => {
  const pk = require('./package')
  const [version, build] = pk.version.split('-')
  return { version, build }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (mode === 'development') {
    return {
      plugins: [react()],
      server: {
        port: 2001,
        open: false // 自動開啟瀏覽器
      }
    }
  } else if (mode === 'production') {
    return {
      base: './', // index.html中產生相對路徑
      plugins: [
        react(),
        viteStaticCopy({ // 複製檔案範例
          targets: []
        }),
        generateFile([{
          type: 'json',
          output: './Info.json',
          data: getMetaData()
        }]),
        visualizer({
          open: false // 開啟後會在瀏覽器中顯示
        })
      ],
      build: {
        outDir: 'dist', // 打包輸出目錄
        assetsDir: 'assets', // 資源的目錄
        rollupOptions: {
          output: {
            chunkFileNames: '[name].[hash].js', // 類似 Webpack 的 chunkFilename
            entryFileNames: '[name].[hash].js', // 類似 Webpack 的 filename
            assetFileNames: '[name].[hash][extname]', // 類似 Webpack 的 assetModuleFilename
            manualChunks (id) {
              if (id.includes('node_modules')) {
                return 'vendor' // 拆分第三方模塊
              }
            }
          }
        },
        cssCodeSplit: true, // 啟用 CSS 拆分
        minify: 'terser', // 使用 Terser 來壓縮 JS
        cssMinify: true // Vite 會自動壓縮 CSS
      }
    }
  }
})
