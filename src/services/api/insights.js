import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

export async function generateInsights(posts) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    console.log('Service: Preparando datos para enviar');
    const postIds = posts.map(post => post.id);
    console.log('Service: Datos a enviar:', {
      totalPosts: postIds.length,
      muestra: postIds.slice(0, 5)
    });

    return apiClient.post(
      `/api/insights/generate?username=${user.username}`, 
      { postIds }
    );
  } catch (error) {
    console.error('Service: Error completo:', error);
    throw error;
  }
}

export async function getPostInsights(postId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const data = await apiClient.get(
      `/api/insights/generate/post/${postId}?username=${user.username}`
    );
    
    const analysis = data.analysis ? (
      typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis
    ) : null;

    return {
      analysis,
      generated_at: data.generated_at,
      needs_update: data.needs_update
    };
  } catch (error) {
    console.error('Service: Error:', error);
    throw error;
  }
}

export async function checkPostInsights(postId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const data = await apiClient.get(
      `/api/insights/check/${postId}?username=${user.username}`
    );
    
    if (!data.success) {
      console.error('Service - Check Insights - Error en response:', data);
      throw new Error(data.details || data.error || 'Error checking insights');
    }
    
    const analysis = data.analysis ? (
      typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis
    ) : null;

    return {
      analysis,
      generated_at: data.generated_at,
      needs_update: data.needs_update
    };
  } catch (error) {
    console.error('Service - Check Insights - Error:', error);
    throw error;
  }
}

export async function getDashboardInsights(timeRanges = ['7d', '30d', 'all']) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('username', user.username);
    timeRanges.forEach(range => queryParams.append('timeRanges[]', range));

    const data = await apiClient.get(
      `/api/insights/dashboard/insights?${queryParams.toString()}`
    );

    return {
      insights: data.insights,
      needs_update: data.needs_update
    };
  } catch (error) {
    console.error('[Service:getDashboardInsights] Error:', error);
    throw error;
  }
}

export async function getDashboardMetrics() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const data = await apiClient.get(
      `/api/insights/dashboard/metrics?username=${user.username}`
    );
    
    if (!data.success) {
      throw new Error(data.error || 'Error getting dashboard metrics');
    }

    return data;
  } catch (error) {
    console.error('Service: Error getting dashboard metrics:', error);
    throw error;
  }
}