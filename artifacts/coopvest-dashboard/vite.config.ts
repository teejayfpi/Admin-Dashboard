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
    // Expose env vars as JSON strings - Vercel will inject these during build
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://nyoauzqezpxeonmrxxgi.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2F1enFlenB4ZW9ubXJ4eGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODI3MzUsImV4cCI6MjA4OTg1ODczNX0.5WfECoO2Xu5VfBzFbQd2CA8rIeBVnOkiKmnnbYRA8VU'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'https://coopvest-api-v3.onrender.com'),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        
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
  