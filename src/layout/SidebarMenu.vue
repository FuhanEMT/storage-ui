<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-mark"></div>
      <span class="sidebar-logo-text">Storage Garden</span>
    </div>

    <nav class="sidebar-menu">
      <button class="menu-item is-active">
        <span class="menu-icon">📁</span>
        <span class="menu-text">文件总览</span>
      </button>
      <button class="menu-item">
        <span class="menu-icon">⭐</span>
        <span class="menu-text">收藏夹</span>
      </button>
      <button class="menu-item">
        <span class="menu-icon">🕓</span>
        <span class="menu-text">最近访问</span>
      </button>
      <button class="menu-item">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">设置</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts"></script>

<style scoped>
.sidebar {
  width: 220px;
  padding: 20px 18px;
  border-right: 1px solid rgba(123, 167, 255, 0.25);
  background: linear-gradient(160deg, rgba(8, 11, 30, 0.96), rgba(6, 9, 24, 0.96));
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #ff9ad8, #9bb5ff, #b0ffea, #ff9ad8);
  box-shadow:
    0 0 14px rgba(255, 154, 216, 0.7),
    0 0 22px rgba(155, 181, 255, 0.8);
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.menu-item {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #c4cdef;
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.08s ease;
}

.menu-item .menu-icon {
  font-size: 15px;
}

.menu-item.is-active {
  background: linear-gradient(135deg, rgba(255, 154, 216, 0.35), rgba(155, 181, 255, 0.4));
  color: #101322;
  font-weight: 600;
}

.menu-item:not(.is-active):hover {
  background: rgba(34, 44, 82, 0.9);
  transform: translateX(1px);
}

@media (max-width: 960px) {
  .sidebar {
    display: none;
  }
}
</style>

