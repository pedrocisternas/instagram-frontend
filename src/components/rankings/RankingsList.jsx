import { getCategoryStyle } from '@/utils/categoryStyles';

export default function RankingsList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className={`flex items-center p-2.5 rounded-lg ${getCategoryStyle(item.category)}`}
        >
          <span className="text-lg font-semibold w-8">{index + 1}</span>
          <div className="flex-1">
            <p className="font-medium text-sm">{item.name}</p>
            <p className="text-xs text-gray-600">{item.parentCategory}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">
              {item.metricValue.toLocaleString()} {item.metricName}/post
            </p>
            <p className="text-xs text-gray-600">{item.postCount} posts</p>
          </div>
        </div>
      ))}
    </div>
  );
}