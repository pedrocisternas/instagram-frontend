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
    
    // Aplicar filtro adicional si existe (como el de reels para views)
    if (filterFn) {
      filteredPosts = filteredPosts.filter(filterFn);
    }

    if (!filteredPosts.length) return 0;
    const sum = filteredPosts.reduce((acc, post) => acc + (post[metric] || 0), 0);
    return sum / filteredPosts.length;
  };

  const metrics = [
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {metrics.map(({ label, key, subtitle, filterFn }) => (
        <StatItem
          key={key}
          label={label}
          subtitle={subtitle}
          value={calculateAverage(key, filterFn)}
        />
      ))}
    </div>
  );
}