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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(APP_CONFIG.USERNAME);
        setPosts(data.posts);
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
        >
          <Tab key="30days" title="ÚLTIMOS 30 DÍAS" />
          <Tab key="alltime" title="TODO EL TIEMPO" />
        </Tabs>
      </div>

      {/* Contenedor para lista y preview */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {/* Lista de contenido top (3 columnas) */}
        <div className="col-span-3">
            <MetricsPanel 
            timeRange={timeRange} 
            posts={filteredPosts}
            />
        </div>
        
        {/* Preview del contenido (2 columnas) */}
        <div className="col-span-2">
          <ContentPreview selectedContent={selectedContent} />
        </div>
      </div>

      {/* Distribución de contenido */}
      <div className="mb-8">
        <ContentDistribution timeRange={timeRange} />
      </div>
    </main>
  );
}