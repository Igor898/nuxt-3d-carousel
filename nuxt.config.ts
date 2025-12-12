export default defineNuxtConfig({
  // Базовая конфигурация для GitHub Pages
  app: {
    baseURL: '/nuxt-3d-carousel/', // замените на имя вашего репозитория
    buildAssetsDir: 'assets'
  },
  css: ['./assets/styles/_reset.sass'],
  // Если используете router
  router: {
    options: {
      hashMode: true // рекомендуется для GitHub Pages
    }
  },
  
  // Опционально: другие настройки
  ssr: false, // для статической генерации можно отключить SSR
  nitro: {
    preset: 'static' // для статического хостинга
  }
})