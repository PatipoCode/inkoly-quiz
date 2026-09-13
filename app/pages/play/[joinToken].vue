<script setup lang="ts">
// Екран учасника (телефон) — без акаунта, анонімна сесія (§2.1, §9.3).
const ui = useUiStore()
ui.setSurface('phone')
</script>

<template>
  <main>
    <h1>{{ $t('play.waitingForStart') }}</h1>
  </main>
</template>
