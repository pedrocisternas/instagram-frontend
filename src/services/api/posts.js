const API_BASE_URL = 'http://localhost:3001';

export async function fetchPosts(username) {
  const response = await fetch(
    `${API_BASE_URL}/api/posts?username=${username}`
  );
  if (!response.ok) {
    throw new Error('Error fetching posts');
  }
  return response.json();
}

export async function syncPosts(username) {
  const response = await fetch(`${API_BASE_URL}/api/posts/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  return response.json();
}