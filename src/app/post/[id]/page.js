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
import { ChevronUpIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, NoSymbolIcon, PlusIcon, VideoCameraIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { fetchPostDetails } from '@/services/api/posts';
import { generateTranscript } from '@/services/api/transcripts';
import { generateVideoAnalysis } from '@/services/api/videoAnalysis';
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
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState(null);
  const [needsInsightsUpdate, setNeedsInsightsUpdate] = useState(false);
  const [comparisonType, setComparisonType] = useState('category');
  const [showInsights, setShowInsights] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [videoAnalysisError, setVideoAnalysisError] = useState(null);
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

  // 5. Efecto para cargar automáticamente el análisis de video
  useEffect(() => {
    const loadVideoAnalysis = async () => {
      // Solo ejecutar si:
      // - El post existe
      // - Es un video
      // - Hay un usuario autenticado
      // - No hay un análisis ya cargado o un error previo
      if (!details.post?.id || 
          details.post.media_type !== 'VIDEO' || 
          !user?.username || 
          videoAnalysis || 
          videoAnalysisError) {
        return;
      }

      try {
        setIsAnalyzingVideo(true);
        const result = await generateVideoAnalysis(details.post.id, user.username);
        setVideoAnalysis(result);
        console.log('Análisis de video cargado automáticamente');
      } catch (error) {
        console.error('Error al cargar análisis de video:', error);
        setVideoAnalysisError(error.message);
        
        // Manejar error específico de video demasiado grande
        if (error.message && error.message.includes('VIDEO_TOO_LARGE')) {
          setVideoAnalysis({
            error: 'VIDEO_TOO_LARGE',
            description: 'El video es demasiado grande para ser procesado por Gemini. El límite es de aproximadamente 30MB.',
            number_of_shots: null,
            text_types: [],
            has_call_to_action: false,
            total_duration: null,
            audio_types: [],
            seconds_without_audio: null,
            key_elements: []
          });
        }
      } finally {
        setIsAnalyzingVideo(false);
      }
    };

    loadVideoAnalysis();
  }, [details.post?.id, details.post?.media_type, user?.username, videoAnalysis, videoAnalysisError]);

  // 6. Efecto para controlar el scroll de la transcripción
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

  // Función para manejar el análisis de video
  const handleAnalyzeVideo = async () => {
    try {
      if (!user?.username) {
        console.log('[PostPage] No username available yet, waiting...');
        return;
      }
      
      setIsAnalyzingVideo(true);
      try {
        const result = await generateVideoAnalysis(post.id, user.username);
        setVideoAnalysis(result);
        console.log('Análisis de video completado', result);
      } catch (error) {
        console.error('Error al analizar video:', error);
        
        // Mostrar mensaje específico para videos demasiado grandes
        if (error.message && error.message.includes('VIDEO_TOO_LARGE')) {
          setVideoAnalysis({
            error: 'VIDEO_TOO_LARGE',
            description: 'El video es demasiado grande para ser procesado por Gemini. El límite es de aproximadamente 30MB.',
            number_of_shots: null,
            text_types: [],
            has_call_to_action: false,
            total_duration: null,
            audio_types: [],
            seconds_without_audio: null,
            key_elements: []
          });
        }
      }
    } finally {
      setIsAnalyzingVideo(false);
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
          <div className="flex items-center gap-2">
            <Button color="secondary" onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </div>

        {/* Contenedor principal - 3 columnas, centrado */}
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Columna 1 - Video */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center h-full overflow-hidden">
              {post?.media_type === 'VIDEO' ? (
                post?.media_url ? (
                  <video
                    src={post.media_url}
                    controls
                    className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                  />
                ) : post?.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt="Post thumbnail"
                    className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                  />
                ) : null
              ) : (post?.media_type === 'IMAGE' || post?.media_type === 'CAROUSEL_ALBUM') ? (
                post?.media_url ? (
                  <img
                    src={post.media_url}
                    alt="Post content"
                    className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                  />
                ) : post?.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt="Post thumbnail"
                    className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                  />
                ) : null
              ) : null}
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

            {/* Columna 3 - Análisis de Video (reemplaza Insights) */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Análisis de Video</h3>
              </div>
              
              <div className="relative h-full overflow-auto">
                {isAnalyzingVideo ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <CircularProgress className="mb-4" />
                    <p className="text-gray-500">Analizando video...</p>
                  </div>
                ) : videoAnalysis ? (
                  <div className="space-y-4">
                    {videoAnalysis.error === 'VIDEO_TOO_LARGE' ? (
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="text-sm font-semibold mb-2 text-red-700">Error: Video demasiado grande</h4>
                        <p className="text-sm text-red-600">{videoAnalysis.description}</p>
                        <p className="text-xs text-red-500 mt-2">
                          Intenta con un video más pequeño o de menor duración para poder analizarlo.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                          <h4 className="text-sm font-semibold mb-2">Descripción</h4>
                          <p className="text-sm text-gray-700">{videoAnalysis.description}</p>
                        </div>
                        
                        {videoAnalysis.number_of_shots && (
                          <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                            <h4 className="text-sm font-semibold mb-2">Número de tomas</h4>
                            <p className="text-sm text-gray-700">{videoAnalysis.number_of_shots}</p>
                          </div>
                        )}
                        
                        {videoAnalysis.audio_types && videoAnalysis.audio_types.length > 0 && (
                          <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                            <h4 className="text-sm font-semibold mb-2">Tipos de audio</h4>
                            <div className="flex flex-wrap gap-2">
                              {videoAnalysis.audio_types.map((type, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {videoAnalysis.text_types && videoAnalysis.text_types.length > 0 && (
                          <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                            <h4 className="text-sm font-semibold mb-2">Tipos de texto</h4>
                            <div className="flex flex-wrap gap-2">
                              {videoAnalysis.text_types.map((type, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {videoAnalysis.key_elements && videoAnalysis.key_elements.length > 0 && (
                          <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                            <h4 className="text-sm font-semibold mb-2">Elementos clave</h4>
                            <div className="flex flex-wrap gap-2">
                              {videoAnalysis.key_elements.map((element, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                  {element}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    {post?.media_type === 'VIDEO' ? (
                      <>
                        <CircularProgress className="mb-4" />
                        <p>Cargando análisis de video...</p>
                      </>
                    ) : (
                      <>
                        <NoSymbolIcon className="w-12 h-12 mb-4 text-gray-300" />
                        <p>El análisis de video solo está disponible para posts de tipo VIDEO</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para mostrar/ocultar Insights */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowInsights(!showInsights)}
          color="primary"
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <SparklesIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Panel de Insights (oculto por defecto) */}
      {showInsights && (
        <div className="fixed bottom-0 right-0 left-0 bg-white shadow-lg rounded-t-xl z-40 transition-all duration-300 max-h-[80vh] overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insights</h3>
              <Button
                onClick={() => setShowInsights(false)}
                color="secondary"
                size="sm"
                className="rounded-full"
              >
                <ChevronUpIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative">
              {/* Estado de Carga para los Insights */}
              {isLoadingInsights && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                  <CircularProgress className="mb-4" />
                  <LoadingMessage />
                </div>
              )}

              {/* Contenido de Insights */}
              {!isLoadingInsights && (insights ? (
                <div className="space-y-6 transition-all duration-300">
                  {/* Summary Section */}
                  <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                    <div className="flex items-center gap-4">
                      {insights.summary && insights.summary.score ? (
                        <div className={`text-2xl ${
                          insights.summary.score >= 80 ? 'text-success' :
                          insights.summary.score >= 60 ? 'text-warning' :
                          'text-danger'
                        }`}>
                          {insights.summary.score}
                        </div>
                      ) : null}
                      <div className="flex-1">
                        {insights.summary && insights.summary.status ? (
                          <h4 className="text-sm font-semibold">{insights.summary.status}</h4>
                        ) : null}
                        {insights.summary && insights.summary.quick_take ? (
                          <p className="text-sm text-gray-700">{insights.summary.quick_take}</p>
                        ) : (
                          <p className="text-sm text-gray-700">{typeof insights.summary === 'string' ? insights.summary : 'Resumen no disponible'}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 mb-1">
                          {insightsGeneratedAt ? `Generado ${formatDate(insightsGeneratedAt)}` : 'Recién generado'}
                        </div>
                        <Button
                          onClick={handleGenerateInsights}
                          size="sm"
                          color={needsInsightsUpdate ? "primary" : "secondary"}
                          disabled={isLoadingInsights}
                          className="text-xs"
                        >
                          {needsInsightsUpdate ? 'Actualizar' : 'Regenerar'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Analysis */}
                  <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                    <h4 className="text-sm font-semibold mb-4">Métricas Destacadas</h4>
                    <div className="space-y-3">
                      {insights.metrics_analysis && insights.metrics_analysis.highlights ? (
                        insights.metrics_analysis.highlights.map((highlight, index) => (
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
                        ))
                      ) : Array.isArray(insights.metrics_analysis) ? (
                        insights.metrics_analysis.map((metric, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                            <p className="text-sm text-gray-700 flex-1">{metric}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No hay métricas destacadas disponibles</p>
                      )}
                    </div>
                  </div>

                  {/* Content Analysis */}
                  <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                    <h4 className="text-sm font-semibold mb-4">Análisis de Contenido</h4>
                    {Array.isArray(insights.content_analysis) ? (
                      <div className="space-y-3">
                        {insights.content_analysis.map((content, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <p className="text-sm text-gray-700 flex-1">{content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {insights.content_analysis}
                      </p>
                    )}
                  </div>

                  {/* Recommendations - solo mostrar si existen */}
                  {insights.recommendations && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                      <h4 className="text-sm font-semibold mb-4">Recomendaciones</h4>
                      {Array.isArray(insights.recommendations) ? (
                        <div className="space-y-3">
                          {insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                              <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {insights.recommendations}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Comparison - solo mostrar si existen las propiedades necesarias */}
                  {(insights.category_comparison || insights.all_posts_comparison) && (
                    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-xs">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold">Comparación</h4>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            color={comparisonType === 'category' ? 'primary' : 'secondary'}
                            onClick={() => setComparisonType('category')}
                            disabled={!insights.category_comparison}
                          >
                            Categoría
                          </Button>
                          <Button
                            size="xs"
                            color={comparisonType === 'all' ? 'primary' : 'secondary'}
                            onClick={() => setComparisonType('all')}
                            disabled={!insights.all_posts_comparison}
                          >
                            Todos
                          </Button>
                        </div>
                      </div>
                      
                      {comparisonType === 'category' && insights.category_comparison ? (
                        <div className="space-y-3">
                          {Array.isArray(insights.category_comparison) ? (
                            insights.category_comparison.map((comparison, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                                <p className="text-sm text-gray-700 flex-1">{comparison}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {insights.category_comparison}
                            </p>
                          )}
                        </div>
                      ) : comparisonType === 'all' && insights.all_posts_comparison ? (
                        <div className="space-y-3">
                          {Array.isArray(insights.all_posts_comparison) ? (
                            insights.all_posts_comparison.map((comparison, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                                <p className="text-sm text-gray-700 flex-1">{comparison}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {insights.all_posts_comparison}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 text-secondary mb-4">
                    <MagnifyingGlassIcon className="w-full h-full" />
                  </div>
                  <p className="text-gray-500 mb-4">No hay insights disponibles para este post</p>
                  <Button
                    onClick={handleGenerateInsights}
                    color="primary"
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
      )}
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
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <p className="text-gray-500 text-center">{messages[messageIndex]}</p>;
}

// Primero agregamos el componente (junto a LoadingMessage existente)
function TranscriptLoadingMessage() {
  const messages = [
    "Transcribiendo audio...",
    "Procesando palabras...",
    "Analizando contenido...",
    "Generando transcripción...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <p className="text-gray-500 text-center">{messages[messageIndex]}</p>;
}
