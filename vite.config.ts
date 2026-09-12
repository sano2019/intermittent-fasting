import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  root: ".",
  build: { outDir: "dist" },
  plugins: [basicSsl()],
  server: { port: 5173, open: false, https: true, host: true, allowedHosts: [".local", "192.168.1.100"] },
});
