import { Card, CardBody } from "@heroui/react";
import { MEDIA_TYPES, getMediaTypeStyle } from '@/utils/mediaTypes';
import { getCategoryStyle } from '@/utils/categoryStyles';

const formatNumber = (number) => {
  if (!number) return '0';
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return number.toString();
};

const calculateEngagement = (post) => {
  if (!post.views) return 0;
  const engagement = ((post.likes + post.comments + post.saves) / post.views) * 100;
  return engagement.toFixed(1);
};

export default function TopContentList({ 
  posts, 
  timeRange, 
  onContentSelect,
  categories,
  subcategories
}) {
  const topPosts = posts
    ?.filter(post => post.views > 0)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 7);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Contenido Top</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {topPosts?.map(post => (
          <div
            key={post.id}
            className="h-24 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onContentSelect(post)}
          >
            <div className="flex justify-between gap-4 h-full">
              {/* Bloque izquierdo */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Caption (4/5 superior) */}
                <div className="flex-1">
                  <p className="text-base text-gray-900 line-clamp-1">
                    {post.caption || 'Sin descripción'}
                  </p>
                </div>

                {/* Contenedor inferior (1/5) */}
                <div className="flex items-center gap-1.5 text-sm">
                  {/* Tag de tipo de contenido */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getMediaTypeStyle(post.media_type)
                  }`}>
                    {MEDIA_TYPES.find(type => type.value === post.media_type)?.label || post.media_type}
                  </span>

                  {/* Badge de Categoría */}
                  {post.category_id && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getCategoryStyle(categories?.find(c => c.id === post.category_id))
                    }`}>
                      {categories?.find(c => c.id === post.category_id)?.name || 'Sin categoría'}
                    </span>
                  )}

                  {/* Badge de Subcategoría */}
                  {post.subcategory_id && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getCategoryStyle(
                        subcategories?.find(s => s.id === post.subcategory_id),
                        categories?.find(c => c.id === post.category_id)
                      )
                    }`}>
                      {subcategories?.find(s => s.id === post.subcategory_id)?.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Bloque derecho */}
              <div className="flex items-center text-gray-900">
                <span className="text-lg font-semibold">
                  {formatNumber(post.views)}
                </span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-lg">
                  {calculateEngagement(post)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 