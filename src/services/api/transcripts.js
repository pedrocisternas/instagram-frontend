import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

export async function generateTranscript(accountId, postId) {
  if (!accountId) throw new Error('Account ID is required');
  if (!postId) throw new Error('Post ID is required');

  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await apiClient.post(`/api/transcripts/${accountId}/${postId}/generate`, {
      username: user.username
    });
    return response;
  } catch (error) {
    if (error.response?.status === 422) {
      if (error.response?.data?.error === 'NO_AUDIO' || 
          error.response?.data?.error === 'NO_TRANSCRIBABLE_CONTENT') {
        throw new Error('NO_AUDIO');
      }
    }
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
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    return apiClient.get(`/api/transcripts/${accountId}/${postId}?username=${user.username}`);
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw new Error('Error fetching transcript');
  }
}