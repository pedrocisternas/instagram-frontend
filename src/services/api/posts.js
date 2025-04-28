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

export async function fetchDashboardTable(username, filters = {}) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('(fetchDashboardTable) No authenticated username found');
    }

    // Construir query parameters basados en los filtros
    const queryParams = new URLSearchParams({ username });
    
    // Agregar filtros a los parámetros de consulta
    if (filters.types && filters.types.size > 0) {
      // Convertir Set a Array y luego a string
      queryParams.append('types', Array.from(filters.types).join(','));
    }
    
    if (filters.categories && filters.categories.size > 0) {
      queryParams.append('categories', Array.from(filters.categories).join(','));
    }
    
    if (filters.subcategories && filters.subcategories.size > 0) {
      queryParams.append('subcategories', Array.from(filters.subcategories).join(','));
    }
    
    if (filters.days && filters.days > 0) {
      queryParams.append('days', filters.days);
    }

    if (filters.page) {
      queryParams.append('page', filters.page);
    }

    if (filters.sortField) {
      queryParams.append('sortField', filters.sortField);
    }

    if (filters.sortDirection) {
      queryParams.append('sortDirection', filters.sortDirection);
    }

    return apiClient.get(`/api/posts/table?${queryParams.toString()}`);
  } catch (error) {
    console.error('Service: Error fetching table posts data:', error);
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

// Nueva función para obtener solo el resumen estadístico
export async function fetchStatsSummary(username, filters = {}) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('(fetchStatsSummary) No authenticated username found');
    }

    // Construir query parameters basados en los filtros
    const queryParams = new URLSearchParams({ username });
    
    // Agregar filtros a los parámetros de consulta (mismo código que fetchDashboardTable)
    if (filters.types && filters.types.size > 0) {
      queryParams.append('types', Array.from(filters.types).join(','));
    }
    
    if (filters.categories && filters.categories.size > 0) {
      queryParams.append('categories', Array.from(filters.categories).join(','));
    }
    
    if (filters.subcategories && filters.subcategories.size > 0) {
      queryParams.append('subcategories', Array.from(filters.subcategories).join(','));
    }
    
    if (filters.days && filters.days > 0) {
      queryParams.append('days', filters.days);
    }

    return apiClient.get(`/api/posts/stats-summary?${queryParams.toString()}`);
  } catch (error) {
    console.error('Service: Error fetching stats summary data:', error);
    throw error;
  }
}