import apiClient from './clientApi';

export async function generateTranscript(accountId, postId) {
  if (!accountId) throw new Error('Account ID is required');
  if (!postId) throw new Error('Post ID is required');

  try {
    return apiClient.post(`/api/transcripts/${accountId}/${postId}/generate`);
  } catch (error) {
    if (error.message.includes('404')) {
      throw new Error('Post not found');
    }
    throw new Error('Error generating transcript');
  }
}

export async function getTranscript(accountId, postId) {
  if (!accountId) throw new Error('Account ID is required');
  if (!postId) throw new Error('Post ID is required');

  try {
    return apiClient.get(`/api/transcripts/${accountId}/${postId}`);
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw new Error('Error fetching transcript');
  }
}