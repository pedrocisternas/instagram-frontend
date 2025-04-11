'use client'
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Textarea, 
  Button, 
  Spinner,
  Progress,
} from "@heroui/react";

// Three predefined questions in Spanish
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "¿Hay alguna parte específica del video de referencia que te gustaría enfatizar en tu script?",
    placeholder: "Por ejemplo: me gustaría enfocarme más en la explicación técnica del tema..."
  },
  {
    id: 2,
    question: "¿Qué elementos de tu propio estilo consideras importante mantener en este script?",
    placeholder: "Por ejemplo: siempre uso preguntas retóricas, hablo en primera persona..."
  },
  {
    id: 3,
    question: "¿Hay algo específico que quieras hacer diferente respecto al video de referencia?",
    placeholder: "Por ejemplo: prefiero un tono más casual, quiero incluir más ejemplos prácticos..."
  }
];

export default function AnalysisQuestionsSection({ 
  isAnalyzing = false,
  analysisProgress = 0,
  onSubmitAnswers,
  analysisData = null,
  onContinue = null
}) {
  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
    question3: ""
  });
  
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [`question${questionId}`]: value
    }));
  };
  
  const handleSubmit = () => {
    // Format answers for submission
    const formattedAnswers = [
      { 
        questionId: 1,
        question: DEFAULT_QUESTIONS[0].question,
        answer: answers.question1 
      },
      {
        questionId: 2,
        question: DEFAULT_QUESTIONS[1].question,
        answer: answers.question2
      },
      {
        questionId: 3,
        question: DEFAULT_QUESTIONS[2].question,
        answer: answers.question3
      }
    ];
    
    onSubmitAnswers(formattedAnswers);
  };
  
  const isFormValid = answers.question1.trim() !== "" && 
                     answers.question2.trim() !== "" && 
                     answers.question3.trim() !== "";
  
  // Render the left panel content based on analysis state
  const renderLeftPanel = () => {
    if (isAnalyzing) {
      // Analysis in progress
      return (
        <>
          <CardHeader>
            <h2 className="text-xl font-bold">Analizando Video</h2>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col items-center justify-center py-10">
            <Spinner size="xl" className="mb-4" />
            <p className="text-gray-600 mb-4">
              Estamos analizando el video de referencia. Este proceso puede tomar hasta 1 minuto.
            </p>
            
            <div className="w-full mt-4">
              <Progress 
                value={analysisProgress} 
                label={`${analysisProgress}% completado`}
                showValueLabel={true}
                size="md"
                className="max-w-md"
              />
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <h3 className="font-medium mb-2">Procesos en ejecución:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Extracción de transcripción</li>
                <li>Análisis de contenido con Gemini AI</li>
                <li>Recopilación de tus transcripciones anteriores</li>
              </ul>
            </div>
          </CardBody>
        </>
      );
    } else if (analysisData) {
      // Analysis complete - show condensed results
      return (
        <>
          <CardHeader>
            <h2 className="text-xl font-bold">Análisis Completado</h2>
          </CardHeader>
          <Divider />
          <CardBody className="py-6">
            <h3 className="font-semibold text-md mb-2">Resumen:</h3>
            <p className="text-gray-600 mb-4 text-sm line-clamp-4">
              {analysisData.description || "No hay descripción disponible"}
            </p>
            
            <h3 className="font-semibold text-md mb-2">Elementos clave:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              {Array.isArray(analysisData.key_elements) && analysisData.key_elements.length > 0 ? 
                analysisData.key_elements.slice(0, 3).map((element, idx) => (
                  <li key={idx} className="line-clamp-1">{element}</li>
                )) : 
                <li>No se encontraron elementos clave</li>
              }
              {(analysisData.key_elements?.length > 3) && 
                <li className="text-gray-500">...y {analysisData.key_elements.length - 3} más</li>
              }
            </ul>
            
            {onContinue && (
              <Button 
                color="primary"
                className="w-full mt-4"
                onClick={onContinue}
              >
                Continuar al siguiente paso
              </Button>
            )}
          </CardBody>
        </>
      );
    } else {
      // Fallback case (should not happen)
      return (
        <>
          <CardHeader>
            <h2 className="text-xl font-bold">Análisis</h2>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-600">
              Estado del análisis desconocido.
            </p>
          </CardBody>
        </>
      );
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column - Analysis Progress or Results */}
      <Card>
        {renderLeftPanel()}
      </Card>
      
      {/* Right column - Questions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Personaliza tu script</h2>
        </CardHeader>
        <Divider />
        <CardBody className="py-6">
          <p className="text-gray-600 mb-4">
            {isAnalyzing 
              ? "Mientras analizamos el video, responde estas preguntas para personalizar tu script:"
              : "Responde estas preguntas para personalizar tu script en base al análisis:"}
          </p>
          
          <div className="space-y-6">
            {DEFAULT_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {q.question}
                </label>
                <Textarea
                  placeholder={q.placeholder}
                  value={answers[`question${q.id}`]}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  minRows={3}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button 
              color="primary"
              isDisabled={!isFormValid || isAnalyzing}
              className="w-full"
              onClick={handleSubmit}
            >
              {isAnalyzing ? "Espera a que se complete el análisis" : "Guardar respuestas"}
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
              {isAnalyzing 
                ? "Podrás continuar cuando el análisis se complete" 
                : "Tus respuestas ayudarán a generar un script que refleje tu estilo"}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 