import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag', '**/*.glb', '**/*.gltf'],
  build: {
    assetsInlineLimit: 0,   // never inline 3D assets as base64
  },
})
