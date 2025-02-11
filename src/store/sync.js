import { create } from 'zustand';
import { syncPosts, fetchDashboardData } from '@/services/api/posts';
import { APP_CONFIG } from '@/config/app';

export const useSyncStore = create((set, get) => ({
  isSyncing: false,
  lastUpdate: null,
  setLastUpdate: (date) => set({ lastUpdate: date }),
  
  syncMetrics: async () => {
    try {
      set({ isSyncing: true });
      
      // 1. Sincronizar métricas
      await syncPosts(APP_CONFIG.USERNAME);
      
      // 2. Obtener datos actualizados
      const data = await fetchDashboardData(APP_CONFIG.USERNAME);
      
      // 3. Actualizar timestamp
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        set({ lastUpdate: latestUpdate });
      }
      
      // 4. Retornar los datos para que las páginas puedan actualizarse
      return data;
      
    } catch (error) {
      console.error('Error syncing metrics:', error);
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  }
}));