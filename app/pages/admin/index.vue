<script setup lang="ts">
/**
 * Заброньований маршрут — PRD §4.12.
 *
 * У фазі 1 за ним немає екранів, тільки заглушка і гард. Наповнення у фазі 2
 * не потребує змін у навігації, гардах чи політиках доступу.
 */
definePageMeta({
  middleware: 'role',
  requiredRole: 'superadmin',
})
</script>

<template>
  <main>
    <h1>{{ $t('admin.title') }}</h1>
    <p>{{ $t('admin.placeholder') }}</p>
  </main>
</template>
