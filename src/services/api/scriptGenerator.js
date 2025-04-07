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

/**
 * Generate customization questions based on video analysis
 * @returns {Promise<Object>} Generated questions
 */
export async function generateQuestions() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return await apiClient.post('/api/script-generator/generate-questions', {
      username: user.username
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Submit answers to customization questions
 * @param {Array} answers - User's answers to questions
 * @returns {Promise<Object>} Updated session data
 */
export async function submitAnswers(answers) {
  if (!answers || !Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }
  
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return await apiClient.post('/api/script-generator/submit-answers', {
      answers,
      username: user.username
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw error;
  }
}

/**
 * Generate the final script
 * @returns {Promise<Object>} Generated script
 */
export async function generateScript() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return await apiClient.post('/api/script-generator/generate-script', {
      username: user.username
    });
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}

/**
 * Get transcript counts by category
 * @returns {Promise<Object>} Category statistics
 */
export async function getCategoryStats() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return await apiClient.get(`/api/script-generator/categories-stats?username=${user.username}`);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }
}

/**
 * Get previously generated scripts
 * @returns {Promise<Array>} List of generated scripts
 */
export async function getScripts() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return await apiClient.get(`/api/script-generator/scripts?username=${user.username}`);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    throw error;
  }
}