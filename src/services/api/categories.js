import { useAuthStore } from '@/store/auth';
import apiClient from './clientApi';

// Categorías
export async function fetchCategories() {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.username) {
      throw new Error('No authenticated user found');
    }

    const data = await apiClient.get(`/api/categories?username=${user.username}`);
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

    return apiClient.post('/api/categories', { 
      username: user.username, 
      name 
    });
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

    return apiClient.put(
      `/api/categories/${categoryId}/posts/${postId}`,
      { username: user.username }
    );
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

    const data = await apiClient.get(
      `/api/subcategories?username=${user.username}&categoryId=${categoryId}`
    );
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

    return apiClient.post('/api/subcategories', { 
      username: user.username,
      categoryId,
      name
    });
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

    return apiClient.put(
      `/api/subcategories/${subcategoryId}/posts/${postId}`,
      { username: user.username }
    );
  } catch (error) {
    console.error('Service: Error assigning subcategory:', error);
    throw error;
  }
}
