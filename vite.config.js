import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // Asegura rutas relativas para que funcione en GitHub Pages o carpetas locales
  base: "./",

  // Define explícitamente la raíz si es necesario, o déjalo por defecto
  // root: "",

  // Carpeta de estáticos (asegúrate de que tu favicon esté aquí)
  publicDir: "public",

  build: {
    outDir: "dist",
    emptyOutDir: true,

    // 🔥 CRÍTICO PARA SEGURIDAD:
    // Evita generar archivos .map que revelan tu código original
    sourcemap: false,

    // Configuración de Minificación (Terser es más agresivo y seguro)
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Elimina console.log
        drop_debugger: true, // Elimina debugger
        pure_funcs: ["console.info", "console.debug", "console.warn"], // Limpieza extra
      },
      format: {
        comments: false, // Elimina comentarios del código
      },
    },

    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // Forzar nombres de archivo predecibles o dejar hash (recomendado hash para cache)
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    // Aumentar límite de aviso de chunk (la ofuscación aumenta el tamaño)
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 3000,
    open: true,
  },
});
