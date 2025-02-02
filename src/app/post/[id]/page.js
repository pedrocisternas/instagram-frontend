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
import { generateTranscript } from '@/services/api/transcripts';
import { getPostInsights } from '@/services/api/insights';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
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

  const handleAssignCategory = async (categoryId, postId) => {
    console.log('Assigning category:', { categoryId, postId });
    const previousDetails = { ...details };
    
    // Actualización optimista en el frontend
    setDetails(prev => ({
      ...prev,
      currentCategory: categories.find(c => c.id === categoryId),
      currentSubcategory: null,
      post: { 
        ...prev.post, 
        category_id: categoryId,
        subcategory_id: null
      }
    }));

    try {
      const { post } = await assignCategoryToPost(APP_CONFIG.USERNAME, categoryId, details.post.id);
      document.body.click();
    } catch (error) {
      console.error('Error assigning category:', error);
      setDetails(previousDetails);
    }
  };

  const handleAssignSubcategory = async (subcategoryId, postId) => {
    console.log('Assigning subcategory:', { subcategoryId, postId });
    const previousDetails = { ...details };
    
    // Actualización optimista en el frontend
    setDetails(prev => ({
      ...prev,
      currentSubcategory: subcategories.find(s => s.id === subcategoryId),
      post: { ...prev.post, subcategory_id: subcategoryId }
    }));

    try {
      const { post } = await assignSubcategoryToPost(APP_CONFIG.USERNAME, subcategoryId, details.post.id);
      document.body.click();
    } catch (error) {
      console.error('Error assigning subcategory:', error);
      setDetails(previousDetails);
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
    <main className="p-4">
      <div className="container mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Main content grid */}
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 gap-4 h-[calc(100vh-180px)]">
            {/* Column 1 - Video */}
            <div className="flex flex-col h-full">
              <div className="aspect-[9/16] bg-gray-200 rounded-xl"></div>
            </div>

            {/* Column 2 - Metrics */}
            <div className="flex flex-col h-full space-y-4">
              {/* Categorizations card */}
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              {/* Engagement card */}
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              {/* Video Performance card */}
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              {/* Details card */}
              <div className="h-40 bg-gray-200 rounded-xl"></div>
            </div>

            {/* Column 3 - Transcript */}
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
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
      setIsTranscribing(true);
      const transcriptResult = await generateTranscript(post.instagram_account_id, post.id);
      
      // Actualizar el estado con el nuevo transcript
      setDetails(prev => ({
        ...prev,
        transcript: transcriptResult
      }));
    } catch (error) {
      console.error('Error al transcribir:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const insightsData = await getPostInsights(details.post.instagram_post_id);
      setInsights(insightsData.analysis);
    } catch (error) {
      console.error('Error al generar insights:', error);
    } finally {
      setIsLoadingInsights(false);
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
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 gap-4 h-[calc(100vh-180px)]">
            {/* Columna 1 - Video */}
            <div className="flex flex-col h-full">
              <div className="aspect-[9/16] rounded-xl overflow-hidden border-2 border-black bg-black">
                {post?.media_url ? (
                  <video
                    src={post.media_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : post?.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt="Post thumbnail"
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
            </div>

            {/* Columna 2 - Métricas */}
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="space-y-4">
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
                            onAssignCategory={(categoryId) => handleAssignCategory(categoryId, post.id)}
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
                            onAssignCategory={(categoryId) => handleAssignSubcategory(categoryId, post.id)}
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
            </div>

            {/* Columna 3 - Transcripción e Insights */}
            <div className="flex flex-col h-full gap-4">
              {/* Card de Transcripción */}
              <Card className="flex-1">
                <CardBody className="flex flex-col h-[calc(50vh-120px)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Transcripción</h3>
                    {!transcript && (
                      <Button
                        color="secondary"
                        onClick={handleTranscribe}
                        disabled={isTranscribing}
                      >
                        {isTranscribing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Transcribiendo...
                          </>
                        ) : (
                          'Transcribir Video'
                        )}
                      </Button>
                    )}
                    {transcript && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {transcript ? (
                    <div className="flex-1 overflow-y-auto">
                      <div className={`transition-all duration-300 ${isExpanded ? '' : 'max-h-[calc(100vh-400px)]'}`}>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{transcript.full_text}</p>
                        {isExpanded && transcript.segments && (
                          <>
                            <div className="mt-6 mb-2">
                              <h4 className="text-sm font-semibold text-gray-700">Segmentos con marcas de tiempo</h4>
                            </div>
                            <div className="space-y-2">
                              {transcript.segments.map((segment, index) => (
                                <div key={index} className="text-xs text-gray-500">
                                  <span className="font-medium">{segment.startTime} - {segment.endTime}:</span>
                                  <span className="ml-2">{segment.text}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-600">
                        {isTranscribing 
                          ? "Generando transcripción..." 
                          : "No hay transcripción disponible."}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Card de Insights */}
              <Card className="flex-1">
                <CardBody className="flex flex-col h-[calc(50vh-120px)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Insights</h3>
                    {!insights && (
                      <Button
                        color="secondary"
                        onClick={handleGenerateInsights}
                        disabled={isLoadingInsights}
                      >
                        {isLoadingInsights ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando insights...
                          </>
                        ) : (
                          'Generar Insights'
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {insights ? (
                      <div className="space-y-4">
                        {insights.insights.split('\n\n').map((insight, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{insight}</p>
                          </div>
                        ))}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Métricas</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Views vs Categoría</p>
                              <p className={`text-sm font-medium ${insights.metrics.performance.views.vsCategory > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {insights.metrics.performance.views.vsCategory > 0 ? '↑' : '↓'} {Math.abs(insights.metrics.performance.views.vsCategory).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Engagement vs Categoría</p>
                              <p className={`text-sm font-medium ${insights.metrics.performance.engagement.vsCategory > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {insights.metrics.performance.engagement.vsCategory > 0 ? '↑' : '↓'} {Math.abs(insights.metrics.performance.engagement.vsCategory).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-600">
                          {isLoadingInsights 
                            ? "Analizando el contenido..." 
                            : "No hay insights disponibles."}
                        </p>
                      </div>
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