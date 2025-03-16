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

