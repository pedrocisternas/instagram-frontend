'use client'
import { useState, useEffect, useMemo } from 'react';
import { Tabs, Tab } from "@heroui/react";
import MetricsPanel from '@/components/home/MetricsPanel';
import TopContentList from '@/components/home/TopContentList';
import ContentPreview from '@/components/home/ContentPreview';
import ContentDistribution from '@/components/home/ContentDistribution';
import { fetchDashboardData } from '@/services/api/posts';
import { APP_CONFIG } from '@/config/app';

export default function HomePage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedContent, setSelectedContent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(APP_CONFIG.USERNAME);
        setPosts(data.posts);
        setCategories(data.categories);
        setSubcategories(data.subcategories);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar posts según timeRange
  const filteredPosts = useMemo(() => {
    if (timeRange === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return posts.filter(post => new Date(post.published_at) >= thirtyDaysAgo);
    }
    return posts;
  }, [posts, timeRange]);

  return (
    <main className="p-8 bg-gray-50">
      {/* Tabs de período */}
      <div className="mb-6">
        <Tabs 
          selectedKey={timeRange} 
          onSelectionChange={setTimeRange}
          className="justify-center"
          size="md"
          variant="solid"
          color="secondary"
          classNames={{
            tabList: "max-w-[400px]"
          }}
        >
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
              posts={filteredPosts}
            />
          </div>
          
          {/* Panel inferior dividido */}
          <div className="grid grid-cols-5 gap-6">
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
            <div className="col-span-2">
              <ContentPreview 
                selectedContent={selectedContent} 
                posts={filteredPosts?.filter(post => post.views > 0)
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 7)}
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
          {/* Espacio para futuros componentes */}
        </div>
      </div>
    </main>
  );
}