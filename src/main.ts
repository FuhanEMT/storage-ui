import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  create,
  NButton,
  NMenu,
  NModal,
  NMessageProvider,
  NDropdown,
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
} from 'naive-ui'
import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import 'vxe-pc-ui/es/style.css'
import 'vxe-table/es/style.css'

import App from './App.vue'
import router from './router'
import { msg } from '@/plugins/message'
import { useUserStore } from '@/stores/user'

const app = createApp(App)

app.use(VxeUI)
app.use(VxeUITable)

const naive = create({
  components: [
    NButton,
    NMenu,
    NModal,
    NMessageProvider,
    NDropdown,
    NForm,
    NFormItem,
    NInput,
    NRadio,
    NRadioGroup,
  ],
})

app.config.globalProperties.msg = msg

app.use(createPinia())
app.use(router)
app.use(naive)

const userStore = useUserStore()
userStore.initFromStorage()

app.mount('#app')
