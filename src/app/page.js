'use client'
import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const POSTS_PER_PAGE = 10;
  const username = "pirucisternas";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/posts?username=${username}&page=${page}&limit=${POSTS_PER_PAGE}`
      );
      const data = await response.json();
      setPosts(data.posts);
      setTotalPosts(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncCurrentPage = async () => {
    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/posts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username,
          page,
          limit: POSTS_PER_PAGE
        }),
      });
      
      if (!response.ok) throw new Error('Sync failed');
      await fetchPosts(); // Recargar datos después de sincronizar
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  if (error) return <div>Error: {error}</div>;

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Instagram Analytics</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={syncCurrentPage}
          disabled={syncing}
        >
          {syncing ? 'Sincronizando...' : 'Actualizar página actual'}
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Caption</th>
                <th className="px-4 py-2">Published</th>
                <th className="px-4 py-2">Views</th>
                <th className="px-4 py-2">Likes</th>
                <th className="px-4 py-2">Saves</th>
                <th className="px-4 py-2">Shares</th>
                <th className="px-4 py-2">Comments</th>
                <th className="px-4 py-2">Published At</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{post.caption?.slice(0, 50) || 'No caption'}</td>
                  <td className="px-4 py-2">{new Date(post.published_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{post.views?.toLocaleString()}</td>
                  <td className="px-4 py-2">{post.likes?.toLocaleString()}</td>
                  <td className="px-4 py-2">{post.saves?.toLocaleString()}</td>
                  <td className="px-4 py-2">{post.shares?.toLocaleString()}</td>
                  <td className="px-4 py-2">{post.comments?.toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(post.published_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Anterior
            </button>
            
            <span className="text-gray-600">
              Página {page} de {Math.ceil(totalPosts / POSTS_PER_PAGE)}
            </span>
            
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalPosts / POSTS_PER_PAGE)}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
