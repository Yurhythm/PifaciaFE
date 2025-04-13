import 'bootstrap/dist/css/bootstrap.min.css'
import 'select2/dist/css/select2.min.css'
import $ from 'jquery';
window.$ = window.jQuery = $

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
