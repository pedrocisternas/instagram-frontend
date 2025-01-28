'use client'
import { useState, useEffect, useMemo } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Skeleton,
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input
} from "@heroui/react";
import { formatDate, formatTime } from '../utils/dateFormatters';
import { useRouter } from 'next/navigation';
import StatsSummaryPanel from '@/components/posts/StatsSummaryPanel';
import { fetchPosts, syncPosts } from '@/services/api/posts';
import { 
  fetchCategories, 
  createCategory, 
  assignCategoryToPost,
  fetchSubcategories,
  createSubcategory,
  assignSubcategoryToPost
} from '@/services/api/categories';
import { MEDIA_TYPES, getMediaTypeStyle } from '@/utils/mediaTypes';
import MediaTypeFilter from '@/components/filters/MediaTypeFilter';
import { getCategoryStyle } from '@/utils/categoryStyles';
import CategoryFilter from '@/components/filters/CategoryFilter';
import PostFilters from '@/components/filters/PostFilters';
import { APP_CONFIG } from '@/config/app';
import { useSyncStore } from '@/store/sync';

// Componente Principal
export default function Home() {
  const router = useRouter();
  // Estados
  const [allPosts, setAllPosts] = useState([]); // Todos los posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return parseInt(params.get('page')) || 1;
    }
    return 1;
  });
  const [sortField, setSortField] = useState('published_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedTypes, setSelectedTypes] = useState(new Set([]));
  const [selectedCategories, setSelectedCategories] = useState(new Set([]));
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState(new Set([]));

  // Obtenemos del store
  const { isSyncing, syncMetrics, setLastUpdate, lastUpdate } = useSyncStore();

  // Funciones
  const fetchPostsData = async () => {
    try {
      const data = await fetchPosts(APP_CONFIG.USERNAME);
      setAllPosts(data.posts);
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate); // Usamos el setter del store
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncAllPages = async () => {
    try {
      await syncMetrics(); // Usamos la función del store
      await fetchPostsData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Modificar la función de filtrado para incluir categorías y subcategorías
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const typeMatch = selectedTypes.size === 0 || 
        selectedTypes.has(post.media_type === 'REEL' ? 'VIDEO' : post.media_type);
      
      const categoryMatch = selectedCategories.size === 0 || 
        (post.category_id && selectedCategories.has(post.category_id));
      
      const subcategoryMatch = selectedSubcategories.size === 0 ||
        (post.subcategory_id && selectedSubcategories.has(post.subcategory_id));
      
      return typeMatch && categoryMatch && subcategoryMatch;
    });
  }, [allPosts, selectedTypes, selectedCategories, selectedSubcategories]);

  // Usar filteredPosts para la paginación
  const sortedAndPaginatedPosts = useMemo(() => {
    // Ordenar los posts filtrados
    const sorted = [...filteredPosts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortField === 'published_at') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortDirection === 'desc' ? 
          bDate.getTime() - aDate.getTime() : 
          aDate.getTime() - bDate.getTime();
      }

      const aNum = aValue ?? 0;
      const bNum = bValue ?? 0;
      return sortDirection === 'desc' ? bNum - aNum : aNum - bNum;
    });

    // Paginar los resultados filtrados y ordenados
    const start = (page - 1) * APP_CONFIG.POSTS_PER_PAGE;
    const end = start + APP_CONFIG.POSTS_PER_PAGE;
    return sorted.slice(start, end);
  }, [filteredPosts, page, sortField, sortDirection]);

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Función para cargar categorías
  const fetchCategoriesData = async () => {
    try {
      const categories = await fetchCategories(APP_CONFIG.USERNAME);
      console.log('Categorías recibidas:', categories); // Mantenemos el debug log
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Mantenemos el comportamiento existente
    } finally {
      setLoadingCategories(false);
    }
  };

  // Función para crear nueva categoría
  const handleCreateCategory = async () => {
    try {
      const { category } = await createCategory(APP_CONFIG.USERNAME, newCategoryName);
      setNewCategoryName('');
      fetchCategoriesData(); // Recargamos las categorías
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  // Función para asignar categoría
  const handleAssignCategory = async (postId, categoryId) => {
    const previousPosts = [...allPosts];
    
    // Actualización optimista en el frontend
    setAllPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              category_id: categoryId,
              subcategory_id: null // Limpiamos la subcategoría cuando cambia la categoría
            }
          : post
      )
    );

    try {
      const { post } = await assignCategoryToPost(APP_CONFIG.USERNAME, categoryId, postId);
      document.body.click(); // Cerramos el popover
    } catch (err) {
      console.error('Error assigning category:', err);
      setAllPosts(previousPosts); // Revertimos en caso de error
    }
  };

  // Actualizar la URL cuando cambia la página
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Effects
  useEffect(() => {
    fetchPostsData();
    fetchCategoriesData();
  }, []); // Solo se ejecuta una vez al montar

  const handleCreateSubcategory = async (categoryId) => {
    try {
      const { subcategory } = await createSubcategory(APP_CONFIG.USERNAME, categoryId, newSubcategoryName);
      setSubcategories(prev => [...prev, subcategory]);
      setNewSubcategoryName('');
    } catch (error) {
      console.error('Error creating subcategory:', error);
    }
  };

  const handleAssignSubcategory = async (postId, subcategoryId) => {
    const previousPosts = [...allPosts];
    
    // Actualización optimista en el frontend
    setAllPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? { ...post, subcategory_id: subcategoryId }
          : post
      )
    );

    try {
      const { post } = await assignSubcategoryToPost(APP_CONFIG.USERNAME, subcategoryId, postId);
      document.body.click(); // Cerramos el popover
    } catch (error) {
      console.error('Error assigning subcategory:', error);
      setAllPosts(previousPosts); // Revertimos en caso de error
    }
  };

  // Modificar el useEffect para cargar subcategorías
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const promises = categories.map(category => 
          fetchSubcategories(APP_CONFIG.USERNAME, category.id)
        );
        
        const results = await Promise.all(promises);
        const allSubcategories = results.flat();
        setSubcategories(allSubcategories);
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    };

    if (categories.length > 0) {
      loadSubcategories();
    }
  }, [categories]);

  // Limpiar subcategorías cuando cambian las categorías seleccionadas
  useEffect(() => {
    setSelectedSubcategories(new Set([]));
  }, [selectedCategories]);

  // Render
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="p-8 bg-gray-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button
            color="primary"
            isLoading={isSyncing}
            onPress={syncAllPages}
          >
            {isSyncing ? 'Sincronizando...' : 'Actualizar Métricas'}
          </Button>
          {lastUpdate && (
            <p className="text-sm text-gray-600 mt-1">
              Última actualización: {formatDate(lastUpdate)} {formatTime(lastUpdate)}
            </p>
          )}
        </div>
        
        <PostFilters 
          selectedTypes={selectedTypes}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          categories={categories}
          subcategories={subcategories}
          sortField={sortField}
          sortDirection={sortDirection}
          onTypeChange={setSelectedTypes}
          onCategoryChange={setSelectedCategories}
          onSubcategoryChange={setSelectedSubcategories}
          onSortReset={() => {
            setSortField('published_at');
            setSortDirection('desc');
          }}
        />
      </div>

      {/* Add the stats panel here, using filteredPosts */}
      <StatsSummaryPanel posts={filteredPosts} />

      <Table removeWrapper aria-label="Instagram posts table">
        <TableHeader>
          <TableColumn width={300}>Caption</TableColumn>
          <TableColumn width={100}>Tipo</TableColumn>
          <TableColumn width={200}>Categoría</TableColumn>
          <TableColumn width={200}>Subcategoría</TableColumn>
          {[
            { field: 'published_at', label: 'Fecha', width: 100 },
            { field: 'published_at', label: 'Hora', width: 80 },
            { field: 'views', label: 'Views', width: 100 },
            { field: 'likes', label: 'Likes', width: 100 },
            { field: 'saves', label: 'Saves', width: 100 },
            { field: 'shares', label: 'Shares', width: 100 },
            { field: 'comments', label: 'Comments', width: 100 }
          ].map(({ field, label, width }) => (
            <TableColumn 
              key={`${field}-${label}`}
              width={width} 
              align={field === 'published_at' ? 'start' : 'end'}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort(field)}
            >
              <div className={`flex items-center ${field === 'published_at' ? 'justify-start' : 'justify-end'} gap-1`}>
                {label}
                {sortField === field && (
                  <span className="text-xs">
                    {sortDirection === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {isSyncing ? (
            Array(APP_CONFIG.POSTS_PER_PAGE).fill(null).map((_, index) => (
              <TableRow key={index}>
                {Array(11).fill(null).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            sortedAndPaginatedPosts.map(post => (
              <TableRow 
                key={post.id} 
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => router.push(`/post/${post.instagram_post_id}`)}
              >
                <TableCell className="text-gray-900">{post.caption?.slice(0, 50) || 'No caption'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getMediaTypeStyle(post.media_type)
                  }`}>
                    {MEDIA_TYPES.find(type => type.value === post.media_type)?.label || post.media_type}
                  </span>
                </TableCell>
                <TableCell>
                  <Popover placement="bottom-start">
                    <PopoverTrigger>
                      {(() => {
                        const category = categories?.find(c => c?.id === post?.category_id);
                        console.log('Post category_id:', post?.category_id); // Debug log 6
                        console.log('Found category:', category); // Debug log 7
                        const style = getCategoryStyle(category);
                        console.log('Applied style:', style); // Debug log 8
                        
                        return (
                          <div 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
                            role="button"
                            aria-label="Seleccionar categoría"
                          >
                            {category ? category.name : 'Sin categoría'}
                          </div>
                        );
                      })()}
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="p-2 w-64">
                        <div className="mb-2 text-sm text-gray-600">
                          Selecciona o crea una opción
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {categories.map(category => (
                            <div
                              key={category.id}
                              className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-100 flex items-center ${
                                post.category_id === category.id ? 'bg-gray-100' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignCategory(post.id, category.id);
                              }}
                            >
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getCategoryStyle(category)
                              }`}>
                                {category.name}
                              </span>
                              {post.category_id === category.id && (
                                <span className="text-blue-600 ml-auto">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <Input
                            size="sm"
                            placeholder="Nueva categoría..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            aria-label="Crear nueva categoría"
                            onClick={(e) => e.stopPropagation()}
                            onKeyPress={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter' && newCategoryName.trim()) {
                                handleCreateCategory();
                              }
                            }}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Popover placement="bottom-start">
                    <PopoverTrigger>
                      {(() => {
                        const category = categories?.find(c => c?.id === post?.category_id);
                        const subcategory = subcategories?.find(s => s?.id === post?.subcategory_id);
                        const style = getCategoryStyle(category);
                        
                        return (
                          <div 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
                            role="button"
                            aria-label="Seleccionar subcategoría"
                          >
                            {subcategory ? subcategory.name : 'Sin subcategoría'}
                          </div>
                        );
                      })()}
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="p-2 w-64">
                        <div className="mb-2 text-sm text-gray-600">
                          {post.category_id ? 'Selecciona o crea una subcategoría' : 'Primero selecciona una categoría'}
                        </div>
                        {post.category_id && (
                          <>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {subcategories
                                .filter(sub => sub.category_id === post.category_id)
                                .map(subcategory => (
                                  <div
                                    key={subcategory.id}
                                    className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-100 flex items-center ${
                                      post.subcategory_id === subcategory.id ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignSubcategory(post.id, subcategory.id);
                                    }}
                                    role="menuitem"
                                    aria-label={`Seleccionar subcategoría ${subcategory.name}`}
                                  >
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      getCategoryStyle(categories.find(c => c.id === post.category_id))
                                    }`}
                                    textvalue={subcategory.name}
                                    >
                                      {subcategory.name}
                                    </span>
                                    {post.subcategory_id === subcategory.id && (
                                      <span className="text-blue-600 ml-auto">✓</span>
                                    )}
                                  </div>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <Input
                                size="sm"
                                placeholder="Nueva subcategoría..."
                                value={newSubcategoryName}
                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                aria-label="Crear nueva subcategoría"
                                onClick={(e) => e.stopPropagation()}
                                onKeyPress={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter' && newSubcategoryName.trim()) {
                                    handleCreateSubcategory(post.category_id);
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="text-gray-900">{formatDate(post.published_at)}</TableCell>
                <TableCell className="text-gray-900">{formatTime(post.published_at)}</TableCell>
                <TableCell align="right">{post.views?.toLocaleString()}</TableCell>
                <TableCell align="right">{post.likes?.toLocaleString()}</TableCell>
                <TableCell align="right">{post.saves?.toLocaleString()}</TableCell>
                <TableCell align="right">{post.shares?.toLocaleString()}</TableCell>
                <TableCell align="right">{post.comments?.toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <Button
          color="primary"
          onPress={() => handlePageChange(Math.max(1, page - 1))}
          isDisabled={page === 1}
        >
          Anterior
        </Button>
        
        <span className="text-sm text-gray-700">
          Página {page} de {Math.ceil(filteredPosts.length / APP_CONFIG.POSTS_PER_PAGE)}
        </span>
        
        <Button
          color="primary"
          onPress={() => handlePageChange(page + 1)}
          isDisabled={page >= Math.ceil(filteredPosts.length / APP_CONFIG.POSTS_PER_PAGE)}
        >
          Siguiente
        </Button>
      </div>
    </main>
  );
}
