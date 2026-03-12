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
import MainLayout from '@/layout/MainLayout.vue'
import SidebarMenu from '@/layout/SidebarMenu.vue'
import HeaderBar from '@/layout/HeaderBar.vue'
</script>

