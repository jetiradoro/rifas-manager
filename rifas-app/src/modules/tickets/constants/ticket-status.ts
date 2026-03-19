/**
 * Tipo de estado de ticket según el schema de Prisma.
 */
export type TicketStatus = 'available' | 'reserved' | 'paid';

/**
 * Configuración de cada estado de ticket.
 */
export interface TicketStatusConfig {
  label: string;
  color: string;
  icon?: string;
}

/**
 * Constantes de configuración para cada estado de ticket.
 * Incluye color (para badges, avatars, etc.) y etiqueta legible en español.
 */
export const TICKET_STATUS_CONFIG: Record<TicketStatus, TicketStatusConfig> = {
  available: {
    label: 'Disponible',
    color: 'grey',
    icon: 'check_circle',
  },
  reserved: {
    label: 'Reservado',
    color: 'orange',
    icon: 'schedule',
  },
  paid: {
    label: 'Pagado',
    color: 'green',
    icon: 'paid',
  },
};

/**
 * Obtiene el color de un estado de ticket.
 * @param status Estado del ticket
 * @returns Color Quasar correspondiente
 */
export function getTicketStatusColor(status: TicketStatus): string {
  return TICKET_STATUS_CONFIG[status]?.color || 'grey';
}

/**
 * Obtiene la etiqueta legible de un estado de ticket.
 * @param status Estado del ticket
 * @returns Etiqueta en español
 */
export function getTicketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_CONFIG[status]?.label || status;
}

/**
 * Obtiene el icono de un estado de ticket.
 * @param status Estado del ticket
 * @returns Nombre del icono Material
 */
export function getTicketStatusIcon(status: TicketStatus): string | undefined {
  return TICKET_STATUS_CONFIG[status]?.icon;
}

/**
 * Obtiene la configuración completa de un estado de ticket.
 * @param status Estado del ticket
 * @returns Configuración completa
 */
export function getTicketStatusConfig(status: TicketStatus): TicketStatusConfig {
  return TICKET_STATUS_CONFIG[status] || TICKET_STATUS_CONFIG.available;
}
