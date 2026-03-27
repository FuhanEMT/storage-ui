import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const USER_INFO_KEY = 'user-info'

export interface UserInfo {
  token?: string
  username?: string
  avatar?: string
  [key: string]: unknown
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const token = computed(() => userInfo.value?.token ?? null)
  const isLoggedIn = computed(() => !!token.value)

  function setUserInfo(data: UserInfo | null) {
    userInfo.value = data
    if (data) {
      try {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(data))
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  function clearUserInfo() {
    setUserInfo(null)
  }

  function initFromStorage() {
    try {
      const raw = localStorage.getItem(USER_INFO_KEY)
      if (raw) {
        const data = JSON.parse(raw) as UserInfo
        userInfo.value = data
      }
    } catch {
      userInfo.value = null
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    clearUserInfo,
    initFromStorage,
  }
})
