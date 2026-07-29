/** 经营总览模块局部 demo 数据 */

import { formatDashboardCompactMoney, formatDashboardCurrency } from './dashboardFormatters';
import type { DashboardDetailTabId } from './DashboardDetailTabs';

export type DashboardSegment =
  | 'todayTodo'
  | 'storeHealth'
  | 'memberRisk'
  | 'courseAnomaly'
  | 'financeRisk'
  | 'teacherExec'
  | 'crossModule';

export type DashboardEntityType =
  | 'todo'
  | 'store'
  | 'member'
  | 'course'
  | 'finance'
  | 'teacher'
  | 'chain';

export type DashboardActionGroup =
  | 'highPriority'
  | 'memberRenewal'
  | 'courseSchedule'
  | 'financeEvidence'
  | 'review';

export interface DashboardListFilters {
  query: string;
  store: string;
  risk: string;
  module: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardListFilters = {
  query: '',
  store: '全部',
  risk: '全部',
  module: '全部',
};

export const DASHBOARD_FILTER_OPTIONS = {
  stores: ['全部', '万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'],
  risks: ['全部', '正常', '关注', '高'],
  modules: ['全部', '会员', '课程', '产品合同', '财务', '老师', '门店', '活动', '合作'],
};

export const DASHBOARD_WORKBENCH_SEGMENTS: { id: DashboardSegment; label: string }[] = [
  { id: 'todayTodo', label: '今日待办' },
  { id: 'storeHealth', label: '门店健康' },
  { id: 'memberRisk', label: '会员风险' },
  { id: 'courseAnomaly', label: '课程异常' },
  { id: 'financeRisk', label: '财务风险' },
  { id: 'teacherExec', label: '老师执行' },
  { id: 'crossModule', label: '跨模块链路' },
];

export const DASHBOARD_SEGMENT_HINTS: Record<DashboardSegment, string> = {
  todayTodo: '今日最该处理的经营事项，按影响与优先级排序',
  storeHealth: '各门店预约、到课、收款与风险判断',
  memberRisk: '续费窗口、流失风险与管家跟进',
  courseAnomaly: '低预约、待完课、调课取消等异常',
  financeRisk: '订单、预收负债、退款与课时费待核',
  teacherExec: '今日上课、课时费确认与满课率',
  crossModule: '会员 → 课程 → 签到 → 耗课 → 财务链路卡点',
};

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface DashboardInsight {
  id: string;
  tag: string;
  line: string;
  impact: string;
  suggestion: string;
  actionLabel: string;
  actionKey: DashboardSegment;
}

export type DashboardHealthStatus = 'stable' | 'attention' | 'risk';

export interface DashboardTrendDay {
  dateLabel: string;
  count: number;
  highCount: number;
}

export interface DashboardRiskDistItem {
  module: 'member' | 'course' | 'finance' | 'teacher' | 'store';
  label: string;
  count: number;
  tone: 'member' | 'course' | 'finance' | 'teacher' | 'store';
}

export interface DashboardStoreHealthItem {
  storeName: string;
  status: 'stable' | 'attention' | 'risk';
  issueCount: number;
  highCount: number;
  suggestion: string;
}

export interface DashboardCockpitSummary {
  healthStatus: DashboardHealthStatus;
  healthLabel: string;
  headline: string;
  totalPending: number;
  highPriorityCount: number;
  overdueCount: number;
  last7DaysIssueTrend: DashboardTrendDay[];
  riskDistribution: DashboardRiskDistItem[];
  storeHealthItems: DashboardStoreHealthItem[];
  defaultChainSteps: string[];
}

export interface DashboardStatusHero {
  title: string;
  line1: string;
  line2: string;
  totalPending: number;
  highPriorityCount: number;
  nearOverdueCount: number;
}

export interface DashboardJudgmentPanel {
  priorityCount: number;
  categories: { label: string; count: number }[];
  trend: DashboardTrendDay[];
  footnote: string;
}

export interface DashboardEvidenceNode {
  key: string;
  label: string;
  value: string;
  iconClass: string;
  isAnomaly?: boolean;
}

export interface DashboardStoreMonitorRow {
  id: string;
  storeName: string;
  status: string;
  problem: string;
  healthScore: number;
  riskLevel: '正常' | '稳定' | '关注' | '风险';
}

export interface DashboardActionSuggestion {
  id: string;
  category: string;
  owner: string;
  title: string;
  description: string;
  buttonLabel: string;
  tone: 'primary' | 'risk' | 'attention' | 'neutral';
  entityId?: string;
  openTab?: DashboardDetailTabId;
}

export interface DashboardStitchView {
  statusHero: DashboardStatusHero;
  judgment: DashboardJudgmentPanel;
  evidenceNodes: DashboardEvidenceNode[];
  evidenceInsight: string;
  storeMonitor: DashboardStoreMonitorRow[];
  actionSuggestions: DashboardActionSuggestion[];
}

export const deriveDashboardHealthStatus = (params: {
  highPriorityCount: number;
  overdueCount: number;
  totalPending: number;
}): DashboardHealthStatus => {
  if (params.highPriorityCount >= 3 || params.overdueCount >= 2) return 'risk';
  if (params.highPriorityCount >= 1 || params.totalPending >= 5) return 'attention';
  return 'stable';
};

const HEALTH_LABELS: Record<DashboardHealthStatus, string> = {
  stable: '稳定',
  attention: '关注',
  risk: '风险',
};

const MODULE_TO_DIST: Record<string, DashboardRiskDistItem['module']> = {
  会员: 'member',
  课程: 'course',
  财务: 'finance',
  老师: 'teacher',
  门店: 'store',
  产品合同: 'store',
  活动: 'store',
  合作: 'store',
};

const DIST_LABELS: Record<DashboardRiskDistItem['module'], string> = {
  member: '会员',
  course: '课程',
  finance: '财务',
  teacher: '老师',
  store: '门店',
};

export interface DashboardTodoRecord {
  id: string;
  segment: 'todayTodo';
  item: string;
  module: string;
  store: string;
  riskLevel: string;
  ownerRole: string;
  deadline: string;
  status: string;
  storeKey: string;
}

export interface DashboardStoreRecord {
  id: string;
  segment: 'storeHealth';
  storeName: string;
  todayBookings: string;
  attendanceRate: string;
  todayNetReceipt: string;
  consumeRevenue: string;
  riskItems: string;
  judgment: string;
  riskLevel: string;
  storeKey: string;
}

export interface DashboardMemberRecord {
  id: string;
  segment: 'memberRisk';
  memberName: string;
  storeName: string;
  stage: string;
  mainAsset: string;
  lastAttendance: string;
  riskReason: string;
  owner: string;
  riskLevel: string;
  storeKey: string;
}

export interface DashboardCourseRecord {
  id: string;
  segment: 'courseAnomaly';
  courseName: string;
  storeName: string;
  teacher: string;
  time: string;
  bookings: string;
  anomalyType: string;
  suggestion: string;
  riskLevel: string;
  storeKey: string;
}

export interface DashboardFinanceRecord {
  id: string;
  segment: 'financeRisk';
  riskItem: string;
  relatedOrder: string;
  amount: string;
  impactScope: string;
  financeStatus: string;
  owner: string;
  nextStep: string;
  riskLevel: string;
  storeKey: string;
}

export interface DashboardTeacherRecord {
  id: string;
  segment: 'teacherExec';
  teacherName: string;
  storeName: string;
  todayCourses: string;
  attendanceCount: string;
  feeStatus: string;
  execRisk: string;
  growthImpact: string;
  riskLevel: string;
  storeKey: string;
}

export interface DashboardChainRecord {
  id: string;
  segment: 'crossModule';
  chainItem: string;
  startModule: string;
  stuckPoint: string;
  impactModules: string;
  evidenceChain: string;
  ownerRole: string;
  status: string;
  riskLevel: string;
  storeKey: string;
}

export type DashboardTableRow =
  | DashboardTodoRecord
  | DashboardStoreRecord
  | DashboardMemberRecord
  | DashboardCourseRecord
  | DashboardFinanceRecord
  | DashboardTeacherRecord
  | DashboardChainRecord;

export interface DashboardActionItem {
  id: string;
  segment: DashboardSegment;
  group: DashboardActionGroup;
  entityType: DashboardEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  impactLine: string;
  ownerRole: string;
  evidenceChain: string[];
  openTab?: DashboardDetailTabId;
}

export interface DashboardJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface DashboardLogItem {
  time: string;
  operator: string;
  action: string;
  note: string;
}

export interface DashboardDetailRecord {
  id: string;
  entityType: DashboardEntityType;
  segment: DashboardSegment;
  title: string;
  subtitle: string;
  currentItem: string;
  status: string;
  riskLevel: string;
  impactScope: string;
  ownerRole: string;
  deadline: string;
  todaySuggestion: string;
  judgment: DashboardJudgment;
  coreMetrics: { label: string; value: string }[];
  relatedModules: string[];
  relatedObject: string;
  stuckPoint: string;
  upstreamRecords: string[];
  downstreamImpact: string[];
  missingEvidence: string;
  logHint: string;
  affectedStores: string[];
  affectedMetrics: string[];
  todayPerformance: string;
  trend7d: string;
  storeManagerDuty: string;
  hqIntervention: string;
  affectedMembers: string;
  affectedCourses: string;
  bookingAttendance: string;
  renewalChurnRisk: string;
  handlerAdvice: string;
  relatedAmount: string;
  cashflowImpact: string;
  liabilityImpact: string;
  revenueImpact: string;
  feeImpact: string;
  financeReviewNeeded: string;
  operationLogs: DashboardLogItem[];
  followUpAction: string;
  evidenceChain: string[];
  caliberNote: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface DashboardOperationSnapshot {
  cockpit: DashboardCockpitSummary;
  stitch: DashboardStitchView;
  metrics: DashboardMetric[];
  insights: DashboardInsight[];
  todayTodo: DashboardTodoRecord[];
  storeHealth: DashboardStoreRecord[];
  memberRisk: DashboardMemberRecord[];
  courseAnomaly: DashboardCourseRecord[];
  financeRisk: DashboardFinanceRecord[];
  teacherExec: DashboardTeacherRecord[];
  crossModule: DashboardChainRecord[];
  details: DashboardDetailRecord[];
  actionQueue: DashboardActionItem[];
}

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];
const MODULES = ['会员', '课程', '产品合同', '财务', '老师', '门店', '活动', '合作'];

const mkJudgment = (risk: string): DashboardJudgment => ({
  summary:
    risk === '高' || risk === '高风险'
      ? '经营事项存在跨模块影响，建议优先核对证据链与责任角色'
      : risk === '关注' || risk === '中'
        ? '部分指标需跟进，建议核对门店表现与会员 / 课程状态'
        : '经营状态平稳，可按计划例行复核',
  stuck: risk === '高' || risk === '高风险' ? '财务或课程链路存在卡点' : risk === '关注' ? '会员续费或预约待跟进' : '—',
  nextStep: '按建议动作跟进，以订单、合同、签到、耗课、财务与操作日志为准（经营判断预览）',
});

const mkLogs = (item: string): DashboardLogItem[] => [
  { time: '2026-05-16 09:00', action: '经营事项查看', operator: '总部运营', note: `${item} · 前端演示` },
  { time: '2026-05-15 16:30', action: '证据链核对预览', operator: '系统', note: '待接入真实数据服务' },
  { time: '2026-05-14 11:00', action: '跟进记录预览', operator: '店长', note: '以操作日志为准' },
];

const buildBaseDetail = (
  id: string,
  entityType: DashboardEntityType,
  segment: DashboardSegment,
  title: string,
  subtitle: string,
  store: string,
  risk: string,
  metrics: { label: string; value: string }[],
  chain: string[],
): DashboardDetailRecord => ({
  id,
  entityType,
  segment,
  title,
  subtitle,
  currentItem: title,
  status: '待处理',
  riskLevel: risk,
  impactScope: '现金流 / 会员续费 / 课程消耗',
  ownerRole: '店长 + 总部运营',
  deadline: '2026-05-16 18:00',
  todaySuggestion: `关注 ${title}，优先核对 ${store} 相关证据链`,
  judgment: mkJudgment(risk),
  coreMetrics: metrics,
  relatedModules: MODULES.slice(0, 4),
  relatedObject: title,
  stuckPoint: mkJudgment(risk).stuck,
  upstreamRecords: ['订单 / 合同记录（演示）', '排课与签到（演示）'],
  downstreamImpact: ['耗课确认', '预收负债', '课时费计提'],
  missingEvidence: risk !== '正常' && risk !== '低' ? '部分签到或支付凭证待补（演示）' : '—',
  logHint: '以操作日志为准，本页仅作经营总览预览',
  affectedStores: [store],
  affectedMetrics: ['今日净收款', '到课率', '耗课收入'],
  todayPerformance: store === '万象馆' ? '预约 42 · 到课率 78%' : '预约 28 · 到课率 72%',
  trend7d: '近 7 日波动在关注区间（演示）',
  storeManagerDuty: `${store} 店长负责当日闭环`,
  hqIntervention: risk === '高' ? '建议总部介入复核' : '例行关注',
  affectedMembers: '涉及 3–8 名会员（演示）',
  affectedCourses: '涉及 2–4 个场次（演示）',
  bookingAttendance: '预约未满 / 部分未到课（演示）',
  renewalChurnRisk: risk === '高' ? '续费窗口 + 流失风险' : '续费窗口',
  handlerAdvice: '管家跟进 + 店长复核排课',
  relatedAmount: '¥ 12,800（演示）',
  cashflowImpact: '当日净收款可能延迟确认',
  liabilityImpact: '预收负债口径需核对',
  revenueImpact: '耗课确认收入可能滞后',
  feeImpact: '课时费待核 2 笔（演示）',
  financeReviewNeeded: risk === '高' ? '建议财务复核' : '可门店先处理',
  operationLogs: mkLogs(title),
  followUpAction: '核对证据链后更新状态（预览）',
  evidenceChain: chain,
  caliberNote: '以订单、合同、签到、耗课、财务与操作日志为准',
  updatedAt: '2026-05-16 18:00（演示）',
  isDemo: true,
});

export const buildDashboardOperationSnapshot = (): DashboardOperationSnapshot => {
  const todayTodo: DashboardTodoRecord[] = [
    { id: 'db-todo-1', segment: 'todayTodo', item: '城西馆低预约晚课需调排', module: '课程', store: '城西馆', riskLevel: '高', ownerRole: '店长', deadline: '今日 12:00', status: '待处理', storeKey: '城西馆' },
    { id: 'db-todo-2', segment: 'todayTodo', item: '滨江馆会员李女士续费窗口', module: '会员', store: '滨江馆', riskLevel: '关注', ownerRole: '管家', deadline: '今日 18:00', status: '跟进中', storeKey: '滨江馆' },
    { id: 'db-todo-3', segment: 'todayTodo', item: '万象馆退款订单待财务复核', module: '财务', store: '万象馆', riskLevel: '高', ownerRole: '财务', deadline: '今日 17:00', status: '待处理', storeKey: '万象馆' },
    { id: 'db-todo-4', segment: 'todayTodo', item: '西湖馆课时费待核 3 笔', module: '老师', store: '西湖馆', riskLevel: '关注', ownerRole: '店长', deadline: '今日 20:00', status: '待处理', storeKey: '西湖馆' },
    { id: 'db-todo-5', segment: 'todayTodo', item: '云谷馆活动转化合同待签', module: '产品合同', store: '云谷馆', riskLevel: '关注', ownerRole: '销售', deadline: '明日', status: '跟进中', storeKey: '云谷馆' },
    { id: 'db-todo-6', segment: 'todayTodo', item: '城西馆预收负债口径核对', module: '财务', store: '城西馆', riskLevel: '中', ownerRole: '财务', deadline: '今日 16:00', status: '待处理', storeKey: '城西馆' },
    { id: 'db-todo-7', segment: 'todayTodo', item: '滨江馆满课率偏低影响利润', module: '老师', store: '滨江馆', riskLevel: '关注', ownerRole: '店长', deadline: '本周', status: '待处理', storeKey: '滨江馆' },
    { id: 'db-todo-8', segment: 'todayTodo', item: '万象馆跨模块链路：签到未耗课', module: '门店', store: '万象馆', riskLevel: '高', ownerRole: '总部运营', deadline: '今日 15:00', status: '待处理', storeKey: '万象馆' },
    { id: 'db-todo-9', segment: 'todayTodo', item: '合作馆数据回传异常复核', module: '合作', store: '云谷馆', riskLevel: '中', ownerRole: '合作运营', deadline: '明日', status: '跟进中', storeKey: '云谷馆' },
    { id: 'db-todo-10', segment: 'todayTodo', item: '西湖馆取消课需通知会员', module: '课程', store: '西湖馆', riskLevel: '关注', ownerRole: '管家', deadline: '今日 14:00', status: '待处理', storeKey: '西湖馆' },
  ];

  const storeHealth: DashboardStoreRecord[] = STORES.map((s, i) => ({
    id: `db-store-${i + 1}`,
    segment: 'storeHealth',
    storeName: s,
    todayBookings: `${32 + i * 6}`,
    attendanceRate: `${72 + i * 2}%`,
    todayNetReceipt: `¥ ${(1.2 + i * 0.3).toFixed(1)}万`,
    consumeRevenue: `¥ ${(0.8 + i * 0.2).toFixed(1)}万`,
    riskItems: i === 0 ? '退款待审' : i === 2 ? '低预约' : i === 4 ? '课时费待核' : '—',
    judgment: i === 2 ? '关注：晚课预约不足' : i === 0 ? '关注：财务待核' : '健康',
    riskLevel: i === 2 || i === 0 ? '关注' : i === 4 ? '中' : '正常',
    storeKey: s,
  }));

  const memberRisk: DashboardMemberRecord[] = [
    { id: 'db-mem-1', segment: 'memberRisk', memberName: '李女士', storeName: '滨江馆', stage: '续费窗口', mainAsset: '年卡 · 剩余 12 次', lastAttendance: '3 天前', riskReason: '到店频次下降', owner: '管家小王', riskLevel: '关注', storeKey: '滨江馆' },
    { id: 'db-mem-2', segment: 'memberRisk', memberName: '张先生', storeName: '万象馆', stage: '活跃', mainAsset: '私教包 · 剩余 8 节', lastAttendance: '昨日', riskReason: '—', owner: '管家小陈', riskLevel: '正常', storeKey: '万象馆' },
    { id: 'db-mem-3', segment: 'memberRisk', memberName: '王女士', storeName: '城西馆', stage: '流失风险', mainAsset: '月卡 · 已过期 5 天', lastAttendance: '12 天前', riskReason: '未续费', owner: '管家小李', riskLevel: '高', storeKey: '城西馆' },
    { id: 'db-mem-4', segment: 'memberRisk', memberName: '赵女士', storeName: '西湖馆', stage: '续费窗口', mainAsset: '次卡 · 剩余 3 次', lastAttendance: '5 天前', riskReason: '次卡即将用完', owner: '管家小周', riskLevel: '关注', storeKey: '西湖馆' },
    { id: 'db-mem-5', segment: 'memberRisk', memberName: '刘先生', storeName: '云谷馆', stage: '新客', mainAsset: '体验课 · 未转化', lastAttendance: '2 天前', riskReason: '转化跟进', owner: '销售小孙', riskLevel: '关注', storeKey: '云谷馆' },
    { id: 'db-mem-6', segment: 'memberRisk', memberName: '陈女士', storeName: '滨江馆', stage: '活跃', mainAsset: '年卡', lastAttendance: '今日', riskReason: '—', owner: '管家小王', riskLevel: '正常', storeKey: '滨江馆' },
    { id: 'db-mem-7', segment: 'memberRisk', memberName: '周先生', storeName: '万象馆', stage: '续费窗口', mainAsset: '季卡 · 剩余 7 天', lastAttendance: '4 天前', riskReason: '续费意向待确认', owner: '管家小陈', riskLevel: '关注', storeKey: '万象馆' },
    { id: 'db-mem-8', segment: 'memberRisk', memberName: '吴女士', storeName: '城西馆', stage: '活跃', mainAsset: '私教包', lastAttendance: '昨日', riskReason: '—', owner: '管家小李', riskLevel: '正常', storeKey: '城西馆' },
  ];

  const courseAnomaly: DashboardCourseRecord[] = [
    { id: 'db-course-1', segment: 'courseAnomaly', courseName: '流瑜伽 · 晚场', storeName: '城西馆', teacher: 'Amy', time: '今日 19:30', bookings: '3 / 12', anomalyType: '低预约', suggestion: '调排或合并班次', riskLevel: '高', storeKey: '城西馆' },
    { id: 'db-course-2', segment: 'courseAnomaly', courseName: '阴瑜伽 · 午场', storeName: '滨江馆', teacher: 'Luna', time: '今日 12:00', bookings: '8 / 10', anomalyType: '待完课', suggestion: '确认签到与耗课', riskLevel: '关注', storeKey: '滨江馆' },
    { id: 'db-course-3', segment: 'courseAnomaly', courseName: '普拉提 · 早场', storeName: '万象馆', teacher: 'Mia', time: '今日 08:00', bookings: '已取消', anomalyType: '取消课', suggestion: '通知已预约会员', riskLevel: '关注', storeKey: '万象馆' },
    { id: 'db-course-4', segment: 'courseAnomaly', courseName: '阿斯汤加', storeName: '西湖馆', teacher: 'Joy', time: '今日 18:00', bookings: '5 / 15', anomalyType: '低预约', suggestion: '推广或调老师', riskLevel: '关注', storeKey: '西湖馆' },
    { id: 'db-course-5', segment: 'courseAnomaly', courseName: '疗愈瑜伽', storeName: '云谷馆', teacher: 'Sara', time: '明日 10:00', bookings: '2 / 8', anomalyType: '低预约', suggestion: '活动引流', riskLevel: '中', storeKey: '云谷馆' },
    { id: 'db-course-6', segment: 'courseAnomaly', courseName: '私教 · 张先生', storeName: '万象馆', teacher: 'Ken', time: '今日 15:00', bookings: '1 / 1', anomalyType: '待完课', suggestion: '课后确认耗课', riskLevel: '正常', storeKey: '万象馆' },
    { id: 'db-course-7', segment: 'courseAnomaly', courseName: '团课 · 核心床', storeName: '城西馆', teacher: 'Nina', time: '今日 20:00', bookings: '4 / 10', anomalyType: '低预约', suggestion: '管家触达会员', riskLevel: '关注', storeKey: '城西馆' },
    { id: 'db-course-8', segment: 'courseAnomaly', courseName: '孕产瑜伽', storeName: '滨江馆', teacher: 'Yuki', time: '已调课', bookings: '—', anomalyType: '调课', suggestion: '更新会员通知', riskLevel: '中', storeKey: '滨江馆' },
  ];

  const financeRisk: DashboardFinanceRecord[] = [
    { id: 'db-fin-1', segment: 'financeRisk', riskItem: '退款待审', relatedOrder: 'ORD-20260516-008', amount: '¥ 3,200', impactScope: '现金流 / 预收负债', financeStatus: '待复核', owner: '财务', nextStep: '核对支付凭证', riskLevel: '高', storeKey: '万象馆' },
    { id: 'db-fin-2', segment: 'financeRisk', riskItem: '预收负债口径差异', relatedOrder: '多笔合同', amount: '¥ 18.6万', impactScope: '负债 / 确认收入', financeStatus: '待核对', owner: '财务', nextStep: '与合同模块对账', riskLevel: '关注', storeKey: '城西馆' },
    { id: 'db-fin-3', segment: 'financeRisk', riskItem: '课时费待核', relatedOrder: 'TEA-FEE-042', amount: '¥ 1,860', impactScope: '老师成本', financeStatus: '待核', owner: '店长', nextStep: '确认签到', riskLevel: '关注', storeKey: '西湖馆' },
    { id: 'db-fin-4', segment: 'financeRisk', riskItem: '支付异常订单', relatedOrder: 'ORD-20260515-112', amount: '¥ 980', impactScope: '现金流', financeStatus: '异常', owner: '财务', nextStep: '查证据链', riskLevel: '高', storeKey: '滨江馆' },
    { id: 'db-fin-5', segment: 'financeRisk', riskItem: '耗课未确认', relatedOrder: 'SIGN-884', amount: '¥ 420', impactScope: '确认收入', financeStatus: '滞后', owner: '店长', nextStep: '补确认', riskLevel: '中', storeKey: '万象馆' },
    { id: 'db-fin-6', segment: 'financeRisk', riskItem: '活动定金待结转', relatedOrder: 'ACT-202605', amount: '¥ 5,600', impactScope: '预收 / 合同', financeStatus: '跟进中', owner: '销售', nextStep: '签合同', riskLevel: '关注', storeKey: '云谷馆' },
  ];

  const teacherExec: DashboardTeacherRecord[] = [
    { id: 'db-tea-1', segment: 'teacherExec', teacherName: 'Amy', storeName: '城西馆', todayCourses: '3 节', attendanceCount: '22 人', feeStatus: '待确认 1 笔', execRisk: '晚课满课率偏低', growthImpact: '课时费占比偏高', riskLevel: '关注', storeKey: '城西馆' },
    { id: 'db-tea-2', segment: 'teacherExec', teacherName: 'Luna', storeName: '滨江馆', todayCourses: '4 节', attendanceCount: '31 人', feeStatus: '已确认', execRisk: '—', growthImpact: '稳定', riskLevel: '正常', storeKey: '滨江馆' },
    { id: 'db-tea-3', segment: 'teacherExec', teacherName: 'Mia', storeName: '万象馆', todayCourses: '2 节', attendanceCount: '14 人', feeStatus: '待核', execRisk: '取消课影响课时', growthImpact: '需复盘排课', riskLevel: '关注', storeKey: '万象馆' },
    { id: 'db-tea-4', segment: 'teacherExec', teacherName: 'Joy', storeName: '西湖馆', todayCourses: '5 节', attendanceCount: '38 人', feeStatus: '待核 2 笔', execRisk: '课时费积压', growthImpact: '成本关注', riskLevel: '中', storeKey: '西湖馆' },
    { id: 'db-tea-5', segment: 'teacherExec', teacherName: 'Ken', storeName: '万象馆', todayCourses: '6 节', attendanceCount: '6 人', feeStatus: '已确认', execRisk: '—', growthImpact: '私教稳定', riskLevel: '正常', storeKey: '万象馆' },
    { id: 'db-tea-6', segment: 'teacherExec', teacherName: 'Sara', storeName: '云谷馆', todayCourses: '2 节', attendanceCount: '9 人', feeStatus: '待确认', execRisk: '满课率偏低', growthImpact: '利润承压', riskLevel: '关注', storeKey: '云谷馆' },
  ];

  const crossModule: DashboardChainRecord[] = [
    { id: 'db-chain-1', segment: 'crossModule', chainItem: '签到未耗课未入财务口径', startModule: '课程', stuckPoint: '耗课确认', impactModules: '财务 / 会员资产', evidenceChain: '会员→课程→签到→耗课→财务', ownerRole: '店长 + 财务', status: '待处理', riskLevel: '高', storeKey: '万象馆' },
    { id: 'db-chain-2', segment: 'crossModule', chainItem: '合同已签课程未排', startModule: '产品合同', stuckPoint: '排课', impactModules: '课程 / 会员', evidenceChain: '合同→排课→预约', ownerRole: '销售 + 店长', status: '跟进中', riskLevel: '关注', storeKey: '云谷馆' },
    { id: 'db-chain-3', segment: 'crossModule', chainItem: '退款审批链路中断', startModule: '财务', stuckPoint: '审批', impactModules: '会员 / 现金流', evidenceChain: '订单→退款→财务', ownerRole: '财务 + 总部', status: '待处理', riskLevel: '高', storeKey: '万象馆' },
    { id: 'db-chain-4', segment: 'crossModule', chainItem: '活动线索未转合同', startModule: '活动', stuckPoint: '合同', impactModules: '产品合同 / 财务', evidenceChain: '活动→线索→合同→收款', ownerRole: '销售', status: '跟进中', riskLevel: '中', storeKey: '滨江馆' },
    { id: 'db-chain-5', segment: 'crossModule', chainItem: '合作馆数据未回传', startModule: '合作', stuckPoint: '数据同步', impactModules: '数据中心 / 财务', evidenceChain: '合作→数据→财务', ownerRole: '合作运营', status: '待处理', riskLevel: '中', storeKey: '西湖馆' },
    { id: 'db-chain-6', segment: 'crossModule', chainItem: '会员续费未关联排课', startModule: '会员', stuckPoint: '预约', impactModules: '课程 / 耗课', evidenceChain: '会员→续费→预约→签到', ownerRole: '管家', status: '跟进中', riskLevel: '关注', storeKey: '城西馆' },
  ];

  const allRows: DashboardTableRow[] = [
    ...todayTodo,
    ...storeHealth,
    ...memberRisk,
    ...courseAnomaly,
    ...financeRisk,
    ...teacherExec,
    ...crossModule,
  ];

  const details: DashboardDetailRecord[] = allRows.map(row => {
    const store = 'storeName' in row ? row.storeName : 'store' in row ? row.store : row.storeKey;
    const risk = row.riskLevel;
    let title = '';
    let metrics: { label: string; value: string }[] = [];
    let chain = ['会员', '课程', '签到', '耗课', '财务'];
    let entityType: DashboardEntityType = 'todo';
    let subtitle = '';

    if (row.segment === 'todayTodo') {
      title = row.item;
      subtitle = `${row.module} · ${row.store}`;
      entityType = 'todo';
      metrics = [
        { label: '关联模块', value: row.module },
        { label: '影响门店', value: row.store },
        { label: '责任角色', value: row.ownerRole },
        { label: '截止时间', value: row.deadline },
        { label: '状态', value: row.status },
      ];
    } else if (row.segment === 'storeHealth') {
      title = row.storeName;
      subtitle = row.judgment;
      entityType = 'store';
      metrics = [
        { label: '今日预约', value: row.todayBookings },
        { label: '到课率', value: row.attendanceRate },
        { label: '今日净收款', value: row.todayNetReceipt },
        { label: '耗课收入', value: row.consumeRevenue },
        { label: '风险项', value: row.riskItems },
      ];
    } else if (row.segment === 'memberRisk') {
      title = row.memberName;
      subtitle = `${row.storeName} · ${row.stage}`;
      entityType = 'member';
      metrics = [
        { label: '阶段', value: row.stage },
        { label: '主资产', value: row.mainAsset },
        { label: '最近到课', value: row.lastAttendance },
        { label: '风险原因', value: row.riskReason },
        { label: '负责人', value: row.owner },
      ];
    } else if (row.segment === 'courseAnomaly') {
      title = row.courseName;
      subtitle = `${row.storeName} · ${row.anomalyType}`;
      entityType = 'course';
      chain = ['预约', '排课', '签到', '耗课', '财务'];
      metrics = [
        { label: '老师', value: row.teacher },
        { label: '时间', value: row.time },
        { label: '预约', value: row.bookings },
        { label: '异常类型', value: row.anomalyType },
        { label: '建议', value: row.suggestion },
      ];
    } else if (row.segment === 'financeRisk') {
      title = row.riskItem;
      subtitle = row.relatedOrder;
      entityType = 'finance';
      metrics = [
        { label: '金额', value: row.amount },
        { label: '影响口径', value: row.impactScope },
        { label: '财务状态', value: row.financeStatus },
        { label: '负责人', value: row.owner },
        { label: '下一步', value: row.nextStep },
      ];
    } else if (row.segment === 'teacherExec') {
      title = row.teacherName;
      subtitle = row.storeName;
      entityType = 'teacher';
      metrics = [
        { label: '今日课程', value: row.todayCourses },
        { label: '到课人数', value: row.attendanceCount },
        { label: '课时费', value: row.feeStatus },
        { label: '执行风险', value: row.execRisk },
        { label: '成长影响', value: row.growthImpact },
      ];
    } else {
      title = row.chainItem;
      subtitle = row.startModule;
      entityType = 'chain';
      chain = row.evidenceChain.split('→');
      metrics = [
        { label: '起点', value: row.startModule },
        { label: '卡点', value: row.stuckPoint },
        { label: '影响模块', value: row.impactModules },
        { label: '责任角色', value: row.ownerRole },
        { label: '状态', value: row.status },
      ];
    }

    return buildBaseDetail(row.id, entityType, row.segment, title, subtitle, store, risk, metrics, chain);
  });

  const pendingCount = todayTodo.filter(t => t.status === '待处理').length;
  const healthyStores = storeHealth.filter(s => s.riskLevel === '正常').length;
  const riskCount =
    todayTodo.filter(t => t.riskLevel === '高').length +
    memberRisk.filter(m => m.riskLevel === '高').length +
    financeRisk.filter(f => f.riskLevel === '高').length;

  const metrics: DashboardMetric[] = [
    { id: 'dm1', label: '今日实收', value: formatDashboardCurrency(62609), hint: '' },
    { id: 'dm2', label: '本月确认收入', value: formatDashboardCurrency(186420), hint: '' },
    { id: 'dm3', label: '预收负债', value: formatDashboardCurrency(1286000), hint: '' },
    { id: 'dm4', label: '预约 / 到课', value: '186 / 142', hint: '', tone: 'rose' },
    { id: 'dm5', label: '老师课时费待核', value: formatDashboardCurrency(38600), hint: '' },
    { id: 'dm6', label: '经营风险项', value: `${riskCount}`, hint: '' },
  ];

  const insights: DashboardInsight[] = [
    {
      id: 'di1',
      tag: '现金与负债',
      line: '城西负债口径与万象退款待核',
      impact: '影响现金流与负债确认',
      suggestion: '先核城西合同收款，再复核退款',
      actionLabel: '查看财务',
      actionKey: 'financeRisk',
    },
    {
      id: 'di2',
      tag: '会员续费',
      line: '滨江、城西续费窗口与流失观察',
      impact: '影响续费与资产消耗',
      suggestion: '管家今日触达，总部盯高流失馆',
      actionLabel: '查看会员',
      actionKey: 'memberRisk',
    },
    {
      id: 'di3',
      tag: '课程与老师',
      line: '城西低预约、西湖取消课待处理',
      impact: '影响耗课与老师成本',
      suggestion: '调排低预约班次，跟进课时费待核',
      actionLabel: '查看课程',
      actionKey: 'courseAnomaly',
    },
    {
      id: 'di4',
      tag: '跨模块链路',
      line: '签到未耗课、退款审批有卡点',
      impact: '影响确认收入与资产一致',
      suggestion: '按链路补证据，人工复核（预览）',
      actionLabel: '查看链路',
      actionKey: 'crossModule',
    },
  ];

  const actionQueue: DashboardActionItem[] = [
    { id: 'da1', segment: 'todayTodo', group: 'highPriority', entityType: 'todo', entityId: 'db-todo-1', title: '城西馆低预约晚课', statusLabel: '高优先级', impactLine: '影响当日耗课与老师成本', ownerRole: '店长', evidenceChain: ['课程', '预约', '签到', '耗课', '财务'], openTab: 'judgment' },
    { id: 'da2', segment: 'financeRisk', group: 'highPriority', entityType: 'finance', entityId: 'db-fin-1', title: '万象馆退款待审', statusLabel: '财务风险', impactLine: '影响现金流与预收负债', ownerRole: '财务', evidenceChain: ['会员', '订单', '退款', '财务'] },
    { id: 'da3', segment: 'crossModule', group: 'highPriority', entityType: 'chain', entityId: 'db-chain-1', title: '签到未耗课链路', statusLabel: '链路卡点', impactLine: '确认收入滞后', ownerRole: '店长 + 财务', evidenceChain: ['会员', '课程', '签到', '耗课', '财务'], openTab: 'evidence' },
    { id: 'da4', segment: 'memberRisk', group: 'memberRenewal', entityType: 'member', entityId: 'db-mem-1', title: '李女士续费窗口', statusLabel: '续费窗口', impactLine: '影响会员续费与资产消耗', ownerRole: '管家', evidenceChain: ['会员', '资产', '预约', '续费'] },
    { id: 'da5', segment: 'memberRisk', group: 'memberRenewal', entityType: 'member', entityId: 'db-mem-3', title: '王女士流失风险', statusLabel: '流失风险', impactLine: '月卡过期未续', ownerRole: '管家', evidenceChain: ['会员', '到课', '续费', '流失'] },
    { id: 'da6', segment: 'memberRisk', group: 'memberRenewal', entityType: 'member', entityId: 'db-mem-7', title: '周先生季卡续费', statusLabel: '续费窗口', impactLine: '7 天内到期', ownerRole: '管家', evidenceChain: ['会员', '合同', '续费'] },
    { id: 'da7', segment: 'courseAnomaly', group: 'courseSchedule', entityType: 'course', entityId: 'db-course-1', title: '城西馆流瑜伽晚场', statusLabel: '低预约', impactLine: '满课率偏低', ownerRole: '店长', evidenceChain: ['课程', '预约', '老师'] },
    { id: 'da8', segment: 'courseAnomaly', group: 'courseSchedule', entityType: 'course', entityId: 'db-course-3', title: '万象馆阴瑜伽取消', statusLabel: '取消课', impactLine: '需通知会员', ownerRole: '管家', evidenceChain: ['课程', '预约', '会员'] },
    { id: 'da9', segment: 'courseAnomaly', group: 'courseSchedule', entityType: 'course', entityId: 'db-course-4', title: '西湖馆阿斯汤加低预约', statusLabel: '低预约', impactLine: '满课率与耗课', ownerRole: '店长', evidenceChain: ['课程', '预约', '老师'] },
    { id: 'da10', segment: 'financeRisk', group: 'financeEvidence', entityType: 'finance', entityId: 'db-fin-2', title: '城西馆预收负债核对', statusLabel: '待核对', impactLine: '负债与确认收入口径', ownerRole: '财务', evidenceChain: ['合同', '收款', '负债', '收入'], openTab: 'finance' },
    { id: 'da11', segment: 'financeRisk', group: 'financeEvidence', entityType: 'finance', entityId: 'db-fin-4', title: '滨江馆支付异常', statusLabel: '异常', impactLine: '证据链缺失', ownerRole: '财务', evidenceChain: ['订单', '支付', '财务'] },
    { id: 'da12', segment: 'financeRisk', group: 'financeEvidence', entityType: 'finance', entityId: 'db-fin-3', title: '西湖馆课时费待核', statusLabel: '待核', impactLine: '老师成本确认', ownerRole: '店长', evidenceChain: ['签到', '课时', '财务'] },
    { id: 'da13', segment: 'storeHealth', group: 'review', entityType: 'store', entityId: 'db-store-1', title: '万象馆经营复核', statusLabel: '关注', impactLine: '退款与链路双风险', ownerRole: '总部运营', evidenceChain: ['门店', '财务', '课程'] },
    { id: 'da14', segment: 'teacherExec', group: 'review', entityType: 'teacher', entityId: 'db-tea-4', title: 'Joy 课时费积压', statusLabel: '待核', impactLine: '成本与利润', ownerRole: '店长', evidenceChain: ['老师', '签到', '财务'] },
    { id: 'da15', segment: 'todayTodo', group: 'review', entityType: 'todo', entityId: 'db-todo-8', title: '万象馆跨模块链路', statusLabel: '总部复核', impactLine: '签到未耗课', ownerRole: '总部运营', evidenceChain: ['会员', '课程', '签到', '耗课', '财务'] },
    { id: 'da16', segment: 'crossModule', group: 'financeEvidence', entityType: 'chain', entityId: 'db-chain-3', title: '退款审批链路', statusLabel: '卡点', impactLine: '现金流与会员资产', ownerRole: '财务', evidenceChain: ['订单', '退款', '审批', '财务'] },
    { id: 'da17', segment: 'todayTodo', group: 'courseSchedule', entityType: 'todo', entityId: 'db-todo-10', title: '西湖馆取消课通知', statusLabel: '待处理', impactLine: '会员触达', ownerRole: '管家', evidenceChain: ['课程', '会员', '通知'] },
  ];

  const totalPending = todayTodo.filter(t => t.status === '待处理').length;
  const highPriorityCount = actionQueue.filter(a => a.group === 'highPriority').length;
  const overdueCount = todayTodo.filter(
    t => t.status === '待处理' && t.deadline.includes('今日'),
  ).length;

  const healthStatus = deriveDashboardHealthStatus({
    highPriorityCount,
    overdueCount,
    totalPending,
  });

  const last7DaysIssueTrend: DashboardTrendDay[] = [
    { dateLabel: '05-10', count: 4, highCount: 1 },
    { dateLabel: '05-11', count: 5, highCount: 1 },
    { dateLabel: '05-12', count: 6, highCount: 2 },
    { dateLabel: '05-13', count: 5, highCount: 1 },
    { dateLabel: '05-14', count: 7, highCount: 2 },
    { dateLabel: '05-15', count: 6, highCount: 2 },
    { dateLabel: '05-16', count: totalPending + 2, highCount: highPriorityCount },
  ];

  const distCounts: Record<DashboardRiskDistItem['module'], number> = {
    member: 0,
    course: 0,
    finance: 0,
    teacher: 0,
    store: 0,
  };
  todayTodo.forEach(t => {
    const key = MODULE_TO_DIST[t.module] ?? 'store';
    distCounts[key] += 1;
  });

  const riskDistribution: DashboardRiskDistItem[] = (
    Object.keys(distCounts) as DashboardRiskDistItem['module'][]
  ).map(module => ({
    module,
    label: DIST_LABELS[module],
    count: distCounts[module],
    tone: module,
  }));

  const storeHealthItems: DashboardStoreHealthItem[] = [
    {
      storeName: '万象馆',
      status: 'attention',
      issueCount: 2,
      highCount: 1,
      suggestion: '退款复核待处理',
    },
    {
      storeName: '西湖馆',
      status: 'risk',
      issueCount: 5,
      highCount: 2,
      suggestion: '晚课预约偏低',
    },
    {
      storeName: '滨江馆',
      status: 'attention',
      issueCount: 3,
      highCount: 0,
      suggestion: '新客回访不足',
    },
    {
      storeName: '城西馆',
      status: 'stable',
      issueCount: 0,
      highCount: 0,
      suggestion: '运行平稳',
    },
    {
      storeName: '云谷馆',
      status: 'stable',
      issueCount: 2,
      highCount: 0,
      suggestion: '非课确认待办',
    },
  ];

  const stitchTrend: DashboardTrendDay[] = [
    { dateLabel: '周一', count: 6, highCount: 1 },
    { dateLabel: '周二', count: 7, highCount: 1 },
    { dateLabel: '周三', count: 8, highCount: 2 },
    { dateLabel: '周四', count: 6, highCount: 1 },
    { dateLabel: '周五', count: 7, highCount: 1 },
    { dateLabel: '周六', count: 9, highCount: 2 },
    { dateLabel: '今日', count: 12, highCount: 3 },
  ];

  const stitch: DashboardStitchView = {
    statusHero: {
      title: '今日经营状态',
      line1: '今日共 12 项待处理，其中 3 项高优先级，2 项临近超时。',
      line2: '需优先关注课程预约偏低、会员续费窗口、退款与耗课证据链。',
      totalPending: 12,
      highPriorityCount: 3,
      nearOverdueCount: 2,
    },
    judgment: {
      priorityCount: 3,
      categories: [
        { label: '会员相关', count: 5 },
        { label: '课程相关', count: 3 },
        { label: '财务相关', count: 4 },
      ],
      trend: stitchTrend,
      footnote:
        '今日待处理事项升至 12 项，优先核对课程预约、会员续费与财务证据链。',
    },
    evidenceNodes: [
      { key: 'member', label: '会员', value: '1,204', iconClass: 'fa-solid fa-user' },
      { key: 'order', label: '订单', value: '450', iconClass: 'fa-solid fa-receipt' },
      { key: 'contract', label: '合同', value: formatDashboardCompactMoney(2100000), iconClass: 'fa-solid fa-file-lines' },
      { key: 'booking', label: '预约', value: '68%', iconClass: 'fa-solid fa-calendar-check', isAnomaly: true },
      { key: 'checkin', label: '签到', value: '92%', iconClass: 'fa-solid fa-clipboard-check' },
      { key: 'consume', label: '耗课', value: '850课时', iconClass: 'fa-solid fa-hourglass-half' },
      { key: 'finance', label: '财务', value: '¥145K', iconClass: 'fa-solid fa-coins' },
    ],
    evidenceInsight:
      '发现异常：西湖馆低预约课程正在影响耗课效率与老师成本，建议核对排课、会员偏好与课时费结算。',
    storeMonitor: [
      {
        id: 'db-store-1',
        storeName: '万象馆',
        status: '正常',
        problem: '退款复核积压，合同需归档',
        healthScore: 94,
        riskLevel: '正常',
      },
      {
        id: 'db-store-4',
        storeName: '西湖馆',
        status: '风险',
        problem: '晚课预约偏低，耗课率预警',
        healthScore: 72,
        riskLevel: '风险',
      },
      {
        id: 'db-store-3',
        storeName: '滨江馆',
        status: '关注',
        problem: '新客跟进不足，转化率低',
        healthScore: 58,
        riskLevel: '关注',
      },
      {
        id: 'db-store-2',
        storeName: '城西馆',
        status: '稳定',
        problem: '无异常',
        healthScore: 88,
        riskLevel: '稳定',
      },
      {
        id: 'db-store-5',
        storeName: '云谷馆',
        status: '稳定',
        problem: '个别排课待确认',
        healthScore: 85,
        riskLevel: '稳定',
      },
    ],
    actionSuggestions: [
      {
        id: 'sug-1',
        category: '课程运营',
        owner: '店长',
        title: '西湖馆晚课排课调整',
        description:
          '系统检测到连续 3 天 19:00 档预约率低于 30%，建议减少该时段课程或更换热门流派，以减少固定课时费空耗。',
        buttonLabel: '查看排课建议',
        tone: 'primary',
        entityId: 'db-course-4',
        openTab: 'judgment',
      },
      {
        id: 'sug-2',
        category: '会员经营',
        owner: '销售主管',
        title: '滨江馆新客回访升级',
        description:
          '本周体验课新客转化率跌破底线，需督导销售团队在 24 小时内完成全部回访，目前有 12 条线索超时待跟进。',
        buttonLabel: '分配跟进',
        tone: 'attention',
        entityId: 'db-mem-2',
      },
      {
        id: 'sug-3',
        category: '财务管理',
        owner: '财务',
        title: '万象馆退款单复核',
        description:
          '2 笔退款申请已超过内部流转时效，需财务确认耗课扣费明细并释放相应预收负债，以保证账实相符。',
        buttonLabel: '进入审批',
        tone: 'neutral',
        entityId: 'db-fin-1',
        openTab: 'finance',
      },
    ],
  };

  const cockpit: DashboardCockpitSummary = {
    healthStatus,
    healthLabel: HEALTH_LABELS[healthStatus],
    headline: `今日 ${totalPending} 项待处理，其中 ${highPriorityCount} 项高优先级，优先处理课程、财务与会员续费。`,
    totalPending,
    highPriorityCount,
    overdueCount,
    last7DaysIssueTrend,
    riskDistribution,
    storeHealthItems,
    defaultChainSteps: ['会员', '课程', '签到', '耗课', '财务'],
  };

  return {
    cockpit,
    stitch,
    metrics,
    insights,
    todayTodo,
    storeHealth,
    memberRisk,
    courseAnomaly,
    financeRisk,
    teacherExec,
    crossModule,
    details,
    actionQueue,
  };
};

export const findDashboardDetail = (snapshot: DashboardOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getDashboardRows = (snapshot: DashboardOperationSnapshot, segment: DashboardSegment): DashboardTableRow[] => {
  switch (segment) {
    case 'todayTodo': return snapshot.todayTodo;
    case 'storeHealth': return snapshot.storeHealth;
    case 'memberRisk': return snapshot.memberRisk;
    case 'courseAnomaly': return snapshot.courseAnomaly;
    case 'financeRisk': return snapshot.financeRisk;
    case 'teacherExec': return snapshot.teacherExec;
    case 'crossModule': return snapshot.crossModule;
    default: return [];
  }
};

export const filterDashboardRows = (
  rows: DashboardTableRow[],
  filters: DashboardListFilters,
): DashboardTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    const store = 'storeName' in row ? row.storeName : 'store' in row ? row.store : row.storeKey;
    if (filters.store !== '全部' && store && !String(store).includes(filters.store)) return false;
    if (filters.risk !== '全部' && 'riskLevel' in row) {
      const r = row.riskLevel;
      if (filters.risk === '高' && r !== '高' && r !== '高风险') return false;
      if (filters.risk === '关注' && r !== '关注' && r !== '中') return false;
      if (filters.risk === '正常' && r !== '正常' && r !== '低') return false;
    }
    if (filters.module !== '全部' && 'module' in row && row.module !== filters.module) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computeDashboardSegmentMiniSummary = (
  snapshot: DashboardOperationSnapshot,
  segment: DashboardSegment,
): { label: string; value: string }[] => {
  switch (segment) {
    case 'todayTodo': {
      const rows = snapshot.todayTodo;
      return [
        { label: '待处理', value: `${rows.filter(r => r.status === '待处理').length} 项` },
        { label: '高优先级', value: `${rows.filter(r => r.riskLevel === '高').length} 项` },
        { label: '超时', value: `${rows.filter(r => r.deadline.includes('今日') && r.status === '待处理').length} 项` },
        { label: '已处理', value: `${rows.filter(r => r.status === '跟进中').length} 项` },
      ];
    }
    case 'storeHealth': {
      const rows = snapshot.storeHealth;
      return [
        { label: '门店数', value: `${rows.length} 家` },
        { label: '健康门店', value: `${rows.filter(r => r.judgment === '健康').length} 家` },
        { label: '关注门店', value: `${rows.filter(r => r.riskLevel === '关注').length} 家` },
        { label: '风险门店', value: `${rows.filter(r => r.riskLevel === '高' || r.riskLevel === '中').length} 家` },
      ];
    }
    case 'memberRisk': {
      const rows = snapshot.memberRisk;
      return [
        { label: '风险会员', value: `${rows.filter(r => r.riskLevel !== '正常').length} 人` },
        { label: '续费窗口', value: `${rows.filter(r => r.stage === '续费窗口').length} 人` },
        { label: '流失风险', value: `${rows.filter(r => r.stage === '流失风险').length} 人` },
        { label: '待跟进', value: `${rows.filter(r => r.riskReason !== '—').length} 人` },
      ];
    }
    case 'courseAnomaly': {
      const rows = snapshot.courseAnomaly;
      return [
        { label: '异常课程', value: `${rows.length} 场` },
        { label: '低预约', value: `${rows.filter(r => r.anomalyType === '低预约').length} 场` },
        { label: '待完课', value: `${rows.filter(r => r.anomalyType === '待完课').length} 场` },
        { label: '调课取消', value: `${rows.filter(r => /取消|调课/.test(r.anomalyType)).length} 场` },
      ];
    }
    case 'financeRisk': {
      const rows = snapshot.financeRisk;
      return [
        { label: '风险金额', value: '¥ 29.5万' },
        { label: '待核订单', value: `${rows.filter(r => r.financeStatus.includes('待')).length} 笔` },
        { label: '退款待审', value: `${rows.filter(r => r.riskItem.includes('退款')).length} 笔` },
        { label: '课时费待核', value: `${rows.filter(r => r.riskItem.includes('课时费')).length} 笔` },
      ];
    }
    case 'teacherExec': {
      const rows = snapshot.teacherExec;
      return [
        { label: '今日上课老师', value: `${rows.length} 人` },
        { label: '待确认课时', value: `${rows.filter(r => r.feeStatus.includes('待')).length} 人` },
        { label: '满课率偏低', value: `${rows.filter(r => r.execRisk.includes('满课')).length} 人` },
        { label: '成长风险', value: `${rows.filter(r => r.growthImpact.includes('承压') || r.growthImpact.includes('偏高')).length} 人` },
      ];
    }
    case 'crossModule': {
      const rows = snapshot.crossModule;
      return [
        { label: '链路事项', value: `${rows.length} 项` },
        { label: '卡在财务', value: `${rows.filter(r => r.stuckPoint.includes('财务') || r.impactModules.includes('财务')).length} 项` },
        { label: '卡在合同', value: `${rows.filter(r => r.stuckPoint.includes('合同') || r.startModule.includes('合同')).length} 项` },
        { label: '卡在课程', value: `${rows.filter(r => r.stuckPoint.includes('课') || r.stuckPoint.includes('排')).length} 项` },
      ];
    }
    default:
      return [];
  }
};

export const ACTION_GROUP_TITLES: Record<DashboardActionGroup, string> = {
  highPriority: '高优先级风险',
  memberRenewal: '会员续费与流失',
  courseSchedule: '课程与排课异常',
  financeEvidence: '财务与证据链',
  review: '店长 / 总部复核',
};

const SEGMENT_ACTION_MAP: Record<DashboardSegment, DashboardActionGroup[]> = {
  todayTodo: ['highPriority', 'review', 'courseSchedule'],
  storeHealth: ['highPriority', 'review'],
  memberRisk: ['memberRenewal'],
  courseAnomaly: ['courseSchedule'],
  financeRisk: ['financeEvidence', 'highPriority'],
  teacherExec: ['review', 'financeEvidence'],
  crossModule: ['highPriority', 'financeEvidence', 'memberRenewal'],
};

export const getSegmentActionItems = (
  queue: DashboardActionItem[],
  segment: DashboardSegment,
): DashboardActionItem[] => {
  const groups = new Set(SEGMENT_ACTION_MAP[segment] ?? Object.keys(ACTION_GROUP_TITLES));
  return queue.filter(i => i.segment === segment || groups.has(i.group));
};
