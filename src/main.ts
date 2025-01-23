import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 三方库：解析错误信息栈
import ErrorStackParser from 'error-stack-parser'
import { findCodeBySourceMap } from './utils'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = async (err) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  console.warn('errorStack: ', errorStack)
  await findCodeBySourceMap(errorStack[0])
  //   console.warn('err: ', err)
  //   console.warn('vm: ', vm)
  //   console.warn('info: ', info)
}

app.mount('#app')
