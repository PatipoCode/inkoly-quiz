export type RealtimeStatus = 'idle' | 'connecting' | 'subscribed' | 'disconnected'

/**
 * Канал, статус з'єднання, ресинк після розриву — PRD §10.5.
 *
 * Канал ініціалізується плагіном на рівні застосунку, а не в компоненті:
 * інакше він знищується при навігації між екранами (§10.5).
 *
 * Після повторного підключення стан НЕ добудовується з пропущених подій —
 * викликається повний ресинк з бази (§9.5). Події реалтайму тут лише
 * прискорюють оновлення, вони не є джерелом істини.
 */
export const useRealtimeStore = defineStore('realtime', () => {
  const status = ref<RealtimeStatus>('idle')
  const lastEventAt = ref<number | null>(null)

  const isHealthy = computed(() => status.value === 'subscribed')

  /** TODO(день 2): підписка на канал кімнати + presence (§12.1). */
  async function joinRoomChannel(_roomId: string): Promise<void> {}

  async function leaveRoomChannel(): Promise<void> {
    status.value = 'idle'
  }

  return { status, lastEventAt, isHealthy, joinRoomChannel, leaveRoomChannel }
})
