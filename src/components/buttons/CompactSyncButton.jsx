import { Button } from "@heroui/react";
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '@/utils/dateFormatters';

export default function CompactSyncButton({ isSyncing, onSync, lastUpdate }) {
  return (
    <div className="flex flex-col items-center">
      <Button
        color="primary"
        onPress={onSync}
        className="w-12 h-12 p-0 min-w-0"
        title="Sincronizar métricas"
        isIconOnly
      >
        <ArrowPathIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
      {lastUpdate && (
        <span className="text-[10px] text-gray-500 mt-1 text-center">
          {formatDate(lastUpdate)}
          <br />
          {formatTime(lastUpdate)}
        </span>
      )}
    </div>
  );
}