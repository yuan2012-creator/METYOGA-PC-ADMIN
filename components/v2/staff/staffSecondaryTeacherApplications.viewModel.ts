export type TeacherApplicationType =
  | 'leave'
  | 'substitute'
  | 'reschedule'
  | 'credential'
  | 'coursePermission'
  | 'growth';

export type TeacherApplicationStatus =
  | 'submitted'
  | 'evidencePending'
  | 'pendingReview'
  | 'approvedMock'
  | 'rejectedMock'
  | 'needMoreInfo'
  | 'cancelled'
  | 'completedMock';

export type TeacherApplicationImpactLevel = 'P0' | 'P1' | 'P2' | 'normal';

export type TeacherApplicationMaterialStatus =
  | 'complete'
  | 'partial'
  | 'missing'
  | 'notApplicable';

export interface TeacherApplicationSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface TeacherApplicationFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface TeacherApplicationOperationLog {
  id: string;
  operator: string;
  time: string;
  action: string;
  note: string;
}

export interface TeacherApplicationTimelineItem {
  key: string;
  label: string;
  status: 'done' | 'current' | 'pending' | 'mock';
  time?: string;
}

export interface TeacherApplicationEvidenceFile {
  id: string;
  label: string;
  status: 'submitted' | 'pending' | 'missing' | 'na';
  statusLabel: string;
}

export interface TeacherApplicationDrawerDetail {
  applicationId: string;
  applicationType: TeacherApplicationType;
  applicationTypeLabel: string;
  drawerTitle: string;
  approvalStatus: TeacherApplicationStatus;
  approvalStatusLabel: string;
  currentApprover: string;
  submittedAt: string;
  updatedAt: string;
  reason: string;
  teacherName: string;
  teacherLevel: string;
  store: string;
  teachableCourses: string;
  weeklySessions: string;
  loadStatus: string;
  relatedCourse: string;
  courseType: string;
  relatedTime: string;
  bookedCount: number;
  waitlistCount: number;
  room: string;
  affectsThisWeek: boolean;
  needsMemberNotification: boolean;
  substituteTeacher: string;
  conflictStatus: string;
  materialType: string;
  attachmentCount: number;
  materialCompleteness: string;
  reviewPoints: string;
  impactScope: string;
  affectsSchedulingPermission: boolean;
  applicationNote: string;
  evidenceFiles: TeacherApplicationEvidenceFile[];
  materialStatus: TeacherApplicationMaterialStatus;
  materialStatusLabel: string;
  timeline: TeacherApplicationTimelineItem[];
  operationLogs: TeacherApplicationOperationLog[];
  riskReminder: string;
  suggestedAction: string;
}

export interface TeacherApplicationRow {
  applicationId: string;
  applicationType: TeacherApplicationType;
  applicationTypeLabel: string;
  teacherName: string;
  teacherLevel: string;
  store: string;
  relatedCourse: string;
  courseType: string;
  relatedTime: string;
  bookedCount: number;
  waitlistCount: number;
  room: string;
  reason: string;
  submittedAt: string;
  updatedAt: string;
  impactLevel: TeacherApplicationImpactLevel;
  impactScope: string;
  materialStatus: TeacherApplicationMaterialStatus;
  materialStatusLabel: string;
  evidenceFiles: string;
  substituteTeacher: string;
  approvalStatus: TeacherApplicationStatus;
  approvalStatusLabel: string;
  currentApprover: string;
  suggestedAction: string;
  operationLogs: TeacherApplicationOperationLog[];
  drawerDetail: TeacherApplicationDrawerDetail;
}

export interface TeacherApplicationRiskItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  impact: string;
  bookedLabel?: string;
  suggestedAction: string;
  ctaLabel: string;
  relatedApplicationId?: string;
}

export interface TeacherApplicationSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    disclaimer: string;
    rulesToast: string;
  };
  summaryItems: TeacherApplicationSummaryItem[];
  typeTabs: Array<{ id: string; label: string; value: TeacherApplicationType | 'all' }>;
  typeDescriptions: Record<TeacherApplicationType | 'all', string>;
  filterOptions: TeacherApplicationFilterOption[];
  riskQueue: TeacherApplicationRiskItem[];
  rows: TeacherApplicationRow[];
  batchPlaceholder: string;
}

const TYPE_LABELS: Record<TeacherApplicationType, string> = {
  leave: '请假',
  substitute: '代课',
  reschedule: '调课',
  credential: '资料审核',
  coursePermission: '课程权限',
  growth: '成长材料',
};

const STATUS_LABELS: Record<TeacherApplicationStatus, string> = {
  submitted: '已提交',
  evidencePending: '材料待补',
  pendingReview: '待审批',
  approvedMock: '已通过 mock',
  rejectedMock: '已驳回 mock',
  needMoreInfo: '需补充信息',
  cancelled: '已取消',
  completedMock: '已完成 mock',
};

const MATERIAL_LABELS: Record<TeacherApplicationMaterialStatus, string> = {
  complete: '材料完整',
  partial: '部分缺失',
  missing: '材料不足',
  notApplicable: '不适用',
};

const TYPE_DESCRIPTIONS: Record<TeacherApplicationType | 'all', string> = {
  all: '统一查看老师端提交的全部申请，优先处理影响本周课程的请假与代课事项。',
  leave: '重点判断是否影响已预约课程，是否需要代课。',
  substitute: '重点确认代课老师资质、课程类型和会员通知记录。',
  reschedule: '重点确认会员预约、教室和老师冲突。',
  credential: '重点确认老师证书、课程视频和资料完整度。',
  coursePermission: '重点确认老师可授课程、资质与教学负责人意见。',
  growth: '重点确认带教记录、听课记录和晋级材料。',
};

type RowSeed = Omit<
  TeacherApplicationRow,
  'applicationTypeLabel' | 'approvalStatusLabel' | 'materialStatusLabel' | 'drawerDetail'
> & { drawerExtras?: Partial<TeacherApplicationDrawerDetail> };

function evidence(
  items: Array<{ label: string; status: TeacherApplicationEvidenceFile['status'] }>,
): TeacherApplicationEvidenceFile[] {
  const statusMap: Record<TeacherApplicationEvidenceFile['status'], string> = {
    submitted: '已提交',
    pending: '待补充',
    missing: '缺失',
    na: '不适用',
  };
  return items.map((item, i) => ({
    id: `ev-${i}`,
    label: item.label,
    status: item.status,
    statusLabel: statusMap[item.status],
  }));
}

function timeline(
  steps: Array<{ label: string; status: TeacherApplicationTimelineItem['status']; time?: string }>,
): TeacherApplicationTimelineItem[] {
  return steps.map((s, i) => ({ key: `tl-${i}`, ...s }));
}

function logs(
  entries: Array<{ operator: string; time: string; action: string; note: string }>,
): TeacherApplicationOperationLog[] {
  return entries.map((e, i) => ({ id: `log-${i}`, ...e }));
}

function buildDrawer(row: RowSeed): TeacherApplicationDrawerDetail {
  const isCourseRelated = ['leave', 'substitute', 'reschedule'].includes(row.applicationType);
  const isMaterialRelated = ['credential', 'coursePermission', 'growth'].includes(row.applicationType);
  const base: TeacherApplicationDrawerDetail = {
    applicationId: row.applicationId,
    applicationType: row.applicationType,
    applicationTypeLabel: TYPE_LABELS[row.applicationType],
    drawerTitle: `${TYPE_LABELS[row.applicationType]}详情`,
    approvalStatus: row.approvalStatus,
    approvalStatusLabel: STATUS_LABELS[row.approvalStatus],
    currentApprover: row.currentApprover,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
    reason: row.reason,
    teacherName: row.teacherName,
    teacherLevel: row.teacherLevel,
    store: row.store,
    teachableCourses:
      row.applicationType === 'credential' || row.applicationType === 'growth'
        ? '基础流瑜伽 / 待开放课程'
        : row.courseType === '普拉提小班'
          ? '普拉提小班 / 私教'
          : '团课 / 瑜伽小班',
    weeklySessions: row.impactLevel === 'P0' ? '本周 16 节' : '本周 10 节',
    loadStatus: row.teacherName === 'Mia' ? '负载偏高' : row.teacherName === 'Nora' ? '请假中' : '正常',
    relatedCourse: row.relatedCourse,
    courseType: row.courseType,
    relatedTime: row.relatedTime,
    bookedCount: row.bookedCount,
    waitlistCount: row.waitlistCount,
    room: row.room,
    affectsThisWeek: row.impactLevel === 'P0',
    needsMemberNotification:
      row.applicationType === 'substitute' || row.applicationType === 'reschedule',
    substituteTeacher: row.substituteTeacher || '—',
    conflictStatus:
      row.applicationType === 'reschedule'
        ? row.reason.includes('教室')
          ? '教室冲突预警'
          : '老师冲突预警'
        : row.impactLevel === 'P0'
          ? '需人工确认'
          : '通过',
    materialType: isMaterialRelated ? row.relatedCourse : '—',
    attachmentCount: isMaterialRelated ? (row.materialStatus === 'partial' ? 2 : 3) : 0,
    materialCompleteness: isMaterialRelated ? row.materialStatusLabel : '—',
    reviewPoints: isMaterialRelated
      ? '证书有效期、课程视频完整度、带教记录'
      : '—',
    impactScope: row.impactScope,
    affectsSchedulingPermission:
      row.applicationType === 'coursePermission' || row.applicationType === 'credential',
    applicationNote: row.reason,
    evidenceFiles: isCourseRelated
      ? evidence([{ label: '请假说明 / 代课确认', status: 'submitted' }])
      : evidence([
          { label: '资格证书', status: row.materialStatus === 'missing' ? 'missing' : 'submitted' },
          { label: '课程视频', status: row.materialStatus === 'partial' ? 'pending' : 'submitted' },
          { label: '带教记录', status: row.materialStatus === 'missing' ? 'missing' : 'na' },
        ]),
    materialStatus: row.materialStatus,
    materialStatusLabel: MATERIAL_LABELS[row.materialStatus],
    timeline: timeline([
      { label: '已提交', status: 'done', time: row.submittedAt },
      {
        label: '店长 / 教学负责人待审',
        status: row.approvalStatus === 'pendingReview' ? 'current' : 'done',
        time: row.approvalStatus !== 'submitted' ? row.updatedAt : undefined,
      },
      {
        label: '需要补充材料',
        status:
          row.approvalStatus === 'needMoreInfo' || row.approvalStatus === 'evidencePending'
            ? 'current'
            : 'pending',
      },
      { label: '总部复核', status: 'pending' },
      {
        label: '完成 mock',
        status: row.approvalStatus === 'completedMock' ? 'mock' : 'pending',
        time: row.approvalStatus === 'completedMock' ? row.updatedAt : undefined,
      },
    ]),
    operationLogs: row.operationLogs,
    riskReminder:
      row.impactLevel === 'P0'
        ? '影响本周已预约课程，需优先确认代课或调整排课。'
        : row.applicationType === 'coursePermission'
          ? '未开放课程权限前，老师不可排相关课程。'
          : '当前为 mock 流程，操作不会同步老师端。',
    suggestedAction: row.suggestedAction,
  };
  return { ...base, ...row.drawerExtras };
}

function row(seed: RowSeed): TeacherApplicationRow {
  const drawerDetail = buildDrawer(seed);
  return {
    ...seed,
    applicationTypeLabel: TYPE_LABELS[seed.applicationType],
    approvalStatusLabel: STATUS_LABELS[seed.approvalStatus],
    materialStatusLabel: MATERIAL_LABELS[seed.materialStatus],
    drawerDetail,
  };
}

const RAW_ROWS: TeacherApplicationRow[] = [
  row({
    applicationId: 'TA-20260624-001',
    applicationType: 'leave',
    teacherName: 'Nora',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周三 19:30 普拉提小班',
    courseType: '普拉提小班',
    relatedTime: '2026-06-24 19:30–20:30',
    bookedCount: 5,
    waitlistCount: 0,
    room: '普拉提教室',
    reason: '身体不适，申请周三晚间课程请假',
    submittedAt: '2026-06-24 09:12',
    updatedAt: '2026-06-24 10:05',
    impactLevel: 'P0',
    impactScope: '影响本周课程 · 需代课',
    materialStatus: 'notApplicable',
    evidenceFiles: '请假说明 1 份',
    substituteTeacher: 'Mia / Lily',
    approvalStatus: 'pendingReview',
    currentApprover: '店长',
    suggestedAction: '优先确认 Mia / Lily 是否可代课',
    operationLogs: logs([
      { operator: 'Nora', time: '2026-06-24 09:12', action: '提交请假申请', note: '老师端小程序提交' },
      { operator: '系统', time: '2026-06-24 09:13', action: '标记影响本周课程', note: '已预约 5 人' },
    ]),
  }),
  row({
    applicationId: 'TA-20260623-002',
    applicationType: 'leave',
    teacherName: 'Mia',
    teacherLevel: 'T5',
    store: '滨江馆',
    relatedCourse: '周五 19:30 普拉提小班',
    courseType: '普拉提小班',
    relatedTime: '2026-06-26 19:30–20:30',
    bookedCount: 6,
    waitlistCount: 1,
    room: '普拉提教室',
    reason: '家庭事务，申请周五晚间课程请假',
    submittedAt: '2026-06-23 18:40',
    updatedAt: '2026-06-24 08:20',
    impactLevel: 'P0',
    impactScope: '影响本周课程 · 已预约较多',
    materialStatus: 'notApplicable',
    evidenceFiles: '请假说明 1 份',
    substituteTeacher: 'Anna',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '确认代课老师并评估会员通知',
    operationLogs: logs([
      { operator: 'Mia', time: '2026-06-23 18:40', action: '提交请假申请', note: '老师端小程序提交' },
      { operator: '店长', time: '2026-06-24 08:20', action: '待确认代课', note: '建议 Anna 承接' },
    ]),
  }),
  row({
    applicationId: 'TA-20260624-003',
    applicationType: 'substitute',
    teacherName: 'Anna',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周六上午瑜伽小班',
    courseType: '瑜伽小班',
    relatedTime: '2026-06-27 10:30–11:30',
    bookedCount: 6,
    waitlistCount: 0,
    room: 'B 教室',
    reason: '承接 Nora 周六上午课程代课',
    submittedAt: '2026-06-24 11:05',
    updatedAt: '2026-06-24 11:30',
    impactLevel: 'P1',
    impactScope: '课程可开 · 会员通知待确认',
    materialStatus: 'complete',
    evidenceFiles: '代课确认 1 份',
    substituteTeacher: 'Anna',
    approvalStatus: 'pendingReview',
    currentApprover: '教务',
    suggestedAction: '确认代课老师与通知记录',
    operationLogs: logs([
      { operator: 'Anna', time: '2026-06-24 11:05', action: '提交代课申请', note: '承接 Nora 课程' },
      { operator: '系统', time: '2026-06-24 11:06', action: '待确认通知记录', note: '会员通知 mock 占位' },
    ]),
  }),
  row({
    applicationId: 'TA-20260622-004',
    applicationType: 'substitute',
    teacherName: 'Lily',
    teacherLevel: 'T3',
    store: '滨江馆',
    relatedCourse: '周二 18:30 基础瑜伽',
    courseType: '团课',
    relatedTime: '2026-06-23 18:30–19:30',
    bookedCount: 4,
    waitlistCount: 0,
    room: 'A 教室',
    reason: '申请承接基础瑜伽代课',
    submittedAt: '2026-06-22 15:20',
    updatedAt: '2026-06-23 09:00',
    impactLevel: 'P1',
    impactScope: '代课资质待确认',
    materialStatus: 'partial',
    evidenceFiles: '代课确认 / 资质说明',
    substituteTeacher: 'Lily',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '确认 Lily 基础瑜伽授课资质',
    operationLogs: logs([
      { operator: 'Lily', time: '2026-06-22 15:20', action: '提交代课申请', note: '老师端小程序提交' },
    ]),
  }),
  row({
    applicationId: 'TA-20260621-005',
    applicationType: 'reschedule',
    teacherName: 'Mia',
    teacherLevel: 'T5',
    store: '滨江馆',
    relatedCourse: '周五 19:30 普拉提小班',
    courseType: '普拉提小班',
    relatedTime: '2026-06-26 19:30 → 20:30',
    bookedCount: 4,
    waitlistCount: 0,
    room: '普拉提教室',
    reason: '申请将课程延后 1 小时，与老师其他课程冲突',
    submittedAt: '2026-06-21 16:45',
    updatedAt: '2026-06-22 10:10',
    impactLevel: 'P1',
    impactScope: '老师冲突 · 会员预约需确认',
    materialStatus: 'notApplicable',
    evidenceFiles: '调课说明 1 份',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '评估老师冲突与会员通知',
    operationLogs: logs([
      { operator: 'Mia', time: '2026-06-21 16:45', action: '提交调课申请', note: '延后 1 小时' },
      { operator: '系统', time: '2026-06-21 16:46', action: '冲突预警', note: '老师晚间负载冲突' },
    ]),
  }),
  row({
    applicationId: 'TA-20260620-006',
    applicationType: 'reschedule',
    teacherName: 'Nora',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周四 18:30 流瑜伽',
    courseType: '团课',
    relatedTime: '2026-06-25 18:30 → A 教室改 B 教室',
    bookedCount: 8,
    waitlistCount: 2,
    room: 'B 教室',
    reason: '原教室设备维护，申请更换教室',
    submittedAt: '2026-06-20 14:10',
    updatedAt: '2026-06-21 09:30',
    impactLevel: 'P1',
    impactScope: '教室冲突 · 候补会员需通知',
    materialStatus: 'notApplicable',
    evidenceFiles: '调课说明 1 份',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '店长',
    suggestedAction: '确认 B 教室可用并记录会员通知',
    operationLogs: logs([
      { operator: 'Nora', time: '2026-06-20 14:10', action: '提交调课申请', note: '更换教室' },
    ]),
  }),
  row({
    applicationId: 'TA-20260619-007',
    applicationType: 'credential',
    teacherName: '陈悦',
    teacherLevel: 'T2',
    store: '滨江馆',
    relatedCourse: '普拉提教练证书',
    courseType: '—',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '提交普拉提教练资格证书，申请开放小班授课',
    submittedAt: '2026-06-19 11:20',
    updatedAt: '2026-06-20 15:00',
    impactLevel: 'P2',
    impactScope: '可授课程配置未开放',
    materialStatus: 'partial',
    evidenceFiles: '证书 1 份 / 视频 0 份',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '审核证书有效期与课程视频',
    operationLogs: logs([
      { operator: '陈悦', time: '2026-06-19 11:20', action: '提交资料', note: '证书已上传' },
    ]),
  }),
  row({
    applicationId: 'TA-20260618-008',
    applicationType: 'credential',
    teacherName: '王珊',
    teacherLevel: 'T2',
    store: '滨江馆',
    relatedCourse: '基础流过课视频',
    courseType: '团课',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '提交基础流过课视频，申请团课授课资格',
    submittedAt: '2026-06-18 09:50',
    updatedAt: '2026-06-19 14:20',
    impactLevel: 'P2',
    impactScope: '课程视频待审核',
    materialStatus: 'partial',
    evidenceFiles: '视频 1 份（待补清晰度）',
    substituteTeacher: '—',
    approvalStatus: 'evidencePending',
    currentApprover: '教学负责人',
    suggestedAction: '要求补充高清课程视频',
    operationLogs: logs([
      { operator: '王珊', time: '2026-06-18 09:50', action: '提交资料', note: '视频已上传' },
      { operator: '教学负责人', time: '2026-06-19 14:20', action: '要求补充材料', note: '视频清晰度不足' },
    ]),
  }),
  row({
    applicationId: 'TA-20260617-009',
    applicationType: 'coursePermission',
    teacherName: '陈悦',
    teacherLevel: 'T2',
    store: '滨江馆',
    relatedCourse: '普拉提小班',
    courseType: '普拉提小班',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '申请开放普拉提小班独立授课权限',
    submittedAt: '2026-06-17 16:00',
    updatedAt: '2026-06-18 10:30',
    impactLevel: 'P1',
    impactScope: '暂不可排普拉提小班',
    materialStatus: 'partial',
    evidenceFiles: '证书 / 带教记录',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '确认资质、带教记录和课程能力',
    operationLogs: logs([
      { operator: '陈悦', time: '2026-06-17 16:00', action: '提交权限申请', note: '普拉提小班' },
    ]),
  }),
  row({
    applicationId: 'TA-20260616-010',
    applicationType: 'coursePermission',
    teacherName: 'Leo',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '私教进阶权限',
    courseType: '私教',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '申请开放 T4 私教进阶课程权限',
    submittedAt: '2026-06-16 13:40',
    updatedAt: '2026-06-17 09:15',
    impactLevel: 'P2',
    impactScope: '私教权限待确认',
    materialStatus: 'complete',
    evidenceFiles: '资质材料 2 份',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '确认私教资质与带教记录',
    operationLogs: logs([
      { operator: 'Leo', time: '2026-06-16 13:40', action: '提交权限申请', note: '私教进阶' },
    ]),
  }),
  row({
    applicationId: 'TA-20260615-011',
    applicationType: 'growth',
    teacherName: '陈悦',
    teacherLevel: 'T2',
    store: '滨江馆',
    relatedCourse: 'T3 晋级材料',
    courseType: '—',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '提交 T3 晋级材料，含听课记录与教学复盘',
    submittedAt: '2026-06-15 10:20',
    updatedAt: '2026-06-16 11:00',
    impactLevel: 'P2',
    impactScope: '晋级材料待复核',
    materialStatus: 'complete',
    evidenceFiles: '晋级材料 3 份',
    substituteTeacher: '—',
    approvalStatus: 'pendingReview',
    currentApprover: '教学负责人',
    suggestedAction: '复核带教记录与听课记录',
    operationLogs: logs([
      { operator: '陈悦', time: '2026-06-15 10:20', action: '提交成长材料', note: 'T3 晋级' },
    ]),
  }),
  row({
    applicationId: 'TA-20260614-012',
    applicationType: 'growth',
    teacherName: '王珊',
    teacherLevel: 'T2',
    store: '滨江馆',
    relatedCourse: '带教复盘材料',
    courseType: '—',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '提交带教复盘材料，带教记录不完整',
    submittedAt: '2026-06-14 15:30',
    updatedAt: '2026-06-15 09:40',
    impactLevel: 'P2',
    impactScope: '带教记录缺失',
    materialStatus: 'missing',
    evidenceFiles: '带教记录缺失',
    substituteTeacher: '—',
    approvalStatus: 'needMoreInfo',
    currentApprover: '教学负责人',
    suggestedAction: '要求补充带教记录与听课记录',
    operationLogs: logs([
      { operator: '王珊', time: '2026-06-14 15:30', action: '提交成长材料', note: '材料不完整' },
      { operator: '教学负责人', time: '2026-06-15 09:40', action: '要求补充材料', note: '带教记录缺失' },
    ]),
  }),
  row({
    applicationId: 'TA-20260613-013',
    applicationType: 'leave',
    teacherName: 'Anna',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周一 10:30 基础流瑜伽',
    courseType: '团课',
    relatedTime: '2026-06-22 10:30–11:30',
    bookedCount: 2,
    waitlistCount: 0,
    room: 'A 教室',
    reason: '已自行协调代课，申请撤销请假',
    submittedAt: '2026-06-13 08:00',
    updatedAt: '2026-06-13 12:00',
    impactLevel: 'normal',
    impactScope: '已取消',
    materialStatus: 'notApplicable',
    evidenceFiles: '—',
    substituteTeacher: '—',
    approvalStatus: 'cancelled',
    currentApprover: '—',
    suggestedAction: '申请已取消，无需处理',
    operationLogs: logs([
      { operator: 'Anna', time: '2026-06-13 08:00', action: '提交请假申请', note: '后自行撤销' },
      { operator: 'Anna', time: '2026-06-13 12:00', action: '撤销申请', note: '已协调代课' },
    ]),
  }),
  row({
    applicationId: 'TA-20260610-014',
    applicationType: 'substitute',
    teacherName: 'Nora',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周日 16:00 修复瑜伽',
    courseType: '团课',
    relatedTime: '2026-06-21 16:00–17:00',
    bookedCount: 5,
    waitlistCount: 0,
    room: 'A 教室',
    reason: '已完成代课，申请归档记录',
    submittedAt: '2026-06-10 17:00',
    updatedAt: '2026-06-11 10:00',
    impactLevel: 'normal',
    impactScope: '已完成 mock 占位',
    materialStatus: 'complete',
    evidenceFiles: '代课记录 1 份',
    substituteTeacher: 'Nora',
    approvalStatus: 'completedMock',
    currentApprover: '—',
    suggestedAction: 'mock 占位记录，无需再次处理',
    operationLogs: logs([
      { operator: 'Nora', time: '2026-06-10 17:00', action: '提交代课申请', note: '已完成代课' },
      { operator: '教务', time: '2026-06-11 10:00', action: '完成 mock', note: '占位归档' },
    ]),
  }),
  row({
    applicationId: 'TA-20260612-015',
    applicationType: 'growth',
    teacherName: 'Lily',
    teacherLevel: 'T3',
    store: '滨江馆',
    relatedCourse: '听课记录补充',
    courseType: '—',
    relatedTime: '—',
    bookedCount: 0,
    waitlistCount: 0,
    room: '—',
    reason: '补充提交 2 次听课记录',
    submittedAt: '2026-06-12 14:00',
    updatedAt: '2026-06-13 09:00',
    impactLevel: 'P2',
    impactScope: '成长材料补充',
    materialStatus: 'complete',
    evidenceFiles: '听课记录 2 份',
    substituteTeacher: '—',
    approvalStatus: 'submitted',
    currentApprover: '教学负责人',
    suggestedAction: '复核听课记录完整性',
    operationLogs: logs([
      { operator: 'Lily', time: '2026-06-12 14:00', action: '补充成长材料', note: '听课记录' },
    ]),
  }),
  row({
    applicationId: 'TA-20260611-016',
    applicationType: 'reschedule',
    teacherName: 'Anna',
    teacherLevel: 'T4',
    store: '滨江馆',
    relatedCourse: '周三 09:30 阴瑜伽',
    courseType: '团课',
    relatedTime: '2026-06-24 09:30 → 10:30',
    bookedCount: 3,
    waitlistCount: 0,
    room: 'A 教室',
    reason: '申请调整开课时间，避开设备维护',
    submittedAt: '2026-06-11 11:30',
    updatedAt: '2026-06-12 16:00',
    impactLevel: 'P2',
    impactScope: '普通调课申请',
    materialStatus: 'notApplicable',
    evidenceFiles: '调课说明 1 份',
    substituteTeacher: '—',
    approvalStatus: 'submitted',
    currentApprover: '店长',
    suggestedAction: '确认会员预约影响',
    operationLogs: logs([
      { operator: 'Anna', time: '2026-06-11 11:30', action: '提交调课申请', note: '延后 1 小时' },
    ]),
  }),
];

const IMPACT_PRIORITY: Record<TeacherApplicationImpactLevel, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  normal: 3,
};

const TYPE_PRIORITY: Record<TeacherApplicationType, number> = {
  leave: 0,
  substitute: 1,
  reschedule: 2,
  credential: 3,
  coursePermission: 4,
  growth: 5,
};

export function sortTeacherApplications(
  rows: TeacherApplicationRow[],
): TeacherApplicationRow[] {
  return [...rows].sort((a, b) => {
    const impact = IMPACT_PRIORITY[a.impactLevel] - IMPACT_PRIORITY[b.impactLevel];
    if (impact !== 0) return impact;
    const type = TYPE_PRIORITY[a.applicationType] - TYPE_PRIORITY[b.applicationType];
    if (type !== 0) return type;
    return b.submittedAt.localeCompare(a.submittedAt);
  });
}

export function getTeacherApplicationTypeClass(type: TeacherApplicationType): string {
  switch (type) {
    case 'leave':
      return 'met-teacher-app__type--leave';
    case 'substitute':
      return 'met-teacher-app__type--substitute';
    case 'reschedule':
      return 'met-teacher-app__type--reschedule';
    case 'credential':
      return 'met-teacher-app__type--credential';
    case 'coursePermission':
      return 'met-teacher-app__type--permission';
    case 'growth':
      return 'met-teacher-app__type--growth';
    default:
      return '';
  }
}

export function getTeacherApplicationStatusClass(status: TeacherApplicationStatus): string {
  switch (status) {
    case 'pendingReview':
    case 'evidencePending':
    case 'needMoreInfo':
      return 'met-teacher-app__status--pending';
    case 'approvedMock':
    case 'completedMock':
      return 'met-teacher-app__status--mock-done';
    case 'rejectedMock':
    case 'cancelled':
      return 'met-teacher-app__status--closed';
    default:
      return '';
  }
}

export function getTeacherApplicationImpactClass(level: TeacherApplicationImpactLevel): string {
  if (level === 'P0') return 'met-teacher-app__row--p0';
  if (level === 'P1') return 'met-teacher-app__row--p1';
  return '';
}

export function getTeacherApplicationDrawerDetail(
  rows: TeacherApplicationRow[],
  applicationId: string,
): TeacherApplicationDrawerDetail | null {
  return rows.find(r => r.applicationId === applicationId)?.drawerDetail ?? null;
}

export function buildTeacherApplicationsSnapshot(): TeacherApplicationSnapshot {
  return {
    meta: {
      title: '老师端申请审批',
      subtitle: '统一处理老师端提交的请假、代课、调课、资料审核、可授课程和成长材料申请',
      breadcrumbParent: '师资与团队',
      breadcrumbCurrent: '老师端申请审批',
      scopeLabel: '滨江馆 · 本周申请 · 教学负责人视角',
      description:
        '用于处理老师端小程序提交的申请，识别影响本周课程的风险事项，并发起 mock 审批流程。',
      disclaimer:
        '当前为 mock 审批流程，所有通过、驳回、要求补充材料操作均不会真实同步老师端，也不会真实调整排课。',
      rulesToast: '审批规则（待建设）',
    },
    summaryItems: [
      { id: 'sum-all', label: '全部申请', value: '16' },
      { id: 'sum-pending', label: '待审批', value: '7', isWarning: true },
      { id: 'sum-week', label: '影响本周课程', value: '4', isWarning: true },
      { id: 'sum-leave', label: '请假申请', value: '5' },
      { id: 'sum-sub', label: '代课申请', value: '3' },
      { id: 'sum-cred', label: '资料待审核', value: '4' },
      { id: 'sum-perm', label: '课程权限申请', value: '2' },
    ],
    typeTabs: [
      { id: 'tab-all', label: '全部', value: 'all' },
      { id: 'tab-leave', label: '请假', value: 'leave' },
      { id: 'tab-sub', label: '代课', value: 'substitute' },
      { id: 'tab-res', label: '调课', value: 'reschedule' },
      { id: 'tab-cred', label: '资料审核', value: 'credential' },
      { id: 'tab-perm', label: '课程权限', value: 'coursePermission' },
      { id: 'tab-growth', label: '成长材料', value: 'growth' },
    ],
    typeDescriptions: TYPE_DESCRIPTIONS,
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'store-bj', group: 'store', label: '滨江馆', value: 'binjiang' },
      { id: 'type-all', group: 'type', label: '全部类型', value: 'all' },
      { id: 'type-leave', group: 'type', label: '请假', value: 'leave' },
      { id: 'type-sub', group: 'type', label: '代课', value: 'substitute' },
      { id: 'type-res', group: 'type', label: '调课', value: 'reschedule' },
      { id: 'type-cred', group: 'type', label: '资料审核', value: 'credential' },
      { id: 'type-perm', group: 'type', label: '课程权限', value: 'coursePermission' },
      { id: 'type-growth', group: 'type', label: '成长材料', value: 'growth' },
      { id: 'status-all', group: 'status', label: '全部状态', value: 'all' },
      { id: 'status-pending', group: 'status', label: '待审批', value: 'pendingReview' },
      { id: 'status-evidence', group: 'status', label: '材料待补', value: 'evidencePending' },
      { id: 'status-more', group: 'status', label: '需补充信息', value: 'needMoreInfo' },
      { id: 'status-done', group: 'status', label: '已完成 mock', value: 'completedMock' },
      { id: 'impact-all', group: 'impact', label: '全部影响', value: 'all' },
      { id: 'impact-p0', group: 'impact', label: '影响本周课程', value: 'P0' },
      { id: 'impact-p1', group: 'impact', label: '影响排课权限', value: 'P1' },
      { id: 'level-all', group: 'level', label: '全部等级', value: 'all' },
      { id: 'level-t2', group: 'level', label: 'T2', value: 'T2' },
      { id: 'level-t3', group: 'level', label: 'T3', value: 'T3' },
      { id: 'level-t4', group: 'level', label: 'T4', value: 'T4' },
      { id: 'level-t5', group: 'level', label: 'T5', value: 'T5' },
      { id: 'approver-all', group: 'approver', label: '全部审批人', value: 'all' },
      { id: 'course-all', group: 'course', label: '全部课程类型', value: 'all' },
      { id: 'time-all', group: 'time', label: '全部时间', value: 'all' },
    ],
    riskQueue: [
      {
        id: 'risk-1',
        priority: 'P0',
        title: 'Nora 请假影响周三 19:30 普拉提小班',
        bookedLabel: '已预约：5 人',
        impact: '需要代课，否则可能取消课程',
        suggestedAction: '优先确认 Mia / Lily 是否可代课',
        ctaLabel: '处理申请',
        relatedApplicationId: 'TA-20260624-001',
      },
      {
        id: 'risk-2',
        priority: 'P0',
        title: 'Anna 代课申请需确认会员通知',
        bookedLabel: '已预约：6 人',
        impact: '课程可开，但需确认通知记录',
        suggestedAction: '确认代课老师与通知记录',
        ctaLabel: '确认代课',
        relatedApplicationId: 'TA-20260624-003',
      },
      {
        id: 'risk-3',
        priority: 'P1',
        title: '新老师资料待审核',
        impact: '可授课程配置未开放',
        suggestedAction: '教学负责人审核证书与课程视频',
        ctaLabel: '审核资料',
        relatedApplicationId: 'TA-20260619-007',
      },
      {
        id: 'risk-4',
        priority: 'P1',
        title: '课程权限申请待确认',
        impact: '老师暂不可排相关课程',
        suggestedAction: '确认资质、带教记录和课程能力',
        ctaLabel: '查看申请',
        relatedApplicationId: 'TA-20260617-009',
      },
    ],
    rows: sortTeacherApplications(RAW_ROWS),
    batchPlaceholder: '批量操作待建设',
  };
}
