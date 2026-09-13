import { isQuizEditLocked, type RoomState } from '~/types/game'

/**
 * Стан гри, поточне питання, учасники, лідерборд — PRD §10.5.
 *
 * Стор нічого не вирішує і не рахує. Джерело істини — база (§1.5):
 * будь-яка з трьох поверхонь після втрати з'єднання відновлює повний стан
 * одним запитом, а не добудовує його з подій, які встигла отримати.
 *
 * Записів у таблиці гри звідси теж немає: приєднання, відправлення відповіді,
 * зміна стану — усе через серверні функції (§4.9).
 */
export const useRoomStore = defineStore('room', () => {
  const roomId = ref<string | null>(null)
  const state = ref<RoomState>('lobby')
  const currentStageId = ref<string | null>(null)
  const currentQuestionId = ref<string | null>(null)

  /** Серверні моменти старту і дедлайну (§8.2). Клієнт їх не обчислює. */
  const questionStartedAt = ref<string | null>(null)
  const questionDeadlineAt = ref<string | null>(null)

  const isEditLocked = computed(() => isQuizEditLocked(state.value))

  /** TODO(день 2): повний ресинк одним викликом RPC за токеном сесії (§9.5). */
  async function resync(): Promise<void> {}

  function $reset(): void {
    roomId.value = null
    state.value = 'lobby'
    currentStageId.value = null
    currentQuestionId.value = null
    questionStartedAt.value = null
    questionDeadlineAt.value = null
  }

  return {
    roomId,
    state,
    currentStageId,
    currentQuestionId,
    questionStartedAt,
    questionDeadlineAt,
    isEditLocked,
    resync,
    $reset,
  }
})
