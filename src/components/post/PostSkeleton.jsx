export default function PostSkeleton() {
    return (
      <main className="p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="h-8 w-48 bg-gray-200 rounded animate-pulse"></h1>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
  
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-3 gap-4 h-[calc(100vh-180px)]">
              {/* Columna 1 - Video Skeleton */}
              <div className="flex flex-col h-full">
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
              </div>
  
              {/* Columna 2 - Métricas Skeleton */}
              <div className="flex flex-col h-full space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg bg-white p-4 shadow">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex justify-between items-center">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Columna 3 - Insights Skeleton */}
              <div className="flex flex-col h-full">
                <div className="rounded-lg bg-white p-4 shadow h-full">
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }