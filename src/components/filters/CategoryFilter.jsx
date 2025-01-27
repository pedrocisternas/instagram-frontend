import { Select, SelectItem } from "@heroui/react";
import { getCategoryStyle } from '@/utils/categoryStyles';

export default function CategoryFilter({ 
  selectedCategories, 
  onSelectionChange, 
  categories 
}) {
  return (
    <Select
      selectionMode="multiple"
      placeholder="Filtrar por categoría"
      selectedKeys={selectedCategories}
      onSelectionChange={onSelectionChange}
      className="w-[200px]"
      variant="flat"
      size="md"
      aria-label="Filtrar posts por categoría"
      renderValue={(items) => {
        const selectedCount = items.length;
        if (selectedCount === 0) return "Filtrar por categoría";
        if (selectedCount <= 2) {
          return items
            .map(item => categories.find(cat => cat.id === item.key)?.name)
            .filter(Boolean)
            .join(", ");
        }
        return `${selectedCount} categorías`;
      }}
    >
      {categories.map((category) => (
        <SelectItem 
          key={category.id} 
          value={category.id}
          className="py-2"
          textValue={category.name}
        >
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getCategoryStyle(category)
          }`}>
            {category.name}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}