<template>
  <header class="dashboard-header">
    <div class="breadcrumb">
      <span class="crumb">首页</span>
      <span class="crumb-separator">/</span>
      <span class="crumb is-active">控制面板</span>
    </div>

    <div class="user-info">
      <div class="user-text">
        <span class="user-name">Omaxinge</span>
        <span class="user-role">无何有境 · 管理员</span>
      </div>
      <div class="user-avatar">
        <span>OM</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a7b4d8;
}

.crumb.is-active {
  color: #f7f8ff;
}

.crumb-separator {
  opacity: 0.6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  color: #a7b4d8;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9ad8, #9bb5ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #101322;
  box-shadow: 0 0 18px rgba(155, 181, 255, 0.7);
}
</style>

