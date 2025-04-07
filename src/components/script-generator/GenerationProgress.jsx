'use client'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider,
  CircularProgress
} from "@heroui/react";
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function GenerationProgress({ title = '' }) {
  const steps = [
    "Analizando respuestas...",
    "Preparando el estilo y tono...",
    "Creando estructura del script...",
    "Generando contenido principal...",
    "Añadiendo elementos de conexión...",
    "Refinando la introducción y conclusión...",
    "Aplicando formato final..."
  ];
  
  // Randomly select a step to display - in a real app, this would be based on actual progress
  const currentStep = steps[Math.floor(Math.random() * steps.length)];
  
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 items-center">
        <DocumentTextIcon className="w-6 h-6 text-violet-500" />
        <h3 className="text-xl font-semibold">Generando tu script</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex flex-col items-center justify-center py-10">
          <CircularProgress 
            aria-label="Generando script..." 
            size="lg"
            value={80}
            showValueLabel={false}
            classNames={{
              svg: "w-20 h-20",
              indicator: "stroke-violet-600",
              track: "stroke-violet-100",
            }}
          />
          
          {title && (
            <p className="mt-4 text-center text-lg font-medium text-gray-800">
              {title}
            </p>
          )}
          
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep}
          </p>
          
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-center text-sm text-gray-500">
              Estamos generando un script personalizado basado en el video de referencia
              y tus respuestas. Este proceso puede tardar hasta 1 minuto.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 