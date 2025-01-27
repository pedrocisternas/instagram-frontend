'use client'

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@heroui/react";
import { useSyncStore } from '@/store/sync';
import { fetchPosts } from '@/services/api/posts';
import { 
  fetchCategories,
  fetchSubcategories 
} from '@/services/api/categories';
import { APP_CONFIG } from '@/config/app';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import PostFilters from '@/components/filters/PostFilters';

// Importamos ApexCharts de forma dinámica para evitar errores de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalyticsDashboard() {
  // Estados
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(new Set([]));
  const [selectedCategories, setSelectedCategories] = useState(new Set([]));
  const [selectedSubcategories, setSelectedSubcategories] = useState(new Set([]));
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [sortField, setSortField] = useState('published_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Store sync
  const { isSyncing, syncMetrics, setLastUpdate, lastUpdate } = useSyncStore();

  // Fetch initial data
  const fetchPostsData = async () => {
    try {
      const data = await fetchPosts(APP_CONFIG.USERNAME);
      setAllPosts(data.posts);
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesData = async () => {
    try {
      const categories = await fetchCategories(APP_CONFIG.USERNAME);
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const syncAllData = async () => {
    try {
      await syncMetrics();
      await fetchPostsData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtrado de posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const typeMatch = selectedTypes.size === 0 || 
        selectedTypes.has(post.media_type === 'REEL' ? 'VIDEO' : post.media_type);
      
      const categoryMatch = selectedCategories.size === 0 || 
        (post.category_id && selectedCategories.has(post.category_id));
      
      const subcategoryMatch = selectedSubcategories.size === 0 ||
        (post.subcategory_id && selectedSubcategories.has(post.subcategory_id));
      
      return typeMatch && categoryMatch && subcategoryMatch;
    });
  }, [allPosts, selectedTypes, selectedCategories, selectedSubcategories]);

  // Datos para el gráfico
  const chartData = useMemo(() => {
    const sorted = [...filteredPosts].sort((a, b) => 
      new Date(b.published_at) - new Date(a.published_at)
    );

    const recentPosts = sorted.slice(0, 50);
    const historicalPosts = sorted.slice(50);
    const historicalAverage = historicalPosts.length > 0 ? {
      views: Math.round(historicalPosts.reduce((sum, post) => sum + (post.views || 0), 0) / historicalPosts.length),
      count: historicalPosts.length
    } : null;

    return {
      recentPosts,
      historicalAverage
    };
  }, [filteredPosts]);

  // Configuración del gráfico
  const chartOptions = {
    chart: {
      type: 'scatter',
      zoom: { enabled: true, type: 'xy' },
      toolbar: { show: true },
      padding: {
        bottom: 20
      }
    },
    markers: {
      size: 8,
      hover: {
        size: 10
      }
    },
    xaxis: {
      type: 'category',
      labels: { 
        rotate: -45,
        maxHeight: 100,
        trim: true
      }
    },
    yaxis: {
      title: { text: 'Views' },
      labels: {
        formatter: (val) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
          } else if (val >= 1000) {
            return `${(val / 1000).toFixed(0)}K`;
          }
          return val;
        }
      },
      tickAmount: 6
    },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString()
      }
    }
  };

  // Effect para cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchPostsData(),
          fetchCategoriesData()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categories.length) return;
      
      try {
        const promises = categories.map(category => 
          fetchSubcategories(APP_CONFIG.USERNAME, category.id)
        );
        
        const results = await Promise.all(promises);
        const allSubcategories = results.flat();
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    };

    loadSubcategories();
  }, [categories]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="p-8 bg-gray-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button
            color="primary"
            isLoading={isSyncing}
            onPress={syncAllData}
          >
            {isSyncing ? 'Sincronizando...' : 'Actualizar Métricas'}
          </Button>
          {lastUpdate && (
            <p className="text-sm text-gray-600 mt-1">
              Última actualización: {formatDate(lastUpdate)} {formatTime(lastUpdate)}
            </p>
          )}
        </div>
        
        <PostFilters 
          selectedTypes={selectedTypes}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          categories={categories}
          subcategories={subcategories}
          sortField={sortField}
          sortDirection={sortDirection}
          onTypeChange={setSelectedTypes}
          onCategoryChange={setSelectedCategories}
          onSubcategoryChange={setSelectedSubcategories}
          onSortReset={() => {
            setSortField('published_at');
            setSortDirection('desc');
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Chart
          options={chartOptions}
          series={[{
            name: 'Posts',
            data: chartData.recentPosts.map((post, index) => ({
              x: post.caption?.slice(0, 30) || `Post ${index + 1}`,
              y: post.views || 0,
              mediaType: post.media_type,
              category: post.category_id
            }))
          }]}
          type="scatter"
          height={700}
        />
      </div>
    </main>
  );
}