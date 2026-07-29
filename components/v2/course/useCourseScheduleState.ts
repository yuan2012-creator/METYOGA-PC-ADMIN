import { useEffect, useState, useSyncExternalStore } from 'react';
import { getDefaultCourseScheduleService } from './services/createCourseScheduleService';
import type { CourseSchedulePersistedSnapshot } from './courseSchedulePersistence';

export function useCourseScheduleState() {
  const service = getDefaultCourseScheduleService();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    service.hydrate().then(result => {
      if (cancelled) return;
      if (result.ok === false) setError(result.error);
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
    snapshot: snapshot as CourseSchedulePersistedSnapshot,
    ready,
    error,
  };
}
