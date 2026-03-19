import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';

/**
 * Interfaz para una Persona.
 * phone y email son opcionales (al menos uno requerido).
 */
export interface Person {
  id: number;
  name: string;
  surname: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload para crear una Persona.
 * Se requiere al menos phone o email.
 */
export interface CreatePersonPayload {
  name: string;
  surname: string;
  phone?: string;
  email?: string;
}

/**
 * Payload para actualizar una Persona (campos opcionales).
 * Se puede enviar null para borrar phone o email.
 */
export interface UpdatePersonPayload {
  name?: string;
  surname?: string;
  phone?: string | null;
  email?: string | null;
}

/**
 * Persona con tickets asociados (para vista de detalle).
 */
export interface PersonWithTickets extends Person {
  tickets: Array<{
    id: number;
    number: number;
    status: 'available' | 'reserved' | 'paid';
    observations: string | null;
    rifa: {
      id: number;
      name: string;
      fecha: string;
    };
    prizes: Array<{
      id: number;
      prizeOrder: number;
    }>;
  }>;
}

/**
 * Store de Pinia para gestión de Personas.
 */
export const usePersonsStore = defineStore('persons', {
  state: () => ({
    persons: [] as Person[],
    currentPerson: null as PersonWithTickets | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Retorna lista de personas ordenada alfabéticamente (ya viene ordenada del backend).
     */
    sortedPersons: (state) => state.persons,

    /**
     * Busca una persona por ID en el estado local.
     */
    getPersonById: (state) => (id: number) => {
      return state.persons.find((p) => p.id === id);
    },
  },

  actions: {
    /**
     * Obtiene todas las personas desde el backend.
     * El backend ya las devuelve ordenadas por nombre y apellido.
     */
    async fetchPersons() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<Person[]>('/persons');
        this.persons = data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene una persona por ID con tickets asociados.
     * @param id Identificador de la persona
     */
    async fetchPersonById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<PersonWithTickets>(`/persons/${id}`);
        this.currentPerson = data;
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una nueva persona.
     * @param payload Datos de la persona
     */
    async createPerson(payload: CreatePersonPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<Person>('/persons', payload);
        this.persons.unshift(data);
        // Re-ordenar alfabéticamente después de insertar
        this.persons.sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name);
          return nameCompare !== 0 ? nameCompare : a.surname.localeCompare(b.surname);
        });
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza una persona existente.
     * @param id Identificador de la persona
     * @param payload Datos a modificar
     */
    async updatePerson(id: number, payload: UpdatePersonPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.patch<Person>(`/persons/${id}`, payload);
        this.persons = this.persons.map((item) => (item.id === id ? data : item));
        // Re-ordenar alfabéticamente después de actualizar
        this.persons.sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name);
          return nameCompare !== 0 ? nameCompare : a.surname.localeCompare(b.surname);
        });
        // Actualizar currentPerson si es la misma
        if (this.currentPerson?.id === id) {
          this.currentPerson = { ...this.currentPerson, ...data };
        }
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina una persona.
     * @param id Identificador de la persona
     */
    async deletePerson(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/persons/${id}`);
        this.persons = this.persons.filter((item) => item.id !== id);
        // Limpiar currentPerson si es la misma
        if (this.currentPerson?.id === id) {
          this.currentPerson = null;
        }
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpia el estado de persona actual.
     */
    clearCurrentPerson() {
      this.currentPerson = null;
    },

    /**
     * Limpia el estado de error.
     */
    clearError() {
      this.error = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePersonsStore, import.meta.hot));
}
