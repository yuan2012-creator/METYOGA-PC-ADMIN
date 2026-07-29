/** 数据中心模块局部 demo 数据 */

import { formatDataCny } from './dataCenterFormatters';
import type { DataCenterDetailTabId } from './DataCenterDetailTabs';

export type DataSegment =
  | 'stores'
  | 'members'
  | 'courses'
  | 'teachers'
  | 'sales'
  | 'consumption'
  | 'finance'
  | 'activities';

export type DataEntityType =
  | 'store'
  | 'member'
  | 'course'
  | 'teacher'
  | 'sales'
  | 'consumption'
  | 'finance'
  | 'activity';

export type DataFocusGroup = 'storeAnomaly' | 'memberRisk' | 'courseTeacher' | 'financeActivity';

export interface DataListFilters {
  query: string;
  timeRange: string;
  store: string;
  risk: string;
  metricType: string;
}

export const DEFAULT_DATA_FILTERS: DataListFilters = {
  query: '',
  timeRange: '本月',
  store: '全部',
  risk: '全部',
  metricType: '全部',
};

export const DATA_FILTER_OPTIONS = {
  timeRanges: ['本月', '近 30 天', '近 90 天', '本年'],
  stores: ['全部', '万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'],
  risks: ['全部', '正常', '关注', '高风险'],
  metricTypes: ['全部', '收入', '到课', '会员', '课程', '财务'],
};

export const DATA_WORKBENCH_SEGMENTS: { id: DataSegment; label: string }[] = [
  { id: 'stores', label: '门店对比' },
  { id: 'members', label: '会员分析' },
  { id: 'courses', label: '课程分析' },
  { id: 'teachers', label: '老师分析' },
  { id: 'sales', label: '销售分析' },
  { id: 'consumption', label: '耗课分析' },
  { id: 'finance', label: '财务分析' },
  { id: 'activities', label: '活动分析' },
];

export const DATA_SEGMENT_HINTS: Record<DataSegment, string> = {
  stores: '对比各门店实收、到课、会员与风险差异',
  members: '分析会员阶段结构、新增流失与续费转化',
  courses: '分析课程排课、预约到课与满课率结构',
  teachers: '分析老师产能、满课率与私教转化',
  sales: '分析门店与管家销售、新购续费与体验转化',
  consumption: '分析耗课点数、确认收入与未耗权益',
  finance: '分析实收、预收负债、确认收入与支出',
  activities: '分析活动报名、成交、成本与复用价值',
};

export interface DataMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface DataInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: DataSegment;
}

export interface DataStoreRecord {
  id: string;
  segment: 'stores';
  storeName: string;
  revenue: number;
  confirmedRevenue: number;
  attendance: number;
  newMembers: number;
  renewalAmount: number;
  fillRate: string;
  riskLevel: string;
}

export interface DataMemberRecord {
  id: string;
  segment: 'members';
  stage: string;
  count: number;
  ratio: string;
  newThisMonth: number;
  churnThisMonth: number;
  renewalRate: string;
  riskNote: string;
  riskLevel: string;
}

export interface DataCourseRecord {
  id: string;
  segment: 'courses';
  courseName: string;
  courseType: string;
  scheduleCount: number;
  bookings: number;
  attendance: number;
  fillRate: string;
  cancelNoShow: string;
  riskLevel: string;
}

export interface DataTeacherRecord {
  id: string;
  segment: 'teachers';
  teacherName: string;
  store: string;
  classCount: number;
  attendance: number;
  fillRate: string;
  feedback: string;
  ptConversion: string;
  riskLevel: string;
}

export interface DataSalesRecord {
  id: string;
  segment: 'sales';
  storeButler: string;
  store: string;
  salesAmount: number;
  newPurchase: number;
  renewalAmount: number;
  trialConversion: string;
  avgOrder: number;
  riskLevel: string;
}

export interface DataConsumptionRecord {
  id: string;
  segment: 'consumption';
  store: string;
  consumePoints: number;
  consumeTimes: number;
  confirmedRevenue: number;
  unusedBenefit: string;
  highBalanceMembers: number;
  riskLevel: string;
}

export interface DataFinanceRecord {
  id: string;
  segment: 'finance';
  store: string;
  revenue: number;
  refund: number;
  netRevenue: number;
  prepaidLiability: number;
  confirmedRevenue: number;
  expense: number;
  riskLevel: string;
}

export interface DataActivityRecord {
  id: string;
  segment: 'activities';
  activityName: string;
  signups: number;
  arrivals: number;
  dealAmount: number;
  activityCost: number;
  conversionRate: string;
  reuseAdvice: string;
  riskLevel: string;
}

export type DataTableRow =
  | DataStoreRecord
  | DataMemberRecord
  | DataCourseRecord
  | DataTeacherRecord
  | DataSalesRecord
  | DataConsumptionRecord
  | DataFinanceRecord
  | DataActivityRecord;

export interface DataFocusItem {
  id: string;
  segment: DataSegment;
  group: DataFocusGroup;
  entityType: DataEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  reasonLine: string;
  analysisChain: string[];
  openTab?: DataCenterDetailTabId;
}

export interface DataTrendPoint {
  label: string;
  value: number;
  unit: string;
}

export interface DataRelatedItem {
  type: string;
  name: string;
  value: string;
}

export interface DataAdviceItem {
  action: string;
  role: string;
  cycle: string;
  note: string;
}

export interface DataCaliberItem {
  metric: string;
  definition: string;
  scope: string;
  source: string;
}

export interface DataJudgment {
  summary: string;
  deviation: string;
  nextStep: string;
}

export interface DataDetailRecord {
  id: string;
  entityType: DataEntityType;
  segment: DataSegment;
  title: string;
  subtitle: string;
  status: string;
  riskLevel: string;
  todaySuggestion: string;
  judgment: DataJudgment;
  coreMetrics: { label: string; value: string }[];
  trend7d: DataTrendPoint[];
  trend30d: DataTrendPoint[];
  trend90d: DataTrendPoint[];
  compareLastMonth: string;
  compareOtherStores: string;
  compareTarget: string;
  deviationReason: string;
  relatedItems: DataRelatedItem[];
  adviceItems: DataAdviceItem[];
  evidenceChain: string[];
  caliberItems: DataCaliberItem[];
  updatedAt: string;
  isDemo: boolean;
}

export interface DataOperationSnapshot {
  metrics: DataMetric[];
  insights: DataInsight[];
  stores: DataStoreRecord[];
  members: DataMemberRecord[];
  courses: DataCourseRecord[];
  teachers: DataTeacherRecord[];
  sales: DataSalesRecord[];
  consumption: DataConsumptionRecord[];
  finance: DataFinanceRecord[];
  activities: DataActivityRecord[];
  details: DataDetailRecord[];
  focusQueue: DataFocusItem[];
}

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];

const mkJudgment = (risk: string): DataJudgment => ({
  summary:
    risk === '高风险'
      ? '该对象近期趋势偏弱，建议结合门店、课程与会员结构做对比复盘'
      : risk === '关注'
        ? '指标存在波动，建议持续观察 30 天趋势变化'
        : '整体趋势稳定，可作为对标基准继续观察',
  deviation: risk === '高风险' ? '较上月偏差明显' : risk === '关注' ? '较目标值略有偏差' : '—',
  nextStep: '建议结合对比分析与关联明细复盘（分析预览 · 需审批后执行）',
});

const mkTrend = (base: number, unit: string, labels: string[]): DataTrendPoint[] =>
  labels.map((label, i) => ({
    label,
    value: Math.round(base * (0.85 + i * 0.04 + (i % 2) * 0.03)),
    unit,
  }));

const mkDetail = (
  row: DataTableRow,
  entityType: DataEntityType,
  title: string,
  subtitle: string,
  coreMetrics: { label: string; value: string }[],
  chain: string[],
): DataDetailRecord => {
  const risk = 'riskLevel' in row ? row.riskLevel : '关注';
  const base = 'revenue' in row && typeof row.revenue === 'number' ? row.revenue : 50000;
  return {
    id: row.id,
    entityType,
    segment: row.segment,
    title,
    subtitle,
    status: risk === '高风险' ? '需关注' : risk === '关注' ? '观察中' : '稳定',
    riskLevel: risk,
    todaySuggestion: `建议查看 ${title} 的 30 天趋势与门店对比（分析预览）`,
    judgment: mkJudgment(risk),
    coreMetrics,
    trend7d: mkTrend(base / 7, '元', ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']),
    trend30d: mkTrend(base / 30, '元', ['W1', 'W2', 'W3', 'W4']),
    trend90d: mkTrend(base / 90, '元', ['M1', 'M2', 'M3']),
    compareLastMonth: risk === '高风险' ? '较上月 -12%' : '较上月 +5%',
    compareOtherStores: '低于均值 8%',
    compareTarget: '达成目标 92%',
    deviationReason: '晚峰课程预约下降 + 体验转化放缓（前端演示推断）',
    relatedItems: [
      { type: '会员', name: '有效会员', value: '1,280 人' },
      { type: '课程', name: '热门课程', value: '流瑜伽晚班' },
      { type: '老师', name: '主力老师', value: '李老师' },
      { type: '订单', name: '续费订单', value: '86 笔（演示）' },
      { type: '活动', name: '关联活动', value: '新客体验周' },
    ],
    adviceItems: [
      { action: '复盘晚峰课程排课结构', role: '店长 / 课程运营', cycle: '本周', note: '分析预览，待接入真实服务' },
      { action: '对比同类型门店满课率', role: '总部运营', cycle: '近 30 天', note: '以业务系统真实数据为准' },
      { action: '导出趋势报表供会议复盘', role: '财务 / 运营', cycle: '本月', note: '需审批后执行' },
    ],
    evidenceChain: chain,
    caliberItems: [
      { metric: '实收', definition: '门店当期收款金额（演示）', scope: '全馆 / 不含退款冲减', source: '财务系统（待接入）' },
      { metric: '确认收入', definition: '按耗课规则确认的收入（演示）', scope: '会员资产消耗后确认', source: '财务 + 会员系统' },
      { metric: '到课人次', definition: '签到成功人次', scope: '团课 + 私教', source: '课程运营系统' },
      { metric: '是否演示', definition: '当前页面为前端演示数据', scope: '—', source: '本地 viewModel' },
    ],
    updatedAt: '2026-05-14 18:00（演示）',
    isDemo: true,
  };
};

const buildDetails = (
  stores: DataStoreRecord[],
  members: DataMemberRecord[],
  courses: DataCourseRecord[],
  teachers: DataTeacherRecord[],
  sales: DataSalesRecord[],
  consumption: DataConsumptionRecord[],
  finance: DataFinanceRecord[],
  activities: DataActivityRecord[],
): DataDetailRecord[] => [
  ...stores.map(s =>
    mkDetail(
      s,
      'store',
      s.storeName,
      `实收 ${formatDataCny(s.revenue)} · 到课 ${s.attendance} 人次`,
      [
        { label: '实收', value: formatDataCny(s.revenue) },
        { label: '确认收入', value: formatDataCny(s.confirmedRevenue) },
        { label: '到课人次', value: `${s.attendance}` },
        { label: '新增会员', value: `${s.newMembers}` },
        { label: '续费金额', value: formatDataCny(s.renewalAmount) },
        { label: '满课率', value: s.fillRate },
      ],
      ['门店', '课程', '到课', '收入'],
    ),
  ),
  ...members.map(m =>
    mkDetail(
      m,
      'member',
      m.stage,
      `人数 ${m.count} · 占比 ${m.ratio}`,
      [
        { label: '人数', value: `${m.count}` },
        { label: '占比', value: m.ratio },
        { label: '本月新增', value: `${m.newThisMonth}` },
        { label: '本月流失', value: `${m.churnThisMonth}` },
        { label: '续费转化', value: m.renewalRate },
        { label: '风险说明', value: m.riskNote },
      ],
      ['会员', '续费', '流失', '收入'],
    ),
  ),
  ...courses.map(c =>
    mkDetail(
      c,
      'course',
      c.courseName,
      `${c.courseType} · 满课率 ${c.fillRate}`,
      [
        { label: '排课数', value: `${c.scheduleCount}` },
        { label: '预约人数', value: `${c.bookings}` },
        { label: '到课人数', value: `${c.attendance}` },
        { label: '满课率', value: c.fillRate },
        { label: '取消/爽约', value: c.cancelNoShow },
      ],
      ['课程', '预约', '到课', '收入'],
    ),
  ),
  ...teachers.map(t =>
    mkDetail(
      t,
      'teacher',
      t.teacherName,
      `${t.store} · 满课率 ${t.fillRate}`,
      [
        { label: '上课数', value: `${t.classCount}` },
        { label: '到课人数', value: `${t.attendance}` },
        { label: '满课率', value: t.fillRate },
        { label: '会员反馈', value: t.feedback },
        { label: '私教转化', value: t.ptConversion },
      ],
      ['老师', '课程', '到课', '转化'],
    ),
  ),
  ...sales.map(s =>
    mkDetail(
      s,
      'sales',
      s.storeButler,
      `${s.store} · 销售 ${formatDataCny(s.salesAmount)}`,
      [
        { label: '销售金额', value: formatDataCny(s.salesAmount) },
        { label: '新购金额', value: formatDataCny(s.newPurchase) },
        { label: '续费金额', value: formatDataCny(s.renewalAmount) },
        { label: '体验转化', value: s.trialConversion },
        { label: '客单价', value: formatDataCny(s.avgOrder) },
      ],
      ['销售', '新购', '续费', '收入'],
    ),
  ),
  ...consumption.map(c =>
    mkDetail(
      c,
      'consumption',
      c.store,
      `耗课 ${c.consumePoints} 点 · 确认收入 ${formatDataCny(c.confirmedRevenue)}`,
      [
        { label: '耗课点数', value: `${c.consumePoints}` },
        { label: '耗课次数', value: `${c.consumeTimes}` },
        { label: '确认收入', value: formatDataCny(c.confirmedRevenue) },
        { label: '未耗权益', value: c.unusedBenefit },
        { label: '高余额会员', value: `${c.highBalanceMembers}` },
      ],
      ['耗课', '权益', '确认收入', '负债'],
    ),
  ),
  ...finance.map(f =>
    mkDetail(
      f,
      'finance',
      f.store,
      `净收 ${formatDataCny(f.netRevenue)} · 预收负债 ${formatDataCny(f.prepaidLiability)}`,
      [
        { label: '实收', value: formatDataCny(f.revenue) },
        { label: '退款', value: formatDataCny(f.refund) },
        { label: '净收', value: formatDataCny(f.netRevenue) },
        { label: '预收负债', value: formatDataCny(f.prepaidLiability) },
        { label: '确认收入', value: formatDataCny(f.confirmedRevenue) },
        { label: '支出', value: formatDataCny(f.expense) },
      ],
      ['实收', '预收', '确认收入', '支出'],
    ),
  ),
  ...activities.map(a =>
    mkDetail(
      a,
      'activity',
      a.activityName,
      `转化 ${a.conversionRate} · ${a.reuseAdvice}`,
      [
        { label: '报名人数', value: `${a.signups}` },
        { label: '到店人数', value: `${a.arrivals}` },
        { label: '成交金额', value: formatDataCny(a.dealAmount) },
        { label: '活动成本', value: formatDataCny(a.activityCost) },
        { label: '转化率', value: a.conversionRate },
        { label: '复用建议', value: a.reuseAdvice },
      ],
      ['活动', '报名', '成交', '复盘'],
    ),
  ),
];

export const buildDataCenterOperationSnapshot = (): DataOperationSnapshot => {
  const stores: DataStoreRecord[] = STORES.map((name, i) => ({
    id: `dc-store-${i + 1}`,
    segment: 'stores',
    storeName: name,
    revenue: [428000, 356000, 312000, 285000, 198000][i],
    confirmedRevenue: [380000, 310000, 275000, 248000, 172000][i],
    attendance: [1280, 1050, 920, 860, 620][i],
    newMembers: [86, 72, 58, 48, 32][i],
    renewalAmount: [156000, 128000, 112000, 98000, 68000][i],
    fillRate: ['78%', '72%', '68%', '65%', '58%'][i],
    riskLevel: i === 4 ? '高风险' : i === 3 ? '关注' : '正常',
  }));

  const members: DataMemberRecord[] = [
    { id: 'dc-mem-1', segment: 'members', stage: '活跃会员', count: 2180, ratio: '42%', newThisMonth: 186, churnThisMonth: 42, renewalRate: '68%', riskNote: '—', riskLevel: '正常' },
    { id: 'dc-mem-2', segment: 'members', stage: '续费机会', count: 520, ratio: '10%', newThisMonth: 0, churnThisMonth: 18, renewalRate: '—', riskNote: '30 天内到期', riskLevel: '关注' },
    { id: 'dc-mem-3', segment: 'members', stage: '体验客', count: 380, ratio: '7%', newThisMonth: 128, churnThisMonth: 62, renewalRate: '22%', riskNote: '转化不足', riskLevel: '关注' },
    { id: 'dc-mem-4', segment: 'members', stage: '沉睡会员', count: 860, ratio: '17%', newThisMonth: 0, churnThisMonth: 86, renewalRate: '8%', riskNote: '90 天未到课', riskLevel: '高风险' },
    { id: 'dc-mem-5', segment: 'members', stage: '私教会员', count: 420, ratio: '8%', newThisMonth: 32, churnThisMonth: 8, renewalRate: '72%', riskNote: '—', riskLevel: '正常' },
    { id: 'dc-mem-6', segment: 'members', stage: '新客线索', count: 290, ratio: '6%', newThisMonth: 290, churnThisMonth: 48, renewalRate: '—', riskNote: '跟进中', riskLevel: '关注' },
    { id: 'dc-mem-7', segment: 'members', stage: '流失预警', count: 180, ratio: '3%', newThisMonth: 0, churnThisMonth: 36, renewalRate: '—', riskNote: '余额高但低频', riskLevel: '高风险' },
    { id: 'dc-mem-8', segment: 'members', stage: '教培学员', count: 96, ratio: '2%', newThisMonth: 18, churnThisMonth: 4, renewalRate: '—', riskNote: '—', riskLevel: '正常' },
    { id: 'dc-mem-9', segment: 'members', stage: '家庭卡', count: 210, ratio: '4%', newThisMonth: 12, churnThisMonth: 6, renewalRate: '58%', riskNote: '—', riskLevel: '正常' },
    { id: 'dc-mem-10', segment: 'members', stage: '企业团课', count: 145, ratio: '3%', newThisMonth: 8, churnThisMonth: 2, renewalRate: '—', riskNote: '合同续签观察', riskLevel: '关注' },
  ];

  const courses: DataCourseRecord[] = [
    { id: 'dc-crs-1', segment: 'courses', courseName: '流瑜伽晚班', courseType: '团课', scheduleCount: 48, bookings: 820, attendance: 680, fillRate: '83%', cancelNoShow: '12%', riskLevel: '正常' },
    { id: 'dc-crs-2', segment: 'courses', courseName: '阴瑜伽修复', courseType: '团课', scheduleCount: 36, bookings: 420, attendance: 360, fillRate: '75%', cancelNoShow: '10%', riskLevel: '正常' },
    { id: 'dc-crs-3', segment: 'courses', courseName: '普拉提小班', courseType: '小班', scheduleCount: 32, bookings: 280, attendance: 248, fillRate: '88%', cancelNoShow: '6%', riskLevel: '正常' },
    { id: 'dc-crs-4', segment: 'courses', courseName: '晨间唤醒', courseType: '团课', scheduleCount: 40, bookings: 180, attendance: 120, fillRate: '38%', cancelNoShow: '22%', riskLevel: '高风险' },
    { id: 'dc-crs-5', segment: 'courses', courseName: '燃脂搏击', courseType: '团课', scheduleCount: 28, bookings: 320, attendance: 260, fillRate: '72%', cancelNoShow: '14%', riskLevel: '关注' },
    { id: 'dc-crs-6', segment: 'courses', courseName: '私教体验', courseType: '私教', scheduleCount: 60, bookings: 95, attendance: 82, fillRate: '—', cancelNoShow: '8%', riskLevel: '关注' },
    { id: 'dc-crs-7', segment: 'courses', courseName: '孕产修复', courseType: '小班', scheduleCount: 16, bookings: 96, attendance: 88, fillRate: '92%', cancelNoShow: '4%', riskLevel: '正常' },
    { id: 'dc-crs-8', segment: 'courses', courseName: '周末工作坊', courseType: '活动课', scheduleCount: 8, bookings: 120, attendance: 108, fillRate: '90%', cancelNoShow: '5%', riskLevel: '正常' },
    { id: 'dc-crs-9', segment: 'courses', courseName: '午间舒缓', courseType: '团课', scheduleCount: 24, bookings: 96, attendance: 58, fillRate: '42%', cancelNoShow: '18%', riskLevel: '高风险' },
    { id: 'dc-crs-10', segment: 'courses', courseName: '教培集训', courseType: '教培', scheduleCount: 12, bookings: 48, attendance: 46, fillRate: '96%', cancelNoShow: '2%', riskLevel: '正常' },
    { id: 'dc-crs-11', segment: 'courses', courseName: '空中瑜伽', courseType: '小班', scheduleCount: 20, bookings: 140, attendance: 118, fillRate: '68%', cancelNoShow: '11%', riskLevel: '关注' },
    { id: 'dc-crs-12', segment: 'courses', courseName: '企业定制课', courseType: '团课', scheduleCount: 10, bookings: 80, attendance: 72, fillRate: '80%', cancelNoShow: '6%', riskLevel: '正常' },
  ];

  const teachers: DataTeacherRecord[] = [
    { id: 'dc-tch-1', segment: 'teachers', teacherName: '李老师', store: '万象馆', classCount: 68, attendance: 920, fillRate: '82%', feedback: '4.8', ptConversion: '18%', riskLevel: '正常' },
    { id: 'dc-tch-2', segment: 'teachers', teacherName: '王老师', store: '城西馆', classCount: 62, attendance: 780, fillRate: '76%', feedback: '4.6', ptConversion: '14%', riskLevel: '正常' },
    { id: 'dc-tch-3', segment: 'teachers', teacherName: '陈老师', store: '滨江馆', classCount: 58, attendance: 720, fillRate: '74%', feedback: '4.5', ptConversion: '12%', riskLevel: '关注' },
    { id: 'dc-tch-4', segment: 'teachers', teacherName: '张老师', store: '西湖馆', classCount: 52, attendance: 580, fillRate: '68%', feedback: '4.2', ptConversion: '9%', riskLevel: '关注' },
    { id: 'dc-tch-5', segment: 'teachers', teacherName: '刘老师', store: '云谷馆', classCount: 44, attendance: 420, fillRate: '58%', feedback: '3.9', ptConversion: '6%', riskLevel: '高风险' },
    { id: 'dc-tch-6', segment: 'teachers', teacherName: '赵老师', store: '万象馆', classCount: 48, attendance: 560, fillRate: '72%', feedback: '4.4', ptConversion: '16%', riskLevel: '正常' },
    { id: 'dc-tch-7', segment: 'teachers', teacherName: '周老师', store: '城西馆', classCount: 40, attendance: 380, fillRate: '65%', feedback: '4.1', ptConversion: '8%', riskLevel: '关注' },
    { id: 'dc-tch-8', segment: 'teachers', teacherName: '吴老师', store: '滨江馆', classCount: 56, attendance: 640, fillRate: '78%', feedback: '4.7', ptConversion: '15%', riskLevel: '正常' },
    { id: 'dc-tch-9', segment: 'teachers', teacherName: '郑老师', store: '西湖馆', classCount: 38, attendance: 320, fillRate: '55%', feedback: '3.8', ptConversion: '5%', riskLevel: '高风险' },
    { id: 'dc-tch-10', segment: 'teachers', teacherName: '孙老师', store: '云谷馆', classCount: 36, attendance: 280, fillRate: '52%', feedback: '4.0', ptConversion: '7%', riskLevel: '高风险' },
  ];

  const sales: DataSalesRecord[] = [
    { id: 'dc-sal-1', segment: 'sales', storeButler: '管家 A', store: '万象馆', salesAmount: 186000, newPurchase: 82000, renewalAmount: 104000, trialConversion: '28%', avgOrder: 4200, riskLevel: '正常' },
    { id: 'dc-sal-2', segment: 'sales', storeButler: '管家 B', store: '万象馆', salesAmount: 142000, newPurchase: 68000, renewalAmount: 74000, trialConversion: '24%', avgOrder: 3800, riskLevel: '正常' },
    { id: 'dc-sal-3', segment: 'sales', storeButler: '管家 C', store: '城西馆', salesAmount: 128000, newPurchase: 52000, renewalAmount: 76000, trialConversion: '22%', avgOrder: 3600, riskLevel: '关注' },
    { id: 'dc-sal-4', segment: 'sales', storeButler: '管家 D', store: '城西馆', salesAmount: 98000, newPurchase: 42000, renewalAmount: 56000, trialConversion: '18%', avgOrder: 3200, riskLevel: '关注' },
    { id: 'dc-sal-5', segment: 'sales', storeButler: '管家 E', store: '滨江馆', salesAmount: 112000, newPurchase: 48000, renewalAmount: 64000, trialConversion: '20%', avgOrder: 3400, riskLevel: '正常' },
    { id: 'dc-sal-6', segment: 'sales', storeButler: '管家 F', store: '滨江馆', salesAmount: 86000, newPurchase: 36000, renewalAmount: 50000, trialConversion: '16%', avgOrder: 3000, riskLevel: '关注' },
    { id: 'dc-sal-7', segment: 'sales', storeButler: '管家 G', store: '西湖馆', salesAmount: 92000, newPurchase: 38000, renewalAmount: 54000, trialConversion: '17%', avgOrder: 3100, riskLevel: '关注' },
    { id: 'dc-sal-8', segment: 'sales', storeButler: '管家 H', store: '西湖馆', salesAmount: 72000, newPurchase: 28000, renewalAmount: 44000, trialConversion: '14%', avgOrder: 2800, riskLevel: '高风险' },
    { id: 'dc-sal-9', segment: 'sales', storeButler: '管家 I', store: '云谷馆', salesAmount: 58000, newPurchase: 22000, renewalAmount: 36000, trialConversion: '12%', avgOrder: 2600, riskLevel: '高风险' },
    { id: 'dc-sal-10', segment: 'sales', storeButler: '管家 J', store: '云谷馆', salesAmount: 48000, newPurchase: 18000, renewalAmount: 30000, trialConversion: '10%', avgOrder: 2400, riskLevel: '高风险' },
  ];

  const consumption: DataConsumptionRecord[] = STORES.map((store, i) => ({
    id: `dc-csm-${i + 1}`,
    segment: 'consumption',
    store,
    consumePoints: [4200, 3600, 3100, 2800, 1900][i],
    consumeTimes: [980, 820, 720, 650, 420][i],
    confirmedRevenue: [380000, 310000, 275000, 248000, 172000][i],
    unusedBenefit: formatDataCny([820000, 680000, 590000, 520000, 380000][i]),
    highBalanceMembers: [86, 72, 58, 52, 38][i],
    riskLevel: i >= 3 ? '关注' : '正常',
  }));

  const finance: DataFinanceRecord[] = STORES.map((store, i) => ({
    id: `dc-fin-${i + 1}`,
    segment: 'finance',
    store,
    revenue: [428000, 356000, 312000, 285000, 198000][i],
    refund: [12000, 9800, 8600, 11200, 8800][i],
    netRevenue: [416000, 346200, 303400, 273800, 189200][i],
    prepaidLiability: [920000, 780000, 680000, 620000, 480000][i],
    confirmedRevenue: [380000, 310000, 275000, 248000, 172000][i],
    expense: [128000, 108000, 96000, 92000, 72000][i],
    riskLevel: i === 3 ? '关注' : i === 4 ? '高风险' : '正常',
  }));

  const activities: DataActivityRecord[] = [
    { id: 'dc-act-1', segment: 'activities', activityName: '520 瑜伽疗愈节', signups: 186, arrivals: 108, dealAmount: 86400, activityCost: 12800, conversionRate: '42%', reuseAdvice: '可复用', riskLevel: '正常' },
    { id: 'dc-act-2', segment: 'activities', activityName: '新客体验周', signups: 128, arrivals: 82, dealAmount: 42000, activityCost: 9200, conversionRate: '28%', reuseAdvice: '需优化', riskLevel: '关注' },
    { id: 'dc-act-3', segment: 'activities', activityName: '老带新春日礼', signups: 96, arrivals: 68, dealAmount: 28000, activityCost: 5600, conversionRate: '35%', reuseAdvice: '可复用', riskLevel: '正常' },
    { id: 'dc-act-4', segment: 'activities', activityName: '母亲节专题', signups: 72, arrivals: 48, dealAmount: 38000, activityCost: 8200, conversionRate: '22%', reuseAdvice: '需优化', riskLevel: '关注' },
    { id: 'dc-act-5', segment: 'activities', activityName: '夏日燃脂挑战', signups: 156, arrivals: 92, dealAmount: 52000, activityCost: 14200, conversionRate: '18%', reuseAdvice: '不建议复用', riskLevel: '高风险' },
    { id: 'dc-act-6', segment: 'activities', activityName: '积分兑换专场', signups: 88, arrivals: 62, dealAmount: 12000, activityCost: 3200, conversionRate: '15%', reuseAdvice: '需优化', riskLevel: '关注' },
    { id: 'dc-act-7', segment: 'activities', activityName: '品牌联名快闪', signups: 64, arrivals: 52, dealAmount: 24000, activityCost: 6800, conversionRate: '32%', reuseAdvice: '可复用', riskLevel: '正常' },
    { id: 'dc-act-8', segment: 'activities', activityName: '社群裂变体验', signups: 112, arrivals: 58, dealAmount: 18000, activityCost: 4800, conversionRate: '16%', reuseAdvice: '需优化', riskLevel: '高风险' },
    { id: 'dc-act-9', segment: 'activities', activityName: '沉睡会员唤醒', signups: 48, arrivals: 32, dealAmount: 8600, activityCost: 2200, conversionRate: '12%', reuseAdvice: '待观察', riskLevel: '关注' },
    { id: 'dc-act-10', segment: 'activities', activityName: '周年庆预售', signups: 220, arrivals: 148, dealAmount: 96000, activityCost: 15600, conversionRate: '38%', reuseAdvice: '可复用', riskLevel: '正常' },
  ];

  const details = buildDetails(stores, members, courses, teachers, sales, consumption, finance, activities);

  const totalRevenue = stores.reduce((n, s) => n + s.revenue, 0);
  const totalConfirmed = stores.reduce((n, s) => n + s.confirmedRevenue, 0);
  const totalAttendance = stores.reduce((n, s) => n + s.attendance, 0);
  const totalNewMembers = stores.reduce((n, s) => n + s.newMembers, 0);
  const totalRenewal = stores.reduce((n, s) => n + s.renewalAmount, 0);
  const riskCount =
    stores.filter(s => s.riskLevel !== '正常').length +
    members.filter(m => m.riskLevel === '高风险').length +
    courses.filter(c => c.riskLevel === '高风险').length;

  const metrics: DataMetric[] = [
    { id: 'dm1', label: '本月实收', value: formatDataCny(totalRevenue), hint: '前端演示 · 5 馆合计', tone: 'amber' },
    { id: 'dm2', label: '本月确认收入', value: formatDataCny(totalConfirmed), hint: '按耗课规则确认（演示）' },
    { id: 'dm3', label: '到课人次', value: `${totalAttendance}`, hint: '团课 + 私教签到' },
    { id: 'dm4', label: '新增会员', value: `${totalNewMembers} 人`, hint: '含体验客转新客' },
    { id: 'dm5', label: '续费金额', value: formatDataCny(totalRenewal), hint: '续费订单汇总（演示）' },
    { id: 'dm6', label: '经营风险项', value: `${riskCount} 项`, hint: '门店 / 会员 / 课程异常', tone: 'rose' },
  ];

  const insights: DataInsight[] = [
    { id: 'di1', tag: '门店差异', line: '云谷馆到课下降 12%，销售转化偏弱', actionLabel: '查看', actionKey: 'stores' },
    { id: 'di2', tag: '会员趋势', line: '沉睡会员占比上升，新客体验转化不足', actionLabel: '分析', actionKey: 'members' },
    { id: 'di3', tag: '课程结构', line: '晨间/午间低预约课程偏多，小班满员率不足', actionLabel: '查看', actionKey: 'courses' },
    { id: 'di4', tag: '财务结构', line: '预收负债偏高，确认收入确认偏慢', actionLabel: '分析', actionKey: 'finance' },
  ];

  const focusQueue: DataFocusItem[] = [
    { id: 'df1', segment: 'stores', group: 'storeAnomaly', entityType: 'store', entityId: 'dc-store-5', title: '云谷馆', statusLabel: '到课下降', reasonLine: '近 30 天到课人次下降 12%', analysisChain: ['门店', '课程', '到课', '收入'], openTab: 'trend' },
    { id: 'df2', segment: 'stores', group: 'storeAnomaly', entityType: 'store', entityId: 'dc-store-4', title: '西湖馆', statusLabel: '销售偏弱', reasonLine: '新购金额低于均值 18%', analysisChain: ['门店', '销售', '新购', '收入'] },
    { id: 'df3', segment: 'stores', group: 'storeAnomaly', entityType: 'store', entityId: 'dc-store-3', title: '滨江馆', statusLabel: '满课率波动', reasonLine: '周末课程满课率下降', analysisChain: ['门店', '课程', '满课率', '收入'] },
    { id: 'df4', segment: 'stores', group: 'storeAnomaly', entityType: 'store', entityId: 'dc-store-1', title: '万象馆', statusLabel: '对标基准', reasonLine: '实收与到课均高于均值，可作对标', analysisChain: ['门店', '对标', '趋势', '收入'] },
    { id: 'df5', segment: 'members', group: 'memberRisk', entityType: 'member', entityId: 'dc-mem-4', title: '沉睡会员', statusLabel: '流失风险', reasonLine: '90 天未到课会员 860 人', analysisChain: ['会员', '到课', '续费', '流失'], openTab: 'trend' },
    { id: 'df6', segment: 'members', group: 'memberRisk', entityType: 'member', entityId: 'dc-mem-3', title: '体验客', statusLabel: '转化不足', reasonLine: '体验转新客仅 22%', analysisChain: ['会员', '体验', '转化', '收入'] },
    { id: 'df7', segment: 'members', group: 'memberRisk', entityType: 'member', entityId: 'dc-mem-7', title: '流失预警', statusLabel: '高余额低频', reasonLine: '余额高但近 60 天低频', analysisChain: ['会员', '权益', '耗课', '流失'] },
    { id: 'df8', segment: 'courses', group: 'courseTeacher', entityType: 'course', entityId: 'dc-crs-4', title: '晨间唤醒', statusLabel: '低预约', reasonLine: '满课率仅 38%', analysisChain: ['课程', '预约', '到课', '收入'], openTab: 'compare' },
    { id: 'df9', segment: 'teachers', group: 'courseTeacher', entityType: 'teacher', entityId: 'dc-tch-5', title: '刘老师', statusLabel: '反馈偏低', reasonLine: '会员反馈 3.9，私教转化 6%', analysisChain: ['老师', '课程', '反馈', '转化'] },
    { id: 'df10', segment: 'courses', group: 'courseTeacher', entityType: 'course', entityId: 'dc-crs-9', title: '午间舒缓', statusLabel: '低预约', reasonLine: '取消/爽约率 18%', analysisChain: ['课程', '预约', '爽约', '收入'] },
    { id: 'df11', segment: 'finance', group: 'financeActivity', entityType: 'finance', entityId: 'dc-fin-4', title: '西湖馆财务', statusLabel: '预收偏高', reasonLine: '预收负债高于均值 15%', analysisChain: ['财务', '预收', '确认收入', '负债'], openTab: 'caliber' },
    { id: 'df12', segment: 'finance', group: 'financeActivity', entityType: 'finance', entityId: 'dc-fin-5', title: '云谷馆财务', statusLabel: '确认偏慢', reasonLine: '确认收入/实收比偏低', analysisChain: ['财务', '实收', '确认收入', '耗课'] },
    { id: 'df13', segment: 'activities', group: 'financeActivity', entityType: 'activity', entityId: 'dc-act-5', title: '夏日燃脂挑战', statusLabel: 'ROI 偏低', reasonLine: '活动成本回收不足', analysisChain: ['活动', '成本', '成交', '复盘'] },
    { id: 'df14', segment: 'activities', group: 'financeActivity', entityType: 'activity', entityId: 'dc-act-8', title: '社群裂变体验', statusLabel: '转化偏低', reasonLine: '报名到店后成交转化 16%', analysisChain: ['活动', '报名', '成交', '复盘'] },
    { id: 'df15', segment: 'sales', group: 'storeAnomaly', entityType: 'sales', entityId: 'dc-sal-10', title: '云谷馆 · 管家 J', statusLabel: '销售偏弱', reasonLine: '体验转化仅 10%', analysisChain: ['销售', '体验', '转化', '收入'] },
    { id: 'df16', segment: 'consumption', group: 'memberRisk', entityType: 'consumption', entityId: 'dc-csm-5', title: '云谷馆耗课', statusLabel: '低频耗课', reasonLine: '高余额会员耗课频率偏低', analysisChain: ['耗课', '权益', '确认收入', '负债'] },
  ];

  return {
    metrics,
    insights,
    stores,
    members,
    courses,
    teachers,
    sales,
    consumption,
    finance,
    activities,
    details,
    focusQueue,
  };
};

export const findDataCenterDetail = (snapshot: DataOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getDataRows = (snapshot: DataOperationSnapshot, segment: DataSegment): DataTableRow[] => {
  switch (segment) {
    case 'stores': return snapshot.stores;
    case 'members': return snapshot.members;
    case 'courses': return snapshot.courses;
    case 'teachers': return snapshot.teachers;
    case 'sales': return snapshot.sales;
    case 'consumption': return snapshot.consumption;
    case 'finance': return snapshot.finance;
    case 'activities': return snapshot.activities;
    default: return [];
  }
};

const METRIC_TYPE_MAP: Record<string, DataSegment[]> = {
  收入: ['stores', 'sales', 'finance', 'activities'],
  到课: ['stores', 'courses', 'teachers', 'consumption'],
  会员: ['members', 'consumption'],
  课程: ['courses', 'teachers'],
  财务: ['finance', 'consumption'],
};

export const filterDataRows = (
  rows: DataTableRow[],
  segment: DataSegment,
  filters: DataListFilters,
): DataTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  if (filters.metricType !== '全部') {
    const allowed = METRIC_TYPE_MAP[filters.metricType];
    if (allowed && !allowed.includes(segment)) return [];
  }
  return rows.filter(row => {
    if ('riskLevel' in row && filters.risk !== '全部' && row.riskLevel !== filters.risk) return false;
    const store =
      'storeName' in row ? row.storeName
      : 'store' in row ? row.store
      : '';
    if (filters.store !== '全部' && store && !String(store).includes(filters.store)) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computeDataSegmentMiniSummary = (
  snapshot: DataOperationSnapshot,
  segment: DataSegment,
): { label: string; value: string }[] => {
  switch (segment) {
    case 'stores': {
      const rows = snapshot.stores;
      const top = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
      return [
        { label: '门店数', value: `${rows.length} 家` },
        { label: '实收最高', value: top?.storeName ?? '—' },
        { label: '到课下降', value: `${rows.filter(s => s.riskLevel !== '正常').length} 家` },
        { label: '风险门店', value: `${rows.filter(s => s.riskLevel === '高风险').length} 家` },
      ];
    }
    case 'members': {
      const rows = snapshot.members;
      return [
        { label: '有效会员', value: `${rows.find(m => m.stage === '活跃会员')?.count ?? 0} 人` },
        { label: '新增会员', value: `${rows.reduce((n, m) => n + m.newThisMonth, 0)} 人` },
        { label: '流失风险', value: `${rows.filter(m => m.riskLevel === '高风险').length} 类` },
        { label: '续费机会', value: `${rows.find(m => m.stage === '续费机会')?.count ?? 0} 人` },
      ];
    }
    case 'courses': {
      const rows = snapshot.courses;
      return [
        { label: '排课数', value: `${rows.reduce((n, c) => n + c.scheduleCount, 0)} 节` },
        { label: '到课人次', value: `${rows.reduce((n, c) => n + c.attendance, 0)}` },
        { label: '满课率', value: '72%（均值）' },
        { label: '低预约课程', value: `${rows.filter(c => c.riskLevel === '高风险').length} 门` },
      ];
    }
    case 'teachers': {
      const rows = snapshot.teachers;
      const top = [...rows].sort((a, b) => parseInt(b.fillRate) - parseInt(a.fillRate))[0];
      return [
        { label: '上课老师', value: `${rows.length} 人` },
        { label: '满课率最高', value: top?.teacherName ?? '—' },
        { label: '反馈异常', value: `${rows.filter(t => parseFloat(t.feedback) < 4.0).length} 人` },
        { label: '私教转化机会', value: `${rows.filter(t => parseInt(t.ptConversion) < 10).length} 人` },
      ];
    }
    case 'sales': {
      const rows = snapshot.sales;
      return [
        { label: '销售总额', value: formatDataCny(rows.reduce((n, s) => n + s.salesAmount, 0)) },
        { label: '新购', value: formatDataCny(rows.reduce((n, s) => n + s.newPurchase, 0)) },
        { label: '续费', value: formatDataCny(rows.reduce((n, s) => n + s.renewalAmount, 0)) },
        { label: '转化不足', value: `${rows.filter(s => s.riskLevel === '高风险').length} 人` },
      ];
    }
    case 'consumption': {
      const rows = snapshot.consumption;
      return [
        { label: '耗课点数', value: `${rows.reduce((n, c) => n + c.consumePoints, 0)}` },
        { label: '确认收入', value: formatDataCny(rows.reduce((n, c) => n + c.confirmedRevenue, 0)) },
        { label: '高余额会员', value: `${rows.reduce((n, c) => n + c.highBalanceMembers, 0)} 人` },
        { label: '低频会员', value: `${rows.filter(c => c.riskLevel !== '正常').length} 馆` },
      ];
    }
    case 'finance': {
      const rows = snapshot.finance;
      return [
        { label: '实收', value: formatDataCny(rows.reduce((n, f) => n + f.revenue, 0)) },
        { label: '净收', value: formatDataCny(rows.reduce((n, f) => n + f.netRevenue, 0)) },
        { label: '预收负债', value: formatDataCny(rows.reduce((n, f) => n + f.prepaidLiability, 0)) },
        { label: '支出风险', value: `${rows.filter(f => f.riskLevel !== '正常').length} 馆` },
      ];
    }
    case 'activities': {
      const rows = snapshot.activities;
      return [
        { label: '活动数', value: `${rows.length} 个` },
        { label: '报名', value: `${rows.reduce((n, a) => n + a.signups, 0)} 人` },
        { label: '成交', value: formatDataCny(rows.reduce((n, a) => n + a.dealAmount, 0)) },
        { label: '可复用活动', value: `${rows.filter(a => a.reuseAdvice === '可复用').length} 个` },
      ];
    }
    default:
      return [];
  }
};

export const FOCUS_GROUP_TITLES: Record<DataFocusGroup, string> = {
  storeAnomaly: '门店异常',
  memberRisk: '会员风险',
  courseTeacher: '课程与老师',
  financeActivity: '财务与活动',
};

export const getSegmentFocusItems = (queue: DataFocusItem[], segment: DataSegment): DataFocusItem[] => {
  const segmentMap: Record<DataSegment, DataFocusGroup[]> = {
    stores: ['storeAnomaly'],
    members: ['memberRisk', 'storeAnomaly'],
    courses: ['courseTeacher'],
    teachers: ['courseTeacher'],
    sales: ['storeAnomaly', 'memberRisk'],
    consumption: ['memberRisk', 'financeActivity'],
    finance: ['financeActivity'],
    activities: ['financeActivity'],
  };
  const groups = new Set(segmentMap[segment] ?? Object.keys(FOCUS_GROUP_TITLES));
  return queue.filter(i => i.segment === segment || groups.has(i.group));
};
