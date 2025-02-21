import Image from 'next/image';

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">PIRU SpA</h1>
            <p className="text-xl text-gray-600">Soluciones integrales en tecnología y marketing digital</p>
          </div>

          {/* Founder Section */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={"/images/founder.jpg"}
                  alt="Pedro Cisternas - Founder"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Pedro Cisternas</h2>
              <h3 className="text-xl text-purple-600 mb-6">Founder & CEO</h3>
              <p className="text-gray-600 mb-6">
                Emprendedor tecnológico y fundador de PIRU SpA. Creador de Piru Analytics, 
                una herramienta innovadora para el análisis de contenido en Instagram.
              </p>
            </div>
          </div>

          {/* Company Description */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-8">Sobre Nosotros</h2>
            <p className="mb-6">
              PIRU SpA es una empresa de tecnología y marketing digital que ofrece soluciones 
              integrales para empresas que buscan destacar en el mundo digital. Nos especializamos 
              en el desarrollo de software personalizado, sitios web y aplicaciones móviles, 
              complementando estos servicios con asesorías expertas en transformación digital.
            </p>
            
            <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
            <p className="mb-6">
              Impulsar el crecimiento de nuestros clientes a través de servicios innovadores 
              en el ámbito digital, proporcionando soluciones tecnológicas de vanguardia y 
              estrategias de marketing efectivas.
            </p>
            
            <h3 className="text-2xl font-bold mb-4">Nuestros Servicios</h3>
            <ul className="list-disc pl-6 mb-6">
              <li>Desarrollo de software y aplicaciones personalizadas</li>
              <li>Creación de sitios web y aplicaciones móviles</li>
              <li>Asesoría en transformación digital</li>
              <li>Gestión de campañas publicitarias en redes sociales</li>
              <li>Marketing de influencers</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4">Piru Analytics</h3>
            <p className="mb-6">
              Nuestra herramienta estrella, Piru Analytics, representa nuestra visión de 
              innovación en el análisis de contenido digital. Diseñada específicamente para 
              Instagram, ofrece insights profundos y análisis detallados que ayudan a 
              optimizar estrategias de contenido y maximizar el engagement.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}