import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

/**
 * Genera un análisis de video para un post específico
 * @param {string} postId - ID del post
 * @param {string} username - Nombre de usuario
 * @returns {Promise<Object>} - Análisis de video generado
 */
export async function generateVideoAnalysis(postId, username) {
  if (!postId) throw new Error('Post ID is required');
  if (!username) throw new Error('Username is required');

  try {
    return await apiClient.post(`/api/videoAnalysis/${postId}/generate`, { username });
  } catch (error) {
    console.error('Error generando análisis de video:', error);
    throw error;
  }
}

/**
 * Actualiza el número de tomas de un análisis de video
 * @param {string} postId - ID del post
 * @param {string} username - Nombre de usuario
 * @param {number} numberOfShots - Nuevo número de tomas
 * @returns {Promise<Object>} - Respuesta con el número de tomas actualizado
 */
export async function updateVideoShots(postId, username, numberOfShots) {
  if (!postId) throw new Error('Post ID is required');
  if (!username) throw new Error('Username is required');
  if (numberOfShots === undefined || numberOfShots === null) throw new Error('Number of shots is required');
  
  // Asegurarse de que el valor sea un número
  const shotsValue = parseInt(numberOfShots);
  if (isNaN(shotsValue) || shotsValue < 0) throw new Error('Number of shots must be a positive number');

  try {
    return await apiClient.put(`/api/videoAnalysis/${postId}/shots`, { 
      username,
      numberOfShots: shotsValue
    });
  } catch (error) {
    console.error('Error actualizando número de tomas:', error);
    throw error;
  }
}

/**
 * Actualiza los tipos de audio de un análisis de video
 * @param {string} postId - ID del post
 * @param {string} username - Nombre de usuario
 * @param {Array<string>} audioTypes - Nuevos tipos de audio
 * @returns {Promise<Object>} - Respuesta con los tipos de audio actualizados
 */
export async function updateVideoAudioTypes(postId, username, audioTypes) {
  if (!postId) throw new Error('Post ID is required');
  if (!username) throw new Error('Username is required');
  if (!audioTypes || !Array.isArray(audioTypes)) throw new Error('Audio types must be an array');

  try {
    return await apiClient.put(`/api/videoAnalysis/${postId}/audioTypes`, { 
      username,
      audioTypes
    });
  } catch (error) {
    console.error('Error actualizando tipos de audio:', error);
    throw error;
  }
}

/**
 * Actualiza los tipos de texto de un análisis de video
 * @param {string} postId - ID del post
 * @param {string} username - Nombre de usuario
 * @param {Array<string>} textTypes - Nuevos tipos de texto
 * @returns {Promise<Object>} - Respuesta con los tipos de texto actualizados
 */
export async function updateVideoTextTypes(postId, username, textTypes) {
  if (!postId) throw new Error('Post ID is required');
  if (!username) throw new Error('Username is required');
  if (!textTypes || !Array.isArray(textTypes)) throw new Error('Text types must be an array');

  try {
    return await apiClient.put(`/api/videoAnalysis/${postId}/textTypes`, { 
      username,
      textTypes
    });
  } catch (error) {
    console.error('Error actualizando tipos de texto:', error);
    throw error;
  }
}

