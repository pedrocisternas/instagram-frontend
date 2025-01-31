export default function RankingsSkeleton() {
  return (
    <main className="p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center p-2.5 mb-2 bg-gray-50 rounded-lg">
              <div className="h-7 w-8 bg-gray-200 rounded"></div>
              <div className="flex-1 ml-4">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
              <div className="text-right">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}