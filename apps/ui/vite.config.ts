import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@archi-logi-gt/dtos': path.resolve(__dirname, '../../packages/dtos/dist')
    }
  },
  optimizeDeps: {
    exclude: ['@nestjs/mapped-types', 'class-transformer', 'class-validator']
  },
  build: {
    rollupOptions: {
      external: [
        'class-transformer',
        'class-transformer/storage',
        '@nestjs/mapped-types'
      ]
    }
  }
})
