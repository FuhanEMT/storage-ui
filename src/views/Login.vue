<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-illustration">
        <div v-if="!avatar" class="anime-hero placeholder"></div>
        <img v-else class="anime-hero" :src="avatar" alt="login illustration" />
      </div>

      <div class="login-content">
        <div class="login-logo">
          <div class="logo-mark"></div>
          <span class="logo-text">Storage Garden</span>
        </div>

        <h1 class="login-title">欢迎回来，指挥官</h1>
        <p class="login-subtitle">这里是无何有境，寓意新的世界</p>

        <form class="login-form" @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">账号</span>
            <input
              v-model="username"
              type="text"
              placeholder="请输入账号 ID"
              autocomplete="username"
              @blur="onUsernameBlur"
            />
          </label>

          <label class="field">
            <span class="field-label">密码</span>
            <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
          </label>

          <div class="login-actions">
            <label class="remember-me">
              <input v-model="rememberMe" type="checkbox" />
              <span>下次自动登录</span>
            </label>

            <button type="button" class="link-button">忘记密码？</button>
          </div>

          <button type="submit" class="submit-button">进入存储世界</button>
        </form>

        <!-- <p class="login-footer">
          初次见面？
          <button type="button" class="link-button">申请新账号</button>
        </p> -->
      </div>
    </div>

    <div class="login-bg-decor">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import put, { getAll } from '@/services/addData'

const router = useRouter()

const username = ref('')
const password = ref('')
const rememberMe = ref(true)
const avatar = ref('')

onMounted(() => {
  put('user_account', {
    id: '000',
    username: 'Omaxinge',
    password: 'Lxk4865119.',
    avatar: '/assets/icon/jiedeng.jpg',
    create_time: new Date().toISOString(),
    update_time: new Date().toISOString(),
  })
})

async function onUsernameBlur() {
  if (!username.value) {
    avatar.value = ''
    return
  }

  const result = (await getAll('user_account')) as any[]
  const user = result.find((u: any) => u.username === username.value)

  avatar.value = user?.avatar ?? ''
}

async function onSubmit() {
  // 查表并校验账号密码
  const result = (await getAll('user_account')) as any[]

  const user = result.find((u: any) => u.username === username.value)

  if (!user) {
    console.log('账号不存在')
    return
  }

  if (user.password !== password.value) {
    console.log('密码错误')
    return
  }

  console.log('登录成功')
  router.push('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #2a344f 0, #101322 45%, #050712 100%);
  color: #f7f8ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.login-card {
  position: relative;
  display: flex;
  gap: 32px;
  max-width: 960px;
  width: 100%;
  background: rgba(16, 18, 34, 0.9);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(123, 167, 255, 0.25);
  backdrop-filter: blur(22px);
  padding: 32px 40px;
  z-index: 1;
}

.login-illustration {
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anime-hero {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  box-shadow:
    0 22px 40px rgba(0, 0, 0, 0.85),
    0 0 40px rgba(163, 202, 255, 0.35);
  object-fit: cover;
  animation: avatarFadeIn 260ms ease-out;
}

.anime-hero.placeholder {
  animation: none;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.2) 0, transparent 55%),
    radial-gradient(circle at 0% 100%, rgba(255, 170, 216, 0.35) 0, transparent 60%),
    radial-gradient(circle at 100% 0%, rgba(150, 190, 255, 0.45) 0, transparent 55%),
    linear-gradient(145deg, #1a1e35, #191329);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 22px 40px rgba(0, 0, 0, 0.85),
    0 0 40px rgba(163, 202, 255, 0.35);
}

@keyframes avatarFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.login-content {}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #ff9ad8, #9bb5ff, #b0ffea, #ff9ad8);
  box-shadow:
    0 0 16px rgba(255, 154, 216, 0.7),
    0 0 26px rgba(155, 181, 255, 0.8);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #e0ebff;
}

.login-title {
  font-size: 26px;
  margin: 0 0 8px;
}

.login-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  color: #a7b4d8;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: #c0c8e6;
}

.field input {
  border-radius: 999px;
  border: 1px solid rgba(140, 170, 255, 0.4);
  background: rgba(8, 11, 30, 0.9);
  padding: 10px 14px;
  color: #f7f8ff;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.field input::placeholder {
  color: #727ba0;
}

.field input:focus {
  border-color: #8bb4ff;
  box-shadow: 0 0 0 1px rgba(139, 180, 255, 0.45);
  background: rgba(16, 20, 46, 0.95);
}

.login-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #c0c8e6;
}

.remember-me input {
  accent-color: #8bb4ff;
}

.link-button {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  color: #9dc5ff;
  cursor: pointer;
  text-decoration: none;
  position: relative;
}

.link-button::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #ff8ad4, #8bb4ff);
  transition: width 0.18s ease;
}

.link-button:hover::after {
  width: 100%;
}

.submit-button {
  margin-top: 12px;
  width: 100%;
  border-radius: 999px;
  border: none;
  padding: 11px 16px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  color: #121425;
  background: linear-gradient(135deg, #ff9ad8, #9bb5ff);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.65);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    filter 0.12s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8);
  filter: brightness(1.04);
}

.submit-button:active {
  transform: translateY(1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.7);
}

.login-footer {
  margin-top: 18px;
  font-size: 13px;
  color: #98a5d0;
}

.login-bg-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(40px);
  opacity: 0.7;
}

.orb-1 {
  width: 260px;
  height: 260px;
  background: rgba(151, 206, 255, 0.6);
  top: -40px;
  right: 8%;
}

.orb-2 {
  width: 220px;
  height: 220px;
  background: rgba(255, 162, 211, 0.55);
  bottom: -60px;
  left: 12%;
}

.orb-3 {
  width: 180px;
  height: 180px;
  background: rgba(149, 119, 255, 0.55);
  top: 20%;
  left: -60px;
}

@media (max-width: 900px) {
  .login-card {
    flex-direction: column;
    padding: 24px 20px;
  }

  .login-illustration {
    order: -1;
  }

  .login-illustration img {
    max-width: 75%;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 20px 18px;
    gap: 20px;
  }

  .login-title {
    font-size: 22px;
  }
}
</style>
