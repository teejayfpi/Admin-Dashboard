import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import path from "path";

  const port = Number(process.env.PORT ?? 5173);
  const basePath = process.env.BASE_PATH ?? "/";

  export default defineConfig({
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      // Expose env vars to window for runtime access
      'window.ENV_VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
      'window.ENV_VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
      'window.ENV_VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  });
  