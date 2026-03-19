import { defineStore, acceptHMRUpdate } from 'pinia';
import { api } from 'boot/axios';

/**
 * Interfaz para un Ticket.
 */
export interface Ticket {
  id: number;
  number: number;
  rifaId: number;
  personId: number | null;
  status: 'available' | 'reserved' | 'paid';
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  person?: {
    id: number;
    name: string;
    surname: string;
    phone: string;
    email: string;
  } | null;
}

/**
 * Payload para asignar tickets a una persona.
 */
export interface AssignTicketsPayload {
  personId: number;
  ticketNumbers: number[];
  status: 'reserved' | 'paid';
  observations?: string;
}

/**
 * Payload para actualizar un ticket.
 */
export interface UpdateTicketPayload {
  personId?: number | null;
  status?: 'available' | 'reserved' | 'paid';
  observations?: string;
}

/**
 * Store de Pinia para gestión de Tickets.
 */
export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as Ticket[],
    currentRifaId: null as number | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Retorna lista de tickets ordenada por número.
     */
    sortedTickets: (state) => {
      return [...state.tickets].sort((a, b) => a.number - b.number);
    },

    /**
     * Busca un ticket por ID en el estado local.
     */
    getTicketById: (state) => (id: number) => {
      return state.tickets.find((t) => t.id === id);
    },

    /**
     * Busca un ticket por número en el estado local.
     */
    getTicketByNumber: (state) => (number: number) => {
      return state.tickets.find((t) => t.number === number);
    },

    /**
     * Filtra tickets disponibles.
     */
    availableTickets: (state) => {
      return state.tickets.filter((t) => t.status === 'available');
    },

    /**
     * Filtra tickets reservados.
     */
    reservedTickets: (state) => {
      return state.tickets.filter((t) => t.status === 'reserved');
    },

    /**
     * Filtra tickets pagados.
     */
    paidTickets: (state) => {
      return state.tickets.filter((t) => t.status === 'paid');
    },

    /**
     * Cuenta total de tickets vendidos (reserved + paid).
     */
    soldTicketsCount: (state) => {
      return state.tickets.filter((t) => t.status === 'reserved' || t.status === 'paid').length;
    },

    /**
     * Cuenta total de tickets disponibles.
     */
    availableTicketsCount: (state) => {
      return state.tickets.filter((t) => t.status === 'available').length;
    },

    /**
     * Cuenta total de tickets reservados.
     */
    reservedTicketsCount: (state) => {
      return state.tickets.filter((t) => t.status === 'reserved').length;
    },

    /**
     * Cuenta total de tickets pagados.
     */
    paidTicketsCount: (state) => {
      return state.tickets.filter((t) => t.status === 'paid').length;
    },
  },

  actions: {
    /**
     * Obtiene todos los tickets de una rifa desde el backend.
     * @param rifaId Identificador de la rifa
     */
    async fetchTicketsByRifa(rifaId: number) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.get<Ticket[]>(`/rifas/${rifaId}/tickets`);
        this.tickets = data;
        this.currentRifaId = rifaId;
      } catch (err) {
        this.error = (err as Error).message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Asigna tickets a una persona.
     * @param rifaId Identificador de la rifa
     * @param payload Datos de asignación
     */
    async assignTickets(rifaId: number, payload: AssignTicketsPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<Ticket[]>(`/rifas/${rifaId}/tickets/assign`, payload);
        // Actualizar los tickets en el estado local
        data.forEach((updatedTicket) => {
          const index = this.tickets.findIndex((t) => t.id === updatedTicket.id);
          if (index !== -1) {
            this.tickets[index] = updatedTicket;
          }
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
     * Actualiza un ticket existente.
     * @param ticketId Identificador del ticket
     * @param payload Datos a modificar
     */
    async updateTicket(ticketId: number, payload: UpdateTicketPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.patch<Ticket>(`/tickets/${ticketId}`, payload);
        const index = this.tickets.findIndex((t) => t.id === ticketId);
        if (index !== -1) {
          this.tickets[index] = data;
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
     * Libera un ticket (desasigna de persona y marca como disponible).
     * @param ticketId Identificador del ticket
     */
    async releaseTicket(ticketId: number) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.delete<Ticket>(`/tickets/${ticketId}/release`);
        const index = this.tickets.findIndex((t) => t.id === ticketId);
        if (index !== -1) {
          this.tickets[index] = data;
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
     * Limpia el estado de tickets.
     */
    clearTickets() {
      this.tickets = [];
      this.currentRifaId = null;
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
  import.meta.hot.accept(acceptHMRUpdate(useTicketsStore, import.meta.hot));
}
