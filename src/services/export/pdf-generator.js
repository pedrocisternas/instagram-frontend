import { MEDIA_TYPES } from '@/utils/mediaTypes';
import { formatDate } from '@/utils/dateFormatters';

/**
 * Genera un PDF con la información de los posts seleccionados
 * 
 * @param {Object} options - Opciones para la generación del PDF
 * @param {Array} options.posts - Array de posts a incluir en el PDF
 * @param {Array} options.categories - Array de categorías para relacionar con los posts
 * @param {string} options.username - Nombre de usuario para incluir en el PDF
 * @returns {Promise<void>} - Promise que resuelve cuando el PDF ha sido generado y descargado
 */
export const generatePostsPDF = async ({ posts, categories, username }) => {
  if (posts.length === 0) {
    throw new Error('Por favor, selecciona al menos un post para exportar');
  }
  
  // Importamos dinámicamente jsPDF y autoTable
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  
  // Creamos el documento PDF
  const doc = new jsPDF();
  
  // Agregamos el logo en la esquina superior izquierda
  try {
    // Cargamos el logo usando fetch
    const response = await fetch('/images/logo.png');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Convertimos la respuesta a un blob y luego a una URL
    const blob = await response.blob();
    const logoUrl = URL.createObjectURL(blob);
    
    // Cargamos la imagen desde la URL
    const logo = new Image();
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = (e) => {
        console.error('Error al cargar la imagen desde blob:', e);
        reject(e);
      };
      logo.src = logoUrl;
    });
    
    // Agregamos el logo en la esquina superior izquierda (coordenadas x, y, ancho, alto)
    doc.addImage(logo, 'PNG', 14, 10, 25, 25);
    
    // Liberamos la URL del objeto
    URL.revokeObjectURL(logoUrl);
    
    console.log('Logo añadido exitosamente al PDF');
  } catch (logoError) {
    console.error('Error cargando el logo:', logoError);
    // Continuamos sin el logo en caso de error
  }
  
  // Agregamos título y fecha
  doc.setFontSize(18);
  doc.text('Reporte de Métricas de Instagram', 50, 22);
  
  doc.setFontSize(11);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 50, 30);
  doc.text(`Usuario: ${username}`, 50, 36);
  doc.text(`Total posts seleccionados: ${posts.length}`, 50, 42);
  
  // Creamos la tabla de métricas con autoTable
  autoTable(doc, {
    startY: 50,
    head: [['Publicación', 'Tipo', 'Categoría', 'Fecha', 'Views', 'Likes', 'Saves', 'Shares', 'Comments']],
    body: posts.map(post => [
      post.caption?.substring(0, 30) || 'Sin caption',
      MEDIA_TYPES.find(type => type.value === post.media_type)?.label || post.media_type,
      categories.find(c => c.id === post.category_id)?.name || 'Sin categoría',
      formatDate(post.published_at),
      post.views?.toLocaleString() || '0',
      post.likes?.toLocaleString() || '0',
      post.saves?.toLocaleString() || '0',
      post.shares?.toLocaleString() || '0',
      post.comments?.toLocaleString() || '0'
    ]),
    headStyles: {
      fillColor: [147, 83, 211],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Calculamos totales y promedios
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalSaves = posts.reduce((sum, post) => sum + (post.saves || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
  
  const avgViews = Math.round(totalViews / posts.length);
  const avgLikes = Math.round(totalLikes / posts.length);
  const avgSaves = Math.round(totalSaves / posts.length);
  const avgShares = Math.round(totalShares / posts.length);
  const avgComments = Math.round(totalComments / posts.length);
  
  // Agregar sección de resumen
  const finalY = doc.lastAutoTable.finalY || 100;
  
  doc.setFontSize(14);
  doc.text('Resumen de métricas', 50, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Métrica', 'Total', 'Promedio por publicación']],
    body: [
      ['Views', totalViews.toLocaleString(), avgViews.toLocaleString()],
      ['Likes', totalLikes.toLocaleString(), avgLikes.toLocaleString()],
      ['Saves', totalSaves.toLocaleString(), avgSaves.toLocaleString()],
      ['Shares', totalShares.toLocaleString(), avgShares.toLocaleString()],
      ['Comments', totalComments.toLocaleString(), avgComments.toLocaleString()]
    ],
    headStyles: {
      fillColor: [107, 33, 168],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    }
  });
  
  // Guardar el PDF
  doc.save(`instagram_metrics_${new Date().toISOString().split('T')[0]}.pdf`);
}; 