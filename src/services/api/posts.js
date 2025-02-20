import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

export async function fetchPosts() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return apiClient.get(`/api/posts?username=${user.username}`);
  } catch (error) {
    console.error('Service: Error fetching posts:', error);
    throw error;
  }
}

export async function syncPosts() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return apiClient.post('/api/posts/sync', { username: user.username });
  } catch (error) {
    console.error('Service: Error syncing posts:', error);
    throw error;
  }
}

export async function fetchDashboardData() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return apiClient.get(`/api/posts/dashboard?username=${user.username}`);
  } catch (error) {
    console.error('Service: Error fetching dashboard data:', error);
    throw error;
  }
}

// Función para obtener los detalles de un post
export async function fetchPostDetails(postId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }
    if (!postId) {
      throw new Error('Post ID is required');
    }

    return apiClient.get(`/api/posts/${postId}/details?username=${user.username}`);
  } catch (error) {
    console.error('Service: Error fetching post details:', error);
    throw error;
  }
}