import { Card, CardBody, Tooltip } from "@heroui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const StatItem = ({ label, value, subtitle, formatter = (val) => Math.round(val)?.toLocaleString() }) => (
  <Card className="h-24 shadow-xs">
    <CardBody className="py-3 px-4 flex flex-col justify-between">
      <div className="text-sm text-gray-600 font-medium flex items-center">
        <span className="truncate">{label}</span>
        {subtitle && (
          <Tooltip content={subtitle} placement="top">
            <span className="ml-1 cursor-help">
              <InformationCircleIcon className="h-4 w-4 text-gray-400" />
            </span>
          </Tooltip>
        )}
      </div>
      <div className="text-center">
        <p className="text-3xl font-semibold text-gray-800">{formatter(value)}</p>
      </div>
    </CardBody>
  </Card>
);

export default function StatsSummaryPanel({ posts }) {
  const hasMetrics = (post) => {
    // Un post tiene métricas si al menos una es mayor que 0
    return post.likes > 0 || 
           post.comments > 0 || 
           post.views > 0 || 
           post.saves > 0 ||
           post.shares > 0;
  };

  const isValidReel = (post) => {
    return (post.media_type === 'VIDEO' || post.media_type === 'REEL');
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
    // Primero filtramos posts que tengan alguna métrica > 0
    let filteredPosts = posts?.filter(hasMetrics) || [];
    
    // Si es para views, solo consideramos reels/videos
    if (metric === 'views') {
        filteredPosts = filteredPosts.filter(isValidReel);
    }
    // Para cualquier otra métrica, aplicamos el filtro específico si existe
    else if (filterFn) {
        filteredPosts = filteredPosts.filter(filterFn);
    }

    // Solo consideramos posts que tengan la métrica específica > 0
    const postsWithMetric = filteredPosts.filter(post => post[metric] > 0);

    if (!postsWithMetric.length) return 0;
    const sum = postsWithMetric.reduce((acc, post) => acc + post[metric], 0);
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
      label: "Prom. Views", 
      key: "views",
      subtitle: "sólo Reels",
      filterFn: isValidReel
    },
    { label: "Prom. Likes", key: "likes" },
    { label: "Prom. Shares", key: "shares" },
    { label: "Prom. Comments", key: "comments" },
    { label: "Prom. Saves", key: "saves" }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
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