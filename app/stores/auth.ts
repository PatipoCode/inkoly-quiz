import type { UserRole } from '~/types/game'

/**
 * Сесія, профіль, роль — PRD §10.5.
 *
 * Роль читається з app_metadata токена, а не з таблиці профілів і НІКОЛИ
 * не з user_metadata (§2.4): user_metadata редагується клієнтським SDK
 * напряму, тож роль у ньому означає, що будь-хто зробить себе суперадміном
 * одним викликом з консолі браузера.
 *
 * Значення тут — лише для навігації і ховання кнопок. Реальний захист —
 * політики доступу бази і серверні функції, які самі перевіряють роль
 * незалежно від того, звідки прийшов запит (§2.5).
 */
export const useAuthStore = defineStore('auth', () => {
  const user = useSupabaseUser()

  const role = computed<UserRole | null>(() => {
    const claim = user.value?.app_metadata?.role
    return claim === 'superadmin' || claim === 'host' ? claim : null
  })

  const isAuthenticated = computed(() => Boolean(user.value))
  const isSuperadmin = computed(() => role.value === 'superadmin')

  return { user, role, isAuthenticated, isSuperadmin }
})
