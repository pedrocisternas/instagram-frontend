'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { formatDate, formatTime } from '../../../utils/dateFormatters';
import { APP_CONFIG } from '@/config/app';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { 
  assignCategoryToPost,
  assignSubcategoryToPost,
  fetchCategories,
  fetchSubcategories
} from '@/services/api/categories';
import CategoryPopover from '@/components/categories/CategoryPopover';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchPostDetails } from '@/services/api/posts';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estado unificado para todos los detalles del post
  const [details, setDetails] = useState({
    post: null,
    currentCategory: null,
    currentSubcategory: null,
    categories: [],
    subcategories: [],
    transcript: null
  });

  // Función para recargar los detalles del post
  const reloadPostDetails = async () => {
    try {
      const data = await fetchPostDetails(id, APP_CONFIG.USERNAME);
      setDetails(data);
    } catch (err) {
      console.error('Error reloading post details:', err);
      setError(err.message);
    }
  };

  // Manejador para asignar categoría
  const handleAssignCategory = async (categoryId) => {
    try {
      await assignCategoryToPost(APP_CONFIG.USERNAME, categoryId, id);
      const data = await fetchPostDetails(id, APP_CONFIG.USERNAME);
      setDetails(data);
    } catch (error) {
      console.error('Error assigning category:', error);
    }
  };

  // Manejador para asignar subcategoría
  const handleAssignSubcategory = async (subcategoryId) => {
    try {
      await assignSubcategoryToPost(APP_CONFIG.USERNAME, subcategoryId, id);
      const data = await fetchPostDetails(id, APP_CONFIG.USERNAME);
      setDetails(data);
    } catch (error) {
      console.error('Error assigning subcategory:', error);
    }
  };

  useEffect(() => {
    const loadPostDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching post details for ID:', id);
        
        const data = await fetchPostDetails(id, APP_CONFIG.USERNAME);
        console.log('Received post details:', data);
        console.log('Transcript in response:', data.transcript);
        
        setDetails(data);
        
      } catch (err) {
        console.error('Error loading post details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPostDetails();
    }
  }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('es-CL').format(num);
  const formatSeconds = (seconds) => `${seconds.toFixed(2)}s`;

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-center gap-4">
          {/* Video skeleton */}
          <div className="w-[400px]">
            <div className="aspect-[9/16] bg-gray-200 rounded-xl"></div>
          </div>
          {/* Metrics skeleton */}
          <div className="w-[400px] space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  const { post, currentCategory, currentSubcategory, categories, subcategories, transcript } = details;
  
  console.log('Transcript after destructuring:', transcript);

  const handleTranscribe = async () => {
    try {
      console.log('Solicitando transcripción...');
      const response = await fetch(
        `${APP_CONFIG.API_URL}/api/transcripts/${post.instagram_account_id}/${post.id}/generate`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transcripción completada:', data);
      console.log('Texto completo:', data.full_text);
      console.log('Segmentos:', data.segments);
    } catch (error) {
      console.error('Error al transcribir:', error);
    }
  };

  return (
    <main className="p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detalles del Post</h1>
          <Button color="secondary" onClick={() => router.back()}>
            Volver
          </Button>
        </div>

        {/* Contenedor principal - 3 columnas, centrado */}
        <div className="max-w-[1280px] mx-auto">  {/* Contenedor con ancho máximo y centrado */}
          <div className="flex justify-center gap-4">  {/* Centrado horizontal */}
            {/* Columna 1 - Video */}
            <div className="w-[400px]">
              <div className="aspect-[9/16] rounded-xl overflow-hidden border-2 border-black">  {/* Agregado borde y bordes redondeados */}
                {post?.media_url && (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>
            </div>

            {/* Columna 2 - Métricas */}
            <div className="w-[400px] space-y-4">
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4">Categorizaciones</h3>
                  <div className="flex gap-4">
                    <div className="w-28">
                      <p className="text-sm text-gray-600 mb-2">Categoría</p>
                      <div className="min-h-[28px] flex items-center">
                        <CategoryPopover
                          category={currentCategory}
                          categories={categories}
                          onAssignCategory={handleAssignCategory}
                          type="categoría"
                        />
                      </div>
                    </div>
                    <div className="w-48">
                      <p className="text-sm text-gray-600 mb-2">Subcategoría</p>
                      <div className="min-h-[28px] flex items-center">
                        <CategoryPopover
                          category={currentSubcategory}
                          categories={subcategories.filter(sub => sub.category_id === post?.category_id)}
                          onAssignCategory={handleAssignSubcategory}
                          parentCategory={currentCategory}
                          type="subcategoría"
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

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

              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    
                    {post?.caption && (
                      <div>
                        <p className="text-sm text-gray-600">Caption</p>
                        <div className="relative max-h-[40px] overflow-hidden">
                          <p className="font-medium">{post.caption}</p>
                          {post.caption.length > 40 && (
                            <>
                              <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                              <Popover placement="top">
                                <PopoverTrigger>
                                  <button className="absolute bottom-0 left-1/2 -translate-x-1/2 text-purple-600 text-sm flex items-center hover:text-purple-700">
                                    Ver más <ChevronUpIcon className="w-4 h-4 ml-1" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-4 bg-white shadow-lg rounded-lg">
                                  <p className="font-medium whitespace-pre-wrap">{post.caption}</p>
                                </PopoverContent>
                              </Popover>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Columna 3 - Transcripción */}
            <div className="w-[400px]">
              <Card>
                <CardBody>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Transcripción</h3>
                    <Button
                      color="secondary"
                      onClick={handleTranscribe}
                    >
                      Transcribir Video
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {transcript ? (
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-20'}`}>
                        <p className="text-sm text-gray-600">{transcript.full_text}</p>
                        {isExpanded && transcript.segments && (
                          <div className="mt-4 space-y-2">
                            {transcript.segments.map((segment, index) => (
                              <div key={index} className="text-xs text-gray-500">
                                <span className="font-medium">{segment.startTime} - {segment.endTime}:</span>
                                <span className="ml-2">{segment.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No hay transcripción disponible.
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}