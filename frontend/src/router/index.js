import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

import Home from '@/views/Home.vue'
import ConsoleHandheld from '@/views/ConsoleHandheld.vue'
import Laptop from '@/views/Laptop.vue'
import Hardware from '@/views/Hardware.vue'
import PaketRakitan from '@/views/PaketRakitan.vue'
import CustomerService from '@/views/CustomerService.vue'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
  { path: '/', name: 'home', component: Home, meta: { requiresAuth: true } },
  { path: '/laptop', name: 'Laptop', component: Laptop, meta: { requiresAuth: true } },
  { path: '/consolehh', name: 'ConsoleHandheldpc', component: ConsoleHandheld, meta: { requiresAuth: true } },
  { path: '/hardware', name: 'Hardware', component: Hardware, meta: { requiresAuth: true } },
  { path: '/paketrakitan', name: 'PaketRakitan', component: PaketRakitan, meta: { requiresAuth: true } },
  { path: '/cs', name: 'CS', component: CustomerService, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isAuthenticated;
  const targetRouteRequiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (targetRouteRequiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;