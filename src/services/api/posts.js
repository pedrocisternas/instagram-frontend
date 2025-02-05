import { APP_CONFIG } from '@/config/app';

const API_BASE_URL = APP_CONFIG.API_URL;

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

export async function fetchDashboardData(username) {
  const response = await fetch(
    `${API_BASE_URL}/api/posts/dashboard?username=${username}`
  );
  if (!response.ok) {
    throw new Error('Error fetching dashboard data');
  }
  return response.json();
}

// Nueva función para obtener los detalles de un post
export async function fetchPostDetails(postId, username) {
  if (!postId) throw new Error('Post ID is required');
  if (!username) throw new Error('Username is required');

  const response = await fetch(
    `${API_BASE_URL}/api/posts/${postId}/details?username=${username}`
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found');
    }
    throw new Error('Error fetching post details');
  }
  
  return response.json();
}