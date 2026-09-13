/**
 * Перелічувані значення ігрового домену — PRD §4.1.
 *
 * ПРАВИЛО: тут лежить ПОВНИЙ перелік усіх запланованих значень, включно з тими,
 * що не реалізовані у фазі 1. Ці самі значення мають бути в enum-типах бази.
 * Оцінювання на сервері й рендеринг на клієнті побудовані як диспетчер за цим
 * значенням, тож додавання `ordering` у фазі 2 = один модуль оцінювання +
 * один компонент вводу + одне значення в enum. Нуль змін у ігровому циклі.
 *
 * IMPLEMENTED_* — те, що реально працює зараз. Редактор показує решту
 * вимкненою з підписом «скоро»: це і документація для ведучого, і перевірка,
 * що диспетчер коректно відсікає невідомі значення.
 */

export const QUESTION_TYPES = ['text', 'image', 'collage', 'gif', 'video', 'audio'] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const IMPLEMENTED_QUESTION_TYPES = [
  'text',
  'image',
] as const satisfies readonly QuestionType[]

export const ANSWER_TYPES = [
  'single_choice',
  'text_input',
  'multi_choice',
  'ordering',
  'photo',
  'drawing',
] as const
export type AnswerType = (typeof ANSWER_TYPES)[number]

export const IMPLEMENTED_ANSWER_TYPES = [
  'single_choice',
  'text_input',
] as const satisfies readonly AnswerType[]

/** PRD §9.1. Порядок масиву = порядок машини станів. */
export const ROOM_STATES = [
  'lobby',
  'question_active',
  'question_locked',
  'stage_reveal',
  'stage_leaderboard',
  'final_results',
] as const
export type RoomState = (typeof ROOM_STATES)[number]

/**
 * Стани, у яких квіз заблокований на редагування (§9.7).
 * Окремого поля в базі немає навмисно: два джерела істини для одного факту
 * неминуче розійдуться.
 */
export const EDIT_LOCKING_ROOM_STATES = [
  'question_active',
  'question_locked',
  'stage_reveal',
  'stage_leaderboard',
] as const satisfies readonly RoomState[]

/** PRD §4.5 — поле є, фаза 1 записує тільки `after_stage`. */
export const REVEAL_MODES = ['after_stage', 'after_question', 'manual'] as const
export type RevealMode = (typeof REVEAL_MODES)[number]

export const IMPLEMENTED_REVEAL_MODES = ['after_stage'] as const satisfies readonly RevealMode[]

/** PRD §8.1 */
export const TIME_MODES = ['unlimited', 'fixed'] as const
export type TimeMode = (typeof TIME_MODES)[number]

/** PRD §4.8 — таблиця активів існує з першого дня, фаза 1 використовує тільки зображення. */
export const MEDIA_KINDS = ['image', 'gif', 'video', 'audio'] as const
export type MediaKind = (typeof MEDIA_KINDS)[number]

/** PRD §2.1. Суперадмін у системі один; роль живе в app_metadata (§2.4). */
export const USER_ROLES = ['superadmin', 'host'] as const
export type UserRole = (typeof USER_ROLES)[number]

export function isImplementedAnswerType(value: AnswerType): boolean {
  return (IMPLEMENTED_ANSWER_TYPES as readonly AnswerType[]).includes(value)
}

export function isImplementedQuestionType(value: QuestionType): boolean {
  return (IMPLEMENTED_QUESTION_TYPES as readonly QuestionType[]).includes(value)
}

export function isQuizEditLocked(state: RoomState | null | undefined): boolean {
  if (!state) return false
  return (EDIT_LOCKING_ROOM_STATES as readonly RoomState[]).includes(state)
}
