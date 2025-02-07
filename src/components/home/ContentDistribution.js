import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Importamos ApexCharts de forma dinámica para evitar errores de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

export default function ContentDistribution({ posts, categories }) {
  // Calculamos la distribución de posts por categoría
  const distribution = useMemo(() => {
    const categoryCount = {};
    const uncategorizedCount = posts?.filter(post => !post.category_id).length || 0;

    // Contamos posts por categoría
    posts?.forEach(post => {
      if (post.category_id) {
        categoryCount[post.category_id] = (categoryCount[post.category_id] || 0) + 1;
      }
    });

    // Preparamos las series y labels para el gráfico
    const series = [];
    const labels = [];
    const counts = [];
    
    // Primero agregamos las categorías existentes
    categories?.forEach(category => {
      if (categoryCount[category.id]) {
        series.push(categoryCount[category.id]);
        labels.push(category.name);
        counts.push(categoryCount[category.id]);
      }
    });

    // Agregamos los posts sin categoría si existen
    if (uncategorizedCount > 0) {
      series.push(uncategorizedCount);
      labels.push('Sin categoría');
      counts.push(uncategorizedCount);
    }

    return { series, labels, counts };
  }, [posts, categories]);

  // Extraemos los colores usando getCategoryColor
  const colors = useMemo(() => {
    return [
      ...categories?.map(category => getCategoryColor(category)),
      '#6B7280' // Color para "Sin categoría"
    ];
  }, [categories]);

  const options = {
    chart: {
      type: 'pie',
    },
    labels: distribution.labels,
    colors: colors,
    legend: {
      position: 'right',
      fontSize: '14px',
      offsetY: 50,
      height: 230
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + '%';
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value, { seriesIndex }) {
          return `${distribution.counts[seriesIndex]} publicaciones`;
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-semibold mb-4">Distribución de Contenido</h2>
      {typeof window !== 'undefined' && (
        <Chart
          options={options}
          series={distribution.series}
          type="pie"
          height={350}
        />
      )}
    </div>
  );
} 