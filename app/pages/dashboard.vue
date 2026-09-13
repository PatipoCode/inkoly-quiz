<script setup lang="ts">
const ui = useUiStore()
ui.setSurface('tablet')
</script>

<template>
  <main>
    <h1>{{ $t('dashboard.title') }}</h1>
    <p>{{ $t('dashboard.empty') }}</p>
  </main>
</template>
