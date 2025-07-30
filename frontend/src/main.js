import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Impor semua CSS Anda (tidak perlu diubah)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'animate.css'
import 'aos/dist/aos.css'
import './assets/global.css'

import AOS from 'aos'

// Buat instance aplikasi Vue
const app = createApp(App)

// 2. Buat instance Pinia
const pinia = createPinia()

// 3. Beritahu aplikasi Vue untuk menggunakan Pinia dan Router
app.use(pinia)
app.use(router)

// Mount aplikasi ke elemen #app di HTML
app.mount('#app')

// Inisialisasi AOS (tidak perlu diubah)
AOS.init({ duration: 800, once: true })
