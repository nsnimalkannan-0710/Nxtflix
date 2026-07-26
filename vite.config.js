import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Spec requires: dev server on port 3000, build output folder "build"
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
})
