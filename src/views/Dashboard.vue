<template>
  <MainLayout>
    <!-- 左侧菜单 -->
    <template #sidebar>
      <SidebarMenu />
    </template>

    <!-- 顶部头部 -->
    <template #header>
      <HeaderBar />
    </template>

    <!-- 右侧主体内容：上方统计 + 下方两列面板 -->
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
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layout/MainLayout.vue'
import SidebarMenu from '@/layout/SidebarMenu.vue'
import HeaderBar from '@/layout/HeaderBar.vue'
</script>

<style scoped>
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
}
</style>
