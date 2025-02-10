'use client'
import { useState, useEffect, useMemo } from 'react';
import { Tabs, Tab, Button } from "@heroui/react";
import MetricsPanel from '@/components/home/MetricsPanel';
import TopContentList from '@/components/home/TopContentList';
import ContentDistribution from '@/components/home/ContentDistribution';
import InsightsPanel from '@/components/home/InsightsPanel';
import { fetchDashboardData } from '@/services/api/posts';
import { APP_CONFIG } from '@/config/app';
import { getDashboardMetrics, getDashboardInsights } from '@/services/api/insights';
import HomeSkeleton from '@/components/home/HomeSkeleton';
import PublishingVolume from '@/components/home/PublishingVolume';
import PublishingMap from '@/components/home/PublishingMap';

export default function HomePage({ initialPosts, initialCategories, initialSubcategories }) {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedContent, setSelectedContent] = useState(null);
  const [posts, setPosts] = useState(initialPosts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [subcategories, setSubcategories] = useState(initialSubcategories || []);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('[HomePage] Iniciando carga de datos...');
        
        const [dashboardData, metricsData] = await Promise.all([
          fetchDashboardData(APP_CONFIG.USERNAME),
          getDashboardMetrics()
        ]);

        console.log('[HomePage] Datos recibidos:', {
          postsCount: dashboardData.posts.length,
          hasMetrics: !!metricsData.metrics,
          hasInsights: !!metricsData.insights
        });

        setPosts(dashboardData.posts);
        setCategories(dashboardData.categories);
        setSubcategories(dashboardData.subcategories);
        setMetrics(metricsData.metrics);
        
        if (metricsData.insights) {
          console.log('[HomePage] Insights encontrados, actualizando estado');
          setInsights(metricsData.insights);
        } else {
          console.log('[HomePage] No hay insights, iniciando generación en segundo plano');
          handleGenerateInsights();
        }
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
  }, [initialPosts]);

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
        return "30d"; // Mantenemos el default
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

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const data = await getDashboardInsights(['7d', '30d', 'all']);
      if (data.insights) {
        console.log('[HomePage] Insights generados correctamente');
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('[HomePage] Error generando insights:', error);
      setError('Error generating insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="p-8 bg-gray-50">
      {/* Contenedor de tabs y botón */}
      <div className="mb-6 flex justify-between items-center">
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

        <Button
          color="primary"
          onClick={handleGenerateInsights}
          isLoading={isGeneratingInsights}
        >
          {isGeneratingInsights ? 'Generando...' : 'Generar Insights'}
        </Button>
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
  );
}