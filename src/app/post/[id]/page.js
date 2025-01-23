'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, CardBody, Divider } from "@heroui/react";
import { formatDate, formatTime } from '../../../utils/dateFormatters';

const USERNAME = "pirucisternas";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/posts/${id}?username=${USERNAME}`
        );
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('es-CL').format(num);
  const formatSeconds = (seconds) => `${seconds.toFixed(2)}s`;

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Post</h1>
          <Button
            color="primary"
            variant="flat"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Container - Left Side */}
          <div className="lg:w-[55%]">
            <Card className="h-full">
              <CardBody>
                {post?.media_url && (
                  <div className="aspect-[9/16] h-[calc(100vh-12rem)]">
                    <video 
                      className="w-full h-full object-contain rounded-lg"
                      controls
                      src={post.media_url}
                      poster={post.thumbnail_url}
                    >
                      Tu navegador no soporta el elemento video.
                    </video>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Metrics Container - Right Side */}
          <div className="lg:w-[45%] space-y-4">
            {/* Engagement Metrics */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Engagement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Likes</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.likes || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comments</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.comments || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saves</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.saves || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shares</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.shares || 0)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Video Metrics */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Video Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.views || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reach</p>
                    <p className="text-xl font-semibold">{formatNumber(post?.reach || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Watch Time</p>
                    <p className="text-xl font-semibold">{formatSeconds(post?.avg_watch_time || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Watch Time</p>
                    <p className="text-xl font-semibold">{formatSeconds(post?.total_watch_time || 0)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Post Details */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                <div className="space-y-3">
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
                  {post?.caption && (
                    <div>
                      <p className="text-sm text-gray-600">Caption</p>
                      <p className="font-medium">{post.caption}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}