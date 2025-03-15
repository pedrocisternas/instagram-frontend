export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '/');
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea la duración de un video en segundos a un formato legible
 * @param {number} seconds - Duración en segundos
 * @returns {string} Duración formateada (MM:SS o Xs)
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Si hay minutos, muestra formato MM:SS
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Si son solo segundos, muestra solo los segundos
  return `${remainingSeconds}s`;
};

/**
 * Formatea el tiempo de transcripción sin decimales
 * @param {string} timeString - Tiempo en formato MM:SS.ms
 * @returns {string} Tiempo formateado sin decimales
 */
export const formatTranscriptTime = (timeString) => {
  if (!timeString) return '';
  
  // Primero removemos los decimales
  const withoutDecimals = timeString.split('.')[0];
  
  // Ahora dividimos en minutos y segundos
  const parts = withoutDecimals.split(':');
  if (parts.length === 2) {
    const minutes = parts[0];
    const seconds = parts[1];
    
    // Agregamos un cero inicial a los segundos si es necesario
    const paddedSeconds = seconds.length === 1 ? `0${seconds}` : seconds;
    
    // Devolvemos el tiempo formateado
    return `${minutes}:${paddedSeconds}`;
  }
  
  return withoutDecimals; // Devolver el original sin decimales si no tiene formato MM:SS
};