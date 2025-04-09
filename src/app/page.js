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
import { fetchDashboardData, fetchDashboardTable } from '@/services/api/posts';
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
  const [page, setPage] = useState(1);
  const [isClientSide, setIsClientSide] = useState(false);
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
  const tableRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [selectedDays, setSelectedDays] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Obtenemos del store
  const { isSyncing, syncMetrics, setLastUpdate, lastUpdate } = useSyncStore();

  const fetchTableData = async (pageToFetch = page, customFilters = {}) => {
    try {
      if (!user?.username) {
        console.log('(fetchTablePosts) No username available, skipping data fetch');
        setIsInitialLoading(false);
        return;
      }
      
      // Activar estado de carga
      setIsLoading(true);

      // Crear objeto de filtros con los valores actuales
      const filters = {
        types: selectedTypes,
        categories: selectedCategories,
        subcategories: selectedSubcategories,
        days: selectedDays,
        page: pageToFetch,
        sortField: sortField,
        sortDirection: sortDirection,
        ...customFilters // Permite sobreescribir filtros si se pasan en customFilters
      };
      
      const data = await fetchDashboardTable(user.username, filters);
      setAllPosts(data.posts);
      setCategories(data.categories);
      setSubcategories(data.subcategories);
      
      // Actualizar información de paginación si está disponible
      if (data.pagination) {
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        
        // Debug para verificar el valor de totalPages
        console.log('Pagination info:', {
          page: data.pagination.page, 
          totalPages: data.pagination.totalPages,
          totalPosts: data.pagination.total,
          filteredTypesCount: filters.types?.size || 0,
          filteredCategoriesCount: filters.categories?.size || 0,
          filteredSubcategoriesCount: filters.subcategories?.size || 0,
          filteredDays: filters.days || 0
        });
      }

      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    } catch (error) {
      console.error('(fetchTablePosts) Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false); // Desactivar estado de carga
    }
  };

  const syncAllPages = async () => {
    try {
      setIsLoading(true); // Activar estado de carga durante la sincronización
      await syncMetrics();
      await fetchTableData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Asegurar que se desactive el estado de carga
    }
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    const newDirection = sortField === field 
      ? (sortDirection === 'asc' ? 'desc' : 'asc')
      : 'desc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Cargar datos con el nuevo ordenamiento
    fetchTableData(1, { sortField: field, sortDirection: newDirection, page: 1 });
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
    // Actualizamos la URL
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    
    // Cargar datos para la nueva página
    fetchTableData(newPage);
  };

  // Efecto para manejar la inicialización en el cliente
  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClientSide(true);
    
    // Inicializar la página desde la URL solo en el cliente
    const params = new URLSearchParams(window.location.search);
    const pageParam = parseInt(params.get('page'));
    if (pageParam && !isNaN(pageParam)) {
      setPage(pageParam);
    }
  }, []);

  // En el useEffect donde cambian los filtros, asegurarnos de volver a la página 1
  useEffect(() => {
    // Solo ejecutar cuando estamos en el cliente y ya se hizo la carga inicial
    if (isClientSide && !isInitialLoading && user?.username) {
      // Al cambiar los filtros, volvemos siempre a la página 1
      // También actualizamos la URL para reflejar que estamos en la página 1
      const params = new URLSearchParams(window.location.search);
      params.set('page', '1');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      
      fetchTableData(1); // Volver a la página 1 cuando cambian los filtros
    }
  }, [selectedTypes, selectedCategories, selectedSubcategories, selectedDays, isClientSide, isInitialLoading, user?.username]);

  // Modificar el efecto de carga inicial
  useEffect(() => {
    // Solo ejecutar cuando estamos en el cliente y tenemos el username
    if (isClientSide && user?.username) {
      fetchTableData();
    }
  }, [isClientSide, user?.username]);

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
      console.log('Total posts filtrados:', allPosts.length);
      
      // Agregamos validación de cantidad mínima
      if (allPosts.length < 3) {
        throw new Error('Se necesitan al menos 3 posts para generar insights');
      }
      
      const insights = await generateInsights(allPosts);
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

  // Modificar la función sanitizeCaption para evitar errores del DOM en SSR
  const sanitizeCaption = (caption) => {
    if (!caption) return '';
    
    // Verificar que estamos en el cliente antes de usar APIs del DOM
    if (typeof document === 'undefined') {
      // Si estamos en el servidor, solo devolvemos el caption limpio básico
      return caption.replace(/<[^>]*>/g, '');
    }
    
    // Código existente del cliente
    const div = document.createElement('div');
    div.textContent = caption;
    let sanitized = div.innerHTML;
    
    // Additional handling for URLs to prevent tooltip parsing issues
    sanitized = sanitized.replace(/(https?:\/\/[^\s]+)/g, (url) => {
      return url
        .replace(/&/g, '&amp;')
        .replace(/\?/g, '&#63;')
        .replace(/=/g, '&#61;')
        .replace(/%/g, '&#37;')
        .replace(/\//g, '&#47;');
    });
    
    return sanitized;
  };

  // Manejadores de filtros actualizados para recargar datos
  const handleTypeChange = (newTypes) => {
    setSelectedTypes(newTypes);
    // No necesitamos llamar a fetchTableData aquí porque
    // ya se hace en el useEffect cuando cambia selectedTypes
  };

  const handleCategoryChange = (newCategories) => {
    setSelectedCategories(newCategories);
    // Limpiar subcategorías si no hay categorías seleccionadas
    if (newCategories.size === 0) {
      setSelectedSubcategories(new Set([]));
    }
  };

  const handleSubcategoryChange = (newSubcategories) => {
    setSelectedSubcategories(newSubcategories);
  };

  const handleDaysChange = (newDays) => {
    setSelectedDays(newDays);
  };

  const handleResetFilters = () => {
    setSelectedTypes(new Set([]));
    setSelectedCategories(new Set([]));
    setSelectedSubcategories(new Set([]));
    setSelectedDays(0);
    setSortField('published_at');
    setSortDirection('desc');
    // Forzar recarga con filtros limpios
    fetchTableData(1, {
      types: new Set([]),
      categories: new Set([]),
      subcategories: new Set([]),
      days: 0,
      sortField: 'published_at',
      sortDirection: 'desc',
      page: 1
    });
  };

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
            selectedDays={selectedDays}
            onTypeChange={handleTypeChange}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
            onDaysChange={handleDaysChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Add the stats panel here, using allPosts */}
        <StatsSummaryPanel posts={allPosts} />

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
            {(isSyncing || isLoading) ? (

              Array.from({ length: 12 }).map((_, index) => (
                <TableRow key={index}>
                  {Array(11).fill(null).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : allPosts.length === 0 ? (
              // Mostrar mensaje cuando no hay posts que mostrar              
              <TableRow>
                {/* Primera celda con el mensaje, las demás vacías */}
                <TableCell>
                  <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                    <p className="text-lg font-medium">No se encontraron publicaciones</p>
                    <p className="text-sm mt-1">Prueba con otros filtros o limpia los filtros actuales</p>
                    <Button 
                      color="primary" 
                      variant="flat"
                      className="mt-4"
                      onPress={handleResetFilters}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </TableCell>
                {/* Agregar las 10 celdas restantes para completar las 11 columnas */}
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            ) : (
              allPosts.map(post => (
                <TableRow 
                  key={post.id} 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  <TableCell className="text-gray-900 max-w-0 w-[17.3%]">
                    {post.caption 
                      ? (
                          <Tooltip 
                            content={
                              <div style={{ 
                                maxHeight: '100px', 
                                overflow: 'auto', 
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-word' 
                              }}>
                                {sanitizeCaption(post.caption)}
                              </div>
                            }
                            placement="top"
                            className="max-w-xs"
                            showArrow={true}
                            closeDelay={0}
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

        {/* Controles de paginación, solo visibles si hay posts */}
        {allPosts.length > 0 && !isLoading && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              color="primary"
              onPress={() => handlePageChange(Math.max(1, page - 1))}
              isDisabled={page === 1 || isLoading}
              isLoading={isLoading}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-gray-700">
              {isLoading ? "Cargando..." : `Página ${page} de ${totalPages}`}
            </span>
            
            <Button
              color="primary"
              onPress={() => handlePageChange(page + 1)}
              isDisabled={page >= totalPages || isLoading}
              isLoading={isLoading}
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
