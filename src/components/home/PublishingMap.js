import React, { useMemo } from 'react';
import { Card, CardBody, Tooltip } from "@heroui/react";
import { format, eachDayOfInterval, subYears, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PublishingMap({ posts }) {
  const contributionData = useMemo(() => {
    const now = new Date();
    const yearAgo = subYears(now, 1);
    
    // Obtener todos los días del intervalo
    const daysInterval = eachDayOfInterval({
      start: yearAgo,
      end: now
    });

    // Crear mapa de publicaciones por día
    const postsMap = posts.reduce((acc, post) => {
      const date = startOfDay(new Date(post.published_at)).getTime();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(post);
      return acc;
    }, {});

    // Crear matriz de columnas
    const columns = [];
    let currentColumn = [];

    daysInterval.forEach((date, index) => {
      const columnIndex = Math.floor(index / 14);
      const timestamp = startOfDay(date).getTime();
      const dayPosts = postsMap[timestamp] || [];
      
      if (!columns[columnIndex]) {
        columns[columnIndex] = [];
      }
      
      columns[columnIndex].push({
        date,
        count: dayPosts.length,
        posts: dayPosts
      });
    });

    // No completamos la última columna, la dejamos como está
    return columns;
  }, [posts]);

  const getColorIntensity = (count) => {
    if (count === 0) return 'bg-gray-300';
    if (count === 1) return 'bg-purple-400';
    if (count === 2) return 'bg-purple-500';
    if (count === 3) return 'bg-purple-600';
    return 'bg-purple-600';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold mb-1">
          Mapa de Publicaciones
        </h3>
        <div className="relative flex flex-col h-[300px]">
          <div className="flex items-start justify-center overflow-x-auto py-1">
            <div className="flex gap-[3px]">
              {contributionData.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-[3px]">
                  {column.map(({ date, count, posts }, dayIndex) => (
                    <Tooltip
                      key={dayIndex}
                      content={
                        <div className="p-2">
                          <p className="font-semibold">
                            {format(date, "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                          <p className="text-sm">
                            {count === 0 ? 'Sin publicaciones' : count === 1 ? '1 publicación' : `${count} publicaciones`}
                          </p>
                          {posts.map((post, i) => (
                            <p key={i} className="text-xs text-gray-400 truncate max-w-[200px]">
                              {post.caption?.slice(0, 50) || 'Sin descripción'}{post.caption?.length > 50 ? '...' : ''}
                            </p>
                          ))}
                        </div>
                      }
                      placement="top"
                    >
                      <div
                        className={`w-[15px] h-[15px] rounded-sm ${getColorIntensity(count)} hover:ring-2 hover:ring-purple-400 cursor-pointer`}
                      />
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-gray-500">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-[15px] h-[15px] rounded-sm bg-gray-100" />
              <div className="w-[15px] h-[15px] rounded-sm bg-purple-200" />
              <div className="w-[15px] h-[15px] rounded-sm bg-purple-300" />
              <div className="w-[15px] h-[15px] rounded-sm bg-purple-400" />
              <div className="w-[15px] h-[15px] rounded-sm bg-purple-600" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
