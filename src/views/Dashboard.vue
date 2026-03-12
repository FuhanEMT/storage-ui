<template>
  <div>
    <!-- 控制台标题 + 权限标识 -->
    <header class="console-header">
      <div class="console-title-wrap">
        <h1 class="console-title">控制台终端</h1>
        <span class="console-badge">最高权限</span>
      </div>
      <p class="console-desc">Storage Garden · 全量数据与系统状态一览</p>
    </header>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <button class="quick-btn">
        <span class="quick-icon">📤</span>
        <span>上传文件</span>
      </button>
      <button class="quick-btn">
        <span class="quick-icon">📁</span>
        <span>新建空间</span>
      </button>
      <button class="quick-btn">
        <span class="quick-icon">🔗</span>
        <span>创建分享</span>
      </button>
      <button class="quick-btn">
        <span class="quick-icon">⚙️</span>
        <span>系统设置</span>
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">已用存储</div>
        <div class="stat-value">128 GB</div>
        <div class="stat-desc">总配额 1 TB</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width: 12.5%"></div></div>
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
      <div class="stat-card">
        <div class="stat-label">今日上传</div>
        <div class="stat-value">42</div>
        <div class="stat-desc">文件数</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">分享链接</div>
        <div class="stat-value">6</div>
        <div class="stat-desc">有效中</div>
      </div>
    </div>

    <!-- 两列：最近文件 + 活动时间线 -->
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
          <li class="file-item">
            <div class="file-main">
              <span class="file-icon">🎵</span>
              <div class="file-text">
                <span class="file-name">OP-ED合集.mp3</span>
                <span class="file-meta">2 小时前 · 45 MB</span>
              </div>
            </div>
            <span class="file-tag">音频</span>
          </li>
          <li class="file-item">
            <div class="file-main">
              <span class="file-icon">📋</span>
              <div class="file-text">
                <span class="file-name">角色设定表.xlsx</span>
                <span class="file-meta">昨天 · 1.2 MB</span>
              </div>
            </div>
            <span class="file-tag">表格</span>
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
          <li class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">删除了过期分享链接</div>
              <div class="timeline-meta">昨天 · 14:00</div>
            </div>
          </li>
          <li class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">重命名文件夹 “线稿” → “成品”</div>
              <div class="timeline-meta">3 天前</div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 底部：系统状态 + 权限信息 -->
    <div class="bottom-row">
      <div class="panel panel-system">
        <div class="panel-header">
          <h2>系统状态</h2>
          <span class="status-dot status-ok"></span>
        </div>
        <ul class="system-list">
          <li><span class="sys-label">存储服务</span><span class="sys-value">正常</span></li>
          <li><span class="sys-label">API 网关</span><span class="sys-value">正常</span></li>
          <li><span class="sys-label">索引服务</span><span class="sys-value">正常</span></li>
          <li><span class="sys-label">最后同步</span><span class="sys-value">刚刚</span></li>
        </ul>
      </div>
      <div class="panel panel-permission">
        <div class="panel-header">
          <h2>当前权限</h2>
        </div>
        <div class="permission-content">
          <div class="permission-badge">超级管理员</div>
          <p class="permission-desc">可管理全部空间、用户与系统配置</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
/* 控制台标题 */
.console-header {
  margin-bottom: 4px;
}
.console-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.console-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff9ad8 0%, #9bb5ff 50%, #b0ffea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
}
.console-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 154, 216, 0.35), rgba(155, 181, 255, 0.4));
  color: #0d1020;
  font-weight: 600;
  box-shadow: 0 0 14px rgba(255, 154, 216, 0.4);
}
.console-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8f9bc2;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(123, 167, 255, 0.35);
  background: rgba(10, 14, 38, 0.9);
  color: #c4cdef;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.quick-btn:hover {
  background: rgba(33, 44, 82, 0.9);
  border-color: rgba(155, 181, 255, 0.5);
  box-shadow: 0 0 20px rgba(155, 181, 255, 0.2);
}
.quick-icon {
  font-size: 14px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.stat-bar {
  height: 4px;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(33, 44, 82, 0.9);
  overflow: hidden;
}
.stat-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff9ad8, #9bb5ff);
  box-shadow: 0 0 10px rgba(155, 181, 255, 0.6);
  transition: width 0.3s ease;
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

/* 底部：系统状态 + 权限 */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.panel-system .panel-header,
.panel-permission .panel-header {
  margin-bottom: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6bcb77;
  box-shadow: 0 0 10px rgba(107, 203, 119, 0.8);
}
.system-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.system-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.sys-label {
  color: #a7b4d8;
}
.sys-value {
  color: #b0ffea;
  font-weight: 500;
}
.permission-content {
  padding: 4px 0;
}
.permission-badge {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 154, 216, 0.25), rgba(155, 181, 255, 0.3));
  color: #e8ecff;
  border: 1px solid rgba(255, 154, 216, 0.4);
  margin-bottom: 8px;
  box-shadow: 0 0 16px rgba(155, 181, 255, 0.2);
}
.permission-desc {
  margin: 0;
  font-size: 12px;
  color: #8f9bc2;
}

@media (max-width: 960px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .panel-row {
    grid-template-columns: 1fr;
  }
  .bottom-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .quick-actions {
    flex-wrap: wrap;
  }
}
</style>
