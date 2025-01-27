import { Select, SelectItem } from "@heroui/react";
import { MEDIA_TYPES, getMediaTypeStyle } from '@/utils/mediaTypes';

export default function MediaTypeFilter({ selectedTypes, onSelectionChange }) {
  return (
    <Select
      selectionMode="multiple"
      placeholder="Filtrar por tipo"
      selectedKeys={selectedTypes}
      onSelectionChange={onSelectionChange}
      className="w-[200px]"
      variant="flat"
      size="md"
      aria-label="Filtrar posts por tipo de medio"
      renderValue={(items) => {
        const selectedCount = items.length;
        if (selectedCount === 0) return "Filtrar por tipo";
        if (selectedCount <= 2) {
          return items
            .map(item => MEDIA_TYPES.find(type => type.value === item.key)?.label)
            .filter(Boolean)
            .join(", ");
        }
        return `${selectedCount} tipos`;
      }}
    >
      {MEDIA_TYPES.map((type) => (
        <SelectItem 
          key={type.value} 
          value={type.value}
          className="py-2"
          textValue={type.label}
        >
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getMediaTypeStyle(type.value)
          }`}>
            {type.label}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}
