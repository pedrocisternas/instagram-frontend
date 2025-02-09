import React, { useMemo } from 'react';
import { Card, CardBody } from "@heroui/react";
import Chart from "react-apexcharts";

export default function PublishingVolume({ posts, timeRange }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];
    const categories = [];
    
    // Calcular el promedio histórico
    const historicalAverage = posts.length > 0 
      ? posts.length / ((now - new Date(Math.min(...posts.map(p => new Date(p.published_at))))) / (1000 * 60 * 60 * 24 * (timeRange === "7days" ? 7 : 30)))
      : 0;
    
    if (timeRange === "7days") {
      // Mostrar los últimos 12 períodos de 7 días
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now);
        const startDate = new Date(now);
        
        // Períodos rodantes de 7 días
        endDate.setDate(now.getDate() - (i * 7));
        startDate.setDate(now.getDate() - ((i + 1) * 7));
        
        const count = posts.filter(post => {
          const postDate = new Date(post.published_at);
          return postDate >= startDate && postDate < endDate;
        }).length;
        
        data.push(count);
        categories.push(`S -${i}`);
      }
    } else if (timeRange === "30days") {
      // Mostrar los últimos 12 períodos de 30 días
      for (let i = 11; i >= 0; i--) {
        const endDate = new Date(now);
        const startDate = new Date(now);
        
        // Períodos rodantes de 30 días
        endDate.setDate(now.getDate() - (i * 30));
        startDate.setDate(now.getDate() - ((i + 1) * 30));
        
        const count = posts.filter(post => {
          const postDate = new Date(post.published_at);
          return postDate >= startDate && postDate < endDate;
        }).length;
        
        data.push(count);
        categories.push(`M -${i}`);
      }
    }

    // Reemplazar la última etiqueta con "Actual"
    categories[categories.length - 1] = 'Actual';

    // Calcular el máximo para el yaxis
    const maxValue = Math.max(...data, historicalAverage);
    const minYAxis = timeRange === "7days" ? 7 : 30;
    const yaxisMax = Math.max(maxValue, minYAxis);

    return {
      series: [
        {
          name: 'Publicaciones',
          data: data
        }
      ],
      options: {
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          },
          events: {
            click: () => null // Deshabilitar clicks
          }
        },
        annotations: {
        //   yaxis: [{
        //     y: historicalAverage,
        //     borderColor: '#666',
        //     label: {
        //       text: `Promedio histórico: ${historicalAverage.toFixed(1)}`,
        //       style: {
        //         color: '#666',
        //         background: '#f8f8f8'
        //       }
        //     }
        //   }]
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
            columnWidth: '60%',
            distributed: true,
          }
        },
        colors: data.map((_, index) => index === data.length - 1 ? '#ffffff' : '#9353d3'),
        dataLabels: {
          enabled: true,
          style: {
            colors: data.map((_, index) => index === data.length - 1 ? '#6b21a8' : '#ffffff')
          },
          formatter: function (val) {
            return Math.round(val);
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['#6b21a8']
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              colors: '#666',
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          min: 0,
          max: yaxisMax,
          tickAmount: 4,
          labels: {
            formatter: function(val) {
              return Math.round(val);
            },
            style: {
              colors: '#666',
              fontSize: '12px'
            }
          }
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function (val) {
              return Math.round(val) + " publicaciones"
            }
          }
        },
        legend: {
          show: false
        }
      }
    };
  }, [posts, timeRange]);

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">
            Volumen de Publicaciones
          </h3>
          <div className="w-full h-[300px]">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="bar"
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}