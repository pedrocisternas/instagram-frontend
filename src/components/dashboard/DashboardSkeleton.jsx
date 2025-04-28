import { Skeleton, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/react";

const StatItemSkeleton = () => (
  <div className="bg-white rounded-lg p-4 shadow">
    <Skeleton className="h-4 w-24 mb-1" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export default function DashboardSkeleton() {
  return (
    <main className="p-8 bg-gray-50">
      <div className="flex justify-between items-start mb-6">
        {/* Sync Button Skeleton */}
        <div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Summary Panel Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
        {Array(7).fill(null).map((_, index) => (
          <StatItemSkeleton key={index} />
        ))}
      </div>

      <Table removeWrapper aria-label="Instagram posts table skeleton">
        <TableHeader>
          <TableColumn width="14.3%">Caption</TableColumn>
          <TableColumn width="8%">Tipo</TableColumn>
          <TableColumn width="12.5%">Categoría</TableColumn>
          <TableColumn width="12.5%">Subcategoría</TableColumn>
          <TableColumn width="8%">Fecha</TableColumn>
          <TableColumn width="6%">Hora</TableColumn>
          <TableColumn width="8%">Views</TableColumn>
          <TableColumn width="8%">Likes</TableColumn>
          <TableColumn width="8%">Saves</TableColumn>
          <TableColumn width="8%">Shares</TableColumn>
          <TableColumn width="8%">Comments</TableColumn>
        </TableHeader>
        <TableBody>
          {Array(12).fill(null).map((_, index) => (
            <TableRow key={index}>
              {Array(11).fill(null).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
