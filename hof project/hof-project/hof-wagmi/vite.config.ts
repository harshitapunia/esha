import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill the globals & modules that wagmi/walletconnect need in browsers
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
})
