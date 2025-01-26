import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 三方库：解析错误信息栈
import ErrorStackParser from 'error-stack-parser'
import { findCodeBySourceMap } from './utils'

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import type { ErrorList } from './types'

const app = createApp(App)
app.use(ElementPlus)

app.use(createPinia())
app.use(router)

app.config.errorHandler = async (err: any, vm: any) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  // console.warn('errorStack: ', errorStack)

  const jsError: ErrorList = {
    stack_frames: errorStack,
    message: err.message,
    stack: err.stack,
    error_name: err.name,
  }
  vm && vm.$message.error(`触发了一个 ${err.name} 错误`);
  localStorage.setItem('jsErrorList', JSON.stringify(jsError));

  // await findCodeBySourceMap(errorStack[0])
}

app.mount('#app')



// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (event) => {
  if (event.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
// 初始化检查
if (mediaQuery.matches) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
