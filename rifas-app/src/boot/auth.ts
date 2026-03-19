import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

/**
 * Inicializa el store de autenticación al cargar la app.
 * Restaura la sesión del usuario desde el token guardado en localStorage.
 */
export default boot(async () => {
  const authStore = useAuthStore();
  await authStore.initialize();
});
