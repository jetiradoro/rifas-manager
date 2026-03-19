/**
 * Archivo de funciones helper reutilizables en toda la aplicación.
 */

/**
 * Formatea una fecha ISO a formato español legible.
 * @param isoDate Fecha en formato ISO string
 * @param options Opciones de formateo
 * @returns Fecha formateada
 */
export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string {
  return new Date(isoDate).toLocaleDateString('es-ES', options);
}

/**
 * Formatea una fecha ISO a formato español con hora.
 * @param isoDate Fecha en formato ISO string
 * @returns Fecha y hora formateada
 */
export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea una fecha ISO a formato corto (dd/mm/yyyy).
 * @param isoDate Fecha en formato ISO string
 * @returns Fecha en formato corto
 */
export function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
