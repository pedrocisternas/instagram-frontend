export const MEDIA_TYPES = [
  { label: 'Reel', value: 'VIDEO' },
  { label: 'Carrusel', value: 'CAROUSEL_ALBUM' },
  { label: 'Imagen', value: 'IMAGE' }
];

export const getMediaTypeStyle = (mediaType) => {
  const styles = {
    VIDEO: 'bg-mediaType-reel-bg text-mediaType-reel-text',
    REEL: 'bg-mediaType-reel-bg text-mediaType-reel-text',
    CAROUSEL_ALBUM: 'bg-mediaType-carousel-bg text-mediaType-carousel-text',
    IMAGE: 'bg-mediaType-image-bg text-mediaType-image-text'
  };
  return styles[mediaType] || 'bg-gray-100 text-gray-600';
};
