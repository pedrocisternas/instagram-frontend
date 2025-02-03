import { Card, CardBody } from "@heroui/react";

const StatItem = ({ label, value, subtitle, formatter = (val) => Math.round(val)?.toLocaleString() }) => (
  <Card>
    <CardBody>
      <h3 className="text-sm text-gray-600">
        {label}
        {subtitle && <span className="text-xs text-gray-500 ml-1">({subtitle})</span>}
      </h3>
      <p className="text-2xl font-semibold">{formatter(value)}</p>
    </CardBody>
  </Card>
);

export default function StatsSummaryPanel({ posts }) {
  const hasMetrics = (post) => {
    return post.likes !== null || 
           post.comments !== null || 
           post.views !== null || 
           post.avg_watch_time !== null ||
           post.saves !== null ||
           post.shares !== null;
  };

  const isValidReel = (post) => {
    return (post.media_type === 'VIDEO' || post.media_type === 'REEL') && 
           post.views !== null;
  };

  const getValidPostsCount = () => {
    const postsWithMetrics = posts?.filter(hasMetrics) || [];
    return postsWithMetrics.filter(post => 
      (post.likes > 0) || 
      (post.comments > 0) || 
      (post.views > 0) || 
      (post.saves > 0) || 
      (post.shares > 0)
    ).length;
  };

  const getValidReelsCount = () => {
    const reels = posts?.filter(isValidReel) || [];
    return reels.filter(post => post.views > 0).length;
  };

  const calculateAverage = (metric, filterFn = null) => {
    // Primero filtramos posts con alguna métrica
    let filteredPosts = posts?.filter(hasMetrics) || [];
    
    // Luego aplicamos el filtro específico si existe
    if (filterFn) {
      filteredPosts = filteredPosts.filter(filterFn);
    }

    // Para métricas específicas, solo consideramos posts que tengan esa métrica
    const postsWithMetric = filteredPosts.filter(post => post[metric] !== null);

    if (!postsWithMetric.length) return 0;
    const sum = postsWithMetric.reduce((acc, post) => acc + (post[metric] || 0), 0);
    return sum / postsWithMetric.length;
  };

  const metrics = [
    { 
      label: "Publicaciones", 
      key: "total_count",
      subtitle: "con métricas",
      value: getValidPostsCount(),
      formatter: (val) => val.toLocaleString()
    },
    { 
      label: "Reels/Videos", 
      key: "reels_count",
      subtitle: "con métricas",
      value: getValidReelsCount(),
      formatter: (val) => val.toLocaleString()
    },
    { 
      label: "Promedio Views", 
      key: "views",
      subtitle: "sólo Reels",
      filterFn: isValidReel
    },
    { label: "Promedio Likes", key: "likes" },
    { label: "Promedio Shares", key: "shares" },
    { label: "Promedio Comments", key: "comments" },
    { label: "Promedio Saves", key: "saves" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
      {metrics.map(({ label, key, subtitle, filterFn, value, formatter }) => (
        <StatItem
          key={key}
          label={label}
          subtitle={subtitle}
          value={value !== undefined ? value : calculateAverage(key, filterFn)}
          formatter={formatter}
        />
      ))}
    </div>
  );
}