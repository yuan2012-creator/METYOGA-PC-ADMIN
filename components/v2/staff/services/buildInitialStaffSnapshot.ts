import {
  CANONICAL_STAFF_IDS,
  buildUnresolvedReferenceRecords,
  nowIso,
} from '../domain';
import type {
  ScheduleAssignment,
  StaffApplication,
  StaffAvailability,
  StaffIssue,
  StaffMember,
  StaffTodo,
  TeachingCapability,
} from '../domain/types';
import type { StaffPersistedSnapshot } from '../staffPersistence';
import { STAFF_STORAGE_VERSION } from '../staffPersistence';

const STORES = {
  wanxiang: { id: 'store-wanxiang', name: '万象馆' },
  chengxi: { id: 'store-chengxi', name: '城西馆' },
  binjiang: { id: 'store-binjiang', name: '滨江馆' },
} as const;

const CAPABILITIES: TeachingCapability[] = [
  { id: 'cap-flow', capabilityId: 'cap_flow_yoga', capabilityLabel: '流瑜伽', courseTypeIds: ['ct-flow'] },
  { id: 'cap-yin', capabilityId: 'cap_yin_yoga', capabilityLabel: '阴瑜伽', courseTypeIds: ['ct-yin'] },
  { id: 'cap-pilates', capabilityId: 'cap_pilates', capabilityLabel: '普拉提小班', courseTypeIds: ['ct-pilates'] },
  { id: 'cap-private', capabilityId: 'cap_private', capabilityLabel: '私教', courseTypeIds: ['ct-private'] },
  { id: 'cap-mentor', capabilityId: 'cap_mentor_ryt', capabilityLabel: '教培导师', courseTypeIds: ['ct-ryt200'] },
  { id: 'cap-restore', capabilityId: 'cap_restore', capabilityLabel: '修复瑜伽', courseTypeIds: ['ct-restore'] },
  { id: 'cap-neck', capabilityId: 'cap_neck', capabilityLabel: '肩颈舒缓', courseTypeIds: ['ct-neck'] },
];

function avatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function member( partial: Omit<StaffMember, 'createdAt' | 'updatedAt'> & Partial<Pick<StaffMember, 'createdAt' | 'updatedAt'>> ): StaffMember {
  const ts = '2026-01-01T00:00:00.000Z';
  return { createdAt: ts, updatedAt: ts, ...partial };
}

function buildMembers(): StaffMember[] {
  const S = CANONICAL_STAFF_IDS;
  return [
    member({
      id: S.mia,
      employeeCode: 'EMP-MIA',
      name: 'Mia',
      mobileMasked: '138****1201',
      avatar: avatar('Mia'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2020-03-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [STORES.chengxi.id],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.wanxiang.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T4',
      capabilityIds: ['cap_pilates', 'cap_private', 'cap_flow_yoga'],
      availabilityStatus: '可排',
      readonlyFacts: {
        taughtSessionCount: 1260,
        attendanceRate: 0.92,
        fillRate: 0.81,
        teachingScore: 4.8,
        payableDueYuan: 12800,
        payablePaidYuan: 9600,
        memberConversion: 0.18,
        complaintCount: 0,
      },
    }),
    member({
      id: S.anna,
      employeeCode: 'EMP-ANNA',
      name: 'Anna',
      mobileMasked: '138****1202',
      avatar: avatar('Anna'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2021-06-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.wanxiang.id, label: '门店授课', active: true },
        { roleCode: 'teaching_lead', storeId: STORES.wanxiang.id, label: '教学负责人', active: true },
      ],
      teachingLevel: 'T4',
      capabilityIds: ['cap_yin_yoga', 'cap_neck', 'cap_flow_yoga', 'cap_restore'],
      availabilityStatus: '可排',
      readonlyFacts: {
        taughtSessionCount: 800,
        attendanceRate: 0.9,
        fillRate: 0.78,
        teachingScore: 4.8,
        payableDueYuan: 8600,
        payablePaidYuan: 8600,
        memberConversion: 0.14,
        complaintCount: 0,
      },
    }),
    member({
      id: S.nora,
      employeeCode: 'EMP-NORA',
      name: 'Nora',
      mobileMasked: '138****1203',
      avatar: avatar('Nora'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2022-01-15',
      primaryStoreId: STORES.chengxi.id,
      supportStoreIds: [STORES.wanxiang.id],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.chengxi.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T3',
      capabilityIds: ['cap_flow_yoga', 'cap_restore'],
      availabilityStatus: '请假中',
      readonlyFacts: { taughtSessionCount: 420, attendanceRate: 0.88, fillRate: 0.74, teachingScore: 4.6, payableDueYuan: 4200, payablePaidYuan: 3000, memberConversion: 0.11, complaintCount: 1 },
    }),
    member({
      id: S.leo,
      employeeCode: 'EMP-LEO',
      name: 'Leo',
      mobileMasked: '138****1204',
      avatar: avatar('Leo'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2019-08-01',
      primaryStoreId: STORES.binjiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.binjiang.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T5',
      capabilityIds: ['cap_private'],
      availabilityStatus: '可排',
      readonlyFacts: { taughtSessionCount: 2100, attendanceRate: 0.95, fillRate: 0.9, teachingScore: 4.9, payableDueYuan: 22000, payablePaidYuan: 18000, memberConversion: 0.28, complaintCount: 0 },
    }),
    member({
      id: S.chenyue,
      employeeCode: 'EMP-CHEN',
      name: '陈悦',
      mobileMasked: '138****1205',
      avatar: avatar('ChenYue'),
      employmentStatus: '在职',
      cooperationType: '兼职',
      joinDate: '2023-04-01',
      primaryStoreId: STORES.chengxi.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.chengxi.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T2',
      capabilityIds: ['cap_flow_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.dapeng,
      employeeCode: 'EMP-DAPENG',
      name: '大鹏',
      mobileMasked: '139****2001',
      avatar: avatar('DaPeng'),
      employmentStatus: '在职',
      cooperationType: '合作导师',
      joinDate: '2018-01-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [STORES.binjiang.id],
      roleAssignments: [
        { roleCode: 'mentor', label: '教培导师', active: true },
        { roleCode: 'store_teacher', storeId: STORES.wanxiang.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T5',
      mentorLevel: 'P2',
      capabilityIds: ['cap_mentor_ryt', 'cap_flow_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.joyce,
      employeeCode: 'EMP-JOYCE',
      name: 'JOYCE',
      mobileMasked: '139****2002',
      avatar: avatar('Joyce'),
      employmentStatus: '在职',
      cooperationType: '合作导师',
      joinDate: '2019-05-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'mentor', label: '教培导师', active: true },
      ],
      mentorLevel: 'P1',
      teachingLevel: 'T4',
      capabilityIds: ['cap_mentor_ryt', 'cap_yin_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.yidan,
      employeeCode: 'EMP-YIDAN',
      name: '一丹',
      mobileMasked: '139****2003',
      avatar: avatar('YiDan'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2021-02-01',
      primaryStoreId: STORES.chengxi.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'assistant', label: '助教', active: true },
        { roleCode: 'store_teacher', storeId: STORES.chengxi.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T2',
      capabilityIds: ['cap_flow_yoga', 'cap_restore'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.dongdong,
      employeeCode: 'EMP-DONG',
      name: '董董',
      mobileMasked: '139****2004',
      avatar: avatar('DongDong'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2020-09-01',
      primaryStoreId: STORES.binjiang.id,
      supportStoreIds: [STORES.wanxiang.id],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.binjiang.id, label: '门店授课', active: true },
        { roleCode: 'store_manager', storeId: STORES.binjiang.id, label: '店长', active: true },
      ],
      teachingLevel: 'T3',
      stewardLevel: 'G2',
      capabilityIds: ['cap_pilates', 'cap_flow_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.keke,
      employeeCode: 'EMP-KEKE',
      name: '科科',
      mobileMasked: '139****2005',
      avatar: avatar('KeKe'),
      employmentStatus: '在职',
      cooperationType: '兼职',
      joinDate: '2022-07-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.wanxiang.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T3',
      capabilityIds: ['cap_pilates', 'cap_neck'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.ruilin,
      employeeCode: 'EMP-RUILIN',
      name: '锐霖',
      mobileMasked: '139****2006',
      avatar: avatar('RuiLin'),
      employmentStatus: '在职',
      cooperationType: '合作导师',
      joinDate: '2020-11-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'mentor', label: '教培导师', active: true },
        { roleCode: 'assistant', label: '助教', active: true },
      ],
      mentorLevel: 'P1',
      teachingLevel: 'T4',
      capabilityIds: ['cap_mentor_ryt', 'cap_private'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.caicai,
      employeeCode: 'EMP-CAICAI',
      name: '菜菜',
      mobileMasked: '139****2007',
      avatar: avatar('CaiCai'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2021-10-01',
      primaryStoreId: STORES.chengxi.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.chengxi.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T3',
      capabilityIds: ['cap_yin_yoga', 'cap_flow_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.fangfang,
      employeeCode: 'EMP-FANG',
      name: '芳芳',
      mobileMasked: '139****2008',
      avatar: avatar('FangFang'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2019-03-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [STORES.chengxi.id, STORES.binjiang.id],
      roleAssignments: [
        { roleCode: 'hq_admin', label: '总部管理员', active: true },
        { roleCode: 'teaching_lead', storeId: STORES.wanxiang.id, label: '教学负责人', active: true },
      ],
      teachingLevel: 'T4',
      stewardLevel: 'G1',
      capabilityIds: ['cap_flow_yoga'],
      availabilityStatus: '可排',
    }),
    member({
      id: S.lina,
      employeeCode: 'EMP-LINA',
      name: 'Lina',
      mobileMasked: '138****1301',
      avatar: avatar('Lina'),
      employmentStatus: '在职',
      cooperationType: '全职',
      joinDate: '2020-06-01',
      primaryStoreId: STORES.wanxiang.id,
      supportStoreIds: [],
      roleAssignments: [
        { roleCode: 'store_teacher', storeId: STORES.wanxiang.id, label: '门店授课', active: true },
      ],
      teachingLevel: 'T3',
      capabilityIds: ['cap_flow_yoga', 'cap_pilates'],
      availabilityStatus: '可排',
    }),
  ];
}

function buildAvailabilities(members: StaffMember[]): StaffAvailability[] {
  return members.map(m => ({
    staffId: m.id,
    status: m.availabilityStatus,
    weeklySlots:
      m.availabilityStatus === '请假中'
        ? []
        : [
            { dayOfWeek: 1, startTime: '09:00', endTime: '21:00' },
            { dayOfWeek: 2, startTime: '09:00', endTime: '21:00' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '21:00' },
            { dayOfWeek: 4, startTime: '09:00', endTime: '21:00' },
            { dayOfWeek: 5, startTime: '09:00', endTime: '21:00' },
            { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
          ],
    blockedDates: m.id === CANONICAL_STAFF_IDS.nora ? ['2026-07-27', '2026-07-28'] : [],
    note: m.id === CANONICAL_STAFF_IDS.nora ? '请假中，不可排' : undefined,
    updatedAt: nowIso(),
  }));
}

/** Legacy seed only — schedule facts live in CourseScheduleService; Staff syncs via Adapter. */
function buildScheduleAssignments(): ScheduleAssignment[] {
  return [];
}

function buildApplications(): StaffApplication[] {
  const S = CANONICAL_STAFF_IDS;
  return [
    {
      id: 'TA-20260727-001',
      type: '请假',
      status: '待审批',
      applicantStaffId: S.nora,
      ownerStaffId: null,
      storeId: STORES.chengxi.id,
      reason: '家庭事务需请假一天',
      note: '影响城西馆上午流瑜伽',
      relatedSessionIds: ['sess_nora_leave'],
      evidence: [{ id: 'ev-1', label: '请假说明', status: 'submitted' }],
      submittedAt: '2026-07-26T18:00:00.000Z',
      updatedAt: '2026-07-26T18:00:00.000Z',
    },
    {
      id: 'TA-20260727-002',
      type: '代课',
      status: '待审批',
      applicantStaffId: S.mia,
      ownerStaffId: S.fangfang,
      storeId: STORES.wanxiang.id,
      reason: '晚高峰负荷过高，申请代课',
      relatedSessionIds: ['sess_wed_pilates'],
      substituteStaffId: null,
      evidence: [{ id: 'ev-2', label: '代课说明', status: 'submitted' }],
      submittedAt: '2026-07-26T20:00:00.000Z',
      updatedAt: '2026-07-26T20:00:00.000Z',
    },
    {
      id: 'TA-20260725-003',
      type: '资料补交',
      status: '待补充',
      applicantStaffId: S.chenyue,
      ownerStaffId: S.anna,
      storeId: STORES.chengxi.id,
      reason: '瑜伽联盟证书更新',
      relatedSessionIds: [],
      evidence: [{ id: 'ev-3', label: '证书扫描件', status: 'missing' }],
      supplementRequest: '请补充清晰证书照片',
      submittedAt: '2026-07-25T10:00:00.000Z',
      updatedAt: '2026-07-26T09:00:00.000Z',
    },
    {
      id: 'TA-20260720-004',
      type: '改期',
      status: '已通过',
      applicantStaffId: S.anna,
      ownerStaffId: S.fangfang,
      storeId: STORES.wanxiang.id,
      reason: '教室冲突改期',
      relatedSessionIds: [],
      evidence: [],
      rescheduleTo: { dateIso: '2026-07-28', startTime: '11:00', endTime: '12:00' },
      approvalComment: '同意改期',
      submittedAt: '2026-07-20T12:00:00.000Z',
      updatedAt: '2026-07-21T09:00:00.000Z',
      impactExecuted: false,
    },
  ];
}

function buildIssues(): StaffIssue[] {
  const S = CANONICAL_STAFF_IDS;
  return [
    {
      id: 'issue-gap-1',
      type: '缺老师',
      title: '今晚 19:45 晚间流瑜伽缺老师',
      severity: 'P0',
      ownerStaffId: S.fangfang,
      relatedSessionId: 'sess_gap_evening_flow',
      dueAt: '2026-07-27T18:00:00.000Z',
      nextAction: '指定老师',
      createdAt: '2026-07-27T08:00:00.000Z',
    },
    {
      id: 'issue-leave-1',
      type: '缺老师',
      title: 'Nora 请假导致城西馆基础流瑜伽需代课',
      severity: 'P0',
      ownerStaffId: S.anna,
      relatedSessionId: 'sess_nora_leave',
      relatedStaffId: S.nora,
      relatedApplicationId: 'TA-20260727-001',
      dueAt: '2026-07-27T09:00:00.000Z',
      nextAction: '更换老师',
      createdAt: '2026-07-26T18:30:00.000Z',
    },
    {
      id: 'issue-conflict-1',
      type: '排课冲突',
      title: 'Anna 7/28 19:30 双课冲突',
      severity: 'P0',
      ownerStaffId: S.fangfang,
      relatedSessionId: 'sess_conflict_b',
      relatedStaffId: S.anna,
      dueAt: '2026-07-28T12:00:00.000Z',
      nextAction: '更换老师',
      createdAt: '2026-07-26T12:00:00.000Z',
    },
    {
      id: 'issue-gap-2',
      type: '缺老师',
      title: '7/30 修复瑜伽待指定老师',
      severity: 'P1',
      ownerStaffId: S.anna,
      relatedSessionId: 'sess_thu_restore',
      dueAt: '2026-07-29T18:00:00.000Z',
      nextAction: '指定老师',
      createdAt: '2026-07-26T14:00:00.000Z',
    },
    {
      id: 'issue-owner-1',
      type: '负责人待指定',
      title: 'Nora 请假申请尚未指定审批负责人',
      severity: 'P1',
      ownerStaffId: null,
      relatedApplicationId: 'TA-20260727-001',
      dueAt: '2026-07-27T12:00:00.000Z',
      nextAction: '指定负责人',
      createdAt: '2026-07-26T18:05:00.000Z',
    },
    {
      id: 'issue-cert-1',
      type: '证书到期',
      title: '陈悦瑜伽联盟证书将于 30 日内到期',
      severity: 'P2',
      ownerStaffId: S.anna,
      relatedStaffId: S.chenyue,
      relatedApplicationId: 'TA-20260725-003',
      dueAt: '2026-08-20T00:00:00.000Z',
      nextAction: '催补资料',
      createdAt: '2026-07-20T00:00:00.000Z',
    },
    {
      id: 'issue-pay-1',
      type: '课酬待确认',
      title: 'Mia 7 月课酬待确认',
      severity: 'P2',
      ownerStaffId: S.fangfang,
      relatedStaffId: S.mia,
      dueAt: '2026-07-31T00:00:00.000Z',
      nextAction: '财务确认',
      createdAt: '2026-07-25T00:00:00.000Z',
    },
    {
      id: 'issue-load-1',
      type: '负荷过高',
      title: 'Mia 未来 7 天负荷偏高',
      severity: 'P1',
      ownerStaffId: S.fangfang,
      relatedStaffId: S.mia,
      relatedSessionId: 'sess_wed_pilates',
      dueAt: '2026-07-28T00:00:00.000Z',
      nextAction: '调整排课或代课',
      createdAt: '2026-07-26T00:00:00.000Z',
    },
  ];
}

function buildTodos(issues: StaffIssue[], applications: StaffApplication[]): StaffTodo[] {
  const S = CANONICAL_STAFF_IDS;
  const todos: StaffTodo[] = [];
  const push = (todo: StaffTodo) => {
    if (todos.some(t => t.dedupeKey === todo.dedupeKey)) return;
    todos.push(todo);
  };

  for (const app of applications) {
    if (app.status === '待审批' && app.type === '请假') {
      push({
        id: `todo-app-${app.id}`,
        type: '请假待审批',
        title: `${app.id} 请假待审批`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P0',
        dedupeKey: `app:${app.id}`,
        createdAt: app.submittedAt,
        dueAt: '2026-07-27T12:00:00.000Z',
      });
    }
    if (app.status === '待审批' && app.type === '代课') {
      push({
        id: `todo-app-${app.id}`,
        type: '代课待确认',
        title: `${app.id} 代课待确认`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P0',
        dedupeKey: `app:${app.id}`,
        createdAt: app.submittedAt,
      });
    }
    if (app.status === '待补充') {
      push({
        id: `todo-app-${app.id}`,
        type: '资料补交待审',
        title: `${app.id} 资料待补充`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P1',
        dedupeKey: `app:${app.id}`,
        createdAt: app.updatedAt,
      });
    }
    if (!app.ownerStaffId && (app.status === '待审批' || app.status === '待补充')) {
      push({
        id: `todo-owner-${app.id}`,
        type: '负责人待指定',
        title: `${app.id} 负责人待指定`,
        ownerStaffId: null,
        relatedApplicationId: app.id,
        severity: 'P1',
        dedupeKey: `owner-app:${app.id}`,
        createdAt: app.submittedAt,
      });
    }
  }

  for (const issue of issues) {
    if (issue.resolved) continue;
    if (issue.type === '缺老师') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '缺老师待指定',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedSessionId: issue.relatedSessionId,
        severity: issue.severity,
        dedupeKey: issue.relatedSessionId ? `gap:${issue.relatedSessionId}` : `issue:${issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '排课冲突') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '排课冲突待处理',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedSessionId: issue.relatedSessionId,
        severity: issue.severity,
        dedupeKey: `conflict:${issue.relatedSessionId ?? issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '证书到期' || issue.type === '合同到期') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '证书或合同到期',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedStaffId: issue.relatedStaffId,
        severity: issue.severity,
        dedupeKey: `cert:${issue.relatedStaffId ?? issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '教学异常') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '教学异常',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        severity: issue.severity,
        dedupeKey: `teach:${issue.id}`,
        createdAt: issue.createdAt,
      });
    } else if (issue.type === '课酬待确认') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '课酬待确认',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedStaffId: issue.relatedStaffId,
        severity: issue.severity,
        dedupeKey: `pay:${issue.relatedStaffId ?? issue.id}`,
        createdAt: issue.createdAt,
      });
    } else if (issue.type === '负责人待指定') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '负责人待指定',
        title: issue.title,
        ownerStaffId: null,
        relatedIssueId: issue.id,
        relatedApplicationId: issue.relatedApplicationId,
        severity: issue.severity,
        dedupeKey: issue.relatedApplicationId
          ? `owner-app:${issue.relatedApplicationId}`
          : `owner-issue:${issue.id}`,
        createdAt: issue.createdAt,
      });
    }
  }

  // Ensure default owner for orphan owner-todos points to fangfang as fallback display only when assigned later
  void S;
  return todos;
}

export function buildInitialStaffSnapshot(): StaffPersistedSnapshot {
  const members = buildMembers();
  const scheduleAssignments = buildScheduleAssignments();
  const applications = buildApplications();
  const issues = buildIssues();
  const todos = buildTodos(issues, applications);
  return {
    version: STAFF_STORAGE_VERSION,
    savedAt: nowIso(),
    prototypePersistence: true,
    actorStaffId: CANONICAL_STAFF_IDS.fangfang,
    storeFilterId: 'all',
    members,
    capabilities: CAPABILITIES,
    availabilities: buildAvailabilities(members),
    scheduleAssignments,
    applications,
    todos,
    issues,
    operationLogs: [],
    domainEvents: [],
    unresolvedReferences: buildUnresolvedReferenceRecords([
      {
        source: 'member.assignedCoach',
        rawValue: '李教练',
        context: '会员档案教练姓名无稳定 ID',
      },
    ]),
    dismissedTodoIds: [],
  };
}

export { STORES as STAFF_SEED_STORES };
