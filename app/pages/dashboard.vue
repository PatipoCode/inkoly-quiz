<script setup lang="ts">
const { t } = useI18n()
const db = useDb()
const ui = useUiStore()
const user = useSupabaseUser()

ui.setSurface('tablet')
useHead({ title: t('dashboard.title') })

const creating = ref(false)
const error = ref<string | null>(null)

/**
 * Список квізів поточного ведучого.
 *
 * Фільтра за owner_id тут немає навмисно — його ставить політика доступу
 * (PRD §11.3). Якщо колись політику зламають, запит почне повертати чужі
 * квізи, і це буде видно одразу, а не ховатиметься за клієнтським where.
 */
const { data: quizzes, refresh } = await useAsyncData('quizzes', async () => {
  const { data, error: queryError } = await db
    .from('quizzes')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })

  if (queryError) throw queryError
  return data
})

/**
 * Створення квізу — єдине місце, де клієнт пише в таблицю напряму.
 *
 * Правило «тільки через серверні функції» (§4.9) стосується таблиць гри:
 * кімнат, учасників, відповідей. Власний контент захищений політикою доступу,
 * owner_id підставляє база через default auth.uid().
 */
async function createQuiz() {
  creating.value = true
  error.value = null

  const { data, error: insertError } = await db
    .from('quizzes')
    .insert({ title: t('dashboard.untitled') })
    .select('id')
    .single()

  creating.value = false

  if (insertError || !data) {
    error.value = insertError?.message ?? t('errors.generic')
    return
  }

  await navigateTo(`/editor/${data.id}`)
}

async function signOut() {
  await db.auth.signOut()
  await navigateTo('/')
}
</script>

<template>
  <main>
    <header class="head">
      <h1>{{ $t('dashboard.title') }}</h1>
      <div class="head__actions">
        <span v-if="user" class="muted">{{ user.email }}</span>
        <button type="button" class="link" @click="signOut">{{ $t('auth.signOut') }}</button>
      </div>
    </header>

    <p v-if="error" role="alert" class="error">{{ error }}</p>

    <button type="button" class="button" :disabled="creating" @click="createQuiz">
      {{ $t('dashboard.create') }}
    </button>

    <p v-if="!quizzes?.length" class="muted">{{ $t('dashboard.empty') }}</p>

    <ul v-else class="quizzes">
      <li v-for="quiz in quizzes" :key="quiz.id">
        <NuxtLink :to="`/editor/${quiz.id}`">{{ quiz.title || $t('dashboard.untitled') }}</NuxtLink>
      </li>
    </ul>

    <button type="button" class="link" @click="() => refresh()">{{ $t('common.retry') }}</button>
  </main>
</template>

<style scoped lang="scss">
.head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: baseline;
  justify-content: space-between;
}

.head__actions {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.button {
  @include touchable;

  margin-block: var(--space-lg);
  padding-inline: var(--space-lg);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
}

.link {
  border: 0;
  background: none;
  color: var(--color-accent);
  cursor: pointer;
  text-decoration: underline;
}

.quizzes {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding-block: var(--space-sm);
    border-block-end: 1px solid var(--color-border);
  }
}

.muted {
  color: var(--color-text-muted);
}

.error {
  color: var(--color-danger);
}
</style>
