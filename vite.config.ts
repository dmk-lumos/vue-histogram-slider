import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/lib/entry.ts', 'src/lib/HistogramSlider.vue', 'src/lib/histogram-slider.types.ts'],
      outDir: 'dist',
      strictOutput: true,
      copyDtsFiles: false
    })
  ],
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
      entry: fileURLToPath(new URL('./src/lib/entry.ts', import.meta.url)),
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
