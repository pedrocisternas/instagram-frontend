export default function PostSkeleton() {
    return (
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="container mx-auto">
          {/* Título y botón de volver */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Contenedor principal - 3 columnas, centrado */}
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
              {/* Columna 1 - Video */}
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
                <div className="flex-grow flex items-center justify-center">
                  <div className="w-full h-full min-h-[calc(100vh-280px)] flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="aspect-[9/16] w-full max-w-[320px] bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="ml-2 h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Columna 2 - Metadata del contenido */}
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
                <div className="flex flex-col space-y-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  
                  {/* Caption skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Categorías skeleton */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-28 space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-48 space-y-2">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Transcripción y Descripción en grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Duración */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Análisis de video skeletons */}
                  <div className="space-y-4">
                    {/* Tipos de audio */}
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tipos de texto */}
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2].map(i => (
                          <div key={i} className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 3 - Métricas */}
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                
                {/* Engagement skeleton */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rendimiento skeleton */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
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