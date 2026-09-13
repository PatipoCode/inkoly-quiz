export type Theme = 'light' | 'dark' | 'high-contrast'
export type Surface = 'tv' | 'tablet' | 'phone'

/**
 * Тема і локаль — PRD §10.5.
 *
 * Фаза 1 має одну тему і одну локаль, але обидва значення вже їдуть через
 * атрибути на кореневому елементі (§4.7): додавання темної теми — це новий
 * набір значень тих самих CSS-змінних, нуль правок у компонентах.
 *
 * `surface` задає масштаб типографіки і визначається екраном, а не шириною
 * вікна: телевізор і планшет можуть мати однакову ширину при різній
 * дистанції перегляду.
 */
export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>('light')
  const surface = ref<Surface>('phone')

  function setSurface(value: Surface): void {
    surface.value = value
  }

  return { theme, surface, setSurface }
})
