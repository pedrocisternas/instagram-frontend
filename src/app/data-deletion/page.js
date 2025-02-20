'use client'

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Política de Eliminación de Datos</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">1. Solicitud de Eliminación</h2>
            <p className="mb-6 text-gray-600">
              Los usuarios pueden solicitar la eliminación completa de sus datos personales y de análisis 
              almacenados en nuestra plataforma. Este proceso es irreversible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Datos que se eliminarán:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Métricas y análisis almacenados</li>
                  <li>Historial de reportes generados</li>
                  <li>Preferencias y configuraciones</li>
                  <li>Datos de autenticación</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Proceso de eliminación:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Verificación de identidad</li>
                  <li>Confirmación por correo electrónico</li>
                  <li>Eliminación en 30 días</li>
                  <li>Notificación de completado</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Cómo Solicitar la Eliminación</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="mb-4 text-gray-700">Para solicitar la eliminación de sus datos, puede:</p>
              <ol className="list-decimal pl-6 space-y-4 text-gray-600">
                <li>
                  <strong>Enviar un correo electrónico:</strong>
                  <br />
                  Dirija su solicitud a{' '}
                  <a href="mailto:pedrocisternas86@gmail.com" className="text-blue-600 hover:text-blue-800">
                  pedrocisternas86@gmail.com
                  </a>
                  {' '}con el asunto "Solicitud de Eliminación de Datos"
                </li>
                <li>
                  <strong>Incluir información de verificación:</strong>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Nombre completo</li>
                    <li>Correo electrónico asociado</li>
                    <li>Nombre de usuario de Instagram</li>
                  </ul>
                </li>
              </ol>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">3. Plazos y Confirmación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Proceso:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Confirmación de recepción en 24-48 horas</li>
                  <li>Verificación de identidad en 1-3 días</li>
                  <li>Proceso de eliminación en 30 días</li>
                  <li>Confirmación final por correo</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Garantías:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Eliminación completa y permanente</li>
                  <li>Cumplimiento de normativas de privacidad</li>
                  <li>Documentación del proceso</li>
                  <li>Certificado de eliminación disponible</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">4. Información Adicional</h2>
            <p className="mb-6 text-gray-600">
              La eliminación de datos es un derecho protegido por las leyes de privacidad. 
              Este proceso cumple con el GDPR y otras regulaciones de protección de datos aplicables.
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