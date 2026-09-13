import { MAX_PARTICIPANTS } from './limits'

/**
 * Набір аватарів — PRD §9.3, §18 (п. 2).
 *
 * Зображення статичні і лежать у public/avatars як частина збірки, НЕ у Storage.
 * Це прибирає мережевий запит на найчутливішому кроці: гість щойно сканував
 * QR-код і чекає екран.
 *
 * Розмір набору дорівнює ліміту учасників і не може бути меншим: аватари
 * унікальні в межах кімнати (§9.4), тож набір і є верхньою межею кімнати.
 */
export const AVATAR_IDS = Array.from(
  { length: MAX_PARTICIPANTS },
  (_, i) => `a${String(i + 1).padStart(2, '0')}`,
)

export type AvatarId = string

export function avatarUrl(id: AvatarId): string {
  return `/avatars/${id}.svg`
}
