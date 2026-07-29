import { useEffect, useState, useSyncExternalStore } from 'react';
import { getDefaultStaffService } from './services/createStaffService';
import type { StaffPersistedSnapshot } from './staffPersistence';

export function useStaffState() {
  const service = getDefaultStaffService();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    service.hydrate().then(result => {
      if (cancelled) return;
      if (!result.ok) setError(result.error);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const snapshot = useSyncExternalStore(
    cb => service.subscribe(cb),
    () => service.getSnapshot(),
    () => service.getSnapshot(),
  );

  return {
    service,
    snapshot: snapshot as StaffPersistedSnapshot,
    ready,
    error,
  };
}
