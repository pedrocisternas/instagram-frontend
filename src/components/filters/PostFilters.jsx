import { Button } from "@heroui/react";
import MediaTypeFilter from './MediaTypeFilter';
import CategoryFilter from './CategoryFilter';

export default function PostFilters({ 
  selectedTypes,
  selectedCategories,
  categories,
  sortField,
  sortDirection,
  onTypeChange,
  onCategoryChange,
  onSortReset,
  onSync,
  syncing
}) {
  const hasFilters = selectedTypes.size > 0 || 
    selectedCategories.size > 0 || 
    sortField !== 'published_at' || 
    sortDirection !== 'desc';

  return (
    <div className="flex gap-2 items-center justify-end min-w-[500px]">
      {hasFilters && (
        <Button
          color="primary"
          variant="flat"
          onPress={() => {
            onTypeChange(new Set([]));
            onCategoryChange(new Set([]));
            onSortReset();
          }}
        >
          Limpiar Filtros
        </Button>
      )}

      <MediaTypeFilter 
        selectedTypes={selectedTypes}
        onSelectionChange={onTypeChange}
      />

      <CategoryFilter 
        selectedCategories={selectedCategories}
        onSelectionChange={onCategoryChange}
        categories={categories}
      />

      <Button
        color="primary"
        isLoading={syncing}
        onPress={onSync}
      >
        {syncing ? 'Sincronizando...' : 'Actualizar Métricas'}
      </Button>
    </div>
  );
}