import { Card, CardBody } from "@heroui/react";
import CompactMetricDiff from "./CompactMetricDiff";

export default function MetricsPanel({ timeRange, metrics }) {
  // Convertir timeRange del UI al formato de la API
  const getApiTimeRange = (uiTimeRange) => {
    switch (uiTimeRange) {
      case "7days": return "7d";
      case "30days": return "30d";
      case "alltime": return "all";
      default: return "30d";
    }
  };

  const apiTimeRange = getApiTimeRange(timeRange);
  const currentPeriod = apiTimeRange === 'all' 
    ? metrics?.[apiTimeRange] || { totalPosts: 0, avgViews: 0, avgEngagement: 0 }
    : metrics?.[apiTimeRange]?.current || { totalPosts: 0, avgViews: 0, avgEngagement: 0 };
  const previousPeriod = apiTimeRange === 'all'
    ? metrics?.[apiTimeRange] || { totalPosts: 0, avgViews: 0, avgEngagement: 0 }
    : metrics?.[apiTimeRange]?.previous || { totalPosts: 0, avgViews: 0, avgEngagement: 0 };
  const historical = metrics?.['all'] || {
    totalPosts: 0,
    avgViews: 0,
    avgEngagement: 0
  };

  // Función para calcular el porcentaje de diferencia
  const calculateDiff = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metricsData = [
    {
      label: "Total Publicaciones",
      value: currentPeriod.totalPosts,
      vsPrevious: {
        diff: calculateDiff(currentPeriod.totalPosts, previousPeriod.totalPosts),
        baseValue: previousPeriod.totalPosts
      },
      vsHistorical: apiTimeRange !== 'all' && metrics?.[apiTimeRange]?.historicalAvg ? {
        diff: calculateDiff(currentPeriod.totalPosts, metrics[apiTimeRange].historicalAvg),
        baseValue: Math.round(metrics[apiTimeRange].historicalAvg * 10) / 10
      } : null,
      formatter: (val) => val?.toString()
    },
    {
      label: "Views Promedio",
      value: currentPeriod.avgViews,
      vsPrevious: {
        diff: calculateDiff(currentPeriod.avgViews, previousPeriod.avgViews),
        baseValue: previousPeriod.avgViews
      },
      vsHistorical: {
        diff: calculateDiff(currentPeriod.avgViews, historical.avgViews),
        baseValue: historical.avgViews
      },
      formatter: (val) => val?.toLocaleString()
    },
    {
      label: "Engagement Promedio",
      value: currentPeriod.avgEngagement,
      vsPrevious: {
        diff: calculateDiff(currentPeriod.avgEngagement, previousPeriod.avgEngagement),
        baseValue: previousPeriod.avgEngagement
      },
      vsHistorical: {
        diff: calculateDiff(currentPeriod.avgEngagement, historical.avgEngagement),
        baseValue: historical.avgEngagement
      },
      formatter: (val) => `${val}%`
    }
  ];

  console.log('[MetricsPanel] Renderizando con datos:', {
    timeRange: apiTimeRange,
    current: {
      totalPosts: currentPeriod.totalPosts,
      avgViews: currentPeriod.avgViews,
      avgEngagement: currentPeriod.avgEngagement
    },
    previous: {
      totalPosts: previousPeriod.totalPosts,
      avgViews: previousPeriod.avgViews,
      avgEngagement: previousPeriod.avgEngagement
    },
    diffs: metricsData.map(m => ({
      label: m.label,
      vsPrevious: m.vsPrevious,
      vsHistorical: m.vsHistorical
    }))
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardBody className="flex flex-col p-6">
            <div className="text-gray-600 text-center mb-2">{metric.label}</div>
            <div className="text-3xl font-bold text-center mb-4">
              {metric.formatter(metric.value)}
            </div>
            <div className="space-y-2">
              <div className={`bg-gray-50 rounded-lg p-2 ${apiTimeRange === 'all' ? 'invisible' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">vs periodo anterior</span>
                  <CompactMetricDiff 
                    diff={metric.vsPrevious.diff} 
                    baseValue={metric.vsPrevious.baseValue}
                    visible={apiTimeRange !== 'all'}
                  />
                </div>
              </div>
              <div className={`bg-gray-50 rounded-lg p-2 ${apiTimeRange === 'all' ? 'invisible' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">vs promedio histórico</span>
                  <CompactMetricDiff 
                    diff={metric.vsHistorical?.diff} 
                    baseValue={metric.vsHistorical?.baseValue}
                    visible={apiTimeRange !== 'all'}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
} 