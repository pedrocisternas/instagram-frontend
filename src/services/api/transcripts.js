const API_BASE_URL = 'http://localhost:3001';

export async function generateTranscript(accountId, postId) {
  if (!accountId) throw new Error('Account ID is required');
  if (!postId) throw new Error('Post ID is required');

  const response = await fetch(
    `${API_BASE_URL}/api/transcripts/${accountId}/${postId}/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error('Error generating transcript');
  }

  return response.json();
}

export async function getTranscript(accountId, postId) {
  if (!accountId) throw new Error('Account ID is required');
  if (!postId) throw new Error('Post ID is required');

  const response = await fetch(
    `${API_BASE_URL}/api/transcripts/${accountId}/${postId}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Error fetching transcript');
  }

  return response.json();
}