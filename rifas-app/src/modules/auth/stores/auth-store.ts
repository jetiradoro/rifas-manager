import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';
import { jwtDecode } from 'jwt-decode';

/**
 * Usuario del sistema.
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  personId?: number;
  googleId?: string;
}

/**
 * Payload de login.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload de registro.
 */
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

/**
 * Payload para actualizar perfil.
 */
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

/**
 * Payload para actualizar contraseña.
 */
export interface UpdatePasswordPayload {
  // currentPassword: string;
  newPassword: string;
}

/**
 * Respuesta de autenticación.
 */
interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Payload del JWT decodificado.
 */
interface JwtPayload {
  sub: number;
  email: string;
  role: 'admin' | 'user';
  exp: number;
}

const TOKEN_KEY = 'auth_token';

/**
 * Store de autenticación.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(TOKEN_KEY),
    loading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Indica si el usuario está autenticado.
     */
    isAuthenticated: (state) => !!state.token && !!state.user,

    /**
     * Indica si el usuario es administrador.
     */
    isAdmin: (state) => state.user?.role === 'admin',

    /**
     * Indica si el usuario es un usuario normal.
     */
    isUser: (state) => state.user?.role === 'user',

    /**
     * Obtiene el ID de la persona asociada al usuario.
     */
    userPersonId: (state) => state.user?.personId,
  },

  actions: {
    /**
     * Inicializa el store desde el token guardado.
     */
    async initialize() {
      if (this.token) {
        try {
          await this.fetchCurrentUser();
        } catch {
          this.logout();
        }
      }
    },

    /**
     * Realiza login con email y password.
     * @param payload Credenciales de login
     */
    async login(payload: LoginPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<AuthResponse>('/auth/login', payload);
        this.setAuth(data);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Realiza registro de nuevo usuario.
     * @param payload Datos de registro
     */
    async register(payload: RegisterPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<AuthResponse>('/auth/register', payload);
        this.setAuth(data);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Inicia login con Google OAuth.
     */
    loginWithGoogle() {
      window.location.href = `${api.defaults.baseURL}/auth/google`;
    },

    /**
     * Maneja el callback de Google OAuth.
     * @param token Token JWT recibido
     */
    async handleGoogleCallback(token: string) {
      this.loading = true;
      this.error = null;
      try {
        this.token = token;
        localStorage.setItem(TOKEN_KEY, token);
        await this.fetchCurrentUser();
      } catch (err) {
        this.error = (err as Error).message;
        this.logout();
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene los datos del usuario actual.
     */
    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<User>('/auth/me');
        this.user = data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cierra sesión del usuario.
     */
    logout() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Establece la autenticación con token y usuario.
     * @param authData Datos de autenticación
     */
    setAuth(authData: AuthResponse) {
      this.token = authData.access_token;
      this.user = authData.user;
      localStorage.setItem(TOKEN_KEY, authData.access_token);
    },

    /**
     * Verifica si el token ha expirado.
     * @returns true si el token ha expirado
     */
    isTokenExpired(): boolean {
      if (!this.token) return true;

      try {
        const decoded = jwtDecode<JwtPayload>(this.token);
        return decoded.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    },

    /**
     * Actualiza el perfil del usuario.
     * @param payload Datos del perfil a actualizar
     */
    async updateProfile(payload: UpdateProfilePayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.patch<User>('/profile', payload);
        this.user = data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cambia la contraseña del usuario.
     * @param payload Contraseñas actual y nueva
     */
    async updatePassword(payload: UpdatePasswordPayload) {
      this.loading = true;
      this.error = null;
      try {
        await api.patch('/profile/password', payload);
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
