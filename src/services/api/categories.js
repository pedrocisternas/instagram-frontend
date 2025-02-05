import { APP_CONFIG } from '@/config/app';

const API_BASE_URL = `${APP_CONFIG.API_URL}/api`;

// Categorías
export async function fetchCategories(username) {
  const response = await fetch(
    `${API_BASE_URL}/categories?username=${username}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.categories;
}

export async function createCategory(username, name) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, name })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error creating category');
  }
  return response.json();
}

export async function assignCategoryToPost(username, categoryId, postId) {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/posts/${postId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }
  );
  if (!response.ok) {
    throw new Error('Error assigning category');
  }
  return response.json();
}

// Subcategorías
export async function fetchSubcategories(username, categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/subcategories?username=${username}&categoryId=${categoryId}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.subcategories;
}

export async function createSubcategory(username, categoryId, name) {
  const response = await fetch(`${API_BASE_URL}/subcategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, categoryId, name })
  });
  if (!response.ok) {
    throw new Error('Error creating subcategory');
  }
  return response.json();
}

export async function assignSubcategoryToPost(username, subcategoryId, postId) {
  const response = await fetch(
    `${API_BASE_URL}/subcategories/${subcategoryId}/posts/${postId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }
  );
  if (!response.ok) {
    throw new Error('Error assigning subcategory');
  }
  return response.json();
}
