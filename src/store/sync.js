import { create } from 'zustand';
import { syncPosts } from '@/services/api/posts';
import { APP_CONFIG } from '@/config/app';

export const useSyncStore = create((set) => ({
  isSyncing: false,
  lastUpdate: null,
  setLastUpdate: (date) => set({ lastUpdate: date }),
  
  syncMetrics: async () => {
    try {
      set({ isSyncing: true });
      await syncPosts(APP_CONFIG.USERNAME);
      return true;
    } catch (error) {
      console.error('Error syncing metrics:', error);
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  }
}));