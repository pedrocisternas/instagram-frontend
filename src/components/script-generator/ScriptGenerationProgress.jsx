'use client'
import { Card, CardBody, CardHeader, Spinner, Divider } from "@heroui/react";

export default function ScriptGenerationProgress() {
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <h3 className="text-xl font-semibold">Generando Guión</h3>
      </CardHeader>
      <Divider />
      <CardBody className="text-center py-10">
        <Spinner size="lg" color="primary" className="mx-auto" />
        <p className="mt-6 text-lg">Estamos generando un guión personalizado basado en tu estilo y el video de referencia...</p>
        <p className="text-sm text-gray-500 mt-3">
          Esto puede tomar hasta un minuto. Por favor, espera mientras nuestro sistema de inteligencia artificial crea un guión adaptado a tu contenido.
        </p>
      </CardBody>
    </Card>
  );
} 