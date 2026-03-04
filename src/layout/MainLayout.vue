<template>
  <div class="dashboard-page">
    <slot name="sidebar" />

    <main class="dashboard-main">
      <slot name="header" />

      <section class="dashboard-content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at top, #2a344f 0, #101322 45%, #050712 100%);
  color: #f7f8ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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

