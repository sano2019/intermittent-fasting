import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    basicSsl(), // Automatically creates and caches local self-signed certificates
  ],
  server: {
    https: true, // Forces the local dev server to listen on https://
    port: 5173, // Keeps your standard port
  },
});
