'use client'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input,
  Button
} from "@heroui/react";
import { getCategoryStyle } from '@/utils/categoryStyles';

export default function CategoryPopover({
  category,
  categories,
  onCreateCategory,
  onAssignCategory,
  newCategoryName,
  onNewCategoryNameChange,
  triggerContent
}) {
  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            getCategoryStyle(category)
          }`}
        >
          {category ? category.name : 'Sin categoría'}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div 
          className="p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Nueva categoría</p>
            <div className="flex gap-2">
              <Input
                size="sm"
                value={newCategoryName}
                onChange={(e) => onNewCategoryNameChange(e.target.value)}
                placeholder="Nombre de categoría"
              />
              <Button
                size="sm"
                color="primary"
                isDisabled={!newCategoryName.trim()}
                onPress={onCreateCategory}
              >
                Crear
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-md cursor-pointer flex items-center justify-between ${
                  category?.id === cat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getCategoryStyle(cat)
                }`}>
                  {cat.name}
                </span>
                {category?.id === cat.id && (
                  <span className="text-blue-600">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}