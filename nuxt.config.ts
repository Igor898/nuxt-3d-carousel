export default defineNuxtConfig({
  // Netlify не требует baseURL, но можно оставить для превью
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/' : '/',
  },
  css: ['./assets/styles/_reset.sass'],
  // Включите SSR для лучшей производительности (или оставьте false если нужно)
  ssr: true,
  
  // Netlify автоматически определяет preset, но можно явно указать
  nitro: {
    preset: 'netlify' // или 'netlify-static' если нужен static
  },
  
  // Дополнительные настройки для GSAP
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.includes('-')
    }
  }
})