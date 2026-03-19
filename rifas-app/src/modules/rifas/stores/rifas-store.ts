import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';

export interface RifaPrize {
  id: number;
  prizeOrder: number;
  ticket: {
    number: number;
  };
  person: {
    name: string;
    surname: string;
  };
}

export interface Rifa {
  id: number;
  name: string;
  n_tickets: number;
  fecha: string;
  n_prizes: number;
  prize_names?: string[] | null;
  prizes?: RifaPrize[];
}

export interface RifaPayload {
  name: string;
  n_tickets: number;
  fecha: string;
  n_prizes: number;
  prize_names?: string[];
}

export const useRifasStore = defineStore('rifas', {
  state: () => ({
    rifas: [] as Rifa[],
    currentRifa: null as Rifa | null,
    loading: false,
    error: '' as string | null,
  }),
  actions: {
    async fetchRifas() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<Rifa[]>('/rifas');
        this.rifas = data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchRifaById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<Rifa>(`/rifas/${id}`);
        this.currentRifa = data;
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async createRifa(payload: RifaPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<Rifa>('/rifas', payload);
        this.rifas.unshift(data);
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateRifa(id: number, payload: Partial<RifaPayload>) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.patch<Rifa>(`/rifas/${id}`, payload);
        this.rifas = this.rifas.map((item) => (item.id === id ? data : item));
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteRifa(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/rifas/${id}`);
        this.rifas = this.rifas.filter((item) => item.id !== id);
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
  import.meta.hot.accept(acceptHMRUpdate(useRifasStore, import.meta.hot));
}
