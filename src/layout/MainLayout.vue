<template>
  <div class="dashboard-page">
    <div v-if="adminBgUrl" class="dashboard-page-bg" :style="adminBgStyle" />
    <slot name="sidebar" />

    <main class="dashboard-main">
      <slot name="header" />

      <section class="dashboard-content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const adminBgUrl = computed(() => systemStore.adminBg)
const adminBgStyle = computed(() => {
  const val = adminBgUrl.value
  if (!val) return {}
  const url = val.startsWith('data:') || val.startsWith('http') ? val : apiBase + val
  return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
})
</script>

<style scoped>
.dashboard-page {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at top, #2a344f 0, #101322 45%, #050712 100%);
  color: #f7f8ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 后台页整页背景图 user_admin_bg：半透明 + 淡入 */
.dashboard-page-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.32;
  pointer-events: none;
  z-index: 0;
  animation: adminBgFadeIn 0.6s ease-out;
}
@keyframes adminBgFadeIn {
  from { opacity: 0; }
  to { opacity: 0.32; }
}
.dashboard-page > *:not(.dashboard-page-bg) {
  position: relative;
  z-index: 1;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 22px;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 960px) {
  .dashboard-main {
    padding-inline: 14px;
  }
}
</style>

