import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib/HistogramSlider.vue', import.meta.url)),
      name: 'VueHistogramSlider',
      fileName: (format) =>
        format === 'es' ? 'histogram-slider.mjs' : 'histogram-slider.umd.min.js',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      /** Keep Ion.RangeSlider jQuery plugin (`import './range-slider'`); see package.json `sideEffects`. */
      treeshake: {
        moduleSideEffects(id) {
          return id.includes('range-slider') || id.endsWith('.css')
        }
      },
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    sourcemap: true
  }
})
