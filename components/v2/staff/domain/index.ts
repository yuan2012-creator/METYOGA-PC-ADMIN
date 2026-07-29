export * from './enums';
export * from './events';
export * from './permissions';
export * from './types';
export * from './transitions';
export * from './legacyStaffIdMap';

export function nowIso(): string {
  return new Date().toISOString();
}
