import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rutas públicas (con AuthLayout)
  {
    path: '/app',
    component: () => import('src/modules/auth/layouts/AuthLayout.vue'),
    children: [
      {
        path: '/privacy-policy',
        name: 'privacy-policy',
        component: () => import('src/pages/PrivacyPolicyPage.vue'),
      },
      {
        path: '/terms-of-service',
        name: 'terms-of-service',
        component: () => import('src/pages/TermsOfServicePage.vue'),
      },
    ],
  },

  {
    path: '/auth',
    component: () => import('src/modules/auth/layouts/AuthLayout.vue'),
    children: [
      {
        path: '/login',
        name: 'login',
        component: () => import('src/modules/auth/pages/LoginPage.vue'),
        meta: { public: true },
      },
      // TODO: pendiente de mejorar la gestión de usuarios registrados libremente
      // {
      //   path: '/register',
      //   name: 'register',
      //   component: () => import('src/modules/auth/pages/RegisterPage.vue'),
      //   meta: { public: true },
      // },
    ],
  },

  // Rutas protegidas (con layout y autenticación)
  {
    path: '/',
    component: () => import('src/modules/rifas/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'rifas',
        component: () => import('src/modules/rifas/pages/RifasPage.vue'),
      },
      {
        path: 'rifas/:id',
        name: 'rifa-detail',
        component: () => import('src/modules/rifas/pages/RifaDetailPage.vue'),
      },
      {
        path: 'persons',
        name: 'persons',
        component: () => import('src/modules/persons/pages/PersonsPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'persons/:id',
        name: 'person-detail',
        component: () => import('src/modules/persons/pages/PersonDetailPage.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('src/modules/users/pages/UsersPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('src/modules/users/pages/ProfilePage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
