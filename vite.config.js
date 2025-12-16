
// vite.config.js - FIXED VERSION
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Change this to your actual repository name
  build: {
    outDir: 'dist',
  }
})