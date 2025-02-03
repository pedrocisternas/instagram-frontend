export default function MetricWithDiff({ label, value, diff, formatter = (val) => val?.toLocaleString() }) {
    return (
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span>{formatter(value)}</span>
          {diff !== undefined && (
            <div className={`flex items-center ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {diff >= 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm ml-1">
                {Math.abs(diff).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }