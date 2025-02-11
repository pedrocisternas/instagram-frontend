'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider, Popover, PopoverTrigger, PopoverContent, Tabs, Tab, Tooltip, CircularProgress, Skeleton } from "@heroui/react";
import { formatDate, formatTime } from '../../../utils/dateFormatters';
import { APP_CONFIG } from '@/config/app';
import { 
  assignCategoryToPost,
  assignSubcategoryToPost,
} from '@/services/api/categories';
import CategoryPopover from '@/components/categories/CategoryPopover';
import { ChevronUpIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { fetchPostDetails } from '@/services/api/posts';
import { generateTranscript } from '@/services/api/transcripts';
import { getPostInsights, checkPostInsights } from '@/services/api/insights';
import MetricWithDiff from '@/components/post/MetricWithDiff';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState(null);
  const [needsInsightsUpdate, setNeedsInsightsUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");
  
  // Estado unificado para todos los detalles del post
  const [details, setDetails] = useState({
    post: null,
    currentCategory: null,
    currentSubcategory: null,
    categories: [],
    subcategories: [],
    transcript: null
  });

  // Agregar estado para el tipo de comparación
  const [comparisonType, setComparisonType] = useState('category');

  const handleAssignCategory = async (categoryId, postId) => {
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

  const handleGenerateInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const insightsData = await getPostInsights(details.post.id);
      setInsights(insightsData.analysis);
      setInsightsGeneratedAt(insightsData.generated_at);
      setNeedsInsightsUpdate(false);
    } catch (error) {
      console.error('Error generando insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const postData = await fetchPostDetails(id, APP_CONFIG.USERNAME);
        setDetails(postData);

        if (postData?.post?.id) {
          const insightsData = await checkPostInsights(postData.post.id);
          if (insightsData.analysis) {
            setInsights(insightsData.analysis);
            setInsightsGeneratedAt(insightsData.generated_at);
            setNeedsInsightsUpdate(insightsData.needs_update);
          } else {
            setNeedsInsightsUpdate(true);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Agregar el listener para el evento de sincronización
  useEffect(() => {
    const handleSync = async (event) => {
      if (!details.post?.id) return; // Si no hay post, no hacemos nada
      
      const data = event.detail;
      // Encontrar el post actualizado en los datos sincronizados
      const updatedPost = data.posts.find(p => p.id === details.post.id);
      
      if (updatedPost) {
        setDetails(prev => ({
          ...prev,
          post: updatedPost
        }));
      }

      // Actualizar categorías y subcategorías si están presentes en los datos
      if (data.categories) {
        setDetails(prev => ({
          ...prev,
          categories: data.categories
        }));
      }
      if (data.subcategories) {
        setDetails(prev => ({
          ...prev,
          subcategories: data.subcategories
        }));
      }
    };

    window.addEventListener('metrics-synced', handleSync);
    return () => window.removeEventListener('metrics-synced', handleSync);
  }, [details.post?.id]); // Dependencias necesarias

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

  return (
    <main className="p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Detalles del Post</h1>
            {post?.permalink && (
              <Tooltip content="Ver en Instagram">
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="ml-2 w-5 h-5" />
                </a>
              </Tooltip>
            )}
          </div>
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
                    <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                    <div className="space-y-4">
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
                      {/* Categorizaciones */}
                      <div className="flex gap-4 mb-4">
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

                      {/* Detalles existentes */}
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
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Engagement</h3>
                        <Tabs 
                          selectedKey={comparisonType} 
                          onSelectionChange={setComparisonType}
                          size="sm"
                          variant="solid"
                          color="secondary"
                          className="max-w-[200px]"
                        >
                          <Tab 
                            key="category" 
                            title="Por categoría"
                            isDisabled={!details.post.category_id} 
                          />
                          <Tab key="global" title="Global" />
                        </Tabs>
                      </div>
                      
                      <MetricWithDiff 
                        label="Likes" 
                        value={details.post.likes} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.likes 
                          : details.categoryRelativeMetrics?.likes
                        } 
                      />
                      <MetricWithDiff 
                        label="Comments" 
                        value={details.post.comments} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.comments 
                          : details.categoryRelativeMetrics?.comments
                        }
                      />
                      <MetricWithDiff 
                        label="Saves" 
                        value={details.post.saves} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.saves 
                          : details.categoryRelativeMetrics?.saves
                        }
                      />
                      <MetricWithDiff 
                        label="Shares" 
                        value={details.post.shares} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.shares 
                          : details.categoryRelativeMetrics?.shares
                        }
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Rendimiento</h3>
                        <Tabs 
                          selectedKey={comparisonType} 
                          onSelectionChange={setComparisonType}
                          size="sm"
                          variant="solid"
                          color="secondary"
                          className="max-w-[200px]"
                        >
                          <Tab 
                            key="category" 
                            title="Por categoría"
                            isDisabled={!details.post.category_id} 
                          />
                          <Tab key="global" title="Global" />
                        </Tabs>
                      </div>

                      <MetricWithDiff 
                        label="Views" 
                        value={details.post.views} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.views 
                          : details.categoryRelativeMetrics?.views
                        }
                      />
                      <MetricWithDiff 
                        label="Reach" 
                        value={details.post.reach}
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.reach 
                          : details.categoryRelativeMetrics?.reach
                        }
                      />
                      <MetricWithDiff 
                        label="Avg Watch Time" 
                        value={details.post.avg_watch_time} 
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.watchTime 
                          : details.categoryRelativeMetrics?.watchTime
                        }
                        formatter={(val) => `${val?.toFixed(2)}s`}
                      />
                      <MetricWithDiff 
                        label="Total Watch Time" 
                        value={details.post.total_watch_time}
                        diff={comparisonType === 'global' 
                          ? details.relativeMetrics.totalWatchTime 
                          : details.categoryRelativeMetrics?.totalWatchTime
                        }
                        formatter={(val) => `${(val / 1000).toFixed(2)}s`}
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Columna 3 - Transcripción e Insights */}
            <div className="flex flex-col h-full gap-4">
              <Card className="flex-1">
                <CardBody className="flex flex-col h-[calc(100vh-280px)]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Tabs 
                        selectedKey={activeTab} 
                        onSelectionChange={setActiveTab}
                        size="sm"
                        variant="solid"
                        color="secondary"
                        className="max-w-[300px]"
                      >
                        <Tab key="insights" title="Insights" />
                        <Tab key="transcript" title="Transcripción" />
                      </Tabs>
                    </div>
                    {activeTab === "insights" && needsInsightsUpdate && insights && (
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={handleGenerateInsights}
                        disabled={isLoadingInsights}
                        startContent={isLoadingInsights && (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      >
                        Actualizar
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    {/* Estado de Carga */}
                    {(isLoadingInsights || isTranscribing) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                        <div className="relative">
                          <div className="w-20 h-20">
                            <CircularProgress
                              size="lg"
                              color="secondary"
                              isIndeterminate
                              className="absolute inset-0"
                            />
                          </div>
                        </div>
                        <div className="mt-6 text-center">
                          <LoadingMessage activeTab={activeTab} />
                        </div>
                      </div>
                    )}

                    {/* Skeleton Loading */}
                    {isLoadingInsights && (
                      <div className="space-y-6 opacity-50">
                        {/* Skeleton Summary Card */}
                        <Card>
                          <CardBody>
                            <div className="flex items-center gap-4">
                              <Skeleton className="w-16 h-16 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        {/* Skeleton Metrics */}
                        <Card>
                          <CardBody>
                            <Skeleton className="h-5 w-40 mb-4" />
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <Skeleton className="w-6 h-6 rounded-full" />
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-48" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardBody>
                        </Card>

                        {/* Skeleton Content Analysis */}
                        <Card>
                          <CardBody>
                            <Skeleton className="h-5 w-40 mb-4" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-5/6" />
                              <Skeleton className="h-3 w-4/6" />
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    )}

                    {/* Contenido Real */}
                    {!isLoadingInsights && activeTab === "insights" && (insights ? (
                      <div className="space-y-6 transition-all duration-300">
                        {/* Summary Section */}
                        <Card>
                          <CardBody>
                            <div className="flex items-center gap-4">
                              <div className={`text-2xl ${
                                insights.summary.score >= 80 ? 'text-success' :
                                insights.summary.score >= 60 ? 'text-warning' :
                                'text-danger'
                              }`}>
                                {insights.summary.score}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">{insights.summary.status}</h4>
                                <p className="text-sm text-gray-600">{insights.summary.quick_take}</p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        {/* Metrics Analysis */}
                        <Card>
                          <CardBody>
                            <h4 className="text-sm font-semibold mb-4">Métricas Destacadas</h4>
                            <div className="space-y-4">
                              {insights.metrics_analysis.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className={`text-xl ${
                                    highlight.trend === 'up' ? 'text-success' :
                                    highlight.trend === 'down' ? 'text-danger' :
                                    'text-warning'
                                  }`}>
                                    {highlight.trend === 'up' ? '↑' : highlight.trend === 'down' ? '↓' : '→'}
                                  </div>
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-medium">{highlight.metric}</span>
                                      <span className="text-sm text-gray-600">{highlight.value}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{highlight.insight}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardBody>
                        </Card>

                        {/* Content Analysis */}
                        <Card>
                          <CardBody>
                            <h4 className="text-sm font-semibold mb-4">Análisis de Contenido</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {insights.content_analysis}
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)]">
                        <div className="w-20 h-20 text-secondary mb-4">
                          <MagnifyingGlassIcon className="w-full h-full" />
                        </div>
                        <p className="text-gray-600 text-center mb-4">
                          No hay insights disponibles para este post.
                        </p>
                        <Button
                          color="secondary"
                          onClick={handleGenerateInsights}
                          size="lg"
                          disabled={isLoadingInsights}
                        >
                          {isLoadingInsights ? (
                            <div className="flex items-center gap-2">
                              <CircularProgress size="sm" color="current" />
                              <span>Generando...</span>
                            </div>
                          ) : (
                            "Generar Insights"
                          )}
                        </Button>
                      </div>
                    ))}

                    {/* Transcript Tab Content */}
                    {activeTab === "transcript" && (
                      <div className="flex-1 overflow-y-auto">
                        {details.transcript ? (
                          <div className="space-y-4">
                            {/* Texto completo siempre visible */}
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {details.transcript.full_text}
                            </div>

                            {/* Segmentos con marcas de tiempo (expandible) */}
                            <div className={`transition-all duration-300 overflow-hidden max-h-[1000px]`}>
                              <div className="mt-6 mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Segmentos con marcas de tiempo</h4>
                              </div>
                              <div className="space-y-2">
                                {details.transcript.segments.map((segment, index) => (
                                  <div key={index} className="text-xs text-gray-500">
                                    <span className="font-medium">{segment.startTime} - {segment.endTime}:</span>
                                    <span className="ml-2">{segment.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)] relative">
                            <div className="w-20 h-20 text-secondary mb-4">
                              {isTranscribing ? (
                                <CircularProgress
                                  size="lg"
                                  color="secondary"
                                  isIndeterminate
                                  className="w-full h-full"
                                />
                              ) : (
                                <MagnifyingGlassIcon className="w-full h-full" />
                              )}
                            </div>
                            <div className="mb-4">
                              {isTranscribing ? (
                                <TranscriptLoadingMessage />
                              ) : (
                                <p className="text-gray-600 text-center">
                                  No hay transcripción disponible.
                                </p>
                              )}
                            </div>
                            {!isTranscribing && (
                              <Button
                                color="secondary"
                                onClick={handleTranscribe}
                                size="lg"
                              >
                                Transcribir Video
                              </Button>
                            )}
                          </div>
                        )}
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

// Modificar el componente LoadingMessage para recibir activeTab como prop
function LoadingMessage({ activeTab }) {
  const messages = activeTab === "transcript" 
    ? ["Analizando video...", "Extrayendo audio...", "Transcribiendo video..."]
    : ["Analizando métricas...", "Generando insights...", "Organizando insights...", "Procesando contenido..."];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <p className="text-secondary-600 text-center animate-fade-in">
      {messages[messageIndex]}
    </p>
  );
}

// Primero agregamos el componente (junto a LoadingMessage existente)
function TranscriptLoadingMessage() {
  const messages = [
    "Extrayendo audio...",
    "Transcribiendo video..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-secondary-600 text-center animate-fade-in">
      {messages[messageIndex]}
    </p>
  );
}
