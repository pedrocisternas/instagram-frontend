export const getCategoryStyle = (category) => {
    if (!category) {
      return 'bg-gray-100 text-gray-600';
    }
    
    const paletteIndex = (category.color_index % 15) + 1;
    return `bg-categoryPalette-${paletteIndex}-bg text-categoryPalette-${paletteIndex}-text`;
  };