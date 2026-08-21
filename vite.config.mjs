import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || "/",
    build: {
      outDir: "dist",
    },
    optimizeDeps: {
      include: ["react", "react-dom/client"],
    },
    server: { host: "0.0.0.0" },
    plugins: [react()],
  };
});
