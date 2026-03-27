<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { setMessageApi } from '@/plugins/message'

setMessageApi(useMessage())
</script>

<template>
  <router-view />
</template>
