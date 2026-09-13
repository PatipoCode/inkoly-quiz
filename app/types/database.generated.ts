/**
 * ⚠️ ЦЕЙ ФАЙЛ ГЕНЕРУЄТЬСЯ. Не редагувати руками.
 *
 *   npm run db:types
 *
 * Файл комітиться в репозиторій (PRD §14.3) і має оновлюватися в ТОМУ САМОМУ
 * коміті, що й міграція, яка змінила схему. Інакше типи і база розходяться
 * мовчки, а компілятор про це не дізнається.
 *
 * Зараз це заглушка: схеми ще немає. Перша ж міграція замінить вміст цілком.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
