<script setup lang="ts">
const { t } = useI18n()
const db = useDb()
const user = useSupabaseUser()
const error = ref<string | null>(null)
const busy = ref(false)

useHead({ title: t('app.name') })

async function signIn() {
  busy.value = true
  error.value = null

  const { error: authError } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Абсолютний URL обов'язковий: Supabase звіряє його зі списком дозволених
      // редіректів, а не добудовує з site_url.
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (authError) {
    error.value = authError.message
    busy.value = false
  }
}
</script>

<template>
  <main>
    <h1>{{ $t('app.name') }}</h1>
    <p>{{ $t('app.tagline') }}</p>

    <p v-if="error" role="alert" class="error">{{ error }}</p>

    <div class="actions">
      <NuxtLink v-if="user" to="/dashboard" class="button">
        {{ $t('dashboard.title') }}
      </NuxtLink>
      <button v-else type="button" class="button" :disabled="busy" @click="signIn">
        {{ busy ? $t('auth.signingIn') : $t('auth.signInWithGoogle') }}
      </button>

      <NuxtLink to="/join" class="link">{{ $t('join.title') }}</NuxtLink>
    </div>
  </main>
</template>

<style scoped lang="scss">
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
  margin-block-start: var(--space-lg);
}

.button {
  @include touchable;

  display: inline-flex;
  align-items: center;
  padding-inline: var(--space-lg);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  text-decoration: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
}

.link {
  color: var(--color-accent);
}

.error {
  color: var(--color-danger);
}
</style>
