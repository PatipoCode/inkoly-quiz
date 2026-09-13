import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { AVATAR_IDS, avatarUrl } from '~/constants/avatars'
import { MAX_PARTICIPANTS } from '~/constants/limits'

/**
 * Ризик з PRD §16: «набір аватарів менший за ліміт учасників».
 *
 * Аватари унікальні в межах кімнати (§9.4), тож набір з N зображень робить
 * кімнату на N осіб — скільки б не було записано в ліміті. Помилка тиха:
 * нічого не падає, просто 31-й гість не може увійти. Саме тому це тест,
 * а не домовленість у документі.
 */
describe('набір аватарів', () => {
  it('має рівно стільки зображень, скільки вміщає кімната', () => {
    expect(AVATAR_IDS).toHaveLength(MAX_PARTICIPANTS)
  })

  it('не містить дублікатів', () => {
    expect(new Set(AVATAR_IDS).size).toBe(AVATAR_IDS.length)
  })

  it('має файл на диску для кожного ідентифікатора', () => {
    const missing = AVATAR_IDS.filter(
      (id) => !existsSync(fileURLToPath(new URL(`../public${avatarUrl(id)}`, import.meta.url))),
    )
    expect(missing).toEqual([])
  })
})
