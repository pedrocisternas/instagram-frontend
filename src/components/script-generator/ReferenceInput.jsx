'use client'
import { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Select, 
  SelectItem, 
  Card, 
  CardBody,
  CardHeader,
  Divider
} from "@heroui/react";
import { LinkIcon } from '@heroicons/react/24/outline';

export default function ReferenceInput({ 
  onSubmit, 
  isLoading, 
  categories = [], 
  categoryStats = {} 
}) {
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [urlError, setUrlError] = useState('');
  
  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryId('');
  }, [categoryId]);
  
  // Get subcategories for selected category
  const subcategories = categoryId 
    ? categories.find(c => c.id === categoryId)?.subcategories || []
    : [];
  
  const validateUrl = (value) => {
    if (!value) {
      setUrlError('URL es requerida');
      return false;
    }
    
    // Enhanced URL validation with specific checks for Instagram
    if (value.includes('instagram.com')) {
      // Check if URL contains /reel/ or /p/ in the path for Instagram
      if (!value.includes('/reel/') && !value.includes('/p/')) {
        setUrlError('Para Instagram, debes ingresar la URL de un reel o post específico, no un perfil. Ejemplo: instagram.com/reel/XYZ123');
        return false;
      }
    }
    
    // Base URL validation - can be expanded as needed
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|instagram\.com|tiktok\.com)\/[^\s]+$/;
    if (!urlPattern.test(value)) {
      setUrlError('URL inválida. Debe ser de YouTube, Instagram o TikTok');
      return false;
    }
    
    setUrlError('');
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateUrl(url)) {
      onSubmit({
        url,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null
      });
    }
  };
  
  // Helper to show transcript counts if available
  const getCategoryLabel = (category) => {
    const count = categoryStats[category.id] || 0;
    return `${category.name} ${count ? `(${count})` : ''}`;
  };
  
  const getSubcategoryLabel = (subcat) => {
    const count = categoryStats[`${categoryId}_${subcat.id}`] || 0;
    return `${subcat.name} ${count ? `(${count})` : ''}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <h3 className="text-xl font-semibold">Video de referencia</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="URL del video"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => validateUrl(url)}
              errorMessage={urlError}
              startContent={<LinkIcon className="w-4 h-4 text-gray-400" />}
              isRequired
            />
            <p className="text-xs text-gray-500 mt-1">
              Introduce la URL de un video específico:
              <br />• Instagram: URL de un reel o post (ej: instagram.com/reel/xyz123)
              <br />• YouTube: URL de un video completo (no shorts o canales)
              <br />• TikTok: URL de un video específico
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoría (opcional)"
              placeholder="Selecciona una categoría"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full"
            >
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </Select>
            
            <Select
              label="Subcategoría (opcional)"
              placeholder={categoryId ? "Selecciona una subcategoría" : "Selecciona primero una categoría"}
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              isDisabled={!categoryId || subcategories.length === 0}
              className="w-full"
            >
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {getSubcategoryLabel(subcategory)}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div className="pt-2">
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              isDisabled={isLoading || !url}
              className="w-full"
            >
              {isLoading ? 'Analizando...' : 'Analizar Video'}
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              El análisis puede tardar hasta 1 minuto en completarse.
            </p>
          </div>
        </form>
      </CardBody>
    </Card>
  );
} 