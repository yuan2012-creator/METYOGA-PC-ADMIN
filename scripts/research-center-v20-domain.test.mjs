/**
 * Research Center V2.0 — domain & LocalStorage service unit tests (node:test).
 * Does not touch Playwright UI flows.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  migrateResearchCenterSnapshot,
  RESEARCH_CENTER_STORAGE_KEY,
  RESEARCH_CENTER_STORAGE_KEY_V18,
  RESEARCH_CENTER_STORAGE_KEY_V19,
  RESEARCH_CENTER_STORAGE_VERSION,
} from '../components/v2/research-center/researchCenterPersistence.ts';
import {
  validateLeadStageTransition,
  validatePaymentStatusTransition,
  validateSessionStatusTransition,
  validateLeaveTransition,
  validateMakeupTransition,
  derivePaymentStatusFromAmounts,
} from '../components/v2/research-center/domain/transitions.ts';
import {
  __resetDefaultResearchCenterServiceForTests,
  createResearchCenterService,
} from '../components/v2/research-center/services/createResearchCenterService.ts';
import { buildInitialResearchCenterSnapshot } from '../components/v2/research-center/services/buildInitialSnapshot.ts';
import {
  buildCohortOverviewMetrics,
  deriveAverageAttendanceRate,
  buildDeliveryTodos,
} from '../components/v2/research-center/researchCenterDeliveryCalculations.ts';
import { syncMentorPayablesFromSchedules, countsTowardPaidSeat } from '../components/v2/research-center/researchCenterCalculations.ts';

/** Minimal localStorage polyfill for Node. */
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
  __resetDefaultResearchCenterServiceForTests();
});

test('v1.8 snapshot migrates to v2.0 without dropping leads/enrollments', () => {
  const initial = buildInitialResearchCenterSnapshot();
  const legacy = {
    version: 1,
    savedAt: '2026-07-01T00:00:00.000Z',
    activeCohortId: initial.activeCohortId,
    cohorts: initial.cohorts,
    schedules: initial.schedules.map(({ cohortId, status, ...rest }) => rest),
    leads: initial.leads,
    enrollments: initial.enrollments,
    paymentPlanConfigured: false,
    financeState: initial.financeState,
    mentorPayables: initial.mentorPayables,
    operationLogs: [],
    dismissedTodoIds: [],
  };
  const migrated = migrateResearchCenterSnapshot(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, RESEARCH_CENTER_STORAGE_VERSION);
  assert.equal(migrated.leads.length, initial.leads.length);
  assert.equal(migrated.enrollments.length, initial.enrollments.length);
  assert.ok(Array.isArray(migrated.attendances));
  assert.ok(Array.isArray(migrated.domainEvents));
  assert.ok(migrated.schedules.every(s => s.cohortId && s.status));
});

test('v1.9 snapshot migrates and keeps delivery collections', () => {
  const initial = buildInitialResearchCenterSnapshot();
  const v19 = {
    ...initial,
    version: 2,
    attendances: [
      {
        id: 'att-1',
        businessUnitId: 'bu-metyoga-hq',
        cohortId: initial.activeCohortId,
        sessionId: initial.schedules[0].id,
        entries: [],
        savedAt: 'x',
        operator: 't',
      },
    ],
  };
  const migrated = migrateResearchCenterSnapshot(v19);
  assert.ok(migrated);
  assert.equal(migrated.version, RESEARCH_CENTER_STORAGE_VERSION);
  assert.equal(migrated.attendances.length, 1);
});

test('createLead via LocalStorage service', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const before = service.listLeads().length;
  const result = service.createLead({
    name: '单元测试学员',
    phone: '13900001111',
    wechat: 'ut_wechat',
    course: 'RYT200',
    source: '其他',
    learningBase: '',
    learningPurpose: '',
    budgetNote: '',
    timeCondition: '',
    intentLevel: '高',
    owner: '芳芳',
    expectedAmount: 12800,
    targetCohortId: service.getSnapshot().activeCohortId,
    nextFollowUpDate: '2026-07-20',
    note: '',
  });
  assert.equal(result.ok, true);
  assert.equal(service.listLeads().length, before + 1);
  assert.ok(localStorage.getItem(RESEARCH_CENTER_STORAGE_KEY));
});

test('legal and illegal lead stage transitions', () => {
  const lead = { paidAmount: 0, enrolled: false, interview: null };
  const ok = validateLeadStageTransition('新咨询', '已联系', lead);
  assert.equal(ok.ok, true);
  const bad = validateLeadStageTransition('新咨询', '已入班', lead);
  assert.equal(bad.ok, false);
  assert.equal(bad.requireForceReason, true);
  const forced = validateLeadStageTransition('新咨询', '已入班', lead, { forceReason: '总部特批' });
  assert.equal(forced.ok, true);
  assert.equal(forced.forced, true);
});

test('duplicate enrollment blocked', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const cohortId = service.getSnapshot().activeCohortId;
  const existing = service.listEnrollments(cohortId)[0];
  const dup = service.createEnrollment({
    mode: 'existing',
    leadId: existing.leadId,
    cohortId,
    course: 'RYT200',
    standardPrice: 12800,
    dealPrice: 12800,
    paymentMethod: '微信',
    paymentStatus: '未付款',
    contractStatus: '未签约',
    owner: '芳芳',
    initialReceiptAmount: 0,
  });
  assert.equal(dup.ok, false);
  assert.match(dup.error || '', /重复报名|同一咨询者/);
});

test('receipt updates payment status', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const created = service.createLead({
    name: '收款测试',
    phone: '',
    wechat: '',
    course: 'RYT200',
    source: '其他',
    learningBase: '',
    learningPurpose: '',
    budgetNote: '',
    timeCondition: '',
    intentLevel: '中',
    owner: '芳芳',
    expectedAmount: 12800,
    targetCohortId: service.getSnapshot().activeCohortId,
    nextFollowUpDate: '',
    note: '',
  });
  assert.ok(created.ok && created.data?.id);
  const enroll = service.createEnrollment({
    mode: 'existing',
    leadId: created.data.id,
    cohortId: service.getSnapshot().activeCohortId,
    course: 'RYT200',
    standardPrice: 12800,
    dealPrice: 12800,
    paymentMethod: '微信',
    paymentStatus: '未付款',
    contractStatus: '已签约',
    owner: '芳芳',
    initialReceiptAmount: 0,
  });
  assert.ok(enroll.ok && enroll.data?.enrollmentId);
  const receipt = service.recordReceipt({
    enrollmentId: enroll.data.enrollmentId,
    amount: 6400,
    paymentMethod: '微信',
    date: '2026-07-15',
    operator: '芳芳',
    note: '',
  });
  assert.equal(receipt.ok, true);
  const row = service.listEnrollments().find(e => e.id === enroll.data.enrollmentId);
  assert.equal(row?.paymentStatus, '部分付款');
  assert.equal(row?.paidAmount, 6400);
});

test('refund reverses receipt amount', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const enrollment = service.listEnrollments().find(e => e.joined && e.paymentStatus === '已付清');
  assert.ok(enrollment);
  const beforePaid = enrollment.paidAmount;
  const beforeCount = service.getCohort(enrollment.cohortId)?.paidCount ?? 0;
  const refund = service.createRefund({
    enrollmentId: enrollment.id,
    amount: beforePaid,
    reason: '单元测试退款',
    date: '2026-07-16',
    operator: '总部管理员',
    exitCohort: true,
  });
  assert.equal(refund.ok, true);
  const after = service.listEnrollments().find(e => e.id === enrollment.id);
  assert.equal(after?.paidAmount, 0);
  assert.equal(after?.joined, false);
  assert.ok((service.getCohort(enrollment.cohortId)?.paidCount ?? 0) <= beforeCount - 1);
});

test('attendance one final status per student per session', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const session = service.getSnapshot().schedules[0];
  const students = service.listEnrollments(session.cohortId).filter(e => e.joined && !e.refunded);
  const result = service.saveAttendance({
    sessionId: session.id,
    operator: '总部管理员',
    entries: students.map((s, i) => ({
      studentId: s.id,
      leadId: s.leadId,
      status: i === 0 ? '请假' : '已到',
    })),
  });
  assert.equal(result.ok, true);
  const sheet = service.getSnapshot().attendances.find(a => a.sessionId === session.id);
  assert.ok(sheet);
  const ids = sheet.entries.map(e => e.studentId);
  assert.equal(ids.length, new Set(ids).size);
});

test('leave and makeup are linked', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const session = service.getSnapshot().schedules[0];
  const student = service.listEnrollments(session.cohortId).find(e => e.joined);
  assert.ok(student);
  const leave = service.createLeaveRequest({
    studentId: student.id,
    sessionId: session.id,
    reason: '测试请假',
    leaveAt: session.dateIso,
    needMakeup: true,
    note: '',
    operator: '总部管理员',
  });
  assert.ok(leave.ok && leave.data?.id);
  const makeup = service.createMakeupRecord({
    leaveRequestId: leave.data.id,
    studentId: student.id,
    sessionId: session.id,
    method: '线上补课',
    makeupDate: '2026-07-30',
    teacher: '大鹏',
    note: '',
  });
  assert.ok(makeup.ok && makeup.data?.id);
  const leaveRow = service.getSnapshot().leaveRequests.find(l => l.id === leave.data.id);
  assert.equal(leaveRow?.makeupId, makeup.data.id);
  const done = service.completeMakeup(makeup.data.id);
  assert.equal(done.ok, true);
});

test('session generates mentor payable without duplicate on edit', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const cohortId = service.getSnapshot().activeCohortId;
  const created = service.createSession({
    dateIso: '2026-07-31',
    date: '7月31日',
    startTime: '09:00',
    endTime: '12:00',
    content: '单元测试课',
    teacher: '大鹏',
    venue: '502室',
    classroom: '502主教室',
    sessionType: '正常教学',
    calcPay: true,
    payMethod: '按天',
    payAmount: 2000,
    note: '',
    cohortId,
  });
  assert.ok(created.ok && created.data?.id);
  const afterCreate = service.listMentorPayables(cohortId).filter(p => p.sessionId === created.data.id);
  assert.equal(afterCreate.length, 1);
  service.updateSession(created.data.id, { payAmount: 2000, note: 'edit' });
  const afterEdit = service.listMentorPayables(cohortId).filter(p => p.sessionId === created.data.id);
  assert.equal(afterEdit.length, 1);
});

test('paid mentor payable cannot be silently deleted with session', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const payable = service.listMentorPayables()[0];
  assert.ok(payable);
  // mark paid via sync path: patch snapshot
  service.runTransaction(draft => {
    draft.mentorPayables = draft.mentorPayables.map(p =>
      p.id === payable.id ? { ...p, paidAmount: p.dueAmount, status: '已支付' } : p,
    );
  });
  const del = service.deleteSession(payable.sessionId);
  assert.equal(del.ok, false);
  assert.match(del.error || '', /已支付/);
});

test('cohort derived metrics and attendance rate', async () => {
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  const snap = service.getSnapshot();
  const cohort = snap.cohorts[0];
  const metrics = buildCohortOverviewMetrics(
    cohort,
    snap.schedules,
    snap.attendances,
    snap.leaveRequests,
    snap.makeupRecords,
  );
  assert.equal(metrics.paidCount, cohort.paidCount);
  assert.equal(typeof metrics.scheduledDays, 'number');
  assert.equal(derivePaymentStatusFromAmounts(12800, 6400), '部分付款');
  const seat = countsTowardPaidSeat({ paymentStatus: '已付清', joined: true, refunded: false });
  assert.equal(seat, true);
});

test('attendance rate calculation', () => {
  const rate = deriveAverageAttendanceRate(
    [
      {
        id: 'a',
        businessUnitId: 'bu',
        cohortId: 'c1',
        sessionId: 's1',
        savedAt: '',
        operator: 'x',
        entries: [
          { studentId: '1', leadId: 'l1', status: '已到' },
          { studentId: '2', leadId: 'l2', status: '已到' },
          { studentId: '3', leadId: 'l3', status: '请假' },
        ],
      },
    ],
    'c1',
  );
  assert.equal(rate, 66.7);
});

test('delivery todos are de-duplicated by id', () => {
  const initial = buildInitialResearchCenterSnapshot();
  const todos = buildDeliveryTodos({
    cohort: initial.cohorts[0],
    schedules: initial.schedules,
    attendances: [],
    leaveRequests: [],
    makeupRecords: [],
    teachingRecords: [],
  });
  const ids = todos.map(t => t.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('corrupt localStorage falls back safely', async () => {
  localStorage.setItem(RESEARCH_CENTER_STORAGE_KEY, '{not-json');
  localStorage.setItem(RESEARCH_CENTER_STORAGE_KEY_V19, 'null');
  localStorage.setItem(RESEARCH_CENTER_STORAGE_KEY_V18, '{"version":1}');
  __resetDefaultResearchCenterServiceForTests();
  const service = createResearchCenterService({ mode: 'local' });
  await service.hydrate();
  assert.ok(service.listCohorts().length >= 1);
  assert.ok(service.listLeads().length >= 1);
});

test('session and leave/makeup transition validators', () => {
  assert.equal(validateSessionStatusTransition('已完成', '草稿').ok, false);
  assert.equal(validateLeaveTransition('已撤销', '已批准').ok, false);
  assert.equal(validateMakeupTransition('待安排', '已完成').ok, false);
  assert.equal(validatePaymentStatusTransition('未付款', '已付清', { dealPriceYuan: 100, paidAmountYuan: 50 }).ok, false);
});

test('syncMentorPayablesFromSchedules keeps other cohorts', () => {
  const schedules = [
    {
      id: 's1',
      cohortId: 'c1',
      dateIso: '2026-07-27',
      date: '7月27日',
      startTime: '09:00',
      endTime: '12:00',
      content: 'A',
      teacher: '大鹏',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '正常教学',
      calcPay: true,
      payAmount: 2000,
      note: '',
      status: '已发布',
    },
  ];
  const prev = [
    {
      id: 'mp-other',
      teacher: '锐霖',
      cohortId: 'c2',
      sessionId: 'other',
      sessionLabel: 'x',
      dueAmount: 100,
      paidAmount: 0,
      dueDate: '2026-07-28',
      status: '待付款',
    },
  ];
  const next = syncMentorPayablesFromSchedules(schedules, 'c1', prev);
  assert.ok(next.some(p => p.cohortId === 'c2'));
  assert.ok(next.some(p => p.sessionId === 's1'));
});
