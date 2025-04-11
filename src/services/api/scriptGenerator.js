import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

/**
 * Analyze a reference video and start the script generation process
 * @param {string} url - URL of the reference video
 * @param {string} categoryId - Optional category ID
 * @param {string} subcategoryId - Optional subcategory ID
 * @returns {Promise<Object>} Session data with analysis results
 */
export async function analyzeReference(url, categoryId = null, subcategoryId = null) {
  if (!url) throw new Error('URL is required');
  
  try {
    console.log("[ScriptGenerator] analyzeReference called with URL:", url);
    console.log("[ScriptGenerator] Category ID:", categoryId);
    console.log("[ScriptGenerator] Subcategory ID:", subcategoryId);
    
    const { user } = useAuthStore.getState();
    console.log("[ScriptGenerator] User from auth store:", user);
    
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    console.log("[ScriptGenerator] Calling API endpoint: /api/script-generator/analyze-reference");
    const response = await apiClient.post('/api/script-generator/analyze-reference', {
      url,
      categoryId,
      subcategoryId,
      username: user.username
    });
    console.log("[ScriptGenerator] Analysis response received:", response);
    return response;
  } catch (error) {
    console.error('[ScriptGenerator] Error analyzing reference video:', error);
    console.error('[ScriptGenerator] Error details:', error.response?.data || error);
    throw error;
  }
}

/**
 * Get the current script generation session
 * @returns {Promise<Object>} Current session data
 */
export async function getSession() {
  try {
    const { user } = useAuthStore.getState();
    console.log("[ScriptGenerator] User from auth store:", user);
    console.log("[ScriptGenerator] Username being sent:", user?.username);
    
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    console.log("[ScriptGenerator] Calling API endpoint:", `/api/script-generator/session?username=${user.username}`);
    const response = await apiClient.get(`/api/script-generator/session?username=${user.username}`);
    console.log("[ScriptGenerator] API response received:", response);
    return response;
  } catch (error) {
    console.error('[ScriptGenerator] Error fetching session:', error);
    console.error('[ScriptGenerator] Error details:', error.response?.data || error);
    throw error;
  }
}