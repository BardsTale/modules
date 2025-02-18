import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import langKr from 'quasar/lang/ko-KR';
import { Quasar, Dialog } from 'quasar';
import 'quasar/dist/quasar.sass'; // Quasar의 기본 스타일
import '@quasar/extras/material-icons/material-icons.css'; // 선택한 아이콘 패키지
const app = createApp(App)
app.use(Quasar,
  {
    lang: langKr,
    plugins: {
      Dialog, // 커스텀 얼럿용
    },
  });

app.use(createPinia())
app.use(router)

app.mount('#app')
