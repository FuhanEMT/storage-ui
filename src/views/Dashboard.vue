<template>
  <div class="dashboard-page">
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

    <main class="dashboard-main">
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

      <section class="dashboard-content">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-label">已用存储</div>
            <div class="stat-value">128 GB</div>
            <div class="stat-desc">总配额 1 TB</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">文件数量</div>
            <div class="stat-value">3,247</div>
            <div class="stat-desc">含 128 个文件夹</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最近活跃</div>
            <div class="stat-value">18</div>
            <div class="stat-desc">近 24 小时操作</div>
          </div>
        </div>

        <div class="panel-row">
          <div class="panel panel-files">
            <div class="panel-header">
              <h2>最近文件</h2>
              <button class="panel-action">查看全部</button>
            </div>
            <ul class="file-list">
              <li class="file-item">
                <div class="file-main">
                  <span class="file-icon">📄</span>
                  <div class="file-text">
                    <span class="file-name">项目规划文档.md</span>
                    <span class="file-meta">3 分钟前 · 2.3 MB</span>
                  </div>
                </div>
                <span class="file-tag">文档</span>
              </li>
              <li class="file-item">
                <div class="file-main">
                  <span class="file-icon">🖼️</span>
                  <div class="file-text">
                    <span class="file-name">封面插画-v3.png</span>
                    <span class="file-meta">12 分钟前 · 8.1 MB</span>
                  </div>
                </div>
                <span class="file-tag">图片</span>
              </li>
              <li class="file-item">
                <div class="file-main">
                  <span class="file-icon">📦</span>
                  <div class="file-text">
                    <span class="file-name">release-build-20250301.zip</span>
                    <span class="file-meta">1 小时前 · 120 MB</span>
                  </div>
                </div>
                <span class="file-tag">归档</span>
              </li>
            </ul>
          </div>

          <div class="panel panel-activity">
            <div class="panel-header">
              <h2>活动时间线</h2>
            </div>
            <ul class="timeline">
              <li class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">上传了文件 “封面插画-v3.png”</div>
                  <div class="timeline-meta">今天 · 12:28</div>
                </div>
              </li>
              <li class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">新建空间 “二次元作品集”</div>
                  <div class="timeline-meta">昨天 · 21:10</div>
                </div>
              </li>
              <li class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-title">分享链接给 “队友-01”</div>
                  <div class="timeline-meta">昨天 · 18:02</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
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

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 22px;
}

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

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(10, 14, 38, 0.96);
  border: 1px solid rgba(123, 167, 255, 0.35);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.6);
}

.stat-label {
  font-size: 12px;
  color: #a7b4d8;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-desc {
  font-size: 12px;
  color: #8f9bc2;
}

.panel-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  flex: 1;
}

.panel {
  border-radius: 18px;
  padding: 14px 16px;
  background: rgba(10, 14, 38, 0.96);
  border: 1px solid rgba(123, 167, 255, 0.35);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.panel-header h2 {
  font-size: 15px;
  margin: 0;
}

.panel-action {
  border: none;
  background: transparent;
  color: #9dc5ff;
  font-size: 12px;
  cursor: pointer;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6px;
  border-radius: 10px;
  transition: background 0.12s ease;
}

.file-item:hover {
  background: rgba(33, 44, 82, 0.8);
}

.file-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
}

.file-text {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 13px;
}

.file-meta {
  font-size: 11px;
  color: #8f9bc2;
}

.file-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(155, 181, 255, 0.16);
  color: #d9e3ff;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-item {
  display: flex;
  gap: 8px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9ad8, #9bb5ff);
  margin-top: 4px;
  box-shadow: 0 0 12px rgba(155, 181, 255, 0.8);
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-size: 13px;
}

.timeline-meta {
  font-size: 11px;
  color: #8f9bc2;
}

@media (max-width: 960px) {
  .panel-row {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>

