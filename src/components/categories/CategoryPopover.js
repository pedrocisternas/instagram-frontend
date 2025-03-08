'use client'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input,
  Tooltip
} from "@heroui/react";
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useState } from "react";

export default function CategoryPopover({
  category,
  categories,
  onCreateCategory,
  onAssignCategory,
  newCategoryName,
  onNewCategoryNameChange,
  parentCategory,
  type = 'categoría',
  className = '',
  disableTooltip = false
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            getCategoryStyle(category, parentCategory)
          }`}
        >
          {category ? (
            disableTooltip ? (
              <span className="line-clamp-1 max-w-[150px]">
                {category.name}
              </span>
            ) : (
              <Tooltip 
                content={category.name} 
                placement="top"
                className="max-w-xs"
              >
                <span className="line-clamp-1 max-w-[150px]">
                  {category.name}
                </span>
              </Tooltip>
            )
          ) : (
            `Sin ${type}`
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className={`p-2 w-64 ${className}`} onClick={(e) => e.stopPropagation()}>
          <div className="mb-2 text-sm text-gray-600">
            Selecciona o crea una {type}
          </div>
          <div className="space-y-1">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-100 flex items-center ${
                  category?.id === cat.id ? 'bg-gray-100' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignCategory(cat.id);
                  setIsOpen(false);
                }}
                role="menuitem"
                aria-label={`Seleccionar ${type} ${cat.name}`}
              >
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getCategoryStyle(cat, parentCategory)
                }`}>
                  <span className="line-clamp-1 max-w-[150px]">{cat.name}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t">
            <Input
              size="sm"
              placeholder={`Nueva ${type}...`}
              value={newCategoryName}
              onChange={(e) => onNewCategoryNameChange(e.target.value)}
              aria-label={`Crear nueva ${type}`}
              onClick={(e) => e.stopPropagation()}
              onKeyPress={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  onCreateCategory();
                  setIsOpen(false);
                }
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
