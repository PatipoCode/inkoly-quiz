/**
 * Зсув годинника клієнта відносно сервера.
 *
 * PRD §8.2 каже: клієнт лише відображає зворотний відлік до збереженого моменту
 * завершення. Але годинник телефона гостя може відставати на хвилини — тоді
 * відлік брехатиме рівно на цю різницю, і критерій приймання §17.5
 * (розбіжність ТВ і телефонів < 1 с) не пройде.
 *
 * Тому дедлайн з бази перераховується не через Date.now(), а через
 * серверний час: offset = serverNow - clientNow, виміряний один раз при
 * завантаженні з поправкою на половину часу обігу запиту.
 *
 * TODO(день 1, контракт): серверний час віддає RPC `server_now()`.
 * Поки функції немає — offset = 0, і поведінка збігається з наївною.
 */
const offsetMs = ref(0)
const synced = ref(false)

export function useServerClock() {
  async function sync(): Promise<void> {
    const db = useDb()
    const sentAt = Date.now()
    const { data, error } = await db.rpc('server_now' as never)
    if (error || !data) return

    const receivedAt = Date.now()
    const roundTrip = receivedAt - sentAt
    const serverNow = new Date(data as unknown as string).getTime()

    // Половина обігу — груба, але достатня поправка: нам потрібна точність
    // у межах секунди, а не мілісекунди.
    offsetMs.value = serverNow + roundTrip / 2 - receivedAt
    synced.value = true
  }

  /** Поточний серверний час у мілісекундах. */
  function now(): number {
    return Date.now() + offsetMs.value
  }

  /** Скільки мілісекунд лишилось до дедлайну за серверним годинником. */
  function remainingMs(deadlineIso: string | null | undefined): number {
    if (!deadlineIso) return 0
    return Math.max(0, new Date(deadlineIso).getTime() - now())
  }

  return { sync, now, remainingMs, offsetMs: readonly(offsetMs), synced: readonly(synced) }
}
