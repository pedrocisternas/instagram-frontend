'use client'
import { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, Select, SelectItem } from "@heroui/react";
import { fetchDashboardData } from '@/services/api/posts';
import RankingsList from '@/components/rankings/RankingsList';
import RankingsSkeleton from '@/components/rankings/RankingsSkeleton';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';

const METRICS = [
  { key: 'views', label: 'Views' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
  { key: 'saves', label: 'Saves' }
];

export default function RankingsPage() {
  const router = useRouter();
  const { user, authState } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Calcular métricas por subcategoría
  const subcategoryMetrics = useMemo(() => {
    const metrics = subcategories.map(subcategory => {
      const subcategoryPosts = posts.filter(post => post.subcategory_id === subcategory.id);
      const validPosts = subcategoryPosts.filter(post => post[selectedMetric] > 0);
      const category = categories.find(c => c.id === subcategory.category_id);
      
      const average = validPosts.length > 0
        ? validPosts.reduce((acc, post) => acc + (post[selectedMetric] || 0), 0) / validPosts.length
        : 0;

      return {
        id: subcategory.id,
        name: subcategory.name,
        metricValue: Math.round(average),
        metricName: selectedMetric,
        postCount: validPosts.length,
        parentCategory: category?.name,
        category: category
      };
    });

    // Agregar métricas para posts sin subcategoría pero con categoría
    categories.forEach(category => {
      const postsWithoutSubcategory = posts.filter(post => 
        post.category_id === category.id && !post.subcategory_id
      );
      const validPosts = postsWithoutSubcategory.filter(post => post[selectedMetric] > 0);

      if (validPosts.length > 0) {
        const average = validPosts.reduce((acc, post) => 
          acc + (post[selectedMetric] || 0), 0
        ) / validPosts.length;

        metrics.push({
          id: `no-subcategory-${category.id}`,
          name: 'Sin subcategoría',
          metricValue: Math.round(average),
          metricName: selectedMetric,
          postCount: validPosts.length,
          parentCategory: category.name,
          category: category
        });
      }
    });

    return metrics
      .filter(metric => metric.postCount > 0)
      .sort((a, b) => b.metricValue - a.metricValue);
  }, [subcategories, posts, categories, selectedMetric]);

  // Agregar este useEffect para manejar la redirección
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!user?.username) {
          console.log('No username available, skipping data load');
          return;
        }
        const data = await fetchDashboardData(user.username);
        setPosts(data.posts);
        setCategories(data.categories);
        setSubcategories(data.subcategories);
      } catch (err) {
        console.error('Error loading rankings data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      loadData();
    }
  }, [user?.username]);

  // Agregar el listener para el evento de sincronización
  useEffect(() => {
    const handleSync = async (event) => {
      try {
        const data = event.detail;
        setPosts(data.posts);
        setCategories(data.categories);
        setSubcategories(data.subcategories);
      } catch (error) {
        console.error('[RankingsPage] Error en sincronización:', error);
      }
    };

    window.addEventListener('metrics-synced', handleSync);
    return () => window.removeEventListener('metrics-synced', handleSync);
  }, []); // Sin dependencias ya que solo usamos setters

  if (authState === 'loading' || loading) {
    return <RankingsSkeleton />;
  }
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <AuthGuard>
      <main className="p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Rankings por subcategoría</h1>
              {/* <SyncButton
                isSyncing={isSyncing}
                onSync={syncAllData}
                lastUpdate={lastUpdate}
              /> */}
            </div>
            <Select 
              defaultSelectedKeys={['views']}
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-32"
            >
              {METRICS.map(metric => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Card>
            <CardBody>
              <RankingsList items={subcategoryMetrics} />
            </CardBody>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}