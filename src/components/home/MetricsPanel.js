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

export default function MetricsPanel({ timeRange, posts }) {
  const hasMetrics = (post) => {
    return post.likes > 0 || 
           post.comments > 0 || 
           post.views > 0 || 
           post.saves > 0 ||
           post.shares > 0;
  };

  const isValidReel = (post) => {
    return (post.media_type === 'VIDEO' || post.media_type === 'REEL');
  };

  const calculateEngagement = (post) => {
    if (!post.views) return 0;
    return ((post.likes + post.comments + post.saves) / post.views) * 100;
  };

  const getMetrics = () => {
    const validPosts = posts?.filter(hasMetrics) || [];
    const validReels = validPosts.filter(isValidReel);

    // Total Posts con métricas
    const totalPosts = validPosts.length;

    // Promedio de views (solo para reels/videos)
    const avgViews = validReels.length > 0
      ? validReels.reduce((acc, post) => acc + (post.views || 0), 0) / validReels.length
      : 0;

    // Engagement promedio
    const avgEngagement = validPosts.length > 0
      ? validPosts.reduce((acc, post) => acc + calculateEngagement(post), 0) / validPosts.length
      : 0;

    return {
      totalPosts,
      avgViews: Math.round(avgViews).toLocaleString(),
      avgEngagement: avgEngagement.toFixed(1)
    };
  };

  const { totalPosts, avgViews, avgEngagement } = getMetrics();

  return (
    <div className="grid grid-cols-3 gap-6">
      <MetricCard
        label="Total Publicaciones"
        value={totalPosts}
      />
      <MetricCard
        label="Views Promedio"
        value={avgViews}
      />
      <MetricCard
        label="Engagement Promedio"
        value={`${avgEngagement}%`}
      />
    </div>
  );
} 