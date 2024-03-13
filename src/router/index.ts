import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  // 使用 electron 必须用 hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: 'home',
      path: '/home',
      component: () => import('../views/Home.vue'),
    },
    {
      name: 'saveProfileDetail',
      path: '/saveProfileDetail/:id',
      component: () => import('../views/SaveProfileDetail.vue'),
    },
    {
      name: 'settings',
      path: '/settings',
      component: () => import('../views/Settings.vue'),
    }
  ]
});

export default router;
