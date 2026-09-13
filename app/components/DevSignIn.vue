<script setup lang="ts">
/**
 * Вхід за email і паролем — ТІЛЬКИ для розробки.
 *
 * Компонент виноситься окремо і використовується всередині <DevOnly>: Nuxt
 * вирізає вміст цього тега при продакшн-збірці разом з усім, на що він
 * посилається. Перевірка `import.meta.dev` у змінній цього не дає — розмітка
 * не рендериться, але рядки лишаються в бандлі.
 *
 * Навіщо взагалі: політики доступу закривають усе для неавторизованого
 * клієнта, а Google OAuth вимагає ключів з Google Cloud Console. Локальний
 * seed створює ведучого host@local.test / password123 — цього досить, щоб
 * працювати над редактором, не чекаючи на OAuth.
 */
const db = useDb()

const email = ref('host@local.test')
const password = ref('password123')
const busy = ref(false)
const error = ref<string | null>(null)

async function signInWithPassword() {
  busy.value = true
  error.value = null

  const { error: authError } = await db.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  busy.value = false

  if (authError) {
    error.value = authError.message
    return
  }

  await navigateTo('/dashboard')
}
</script>

<template>
  <form class="dev-signin" @submit.prevent="signInWithPassword">
    <h2>{{ $t('auth.devSignIn') }}</h2>

    <p v-if="error" role="alert" class="dev-signin__error">{{ error }}</p>

    <label>
      <span>{{ $t('auth.email') }}</span>
      <input v-model="email" type="email" autocomplete="username" />
    </label>
    <label>
      <span>{{ $t('auth.password') }}</span>
      <input v-model="password" type="password" autocomplete="current-password" />
    </label>
    <button type="submit" :disabled="busy">{{ $t('auth.signIn') }}</button>
  </form>
</template>

<style scoped lang="scss">
// Навмисно не оформлений як частина продукту: цей блок не має виглядати так,
// наче він належить застосунку.
.dev-signin {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-inline-size: 22rem;
  margin-block-start: var(--space-2xl);
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);

  h2 {
    margin: 0;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    font-size: var(--font-size-sm);
  }

  input,
  button {
    @include touchable;

    padding-inline: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font: inherit;
  }

  button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    cursor: pointer;
  }

  &__error {
    margin: 0;
    color: var(--color-danger);
    font-size: var(--font-size-sm);
  }
}
</style>
