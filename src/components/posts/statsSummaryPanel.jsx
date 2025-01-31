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
    return post.views > 0 || post.likes > 0 || post.shares > 0 || 
           post.comments > 0 || post.saves > 0;
  };

  const isValidReel = (post) => {
    return (post.media_type === 'VIDEO' || post.media_type === 'REEL') && 
           hasMetrics(post) && post.views > 0;
  };

  const calculateAverage = (metric, filterFn = null) => {
    let filteredPosts = posts?.filter(hasMetrics) || [];
    
    if (filterFn) {
      filteredPosts = filteredPosts.filter(filterFn);
    }

    if (!filteredPosts.length) return 0;
    const sum = filteredPosts.reduce((acc, post) => acc + (post[metric] || 0), 0);
    return sum / filteredPosts.length;
  };

  const metrics = [
    { 
      label: "Publicaciones", 
      key: "total_count",
      subtitle: "con métricas",
      value: posts?.filter(hasMetrics).length || 0,
      formatter: (val) => val.toLocaleString()
    },
    { 
      label: "Reels/Videos", 
      key: "reels_count",
      subtitle: "con métricas",
      value: posts?.filter(isValidReel).length || 0,
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