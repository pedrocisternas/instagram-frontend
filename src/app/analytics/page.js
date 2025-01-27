'use client'

import { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/config/app';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Aquí cargaremos los datos para los gráficos
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // TODO: Implementar llamada a la API
        // const data = await fetchAnalytics(APP_CONFIG.USERNAME);
        // setData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Aquí irán los gráficos y estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Engagement por Tipo</h2>
          {/* Gráfico 1 */}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rendimiento por Categoría</h2>
          {/* Gráfico 2 */}
        </div>
      </div>
    </main>
  );
}