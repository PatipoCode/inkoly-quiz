import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  /**
   * PRD §10.3 — статичний SPA, серверний рендеринг вимкнено.
   * SEO грі не потрібне, серверних маршрутів немає, вся логіка в Supabase.
   * Це прибирає serverless-функції разом з холодними стартами: гість сканує
   * QR-код і має побачити екран за секунду.
   */
  ssr: false,

  modules: ['@nuxtjs/supabase', '@pinia/nuxt', '@nuxtjs/i18n', '@vueuse/nuxt', '@nuxt/eslint'],

  typescript: {
    strict: true,
    // Перевірка типів — окремим скриптом `npm run typecheck` і в CI,
    // не в dev-сервері: інакше HMR стає повільним.
    typeCheck: false,
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Міксини доступні в кожному <style lang="scss"> без ручного @use.
          additionalData: '@use "mixins" as *;\n',
          loadPaths: [fileURLToPath(new URL('./app/assets/styles', import.meta.url))],
        },
      },
    },
  },

  supabase: {
    /**
     * Поверхні, доступні без автентифікації ведучого (PRD §10.4):
     * телевізор відкривається за токеном кімнати, учасник — анонімною сесією.
     */
    redirectOptions: {
      login: '/',
      callback: '/auth/callback',
      exclude: ['/', '/join', '/play/**', '/screen/**'],
    },
  },

  i18n: {
    /**
     * PRD §4.6 — інфраструктура локалізації повна з першого дня,
     * словник поки один. Додавання uk/pl у фазі 2 = два файли,
     * нуль правок у компонентах.
     */
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [{ code: 'en', language: 'en-US', file: 'en.json', name: 'English' }],
  },

  app: {
    head: {
      htmlAttrs: { 'data-theme': 'light' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
    },
  },
})
