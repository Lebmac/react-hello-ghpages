import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-hello-ghpages/',
  define: {
    VITE_BUILD_DATE: JSON.stringify(new Date().toISOString())
  },
})
