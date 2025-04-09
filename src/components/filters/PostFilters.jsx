import { Button } from "@heroui/react";
import MediaTypeFilter from './MediaTypeFilter';
import CategoryFilter from './CategoryFilter';
import SubcategoryFilter from './SubcategoryFilter';
import DateRangeFilter from './DateRangeFilter';

export default function PostFilters({ 
  selectedTypes,
  selectedCategories,
  selectedSubcategories,
  categories,
  subcategories,
  sortField,
  sortDirection,
  selectedDays,
  onTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onDaysChange,
  onResetFilters
}) {
  const hasFilters = selectedTypes.size > 0 || 
    selectedCategories.size > 0 || 
    selectedSubcategories.size > 0 ||
    sortField !== 'published_at' || 
    sortDirection !== 'desc' ||
    selectedDays !== 0;

  return (
    <div className="flex gap-2 items-center">
      {hasFilters && (
        <Button
          color="primary"
          variant="flat"
          onPress={onResetFilters}
        >
          Limpiar Filtros
        </Button>
      )}

      <DateRangeFilter
        selectedDays={selectedDays}
        onDaysChange={onDaysChange}
      />

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