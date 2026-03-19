import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';
import type { User } from 'src/modules/auth/stores/auth-store';

/**
 * Payload para crear un usuario.
 */
export interface CreateUserPayload {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
    personId?: number;
}

/**
 * Payload para actualizar un usuario.
 */
export interface UpdateUserPayload {
    email?: string;
    name?: string;
    role?: 'admin' | 'user';
    personId?: number;
}

/**
 * Store de usuarios.
 */
export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [] as User[],
        currentUser: null as User | null,
        loading: false,
        error: null as string | null,
    }),

    actions: {
        /**
         * Obtiene todos los usuarios.
         */
        async fetchUsers() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get<User[]>('/users');
                this.users = data;
            } catch (err) {
                this.error = (err as Error).message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Obtiene un usuario por ID.
         * @param id ID del usuario
         */
        async fetchUserById(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get<User>(`/users/${id}`);
                this.currentUser = data;
                return data;
            } catch (err) {
                this.error = (err as Error).message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Crea un nuevo usuario.
         * @param payload Datos del usuario
         */
        async createUser(payload: CreateUserPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.post<User>('/users', payload);
                this.users.unshift(data);
                return data;
            } catch (err) {
                this.error = (err as Error).message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Actualiza un usuario existente.
         * @param id ID del usuario
         * @param payload Datos a actualizar
         */
        async updateUser(id: number, payload: UpdateUserPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.patch<User>(`/users/${id}`, payload);
                this.users = this.users.map((item) => (item.id === id ? data : item));
                return data;
            } catch (err) {
                this.error = (err as Error).message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Elimina un usuario.
         * @param id ID del usuario
         */
        async deleteUser(id: number) {
            this.loading = true;
            this.error = null;
            try {
                await api.delete(`/users/${id}`);
                this.users = this.users.filter((item) => item.id !== id);
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
    import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
