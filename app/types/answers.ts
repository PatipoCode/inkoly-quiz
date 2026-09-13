import type { AnswerType } from './game'

/**
 * Вміст відповіді — PRD §4.2.
 *
 * У базі це одне поле `answers.payload` типу jsonb: вибір одного варіанта,
 * набір варіантів, текст, масив порядку, посилання на фото — усе лягає туди
 * без зміни схеми.
 *
 * Тут форма payload для кожного типу відповіді зафіксована як розмічене
 * об'єднання, тож компілятор ловить неузгодженість між збереженням і читанням.
 * Дискримінант `type` дублює `questions.answer_type` навмисно: без нього
 * розбір payload на клієнті потребував би доступу до питання.
 */

export interface SingleChoicePayload {
  type: 'single_choice'
  optionId: string
}

export interface TextInputPayload {
  type: 'text_input'
  /** Сирий ввід учасника. Нормалізація і порівняння — тільки на сервері (§6.3). */
  text: string
}

/** Фаза 2 */
export interface MultiChoicePayload {
  type: 'multi_choice'
  optionIds: string[]
}

/** Фаза 2 — порядок елементів у масиві і є відповіддю. */
export interface OrderingPayload {
  type: 'ordering'
  optionIds: string[]
}

/** Фаза 3 — оцінює ведучий вручну. */
export interface PhotoPayload {
  type: 'photo'
  mediaAssetId: string
}

/** Фаза 3 */
export interface DrawingPayload {
  type: 'drawing'
  mediaAssetId: string
}

export type AnswerPayload =
  | SingleChoicePayload
  | TextInputPayload
  | MultiChoicePayload
  | OrderingPayload
  | PhotoPayload
  | DrawingPayload

export type AnswerPayloadFor<T extends AnswerType> = Extract<AnswerPayload, { type: T }>

/**
 * Варіант відповіді у вигляді, доступному учаснику — PRD §8.3.
 *
 * Ознака правильності сюди не входить і не може входити: учасники читають
 * санітизований зріз бази без неї. Це окремий пункт приймання (§17.9) —
 * у DevTools на клієнті учасника правильну відповідь знайти неможливо.
 */
export interface PublicOption {
  id: string
  position: number
  text: string
}
