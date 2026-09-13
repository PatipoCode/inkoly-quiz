import type { UserRole } from '~/types/game'

/**
 * Гард за роллю — PRD §2.5, §4.12.
 *
 * ЦЕ НЕ БЕЗПЕКА. Гард ховає кнопки і робить навігацію зрозумілою. Реальний
 * захист — політики доступу бази і серверні функції, які перевіряють роль
 * самостійно, незалежно від того, звідки прийшов запит. Якщо запит проходить
 * в обхід інтерфейсу — система зламана, і жоден клієнтський гард цього
 * не виправить.
 *
 * Використання на сторінці:
 *   definePageMeta({ middleware: 'role', requiredRole: 'superadmin' })
 */
export default defineNuxtRouteMiddleware((to) => {
  const required = to.meta.requiredRole as UserRole | undefined
  if (!required) return

  const auth = useAuthStore()
  if (!auth.isAuthenticated) return navigateTo('/')
  if (auth.role !== required) return navigateTo('/dashboard')
})
