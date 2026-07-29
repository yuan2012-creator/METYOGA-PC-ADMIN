/**
 * Central legacy session ID → sess_* map.
 * Never silently merge by course name / teacher / list position.
 */

import type { LegacySessionMappingEntry, UnresolvedSessionReference } from './types';

/**
 * Explicit same-session bridges for P1 prototype.
 * Only pairs confirmed as the same real session appear here with one sess_*.
 */
export const CANONICAL_SESSION_IDS = {
  // Unified staff ↔ course demo sessions (2026-07-27 week, 万象城/城西/滨江)
  todayPilates: 'sess_today_pilates',
  todayYin: 'sess_today_yin',
  gapEveningFlow: 'sess_gap_evening_flow',
  noraLeave: 'sess_nora_leave',
  conflictA: 'sess_conflict_a',
  conflictB: 'sess_conflict_b',
  wedPilates: 'sess_wed_pilates',
  thuRestore: 'sess_thu_restore',
  friFlow: 'sess_fri_flow',
  satPilates: 'sess_sat_pilates',
} as const;

/** Build stable sess_* from cs-* legacy id. */
export function sessIdFromCs(csId: string): string {
  return `sess_${csId.replace(/^cs-/, 'cs_').replace(/-/g, '_')}`;
}

/** Build stable sess_* from psess-* when not explicitly unified. */
export function sessIdFromPsess(psessId: string): string {
  return `sess_${psessId.replace(/^psess-/, 'ps_').replace(/-/g, '_')}`;
}

/** Build stable sess_* from session-* when not explicitly unified. */
export function sessIdFromSession(sessionId: string): string {
  return `sess_${sessionId.replace(/^session-/, 'sn_').replace(/-/g, '_')}`;
}

/**
 * Explicit unified maps: multiple legacy IDs → one sess_*.
 * Course week cards that intentionally share Staff workbench scenarios.
 */
export const UNIFIED_LEGACY_TO_SESSION: Record<string, string> = {
  // Staff P0/P1 scenarios
  'psess-today-pilates': CANONICAL_SESSION_IDS.todayPilates,
  'psess-today-yin': CANONICAL_SESSION_IDS.todayYin,
  'psess-gap-evening-flow': CANONICAL_SESSION_IDS.gapEveningFlow,
  'psess-nora-leave': CANONICAL_SESSION_IDS.noraLeave,
  'psess-conflict-a': CANONICAL_SESSION_IDS.conflictA,
  'psess-conflict-b': CANONICAL_SESSION_IDS.conflictB,
  'psess-wed-pilates': CANONICAL_SESSION_IDS.wedPilates,
  'psess-thu-restore': CANONICAL_SESSION_IDS.thuRestore,
  'psess-fri-flow': CANONICAL_SESSION_IDS.friFlow,
  'psess-sat-pilates': CANONICAL_SESSION_IDS.satPilates,

  // Course week cards intentionally aliased to the same facts (aligned dates)
  'cs-mon-1400': CANONICAL_SESSION_IDS.todayPilates,
  'cs-mon-1830': CANONICAL_SESSION_IDS.todayYin,
  'cs-mon-1945': CANONICAL_SESSION_IDS.gapEveningFlow,
  'cs-tue-1030': CANONICAL_SESSION_IDS.noraLeave,
  'cs-tue-1930': CANONICAL_SESSION_IDS.conflictA,
  'cs-tue-1930b': CANONICAL_SESSION_IDS.conflictB,
  'cs-wed-1930': CANONICAL_SESSION_IDS.wedPilates,
  'cs-thu-1000r': CANONICAL_SESSION_IDS.thuRestore,
  'cs-fri-1800': CANONICAL_SESSION_IDS.friFlow,
  'cs-sat-1000': CANONICAL_SESSION_IDS.satPilates,
};

/** Known unresolved legacy keys that cannot be safely merged. */
export const UNRESOLVED_LEGACY_SESSIONS: LegacySessionMappingEntry[] = [
  {
    legacyKey: 'session-orphan-demo',
    legacySource: 'course.session',
    sessionId: null,
    resolution: 'unresolved',
    note: '课次关联待确认：无法确认与任何门店课次为同一事实',
  },
  {
    legacyKey: 'psess-unknown-legacy',
    legacySource: 'staff.psess',
    sessionId: null,
    resolution: 'unresolved',
    note: '课次关联待确认：师资侧孤立引用',
  },
];

export function resolveLegacySessionId(legacyKey: string): {
  sessionId: string | null;
  resolution: 'resolved' | 'unresolved';
  source: LegacySessionMappingEntry['legacySource'];
} {
  if (legacyKey.startsWith('sess_')) {
    return { sessionId: legacyKey, resolution: 'resolved', source: 'course.cs' };
  }

  const unresolved = UNRESOLVED_LEGACY_SESSIONS.find(e => e.legacyKey === legacyKey);
  if (unresolved) {
    return { sessionId: null, resolution: 'unresolved', source: unresolved.legacySource };
  }

  if (UNIFIED_LEGACY_TO_SESSION[legacyKey]) {
    const source: LegacySessionMappingEntry['legacySource'] = legacyKey.startsWith('psess-')
      ? 'staff.psess'
      : legacyKey.startsWith('session-')
        ? 'course.session'
        : 'course.cs';
    return {
      sessionId: UNIFIED_LEGACY_TO_SESSION[legacyKey],
      resolution: 'resolved',
      source,
    };
  }

  if (legacyKey.startsWith('cs-')) {
    return { sessionId: sessIdFromCs(legacyKey), resolution: 'resolved', source: 'course.cs' };
  }
  if (legacyKey.startsWith('psess-')) {
    return { sessionId: sessIdFromPsess(legacyKey), resolution: 'resolved', source: 'staff.psess' };
  }
  if (legacyKey.startsWith('session-')) {
    return {
      sessionId: sessIdFromSession(legacyKey),
      resolution: 'resolved',
      source: 'course.session',
    };
  }

  return { sessionId: null, resolution: 'unresolved', source: 'unknown' };
}

export function listUnresolvedSessionMappings(): LegacySessionMappingEntry[] {
  return [...UNRESOLVED_LEGACY_SESSIONS];
}

export function buildUnresolvedSessionReferenceRecords(
  extras: Array<{ source: string; rawValue: string; context: string }> = [],
): UnresolvedSessionReference[] {
  const fromMap = listUnresolvedSessionMappings().map((e, i) => ({
    id: `unresolved-session-${i + 1}`,
    source: e.legacySource,
    rawValue: e.legacyKey,
    context: e.note ?? '课次关联待确认',
    markedAt: '2026-07-27T00:00:00.000Z',
  }));
  const fromExtras = extras.map((e, i) => ({
    id: `unresolved-session-extra-${i + 1}`,
    source: e.source,
    rawValue: e.rawValue,
    context: e.context,
    markedAt: '2026-07-27T00:00:00.000Z',
  }));
  return [...fromMap, ...fromExtras];
}

export function collectLegacyIdsForCanonical(sessionId: string): string[] {
  return Object.entries(UNIFIED_LEGACY_TO_SESSION)
    .filter(([, id]) => id === sessionId)
    .map(([legacy]) => legacy);
}
