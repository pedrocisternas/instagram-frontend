import { APP_CONFIG } from '@/config/app';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = `${APP_CONFIG.API_URL}/api`;

// Categorías
export async function fetchCategories() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/categories?username=${user.username}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Service: Error fetching categories:', error);
    throw error;
  }
}

export async function createCategory(name) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, name })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating category');
    }
    return response.json();
  } catch (error) {
    console.error('Service: Error creating category:', error);
    throw error;
  }
}

export async function assignCategoryToPost(categoryId, postId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/posts/${postId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      }
    );
    if (!response.ok) {
      throw new Error('Error assigning category');
    }
    return response.json();
  } catch (error) {
    console.error('Service: Error assigning category:', error);
    throw error;
  }
}

// Subcategorías
export async function fetchSubcategories(categoryId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/subcategories?username=${user.username}&categoryId=${categoryId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.subcategories;
  } catch (error) {
    console.error('Service: Error fetching subcategories:', error);
    throw error;
  }
}

export async function createSubcategory(categoryId, name) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: user.username,
        categoryId,
        name
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating subcategory');
    }
    return response.json();
  } catch (error) {
    console.error('Service: Error creating subcategory:', error);
    throw error;
  }
}

export async function assignSubcategoryToPost(subcategoryId, postId) {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const response = await fetch(
      `${API_BASE_URL}/subcategories/${subcategoryId}/posts/${postId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      }
    );
    if (!response.ok) {
      throw new Error('Error assigning subcategory');
    }
    return response.json();
  } catch (error) {
    console.error('Service: Error assigning subcategory:', error);
    throw error;
  }
}
