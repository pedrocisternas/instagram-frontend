'use client'
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Skeleton,
  Tooltip
} from "@heroui/react";
import { formatDate, formatTime } from '../utils/dateFormatters';
import { useRouter } from 'next/navigation';
import StatsSummaryPanel from '@/components/posts/StatsSummaryPanel';
import { fetchDashboardData } from '@/services/api/posts';
import { 
  fetchCategories, 
  createCategory, 
  assignCategoryToPost,
  fetchSubcategories,
  createSubcategory,
  assignSubcategoryToPost
} from '@/services/api/categories';
import { MEDIA_TYPES, getMediaTypeStyle } from '@/utils/mediaTypes';
import PostFilters from '@/components/filters/PostFilters';
import { APP_CONFIG } from '@/config/app';
import { useSyncStore } from '@/store/sync';
import CategoryPopover from '@/components/categories/CategoryPopover';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { generateInsights } from '@/services/api/insights';
import { useAuthStore } from '@/store/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Componente Principal
export default function Home() {
  const router = useRouter();
  const { user, authState } = useAuthStore();
  // Estados
  const [allPosts, setAllPosts] = useState([]);
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [postsPerPage, setPostsPerPage] = useState(APP_CONFIG.POSTS_PER_PAGE);
  const tableRef = useRef(null);
  const mainContainerRef = useRef(null);

  // Obtenemos del store
  const { isSyncing, syncMetrics, setLastUpdate, lastUpdate } = useSyncStore();

  const fetchAllData = async () => {
    setIsInitialLoading(true);
    try {
      if (!user?.username) {
        console.log('No username available, skipping data fetch');
        setIsInitialLoading(false);
        return;
      }
      
      console.log('Fetching data for username:', user.username);
      const data = await fetchDashboardData(user.username);
      setAllPosts(data.posts);
      setCategories(data.categories);
      setSubcategories(data.subcategories);

      // Actualizar última sincronización
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const syncAllPages = async () => {
    try {
      await syncMetrics();
      await fetchAllData();
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

  // Calculate posts per page based on window height
  const calculatePostsPerPage = () => {
    if (typeof window === 'undefined' || !tableRef.current || !mainContainerRef.current) return;
    
    // Get available height (viewport height minus other elements)
    const viewportHeight = window.innerHeight;
    
    // Calculate space taken by other elements (title, filters, pagination, etc.)
    const tableHeaderHeight = 46; // Even smaller header height
    const paginationHeight = 44; // Even smaller pagination controls height
    const statsHeight = 100; // Even smaller stats panel height
    const titleAndFiltersHeight = 50; // Even smaller title and filters height
    const marginAndPadding = 20; // Minimal margins and padding
    
    const otherElementsHeight = tableHeaderHeight + paginationHeight + statsHeight + 
                               titleAndFiltersHeight + marginAndPadding;
    
    // Calculate available height for rows
    const availableHeight = viewportHeight - otherElementsHeight;
    
    // Use an even smaller row height
    const rowHeight = 40; // Very compact row height
    
    // Calculate rows plus add extra to use more space
    const calculatedRows = Math.floor(availableHeight / rowHeight);
    const newPostsPerPage = Math.max(3, calculatedRows);
    
    // More detailed logging
    console.log({
      viewportHeight,
      otherElementsHeight,
      availableHeight,
      rowHeight,
      calculatedRows,
      newPostsPerPage
    });
    
    setPostsPerPage(newPostsPerPage);
  };
  
  // Add resize listener to recalculate on window resize
  useEffect(() => {
    calculatePostsPerPage();
    
    const handleResize = () => {
      calculatePostsPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Recalculate when the component is fully rendered
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      calculatePostsPerPage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [allPosts.length, filteredPosts.length]);

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

    // Paginar usando postsPerPage dinámico
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    return sorted.slice(start, end);
  }, [filteredPosts, page, sortField, sortDirection, postsPerPage]);

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
      const categories = await fetchCategories(user.username);
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
      const { category } = await createCategory(newCategoryName);
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
        post.id === postId  // Usar id de la base de datos
          ? { 
              ...post, 
              category_id: categoryId,
              subcategory_id: null
            }
          : post
      )
    );

    try {
      const { post } = await assignCategoryToPost(categoryId, postId);
      document.body.click();
    } catch (err) {
      console.error('Error assigning category:', err);
      setAllPosts(previousPosts);
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
    if (user?.username) {
      fetchAllData();
    }
  }, [user?.username]);

  const handleCreateSubcategory = async (categoryId) => {
    try {
      const { subcategory } = await createSubcategory(categoryId, newSubcategoryName);
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
      const { post } = await assignSubcategoryToPost(subcategoryId, postId);
      document.body.click(); // Cerramos el popover
    } catch (error) {
      console.error('Error assigning subcategory:', error);
      setAllPosts(previousPosts); // Revertimos en caso de error
    }
  };

  // Limpiar subcategorías cuando cambian las categorías seleccionadas
  useEffect(() => {
    setSelectedSubcategories(new Set([]));
  }, [selectedCategories]);

  // Agregar esta función
  const handleGenerateInsights = async () => {
    try {
      console.log('Iniciando generación de insights...');
      console.log('Total posts filtrados:', filteredPosts.length);
      
      // Agregamos validación de cantidad mínima
      if (filteredPosts.length < 3) {
        throw new Error('Se necesitan al menos 3 posts para generar insights');
      }
      
      const insights = await generateInsights(filteredPosts);
      console.log('Insights recibidos:', insights);
      
      // Aquí podríamos mostrar los insights en un modal o en una nueva vista
      
    } catch (error) {
      console.error('Error generating insights:', error);
      setError(error.message);
    }
  };

  // Agregar el listener para el evento de sincronización
  useEffect(() => {
    const handleSync = async (event) => {
      const data = event.detail;
      setAllPosts(data.posts);
      setCategories(data.categories);
      setSubcategories(data.subcategories);
      
      // Actualizar lastUpdate si hay posts
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    };

    window.addEventListener('metrics-synced', handleSync);
    return () => window.removeEventListener('metrics-synced', handleSync);
  }, [setLastUpdate]);

  // Agregar este useEffect para manejar la redirección
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  // Add a memoized value for total pages that updates when postsPerPage changes
  const totalPages = useMemo(() => {
    return Math.ceil(filteredPosts.length / postsPerPage);
  }, [filteredPosts.length, postsPerPage]);

  // When postsPerPage changes, we need to adjust the current page if needed
  useEffect(() => {
    // If the current page is now beyond the total pages, adjust it
    if (page > totalPages && totalPages > 0) {
      handlePageChange(totalPages);
    }
  }, [totalPages, page]);

  // Modificar la lógica de loading
  if (authState === 'loading' || isInitialLoading) {
    return <DashboardSkeleton />;
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <AuthGuard>
      <main className="p-8 bg-gray-50" ref={mainContainerRef}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
          <h1 className="text-2xl font-bold">Publicaciones</h1>
            {/* <SyncButton
              isSyncing={isSyncing}
              onSync={syncAllPages}
              lastUpdate={lastUpdate}
            /> */}
            {/* <Button 
              color="secondary"
              onPress={handleGenerateInsights}
            >
              Generar Insights
            </Button> */}
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

        <Table removeWrapper aria-label="Instagram posts table" ref={tableRef}>
          <TableHeader>
            <TableColumn width="17.3%">Caption</TableColumn>
            <TableColumn width="8%" align="center">Tipo</TableColumn>
            <TableColumn width="11%" align="center">Categoría</TableColumn>
            <TableColumn width="11%" align="center">Subcategoría</TableColumn>
            {[
              { field: 'published_at', label: 'Fecha', width: "8%" },
              { field: 'published_at', label: 'Hora', width: "6%" },
              { field: 'views', label: 'Views', width: "8%" },
              { field: 'likes', label: 'Likes', width: "8%" },
              { field: 'saves', label: 'Saves', width: "8%" },
              { field: 'shares', label: 'Shares', width: "8%" },
              { field: 'comments', label: 'Comments', width: "8%" }
            ].map(({ field, label, width }) => (
              <TableColumn 
                key={`${field}-${label}`}
                width={width} 
                align="center"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(field)}
              >
                <div className="flex items-center justify-center gap-1">
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
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  <TableCell className="text-gray-900 max-w-0 w-[17.3%]">
                    {post.caption 
                      ? (
                          <Tooltip 
                            content={post.caption} 
                            placement="top"
                            className="max-w-xs"
                          >
                            <span className="cursor-help line-clamp-1 block truncate">
                              {post.caption}
                            </span>
                          </Tooltip>
                        )
                      : 'No caption'}
                  </TableCell>
                  <TableCell className="w-[8%]">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getMediaTypeStyle(post.media_type)
                    }`}>
                      {MEDIA_TYPES.find(type => type.value === post.media_type)?.label || post.media_type}
                    </span>
                  </TableCell>
                  <TableCell className="w-[11%] max-w-0">
                    <div className="truncate overflow-hidden text-ellipsis">
                      <CategoryPopover
                        category={categories.find(c => c.id === post.category_id)}
                        categories={categories}
                        onCreateCategory={() => handleCreateCategory()}
                        onAssignCategory={(categoryId) => handleAssignCategory(post.id, categoryId)}
                        newCategoryName={newCategoryName}
                        onNewCategoryNameChange={(value) => setNewCategoryName(value)}
                        type="categoría"
                        disableTooltip={true}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="w-[11%] max-w-0">
                    <div className="truncate overflow-hidden text-ellipsis">
                      <CategoryPopover
                        category={subcategories.find(s => s.id === post.subcategory_id)}
                        categories={subcategories.filter(sub => sub.category_id === post.category_id)}
                        onCreateCategory={() => handleCreateSubcategory(post.category_id)}
                        onAssignCategory={(subcategoryId) => handleAssignSubcategory(post.id, subcategoryId)}
                        newCategoryName={newSubcategoryName}
                        onNewCategoryNameChange={(value) => setNewSubcategoryName(value)}
                        parentCategory={categories.find(c => c.id === post.category_id)}
                        type="subcategoría"
                        disableTooltip={true}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 w-[8%]">{formatDate(post.published_at)}</TableCell>
                  <TableCell className="text-gray-900 w-[6%]">{formatTime(post.published_at)}</TableCell>
                  <TableCell align="right" className="w-[8%]">{post.views?.toLocaleString()}</TableCell>
                  <TableCell align="right" className="w-[8%]">{post.likes?.toLocaleString()}</TableCell>
                  <TableCell align="right" className="w-[8%]">{post.saves?.toLocaleString()}</TableCell>
                  <TableCell align="right" className="w-[8%]">{post.shares?.toLocaleString()}</TableCell>
                  <TableCell align="right" className="w-[8%]">{post.comments?.toLocaleString()}</TableCell>
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
            Página {page} de {totalPages}
          </span>
          
          <Button
            color="primary"
            onPress={() => handlePageChange(page + 1)}
            isDisabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </main>
    </AuthGuard>
  );
}
