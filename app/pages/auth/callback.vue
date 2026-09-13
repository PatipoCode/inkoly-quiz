<script setup lang="ts">
// OAuth-редирект (PRD §10.4). Профіль створюється тригером у базі при першому
// вході, не тут: клієнт не пише в таблиці напряму (§4.9).
const user = useSupabaseUser()

watch(
  user,
  (value) => {
    if (value) navigateTo('/dashboard')
  },
  { immediate: true },
)
</script>

<template>
  <p>{{ $t('auth.signingIn') }}</p>
</template>
