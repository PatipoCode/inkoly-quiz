<script setup lang="ts">
const { t } = useI18n()
useHead({ title: t('app.name') })
</script>

<template>
  <main>
    <h1>{{ $t('app.name') }}</h1>
    <p>{{ $t('app.tagline') }}</p>
    <nav>
      <NuxtLink to="/join">{{ $t('join.submit') }}</NuxtLink>
      <NuxtLink to="/dashboard">{{ $t('dashboard.title') }}</NuxtLink>
    </nav>
  </main>
</template>
