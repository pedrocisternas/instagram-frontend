import { APP_CONFIG } from '@/config/app';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = APP_CONFIG.API_URL;

export async function fetchPosts() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/posts?username=${user.username}`
    );
    if (!response.ok) {
      throw new Error('Error fetching posts');
    }
    return response.json();
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

    const response = await fetch(`${API_BASE_URL}/api/posts/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username })
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    return response.json();
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

    const response = await fetch(
      `${API_BASE_URL}/api/posts/dashboard?username=${user.username}`
    );
    if (!response.ok) {
      throw new Error('Error fetching dashboard data');
    }
    return response.json();
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

    const response = await fetch(
      `${API_BASE_URL}/api/posts/${postId}/details?username=${user.username}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error('Error fetching post details');
    }
    
    return response.json();
  } catch (error) {
    console.error('Service: Error fetching post details:', error);
    throw error;
  }
}