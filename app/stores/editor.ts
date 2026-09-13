/**
 * Чернетка квізу, оптимістичні оновлення — PRD §10.5.
 *
 * Блокування редагування під час гри (§9.7) тут лише відображається банером.
 * Саме блокування виконується на сервері, у функціях запису: спроба
 * відредагувати квіз під час активної гри має відхилятися сервером,
 * а не ховатися в інтерфейсі (критерій приймання §17.14).
 */
export const useEditorStore = defineStore('editor', () => {
  const quizId = ref<string | null>(null)
  const isLocked = ref(false)
  const activeRoomId = ref<string | null>(null)
  const isSaving = ref(false)

  function $reset(): void {
    quizId.value = null
    isLocked.value = false
    activeRoomId.value = null
    isSaving.value = false
  }

  return { quizId, isLocked, activeRoomId, isSaving, $reset }
})
