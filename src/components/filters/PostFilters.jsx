import { Button } from "@heroui/react";
import MediaTypeFilter from './MediaTypeFilter';
import CategoryFilter from './CategoryFilter';
import SubcategoryFilter from './SubcategoryFilter';

export default function PostFilters({ 
  selectedTypes,
  selectedCategories,
  selectedSubcategories,
  categories,
  subcategories,
  sortField,
  sortDirection,
  onTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onSortReset
}) {
  const hasFilters = selectedTypes.size > 0 || 
    selectedCategories.size > 0 || 
    selectedSubcategories.size > 0 ||
    sortField !== 'published_at' || 
    sortDirection !== 'desc';

  return (
    <div className="flex gap-2 items-center">
      {hasFilters && (
        <Button
          color="primary"
          variant="flat"
          onPress={() => {
            onTypeChange(new Set([]));
            onCategoryChange(new Set([]));
            onSubcategoryChange(new Set([]));
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

      <SubcategoryFilter 
        selectedSubcategories={selectedSubcategories}
        onSelectionChange={onSubcategoryChange}
        subcategories={subcategories}
        selectedCategories={selectedCategories}
        categories={categories}
      />
    </div>
  );
}