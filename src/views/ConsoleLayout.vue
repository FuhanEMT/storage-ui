<template>
  <MainLayout>
    <template #sidebar>
      <SidebarMenu />
    </template>

    <template #header>
      <HeaderBar />
    </template>

    <!-- 右侧内容由子路由决定，只替换这一块 -->
    <router-view />
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import SidebarMenu from '@/layout/SidebarMenu.vue'
import HeaderBar from '@/layout/HeaderBar.vue'
import request from '@/services/request'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
onMounted(async () => {
  try {
    const res = await request.get('/admin/user/system')
    systemStore.setSystem(res?.data ?? null)
  } catch {
    systemStore.setSystem(null)
  }
})
</script>

