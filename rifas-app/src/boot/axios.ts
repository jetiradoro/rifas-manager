import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar';
import { appConfig } from 'src/config';

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

const TOKEN_KEY = 'auth_token';

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  api.interceptors.request.use((config) => {
    // Priorizar JWT si existe
    const jwtToken = localStorage.getItem(TOKEN_KEY);
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    } else if (appConfig.apiToken) {
      // Fallback al token de API para peticiones públicas
      config.headers.Authorization = `Bearer ${appConfig.apiToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const data = error.response?.data;
      const responseMessage = typeof data === 'string' ? data : data?.message || data?.error;
      const message = responseMessage || error.message || 'Se produjo un error en la petición';
      Notify.create({
        message,
        color: 'negative',
        position: 'bottom',
        timeout: 5000,
      });
      return Promise.reject(error instanceof Error ? error : new Error(message));
    },
  );
});

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: typeof axios;
    $api: typeof api;
  }
}
