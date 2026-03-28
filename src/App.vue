<script setup lang="ts">
import MessageGlobal from '@/plugins/MessageGlobal.vue'
import GlobalImageCropper from '@/components/GlobalImageCropper.vue'
import GlobalFloatingDock from '@/components/GlobalFloatingDock.vue'
</script>

<template>
  <n-message-provider>
    <MessageGlobal />
    <GlobalImageCropper />
    <GlobalFloatingDock></GlobalFloatingDock>
  </n-message-provider>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}
</style>
