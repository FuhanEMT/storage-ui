<template>
  <div class="login-page">
    <div v-if="loginPageBgUrl" class="login-page-bg" :style="loginPageBgStyle" />
    <div class="login-card">
      <div v-if="loginCardBgUrl" class="login-card-bg" :style="loginCardBgStyle" />
      <div class="login-card-inner">
      <div class="login-illustration">
        <div v-if="!avatar" class="anime-hero placeholder"></div>
        <div v-else class="avatar-wrapper">
          <img class="anime-hero" :src="avatar" alt="login illustration" />
          <div class="particle-layer">
            <span
              v-for="n in 24"
              :key="n"
              class="particle"
            />
          </div>
        </div>
      </div>

      <div class="login-content">
        <div class="login-logo">
          <div class="logo-mark"></div>
          <span class="logo-text">Storage Garden</span>
        </div>

        <h1 class="login-title">欢迎回来，{{nickName || '无名氏'}}</h1>
        <p class="login-subtitle">这里是无何有境，<a class="subtitle-link" href="https://baike.baidu.com/item/%E6%97%A0%E4%BD%95%E6%9C%89%E5%A2%83/4572232" target="_blank" rel="noopener noreferrer">为何是无何有境？</a></p>

        <form class="login-form" @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">账号</span>
            <input v-model="username" type="text" placeholder="请输入账号 ID" autocomplete="username"
              @blur="onUsernameBlur" />
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
    </div>

    <div class="login-bg-decor">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/services/request'
// @ts-ignore
import CryptoJS from 'crypto-js';
import { msg } from '@/plugins/message'
const router = useRouter()

const username = ref('')
const password = ref('')
const rememberMe = ref(true)
const avatar = ref('')
const nickName = ref('')

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const loginCardBgUrl = ref('')
const loginPageBgUrl = ref('')
const toBgStyle = (val: string) => {
  if (!val) return {}
  const url = val.startsWith('data:') || val.startsWith('http') ? val : apiBase + val
  return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}
const loginCardBgStyle = computed(() => toBgStyle(loginCardBgUrl.value))
const loginPageBgStyle = computed(() => toBgStyle(loginPageBgUrl.value))

// 输入账号失焦时：拉取头像 + 拉取该账号的 system，若有则换登录页背景与卡片背景
async function onUsernameBlur() {
  if (!username.value) {
    loginCardBgUrl.value = ''
    loginPageBgUrl.value = ''
    return
  }
  try {
    const [avatarRes, systemRes] = await Promise.all([
      request.post('/admin/user/avatar', { username: username.value }),
      request.post('/admin/user/system-by-account', { username: username.value }),
    ]) as [any, any]
    avatar.value = avatarRes?.data?.avatar ?? ''
    nickName.value = avatarRes?.data?.username ?? ''
    const sys = systemRes?.data
    loginCardBgUrl.value = sys?.user_login_card_bg ? String(sys.user_login_card_bg) : ''
    loginPageBgUrl.value = sys?.user_login_bg ? String(sys.user_login_bg) : ''
  } catch {
    username.value = ''
    avatar.value = ''
    nickName.value = ''
    loginCardBgUrl.value = ''
    loginPageBgUrl.value = ''
  }
}

async function onSubmit() {
  // 查表并校验账号密码

  // const user = result.find((u: any) => u.username === username.value)

  // if (!user) {
  //   console.log('账号不存在')
  //   return
  // }

  // if (user.password !== password.value) {
  //   console.log('密码错误')
  //   return
  // }

  try {
    const res = (await request.post('/admin/user/login', {
      username: handleAESencryption(username.value, 'yuhi'),
      password: handleAESencryption(password.value, 'yuhi'),
    })) as { data?: Record<string, unknown>; message?: string }
    const data = res?.data ?? res
    msg.success(res?.message ?? '登录成功')
    const userStore = useUserStore()
    userStore.setUserInfo(typeof data === 'object' && data !== null ? data : {})
    router.push('/dashboard')
  } catch {
    msg.error('登录失败')
  }

  
}

// AES加密方法
const handleAESencryption = (data:string , key = 'yuhi') => {
  return CryptoJS.AES.encrypt(data, key).toString();
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

/* 登录页整页背景图 user_login_bg：半透明 + 淡入 */
.login-page-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
  animation: loginPageBgFadeIn 0.6s ease-out;
}
@keyframes loginPageBgFadeIn {
  from { opacity: 0; }
  to { opacity: 0.35; }
}
.login-page > .login-card,
.login-page > .login-bg-decor {
  position: relative;
  z-index: 1;
}

.login-card {
  position: relative;
  display: flex;
  max-width: 960px;
  width: 100%;
  background: rgba(16, 18, 34, 0.92);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(123, 167, 255, 0.25);
  backdrop-filter: blur(22px);
  padding: 32px 40px;
  z-index: 1;
  overflow: hidden;
}

/* 背景图层：半透明 + 淡入动画，不挡文字 */
.login-card-bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-size: cover;
  background-position: center;
  opacity: 0.32;
  pointer-events: none;
  z-index: 0;
  animation: loginCardBgFadeIn 0.5s ease-out;
}

@keyframes loginCardBgFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.32;
  }
}

.login-card-inner {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 32px;
  width: 100%;
}

.login-illustration {
  flex: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
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

/* 只有真实头像图片缓慢自转，placeholder 不转 */
.avatar-wrapper .anime-hero {
  animation:
    avatarFadeIn 260ms ease-out,
    avatarSlowSpin 26s linear infinite;
  transform-origin: center center;
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

@keyframes avatarSlowSpin {
  from {
    transform: scale(1) rotate(0deg);
  }

  to {
    transform: scale(1) rotate(360deg);
  }
}

.particle-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  filter: blur(0.5px);
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
  opacity: 0;
  animation: particle-attract 4.2s linear infinite;
  top: 50%;
  left: 50%;
}

@keyframes particle-attract {
  0% {
    transform: translate(calc(var(--sx) * 1.8), calc(var(--sy) * 1.8)) scale(0.4);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    transform: translate(var(--sx), var(--sy)) scale(0.9);
    opacity: 0;
  }
}

.particle:nth-child(1) {
  --sx: -110px;
  --sy: -60px;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  --sx: -120px;
  --sy: 40px;
  animation-delay: 0.4s;
}

.particle:nth-child(3) {
  --sx: -80px;
  --sy: 100px;
  animation-delay: 0.8s;
}

.particle:nth-child(4) {
  --sx: 110px;
  --sy: -60px;
  animation-delay: 1.2s;
}

.particle:nth-child(5) {
  --sx: 120px;
  --sy: 40px;
  animation-delay: 1.6s;
}

.particle:nth-child(6) {
  --sx: 80px;
  --sy: 100px;
  animation-delay: 2s;
}

.particle:nth-child(7) {
  --sx: 0px;
  --sy: -120px;
  animation-delay: 2.4s;
}

.particle:nth-child(8) {
  --sx: -60px;
  --sy: -120px;
  animation-delay: 2.8s;
}

.particle:nth-child(9) {
  --sx: 60px;
  --sy: -120px;
  animation-delay: 3.2s;
}

.particle:nth-child(10) {
  --sx: 0px;
  --sy: 120px;
  animation-delay: 3.6s;
}

.particle:nth-child(11) {
  --sx: -90px;
  --sy: 115px;
  animation-delay: 4s;
}

.particle:nth-child(12) {
  --sx: 90px;
  --sy: 115px;
  animation-delay: 4.4s;
}

.particle:nth-child(13) {
  --sx: -130px;
  --sy: -10px;
  animation-delay: 4.8s;
}

.particle:nth-child(14) {
  --sx: 130px;
  --sy: 0px;
  animation-delay: 5.2s;
}

.particle:nth-child(15) {
  --sx: -40px;
  --sy: -110px;
  animation-delay: 5.6s;
}

.particle:nth-child(16) {
  --sx: 40px;
  --sy: -110px;
  animation-delay: 6s;
}

.particle:nth-child(17) {
  --sx: -110px;
  --sy: -10px;
  animation-delay: 6.4s;
}

.particle:nth-child(18) {
  --sx: 110px;
  --sy: 10px;
  animation-delay: 6.8s;
}

.particle:nth-child(19) {
  --sx: -70px;
  --sy: 60px;
  animation-delay: 7.2s;
}

.particle:nth-child(20) {
  --sx: 70px;
  --sy: 60px;
  animation-delay: 7.6s;
}

.particle:nth-child(21) {
  --sx: -30px;
  --sy: 115px;
  animation-delay: 8s;
}

.particle:nth-child(22) {
  --sx: 30px;
  --sy: 115px;
  animation-delay: 8.4s;
}

.particle:nth-child(23) {
  --sx: -120px;
  --sy: -90px;
  animation-delay: 8.8s;
}

.particle:nth-child(24) {
  --sx: 120px;
  --sy: 90px;
  animation-delay: 9.2s;
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

.subtitle-link {
  color: #b8d4ff;
  text-decoration: none;
  font-weight: 500;
  padding: 2px 6px;
  margin: 0 -6px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.subtitle-link:hover {
  color: #e0ebff;
  background: rgba(155, 181, 255, 0.12);
  box-shadow: 0 0 0 1px rgba(155, 181, 255, 0.2);
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
