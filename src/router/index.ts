import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

// import RouteViewComponent from '../layouts/RouterBypass.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: { name: 'dashboard' },
    children: [
      {
        name: 'oteador',
        path: 'oteador',
        component: () => import('../pages/Oteador/Oteador.vue'),
      },
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/Dashboard/Dashboard.vue'),
      },
      {
        name: 'change-password',
        path: 'change-password',
        component: () => import('../pages/auth/Changepassword.vue'),
      },
      {
        name: 'search-by-user',
        path: 'search-by-user',
        component: () => import('../pages/SearchByUser/SearchByUser.vue'),
      },
      {
        name: 'search-by-course',
        path: 'search-by-course',
        component: () => import('../pages/SearchByCourse/SearchByCourse.vue'),
      }, 
      {
        name: 'search-by-group',
        path: 'search-by-group',
        meta: { requiresProfessor: true },
        component: () => import('../pages/SearchByGroup/SearchByGroup.vue'),
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/PasswordReset.vue'),
      },
      {
        name: 'recover-password-username',
        path: 'recover-password-username',
        component: () => import('../pages/auth/CheckTheEmail.vue'),
      },
      {
        name: 'password-reset-confirm',
        path: 'password-reset-confirm',
        component: () => import('../pages/auth/PasswordResetConfirm.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  // {
  //   name: '404',
  //   path: '/404',
  //   component: () => import('../pages/404.vue'),
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth) || authStore.user) {
    await authStore.refreshUser()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const requiresProfessor = to.matched.some((record) => record.meta.requiresProfessor)

  if (requiresGuest && authStore.user) {
    next({ name: 'dashboard' })
  } else if (requiresProfessor && !authStore.isProfessor) {
    next({ name: 'dashboard' })
  } else if (requiresAuth && !authStore.user) {
    await authStore.logout().catch(() => null)
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
