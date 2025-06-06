'use client'

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSyncStore } from '@/store/sync';
import { fetchPosts } from '@/services/api/posts';
import { 
  fetchCategories,
  fetchSubcategories 
} from '@/services/api/categories';
import { formatDate, formatTime } from '@/utils/dateFormatters';
import PostFilters from '@/components/filters/PostFilters';
import { useRouter } from 'next/navigation';
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';

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
  const [selectedDays, setSelectedDays] = useState(0);

  // Store sync
  const { isSyncing, syncMetrics, setLastUpdate, lastUpdate } = useSyncStore();

  const router = useRouter();

  // Agregar esto cerca de los otros hooks al inicio del componente
  const { user, authState } = useAuthStore();

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
      if (!user?.username) {
        console.log('No username available for fetching posts');
        setAllPosts([]);
        return;
      }
      const data = await fetchPosts();
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
      if (!user?.username) {
        console.log('No username available for fetching categories');
        setCategories([]);
        return;
      }
      const categories = await fetchCategories();
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

  // Agreguemos la función para manejar cambios en el filtro de días
  const handleDaysChange = (newDays) => {
    setSelectedDays(newDays);
  };

  // Función para resetear todos los filtros
  const handleResetFilters = () => {
    setSelectedTypes(new Set([]));
    setSelectedCategories(new Set([]));
    setSelectedSubcategories(new Set([]));
    setSelectedDays(0);
    setSortField('published_at');
    setSortDirection('desc');
  };

  // Actualizamos el useMemo de filteredPosts para incluir el filtro de días
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Filtro de tipo de medio
      const typeMatch = selectedTypes.size === 0 || 
        selectedTypes.has(post.media_type === 'REEL' ? 'VIDEO' : post.media_type);
      
      // Filtro de categoría
      const categoryMatch = selectedCategories.size === 0 || 
        (post.category_id && selectedCategories.has(post.category_id));
      
      // Filtro de subcategoría
      const subcategoryMatch = selectedSubcategories.size === 0 ||
        (post.subcategory_id && selectedSubcategories.has(post.subcategory_id));
      
      // Filtro de rango de fechas
      let dateMatch = true;
      if (selectedDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - selectedDays);
        dateMatch = new Date(post.published_at) >= cutoffDate;
      }
      
      return typeMatch && categoryMatch && subcategoryMatch && dateMatch;
    });
  }, [allPosts, selectedTypes, selectedCategories, selectedSubcategories, selectedDays]);

  // Datos del gráfico filtrados y ordenados
  const chartData = useMemo(() => {
    return [...filteredPosts]
      .filter(post => {
        // Solo incluir posts que tengan alguna métrica
        const hasMetrics = post.likes > 0 || 
                          post.comments > 0 || 
                          post.views > 0 || 
                          post.saves > 0 ||
                          post.shares > 0;
        
        // Para el gráfico de views, solo queremos reels/videos con views
        const isValidReel = (post.media_type === 'VIDEO' || post.media_type === 'REEL');
        return hasMetrics && isValidReel && post.views > 0;
      })
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
        postId: post.id,
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
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const dataPoint = config.w.config.series[config.seriesIndex].data[config.dataPointIndex];
          if (dataPoint.postId) {
            console.log('Navigating to Instagram post:', dataPoint.postId);
            router.push(`/post/${dataPoint.postId}`);
          }
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
  }), [averageViews, router]);

  // Effect para cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        if (!user?.username) {
          console.log('No username available, skipping initial data fetch');
          return;
        }
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

    if (user?.username) {
      fetchInitialData();
    }
  }, [user?.username]);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categories.length || !user?.username) return;
      
      try {
        const promises = categories.map(category => 
          fetchSubcategories(category.id)
        );
        
        const results = await Promise.all(promises);
        const allSubcategories = results.flat();
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    };

    loadSubcategories();
  }, [categories, user?.username]);

  // Agregar el listener para el evento de sincronización
  useEffect(() => {
    const handleSync = async (event) => {
      const data = event.detail;
      setAllPosts(data.posts);
      setCategories(data.categories);
      
      // Actualizar lastUpdate si hay posts
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    };

    window.addEventListener('metrics-synced', handleSync);
    return () => window.removeEventListener('metrics-synced', handleSync);
  }, [setLastUpdate]);

  // Agregar este useEffect para manejar la redirección
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  // Modificar la lógica de loading
  if (authState === 'loading' || loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!chartData || chartData.length === 0) return <div className="p-8">No hay datos disponibles</div>;

  return (
    <AuthGuard>
      <main className="p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Analítica</h1>
            {/* <SyncButton
              isSyncing={isSyncing}
              onSync={syncAllData}
              lastUpdate={lastUpdate}
            /> */}
          </div>
          
          <PostFilters 
            selectedTypes={selectedTypes}
            selectedCategories={selectedCategories}
            selectedSubcategories={selectedSubcategories}
            categories={categories}
            subcategories={subcategories}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedDays={selectedDays}
            onTypeChange={setSelectedTypes}
            onCategoryChange={setSelectedCategories}
            onSubcategoryChange={setSelectedSubcategories}
            onDaysChange={handleDaysChange}
            onResetFilters={handleResetFilters}
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
    </AuthGuard>
  );
}