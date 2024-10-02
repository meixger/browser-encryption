import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [],
  build: {
    minify: false,
    modulePreload: {
      polyfill: false
    }
  },
})
