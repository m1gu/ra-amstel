import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/amstel/',  // Subdirectory on comuna.com.ec — change to '/' when amstel.ec is parked
})
