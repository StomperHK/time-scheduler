import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      manifest: false,
      base: "src/pages",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg}"],
      },
    }),
  ],
  root: "src/pages",
  envDir: "../../",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        criarConta: resolve(__dirname, 'src/pages/criar-conta/index.html'),
        login: resolve(__dirname, "src/pages/login/index.html"),
        app: resolve(__dirname, "src/pages/app/index.html"),
        premium: resolve(__dirname, "src/pages/premium/index.html"),
        pagamentoSucesso: resolve(__dirname, "src/pages/pagamento-sucesso/index.html"),
        pagamentoErro: resolve(__dirname, "src/pages/pagamento-erro/index.html"),
        pagamentoSucesso: resolve(__dirname, "src/pages/pagamento-pendente/index.html"),
      }
    },
    outDir: "../../dist",
  }
});
