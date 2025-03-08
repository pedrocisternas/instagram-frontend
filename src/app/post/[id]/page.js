'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider, Popover, PopoverTrigger, PopoverContent, Tabs, Tab, Tooltip, CircularProgress, Skeleton, Image } from "@heroui/react";
import { formatDate, formatTime } from '../../../utils/dateFormatters';
import { APP_CONFIG } from '@/config/app';
import { 
  assignCategoryToPost,
  assignSubcategoryToPost,
} from '@/services/api/categories';
import CategoryPopover from '@/components/categories/CategoryPopover';
import { ChevronUpIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, NoSymbolIcon, PlusIcon } from '@heroicons/react/24/outline';
import { fetchPostDetails } from '@/services/api/posts';
import { generateTranscript } from '@/services/api/transcripts';
import { getPostInsights, checkPostInsights } from '@/services/api/insights';
import MetricWithDiff from '@/components/post/MetricWithDiff';
import { useAuthStore } from '@/store/auth';
import PostSkeleton from '@/components/post/PostSkeleton';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, authState } = useAuthStore();
  
  // 1. Primero, todos los estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState(null);
  const [needsInsightsUpdate, setNeedsInsightsUpdate] = useState(false);
  const [comparisonType, setComparisonType] = useState('category');
  const [details, setDetails] = useState({
    post: null,
    currentCategory: null,
    currentSubcategory: null,
    categories: [],
    subcategories: [],
    transcript: null
  });

  // Agregar este nuevo estado para el feedback de copiado
  const [copied, setCopied] = useState(false);

  // 2. Efecto de autenticación - debe ser el primer useEffect
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  // 3. Efecto de carga de datos - solo se ejecuta si hay autenticación
  useEffect(() => {
    const loadData = async () => {
      if (!id || authState !== 'authenticated') return;

      try {
        setLoading(true);
        const postData = await fetchPostDetails(id);
        
        if (postData) {
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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, authState]);

  // 4. Efecto separado para la transcripción
  useEffect(() => {
    const generatePostTranscript = async () => {
      if (!details.post?.id || !user?.username || details.transcript || details.transcriptionError) return;

      try {
        setIsTranscribing(true);
        const transcriptResult = await generateTranscript(
          details.post.instagram_account_id, 
          details.post.id
        );
        
        setDetails(prev => ({
          ...prev,
          transcript: transcriptResult
        }));
      } catch (error) {
        console.error('Error al transcribir:', error);
        setDetails(prev => ({
          ...prev,
          transcriptionError: error.message
        }));
      } finally {
        setIsTranscribing(false);
      }
    };

    generatePostTranscript();
  }, [details.post?.id, user?.username, details.transcript, details.transcriptionError]);

  // Agregar este efecto para controlar el scroll de la transcripción
  useEffect(() => {
    // Función para resetear el scroll del popover de transcripción
    const resetTranscriptScroll = () => {
      const transcriptElement = document.getElementById('transcript-content');
      if (transcriptElement) {
        transcriptElement.scrollTop = 0;
      }
    };
    
    // Observar cambios en el DOM para detectar cuando aparece el popover
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const transcriptElement = document.getElementById('transcript-content');
          if (transcriptElement) {
            transcriptElement.scrollTop = 0;
            observer.disconnect();
          }
        }
      });
    });
    
    // Configurar el observador
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Limpiar
    return () => observer.disconnect();
  }, [details.transcript]);

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
      const { post } = await assignCategoryToPost(categoryId, details.post.id);
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
      const { post } = await assignSubcategoryToPost(subcategoryId, details.post.id);
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

  const getProfileImage = (user) => {
    if (!user) return "/images/logo.png";
    
    // Si el usuario tiene foto de perfil, la usamos
    if (user.profile_picture) return user.profile_picture;
    
    // Si no tiene foto de perfil, usamos un placeholder
    return "/images/logo.png";
  };

  if (authState === 'loading' || loading) {
    return <PostSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const { post, currentCategory, currentSubcategory, categories, subcategories, transcript } = details;
  
  const handleTranscribe = async () => {
    try {
      if (!user?.username) {
        console.log('[PostPage] No username available yet, waiting...');
        return;  // En lugar de lanzar error, simplemente retornamos
      }
      
      setIsTranscribing(true);
      const transcriptResult = await generateTranscript(post.instagram_account_id, post.id);
      
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

  // Función para formatear el tiempo de transcripción sin decimales
  const formatTranscriptTime = (timeString) => {
    if (!timeString) return '';
    
    // Primero removemos los decimales
    const withoutDecimals = timeString.split('.')[0];
    
    // Ahora dividimos en minutos y segundos
    const parts = withoutDecimals.split(':');
    if (parts.length === 2) {
      const minutes = parts[0];
      const seconds = parts[1];
      
      // Agregamos un cero inicial a los segundos si es necesario
      const paddedSeconds = seconds.length === 1 ? `0${seconds}` : seconds;
      
      // Devolvemos el tiempo formateado
      return `${minutes}:${paddedSeconds}`;
    }
    
    return withoutDecimals; // Devolver el original sin decimales si no tiene formato MM:SS
  };

  // Agregar esta función para copiar al portapapeles
  const copyTranscriptToClipboard = () => {
    if (!details.transcript) return;
    
    // Crear el texto formateado para copiar
    let textToCopy = '';
    
    if (details.transcript.segments?.length > 0) {
      textToCopy = details.transcript.segments.map(segment => 
        `${formatTranscriptTime(segment.startTime)} - ${formatTranscriptTime(segment.endTime)}: ${segment.text}`
      ).join('\n');
    } else if (details.transcript.full_text) {
      textToCopy = details.transcript.full_text;
    }
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        // Resetear el estado después de 2 segundos
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Error al copiar: ', err));
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        {/* Título y botón de volver, ahora directamente en el fondo gris como en page.js */}
        <div className="flex justify-between items-start mb-6">
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
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Columna 1 - Video */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
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
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="flex flex-col space-y-4 overflow-auto pr-1">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                  <div className="space-y-4">
                    {post?.caption && (
                      <div>
                        <p className="text-sm text-gray-600">Caption</p>
                        <div className="relative">
                          <div className="flex items-center">
                            <p className="font-medium truncate pr-8">{post.caption}</p>
                            {post.caption.length > 40 && (
                              <Popover placement="top">
                                <PopoverTrigger>
                                  <button className="absolute right-0 text-purple-600 hover:text-purple-700">
                                    <PlusIcon className="w-5 h-5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-4 bg-white shadow-lg rounded-lg">
                                  <p className="font-medium whitespace-pre-wrap">{post.caption}</p>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
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
                            disableTooltip={true}
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
                            disableTooltip={true}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Agregar el botón de transcripción a los detalles */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Transcripción</p>
                      <div className="min-h-[28px] flex items-center">
                        {details.transcript ? (
                          <Popover 
                            placement="bottom-start" 
                            showArrow
                            offset={10}
                          >
                            <PopoverTrigger>
                              <Button 
                                color="secondary" 
                                className="bg-purple-100 text-purple-700 rounded-full px-4"
                                size="sm"
                                startContent={<DocumentTextIcon className="h-4 w-4" />}
                              >
                                Ver transcripción
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0">
                              <div className="relative">
                                <Button
                                  size="sm"
                                  color="secondary"
                                  variant="flat"
                                  className="absolute right-2 top-2 px-2 py-1 h-7 z-10"
                                  onClick={copyTranscriptToClipboard}
                                >
                                  {copied ? "¡Copiado!" : "Copiar"}
                                </Button>
                                <div id="transcript-content" className="max-h-96 overflow-y-auto p-4 pt-10">
                                  {details.transcript.segments?.length > 0 ? (
                                    <div className="space-y-2">
                                      {details.transcript.segments.map((segment, index) => (
                                        <div key={index} className="text-sm text-gray-600">
                                          <span className="font-medium text-gray-500">
                                            {formatTranscriptTime(segment.startTime)} - {formatTranscriptTime(segment.endTime)}:
                                          </span>
                                          <span className="ml-2">{segment.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {details.transcript.full_text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : isTranscribing ? (
                          <Button
                            color="secondary"
                            size="sm"
                            className="bg-purple-100 text-purple-700 rounded-full px-4"
                            isDisabled
                            startContent={
                              <CircularProgress size="sm" color="secondary" className="mr-1" />
                            }
                          >
                            <TranscriptLoadingMessage />
                          </Button>
                        ) : details.transcriptionError === 'NO_AUDIO' ? (
                          <Button
                            color="secondary"
                            size="sm"
                            className="bg-purple-100 text-purple-700 rounded-full px-4"
                            isDisabled
                            startContent={<NoSymbolIcon className="h-4 w-4" />}
                          >
                            Sin audio
                          </Button>
                        ) : (
                          <Button
                            color="secondary"
                            size="sm"
                            className="bg-purple-100 text-purple-700 rounded-full px-4"
                            onClick={handleTranscribe}
                            startContent={<PlusIcon className="h-4 w-4" />}
                          >
                            Transcribir
                          </Button>
                        )}
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
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
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
                        isDisabled={!details?.post?.category_id}
                      />
                      <Tab key="global" title="Global" />
                    </Tabs>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
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
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
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
                        isDisabled={!details?.post?.category_id}
                      />
                      <Tab key="global" title="Global" />
                    </Tabs>
                  </div>

                  <div className="flex flex-col space-y-4">
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
                </div>
              </div>
            </div>

            {/* Columna 3 - Solo Insights */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Insights</h3>
                {needsInsightsUpdate && insights && (
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

              <div className="relative h-full">
                {/* Estado de Carga para los Insights */}
                {isLoadingInsights && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
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
                      <LoadingMessage />
                    </div>
                  </div>
                )}

                {/* Contenido de Insights */}
                {!isLoadingInsights && (insights ? (
                  <div className="space-y-6 transition-all duration-300 overflow-auto h-[calc(100vh-260px)] pr-1">
                    {/* Summary Section */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
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
                    </div>

                    {/* Metrics Analysis */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
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
                    </div>

                    {/* Content Analysis */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                      <h4 className="text-sm font-semibold mb-4">Análisis de Contenido</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {insights.content_analysis}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Modificar el componente LoadingMessage para recibir activeTab como prop
function LoadingMessage() {
  const messages = ["Analizando métricas...", "Generando insights...", "Organizando insights...", "Procesando contenido..."];

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
    <p className="text-secondary-600 text-xs animate-fade-in">
      {messages[messageIndex]}
    </p>
  );
}
