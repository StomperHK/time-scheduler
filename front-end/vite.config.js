import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  root: "src/pages",
  envDir: "../../",
  publicDir: "../../public",
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
        pagamentoPendente: resolve(__dirname, "src/pages/pagamento-pendente/index.html"),
      }
    },
    outDir: "../../dist",
  }
});
