<script setup lang="ts">
const ui = useUiStore()

// Масштаб типографіки — атрибутом на кореневому елементі (§4.7),
// щоб перемикання поверхні не потребувало жодної правки в компонентах.
useHead({
  htmlAttrs: {
    'data-theme': () => ui.theme,
    'data-surface': () => ui.surface,
  },
})
</script>

<template>
  <div class="app-shell">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  min-block-size: 100dvh;
  padding: var(--space-lg);
}
</style>
