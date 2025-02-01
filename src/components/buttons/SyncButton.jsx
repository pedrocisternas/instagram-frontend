import { Button } from "@heroui/react";
import { formatDate, formatTime } from '@/utils/dateFormatters';

export default function SyncButton({ 
  isSyncing, 
  onSync, 
  lastUpdate,
  className = ""
}) {
  return (
    <Button
      color="primary"
      isLoading={isSyncing}
      onPress={onSync}
      className={`relative ${className}`}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">
          {isSyncing ? 'Sincronizando...' : 'Actualizar Métricas'}
        </span>
        {lastUpdate && (
          <span className="text-[11px] opacity-80">
            Últ. act. {formatDate(lastUpdate)} - {formatTime(lastUpdate)}
          </span>
        )}
      </div>
    </Button>
  );
}