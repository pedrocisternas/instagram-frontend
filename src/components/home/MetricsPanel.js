import { Card, CardBody } from "@heroui/react";

const MetricCard = ({ label, value, icon, trend }) => (
  <Card>
    <CardBody className="flex flex-col items-center p-6">
      <div className="text-gray-600 mb-2">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {trend && (
        <div className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </CardBody>
  </Card>
);

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

  const currentMetrics = metrics?.[getApiTimeRange(timeRange)] || {
    totalPosts: 0,
    avgViews: 0,
    avgEngagement: 0
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <MetricCard
        label="Total Publicaciones"
        value={currentMetrics.totalPosts}
      />
      <MetricCard
        label="Views Promedio"
        value={currentMetrics.avgViews.toLocaleString()}
      />
      <MetricCard
        label="Engagement Promedio"
        value={`${currentMetrics.avgEngagement}%`}
      />
    </div>
  );
} 