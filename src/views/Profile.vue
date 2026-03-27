<template>
  <div class="profile-page">
    <header class="profile-header">
      <h1 class="profile-title">编辑个人资料</h1>
      <p class="profile-desc">管理你的账号信息与界面偏好</p>
    </header>

    <div class="profile-layout">
      <div class="profile-left">
        <label class="flat-field">
          <span class="flat-label">名称</span>
          <input v-model="basicData.user_name" type="text" placeholder="请输入名称" class="flat-input" />
        </label>
        <div class="flat-field">
          <span class="flat-label">密码</span>
          <button type="button" class="change-pwd-btn" @click="showPasswordModal = true">修改密码</button>
        </div>
        <div class="img-field">
          <span class="flat-label">头像</span>
          <div class="img-tile" @click="onPickAvatar">
            <img
              v-if="basicData.user_avatar && !imgErr.avatar"
              :src="imageSrc(basicData.user_avatar)"
              alt=""
              class="img-tile-preview"
              @error="imgErr.avatar = true"
            />
            <span v-else class="img-tile-plus">+</span>
          </div>
          <input
            v-model="basicData.user_avatar"
            type="text"
            placeholder="图片 URL"
            class="flat-input flat-input-sm"
            @blur="imgErr.avatar = false"
          />
        </div>
        <button type="button" class="save-btn" @click="saveLeft">保存</button>
      </div>

      <div class="profile-right">
        <div class="img-grid">
          <div v-for="item in rightImgFields" :key="item.key" class="img-field">
            <span class="flat-label">{{ item.label }}</span>
            <div class="img-tile img-tile-sm" @click="onPickBg(item)">
              <img
                v-if="prefsData[item.formKey] && !imgErr[item.key]"
                :src="imageSrc(prefsData[item.formKey])"
                alt=""
                class="img-tile-preview"
                @error="imgErr[item.key] = true"
              />
              <span v-else class="img-tile-plus">+</span>
            </div>
            <input
              :ref="(el: any) => item.inputRef = el"
              v-model="prefsData[item.formKey]"
              type="text"
              placeholder="URL"
              class="flat-input flat-input-sm"
              @blur="imgErr[item.key] = false"
            />
          </div>
        </div>
        <label class="flat-field flat-field-full">
          <span class="flat-label">个人简介</span>
          <textarea v-model="prefsData.user_remark" placeholder="介绍一下自己" class="flat-input flat-textarea" rows="4" />
        </label>
        <button type="button" class="save-btn" @click="saveRight">保存到库</button>
      </div>
    </div>

    <!-- 修改密码 -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="modal-mask" @click.self="closePwd">
        <div class="modal-box">
          <h3 class="modal-title">修改密码</h3>
          <label class="flat-field">
            <span class="flat-label">旧密码</span>
            <input v-model="pwdForm.oldPassword" type="password" placeholder="请输入旧密码" class="flat-input" />
          </label>
          <label class="flat-field">
            <span class="flat-label">新密码</span>
            <input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码" class="flat-input" />
          </label>
          <label class="flat-field">
            <span class="flat-label">确认新密码</span>
            <input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" class="flat-input" />
          </label>
          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn-cancel" @click="closePwd">取消</button>
            <button type="button" class="modal-btn modal-btn-ok" @click="confirmPwd">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import { msg } from '@/plugins/message'
import request from '@/services/request'
import { openImageCropper } from '@/services/imageCropper'

const userStore = useUserStore()
const systemStore = useSystemStore()
const basicData = reactive({ user_name: '', user_avatar: '', user_password: '' })
const prefsData = reactive({
  user_admin_bg: '',
  user_login_card_bg: '',
  user_login_bg: '',
  user_remark: '',
})
const imgErr = reactive<Record<string, boolean>>({ avatar: false, adminBg: false, loginCardBg: false, loginBg: false })

const rightImgFields = reactive([
  { key: 'adminBg', label: '后台背景', formKey: 'user_admin_bg' as const, inputRef: null as HTMLInputElement | null },
  { key: 'loginCardBg', label: '登录卡片背景', formKey: 'user_login_card_bg' as const, inputRef: null as HTMLInputElement | null },
  { key: 'loginBg', label: '登录页背景', formKey: 'user_login_bg' as const, inputRef: null as HTMLInputElement | null },
])

const showPasswordModal = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const str = (v: unknown, fallback = '') => (v != null ? String(v) : fallback)
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
function imageSrc(val: string) {
  if (!val) return ''
  return val.startsWith('data:') ? val : apiBase + val
}
async function initFromStore() {
  const u = userStore.userInfo
  if (!u) return
  basicData.user_name = str(u.user_name ?? u.username)
  basicData.user_avatar = str(u.user_avatar ?? u.avatar)
  try {
    const res = await request.get('/admin/user/system')
    const sys = res?.data as Record<string, unknown> | null
    if (sys) {
      prefsData.user_admin_bg = str(sys.user_admin_bg)
      prefsData.user_login_card_bg = str(sys.user_login_card_bg)
      prefsData.user_login_bg = str(sys.user_login_bg)
      prefsData.user_remark = str(sys.user_remark)
    }
  } catch {
    // 无数据时保持空，忽略
  }
}

async function saveLeft() {
  try {
    const payload: Record<string, string> = { ...basicData }
    if (!payload.user_password) delete payload.user_password
    const res = await request.post('/admin/user/profile', payload)
    if (res?.data) userStore.setUserInfo({ ...userStore.userInfo, ...res.data })
    basicData.user_password = ''
    msg.success('已保存基本信息')
  } catch {
    msg.error('保存失败')
  }
}

async function saveRight() {
  try {
    const payload = { ...prefsData }
    await request.post('/admin/user/system', {
      user_admin_bg: payload.user_admin_bg,
      user_login_card_bg: payload.user_login_card_bg,
      user_login_bg: payload.user_login_bg,
      user_remark: payload.user_remark,
    })
    prefsData.user_admin_bg = payload.user_admin_bg
    prefsData.user_login_card_bg = payload.user_login_card_bg
    prefsData.user_login_bg = payload.user_login_bg
    systemStore.setSystem({ user_admin_bg: payload.user_admin_bg })
    msg.success('已保存界面与简介')
  } catch {
    msg.error('保存失败')
  }
}

function closePwd() {
  showPasswordModal.value = false
  Object.assign(pwdForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
}

function confirmPwd() {
  const { newPassword, confirmPassword } = pwdForm
  if (!newPassword || !confirmPassword) {
    msg.warning('请填写新密码和确认新密码')
    return
  }
  if (newPassword !== confirmPassword) {
    msg.warning('两次输入的新密码不一致')
    return
  }
  basicData.user_password = newPassword
  closePwd()
  msg.success('密码已修改')
}

async function onPickAvatar() {
  try {
    const url = await openImageCropper({ title: '头像', shape: 'circle' })
    basicData.user_avatar = url
    imgErr.avatar = false
    msg.success('头像已更新')
  } catch {
    // ignore
  }
}

async function onPickBg(item: { key: string; label: string; formKey: 'user_admin_bg' | 'user_login_card_bg' | 'user_login_bg' }) {
  try {
    const url = await openImageCropper({ title: item.label, shape: 'rect', aspectRatio: 16 / 10 })
    prefsData[item.formKey] = url
    imgErr[item.key] = false
    msg.success(`${item.label}已更新，点击「保存到库」写入数据库`)
  } catch {
    // ignore
  }
}

onMounted(initFromStore)
</script>

<style scoped>
.profile-page { padding: 24px 28px 48px; max-width: 900px; margin: 0 auto; }
.profile-header { margin-bottom: 28px; }
.profile-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff9ad8 0%, #9bb5ff 50%, #b0ffea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
}
.profile-desc { margin: 6px 0 0; font-size: 13px; color: #8f9bc2; }
.profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: start; }
.profile-left, .profile-right { display: flex; flex-direction: column; gap: 20px; }

.flat-field { display: flex; flex-direction: column; gap: 8px; }
.flat-field-full { flex: 1; min-height: 0; }
.flat-label { font-size: 12px; font-weight: 500; color: #a7b4d8; }
.flat-input {
  border-radius: 10px;
  border: 1px solid rgba(123, 167, 255, 0.3);
  background: rgba(8, 11, 30, 0.85);
  padding: 10px 14px;
  color: #e0ebff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.flat-input::placeholder { color: #5a658a; }
.flat-input:focus { border-color: #8bb4ff; box-shadow: 0 0 0 2px rgba(139, 180, 255, 0.2); }
.flat-input-sm { padding: 6px 10px; font-size: 12px; }
.flat-textarea { resize: vertical; min-height: 96px; }

.change-pwd-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(123, 167, 255, 0.4);
  background: rgba(16, 20, 42, 0.9);
  color: #9dc5ff;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.change-pwd-btn:hover { border-color: rgba(155, 181, 255, 0.6); background: rgba(28, 36, 68, 0.95); }

.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-box {
  width: 90%;
  max-width: 360px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(12, 16, 38, 0.98);
  border: 1px solid rgba(123, 167, 255, 0.3);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
}
.modal-box .flat-field { margin-bottom: 14px; }
.modal-box .flat-field:last-of-type { margin-bottom: 20px; }
.modal-title { margin: 0 0 20px; font-size: 16px; font-weight: 600; color: #e0ebff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.modal-btn {
  padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: opacity 0.2s ease;
}
.modal-btn-cancel { border: 1px solid rgba(123, 167, 255, 0.4); background: transparent; color: #a7b4d8; }
.modal-btn-cancel:hover { opacity: 0.9; }
.modal-btn-ok { border: none; background: linear-gradient(135deg, #ff9ad8, #9bb5ff); color: #0d1020; }
.modal-btn-ok:hover { opacity: 0.95; }

.img-field { display: flex; flex-direction: column; gap: 8px; }
.img-tile {
  width: 120px; height: 120px;
  border-radius: 12px;
  border: 2px dashed rgba(123, 167, 255, 0.4);
  background: rgba(16, 20, 42, 0.8);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.img-tile:hover { border-color: rgba(155, 181, 255, 0.6); background: rgba(24, 30, 58, 0.9); }
/* 背景图：长方形预览 */
.img-tile-sm { width: 100%; aspect-ratio: 16/10; max-width: 200px; max-height: 125px; border-radius: 10px; }
.img-tile-preview { width: 100%; height: 100%; object-fit: cover; }
.img-tile-plus { font-size: 32px; font-weight: 300; color: rgba(155, 181, 255, 0.6); line-height: 1; user-select: none; }
.img-tile-sm .img-tile-plus { font-size: 28px; }
.img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 4px; }
.img-grid .img-field { min-width: 0; }
.img-grid .img-tile-sm { max-width: 100%; }

.save-btn {
  margin-top: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #0d1020;
  background: linear-gradient(135deg, #ff9ad8, #9bb5ff);
  box-shadow: 0 4px 16px rgba(155, 181, 255, 0.3);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(155, 181, 255, 0.4); filter: brightness(1.05); }
.save-btn:active { transform: translateY(0); }

@media (max-width: 700px) {
  .profile-layout { grid-template-columns: 1fr; }
  .img-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 420px) { .img-grid { grid-template-columns: 1fr; } }
</style>
