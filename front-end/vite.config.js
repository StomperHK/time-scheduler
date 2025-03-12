import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({ 
      registerType: "autoUpdate",
      injectRegister: "inline",
      manifest: false,
      base: "src/pages",
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg}"],
      }
    })
  ],
  root: "src/pages"
})