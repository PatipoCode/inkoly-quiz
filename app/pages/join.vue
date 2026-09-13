<script setup lang="ts">
import { ROOM_CODE_LENGTH } from '~/constants/limits'

const ui = useUiStore()
ui.setSurface('phone')

const code = ref('')
</script>

<template>
  <main>
    <h1>{{ $t('join.title') }}</h1>
    <label>
      <span>{{ $t('join.codePlaceholder') }}</span>
      <input v-model="code" inputmode="numeric" autocomplete="off" :maxlength="ROOM_CODE_LENGTH" />
    </label>
  </main>
</template>
