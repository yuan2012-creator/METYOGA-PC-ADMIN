/**
 * Course Schedule P1 — domain & LocalStorage service unit tests (node:test).
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_SCHEDULE_STORAGE_KEY,
  COURSE_SCHEDULE_STORAGE_VERSION,
  clearCourseScheduleSnapshot,
  migrateCourseScheduleSnapshot,
} from '../components/v2/course/courseSchedulePersistence.ts';
import {
  STAFF_STORAGE_KEY,
  clearStaffSnapshot,
} from '../components/v2/staff/staffPersistence.ts';
import {
  CANONICAL_SESSION_IDS,
  resolveLegacySessionId,
  listUnresolvedSessionMappings,
  sessIdFromCs,
  sessIdFromPsess,
  sessIdFromSession,
} from '../components/v2/course/domain/legacySessionIdMap.ts';
import {
  CANONICAL_STAFF_IDS,
  resolveLegacyStaffRef,
} from '../components/v2/staff/domain/legacyStaffIdMap.ts';
import {
  COURSE_SCHEDULE_PERMISSIONS,
  hasCourseSchedulePermission,
} from '../components/v2/course/domain/permissions.ts';
import {
  __resetDefaultCourseScheduleServiceForTests,
  createCourseScheduleService,
} from '../components/v2/course/services/createCourseScheduleService.ts';
import { __resetDefaultCourseScheduleAdapterForTests } from '../components/v2/course/adapters/CourseScheduleAdapter.ts';
import {
  __resetDefaultStaffServiceForTests,
  __resetStaffServiceInstanceForTests,
  createStaffService,
} from '../components/v2/staff/services/createStaffService.ts';
import { buildInitialCourseScheduleSnapshot } from '../components/v2/course/services/buildInitialCourseScheduleSnapshot.ts';
import {
  deriveTeacherGap,
  deriveTeacherConflict,
  deriveCapabilityMismatch,
  deriveStoreAuthorizationRisk,
  toScheduleAssignmentProjection,
} from '../components/v2/course/courseScheduleCalculations.ts';
import { getDefaultCourseScheduleAdapter } from '../components/v2/course/adapters/CourseScheduleAdapter.ts';

function installLocalStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: k => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: i => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
  return map;
}

beforeEach(() => {
  installLocalStorage();
  __resetDefaultStaffServiceForTests();
  __resetDefaultCourseScheduleServiceForTests();
  __resetDefaultCourseScheduleAdapterForTests();
  clearStaffSnapshot();
  clearCourseScheduleSnapshot();
});

test('1. cs-* legacy ids resolve to sess_*', () => {
  assert.equal(resolveLegacySessionId('cs-mon-0930').sessionId, sessIdFromCs('cs-mon-0930'));
  assert.equal(resolveLegacySessionId('cs-fri-2030').sessionId, sessIdFromCs('cs-fri-2030'));
});

test('2. session-* legacy ids resolve to sess_*', () => {
  const id = resolveLegacySessionId('session-demo-001').sessionId;
  assert.ok(id?.startsWith('sess_'));
  assert.equal(id, sessIdFromSession('session-demo-001'));
});

test('3. psess-* legacy ids resolve to sess_*', () => {
  assert.equal(
    resolveLegacySessionId('psess-gap-evening-flow').sessionId,
    CANONICAL_SESSION_IDS.gapEveningFlow,
  );
  assert.equal(
    resolveLegacySessionId('psess-unknown').sessionId,
    sessIdFromPsess('psess-unknown'),
  );
});

test('4. unified map dedupes same session across legacy ids', () => {
  const cs = resolveLegacySessionId('cs-mon-1945');
  const ps = resolveLegacySessionId('psess-gap-evening-flow');
  assert.equal(cs.sessionId, ps.sessionId);
  assert.equal(cs.sessionId, CANONICAL_SESSION_IDS.gapEveningFlow);
});

test('5. unresolved session refs are listed', () => {
  const list = listUnresolvedSessionMappings();
  assert.ok(list.some(e => e.legacyKey === 'session-orphan-demo'));
  assert.ok(list.every(e => e.resolution === 'unresolved'));
});

test('6. teacher legacy ID map resolves known keys', () => {
  assert.equal(resolveLegacyStaffRef('t-mia').staffId, CANONICAL_STAFF_IDS.mia);
  assert.equal(resolveLegacyStaffRef('teacher-anna').staffId, CANONICAL_STAFF_IDS.anna);
});

test('7. unresolved teacher t-lily is flagged', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const unresolved = service.listUnresolvedTeacherReferences();
  assert.ok(unresolved.some(r => r.rawValue === 't-lily'));
  const lilySession = service
    .listSessions()
    .find(s => s.legacyIds.includes('cs-mon-1200'));
  assert.ok(lilySession);
  assert.equal(lilySession.teacherAssignment.teacherUnresolved, true);
});

test('8. teacher gap is derived for missing staff', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const gap = service.getSession(CANONICAL_SESSION_IDS.gapEveningFlow);
  assert.ok(gap);
  const risk = deriveTeacherGap(gap);
  assert.ok(risk);
  assert.equal(risk.type, '缺老师');
});

test('9. time conflict is derived for overlapping sessions', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const sessions = service.listSessions();
  const conflictA = service.getSession(CANONICAL_SESSION_IDS.conflictA);
  assert.ok(conflictA);
  const risk = deriveTeacherConflict(sessions, conflictA);
  assert.ok(risk);
  assert.equal(risk.type, '时间冲突');
});

test('10. capability mismatch is derived', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const session = service.getSession(CANONICAL_SESSION_IDS.todayPilates);
  assert.ok(session);
  const risk = deriveCapabilityMismatch(session, ['cap_yin_yoga']);
  assert.ok(risk);
  assert.equal(risk.type, '能力不匹配');
});

test('11. store authorization risk is derived', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const session = service.getSession(CANONICAL_SESSION_IDS.todayPilates);
  assert.ok(session);
  const risk = deriveStoreAuthorizationRisk(session, 'store-binjiang', []);
  assert.ok(risk);
  assert.equal(risk.type, '门店无授权');
});

test('12. assign updates course and staff projections', async () => {
  const staffService = createStaffService({ mode: 'local' });
  await staffService.hydrate();
  const gapId = CANONICAL_SESSION_IDS.gapEveningFlow;
  const result = staffService.assignTeacherToSession('sa-gap-1', CANONICAL_STAFF_IDS.yidan);
  assert.equal(result.ok, true);
  const courseService = createCourseScheduleService({ mode: 'local' });
  await courseService.hydrate();
  const session = courseService.getSession(gapId);
  assert.equal(session?.teacherAssignment.staffId, CANONICAL_STAFF_IDS.yidan);
  const adapter = getDefaultCourseScheduleAdapter();
  const projection = adapter.toScheduleAssignment(gapId);
  assert.equal(projection?.staffId, CANONICAL_STAFF_IDS.yidan);
  const staffRow = staffService
    .getSnapshot()
    .scheduleAssignments.find(a => a.session.sessionId === gapId);
  assert.equal(staffRow?.staffId, CANONICAL_STAFF_IDS.yidan);
});

test('13. replace keeps previousStaffId', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const sessionId = CANONICAL_SESSION_IDS.todayPilates;
  const before = service.getSession(sessionId);
  assert.ok(before?.teacherAssignment.staffId);
  const prev = before.teacherAssignment.staffId;
  const result = service.replaceTeacher(sessionId, CANONICAL_STAFF_IDS.keke);
  assert.equal(result.ok, true);
  const after = service.getSession(sessionId);
  assert.equal(after?.teacherAssignment.previousStaffId, prev);
  assert.equal(after?.teacherAssignment.staffId, CANONICAL_STAFF_IDS.keke);
});

test('14. force assign requires reason', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const noReason = service.assignTeacher(CANONICAL_SESSION_IDS.gapEveningFlow, CANONICAL_STAFF_IDS.nora, {
    forced: true,
  });
  assert.equal(noReason.ok, false);
  const ok = service.assignTeacher(CANONICAL_SESSION_IDS.gapEveningFlow, CANONICAL_STAFF_IDS.nora, {
    forced: true,
    forcedReason: '总部特批',
  });
  assert.equal(ok.ok, true);
});

test('15. leave approval marks session 待替代', async () => {
  const staffService = createStaffService({ mode: 'local' });
  await staffService.hydrate();
  const sessionId = CANONICAL_SESSION_IDS.noraLeave;
  const result = staffService.approveApplication('TA-20260727-001', {
    comment: '同意请假',
  });
  assert.equal(result.ok, true);
  const courseService = createCourseScheduleService({ mode: 'local' });
  await courseService.hydrate();
  const session = courseService.getSession(sessionId);
  assert.equal(session?.teacherAssignment.assignmentStatus, '待替代');
});

test('16. substitute sets isSubstitute', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const sessionId = CANONICAL_SESSION_IDS.wedPilates;
  const result = service.applySubstituteImpact(sessionId, CANONICAL_STAFF_IDS.caicai, {
    reason: '代课安排',
  });
  assert.equal(result.ok, true);
  const session = service.getSession(sessionId);
  assert.equal(session?.teacherAssignment.isSubstitute, true);
  assert.equal(session?.teacherAssignment.staffId, CANONICAL_STAFF_IDS.caicai);
});

test('17. reschedule keeps originalStartAt', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const sessionId = CANONICAL_SESSION_IDS.todayYin;
  const before = service.getSession(sessionId);
  assert.ok(before);
  const originalStart = before.startAt;
  const newStart = `${before.dateIso}T20:30:00+08:00`;
  const newEnd = `${before.dateIso}T21:30:00+08:00`;
  const result = service.rescheduleSession(sessionId, {
    startAt: newStart,
    endAt: newEnd,
    reason: '会员改约',
  });
  assert.equal(result.ok, true);
  const after = service.getSession(sessionId);
  assert.equal(after?.originalStartAt, originalStart);
  assert.equal(after?.sessionStatus, '已改期');
});

test('18. suspend does not delete session', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const beforeCount = service.listSessions().length;
  const sessionId = CANONICAL_SESSION_IDS.friFlow;
  const result = service.suspendSession(sessionId, { reason: '台风停课' });
  assert.equal(result.ok, true);
  assert.equal(service.listSessions().length, beforeCount);
  const session = service.getSession(sessionId);
  assert.equal(session?.sessionStatus, '已停课');
});

test('19. completed session blocks replace', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const completed = service.listSessions().find(s => s.sessionStatus === '已完成');
  assert.ok(completed);
  const result = service.replaceTeacher(completed.id, CANONICAL_STAFF_IDS.keke);
  assert.equal(result.ok, false);
});

test('20. payable session blocks replace', async () => {
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  const payable = service.listSessions().find(s => s.payableStatus === '应付');
  assert.ok(payable);
  const result = service.replaceTeacher(payable.id, CANONICAL_STAFF_IDS.keke);
  assert.equal(result.ok, false);
});

test('21. corrupted localStorage safely falls back', async () => {
  localStorage.setItem(COURSE_SCHEDULE_STORAGE_KEY, '{not-json');
  assert.equal(migrateCourseScheduleSnapshot(JSON.parse('"x"')), null);
  const service = createCourseScheduleService({ mode: 'local' });
  await service.hydrate();
  assert.ok(service.listSessions().length >= 10);
});

test('22. refresh consistency across course and staff modules', async () => {
  const staffService = createStaffService({ mode: 'local' });
  await staffService.hydrate();
  staffService.assignTeacherToSession('sa-gap-1', CANONICAL_STAFF_IDS.yidan);
  assert.ok(localStorage.getItem(COURSE_SCHEDULE_STORAGE_KEY));
  assert.ok(localStorage.getItem(STAFF_STORAGE_KEY));
  __resetStaffServiceInstanceForTests();
  __resetDefaultCourseScheduleServiceForTests();
  __resetDefaultCourseScheduleAdapterForTests();
  const course2 = createCourseScheduleService({ mode: 'local' });
  const staff2 = createStaffService({ mode: 'local' });
  await course2.hydrate();
  await staff2.hydrate();
  const session = course2.getSession(CANONICAL_SESSION_IDS.gapEveningFlow);
  assert.equal(session?.teacherAssignment.staffId, CANONICAL_STAFF_IDS.yidan);
  const staffRow = staff2
    .getSnapshot()
    .scheduleAssignments.find(a => a.id === 'sa-gap-1');
  assert.equal(staffRow?.staffId, CANONICAL_STAFF_IDS.yidan);
  assert.equal(course2.getSnapshot().version, COURSE_SCHEDULE_STORAGE_VERSION);
});

test('seed includes unified demo sessions with sess_* ids', () => {
  const snap = buildInitialCourseScheduleSnapshot();
  const ids = snap.sessions.map(s => s.id);
  assert.ok(ids.includes(CANONICAL_SESSION_IDS.gapEveningFlow));
  assert.ok(ids.every(id => id.startsWith('sess_')));
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(hasCourseSchedulePermission('hq_admin', COURSE_SCHEDULE_PERMISSIONS.TEST_DATA_RESET));
});
