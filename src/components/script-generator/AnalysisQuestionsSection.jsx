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
    
    // First save the answers
    onSubmitAnswers(formattedAnswers);
    
    // Then continue if analysis is complete and we have a continue function
    if (!isAnalyzing && onContinue) {
      onContinue();
    }
  };
  
  const isFormValid = answers.question1.trim() !== "" && 
                     answers.question2.trim() !== "" && 
                     answers.question3.trim() !== "";
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Personaliza tu script</h3>
        <p className="text-sm text-gray-600">
          Responde estas preguntas para crear un script que refleje tu estilo personal.
        </p>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="py-6">
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
            {isAnalyzing ? "Espera a que se complete el análisis" : "Continuar"}
          </Button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            {isAnalyzing 
              ? "Podrás continuar cuando el análisis se complete" 
              : "El análisis está completo. Continúa para ver los resultados."}
          </p>
        </div>
      </CardBody>
    </Card>
  );
} 