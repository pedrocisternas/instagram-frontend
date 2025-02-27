'use client'
import { useState, useEffect, useMemo } from 'react';
import { Tabs, Tab, Button } from "@heroui/react";
import MetricsPanel from '@/components/home/MetricsPanel';
import TopContentList from '@/components/home/TopContentList';
import ContentDistribution from '@/components/home/ContentDistribution';
import InsightsPanel from '@/components/home/InsightsPanel';
import dynamic from 'next/dynamic';
import { fetchDashboardData } from '@/services/api/posts';
import { getDashboardMetrics, getDashboardInsights } from '@/services/api/insights';
import HomeSkeleton from '@/components/home/HomeSkeleton';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Importar dinámicamente los componentes que usan ApexCharts
const PublishingVolume = dynamic(
  () => import('@/components/home/PublishingVolume'),
  { ssr: false }
);

const PublishingMap = dynamic(
  () => import('@/components/home/PublishingMap'),
  { ssr: false }
);

export default function HomePage({ initialPosts, initialCategories, initialSubcategories }) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedContent, setSelectedContent] = useState(null);
  const [posts, setPosts] = useState(initialPosts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [subcategories, setSubcategories] = useState(initialSubcategories || []);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const { user, authState } = useAuthStore();
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Función para cargar insights
  const loadInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const insightsData = await getDashboardInsights(['7d', '30d', 'all']);
      if (insightsData.insights) {
        setInsights(insightsData.insights);
      }
    } catch (error) {
      console.error('[HomePage] Error cargando insights:', error);
      setError('Error loading insights');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (hasLoadedInitialData) return; // Evitar cargas duplicadas
      
      setIsLoading(true);
      try {
        if (!user?.username) {
          console.log('[HomePage] No username available, skipping data load');
          return;
        }

        const [dashboardData, metricsData] = await Promise.all([
          fetchDashboardData(user.username),
          getDashboardMetrics()
        ]);

        setPosts(dashboardData.posts);
        setCategories(dashboardData.categories);
        setSubcategories(dashboardData.subcategories);
        setMetrics(metricsData.metrics);
        
        await loadInsights();
        setHasLoadedInitialData(true);

      } catch (error) {
        console.error('[HomePage] Error loading data:', error);
        setError('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialPosts) {
      loadData();
    }
  }, [initialPosts, user?.username, hasLoadedInitialData]);

  // Efecto para sincronización
  useEffect(() => {
    const handleSync = async (event) => {
      try {
        if (!user?.username || !hasLoadedInitialData) return;

        const data = event.detail;
        
        // 1. Actualizar inmediatamente los datos básicos
        setPosts(data.posts);
        setCategories(data.categories);
        setSubcategories(data.subcategories);
        
        // 2. Actualizar métricas (esto es rápido y no requiere esperar por insights)
        try {
          const metricsData = await getDashboardMetrics();
          if (metricsData.metrics) {
            setMetrics(metricsData.metrics);
          }
        } catch (metricsError) {
          console.error('[HomePage] Error cargando métricas:', metricsError);
        }
        
        // 3. Forzar re-renderizado de componentes que no son insights
        const currentTimeRange = timeRange;
        setTimeRange("__refresh__");
        setTimeout(() => setTimeRange(currentTimeRange), 50);
        
        // 4. Cargar insights en paralelo (proceso más lento)
        setIsLoadingInsights(true);
        try {
          await loadInsights();
        } catch (insightsError) {
          console.error('[HomePage] Error cargando insights:', insightsError);
        } finally {
          setIsLoadingInsights(false);
        }
        
      } catch (error) {
        console.error('[HomePage] Error en sincronización:', error);
      }
    };

    window.addEventListener('metrics-synced', handleSync);
    return () => window.removeEventListener('metrics-synced', handleSync);
  }, [user?.username, hasLoadedInitialData, timeRange]);

  // Agregar este useEffect para manejar la redirección
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  // Convertir el timeRange del UI al formato de la API
  const getApiTimeRange = (uiTimeRange) => {
    switch (uiTimeRange) {
      case "7days":
        return "7d";
      case "30days":
        return "30d";
      case "alltime":
        return "all";
      default:
        return "30d";
    }
  };

  // Filtrar posts según timeRange
  const filteredPosts = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case "7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return posts.filter(post => new Date(post.published_at) >= sevenDaysAgo);
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return posts.filter(post => new Date(post.published_at) >= thirtyDaysAgo);
      default:
        return posts;
    }
  }, [posts, timeRange]);

  if (authState === 'loading' || isLoading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <AuthGuard>
      <main className="p-8 bg-gray-50">
        {/* Solo los tabs */}
        <div className="mb-6">
          <Tabs 
            selectedKey={timeRange} 
            onSelectionChange={setTimeRange}
            className="justify-center"
            size="md"
            variant="solid"
            color="secondary"
            classNames={{
              tabList: "max-w-[500px]"
            }}
          >
            <Tab key="7days" title="Últimos 7 días" />
            <Tab key="30days" title="Últimos 30 días" />
            <Tab key="alltime" title="Todo el tiempo" />
          </Tabs>
        </div>

        {/* Contenedor principal */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Contenedor izquierdo (3/5) */}
          <div className="col-span-3 space-y-6">
            {/* Panel superior */}
            <div>
              <MetricsPanel 
                timeRange={timeRange} 
                metrics={metrics}
              />
            </div>
            
            {/* Panel inferior dividido */}
            <div className="grid grid-cols-6 gap-6">
              {/* Lista de contenido top */}
              <div className="col-span-3">
                <TopContentList 
                  posts={filteredPosts}
                  timeRange={timeRange}
                  onContentSelect={setSelectedContent}
                  categories={categories}
                  subcategories={subcategories}
                />
              </div>
              {/* Preview del contenido */}
              <div className="col-span-3">
                <InsightsPanel 
                  insights={insights} 
                  currentTimeRange={getApiTimeRange(timeRange)}
                  isGenerating={isLoadingInsights}
                />
              </div>
            </div>
          </div>

          {/* Contenedor derecho (2/5) */}
          <div className="col-span-2 space-y-6">
            {/* Gráfico de distribución */}
            <ContentDistribution 
              posts={filteredPosts}
              categories={categories}
            />
            {/* Componentes de visualización de volumen */}
            {timeRange === "alltime" ? (
              <PublishingMap posts={posts} />
            ) : (
              <PublishingVolume 
                posts={posts}
                timeRange={timeRange}
              />
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}