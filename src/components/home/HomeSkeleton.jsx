import { Skeleton } from "@heroui/react";

const MetricsPanelSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="grid grid-cols-4 gap-4">
      {Array(4).fill(null).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  </div>
);

const TopContentListSkeleton = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array(5).fill(null).map((_, index) => (
        <div key={index} className="h-24 p-4">
          <div className="flex justify-between gap-4 h-full">
            <div className="flex-1 flex flex-col justify-between">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InsightsPanelSkeleton = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="p-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          {Array(3).fill(null).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full mb-2" />
          ))}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          {Array(2).fill(null).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ContentDistributionSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export default function HomeSkeleton() {
  return (
    <main className="p-8 bg-gray-50">
      {/* Tabs y botón */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {/* Contenedor izquierdo (3/5) */}
        <div className="col-span-3 space-y-6">
          {/* Panel superior */}
          <MetricsPanelSkeleton />
          
          {/* Panel inferior dividido */}
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-3">
              <TopContentListSkeleton />
            </div>
            <div className="col-span-3">
              <InsightsPanelSkeleton />
            </div>
          </div>
        </div>

        {/* Contenedor derecho (2/5) */}
        <div className="col-span-2 space-y-6">
          <ContentDistributionSkeleton />
        </div>
      </div>
    </main>
  );
}
