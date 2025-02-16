import { APP_CONFIG } from '@/config/app';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = APP_CONFIG.API_URL;

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

    const response = await fetch(`${API_BASE_URL}/api/insights/generate?username=${user.username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Service: Error response:', errorData);
      throw new Error(errorData.details || 'Error generating insights');
    }
    return response.json();
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

    const response = await fetch(
      `${API_BASE_URL}/api/insights/generate/post/${postId}?username=${user.username}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error getting post insights');
    }
    const data = await response.json();
    
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

    const response = await fetch(
      `${API_BASE_URL}/api/insights/check/${postId}?username=${user.username}`
    );
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
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

    const response = await fetch(
      `${API_BASE_URL}/api/insights/dashboard/insights?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Error getting dashboard insights');
    }

    const data = await response.json();
    return {
      insights: data.insights,
      needs_update: false
    };
  } catch (error) {
    console.error('Service: Error getting dashboard insights:', error);
    throw error;
  }
}

export async function getDashboardMetrics() {
  try {
    const { user } = useAuthStore.getState();
    
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/insights/dashboard/metrics?username=${user.username}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error getting dashboard metrics');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error getting dashboard metrics');
    }

    return data;
  } catch (error) {
    console.error('Service: Error getting dashboard metrics:', error);
    throw error;
  }
}