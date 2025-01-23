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
  Skeleton 
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
    // Ordenar
    const sorted = [...allPosts].sort((a, b) => {
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
  }, [allPosts, page, sortField, sortDirection]);

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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
        <div className="flex gap-2">
          {sortField !== 'published_at' || sortDirection !== 'desc' ? (
            <Button
              color="primary"
              variant="flat"
              onPress={() => {
                setSortField('published_at');
                setSortDirection('desc');
              }}
            >
              Limpiar Filtros
            </Button>
          ) : null}
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
                {Array(8).fill(null).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            sortedAndPaginatedPosts.map(post => (
              <TableRow key={post.id}>
                <TableCell>{post.caption?.slice(0, 50) || 'No caption'}</TableCell>
                <TableCell>{formatDate(post.published_at)}</TableCell>
                <TableCell>{formatTime(post.published_at)}</TableCell>
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
