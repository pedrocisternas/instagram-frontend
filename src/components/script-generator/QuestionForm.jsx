'use client'
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Textarea, 
  Button, 
  Accordion, 
  AccordionItem,
  Input,
  CircularProgress
} from "@heroui/react";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function QuestionForm({ 
  questions = [], 
  isLoading = false,
  onSubmit, 
  onGenerateQuestions
}) {
  const [answers, setAnswers] = useState([]);
  const [title, setTitle] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Initialize answers when questions change
  useEffect(() => {
    if (questions && questions.length > 0) {
      setAnswers(questions.map(q => ({ 
        question: q.question, 
        answer: '' 
      })));
    } else {
      setAnswers([]);
    }
  }, [questions]);
  
  // Validate form whenever answers change
  useEffect(() => {
    const valid = title.trim().length > 0 && 
      answers.length > 0 && 
      answers.every(a => a.answer.trim().length > 0);
    setIsFormValid(valid);
  }, [answers, title]);
  
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = value;
    setAnswers(newAnswers);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormValid) {
      onSubmit({ title, answers });
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <h3 className="text-xl font-semibold">Generando preguntas</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col items-center justify-center py-6">
            <CircularProgress 
              aria-label="Generando preguntas..." 
              size="lg"
              classNames={{
                svg: "w-16 h-16",
                indicator: "stroke-blue-500",
                track: "stroke-blue-100",
              }}
            />
            <p className="mt-4 text-center text-sm text-gray-600">
              Generando preguntas de personalización basadas en el análisis del video.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }
  
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3 items-center">
          <QuestionMarkCircleIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Personalización</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-center text-sm text-gray-600 mb-4">
              Se necesitan generar preguntas de personalización para continuar.
            </p>
            <Button 
              color="primary" 
              onClick={onGenerateQuestions}
            >
              Generar preguntas
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 items-center">
        <QuestionMarkCircleIcon className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-semibold">Personalización del script</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Título del script"
            placeholder="Ingresa un título para tu script"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isRequired
          />
          
          <div className="space-y-4">
            <h4 className="text-md font-medium">Responde a las siguientes preguntas:</h4>
            
            <Accordion className="w-full" variant="bordered">
              {questions.map((question, index) => (
                <AccordionItem 
                  key={index} 
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span>{question.question}</span>
                      {answers[index]?.answer ? (
                        <span className="text-xs text-green-500 px-2 py-1 rounded-full bg-green-50">
                          Respondida
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500 px-2 py-1 rounded-full bg-amber-50">
                          Pendiente
                        </span>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-3 px-2">
                    {question.context && (
                      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                        <p className="font-medium mb-1">Contexto:</p>
                        <p>{question.context}</p>
                      </div>
                    )}
                    
                    <Textarea
                      label="Tu respuesta"
                      placeholder="Escribe tu respuesta aquí..."
                      value={answers[index]?.answer || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      minRows={3}
                      isRequired
                    />
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit"
              color="primary" 
              isDisabled={!isFormValid}
              className="w-full"
            >
              Generar script
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Basado en tus respuestas, generaremos un script personalizado.
            </p>
          </div>
        </form>
      </CardBody>
    </Card>
  );
} 