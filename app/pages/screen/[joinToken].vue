<script setup lang="ts">
// Загальний екран (телевізор) — без авторизації, за токеном кімнати (§10.4).
// Екран нічого не вирішує, він лише відображає (§1.5).
const ui = useUiStore()
ui.setSurface('tv')
</script>

<template>
  <main>
    <h1>{{ $t('screen.waitingForPlayers') }}</h1>
  </main>
</template>
