import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

/**
 * Analyze a reference video and start the script generation process
 * Waits for the complete analysis to finish before returning
 * @param {string} url - URL of the reference video
 * @param {string} categoryId - Optional category ID
 * @param {string} subcategoryId - Optional subcategory ID
 * @returns {Promise<Object>} Session data with completed analysis results
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
    console.log("[ScriptGenerator] This request will wait for analysis to complete before returning");
    
    const response = await apiClient.post('/api/script-generator/analyze-reference', {
      url,
      categoryId,
      subcategoryId,
      username: user.username
    });
    
    console.log("[ScriptGenerator] Analysis completed, response received:", response);
    
    // Log detailed response structure
    console.log("[ScriptGenerator] Response session keys:", Object.keys(response.session));
    console.log("[ScriptGenerator] Summary data:", {
      exists: !!response.session.summary,
      type: typeof response.session.summary,
      length: typeof response.session.summary === 'string' ? response.session.summary.length : 'N/A',
      preview: typeof response.session.summary === 'string' ? response.session.summary.substring(0, 50) + '...' : 'Not a string'
    });
    
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
    
    // Log detailed response session structure
    if (response && response.session) {
      console.log("[ScriptGenerator] Session keys:", Object.keys(response.session));
      console.log("[ScriptGenerator] Summary data:", {
        exists: !!response.session.summary,
        type: typeof response.session.summary,
        length: typeof response.session.summary === 'string' ? response.session.summary.length : 'N/A',
        preview: typeof response.session.summary === 'string' ? response.session.summary.substring(0, 50) + '...' : 'Not a string'
      });
    }
    
    return response;
  } catch (error) {
    console.error('[ScriptGenerator] Error fetching session:', error);
    console.error('[ScriptGenerator] Error details:', error.response?.data || error);
    throw error;
  }
}

/**
 * Fetch user transcripts for the current session
 * @param {string} categoryId - Optional category ID to filter by
 * @param {string} subcategoryId - Optional subcategory ID to filter by
 * @param {number} limit - Maximum number of transcripts to fetch (default: 10)
 * @returns {Promise<Object>} The fetched transcripts and updated session
 */
export async function fetchUserTranscripts(categoryId = null, subcategoryId = null, limit = 10) {
  try {
    const { user } = useAuthStore.getState();
    console.log("[ScriptGenerator] User from auth store:", user);
    
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }
    
    console.log("[ScriptGenerator] Calling API to fetch transcripts with params:", {
      username: user.username,
      categoryId,
      subcategoryId,
      limit
    });
    
    const response = await apiClient.post('/api/script-generator/fetch-transcripts', {
      username: user.username,
      categoryId,
      subcategoryId,
      limit
    });
    
    console.log("[ScriptGenerator] Fetch transcripts response:", response);
    return response;
  } catch (error) {
    console.error('[ScriptGenerator] Error fetching transcripts:', error);
    console.error('[ScriptGenerator] Error details:', error.response?.data || error);
    throw error;
  }
}

/**
 * Submit answers to questions for script generation
 * @param {Object} data - The answers data
 * @param {Array} data.answers - Array of answer objects
 * @returns {Promise<Object>} Response with updated session
 */
export async function submitAnswers(data) {
  try {
    console.log("[ScriptGenerator] submitAnswers called with:", data);
    
    const { user } = useAuthStore.getState();
    console.log("[ScriptGenerator] User from auth store:", user);
    
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }
    
    console.log("[ScriptGenerator] Submitting answers for user:", user.username);
    
    const response = await apiClient.post('/api/script-generator/submit-answers', {
      username: user.username,
      answers: data.answers
    });
    
    console.log("[ScriptGenerator] Submit answers response:", response);
    return response;
  } catch (error) {
    console.error('[ScriptGenerator] Error submitting answers:', error);
    console.error('[ScriptGenerator] Error details:', error.response?.data || error);
    throw error;
  }
}

/**
 * Get category stats for transcript filtering
 * @returns {Promise<Object>} Stats by category
 */
export async function getCategoryStats() {
  // Placeholder implementation until real implementation is ready
  console.log("[ScriptGenerator] getCategoryStats called (placeholder)");
  return {
    stats: {},
    categories: []
  };
}

/**
 * Get previously generated scripts
 * @returns {Promise<Array>} Array of script objects
 */
export async function getScripts() {
  // Placeholder implementation until real implementation is ready
  console.log("[ScriptGenerator] getScripts called (placeholder)");
  return [];
}

/**
 * Generate questions for script customization
 * @returns {Promise<Object>} Generated questions
 */
export async function generateQuestions() {
  // Placeholder implementation until real implementation is ready
  console.log("[ScriptGenerator] generateQuestions called (placeholder)");
  return {
    questions: []
  };
}

/**
 * Generate a script based on the analysis and answers
 * @returns {Promise<Object>} Generated script
 */
export async function generateScript() {
  // Placeholder implementation until real implementation is ready
  console.log("[ScriptGenerator] generateScript called (placeholder)");
  return {
    title: "Script generated",
    content: "Placeholder script content"
  };
}