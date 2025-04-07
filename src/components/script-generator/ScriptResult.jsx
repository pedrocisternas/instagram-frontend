'use client'
import { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  Divider,
  Button,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  useDisclosure
} from "@heroui/react";
import { 
  DocumentTextIcon, 
  ClipboardDocumentIcon, 
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function ScriptResult({ 
  script = null, 
  onRegenerate,
  onStartNew
}) {
  const [copied, setCopied] = useState(false);
  const [expandSection, setExpandSection] = useState(null);
  
  if (!script) {
    return (
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <h3 className="text-xl font-semibold">Error</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-center text-sm text-gray-600">
            No se encontró ningún script generado. Por favor, vuelve a intentarlo.
          </p>
        </CardBody>
      </Card>
    );
  }
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };
  
  const toggleSection = (section) => {
    if (expandSection === section) {
      setExpandSection(null);
    } else {
      setExpandSection(section);
    }
  };
  
  // Format script sections
  const sections = script.sections || {
    introduction: script.content.substring(0, 200),
    main_content: script.content.substring(200),
    conclusion: '',
    notes: ''
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-semibold">Script generado</h3>
        </div>
        <div className="flex gap-2">
          <Tooltip content={copied ? "¡Copiado!" : "Copiar script"}>
            <Button
              isIconOnly
              variant="flat"
              color={copied ? "success" : "default"}
              onPress={handleCopy}
              aria-label="Copiar script"
            >
              {copied ? (
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5" />
              )}
            </Button>
          </Tooltip>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{script.title}</h2>
            
            {script.metadata && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {script.metadata.word_count && (
                  <Chip size="sm" variant="flat" color="primary">
                    {script.metadata.word_count} palabras
                  </Chip>
                )}
                {script.metadata.estimated_duration && (
                  <Chip size="sm" variant="flat" color="secondary">
                    ~{script.metadata.estimated_duration} min
                  </Chip>
                )}
              </div>
            )}
          </div>
          
          <Tabs aria-label="Script sections">
            <Tab key="full" title="Script completo">
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm font-mono">
                {script.content}
              </div>
            </Tab>
            <Tab key="sections" title="Por secciones">
              <div className="space-y-4">
                {Object.entries(sections).map(([key, content]) => content && (
                  <div key={key} className="border rounded-md overflow-hidden">
                    <div 
                      className="flex items-center justify-between bg-gray-50 p-3 cursor-pointer"
                      onClick={() => toggleSection(key)}
                    >
                      <h4 className="font-medium capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <Button 
                        isIconOnly 
                        variant="light" 
                        size="sm"
                        aria-label={expandSection === key ? "Colapsar" : "Expandir"}
                      >
                        {expandSection === key ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {(expandSection === key || key === 'introduction') && (
                      <div className="p-3 whitespace-pre-wrap text-sm">
                        {content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between">
        <Button 
          variant="flat" 
          color="default"
          startContent={<ArrowPathIcon className="w-4 h-4" />}
          onPress={onRegenerate}
        >
          Regenerar
        </Button>
        <Button 
          color="primary"
          onPress={onStartNew}
        >
          Crear nuevo script
        </Button>
      </CardFooter>
    </Card>
  );
} 