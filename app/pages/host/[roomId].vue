<script setup lang="ts">
const route = useRoute()
const ui = useUiStore()
const room = useRoomStore()

ui.setSurface('tablet')
room.roomId = String(route.params.roomId)
</script>

<template>
  <main>
    <h1>{{ $t('host.title') }}</h1>
  </main>
</template>
