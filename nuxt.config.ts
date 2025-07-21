// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxtjs/cloudflare'
  ],

  // CSS
  css: ['~/assets/css/main.css'],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Internationalization
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh', name: '中文', file: 'zh.json' }
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  // App configuration
  app: {
    head: {
      title: 'Cloudmark - Your Universal Bookmark Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Save and access your bookmarks from anywhere with Cloudmark, the seamless cloud bookmarking tool for professionals and casual users alike'
        },
        {
          name: 'keywords',
          content: 'cloudmark,cloud mark,bookmarks,book mark manager,bookmark manager,bookmark managers,bookmark organizer,bookmark saver,bookmarks manager,bookmark editor,web tool,productivity'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  },

  // Nitro configuration for Cloudflare
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
    }
  },

  // Development server
  devServer: {
    port: 3000
  },

  // Build configuration
  build: {
    transpile: ['lucide-vue-next']
  },

  // Cloudflare module configuration
  cloudflare: {
    pages: {
      routes: {
        exclude: ['/api/*']
      }
    }
  },

  // SSR configuration
  ssr: true
})