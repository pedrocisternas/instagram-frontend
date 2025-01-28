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
import { getCategoryStyle } from '@/utils/categoryStyles';
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

  // Función auxiliar para extraer el color del texto de la clase de Tailwind
  const getCategoryColor = (category) => {
    if (!category) return '#6B7280'; // gray-600 para posts sin categoría
    
    const paletteIndex = (category.color_index % 15) + 1;
    // Mapa de colores correspondiente a categoryPalette en tailwind.config.mjs
    const colorMap = {
      1: '#F97316',  // Naranja
      2: '#DC2626',  // Rojo
      3: '#16A34A',  // Verde
      4: '#2563EB',  // Azul
      5: '#9333EA',  // Morado
      6: '#DC2626',  // Red
      7: '#CA8A04',  // Yellow
      8: '#BE185D',  // Pink
      9: '#4F46E5',  // Indigo
      10: '#059669', // Emerald
      11: '#7C3AED', // Violet
      12: '#B45309', // Amber
      13: '#0284C7', // Light Blue
      14: '#9D174D', // Rose
      15: '#115E59'  // Teal
    };
    
    return colorMap[paletteIndex];
  };

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

  // Datos del gráfico filtrados y ordenados
  const chartData = useMemo(() => {
    return [...filteredPosts]
      .filter(post => post.views > 0) // Filtramos posts con 0 views
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [filteredPosts]);

  // Series del gráfico con categorías como series separadas
  const series = useMemo(() => {
    const categoryGroups = {};
    
    chartData.forEach(post => {
      const category = categories.find(c => c.id === post.category_id);
      const categoryName = category?.name || 'Sin categoría';
      
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = {
          name: categoryName,
          type: 'scatter',
          color: getCategoryColor(category),
          data: []
        };
      }
      
      categoryGroups[categoryName].data.push({
        x: new Date(post.published_at).getTime(),
        y: post.views || 0,
        views: post.views || 0,
        caption: post.caption || '',
        published_at: post.published_at
      });
    });
    
    return Object.values(categoryGroups);
  }, [chartData, categories]);

  // Calculamos el promedio de vistas
  const averageViews = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, post) => sum + (post.views || 0), 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: 'scatter',
      animations: {
        enabled: false  // Deshabilitamos animaciones para mejor rendimiento
      },
      zoom: {
        enabled: true,
        type: 'xy'
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    legend: {
      show: true,
      position: 'right',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 6
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    xaxis: {
      type: 'datetime',
      reverse: true,
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \'yy',
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      }
    },
    yaxis: {
      title: { text: 'Views' },
      labels: {
        formatter: (val) => {
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
          return val;
        }
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        const category = series[seriesIndex].name;
        const views = point.y >= 1000 
          ? `${(point.y / 1000).toFixed(1)}K` 
          : point.y;
        const date = new Date(point.x).toLocaleDateString();
        
        return `
          <div class="p-2">
            <div class="font-medium">${(point.caption || 'Sin descripción').length > 30 ? `${(point.caption || 'Sin descripción').substring(0, 30)}...` : (point.caption || 'Sin descripción')}</div>
            <div class="text-gray-600">${views} Views</div>
            <div class="text-gray-600">${date}</div>
          </div>
        `;
      },
      shared: false,
      intersect: true,
      fixed: {
        enabled: false
      }
    },
    markers: {
      size: 8,
      hover: {
        size: 10
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    annotations: {
      yaxis: [{
        y: averageViews,
        borderColor: '#000000',
        strokeDashArray: 0,
        borderWidth: 1,
        label: {
          borderColor: '#000000',
          style: {
            color: '#fff',
            background: '#000000',
            padding: {
              left: 10,
              right: 10
            }
          },
          text: `${averageViews >= 1000 ? `${(averageViews / 1000).toFixed(1)}K` : averageViews}`,
          position: 'left',
          offsetX: -13,
          offsetY: 7,
          textAnchor: 'end'
        }
      }]
    }
  }), [averageViews]);

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
  if (!chartData || chartData.length === 0) return <div className="p-8">No hay datos disponibles</div>;

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
          series={series}
          type="scatter"
          height={700}
          width="100%"
        />
      </div>
    </main>
  );
}