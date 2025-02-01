export default function AnalyticsSkeleton() {
    return (
      <main className="p-8 bg-gray-50 animate-pulse">
        <div className="flex justify-between items-start mb-6">
          {/* Botón y texto de última actualización */}
          <div>
            <div className="h-10 w-40 bg-gray-200 rounded"></div>
            <div className="h-4 w-56 bg-gray-200 rounded mt-1"></div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
  
        {/* Gráfico */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-[700px] w-full bg-gray-100 rounded-lg">
            {/* Leyenda */}
            <div className="flex justify-end p-4">
              <div className="w-48 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }