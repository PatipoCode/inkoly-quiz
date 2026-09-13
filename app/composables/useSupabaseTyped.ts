import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.generated'

/**
 * Типізований клієнт Supabase.
 *
 * Використовуйте його всюди замість голого useSupabaseClient(): так виклики
 * .rpc() і .from() звіряються зі згенерованою схемою, і перейменована колонка
 * ламає збірку, а не партію.
 */
export function useDb(): SupabaseClient<Database> {
  return useSupabaseClient<Database>()
}
