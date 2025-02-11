export default function CompactMetricDiff({ diff, baseValue, visible = true }) {
  if (diff === null || diff === undefined) return null;

  const formattedDiff = diff.toFixed(1);
  const isPositive = diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="relative group">
      {visible ? (
        <span className={`
          inline-flex items-center px-2 py-1 rounded text-sm font-medium
          ${isPositive ? 'bg-green-100 text-green-800' : ''}
          ${isNeutral ? 'bg-gray-100 text-gray-800' : ''}
          ${!isPositive && !isNeutral ? 'bg-red-100 text-red-800' : ''}
        `}>
          {isPositive ? '+' : ''}{formattedDiff}%
        </span>
      ) : (
        // Placeholder invisible para mantener el espacio
        <span className="invisible inline-flex items-center px-2 py-1 rounded text-sm font-medium">
          +00.0%
        </span>
      )}
      
      {/* Tooltip (solo visible cuando el componente es visible) */}
      {baseValue !== undefined && visible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
          <div className="bg-primary text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Valor: {typeof baseValue === 'number' ? baseValue.toLocaleString() : baseValue}
          </div>
          {/* Flecha del tooltip */}
          {/* <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-solid border-4 border-transparent border-t-white-900"></div>
          </div> */}
        </div>
      )}
    </div>
  );
}