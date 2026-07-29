export type ResearchCenterMetricStatus = 'normal' | 'warning' | 'danger' | 'success' | 'pending';

export type ResearchCenterTabId = 'operation' | 'leads' | 'finance';

export interface CohortConfig {
  id: string;
  name: string;
  displayTitle: string;
  standardPrice: number;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  maxCount: number;
  breakevenCount: number;
  lockCount: number;
  targetCount: number;
  venue: string;
  classroom: string;
  recruitmentOwner: string;
  trainingOwner: string;
  status: string;
  statusTone: 'danger' | 'warning' | 'normal';
  projectDirectCost: number;
  otherFixedProjectCost: number;
  commissionRate: number;
  mentorDirectCost: number;
  accommodationCost: number;
  notes: string;
  durationDays: number;
  paidCount: number;
  totalReceipt: number;
  salesCommission: number;
  contributionProfit: number;
}

export interface CohortFinance {
  paidCount: number;
  totalReceipt: number;
  salesCommission: number;
  contributionProfit: number;
}

export type ScheduleSessionType = '正常教学' | '体能训练' | '实践' | '自习' | '考试' | '结业';

export type SchedulePayMethod = '按天' | '按次' | '按小时' | '固定金额';

/** Unified session lifecycle for teaching delivery (V1.9). */
export type SessionStatus =
  | '草稿'
  | '待确认'
  | '已发布'
  | '待上课'
  | '进行中'
  | '已完成'
  | '已取消'
  | '已改期';

export type AttendanceStatus = '待签到' | '已到' | '请假' | '缺勤' | '迟到' | '早退';
export type LeaveRequestStatus = '待确认' | '已批准' | '已拒绝' | '已撤销';
export type MakeupStatus = '待安排' | '已安排' | '已完成' | '已取消';
export type MakeupMethod = '跟随同产品其他班期' | '当前班期单独补课' | '线上补课' | '免补课';
export type LearningStatus = '正常' | '请假中' | '缺勤异常' | '补课中' | '已退出';
export type TeachingRecordStatus = '未填写' | '已填写';

export const RESEARCH_CENTER_BUSINESS_UNIT_ID = 'bu-metyoga-hq';

export interface ScheduleItem {
  id: string;
  businessUnitId?: string;
  cohortId: string;
  dateIso: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  contentTemplateId?: string;
  teacher: string;
  venue: string;
  classroom: string;
  sessionType: ScheduleSessionType;
  calcPay: boolean;
  payMethod?: SchedulePayMethod;
  payAmount: number;
  customPayReason?: string;
  note: string;
  status: SessionStatus;
  /** Original date kept after reschedule. */
  originalDateIso?: string;
  cancelReason?: string;
  attendanceSaved?: boolean;
  signedCount?: number;
  leaveCount?: number;
  absentCount?: number;
  teachingRecordId?: string;
}

export interface ScheduleDraft {
  dateIso: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  contentTemplateId?: string;
  customContent?: string;
  teacher: string;
  venue: string;
  classroom: string;
  sessionType: ScheduleSessionType;
  calcPay: boolean;
  payMethod?: SchedulePayMethod;
  payAmount: number;
  customPayReason?: string;
  note: string;
  cohortId?: string;
  status?: SessionStatus;
}

export interface AttendanceEntry {
  studentId: string;
  leadId: string;
  status: AttendanceStatus;
  note?: string;
  previousStatus?: AttendanceStatus;
}

export interface AttendanceSheet {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  entries: AttendanceEntry[];
  savedAt: string;
  operator: string;
}

export interface LeaveRequest {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  studentId: string;
  leadId: string;
  reason: string;
  leaveAt: string;
  needMakeup: boolean;
  note?: string;
  operator: string;
  status: LeaveRequestStatus;
  makeupId?: string;
  createdAt: string;
}

export interface MakeupRecord {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  studentId: string;
  leadId: string;
  leaveRequestId?: string;
  method: MakeupMethod;
  makeupDate: string;
  makeupSessionId?: string;
  teacher: string;
  note?: string;
  status: MakeupStatus;
  createdAt: string;
  completedAt?: string;
}

export interface TeachingRecord {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  contentActual: string;
  completionStatus: string;
  studentPerformance: string;
  keyIssues: string;
  nextSuggestion: string;
  attachmentNote: string;
  recorder: string;
  recordedAt: string;
  anomalyNote?: string;
}

export interface ScheduleChangeLog {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  changeType: '更换导师' | '改期' | '取消' | '复制' | '状态变更' | '删除';
  before: string;
  after: string;
  reason: string;
  operator: string;
  at: string;
}

export interface AttendanceDraft {
  sessionId: string;
  entries: AttendanceEntry[];
  operator: string;
}

export interface LeaveDraft {
  studentId: string;
  sessionId: string;
  reason: string;
  leaveAt: string;
  needMakeup: boolean;
  note: string;
  operator: string;
}

export interface MakeupDraft {
  leaveRequestId?: string;
  studentId: string;
  sessionId: string;
  method: MakeupMethod;
  makeupDate: string;
  makeupSessionId?: string;
  teacher: string;
  note: string;
}

export interface TeachingRecordDraft {
  sessionId: string;
  contentActual: string;
  completionStatus: string;
  studentPerformance: string;
  keyIssues: string;
  nextSuggestion: string;
  attachmentNote: string;
  recorder: string;
  anomalyNote?: string;
}

export type LeadStage =
  | '新咨询'
  | '待联系'
  | '已联系'
  | '有效意向'
  | '待面试'
  | '已面试'
  | '面试通过'
  | '已发方案'
  | '待签约'
  | '已签约'
  | '部分付款'
  | '已付清'
  | '已入班'
  | '暂缓'
  | '已流失'
  | '已退款';

export type PaymentStatus = '未付款' | '部分付款' | '已付清' | '部分退款' | '已退款';
export type ContractStatus = '未签约' | '已签约' | '已作废';
export type InterviewResultValue =
  | '通过'
  | '有条件通过'
  | '建议其他课程'
  | '暂不适合'
  | '未到场';

export interface FollowUpRecord {
  id: string;
  method: string;
  result: string;
  nextStep: string;
  nextFollowUpDate: string;
  createdAt: string;
  intentLevel?: string;
  stage?: string;
  note?: string;
}

export interface InterviewRecord {
  status: '待面试' | '已面试';
  result?: InterviewResultValue;
  suggestedCourse?: string;
  interviewer?: string;
  note?: string;
  scheduledAt?: string;
  interviewMode?: string;
  foundationEval?: string;
  timeEval?: string;
  goalEval?: string;
  riskNote?: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  phone?: string;
  wechat?: string;
  course: string;
  intentLevel: string;
  intentTone: 'high' | 'medium' | 'low';
  stage: LeadStage | string;
  expectedAmount: number;
  paidAmount: number;
  lastFollowUp: string;
  nextFollowUpDate?: string;
  overdueDays: number;
  owner: string;
  suggestedAction: string;
  categories: string[];
  enrolled: boolean;
  source?: string;
  learningBase?: string;
  learningPurpose?: string;
  budgetNote?: string;
  timeCondition?: string;
  targetCohortId?: string;
  note?: string;
  followUps?: FollowUpRecord[];
  interview?: InterviewRecord;
  enrolledCohortIds?: string[];
  anomaly?: string | null;
}

export interface EnrollmentRecord {
  id: string;
  leadId: string;
  cohortId: string;
  studentName: string;
  course: string;
  standardPrice: number;
  dealPrice: number;
  paidAmount: number;
  enrollmentStatus: string;
  paymentStatus: PaymentStatus | string;
  contractStatus: ContractStatus | string;
  paymentMethod: string;
  owner: string;
  createdAt: string;
  refunded: boolean;
  joined: boolean;
  note?: string;
}

export interface EnrollmentDraft {
  mode: 'existing' | 'new';
  leadId?: string;
  newName?: string;
  cohortId: string;
  course: string;
  standardPrice: number;
  dealPrice: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus | string;
  contractStatus: ContractStatus | string;
  owner: string;
  note?: string;
  /** Optional initial receipt amount at enrollment time (0 = unpaid). */
  initialReceiptAmount?: number;
}

export interface LeadDraft {
  name: string;
  phone: string;
  wechat: string;
  course: string;
  source: string;
  learningBase: string;
  learningPurpose: string;
  budgetNote: string;
  timeCondition: string;
  intentLevel: string;
  owner: string;
  expectedAmount: number;
  targetCohortId: string;
  nextFollowUpDate: string;
  note: string;
}

export interface FollowUpDraft {
  leadId: string;
  method: string;
  result: string;
  intentLevel: string;
  stage: string;
  nextStep: string;
  nextFollowUpDate: string;
  note: string;
}

export interface InterviewScheduleDraft {
  leadId: string;
  scheduledAt: string;
  interviewMode: string;
  interviewer: string;
  suggestedCourse: string;
  note: string;
}

export interface InterviewResultDraft {
  leadId: string;
  result: InterviewResultValue;
  foundationEval: string;
  timeEval: string;
  goalEval: string;
  suggestedCourse: string;
  riskNote: string;
  interviewer: string;
  note: string;
}

export interface ReceiptDraft {
  enrollmentId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  operator: string;
  note: string;
}

export interface RefundDraft {
  enrollmentId: string;
  amount: number;
  reason: string;
  date: string;
  operator: string;
  exitCohort: boolean;
}

export interface CashReceiptEvent {
  id: string;
  date: string;
  title: string;
  amount: number;
  enrollmentId?: string;
  leadId?: string;
  cohortId?: string;
  paymentMethod?: string;
  operator?: string;
  serialNo?: string;
  status?: string;
  note?: string;
  kind?: 'receipt' | 'refund' | 'payout';
}

export interface MentorPayableItem {
  id: string;
  teacher: string;
  cohortId: string;
  sessionId: string;
  sessionLabel: string;
  dueAmount: number;
  paidAmount: number;
  dueDate: string;
  status: '待付款' | '部分支付' | '已支付' | '已冲回';
}

export interface OperationLogEntry {
  id: string;
  at: string;
  operator: string;
  type: string;
  target: string;
  before: string;
  after: string;
  reason: string;
}

export interface TodoItem {
  id: string;
  title: string;
  hint?: string;
  actions: { id: string; label: string }[];
  done: boolean;
}

export interface QuickLeadCategory {
  id: string;
  label: string;
  count: number;
}

export interface ResearchCenterMeta {
  title: string;
  subtitle: string;
  unitLabel: string;
  periodLabel: string;
  caliberLabel: string;
  updatedAt: string;
  headerActions: { id: string; label: string }[];
}

export interface ResearchCenterDiagnosis {
  statusLabel: string;
  statusTone: 'danger' | 'warning' | 'normal';
  conclusion: string;
  facts: { label: string; value: string; tone?: 'danger' | 'warning' | 'normal' }[];
  actions: { id: string; label: string }[];
}

export interface ResearchCenterSummaryMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  status?: ResearchCenterMetricStatus;
}

export interface ResearchCenterProgressMilestone {
  id: string;
  label: string;
  count: number;
  type: 'start' | 'breakeven' | 'lock' | 'target' | 'full';
}

export interface ResearchCenterCohortDiagnosis {
  title: string;
  venue: string;
  durationDays: number;
  paidCount: number;
  maxCount: number;
  lockCount: number;
  targetCount: number;
  currentCount: number;
  milestones: ResearchCenterProgressMilestone[];
  finance: { label: string; value: string; tone?: 'danger' | 'warning' | 'normal' }[];
  conclusion: string;
  actionHint: string;
  actions: { id: string; label: string }[];
}

export interface ResearchCenterFunnelStage {
  id: string;
  stage: string;
  count: number;
  conversionRate?: string;
  expectedAmount?: string;
  overdueCount?: number;
}

export interface ResearchCenterLeadCard {
  id: string;
  name: string;
  course: string;
  intentLevel: string;
  intentTone: 'high' | 'medium' | 'low';
  stage: string;
  expectedAmount: string;
  lastFollowUp: string;
  overdueDays: number;
  owner: string;
  suggestedAction: string;
}

export interface ResearchCenterCashForecastPoint {
  id: string;
  label: string;
  inflow: number | null;
  outflow: number | null;
  net: number | null;
  incomplete?: boolean;
}

export interface ResearchCenterRenovationRisk {
  totalAmount: string;
  deadline: string;
  configuredPayment: string;
  impactLabel: string;
  actionLabel: string;
}

export interface ResearchCenterRecoveryScenario {
  id: 'conservative' | 'target' | 'full';
  label: string;
  description: string;
}

export interface ResearchCenterRecovery {
  totalAmount: string;
  paidAmount: string;
  cashSurplus: string;
  progress: string;
  estimatedMonth: string;
  scenarios: ResearchCenterRecoveryScenario[];
  disclaimer: string;
}

export interface ResearchCenterPriorityAction {
  id: string;
  severity: string;
  severityTone: 'p0' | 'p1' | 'p2';
  title: string;
  impact: string;
  owner: string;
  deadline: string;
  suggestedAction: string;
  actions: { id: string; label: string }[];
}

export interface ResearchCenterDrawerContent {
  title: string;
  subtitle: string;
  sections: { title: string; rows: { label: string; value: string }[] }[];
  notes?: string[];
  footerActions: { label: string }[];
}

export interface ResearchCenterV2Snapshot {
  meta: ResearchCenterMeta;
  diagnosis: ResearchCenterDiagnosis;
  summaryMetrics: ResearchCenterSummaryMetric[];
  cohortDiagnosis: ResearchCenterCohortDiagnosis;
  funnelStages: ResearchCenterFunnelStage[];
  funnelNote: string;
  funnelEstimate: string;
  funnelDisclaimer: string;
  leads: ResearchCenterLeadCard[];
  cashForecast: {
    title: string;
    incompleteWarning: string;
    points: ResearchCenterCashForecastPoint[];
    legend: { label: string; tone: 'inflow' | 'outflow' | 'incomplete' }[];
  };
  renovationRisk: ResearchCenterRenovationRisk;
  renovationRecovery: ResearchCenterRecovery;
  priorityActions: ResearchCenterPriorityAction[];
  drawerContentMap: Record<string, ResearchCenterDrawerContent>;
  leadDetailMap: Record<string, ResearchCenterDrawerContent>;
}

export function getResearchCenterSeverityClass(tone: ResearchCenterPriorityAction['severityTone']): string {
  const map: Record<ResearchCenterPriorityAction['severityTone'], string> = {
    p0: 'met-rc-v2-severity--p0',
    p1: 'met-rc-v2-severity--p1',
    p2: 'met-rc-v2-severity--p2',
  };
  return map[tone];
}

export function getResearchCenterIntentClass(tone: ResearchCenterLeadCard['intentTone']): string {
  const map: Record<ResearchCenterLeadCard['intentTone'], string> = {
    high: 'met-rc-v2-intent--high',
    medium: 'met-rc-v2-intent--medium',
    low: 'met-rc-v2-intent--low',
  };
  return map[tone];
}

export function createInitialCohortState(): { cohorts: CohortConfig[] } {
  const cohort: CohortConfig = {
    id: 'cohort-ryt200-0727',
    name: 'RYT200',
    displayTitle: 'RYT200｜2026年7月27日班',
    standardPrice: 12800,
    startDate: '2026-07-27',
    endDate: '2026-08-21',
    enrollmentDeadline: '2026-07-20',
    maxCount: 12,
    breakevenCount: 4,
    lockCount: 7,
    targetCount: 10,
    venue: '502室',
    classroom: '502主教室',
    recruitmentOwner: '待指定',
    trainingOwner: '大鹏',
    status: '招生中',
    statusTone: 'danger',
    projectDirectCost: 44000,
    otherFixedProjectCost: 0,
    commissionRate: 0.05,
    mentorDirectCost: 0,
    accommodationCost: 0,
    notes: '',
    durationDays: 26,
    paidCount: 3,
    totalReceipt: 38400,
    salesCommission: 1920,
    contributionProfit: -7520,
  };
  return {
    cohorts: [
      cohort,
      {
        ...cohort,
        id: 'cohort-ryt200-0901',
        displayTitle: 'RYT200｜2026年9月1日班',
        startDate: '2026-09-01',
        endDate: '2026-09-26',
        status: '草稿',
        statusTone: 'normal',
        paidCount: 0,
        totalReceipt: 0,
        salesCommission: 0,
        contributionProfit: -44000,
      },
    ],
  };
}

export function createInitialSchedules(): ScheduleItem[] {
  const cohortId = 'cohort-ryt200-0727';
  const bu = RESEARCH_CENTER_BUSINESS_UNIT_ID;
  const rows: Omit<ScheduleItem, 'id'>[] = [
    {
      businessUnitId: bu,
      cohortId,
      dateIso: '2026-07-27',
      date: '7月27日',
      startTime: '09:00',
      endTime: '12:00',
      content: '体式基础',
      contentTemplateId: '体式基础',
      teacher: '大鹏',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '正常教学',
      calcPay: true,
      payMethod: '按天',
      payAmount: 2000,
      note: '计算课酬：2,000元/天',
      status: '已发布',
    },
    {
      businessUnitId: bu,
      cohortId,
      dateIso: '2026-07-27',
      date: '7月27日',
      startTime: '12:30',
      endTime: '13:30',
      content: '体能训练',
      contentTemplateId: '体能训练',
      teacher: '锐霖',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '体能训练',
      calcPay: true,
      payMethod: '按次',
      payAmount: 100,
      note: '计算课酬：100元/次',
      status: '已发布',
    },
    {
      businessUnitId: bu,
      cohortId,
      dateIso: '2026-07-27',
      date: '7月27日',
      startTime: '14:00',
      endTime: '17:00',
      content: '教学实践',
      contentTemplateId: '教学实践',
      teacher: '大鹏',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '实践',
      calcPay: true,
      payMethod: '按天',
      payAmount: 2000,
      note: '',
      status: '已发布',
    },
    {
      businessUnitId: bu,
      cohortId,
      dateIso: '2026-07-28',
      date: '7月28日',
      startTime: '09:00',
      endTime: '12:00',
      content: '体式进阶',
      contentTemplateId: '体式基础',
      teacher: '大鹏',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '正常教学',
      calcPay: true,
      payMethod: '按天',
      payAmount: 2000,
      note: '',
      status: '已发布',
    },
    {
      businessUnitId: bu,
      cohortId,
      dateIso: '2026-07-28',
      date: '7月28日',
      startTime: '14:00',
      endTime: '16:00',
      content: '自习复盘',
      contentTemplateId: '自习复盘',
      teacher: '—',
      venue: '502室',
      classroom: '502主教室',
      sessionType: '自习',
      calcPay: false,
      payAmount: 0,
      note: '',
      status: '已发布',
    },
  ];
  return rows.map((row, index) => ({ id: `sch-${index + 1}`, ...row }));
}

/** Normalize legacy schedule rows missing V1.9 fields. */
export function normalizeScheduleItem(
  item: ScheduleItem | (Partial<ScheduleItem> & { id: string }),
  fallbackCohortId = 'cohort-ryt200-0727',
): ScheduleItem {
  return {
    id: item.id,
    businessUnitId: item.businessUnitId ?? RESEARCH_CENTER_BUSINESS_UNIT_ID,
    cohortId: item.cohortId ?? fallbackCohortId,
    dateIso: item.dateIso ?? '',
    date: item.date ?? '',
    startTime: item.startTime ?? '',
    endTime: item.endTime ?? '',
    content: item.content ?? '',
    contentTemplateId: item.contentTemplateId,
    teacher: item.teacher ?? '',
    venue: item.venue ?? '',
    classroom: item.classroom ?? '',
    sessionType: item.sessionType ?? '正常教学',
    calcPay: Boolean(item.calcPay),
    payMethod: item.payMethod,
    payAmount: Number(item.payAmount) || 0,
    customPayReason: item.customPayReason,
    note: item.note ?? '',
    status: item.status ?? '已发布',
    originalDateIso: item.originalDateIso,
    cancelReason: item.cancelReason,
    attendanceSaved: item.attendanceSaved,
    signedCount: item.signedCount,
    leaveCount: item.leaveCount,
    absentCount: item.absentCount,
    teachingRecordId: item.teachingRecordId,
  };
}

export function createInitialLeads(): LeadRecord[] {
  return [
    {
      id: 'lead-1',
      name: '林晓雯',
      course: 'RYT200',
      intentLevel: '高',
      intentTone: 'high',
      stage: '已发方案',
      expectedAmount: 12800,
      paidAmount: 0,
      lastFollowUp: '2026-07-08',
      overdueDays: 3,
      owner: '待指定',
      suggestedAction: '确认面试时间与住宿安排',
      categories: ['contact-today', 'overdue'],
      enrolled: false,
      followUps: [],
      enrolledCohortIds: [],
    },
    {
      id: 'lead-2',
      name: '周明哲',
      course: 'RYT200',
      intentLevel: '高',
      intentTone: 'high',
      stage: '面试通过',
      expectedAmount: 12800,
      paidAmount: 0,
      lastFollowUp: '2026-07-06',
      overdueDays: 5,
      owner: '待指定',
      suggestedAction: '发送正式方案与合同模板',
      categories: ['contact-today', 'interview-passed', 'overdue'],
      enrolled: false,
      followUps: [],
      enrolledCohortIds: [],
      interview: { status: '已面试', result: '通过', suggestedCourse: 'RYT200', interviewer: '教培负责人' },
    },
    {
      id: 'lead-3',
      name: '陈一宁',
      course: 'RYT200',
      intentLevel: '中',
      intentTone: 'medium',
      stage: '部分付款',
      expectedAmount: 12800,
      paidAmount: 6400,
      lastFollowUp: '2026-07-10',
      overdueDays: 1,
      owner: '待指定',
      suggestedAction: '催收尾款并完成签约资料',
      categories: ['contact-today', 'deposit-paid'],
      enrolled: false,
      followUps: [],
      enrolledCohortIds: [],
      interview: { status: '已面试', result: '通过', suggestedCourse: 'RYT200' },
      anomaly: null,
    },
    {
      id: 'lead-4',
      name: '赵思琪',
      course: 'RYT200',
      intentLevel: '中',
      intentTone: 'medium',
      stage: '有效意向',
      expectedAmount: 12800,
      paidAmount: 0,
      lastFollowUp: '2026-07-04',
      overdueDays: 7,
      owner: '待指定',
      suggestedAction: '电话回访确认上课意向',
      categories: ['overdue'],
      enrolled: false,
      followUps: [],
      enrolledCohortIds: [],
    },
    {
      id: 'lead-5',
      name: '何嘉怡',
      course: 'RYT200',
      intentLevel: '低',
      intentTone: 'low',
      stage: '新咨询',
      expectedAmount: 12800,
      paidAmount: 0,
      lastFollowUp: '2026-07-11',
      overdueDays: 0,
      owner: '待指定',
      suggestedAction: '24小时内首次电话建联',
      categories: ['contact-today'],
      enrolled: false,
      followUps: [],
      enrolledCohortIds: [],
    },
    {
      id: 'lead-enrolled-a',
      name: '学员A',
      course: 'RYT200',
      intentLevel: '高',
      intentTone: 'high',
      stage: '已入班',
      expectedAmount: 12800,
      paidAmount: 12800,
      lastFollowUp: '2026-07-05',
      overdueDays: 0,
      owner: '芳芳',
      suggestedAction: '完成入班资料',
      categories: [],
      enrolled: true,
      enrolledCohortIds: ['cohort-ryt200-0727'],
      followUps: [],
    },
    {
      id: 'lead-enrolled-b',
      name: '学员B',
      course: 'RYT200',
      intentLevel: '高',
      intentTone: 'high',
      stage: '已入班',
      expectedAmount: 12800,
      paidAmount: 12800,
      lastFollowUp: '2026-07-08',
      overdueDays: 0,
      owner: '芳芳',
      suggestedAction: '完成入班资料',
      categories: [],
      enrolled: true,
      enrolledCohortIds: ['cohort-ryt200-0727'],
      followUps: [],
    },
    {
      id: 'lead-enrolled-c',
      name: '学员C',
      course: 'RYT200',
      intentLevel: '高',
      intentTone: 'high',
      stage: '已入班',
      expectedAmount: 12800,
      paidAmount: 12800,
      lastFollowUp: '2026-07-10',
      overdueDays: 0,
      owner: '芳芳',
      suggestedAction: '完成入班资料',
      categories: [],
      enrolled: true,
      enrolledCohortIds: ['cohort-ryt200-0727'],
      followUps: [],
    },
  ];
}

export function createInitialEnrollments(): EnrollmentRecord[] {
  return [
    {
      id: 'enroll-a',
      leadId: 'lead-enrolled-a',
      cohortId: 'cohort-ryt200-0727',
      studentName: '学员A',
      course: 'RYT200',
      standardPrice: 12800,
      dealPrice: 12800,
      paidAmount: 12800,
      enrollmentStatus: '已报名',
      paymentStatus: '已付清',
      contractStatus: '已签约',
      paymentMethod: '微信',
      owner: '芳芳',
      createdAt: '2026-07-05',
      refunded: false,
      joined: true,
    },
    {
      id: 'enroll-b',
      leadId: 'lead-enrolled-b',
      cohortId: 'cohort-ryt200-0727',
      studentName: '学员B',
      course: 'RYT200',
      standardPrice: 12800,
      dealPrice: 12800,
      paidAmount: 12800,
      enrollmentStatus: '已报名',
      paymentStatus: '已付清',
      contractStatus: '已签约',
      paymentMethod: '支付宝',
      owner: '芳芳',
      createdAt: '2026-07-08',
      refunded: false,
      joined: true,
    },
    {
      id: 'enroll-c',
      leadId: 'lead-enrolled-c',
      cohortId: 'cohort-ryt200-0727',
      studentName: '学员C',
      course: 'RYT200',
      standardPrice: 12800,
      dealPrice: 12800,
      paidAmount: 12800,
      enrollmentStatus: '已报名',
      paymentStatus: '已付清',
      contractStatus: '已签约',
      paymentMethod: '银行转账',
      owner: '芳芳',
      createdAt: '2026-07-10',
      refunded: false,
      joined: true,
    },
  ];
}

export function createInitialCashReceipts(): CashReceiptEvent[] {
  return [
    {
      id: 'cash-a',
      date: '2026-07-05',
      title: '学员A 收款',
      amount: 12800,
      enrollmentId: 'enroll-a',
      leadId: 'lead-enrolled-a',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '微信',
      operator: '芳芳',
      serialNo: 'RC-20260705-001',
      status: '已确认',
      kind: 'receipt',
    },
    {
      id: 'cash-b',
      date: '2026-07-08',
      title: '学员B 收款',
      amount: 12800,
      enrollmentId: 'enroll-b',
      leadId: 'lead-enrolled-b',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '支付宝',
      operator: '芳芳',
      serialNo: 'RC-20260708-001',
      status: '已确认',
      kind: 'receipt',
    },
    {
      id: 'cash-c',
      date: '2026-07-10',
      title: '学员C 收款',
      amount: 12800,
      enrollmentId: 'enroll-c',
      leadId: 'lead-enrolled-c',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '银行转账',
      operator: '芳芳',
      serialNo: 'RC-20260710-001',
      status: '已确认',
      kind: 'receipt',
    },
  ];
}

export function createInitialMentorPayables(schedules: ScheduleItem[], cohortId: string): MentorPayableItem[] {
  return schedules
    .filter(s => s.calcPay && s.payAmount > 0)
    .map(s => ({
      id: `mp-${s.id}`,
      teacher: s.teacher,
      cohortId,
      sessionId: s.id,
      sessionLabel: `${s.date} ${s.content}`,
      dueAmount: s.payAmount,
      paidAmount: s.id === 'sch-1' ? 2000 : 0,
      dueDate: s.dateIso,
      status: (s.id === 'sch-1' ? '部分支付' : '待付款') as MentorPayableItem['status'],
    }));
}

export function createInitialTodos(): TodoItem[] {
  return [
    {
      id: 'todo-breakeven',
      title: '距离直接保本还差1名实缴学员',
      actions: [
        { id: 'add-enrollment', label: '添加报名' },
        { id: 'high-intent', label: '查看高意向' },
      ],
      done: false,
    },
    {
      id: 'todo-lock',
      title: '距离锁班还差4人',
      actions: [{ id: 'recruit', label: '发起补招' }],
      done: false,
    },
    {
      id: 'todo-owner',
      title: '招生负责人未指定',
      actions: [{ id: 'assign-owner', label: '指定负责人' }],
      done: false,
    },
    {
      id: 'todo-payment',
      title: '硬装付款计划未设置',
      hint: '影响金额220,000元',
      actions: [{ id: 'cash-plan', label: '配置计划' }],
      done: false,
    },
    {
      id: 'todo-venue',
      title: '502室将于2026年8月31日停止使用',
      actions: [{ id: 'check-schedule', label: '检查课表' }],
      done: false,
    },
  ];
}

export function mapOperationMetricsToGrid(
  items: { id: string; label: string; value: string; hint: string; status?: ResearchCenterMetricStatus }[],
): import('../shared').SummaryMetricItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    hint: item.hint,
    status:
      item.status === 'danger'
        ? 'danger'
        : item.status === 'warning'
          ? 'warning'
          : item.status === 'success'
            ? 'success'
            : 'normal',
  }));
}

export function mapResearchCenterSummaryToGrid(
  items: ResearchCenterSummaryMetric[],
): import('../shared').SummaryMetricItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    hint: item.hint,
    status:
      item.status === 'danger'
        ? 'danger'
        : item.status === 'warning'
          ? 'warning'
          : item.status === 'success'
            ? 'success'
            : 'normal',
  }));
}

export function buildResearchCenterV2Snapshot(): ResearchCenterV2Snapshot {
  const drawerContentMap: Record<string, ResearchCenterDrawerContent> = {
    risk: {
      title: '经营风险清单',
      subtitle: 'RYT200 班期与硬装付款相关风险',
      sections: [
        {
          title: '班期风险',
          rows: [
            { label: '风险班期', value: 'RYT200｜2026年7月27日班' },
            { label: '当前实缴', value: '3 人' },
            { label: '直接保本线', value: '4 人（还差 1 人）' },
            { label: '建议锁班线', value: '7 人（还差 4 人）' },
            { label: '项目贡献利润', value: '-7,520 元' },
          ],
        },
        {
          title: '现金风险',
          rows: [
            { label: '硬装总额', value: '220,000 元' },
            { label: '最晚付清', value: '2026-12-31' },
            { label: '已配置付款', value: '待配置' },
            { label: '未来 60 天预测', value: '预测不完整' },
          ],
        },
      ],
      notes: ['未配置付款计划前，不得将装修摊销与实付现金混算。'],
      footerActions: [{ label: '关闭' }, { label: '制定行动' }],
    },
    'action-plan': {
      title: '制定行动计划',
      subtitle: 'RYT200 补招与硬装付款配置',
      sections: [
        {
          title: '优先行动',
          rows: [
            { label: '行动 1', value: '补充 RYT200 招生，至少新增 1 名实缴学员覆盖直接成本' },
            { label: '行动 2', value: '指定班期招生负责人' },
            { label: '行动 3', value: '配置 220,000 元硬装付款计划' },
            { label: '行动 4', value: '检查 502 室 2026-08-31 停用前课表' },
          ],
        },
        {
          title: '责任与截止',
          rows: [
            { label: '负责人', value: '待指定' },
            { label: '截止时间', value: '待配置' },
          ],
        },
      ],
      notes: ['当前为 mock 行动计划，不会真实下发或同步。'],
      footerActions: [{ label: '保存草稿（待建设）' }, { label: '关闭' }],
    },
    cohort: {
      title: '班期详情',
      subtitle: 'RYT200｜2026年7月27日班',
      sections: [
        {
          title: '基础信息',
          rows: [
            { label: '场地', value: '502 室' },
            { label: '周期', value: '26 天' },
            { label: '当前实缴', value: '3 人' },
            { label: '最大人数', value: '12 人' },
            { label: '建议锁班', value: '7 人' },
            { label: '经营目标', value: '10 人' },
          ],
        },
        {
          title: '财务摘要',
          rows: [
            { label: '当前招生收入', value: '38,400 元' },
            { label: '销售提成', value: '1,920 元' },
            { label: '项目直接成本', value: '44,000 元' },
            { label: '项目贡献利润', value: '-7,520 元' },
          ],
        },
      ],
      footerActions: [{ label: '关闭' }],
    },
    leads: {
      title: 'RYT200 线索名单',
      subtitle: '按阶段与超时天数排序（mock）',
      sections: [
        {
          title: '线索概览',
          rows: [
            { label: '有效意向', value: '18 人' },
            { label: '待跟进超时', value: '5 人' },
            { label: '预计可转化', value: '4–6 人（估算）' },
          ],
        },
      ],
      notes: ['名单明细在抽屉内展示，首页不以表格为主体。'],
      footerActions: [{ label: '关闭' }],
    },
    recruit: {
      title: '制定补招方案',
      subtitle: 'RYT200｜2026年7月27日班',
      sections: [
        {
          title: '补招目标',
          rows: [
            { label: '直接成本保本', value: '至少新增 1 名实缴学员' },
            { label: '建议锁班', value: '距离锁班还差 4 人' },
            { label: '所需有效意向（估）', value: '至少 16 名（按 25% 转化率）' },
          ],
        },
      ],
      notes: ['当前为估算值，待积累真实历史数据后校准。'],
      footerActions: [{ label: '生成方案草稿（待建设）' }, { label: '关闭' }],
    },
    budget: {
      title: '调整班期预算',
      subtitle: 'RYT200 项目直接成本与招生目标',
      sections: [
        {
          title: '预算项',
          rows: [
            { label: '项目直接成本', value: '44,000 元' },
            { label: '销售提成预算', value: '按实缴人数计提' },
            { label: '场地成本', value: '502 室（实际成本待录入）' },
          ],
        },
      ],
      notes: ['调整预算不会自动修改已发生收款与成本。'],
      footerActions: [{ label: '提交调整申请（待建设）' }, { label: '关闭' }],
    },
    'cash-plan': {
      title: '配置硬装付款计划',
      subtitle: '220,000 元硬装款 · 最晚 2026-12-31 付清',
      sections: [
        {
          title: '付款计划',
          rows: [
            { label: '硬装总额', value: '220,000 元' },
            { label: '已配置付款', value: '待配置' },
            { label: '累计已支付', value: '待录入' },
            { label: '对现金预测影响', value: '重大' },
          ],
        },
      ],
      notes: ['请区分实际付款与装修摊销，不得混算。'],
      footerActions: [{ label: '新增付款节点（待建设）' }, { label: '关闭' }],
    },
    'new-cohort': {
      title: '新建班期',
      subtitle: '研学中心班期创建（mock）',
      sections: [
        {
          title: '占位表单',
          rows: [
            { label: '课程', value: '待选择' },
            { label: '开班日期', value: '待选择' },
            { label: '场地', value: '待选择' },
            { label: '建议锁班人数', value: '待配置' },
          ],
        },
      ],
      footerActions: [{ label: '保存草稿（待建设）' }, { label: '关闭' }],
    },
    'new-lead': {
      title: '新增线索',
      subtitle: '研学咨询线索录入（mock）',
      sections: [
        {
          title: '占位表单',
          rows: [
            { label: '姓名', value: '待填写' },
            { label: '意向课程', value: '待选择' },
            { label: '来源渠道', value: '待选择' },
            { label: '负责人', value: '待指定' },
          ],
        },
      ],
      footerActions: [{ label: '保存（待建设）' }, { label: '关闭' }],
    },
    'record-payment': {
      title: '录入收款',
      subtitle: '研学中心实际收款登记（mock）',
      sections: [
        {
          title: '收款信息',
          rows: [
            { label: '学员', value: '待选择' },
            { label: '班期', value: '待选择' },
            { label: '到账金额', value: '待填写' },
            { label: '到账日期', value: '待选择' },
          ],
        },
      ],
      notes: ['录入收款不等于确认收入，需按财务口径复核。'],
      footerActions: [{ label: '提交（待建设）' }, { label: '关闭' }],
    },
    'record-cost': {
      title: '录入成本',
      subtitle: '项目直接成本与场地成本（mock）',
      sections: [
        {
          title: '成本项',
          rows: [
            { label: '成本类型', value: '待选择' },
            { label: '关联班期', value: '待选择' },
            { label: '金额', value: '待填写' },
            { label: '发生日期', value: '待选择' },
          ],
        },
      ],
      footerActions: [{ label: '提交（待建设）' }, { label: '关闭' }],
    },
    students: {
      title: '实缴学员名单',
      subtitle: 'RYT200｜2026年7月27日班',
      sections: [
        {
          title: '当前学员',
          rows: [
            { label: '学员 A', value: '已付款 12,800 元' },
            { label: '学员 B', value: '已付款 12,800 元' },
            { label: '学员 C', value: '已付款 12,800 元' },
          ],
        },
      ],
      notes: ['实缴人数只能通过添加报名变更，不可直接编辑。'],
      footerActions: [{ label: '添加报名' }, { label: '关闭' }],
    },
    'cohort-list': {
      title: '在招班期',
      subtitle: '当前研学中心班期列表',
      sections: [
        {
          title: '班期',
          rows: [
            { label: 'RYT200｜2026年7月27日班', value: '招生中 · 实缴 3 人' },
            { label: 'RYT200｜2026年9月1日班', value: '筹备中 · 实缴 0 人' },
          ],
        },
      ],
      footerActions: [{ label: '关闭' }],
    },
    'receipt-detail': {
      title: '本月实收明细',
      subtitle: '实际收款登记记录（mock）',
      sections: [
        {
          title: '收款记录',
          rows: [
            { label: '2026-07-05', value: '12,800 元 · 学员 A' },
            { label: '2026-07-08', value: '12,800 元 · 学员 B' },
            { label: '2026-07-10', value: '12,800 元 · 学员 C' },
          ],
        },
      ],
      footerActions: [{ label: '录入收款' }, { label: '关闭' }],
    },
    'priority-p1': {
      title: 'RYT200 招生名单',
      subtitle: '未达直接成本保本人数跟进',
      sections: [
        {
          title: '缺口说明',
          rows: [
            { label: '当前实缴', value: '3 人' },
            { label: '直接保本线', value: '4 人' },
            { label: '锁班线', value: '7 人' },
          ],
        },
      ],
      footerActions: [{ label: '发起跟进（待建设）' }, { label: '关闭' }],
    },
    'priority-p2': {
      title: '指定班期负责人',
      subtitle: 'RYT200｜2026年7月27日班',
      sections: [
        {
          title: '负责人',
          rows: [
            { label: '当前负责人', value: '待指定' },
            { label: '建议角色', value: '招生跟进 + 班期交付协同' },
          ],
        },
      ],
      footerActions: [{ label: '指定负责人（待建设）' }, { label: '关闭' }],
    },
    'priority-p3': {
      title: '硬装付款计划',
      subtitle: '影响金额 220,000 元',
      sections: [
        {
          title: '配置状态',
          rows: [
            { label: '硬装总额', value: '220,000 元' },
            { label: '最晚付清', value: '2026-12-31' },
            { label: '已配置付款', value: '待配置' },
          ],
        },
      ],
      footerActions: [{ label: '配置计划' }, { label: '关闭' }],
    },
    'priority-p4': {
      title: '502 室课表检查',
      subtitle: '将于 2026-08-31 停止使用',
      sections: [
        {
          title: '影响范围',
          rows: [
            { label: '场地', value: '502 室' },
            { label: '停用日期', value: '2026-08-31' },
            { label: '在排班期', value: 'RYT200｜2026年7月27日班' },
          ],
        },
      ],
      footerActions: [{ label: '检查课表（待建设）' }, { label: '关闭' }],
    },
  };

  const leadDetailMap: Record<string, ResearchCenterDrawerContent> = {
    'lead-1': {
      title: '咨询跟进',
      subtitle: '林晓雯 · RYT200',
      sections: [
        {
          title: '线索信息',
          rows: [
            { label: '姓名', value: '林晓雯' },
            { label: '意向课程', value: 'RYT200' },
            { label: '意向等级', value: '高' },
            { label: '当前阶段', value: '已发方案' },
            { label: '预计金额', value: '12,800 元' },
            { label: '最近跟进', value: '2026-07-08 · 电话沟通' },
            { label: '超时天数', value: '3 天' },
            { label: '负责人', value: '待指定' },
          ],
        },
        {
          title: '建议动作',
          rows: [{ label: '下一动作', value: '确认面试时间与住宿安排，推进签约' }],
        },
      ],
      notes: ['点对点跟进 · 非群发 · mock 数据'],
      footerActions: [{ label: '记录跟进（待建设）' }, { label: '关闭' }],
    },
    'lead-2': {
      title: '咨询跟进',
      subtitle: '周明哲 · RYT200',
      sections: [
        {
          title: '线索信息',
          rows: [
            { label: '姓名', value: '周明哲' },
            { label: '意向课程', value: 'RYT200' },
            { label: '意向等级', value: '高' },
            { label: '当前阶段', value: '面试通过' },
            { label: '预计金额', value: '12,800 元' },
            { label: '最近跟进', value: '2026-07-06 · 微信回复' },
            { label: '超时天数', value: '5 天' },
            { label: '负责人', value: '待指定' },
          ],
        },
        {
          title: '建议动作',
          rows: [{ label: '下一动作', value: '发送正式方案与合同模板，确认付款节点' }],
        },
      ],
      footerActions: [{ label: '记录跟进（待建设）' }, { label: '关闭' }],
    },
    'lead-3': {
      title: '咨询跟进',
      subtitle: '陈一宁 · RYT200',
      sections: [
        {
          title: '线索信息',
          rows: [
            { label: '姓名', value: '陈一宁' },
            { label: '意向课程', value: 'RYT200' },
            { label: '意向等级', value: '中' },
            { label: '当前阶段', value: '完成面试' },
            { label: '预计金额', value: '12,800 元' },
            { label: '最近跟进', value: '2026-07-10 · 到店面谈' },
            { label: '超时天数', value: '1 天' },
            { label: '负责人', value: '待指定' },
          ],
        },
        {
          title: '建议动作',
          rows: [{ label: '下一动作', value: '补充教学背景材料，安排二次沟通' }],
        },
      ],
      footerActions: [{ label: '记录跟进（待建设）' }, { label: '关闭' }],
    },
    'lead-4': {
      title: '咨询跟进',
      subtitle: '赵思琪 · RYT200',
      sections: [
        {
          title: '线索信息',
          rows: [
            { label: '姓名', value: '赵思琪' },
            { label: '意向课程', value: 'RYT200' },
            { label: '意向等级', value: '中' },
            { label: '当前阶段', value: '有效沟通' },
            { label: '预计金额', value: '12,800 元' },
            { label: '最近跟进', value: '2026-07-04 · 短信触达' },
            { label: '超时天数', value: '7 天' },
            { label: '负责人', value: '待指定' },
          ],
        },
        {
          title: '建议动作',
          rows: [{ label: '下一动作', value: '电话回访确认上课时间意向' }],
        },
      ],
      footerActions: [{ label: '记录跟进（待建设）' }, { label: '关闭' }],
    },
    'lead-5': {
      title: '咨询跟进',
      subtitle: '何嘉怡 · RYT200',
      sections: [
        {
          title: '线索信息',
          rows: [
            { label: '姓名', value: '何嘉怡' },
            { label: '意向课程', value: 'RYT200' },
            { label: '意向等级', value: '低' },
            { label: '当前阶段', value: '新增咨询' },
            { label: '预计金额', value: '12,800 元' },
            { label: '最近跟进', value: '2026-07-11 · 表单留资' },
            { label: '超时天数', value: '0 天' },
            { label: '负责人', value: '待指定' },
          ],
        },
        {
          title: '建议动作',
          rows: [{ label: '下一动作', value: '24 小时内首次电话建联' }],
        },
      ],
      footerActions: [{ label: '记录跟进（待建设）' }, { label: '关闭' }],
    },
  };

  return {
    meta: {
      title: '研学中心经营',
      subtitle: '管理班期、招生、课程表与经营结果。',
      unitLabel: 'MET YOGA研学中心',
      periodLabel: '本月',
      caliberLabel: '实际现金',
      updatedAt: '2026-07-12 09:30 更新',
      headerActions: [
        { id: 'new-cohort', label: '新建班期' },
        { id: 'new-lead', label: '新增咨询' },
        { id: 'record-payment', label: '录入收款' },
        { id: 'record-cost', label: '录入成本' },
      ],
    },
    diagnosis: {
      statusLabel: '高风险',
      statusTone: 'danger',
      conclusion:
        '2026年7月27日RYT200班当前实缴3人，尚未覆盖44,000元项目直接成本，距离建议锁班人数还差4人。新研学中心220,000元硬装款需在2026年12月31日前付清，但付款计划尚未配置，未来60天资金缺口暂不可准确计算。',
      facts: [
        { label: '风险班期', value: '1个' },
        { label: '当前项目影响', value: '-7,520元', tone: 'danger' },
        { label: '最优先事项', value: '补充RYT200招生', tone: 'warning' },
        { label: '负责人', value: '待指定', tone: 'normal' },
        { label: '截止时间', value: '待配置', tone: 'normal' },
      ],
      actions: [
        { id: 'risk', label: '查看风险' },
        { id: 'action-plan', label: '制定行动' },
      ],
    },
    summaryMetrics: [
      {
        id: 'sum-receipt',
        label: '实际收款',
        value: '38,400元',
        hint: '当前3名实缴学员到账金额',
        status: 'normal',
      },
      {
        id: 'sum-contribution',
        label: '项目贡献利润',
        value: '-7,520元',
        hint: '尚未覆盖项目直接成本',
        status: 'danger',
      },
      {
        id: 'sum-full-profit',
        label: '完整经营利润',
        value: '待计算',
        hint: '502室实际场地成本尚未录入',
        status: 'pending',
      },
      {
        id: 'sum-cash-net',
        label: '现金净流入',
        value: '待计算',
        hint: '实际付款流水尚未完整接入',
        status: 'pending',
      },
      {
        id: 'sum-cohorts',
        label: '在招班期',
        value: '1个',
        hint: '1个未达到锁班线',
        status: 'warning',
      },
      {
        id: 'sum-paid',
        label: '实缴学员',
        value: '3人',
        hint: '距离直接保本还差1人',
        status: 'warning',
      },
      {
        id: 'sum-fixed-cover',
        label: '固定成本覆盖率',
        value: '待计算',
        hint: '当前分摊规则尚未完整配置',
        status: 'pending',
      },
      {
        id: 'sum-gap',
        label: '未来30天资金缺口',
        value: '预测不完整',
        hint: '硬装付款计划尚未配置',
        status: 'warning',
      },
    ],
    cohortDiagnosis: {
      title: 'RYT200｜2026年7月27日班',
      venue: '502室',
      durationDays: 26,
      paidCount: 3,
      maxCount: 12,
      lockCount: 7,
      targetCount: 10,
      currentCount: 3,
      milestones: [
        { id: 'm0', label: '0人', count: 0, type: 'start' },
        { id: 'm4', label: '4人直接保本', count: 4, type: 'breakeven' },
        { id: 'm7', label: '7人条件锁班', count: 7, type: 'lock' },
        { id: 'm10', label: '10人目标', count: 10, type: 'target' },
        { id: 'm12', label: '12人满班', count: 12, type: 'full' },
      ],
      finance: [
        { label: '当前招生收入', value: '38,400元' },
        { label: '销售提成', value: '1,920元' },
        { label: '项目直接成本', value: '44,000元' },
        { label: '项目贡献利润', value: '-7,520元', tone: 'danger' },
      ],
      conclusion: '尚未覆盖项目直接成本。',
      actionHint: '至少新增1名实缴学员才能覆盖直接成本；距离建议锁班还差4人。',
      actions: [
        { id: 'cohort', label: '查看班期' },
        { id: 'leads', label: '查看线索' },
        { id: 'recruit', label: '制定补招' },
        { id: 'budget', label: '调整预算' },
      ],
    },
    funnelStages: [
      { id: 'fs-1', stage: '新增咨询', count: 42, conversionRate: '—', expectedAmount: '53.8万', overdueCount: 6 },
      { id: 'fs-2', stage: '有效沟通', count: 28, conversionRate: '66.7%', expectedAmount: '35.8万', overdueCount: 4 },
      { id: 'fs-3', stage: '完成面试', count: 16, conversionRate: '57.1%', expectedAmount: '20.5万', overdueCount: 3 },
      { id: 'fs-4', stage: '面试通过', count: 11, conversionRate: '68.8%', expectedAmount: '14.1万', overdueCount: 2 },
      { id: 'fs-5', stage: '已发方案', count: 8, conversionRate: '72.7%', expectedAmount: '10.2万', overdueCount: 2 },
      { id: 'fs-6', stage: '已签合同', count: 5, conversionRate: '62.5%', expectedAmount: '6.4万', overdueCount: 1 },
      { id: 'fs-7', stage: '已付款', count: 4, conversionRate: '80.0%', expectedAmount: '5.1万', overdueCount: 0 },
      { id: 'fs-8', stage: '正式入班', count: 3, conversionRate: '75.0%', expectedAmount: '3.8万', overdueCount: 0 },
    ],
    funnelNote: '当前RYT200还需4名实缴学员达到锁班。若有效意向到实缴转化率为25%，至少还需要16名有效意向咨询者。',
    funnelEstimate: '有效意向到实缴转化率按 25% 估算',
    funnelDisclaimer: '当前为估算值，待积累真实历史数据后校准。',
    leads: [
      {
        id: 'lead-1',
        name: '林晓雯',
        course: 'RYT200',
        intentLevel: '高',
        intentTone: 'high',
        stage: '已发方案',
        expectedAmount: '12,800元',
        lastFollowUp: '2026-07-08',
        overdueDays: 3,
        owner: '待指定',
        suggestedAction: '确认面试时间与住宿安排',
      },
      {
        id: 'lead-2',
        name: '周明哲',
        course: 'RYT200',
        intentLevel: '高',
        intentTone: 'high',
        stage: '面试通过',
        expectedAmount: '12,800元',
        lastFollowUp: '2026-07-06',
        overdueDays: 5,
        owner: '待指定',
        suggestedAction: '发送正式方案与合同模板',
      },
      {
        id: 'lead-3',
        name: '陈一宁',
        course: 'RYT200',
        intentLevel: '中',
        intentTone: 'medium',
        stage: '完成面试',
        expectedAmount: '12,800元',
        lastFollowUp: '2026-07-10',
        overdueDays: 1,
        owner: '待指定',
        suggestedAction: '补充教学背景材料',
      },
      {
        id: 'lead-4',
        name: '赵思琪',
        course: 'RYT200',
        intentLevel: '中',
        intentTone: 'medium',
        stage: '有效沟通',
        expectedAmount: '12,800元',
        lastFollowUp: '2026-07-04',
        overdueDays: 7,
        owner: '待指定',
        suggestedAction: '电话回访确认上课意向',
      },
      {
        id: 'lead-5',
        name: '何嘉怡',
        course: 'RYT200',
        intentLevel: '低',
        intentTone: 'low',
        stage: '新增咨询',
        expectedAmount: '12,800元',
        lastFollowUp: '2026-07-11',
        overdueDays: 0,
        owner: '待指定',
        suggestedAction: '24小时内首次电话建联',
      },
    ],
    cashForecast: {
      title: '未来60天现金预测',
      incompleteWarning: '预测不完整：220,000元硬装付款计划尚未配置。',
      points: [
        { id: 'cf-1', label: '7月第3周', inflow: 12800, outflow: 8200, net: 4600 },
        { id: 'cf-2', label: '7月第4周', inflow: 0, outflow: 12000, net: -12000 },
        { id: 'cf-3', label: '8月第1周', inflow: 25600, outflow: 9800, net: 15800 },
        { id: 'cf-4', label: '8月第2周', inflow: 12800, outflow: 11000, net: 1800 },
        { id: 'cf-5', label: '8月第3周', inflow: 0, outflow: 15000, net: -15000 },
        { id: 'cf-6', label: '8月第4周', inflow: 12800, outflow: 9200, net: 3600 },
        { id: 'cf-7', label: '9月', inflow: null, outflow: null, net: null, incomplete: true },
        { id: 'cf-8', label: '10月', inflow: null, outflow: null, net: null, incomplete: true },
      ],
      legend: [
        { label: '净流入', tone: 'inflow' },
        { label: '净流出', tone: 'outflow' },
        { label: '待配置影响', tone: 'incomplete' },
      ],
    },
    renovationRisk: {
      totalAmount: '220,000元',
      deadline: '2026年12月31日',
      configuredPayment: '待配置',
      impactLabel: '重大',
      actionLabel: '配置付款计划',
    },
    renovationRecovery: {
      totalAmount: '220,000元',
      paidAmount: '待录入',
      cashSurplus: '待计算',
      progress: '待计算',
      estimatedMonth: '待计算',
      scenarios: [
        {
          id: 'conservative',
          label: '保守',
          description:
            '按当前 3 名实缴与保守招生节奏，可用于回收装修的经营现金盈余尚未形成稳定流入，预计回收月份待计算。',
        },
        {
          id: 'target',
          label: '目标',
          description:
            '若达到 10 人经营目标且班期贡献转正，经营现金盈余可逐步覆盖硬装现金支出，具体月份待配置付款计划后测算。',
        },
        {
          id: 'full',
          label: '满班',
          description:
            '满班 12 人情景下回收速度最快，但仍需以实际付款与经营现金盈余为准，不得用营业收入直接除以装修金额。',
        },
      ],
      disclaimer: '回本按「可用于回收装修的经营现金盈余」表达，装修摊销与实际付款分开核算。',
    },
    priorityActions: [
      {
        id: 'priority-p1',
        severity: 'P0',
        severityTone: 'p0',
        title: 'RYT200未达到直接成本保本人数',
        impact: '当前缺口1人，距离锁班4人',
        owner: '待指定',
        deadline: '待配置',
        suggestedAction: '优先推进高意向线索签约付款',
        actions: [
          { id: 'list', label: '查看名单' },
          { id: 'follow', label: '发起跟进' },
        ],
      },
      {
        id: 'priority-p2',
        severity: 'P1',
        severityTone: 'p1',
        title: '班期招生负责人尚未指定',
        impact: '跟进责任不清，影响转化效率',
        owner: '待指定',
        deadline: '待配置',
        suggestedAction: '指定招生跟进负责人',
        actions: [{ id: 'assign', label: '指定负责人' }],
      },
      {
        id: 'priority-p3',
        severity: 'P1',
        severityTone: 'p1',
        title: '硬装付款计划未配置',
        impact: '影响金额220,000元',
        owner: '待指定',
        deadline: '2026-12-31',
        suggestedAction: '配置分期付款节点',
        actions: [{ id: 'plan', label: '配置计划' }],
      },
      {
        id: 'priority-p4',
        severity: 'P2',
        severityTone: 'p2',
        title: '502室将于2026年8月31日停止使用',
        impact: '影响RYT200交付排期',
        owner: '待指定',
        deadline: '2026-08-31',
        suggestedAction: '检查班期与场地课表冲突',
        actions: [{ id: 'schedule', label: '检查课表' }],
      },
    ],
    drawerContentMap,
    leadDetailMap,
  };
}
