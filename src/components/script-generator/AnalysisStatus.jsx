'use client'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Progress, 
  Divider,
  Chip,
  Button
} from "@heroui/react";
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AnalysisStatus({ 
  isAnalyzing, 
  analysis = null,
  onContinue,
  onRetry
}) {
  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <h3 className="text-xl font-semibold">Analizando video</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-4">
            <Progress 
              isIndeterminate
              aria-label="Analizando..." 
              classNames={{
                indicator: "bg-gradient-to-r from-blue-500 to-indigo-500",
              }}
            />
            <p className="text-center text-sm text-gray-600">
              Analizando el contenido del video. Este proceso puede tardar hasta 1 minuto.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Extrayendo audio y contenido visual</p>
              <p>• Identificando estilo y estructura</p>
              <p>• Preparando preguntas de personalización</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <h3 className="text-xl font-semibold">Error en el análisis</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              No se pudo completar el análisis del video. Por favor, intenta nuevamente.
            </p>
            <Button 
              color="primary" 
              variant="flat" 
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              onClick={onRetry}
              className="mx-auto"
            >
              Reintentar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 items-center">
        <CheckCircleIcon className="w-6 h-6 text-green-500" />
        <h3 className="text-xl font-semibold">Análisis completado</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium mb-2">Descripción</h4>
            <p className="text-sm text-gray-700">
              {analysis.description || "No se proporcionó una descripción"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Elementos clave</h4>
              <div className="flex flex-wrap gap-1">
                {analysis.key_elements && analysis.key_elements.length > 0 ? (
                  analysis.key_elements.map((element, index) => (
                    <Chip key={index} color="primary" variant="flat" size="sm">
                      {element}
                    </Chip>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No se identificaron elementos clave</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-2">Características</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Duración:</span> {analysis.total_duration || 0}s</p>
                <p><span className="font-medium">Escenas:</span> {analysis.number_of_shots || 1}</p>
                <p>
                  <span className="font-medium">Audio:</span>{" "}
                  {analysis.audio_types?.join(", ") || "No detectado"}
                </p>
                <p>
                  <span className="font-medium">Texto:</span>{" "}
                  {analysis.text_types?.join(", ") || "No detectado"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              color="primary" 
              onClick={onContinue}
              className="w-full"
            >
              Continuar con la generación
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 