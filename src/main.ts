import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create, NButton, NMenu, NModal } from 'naive-ui'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 按需注册用到的 Naive UI 组件（这里新增 NModal）
const naive = create({
  components: [NButton, NMenu, NModal],
})

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
