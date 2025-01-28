export const getCategoryStyle = (category, parentCategory = null) => {
  if (!category && !parentCategory) return 'bg-gray-100 text-gray-600';
  
  // Si es una subcategoría, usa el color de la categoría padre
  const colorIndex = parentCategory ? 
    parentCategory.color_index : 
    category.color_index;

  // Ajustamos el índice para que empiece en 1
  const adjustedIndex = (colorIndex || 0) + 1;

  return `bg-categoryPalette-${adjustedIndex}-bg text-categoryPalette-${adjustedIndex}-text`;
};