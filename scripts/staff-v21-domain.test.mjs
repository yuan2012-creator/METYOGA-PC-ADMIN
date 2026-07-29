/**
 * Staff V2.1 — domain & LocalStorage service unit tests (node:test).
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_SCHEDULE_STORAGE_KEY,
  clearCourseScheduleSnapshot,
} from '../components/v2/course/courseSchedulePersistence.ts';
import {
  STAFF_STORAGE_KEY,
  STAFF_STORAGE_VERSION,
  migrateStaffSnapshot,
  clearStaffSnapshot,
} from '../components/v2/staff/staffPersistence.ts';
import {
  resolveLegacyStaffRef,
  countUnresolvedLegacyMappings,
  listUnresolvedLegacyMappings,
  CANONICAL_STAFF_IDS,
  validateApplicationTransition,
  hasStaffPermission,
  STAFF_PERMISSIONS,
} from '../components/v2/staff/domain/index.ts';
import {
  __resetDefaultStaffServiceForTests,
  __resetStaffServiceInstanceForTests,
  createStaffService,
} from '../components/v2/staff/services/createStaffService.ts';
import { buildInitialStaffSnapshot } from '../components/v2/staff/services/buildInitialStaffSnapshot.ts';
import { overlaps } from '../components/v2/staff/staffWorkbenchCalculations.ts';

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
  clearStaffSnapshot();
  clearCourseScheduleSnapshot();
});

test('1. legacy ID mapping resolves known keys to staff_xxx', () => {
  assert.equal(resolveLegacyStaffRef('teacher-mia').staffId, CANONICAL_STAFF_IDS.mia);
  assert.equal(resolveLegacyStaffRef('t-mia').staffId, CANONICAL_STAFF_IDS.mia);
  assert.equal(resolveLegacyStaffRef('T-1001').staffId, CANONICAL_STAFF_IDS.lina);
  assert.equal(resolveLegacyStaffRef('大鹏', 'research.mentorName').staffId, CANONICAL_STAFF_IDS.dapeng);
  assert.equal(resolveLegacyStaffRef('4', 'types.Staff.id').staffId, CANONICAL_STAFF_IDS.anna);
});

test('2. unresolved staff references are counted and listed', () => {
  const count = countUnresolvedLegacyMappings();
  assert.ok(count > 0);
  const list = listUnresolvedLegacyMappings();
  assert.ok(list.some(e => e.legacyKey === '李老师'));
  assert.ok(list.every(e => e.resolution === 'unresolved' || !e.staffId));
});

test('3. store filter returns only authorized staff', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const all = service.listStaff('all');
  const wanxiang = service.listStaff('store-wanxiang');
  assert.ok(all.length > wanxiang.length);
  assert.ok(
    wanxiang.every(
      m => m.primaryStoreId === 'store-wanxiang' || m.supportStoreIds.includes('store-wanxiang'),
    ),
  );
});

test('4. available teachers filtered by capability/store/availability', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const gap = service.listScheduleGaps()[0];
  assert.ok(gap);
  const candidates = service.listAvailableTeachers(gap.id);
  assert.ok(candidates.length > 0);
  assert.ok(candidates.every(c => !c.riskNotes.includes('请假')));
  const nora = candidates.find(c => c.staffId === CANONICAL_STAFF_IDS.nora);
  assert.equal(nora, undefined);
});

test('5. conflict recognition via overlaps', () => {
  assert.equal(
    overlaps(
      { dateIso: '2026-07-28', startTime: '19:30', endTime: '20:30' },
      { dateIso: '2026-07-28', startTime: '19:30', endTime: '20:30' },
    ),
    true,
  );
  assert.equal(
    overlaps(
      { dateIso: '2026-07-28', startTime: '10:00', endTime: '11:00' },
      { dateIso: '2026-07-28', startTime: '11:00', endTime: '12:00' },
    ),
    false,
  );
  const service = createStaffService({ mode: 'local' });
  const conflicts = service.listScheduleConflicts();
  assert.ok(conflicts.length >= 2);
});

test('6. missing teacher sessions listed as gaps', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const gaps = service.listScheduleGaps();
  assert.ok(gaps.some(g => g.status === '待指定' || !g.staffId));
});

test('7. assign teacher clears gap', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const before = service.getStaffWorkbench().metrics.pendingGapCount;
  const gap = service.listScheduleGaps().find(g => g.id === 'sa-gap-1');
  assert.ok(gap);
  const candidates = service.listAvailableTeachers(gap.id);
  assert.ok(candidates[0]);
  const result = service.assignTeacherToSession(gap.id, candidates[0].staffId);
  assert.equal(result.ok, true);
  const after = service.getStaffWorkbench().metrics.pendingGapCount;
  assert.ok(after < before);
  const issue = service.getSnapshot().issues.find(i => i.id === 'issue-gap-1');
  assert.equal(issue?.resolved, true);
});

test('8. replace teacher updates assignment', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const row = service.getSnapshot().scheduleAssignments.find(a => a.id === 'sa-today-1');
  assert.ok(row);
  const result = service.replaceTeacherForSession(row.id, CANONICAL_STAFF_IDS.keke);
  assert.equal(result.ok, true);
  const updated = service.getSnapshot().scheduleAssignments.find(a => a.id === 'sa-today-1');
  assert.equal(updated?.staffId, CANONICAL_STAFF_IDS.keke);
  assert.equal(updated?.status, '已替换');
});

test('9. legal application transitions', () => {
  assert.equal(validateApplicationTransition('待审批', '已通过').ok, true);
  assert.equal(validateApplicationTransition('待审批', '已驳回', { rejectReason: '材料不足' }).ok, true);
  assert.equal(validateApplicationTransition('待审批', '待补充').ok, true);
  assert.equal(validateApplicationTransition('待补充', '待审批').ok, true);
  assert.equal(validateApplicationTransition('已通过', '已执行').ok, true);
});

test('10. illegal application transitions', () => {
  const bad = validateApplicationTransition('已执行', '待审批');
  assert.equal(bad.ok, false);
  assert.equal(bad.requireForceReason, true);
  const forced = validateApplicationTransition('已执行', '待审批', { forceReason: '总部特批' });
  assert.equal(forced.ok, true);
  assert.equal(forced.forced, true);
});

test('11. approve generates schedule impact and reaches 已执行', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const result = service.approveApplication('TA-20260727-002', {
    comment: '同意代课',
    substituteStaffId: CANONICAL_STAFF_IDS.caicai,
  });
  assert.equal(result.ok, true);
  const app = service.getApplication('TA-20260727-002');
  assert.equal(app?.status, '已执行');
  assert.equal(app?.impactExecuted, true);
  const assignment = service
    .getSnapshot()
    .scheduleAssignments.find(a => a.session.sessionId === 'sess_wed_pilates');
  assert.equal(assignment?.staffId, CANONICAL_STAFF_IDS.caicai);
});

test('12. reject requires reason', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const noReason = service.rejectApplication('TA-20260727-001', '');
  assert.equal(noReason.ok, false);
  const ok = service.rejectApplication('TA-20260727-001', '档期冲突无法安排');
  assert.equal(ok.ok, true);
  assert.equal(service.getApplication('TA-20260727-001')?.status, '已驳回');
});

test('13. todos are deduped by dedupeKey', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const todos = service.listStaffTodos();
  const keys = todos.map(t => t.dedupeKey);
  assert.equal(keys.length, new Set(keys).size);
});

test('14. assign application owner updates ownerStaffId', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  const result = service.assignApplicationOwner('TA-20260727-001', CANONICAL_STAFF_IDS.anna);
  assert.equal(result.ok, true);
  assert.equal(service.getApplication('TA-20260727-001')?.ownerStaffId, CANONICAL_STAFF_IDS.anna);
});

test('15. permission action matrix', () => {
  assert.equal(hasStaffPermission('hq_admin', STAFF_PERMISSIONS.TEST_DATA_RESET), true);
  assert.equal(hasStaffPermission('store_manager', STAFF_PERMISSIONS.TEST_DATA_RESET), false);
  assert.equal(hasStaffPermission('store_manager', STAFF_PERMISSIONS.SCHEDULE_ASSIGN), true);
  assert.equal(hasStaffPermission('teacher', STAFF_PERMISSIONS.APPLICATION_APPROVE), false);
});

test('16. corrupted localStorage safely falls back', async () => {
  localStorage.setItem(STAFF_STORAGE_KEY, '{not-json');
  const migrated = migrateStaffSnapshot(JSON.parse('"x"'));
  assert.equal(migrated, null);
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  assert.ok(service.listStaff().length >= 10);
});

test('17. persistence survives refresh hydrate', async () => {
  const service = createStaffService({ mode: 'local' });
  await service.hydrate();
  service.assignTeacherToSession('sa-gap-1', CANONICAL_STAFF_IDS.yidan);
  assert.ok(localStorage.getItem(STAFF_STORAGE_KEY));
  assert.ok(localStorage.getItem(COURSE_SCHEDULE_STORAGE_KEY));
  __resetStaffServiceInstanceForTests();
  const service2 = createStaffService({ mode: 'local' });
  await service2.hydrate();
  const row = service2.getSnapshot().scheduleAssignments.find(a => a.id === 'sa-gap-1');
  assert.equal(row?.staffId, CANONICAL_STAFF_IDS.yidan);
  assert.equal(service2.getSnapshot().version, STAFF_STORAGE_VERSION);
});

test('seed includes required example personas with unique staffIds', () => {
  const snap = buildInitialStaffSnapshot();
  const names = ['Mia', 'Anna', '大鹏', 'JOYCE', '一丹', '董董', '科科', '锐霖', '菜菜', '芳芳'];
  for (const name of names) {
    assert.ok(snap.members.some(m => m.name === name), `missing ${name}`);
  }
  const ids = snap.members.map(m => m.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(ids.every(id => id.startsWith('staff_')));
  assert.ok(snap.unresolvedReferences.length > 0);
});
