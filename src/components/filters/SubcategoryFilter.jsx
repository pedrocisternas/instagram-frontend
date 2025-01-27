import { Select, SelectItem } from "@heroui/react";
import { getCategoryStyle } from '@/utils/categoryStyles';

export default function SubcategoryFilter({ 
  selectedSubcategories,
  onSelectionChange,
  subcategories,
  selectedCategories,
  categories
}) {
  // Filtrar subcategorías basadas en las categorías seleccionadas
  const filteredSubcategories = subcategories.filter(sub => 
    selectedCategories.has(sub.category_id)
  );

  // Encontrar la categoría padre para el estilo
  const getParentCategory = (subcategory) => 
    categories.find(cat => cat.id === subcategory.category_id);

  return (
    <Select
      selectionMode="multiple"
      placeholder="Filtrar por subcategoría"
      selectedKeys={selectedSubcategories}
      onSelectionChange={onSelectionChange}
      className="w-[200px]"
      variant="flat"
      size="md"
      isDisabled={selectedCategories.size === 0}
      aria-label="Filtrar posts por subcategoría"
      renderValue={(items) => {
        const selectedCount = items.length;
        if (selectedCount === 0) return "Filtrar por subcategoría";
        if (selectedCount <= 2) {
          return items
            .map(item => subcategories.find(sub => sub.id === item.key)?.name)
            .filter(Boolean)
            .join(", ");
        }
        return `${selectedCount} subcategorías`;
      }}
    >
      {filteredSubcategories.map((subcategory) => (
        <SelectItem 
          key={subcategory.id} 
          value={subcategory.id}
          className="py-2"
          textValue={subcategory.name}
        >
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getCategoryStyle(getParentCategory(subcategory))
          }`}>
            {subcategory.name}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}