import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';

/**
 * Interfaz para un Premio.
 */
export interface Prize {
  id: number;
  rifaId: number;
  ticketId: number;
  personId: number;
  prizeOrder: number;
  drawnAt: string;
  ticket: {
    id: number;
    number: number;
    rifaId: number;
    personId: number;
    status: string;
  };
  person: {
    id: number;
    name: string;
    surname: string;
    phone: string;
    email: string;
  };
  rifa: {
    prize_names: string[] | null;
  };
}

/**
 * Store de Pinia para gestión de Premios y Sorteos.
 */
export const usePrizesStore = defineStore('prizes', {
  state: () => ({
    prizes: [] as Prize[],
    currentRifaId: null as number | null,
    loading: false,
    drawLoading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Retorna lista de premios ordenada por prizeOrder.
     */
    sortedPrizes: (state) => {
      return [...state.prizes].sort((a, b) => a.prizeOrder - b.prizeOrder);
    },

    /**
     * Verifica si existen premios para la rifa actual.
     */
    hasPrizes: (state) => {
      return state.prizes.length > 0;
    },

    /**
     * Obtiene el premio por orden (1=gordo, 2=segundo, etc).
     */
    getPrizeByOrder: (state) => (order: number) => {
      return state.prizes.find((p) => p.prizeOrder === order);
    },
  },

  actions: {
    /**
     * Obtiene todos los premios de una rifa desde el backend.
     * @param rifaId Identificador de la rifa
     */
    async fetchPrizesByRifa(rifaId: number) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<Prize[]>(`/prizes/rifa/${rifaId}`);
        this.prizes = data;
        this.currentRifaId = rifaId;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Ejecuta el sorteo de una rifa.
     * @param rifaId Identificador de la rifa
     * @returns Lista de premios generados
     */
    async drawPrizes(rifaId: number) {
      this.drawLoading = true;
      this.error = null;
      try {
        const { data } = await api.post<Prize[]>(`/prizes/rifa/${rifaId}/draw`);
        this.prizes = data;
        this.currentRifaId = rifaId;
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.drawLoading = false;
      }
    },

    /**
     * Elimina un premio específico.
     * @param prizeId Identificador del premio
     */
    async removePrize(prizeId: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/prizes/${prizeId}`);
        const index = this.prizes.findIndex((p) => p.id === prizeId);
        if (index !== -1) {
          this.prizes.splice(index, 1);
        }
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Sortea un único premio de una rifa.
     * @param rifaId Identificador de la rifa
     * @param prizeOrder Orden del premio a sortear (1=gordo, 2=segundo, etc)
     * @returns Premio generado
     */
    async drawSinglePrize(rifaId: number, prizeOrder: number) {
      this.drawLoading = true;
      this.error = null;
      try {
        const { data } = await api.post<Prize>(
          `/prizes/rifa/${rifaId}/draw/${prizeOrder}`,
        );
        const existingIndex = this.prizes.findIndex(
          (p) => p.prizeOrder === prizeOrder,
        );
        if (existingIndex !== -1) {
          this.prizes[existingIndex] = data;
        } else {
          this.prizes.push(data);
        }
        this.currentRifaId = rifaId;
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.drawLoading = false;
      }
    },

    /**
     * Elimina todos los premios de una rifa.
     * @param rifaId Identificador de la rifa
     */
    async removeAllPrizes(rifaId: number) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/prizes/rifa/${rifaId}`);
        this.prizes = [];
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpia el estado de premios.
     */
    clearPrizes() {
      this.prizes = [];
      this.currentRifaId = null;
    },

    /**
     * Crea un premio manualmente asignando un número de ticket específico.
     * @param rifaId Identificador de la rifa
     * @param prizeOrder Orden del premio (1=gordo, 2=segundo, etc)
     * @param ticketNumber Número del ticket ganador
     * @returns Premio creado
     */
    async createManualPrize(
      rifaId: number,
      prizeOrder: number,
      ticketNumber: number,
    ) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<Prize>(
          `/prizes/rifa/${rifaId}/manual`,
          {
            prizeOrder,
            ticketNumber,
          },
        );
        const existingIndex = this.prizes.findIndex(
          (p) => p.prizeOrder === prizeOrder,
        );
        if (existingIndex !== -1) {
          this.prizes[existingIndex] = data;
        } else {
          this.prizes.push(data);
        }
        this.currentRifaId = rifaId;
        return data;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
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
  import.meta.hot.accept(acceptHMRUpdate(usePrizesStore, import.meta.hot));
}
