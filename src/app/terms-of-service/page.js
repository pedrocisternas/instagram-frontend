'use client'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Términos y Condiciones del Servicio</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">1. Aceptación de los Términos</h2>
            <p className="mb-6 text-gray-600">
              Al acceder y utilizar Instagram Analytics Dashboard, usted acepta estar legalmente vinculado por estos términos y condiciones. 
              Si no está de acuerdo con alguno de estos términos, no debe utilizar el servicio.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Descripción del Servicio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Funcionalidades principales:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Análisis de métricas de Instagram Business</li>
                  <li>Generación de reportes personalizados</li>
                  <li>Seguimiento de rendimiento de contenido</li>
                  <li>Análisis de tendencias y patrones</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Limitaciones:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Uso exclusivo para cuentas de Instagram Business</li>
                  <li>Sujeto a límites de la API de Meta</li>
                  <li>Análisis basado en datos disponibles públicamente</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">3. Cuentas y Autenticación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Requisitos:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Cuenta activa de Instagram Business</li>
                  <li>Autorización mediante Facebook Login</li>
                  <li>Permisos necesarios concedidos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">Responsabilidades:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Mantener credenciales seguras</li>
                  <li>Uso personal e intransferible</li>
                  <li>Notificar accesos no autorizados</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">4. Propiedad Intelectual</h2>
            <p className="mb-6 text-gray-600">
              Todos los derechos de propiedad intelectual sobre el servicio y su contenido son propiedad de Instagram Analytics Dashboard.
              Los datos analizados pertenecen a sus respectivos propietarios según los términos de Meta.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">5. Limitación de Responsabilidad</h2>
            <p className="mb-6 text-gray-600">
              El servicio se proporciona "tal cual" y no garantizamos su disponibilidad ininterrumpida.
              No nos hacemos responsables de decisiones tomadas basadas en los análisis proporcionados.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">6. Modificaciones</h2>
            <p className="mb-6 text-gray-600">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación.
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