<template>
  <header class="dashboard-header">
    <div class="breadcrumb">
      <span class="crumb">首页</span>
      <span class="crumb-separator">/</span>
      <span class="crumb is-active">控制面板</span>
    </div>

    <div class="user-info">
      <div class="user-text">
        <span class="user-name">{{ user?.user_name }}</span>
        <span class="user-role">无何有境 · {{ roleName(user?.role as string) }}</span>
      </div>
      <n-dropdown :options="avatarOptions" trigger="click" @select="onAvatarSelect">
        <div class="user-avatar">
          <img v-if="avatar" :src="avatar" alt="avatar" class="avatar-img" />
          <span v-else>{{ initials }}</span>
        </div>
      </n-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/services/request'
import { msg } from '@/plugins/message'

const router = useRouter()
const userStore = useUserStore()
const { userInfo: user } = userStore
const roles = ref<any[]>([])

const avatarOptions = [
  { label: '编辑个人资料', key: 'profile' },
  { label: '退出账号', key: 'logout' },
]

function onAvatarSelect(key: string) {
  if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'logout') {
    userStore.clearUserInfo()
    msg.info('已退出登录')
    router.push('/login')
  }
}

const avatar = computed(() => (user?.user_avatar ?? user?.avatar ?? '') as string)
const initials = computed(() => ((user?.user_name ?? user?.username ?? '') as string).slice(0, 2).toUpperCase() || '?')

onMounted(async () => {
  const res = await request.get('/admin/user/role')
  roles.value = res?.data ?? []
})

function roleName(role?: string) {
  if (!role) return ''
  return roles.value.find((r: any) => r.role_data === role)?.role_name ?? role
}
</script>

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
  overflow: hidden;
  cursor: pointer;
}
.user-avatar:hover {
  filter: brightness(1.05);
}

.user-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

