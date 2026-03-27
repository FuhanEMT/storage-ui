import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const adminBg = ref('')
  function setSystem(data: { user_admin_bg?: string } | null) {
    adminBg.value = data?.user_admin_bg ? String(data.user_admin_bg) : ''
  }
  return { adminBg, setSystem }
})
