'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider } from "@heroui/react";
import { formatDate, formatTime } from '../../../utils/dateFormatters';
import { APP_CONFIG } from '@/config/app';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { fetchCategories, fetchSubcategories } from '@/services/api/categories';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post with ID:', id);
        const url = `${APP_CONFIG.API_URL}/api/posts/${id}?username=${APP_CONFIG.USERNAME}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', response.status, errorText);
          throw new Error(`Post not found (${response.status})`);
        }
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories(APP_CONFIG.USERNAME);
        setCategories(categoriesData);

        // Cargar subcategorías para todas las categorías
        const subcategoriesPromises = categoriesData.map(category =>
          fetchSubcategories(APP_CONFIG.USERNAME, category.id)
        );
        const subcategoriesResults = await Promise.all(subcategoriesPromises);
        setSubcategories(subcategoriesResults.flat());
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const formatNumber = (num) => new Intl.NumberFormat('es-CL').format(num);
  const formatSeconds = (seconds) => `${seconds.toFixed(2)}s`;

  // Función auxiliar para obtener la categoría y subcategoría actual
  const currentCategory = categories.find(c => c.id === post?.category_id);
  const currentSubcategory = subcategories.find(s => s.id === post?.subcategory_id);

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Post</h1>
          <Button
            color="primary"
            variant="flat"
            onClick={() => router.back()}
          >
            Volver
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Container - Left Side */}
          <div className="lg:w-[50%]">
            <Card className="h-full">
              <CardBody>
                {post?.media_url && (
                  <div className="aspect-[16/9] h-[calc(100vh-12rem)]">
                    <video 
                      className="w-full h-full object-contain rounded-lg"
                      controls
                      src={post.media_url}
                      poster={post.thumbnail_url}
                    >
                      Tu navegador no soporta el elemento video.
                    </video>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Metrics Container - Right Side */}
          <div className="lg:w-[50%] space-y-4">
            {/* Categorizaciones Card */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Categorizaciones</h3>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Categoría</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getCategoryStyle(post?.category)
                    }`}>
                      {post?.category ? post.category.name : 'Sin categoría'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Subcategoría</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getCategoryStyle(post?.category)
                    }`}>
                      {post?.subcategory ? post.subcategory.name : 'Sin subcategoría'}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Engagement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Likes</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.likes || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comments</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.comments || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saves</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.saves || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shares</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.shares || 0)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Video Metrics */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Video Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.views || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reach</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.reach || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Watch Time</p>
                    <p className="text-xl font-semibold">{formatSeconds(post?.avg_watch_time || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Watch Time</p>
                    <p className="text-xl font-semibold">{formatSeconds(post?.total_watch_time || 0)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Post Details */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de publicación</p>
                    <p className="font-medium">
                      {post?.published_at && `${formatDate(post.published_at)} ${formatTime(post.published_at)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última actualización</p>
                    <p className="font-medium">
                      {post?.metrics_updated_at && `${formatDate(post.metrics_updated_at)} ${formatTime(post.metrics_updated_at)}`}
                    </p>
                  </div>
                  {post?.caption && (
                    <div>
                      <p className="text-sm text-gray-600">Caption</p>
                      <p className="font-medium">{post.caption}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}