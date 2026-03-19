import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  /**
   * Guard de navegación para proteger rutas.
   */
  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
    const isPublic = to.matched.some((record) => record.meta.public);

    // Rutas públicas: permitir acceso
    if (isPublic) {
      // Si ya está autenticado y va a login/register, redirigir a home
      if (authStore.isAuthenticated) {
        next('/');
      } else {
        next();
      }
      return;
    }

    // Rutas protegidas: verificar autenticación
    if (requiresAuth) {
      if (!authStore.isAuthenticated) {
        next('/login');
        return;
      }

      // Verificar si requiere admin
      if (requiresAdmin && !authStore.isAdmin) {
        next('/');
        return;
      }
    }

    next();
  });

  return Router;
});
