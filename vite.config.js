import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' uses relative paths — works for both user pages (username.github.io)
// and project pages (username.github.io/repo-name) on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          p5: ['p5'],
        },
      },
    },
  },
})
