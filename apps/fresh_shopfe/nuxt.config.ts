export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Enable SSR/SSG for better performance
  ssr: true,
  nitro: {
    experimental: {
      wasm: true,
    },
    // Server routes configuration
    routeRules: {
      // Static generation for homepage
      "/": { prerender: true },
      // SSR for auth pages
      "/login": { ssr: true },
      "/register": { ssr: true },
      // SPA for dashboard (client-side routing)
      "/dashboard/**": { ssr: false },
    },
  },

  // Runtime config for API
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:7000/api/v1",
      appName: "SeaFresh Shop",
      appVersion: "1.0.0",
    },
  },

  // CSS framework
  css: ["~/app/assets/css/main.css"],

  // Modules for Nuxt 4 - chỉ sử dụng modules chính thức
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
  ],

  // UI Configuration for Nuxt UI v4.0.0
  ui: {
    colorMode: true,
  },

  // Color mode configuration
  colorMode: {
    preference: "system",
    fallback: "light",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storageKey: "nuxt-color-mode",
  },

  // Auto-imports - Nuxt 4 hỗ trợ auto-import
  imports: {
    dirs: ["app/composables/**", "app/stores/**"],
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Security headers
  security: {
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === "development" ? "unsafe-none" : "require-corp",
    },
  },
});
