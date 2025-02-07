import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ContentPreview({ selectedContent, posts }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (selectedContent) {
      setContent(selectedContent);
    } 
    else if (posts?.length > 0) {
      setContent(posts[0]);
    }
  }, [selectedContent, posts]);

  if (!content) {
    return (
      <div className="bg-white rounded-lg p-4 shadow h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">Selecciona un contenido para ver su preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      {/* <h2 className="text-xl font-semibold mb-4">Preview</h2> */}
      <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-black">
        {content.media_url ? (
          <video
            src={content.media_url}
            controls
            className="w-full h-full object-contain"
          />
        ) : content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.caption || 'Thumbnail del contenido'}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">No hay contenido disponible</p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {content.caption || 'Sin descripción'}
        </p>
      </div>
    </div>
  );
} 