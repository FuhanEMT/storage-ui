import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create, NButton, NMenu, NModal, NMessageProvider, NDropdown, NForm, NFormItem, NInput } from 'naive-ui'

import App from './App.vue'
import router from './router'
import { msg } from '@/plugins/message'
import { useUserStore } from '@/stores/user'

const app = createApp(App)

const naive = create({
  components: [NButton, NMenu, NModal, NMessageProvider, NDropdown, NForm, NFormItem, NInput],
})

app.config.globalProperties.msg = msg

app.use(createPinia())
app.use(router)
app.use(naive)

const userStore = useUserStore()
userStore.initFromStorage()

app.mount('#app')
