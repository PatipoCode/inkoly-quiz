<script setup lang="ts">
const route = useRoute()
const ui = useUiStore()
const editor = useEditorStore()

ui.setSurface('tablet')
editor.quizId = String(route.params.quizId)
</script>

<template>
  <main>
    <!-- Банер заблокованого квізу (§9.7). Саме блокування — на сервері. -->
    <p v-if="editor.isLocked" role="status">{{ $t('editor.lockedBanner') }}</p>
    <h1>{{ $t('editor.title') }}</h1>
  </main>
</template>
