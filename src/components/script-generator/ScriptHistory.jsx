'use client'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider,
  Button,
  Chip
} from "@heroui/react";
import { 
  ClockIcon, 
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/dateFormatters';

export default function ScriptHistory({ 
  scripts = [], 
  isLoading = false,
  onSelect,
  onRefresh
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Scripts generados</h3>
        </div>
        <Button
          size="sm"
          variant="flat"
          startContent={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onPress={onRefresh}
          isDisabled={isLoading}
        >
          Actualizar
        </Button>
      </CardHeader>
      <Divider />
      <CardBody>
        {scripts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              No has generado ningún script todavía.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {scripts.map((script) => (
              <div 
                key={script.id} 
                className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col gap-2"
                onClick={() => onSelect(script.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium line-clamp-1">
                      {script.title}
                    </h4>
                  </div>
                  <Chip size="sm" variant="flat">
                    {formatDate(script.created_at)}
                  </Chip>
                </div>
                {script.reference_url && (
                  <p className="text-xs text-gray-500 truncate">
                    Referencia: {script.reference_url}
                  </p>
                )}
                {script.metadata && (
                  <div className="flex gap-2">
                    {script.metadata.word_count && (
                      <Chip size="sm" variant="dot" color="primary">
                        {script.metadata.word_count} palabras
                      </Chip>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
} 