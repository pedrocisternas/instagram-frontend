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
  SelectItem 
} from "@heroui/react";
import { formatDate, formatTime } from '../utils/dateFormatters';

// Constantes
const POSTS_PER_PAGE = 20;
const USERNAME = "pirucisternas";


// Componente Principal
export default function Home() {
  // Estados
  const [allPosts, setAllPosts] = useState([]); // Todos los posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('published_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(new Set([]));

  // Agregar esta constante con los tipos disponibles
  const MEDIA_TYPES = [
    { label: 'Reel', value: 'VIDEO' },
    { label: 'Carrusel', value: 'CAROUSEL_ALBUM' },
    { label: 'Imagen', value: 'IMAGE' }
  ];

  // Funciones
  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/posts?username=${USERNAME}`
      );
      const data = await response.json();
      setAllPosts(data.posts);
      if (data.posts.length > 0) {
        const latestUpdate = data.posts.reduce((latest, post) => {
          return post.metrics_updated_at > latest ? post.metrics_updated_at : latest;
        }, data.posts[0].metrics_updated_at);
        setLastUpdate(latestUpdate);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncAllPages = async () => {
    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/posts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME })
      });
      
      if (!response.ok) throw new Error('Sync failed');
      await fetchPosts();
    } catch (err) {
      setError(err.message);
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Ordenar y paginar posts
  const sortedAndPaginatedPosts = useMemo(() => {
    // Filtrar
    let filtered = [...allPosts];
    if (selectedTypes.size > 0) {
      filtered = filtered.filter(post => 
        selectedTypes.has(post.media_type === 'REEL' ? 'VIDEO' : post.media_type)
      );
    }

    // Ordenar
    const sorted = filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Manejo especial para fechas
      if (sortField === 'published_at') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortDirection === 'desc' ? 
          bDate.getTime() - aDate.getTime() : 
          aDate.getTime() - bDate.getTime();
      }

      // Manejo para valores numéricos
      const aNum = aValue ?? 0;
      const bNum = bValue ?? 0;
      return sortDirection === 'desc' ? bNum - aNum : aNum - bNum;
    });

    // Paginar
    const start = (page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    return sorted.slice(start, end);
  }, [allPosts, page, sortField, sortDirection, selectedTypes]);

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Agregar esta función helper para determinar el estilo del tag
  const getMediaTypeStyle = (mediaType) => {
    switch (mediaType) {
      case 'VIDEO':
      case 'REEL':
        return 'bg-purple-100 text-purple-800';
      case 'CAROUSEL_ALBUM':
        return 'bg-blue-100 text-blue-800';   
      case 'IMAGE':
        return 'bg-green-100 text-green-800'; 
      default:
        return 'bg-gray-100 text-gray-800'; 
    }
  };

  // Función para normalizar el tipo de media
  const getMediaTypeLabel = (mediaType) => {
    switch (mediaType) {
      case 'VIDEO':
      case 'REEL':
        return 'Reel';
      case 'CAROUSEL_ALBUM':
        return 'Carrusel';
      case 'IMAGE':
        return 'Imagen';
      default:
        return mediaType;
    }
  };

  // Effects
  useEffect(() => {
    fetchPosts();
  }, []); // Solo se ejecuta una vez al montar

  // Render
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Instagram Analytics</h1>
          {lastUpdate && (
            <p className="text-sm text-gray-600 mt-1">
              Última actualización: {formatDate(lastUpdate)} {formatTime(lastUpdate)}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center justify-end min-w-[500px]">
          {(selectedTypes.size > 0 || sortField !== 'published_at' || sortDirection !== 'desc') && (
            <Button
              color="primary"
              variant="flat"
              onPress={() => {
                setSelectedTypes(new Set([]));
                setSortField('published_at');
                setSortDirection('desc');
              }}
            >
              Limpiar Filtros
            </Button>
          )}

          <Select
            selectionMode="multiple"
            placeholder="Filtrar por tipo"
            selectedKeys={selectedTypes}
            onSelectionChange={setSelectedTypes}
            className="w-[200px]"
            variant="flat"
            size="md"
            classNames={{
              trigger: "h-[40px]",
              value: "text-sm",
              base: "max-h-[40px]",
            }}
          >
            {MEDIA_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
          
          <Button
            color="primary"
            isLoading={syncing}
            onPress={syncAllPages}
          >
            {syncing ? 'Sincronizando...' : 'Actualizar Métricas'}
          </Button>
        </div>
      </div>

      <Table removeWrapper aria-label="Instagram posts table">
        <TableHeader>
          <TableColumn width={300}>Caption</TableColumn>
          <TableColumn width={100}>Tipo</TableColumn>
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
          {syncing ? (
            Array(POSTS_PER_PAGE).fill(null).map((_, index) => (
              <TableRow key={index}>
                {Array(9).fill(null).map((_, cellIndex) => (
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
                onClick={() => window.location.href = `/post/${post.instagram_post_id}`}
              >
                <TableCell className="text-gray-900">{post.caption?.slice(0, 50) || 'No caption'}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMediaTypeStyle(post.media_type)}`}>
                    {getMediaTypeLabel(post.media_type)}
                  </span>
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
          onPress={() => setPage(p => Math.max(1, p - 1))}
          isDisabled={page === 1}
        >
          Anterior
        </Button>
        
        <span className="text-sm text-gray-700">
          Página {page} de {Math.ceil(allPosts.length / POSTS_PER_PAGE)}
        </span>
        
        <Button
          color="primary"
          onPress={() => setPage(p => p + 1)}
          isDisabled={page >= Math.ceil(allPosts.length / POSTS_PER_PAGE)}
        >
          Siguiente
        </Button>
      </div>
    </main>
  );
}
