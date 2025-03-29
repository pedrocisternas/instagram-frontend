'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider, Popover, PopoverTrigger, PopoverContent, Tabs, Tab, Tooltip, CircularProgress, Skeleton, Image, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { formatDate, formatTime, formatDuration, formatTranscriptTime } from '../../../utils/dateFormatters';
import { translateAudioType, translateTextType, AUDIO_TYPE_TRANSLATIONS, TEXT_TYPE_TRANSLATIONS } from '../../../utils/videoAnalysisTranslations';
import { APP_CONFIG } from '@/config/app';
import { 
  assignCategoryToPost,
  assignSubcategoryToPost,
} from '@/services/api/categories';
import { generateVideoAnalysis, updateVideoAudioTypes, updateVideoTextTypes, updateVideoShots } from '@/services/api/videoAnalysis';
import CategoryPopover from '@/components/categories/CategoryPopover';
import { ChevronUpIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, NoSymbolIcon, PlusIcon, VideoCameraIcon, SparklesIcon } from '@heroicons/react/24/outline';
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
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isUpdatingAudioTypes, setIsUpdatingAudioTypes] = useState(false);
  const [isUpdatingTextTypes, setIsUpdatingTextTypes] = useState(false);
  const [isEditingShots, setIsEditingShots] = useState(false);
  const [isUpdatingShots, setIsUpdatingShots] = useState(false);
  const [shotCount, setShotCount] = useState(0);
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

  // Función para obtener los tipos de audio disponibles (que no estén ya seleccionados)
  const getAvailableAudioTypes = () => {
    if (!videoAnalysis?.audio_types) return Object.keys(AUDIO_TYPE_TRANSLATIONS);
    
    return Object.keys(AUDIO_TYPE_TRANSLATIONS).filter(
      type => !videoAnalysis.audio_types.includes(type)
    );
  };

  // Función para obtener los tipos de texto disponibles (que no estén ya seleccionados)
  const getAvailableTextTypes = () => {
    if (!videoAnalysis?.text_types) return Object.keys(TEXT_TYPE_TRANSLATIONS);
    
    return Object.keys(TEXT_TYPE_TRANSLATIONS).filter(
      type => !videoAnalysis.text_types.includes(type)
    );
  };

  // Manejar la adición de un nuevo tipo de audio
  const handleAddAudioType = async (type) => {
    if (!videoAnalysis || !user?.username) return;

    // Creamos una copia de los tipos actuales y añadimos el nuevo
    const updatedAudioTypes = [...(videoAnalysis.audio_types || []), type];

    // Actualización optimista
    setIsUpdatingAudioTypes(true);
    const previousAudioTypes = videoAnalysis.audio_types;
    
    // Actualizamos el estado local inmediatamente
    setVideoAnalysis({
      ...videoAnalysis,
      audio_types: updatedAudioTypes
    });

    try {
      // Enviamos la actualización al backend
      await updateVideoAudioTypes(details.post.id, user.username, updatedAudioTypes);
      // En caso de éxito, no necesitamos hacer nada más
    } catch (error) {
      console.error('Error al actualizar tipos de audio:', error);
      // Revertimos la actualización en caso de error
      setVideoAnalysis({
        ...videoAnalysis,
        audio_types: previousAudioTypes
      });
      
      // Aquí podríamos mostrar un mensaje de error al usuario
    } finally {
      setIsUpdatingAudioTypes(false);
    }
  };

  // Manejar la adición de un nuevo tipo de texto
  const handleAddTextType = async (type) => {
    if (!videoAnalysis || !user?.username) return;

    // Creamos una copia de los tipos actuales y añadimos el nuevo
    const updatedTextTypes = [...(videoAnalysis.text_types || []), type];

    // Actualización optimista
    setIsUpdatingTextTypes(true);
    const previousTextTypes = videoAnalysis.text_types;
    
    // Actualizamos el estado local inmediatamente
    setVideoAnalysis({
      ...videoAnalysis,
      text_types: updatedTextTypes
    });

    try {
      // Enviamos la actualización al backend
      await updateVideoTextTypes(details.post.id, user.username, updatedTextTypes);
      // En caso de éxito, no necesitamos hacer nada más
    } catch (error) {
      console.error('Error al actualizar tipos de texto:', error);
      // Revertimos la actualización en caso de error
      setVideoAnalysis({
        ...videoAnalysis,
        text_types: previousTextTypes
      });
      
      // Aquí podríamos mostrar un mensaje de error al usuario
    } finally {
      setIsUpdatingTextTypes(false);
    }
  };

  // Manejar la eliminación de un tipo de audio
  const handleRemoveAudioType = async (typeToRemove) => {
    if (!videoAnalysis || !user?.username) return;

    // Creamos una copia de los tipos actuales y eliminamos el tipo
    const updatedAudioTypes = videoAnalysis.audio_types.filter(type => type !== typeToRemove);

    // Actualización optimista
    setIsUpdatingAudioTypes(true);
    const previousAudioTypes = videoAnalysis.audio_types;
    
    // Actualizamos el estado local inmediatamente
    setVideoAnalysis({
      ...videoAnalysis,
      audio_types: updatedAudioTypes
    });

    try {
      // Enviamos la actualización al backend
      await updateVideoAudioTypes(details.post.id, user.username, updatedAudioTypes);
      // En caso de éxito, no necesitamos hacer nada más
    } catch (error) {
      console.error('Error al eliminar tipo de audio:', error);
      // Revertimos la actualización en caso de error
      setVideoAnalysis({
        ...videoAnalysis,
        audio_types: previousAudioTypes
      });
      
      // Aquí podríamos mostrar un mensaje de error al usuario
    } finally {
      setIsUpdatingAudioTypes(false);
    }
  };

  // Manejar la eliminación de un tipo de texto
  const handleRemoveTextType = async (typeToRemove) => {
    if (!videoAnalysis || !user?.username) return;

    // Creamos una copia de los tipos actuales y eliminamos el tipo
    const updatedTextTypes = videoAnalysis.text_types.filter(type => type !== typeToRemove);

    // Actualización optimista
    setIsUpdatingTextTypes(true);
    const previousTextTypes = videoAnalysis.text_types;
    
    // Actualizamos el estado local inmediatamente
    setVideoAnalysis({
      ...videoAnalysis,
      text_types: updatedTextTypes
    });

    try {
      // Enviamos la actualización al backend
      await updateVideoTextTypes(details.post.id, user.username, updatedTextTypes);
      // En caso de éxito, no necesitamos hacer nada más
    } catch (error) {
      console.error('Error al eliminar tipo de texto:', error);
      // Revertimos la actualización en caso de error
      setVideoAnalysis({
        ...videoAnalysis,
        text_types: previousTextTypes
      });
      
      // Aquí podríamos mostrar un mensaje de error al usuario
    } finally {
      setIsUpdatingTextTypes(false);
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

  // Manejar la actualización del número de tomas
  const handleUpdateShots = async () => {
    if (!videoAnalysis || !user?.username) return;

    // Validaciones básicas
    const numberOfShots = parseInt(shotCount);
    if (isNaN(numberOfShots) || numberOfShots < 1) {
      // Si el número no es válido, volvemos a establecer el valor original
      setShotCount(videoAnalysis.number_of_shots);
      setIsEditingShots(false);
      return;
    }

    // No hacemos nada si el número no cambió
    if (numberOfShots === videoAnalysis.number_of_shots) {
      setIsEditingShots(false);
      return;
    }

    // Guardamos el valor original para revertir en caso de error
    const originalShots = videoAnalysis.number_of_shots;
    
    // Actualización optimista
    setIsUpdatingShots(true);
    
    // Actualizamos el estado local inmediatamente
    setVideoAnalysis({
      ...videoAnalysis,
      number_of_shots: numberOfShots
    });

    try {
      // Enviamos la actualización al backend
      await updateVideoShots(details.post.id, user.username, numberOfShots);
      // En caso de éxito, salimos del modo edición
      setIsEditingShots(false);
    } catch (error) {
      console.error('Error al actualizar número de tomas:', error);
      // Revertimos la actualización en caso de error
      setVideoAnalysis({
        ...videoAnalysis,
        number_of_shots: originalShots
      });
      setShotCount(originalShots);
    } finally {
      setIsUpdatingShots(false);
    }
  };

  const startEditingShots = () => {
    setShotCount(videoAnalysis.number_of_shots);
    setIsEditingShots(true);
  };

  const cancelEditingShots = () => {
    setShotCount(videoAnalysis.number_of_shots);
    setIsEditingShots(false);
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
          <div className="flex items-center gap-4">
            {post?.metrics_updated_at && (
              <span className="text-xs text-gray-500">
                Actualizado: {formatDate(post.metrics_updated_at)} {formatTime(post.metrics_updated_at)}
              </span>
            )}
            <Button color="secondary" onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </div>

        {/* Contenedor principal - 3 columnas, centrado */}
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Columna 1 - Video */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="flex-grow flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-full min-h-[calc(100vh-280px)] flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="aspect-[9/16] w-full max-w-[320px] bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ) : post?.media_type === 'VIDEO' ? (
                  post?.media_url ? (
                    <video
                      src={post.media_url}
                      controls
                      className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                      preload="metadata"
                      poster={post.thumbnail_url || ''}
                    />
                  ) : post?.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt="Post thumbnail"
                      className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[calc(100vh-280px)] flex items-center justify-center bg-gray-100 rounded-lg">
                      <p className="text-gray-500">No hay vista previa disponible</p>
                    </div>
                  )
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
                  ) : (
                    <div className="w-full h-full min-h-[calc(100vh-280px)] flex items-center justify-center bg-gray-100 rounded-lg">
                      <p className="text-gray-500">No hay vista previa disponible</p>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full min-h-[calc(100vh-280px)] flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No hay contenido disponible</p>
                  </div>
                )}
              </div>
              {post?.published_at && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Fecha de publicación:</p>
                    <p className="ml-2 text-sm font-medium">
                      {formatDate(post.published_at)} {formatTime(post.published_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna 2 - Metadata del contenido */}
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

                    {/* Transcripción y Descripción en grid de 2 columnas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Transcripción</p>
                        <div className="min-h-[28px] overflow-hidden">
                          {details.transcript ? (
                            <Popover 
                              placement="bottom-start" 
                              showArrow
                              offset={10}
                            >
                              <PopoverTrigger>
                                <Button 
                                  color="secondary" 
                                  className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                                  size="sm"
                                  startContent={<DocumentTextIcon className="h-4 w-4 flex-shrink-0" />}
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
                              className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                              isDisabled
                              startContent={
                                <CircularProgress size="sm" color="secondary" className="mr-1 flex-shrink-0" />
                              }
                            >
                              <TranscriptLoadingMessage />
                            </Button>
                          ) : details.transcriptionError === 'NO_AUDIO' ? (
                            <Button
                              color="secondary"
                              size="sm"
                              className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                              isDisabled
                              startContent={<NoSymbolIcon className="h-4 w-4 flex-shrink-0" />}
                            >
                              Sin audio
                            </Button>
                          ) : (
                            <Button
                              color="secondary"
                              size="sm"
                              className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                              onClick={handleTranscribe}
                              startContent={<PlusIcon className="h-4 w-4 flex-shrink-0" />}
                            >
                              Transcribir
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Descripción</p>
                        <div className="min-h-[28px] overflow-hidden">
                          {videoAnalysis?.description ? (
                            <Popover 
                              placement="bottom-start" 
                              showArrow
                              offset={10}
                            >
                              <PopoverTrigger>
                                <Button 
                                  color="secondary" 
                                  className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                                  size="sm"
                                  startContent={<DocumentTextIcon className="h-4 w-4 flex-shrink-0" />}
                                >
                                  Ver descripción
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-0">
                                <div className="relative">
                                  <div className="max-h-96 overflow-y-auto p-4">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{videoAnalysis.description}</p>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : isAnalyzingVideo ? (
                            <Button
                              color="secondary"
                              size="sm"
                              className="bg-purple-100 text-purple-700 rounded-full px-4 w-full max-w-[160px] truncate"
                              isDisabled
                              startContent={<CircularProgress size="sm" color="secondary" className="mr-1 flex-shrink-0" />}
                            >
                              Analizando...
                            </Button>
                          ) : (
                            <p className="text-gray-500">No disponible</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Duración */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Duración</p>
                      <div className="min-h-[28px]">
                        {post?.media_type === 'VIDEO' ? (
                          isAnalyzingVideo ? (
                            <div className="flex items-center gap-2">
                              <CircularProgress size="sm" color="secondary" />
                              <span className="text-sm">Calculando...</span>
                            </div>
                          ) : videoAnalysis?.total_duration ? (
                            <p className="font-medium flex items-center gap-2">
                              <VideoCameraIcon className="h-4 w-4 text-purple-700" />
                              <span>{formatDuration(videoAnalysis.total_duration)}</span>
                            </p>
                          ) : (
                            <p className="text-gray-500">Sin duración</p>
                          )
                        ) : (
                          <p className="text-gray-500">No aplicable</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Metadata del análisis de video */}
                    {(videoAnalysis && !videoAnalysis.error) || isAnalyzingVideo ? (
                      <div className="space-y-4">
                        {/* Número de tomas */}
                        {isAnalyzingVideo ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Número de tomas</p>
                            <div className="flex items-center gap-2">
                              <CircularProgress size="sm" color="secondary" />
                              <span className="text-sm">Calculando...</span>
                            </div>
                          </div>
                        ) : videoAnalysis?.number_of_shots ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Número de tomas</p>
                            <div className="h-8 flex items-center">
                              {isEditingShots ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={shotCount}
                                    onChange={(e) => setShotCount(e.target.value)}
                                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                                    disabled={isUpdatingShots}
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      color="primary"
                                      variant="flat"
                                      isIconOnly
                                      onClick={handleUpdateShots}
                                      isLoading={isUpdatingShots}
                                      className="min-w-8 h-8"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="danger"
                                      variant="flat"
                                      isIconOnly
                                      onClick={cancelEditingShots}
                                      disabled={isUpdatingShots}
                                      className="min-w-8 h-8"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="font-medium flex items-center group">
                                  <span>{videoAnalysis.number_of_shots}</span>
                                  <button 
                                    onClick={startEditingShots}
                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-purple-500 hover:text-purple-700"
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null}
                        
                        {/* Tipos de audio */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Tipos de audio</p>
                          {!videoAnalysis ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Skeleton className="h-6 w-24 rounded-full" />
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                          ) : videoAnalysisError ? (
                            <p className="mt-1 text-sm text-gray-600">Error al cargar tipos de audio</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 mt-1 items-center">
                              {videoAnalysis.audio_types && videoAnalysis.audio_types.length > 0 && (
                                videoAnalysis.audio_types.map((type, index) => (
                                  <span
                                    key={index}
                                    className="group px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center"
                                  >
                                    {translateAudioType(type)}
                                    <button 
                                      onClick={() => handleRemoveAudioType(type)}
                                      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-purple-500 hover:text-purple-700"
                                      title="Eliminar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </span>
                                ))
                              )}
                              
                              {/* Dropdown para agregar nuevos tipos de audio - ahora siempre visible */}
                              {getAvailableAudioTypes().length > 0 && (
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button 
                                      isIconOnly 
                                      size="sm" 
                                      variant="flat" 
                                      className="rounded-full bg-purple-50 text-purple-700"
                                      isLoading={isUpdatingAudioTypes}
                                    >
                                      {!isUpdatingAudioTypes && <PlusIcon className="h-4 w-4" />}
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu aria-label="Agregar tipo de audio">
                                    {getAvailableAudioTypes().map((type) => (
                                      <DropdownItem 
                                        key={type} 
                                        onClick={() => handleAddAudioType(type)}
                                      >
                                        {translateAudioType(type)}
                                      </DropdownItem>
                                    ))}
                                  </DropdownMenu>
                                </Dropdown>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Tipos de texto */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Tipos de texto</p>
                          {!videoAnalysis ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Skeleton className="h-6 w-24 rounded-full" />
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                          ) : videoAnalysisError ? (
                            <p className="mt-1 text-sm text-gray-600">Error al cargar tipos de texto</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 mt-1 items-center">
                              {videoAnalysis.text_types && videoAnalysis.text_types.length > 0 && (
                                videoAnalysis.text_types.map((type, index) => (
                                  <span
                                    key={index}
                                    className="group px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center"
                                  >
                                    {translateTextType(type)}
                                    <button 
                                      onClick={() => handleRemoveTextType(type)}
                                      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-purple-500 hover:text-purple-700"
                                      title="Eliminar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </span>
                                ))
                              )}
                              
                              {/* Dropdown para agregar nuevos tipos de texto - ahora siempre visible */}
                              {getAvailableTextTypes().length > 0 && (
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button 
                                      isIconOnly 
                                      size="sm" 
                                      variant="flat" 
                                      className="rounded-full bg-purple-50 text-purple-700"
                                      isLoading={isUpdatingTextTypes}
                                    >
                                      {!isUpdatingTextTypes && <PlusIcon className="h-4 w-4" />}
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu aria-label="Agregar tipo de texto">
                                    {getAvailableTextTypes().map((type) => (
                                      <DropdownItem 
                                        key={type} 
                                        onClick={() => handleAddTextType(type)}
                                      >
                                        {translateTextType(type)}
                                      </DropdownItem>
                                    ))}
                                  </DropdownMenu>
                                </Dropdown>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Elementos clave */}
                        {/* {isAnalyzingVideo ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Elementos clave</p>
                            <div className="flex items-center gap-2">
                              <CircularProgress size="sm" color="secondary" />
                              <span className="text-sm">Identificando elementos...</span>
                            </div>
                          </div>
                        ) : videoAnalysis?.key_elements && videoAnalysis.key_elements.length > 0 ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Elementos clave</p>
                            <div className="flex flex-wrap gap-2">
                              {videoAnalysis.key_elements.map((element, index) => (
                                <span key={index} className="px-3 py-1.5 bg-gray-100 rounded-md text-sm font-medium text-gray-700">
                                  {element}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null} */}
                      </div>
                    ) : null}
                    
                    {videoAnalysis && videoAnalysis.error === 'VIDEO_TOO_LARGE' && (
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="text-sm font-semibold mb-2 text-red-700">Error: Video demasiado grande</h4>
                        <p className="text-sm text-red-600">{videoAnalysis.description}</p>
                        <p className="text-xs text-red-500 mt-2">
                          Intenta con un video más pequeño o de menor duración para poder analizarlo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 3 - Métricas */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="flex flex-col overflow-auto pr-1">
                <h3 className="text-lg font-semibold mb-4">Métricas</h3>
                
                {/* Container principal para las métricas */}
                <div className="flex flex-col space-y-6">
                  {/* Bloque de Engagement */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-base font-semibold text-gray-800">Engagement</h4>
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
                    
                    <div className="grid gap-3">
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

                  {/* Bloque de Rendimiento */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-base font-semibold text-gray-800">Rendimiento</h4>
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

                    <div className="grid gap-3">
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
    "Transcribiendo...",
    "Procesando...",
    "Analizando...",
    "Generando..."
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <p className="text-gray-500 text-center truncate">{messages[messageIndex]}</p>;
}
