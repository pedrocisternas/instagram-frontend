import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const InsightsPanel = ({ insights, currentTimeRange, isGenerating }) => {
  // Loading state con robot giratorio
  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Insights</h2>
        </div>
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
          <CpuChipIcon className="w-12 h-12 text-secondary-500 animate-spin" />
          <div className="space-y-2">
            <div className="h-4 bg-secondary-100 rounded animate-pulse w-48"></div>
            <div className="h-4 bg-secondary-100 rounded animate-pulse w-36"></div>
          </div>
          <p className="text-sm text-secondary-600">Generando insights con IA...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Insights</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500">No hay insights disponibles</p>
        </div>
      </div>
    );
  }

  // Obtener el insight del período actual
  const currentInsight = insights[currentTimeRange]?.insights;
  console.log('[InsightsPanel] Current insight:', { currentTimeRange, currentInsight });

  if (!currentInsight?.positive && !currentInsight?.negative) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Insights</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500">No hay insights disponibles para este período</p>
        </div>
      </div>
    );
  }

  const { positive, negative } = currentInsight;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Insights</h2>
        {currentInsight.summary && (
          <p className="text-sm text-gray-600 mt-1">{currentInsight.summary}</p>
        )}
      </div>
      
      <div className="p-4 hover:bg-gray-50">
        {/* Insights positivos */}
        {positive?.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700">Aspectos Positivos</span>
            </div>
            <ul className="space-y-1 pl-7">
              {positive.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-600 list-disc">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insights negativos */}
        {negative?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-700">Áreas de Mejora</span>
            </div>
            <ul className="space-y-1 pl-7">
              {negative.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-600 list-disc">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
