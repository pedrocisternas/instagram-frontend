import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const InsightsPanel = ({ insights, currentTimeRange }) => {
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

  // Obtener solo el insight correspondiente al timeRange actual
  const currentInsight = insights[currentTimeRange];

  if (!currentInsight?.content) {
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

  const { positive, negative } = currentInsight.content;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Insights</h2>
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
