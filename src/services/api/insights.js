import { APP_CONFIG } from '@/config/app';

const API_BASE_URL = APP_CONFIG.API_URL;

export async function generateInsights(posts) {
  try {
    console.log('Service: Preparando datos para enviar');
    const postIds = posts.map(post => post.id);
    
    console.log('Service: Datos a enviar:', {
      totalPosts: postIds.length,
      muestra: postIds.slice(0, 5)
    });

    const response = await fetch(`${API_BASE_URL}/api/insights/generate?username=${APP_CONFIG.USERNAME}`, {
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
    const response = await fetch(
      `${API_BASE_URL}/api/insights/generate/post/${postId}?username=${APP_CONFIG.USERNAME}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Error getting post insights');
    }
    const data = await response.json();
    
    // Asegurarnos de que el análisis tenga la estructura correcta
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
    const response = await fetch(
      `${API_BASE_URL}/api/insights/check/${postId}?username=${APP_CONFIG.USERNAME}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Service - Check Insights - Error en response:', errorData);
      throw new Error(errorData.details || 'Error checking insights');
    }
    const data = await response.json();
    
    // Asegurarnos de que el análisis tenga la estructura correcta
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