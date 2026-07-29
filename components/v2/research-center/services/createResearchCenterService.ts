import type { CreateResearchCenterServiceOptions, ResearchCenterService } from './ResearchCenterService';
import { LocalStorageResearchCenterService } from './LocalStorageResearchCenterService';
import { RemoteResearchCenterService } from './RemoteResearchCenterService';

let defaultInstance: ResearchCenterService | null = null;

export function createResearchCenterService(
  options?: CreateResearchCenterServiceOptions,
): ResearchCenterService {
  const mode = options?.mode ?? 'local';
  const role = options?.role ?? 'hq_admin';
  if (mode === 'remote') {
    return new RemoteResearchCenterService(role);
  }
  return new LocalStorageResearchCenterService(role);
}

export function getDefaultResearchCenterService(): ResearchCenterService {
  if (!defaultInstance) {
    defaultInstance = createResearchCenterService({ mode: 'local' });
  }
  return defaultInstance;
}

export function __resetDefaultResearchCenterServiceForTests(): void {
  defaultInstance = null;
}
