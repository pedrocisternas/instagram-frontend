'use client'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Política de Privacidad</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">1. Información que Recopilamos</h2>
            <p className="mb-6 text-gray-600">A través de la API de Instagram Business, recopilamos:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Métricas de rendimiento de publicaciones:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Número de visualizaciones</li>
                  <li>Interacciones (likes, comentarios)</li>
                  <li>Acciones de engagement (guardados, compartidos)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Metadatos de publicaciones:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Tipo de contenido (imagen, video, carrusel)</li>
                  <li>Fecha y hora de publicación</li>
                  <li>Textos y descripciones</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Uso de la Información</h2>
            <p className="mb-6 text-gray-600">La información recopilada se utiliza para:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Análisis de rendimiento:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Generación de estadísticas detalladas</li>
                  <li>Análisis de tendencias temporales</li>
                  <li>Evaluación de engagement por tipo de contenido</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Optimización de contenido:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Identificación de patrones de éxito</li>
                  <li>Recomendaciones basadas en datos</li>
                  <li>Análisis de mejores horarios de publicación</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">3. Almacenamiento y Seguridad de Datos</h2>
            <p className="mb-6 text-gray-600">Utilizamos Supabase, una plataforma de base de datos segura y moderna, que implementa:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Medidas de seguridad:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Encriptación AES-256 para datos en reposo</li>
                  <li>Encriptación SSL/TLS para datos en tránsito</li>
                  <li>Autenticación de múltiples factores (MFA)</li>
                  <li>Control de acceso basado en roles (RBAC)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Prácticas de protección:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Backups automáticos diarios</li>
                  <li>Aislamiento de datos por usuario</li>
                  <li>Monitoreo continuo de seguridad</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">4. Servicios de Terceros</h2>
            <p className="mb-6 text-gray-600">Nuestra aplicación integra los siguientes servicios:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Meta Business API:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Acceso autorizado a datos de Instagram</li>
                  <li>Autenticación OAuth 2.0</li>
                  <li>Tokens de acceso seguros</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Supabase:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Almacenamiento seguro de datos</li>
                  <li>Gestión de autenticación</li>
                  <li>Análisis en tiempo real</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">5. Sus Derechos y Control</h2>
            <p className="mb-6 text-gray-600">Como usuario, usted tiene derecho a:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Acceso y transparencia:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Solicitar una copia de sus datos almacenados</li>
                  <li>Conocer qué información específica se recopila</li>
                  <li>Saber cómo se utiliza su información</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Control de datos:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Revocar el acceso a su cuenta de Instagram</li>
                  <li>Solicitar la eliminación de sus datos</li>
                  <li>Actualizar sus preferencias de privacidad</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">6. Contacto</h2>
            <p className="text-gray-600">
              Para cualquier consulta sobre esta política de privacidad o sus datos, puede contactarnos a través de:
              <a href="mailto:pedrocisternas86@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
              pedrocisternas86@gmail.com
              </a>
            </p>
          </section>

          <footer className="text-sm text-gray-500 border-t pt-4">
            <p>Última actualización: {new Date().toLocaleDateString()}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}