'use client'
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
} from "@heroui/react";

export default function AnalysisResultsView({
  analysisData,
  onGenerateScript,
  onStartOver
}) {
  // Log the incoming data for debugging
  console.log("[AnalysisResultsView] Received analysisData:", {
    summaryType: typeof analysisData?.summary,
    summaryLength: analysisData?.summary?.length || 0,
    transcriptType: typeof analysisData?.transcript,
    transcriptLength: analysisData?.transcript?.length || 0
  });
  
  // Ensure we have data to display
  if (!analysisData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-xl font-semibold">No hay datos de análisis</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-gray-600 mb-4">
            No se encontraron resultados del análisis. Puede que haya ocurrido un error.
          </p>
          <Button color="primary" onClick={onStartOver}>
            Intentar con otro video
          </Button>
        </CardBody>
      </Card>
    );
  }
  
  // Process the summary to ensure it's a string
  const summaryText = (() => {
    if (!analysisData.summary) return "No hay resumen disponible";
    if (typeof analysisData.summary === 'string') return analysisData.summary;
    if (typeof analysisData.summary === 'object') {
      // Try to extract content if it's an object
      return analysisData.summary.content || JSON.stringify(analysisData.summary);
    }
    return String(analysisData.summary);
  })();
  
  // Process the transcript to ensure it's a string
  const transcriptText = (() => {
    if (!analysisData.transcript) return "No hay transcripción disponible";
    if (typeof analysisData.transcript === 'string') return analysisData.transcript;
    if (typeof analysisData.transcript === 'object') {
      // Try to extract content if it's an object
      return analysisData.transcript.content || JSON.stringify(analysisData.transcript);
    }
    return String(analysisData.transcript);
  })();

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-xl font-semibold">Análisis Completado</h3>
        <p className="text-sm text-gray-600 mt-1">
          Estos son los resultados del análisis de tu video de referencia
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="py-6">
        <div className="space-y-6">
          {/* Resumen Breve */}
          <div>
            <h4 className="font-medium mb-2">Resumen del video:</h4>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {summaryText}
            </div>
          </div>
          
          {/* Transcripción */}
          <div>
            <h4 className="font-medium mb-2">Transcripción:</h4>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {transcriptText}
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button
            color="primary"
            className="w-full"
            onClick={onGenerateScript}
          >
            Generar Script
          </Button>
          
          <Button
            color="secondary"
            className="w-full"
            onClick={onStartOver}
          >
            Analizar otro video
          </Button>
        </div>
      </CardBody>
    </Card>
  );
} 