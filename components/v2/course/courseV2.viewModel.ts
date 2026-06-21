export type CourseV2SuggestionSource = 'system_rule' | 'pending_config';

export type CourseV2Priority = 'P0' | 'P1' | 'P2';

export type CourseV2Status =
  | 'normal'
  | 'low_booking'
  | 'waitlist'
  | 'pending_checkin'
  | 'pending_confirm'
  | 'pending_resign'
  | 'pending_start'
  | 'completed';

export type CourseV2ViewMode = 'week' | 'today' | 'teacher';

export type CourseV2ContributionTone = 'normal' | 'muted' | 'low' | 'high_demand' | 'p0';

export type CourseV2HeatmapTone = 'idle' | 'normal' | 'high_demand' | 'low_booking' | 'risk';

export type CourseV2SupplyFocusTone = 'low_booking' | 'waitlist' | 'high_demand' | 'idle_gap';

export type CourseV2IndicatorLevel = 'low' | 'mid' | 'high';

export type CourseV2ResourceHintTone = 'normal' | 'busy' | 'free';

export interface CourseV2PageMeta {
  title: string;
  subtitle: string;
}

export interface CourseV2Filters {
  storeLabel: string;
  periodLabel: string;
  courseTypeLabel: string;
  teacherLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

export interface CourseV2ViewTab {
  id: CourseV2ViewMode;
  label: string;
}

export interface CourseV2Session {
  id: string;
  time: string;
  courseName: string;
  teacher: string;
  booked: number;
  capacity: number;
  waitlistCount?: number;
  status: CourseV2Status;
  statusLabel: string;
  actionLabel: string;
  durationWeight?: number;
  pointPerPerson: number;
  fullConsumptionPoints: number;
  bookedConsumptionPoints: number;
  historicalAttendanceRate: number;
  predictedAttendanceConsumptionPoints: number;
  remainingConsumptionSpace: number;
  consumptionLabel: string;
  contributionTone?: CourseV2ContributionTone;
}

export interface CourseV2Day {
  id: string;
  label: string;
  dateLabel: string;
  sessions: CourseV2Session[];
}

export interface CourseV2WeekSchedule {
  title: string;
  subtitle: string;
  days: CourseV2Day[];
}

export interface CourseV2SupplyFocusItem {
  id: string;
  priority: CourseV2Priority;
  title: string;
  coreNumbers: string;
  judgement: string;
  suggestionSource: CourseV2SuggestionSource;
  suggestionSourceLabel: string;
  actionLabel: string;
  tone: CourseV2SupplyFocusTone;
  relatedCourseId?: string;
  toastMessage?: string;
}

export interface CourseV2SupplyFocus {
  title: string;
  subtitle: string;
  items: CourseV2SupplyFocusItem[];
}

export interface CourseV2ForecastMetric {
  label: string;
  value: string;
  note: string;
  isOpportunity?: boolean;
}

export interface CourseV2SectionHeader {
  title: string;
  subtitle: string;
}

export interface CourseV2WeeklyConsumptionForecast {
  title: string;
  subtitle: string;
  theoreticalFullConsumption: number;
  bookedEstimatedConsumption: number;
  predictedAttendanceConsumption: number;
  fillableConsumptionSpace: number;
  attendanceRate: number;
  forecastNote: string;
  conclusion: string;
  conclusionHighlight: string;
  metrics: CourseV2ForecastMetric[];
}

export interface CourseV2ScheduleDiagnosisItem {
  id: string;
  priority: CourseV2Priority;
  title: string;
  fact: string;
  suggestionSource: CourseV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction?: string;
  actionLabel: string;
  relatedSessionId?: string;
}

export interface CourseV2ScheduleDiagnosis {
  title: string;
  subtitle: string;
  items: CourseV2ScheduleDiagnosisItem[];
}

export interface CourseV2HeatmapCell {
  id: string;
  day: string;
  timeSlot: string;
  courseCount: number;
  estimatedConsumption: number;
  remainingSpace?: number;
  issueCount?: number;
  tone: CourseV2HeatmapTone;
  statusLabel: string;
}

export interface CourseV2HeatmapLegendItem {
  label: string;
  tone: CourseV2HeatmapTone;
}

export interface CourseV2TypeIndicator {
  label: string;
  level: CourseV2IndicatorLevel;
}

export interface CourseV2CourseTypeInsightCard {
  id: string;
  courseType: string;
  estimatedConsumption: string;
  fillRate: string;
  opportunity: string;
  judgement: string;
  judgementTag: string;
  indicators: CourseV2TypeIndicator[];
}

export interface CourseV2ResourceHint {
  id: string;
  title: string;
  description: string;
  tone: CourseV2ResourceHintTone;
}

export interface CourseV2ResourceHints {
  title: string;
  items: CourseV2ResourceHint[];
}

export interface CourseV2HeatmapInsight {
  id: string;
  title: string;
  summary: string;
}

export interface CourseV2CourseHeatmap {
  title: string;
  subtitle: string;
  dayLabels: string[];
  timeSlotLabels: string[];
  legend: CourseV2HeatmapLegendItem[];
  cells: CourseV2HeatmapCell[];
  typeInsightCards: CourseV2CourseTypeInsightCard[];
  insights: CourseV2HeatmapInsight[];
}

export interface CourseV2IssueItem {
  id: string;
  priority: CourseV2Priority;
  title: string;
  fact: string;
  impact: string;
  suggestionSource: CourseV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  relatedSessionId?: string;
  toastMessage?: string;
}

export interface CourseV2IssueQueue {
  title: string;
  subtitle: string;
  items: CourseV2IssueItem[];
}

export interface CourseV2TeacherSupplyItem {
  id: string;
  name: string;
  weeklySessions: string;
  peakSessions: string;
  estimatedConsumption: string;
  theoreticalConsumption: string;
  statusLabel: string;
  availabilityNote: string;
  actionLabel: string;
  loadPercent: number;
}

export interface CourseV2TeacherSupply {
  title: string;
  subtitle: string;
  teachers: CourseV2TeacherSupplyItem[];
}

export interface CourseV2PerformanceItem {
  id: string;
  courseType: string;
  weeklySessions: string;
  fillRate: string;
  estimatedConsumption: string;
  fillableSpace: string;
  highlight: string;
  judgment: string;
}

export interface CourseV2Performance {
  title: string;
  subtitle: string;
  items: CourseV2PerformanceItem[];
}

export interface CourseV2RosterMember {
  id: string;
  name: string;
  stageLabel: string;
  cardSummary: string;
  tag: string;
  checkinStatus: string;
}

export interface CourseV2CheckinSummary {
  checkedIn: number;
  pendingCheckin: number;
  pendingResign: number;
}

export interface CourseV2Recommendation {
  recommendedCount: number;
  highMatchCount: number;
  suggestionAction: string;
  actionLabel: string;
}

export interface CourseV2ExceptionLog {
  label: string;
}

export interface CourseV2ConsumptionSummary {
  pointPerPerson: number;
  fullConsumptionPoints: number;
  bookedConsumptionPoints: number;
  historicalAttendanceRate: number;
  predictedAttendanceConsumptionPoints: number;
  remainingConsumptionSpace: number;
  consumptionNote: string;
}

export interface CourseV2ExceptionSummary {
  reason: string;
  currentConsumption: string;
  fillableSpace: string;
  suggestionAction: string;
  suggestionSource: string;
  owner: string;
  status: string;
}

export interface CourseV2Detail {
  id: string;
  title: string;
  subtitle: string;
  courseName: string;
  teacher: string;
  room: string;
  timeRange: string;
  capacity: number;
  booked: number;
  waitlistCount: number;
  statusLabel: string;
  status: CourseV2Status;
  consumptionSummary: CourseV2ConsumptionSummary;
  exceptionSummary?: CourseV2ExceptionSummary;
  roster: CourseV2RosterMember[];
  checkin: CourseV2CheckinSummary;
  recommendation: CourseV2Recommendation;
  exceptions: CourseV2ExceptionLog[];
}

export interface CourseV2Snapshot {
  meta: CourseV2PageMeta;
  filters: CourseV2Filters;
  viewTabs: CourseV2ViewTab[];
  warroomSection: CourseV2SectionHeader;
  supplyFocus: CourseV2SupplyFocus;
  weeklyForecast: CourseV2WeeklyConsumptionForecast;
  scheduleDiagnosis: CourseV2ScheduleDiagnosis;
  courseHeatmap: CourseV2CourseHeatmap;
  weekSchedule: CourseV2WeekSchedule;
  adjustmentBasis: CourseV2SectionHeader;
  courseIssueQueue: CourseV2IssueQueue;
  teacherSupply: CourseV2TeacherSupply;
  resourceHints: CourseV2ResourceHints;
  coursePerformance: CourseV2Performance;
  courseDetailMap: Record<string, CourseV2Detail>;
}

const STATUS_LABEL: Record<CourseV2Status, string> = {
  normal: '正常',
  low_booking: '低预约',
  waitlist: '满员候补',
  pending_checkin: '待签到',
  pending_confirm: '待确认',
  pending_resign: '待补签',
  pending_start: '待开课',
  completed: '已完成',
};

type SessionInput = {
  id: string;
  time: string;
  courseName: string;
  teacher: string;
  booked: number;
  capacity: number;
  waitlistCount?: number;
  status: CourseV2Status;
  actionLabel: string;
  pointPerPerson: number;
  attendanceRate?: number;
  contributionTone?: CourseV2ContributionTone;
  durationWeight?: number;
  statusLabel?: string;
};

function buildConsumption(
  booked: number,
  capacity: number,
  pointPerPerson: number,
  attendanceRate = 0.9,
) {
  const fullConsumptionPoints = capacity * pointPerPerson;
  const bookedConsumptionPoints = booked * pointPerPerson;
  const predictedAttendanceConsumptionPoints =
    Math.round(booked * attendanceRate * pointPerPerson * 10) / 10;
  const remainingConsumptionSpace = fullConsumptionPoints - bookedConsumptionPoints;
  return {
    pointPerPerson,
    fullConsumptionPoints,
    bookedConsumptionPoints,
    historicalAttendanceRate: attendanceRate,
    predictedAttendanceConsumptionPoints,
    remainingConsumptionSpace,
    consumptionLabel: `耗课 ${bookedConsumptionPoints} / ${fullConsumptionPoints} 点`,
  };
}

function session(input: SessionInput): CourseV2Session {
  const consumption = buildConsumption(
    input.booked,
    input.capacity,
    input.pointPerPerson,
    input.attendanceRate,
  );
  return {
    id: input.id,
    time: input.time,
    courseName: input.courseName,
    teacher: input.teacher,
    booked: input.booked,
    capacity: input.capacity,
    waitlistCount: input.waitlistCount,
    status: input.status,
    statusLabel: input.statusLabel ?? STATUS_LABEL[input.status],
    actionLabel: input.actionLabel,
    durationWeight: input.durationWeight,
    contributionTone: input.contributionTone,
    ...consumption,
  };
}

function consumptionFromSession(sess: CourseV2Session): CourseV2ConsumptionSummary {
  return {
    pointPerPerson: sess.pointPerPerson,
    fullConsumptionPoints: sess.fullConsumptionPoints,
    bookedConsumptionPoints: sess.bookedConsumptionPoints,
    historicalAttendanceRate: sess.historicalAttendanceRate,
    predictedAttendanceConsumptionPoints: sess.predictedAttendanceConsumptionPoints,
    remainingConsumptionSpace: sess.remainingConsumptionSpace,
    consumptionNote: '耗课点数为交付口径，不等于实收现金',
  };
}

const FRIDAY_PILATES_DETAIL: CourseV2Detail = {
  id: 'cs-fri-1930',
  title: '19:30 普拉提小班',
  subtitle: '滨江馆 · Mia · 2026年6月26日 19:30–20:30',
  courseName: '普拉提小班',
  teacher: 'Mia',
  room: '小班教室',
  timeRange: '19:30–20:30',
  capacity: 6,
  booked: 2,
  waitlistCount: 0,
  statusLabel: '低预约',
  status: 'low_booking',
  consumptionSummary: {
    pointPerPerson: 2,
    fullConsumptionPoints: 12,
    bookedConsumptionPoints: 4,
    historicalAttendanceRate: 0.9,
    predictedAttendanceConsumptionPoints: 3.6,
    remainingConsumptionSpace: 8,
    consumptionNote: '耗课点数为交付口径，不等于实收现金',
  },
  exceptionSummary: {
    reason: '低预约',
    currentConsumption: '4 / 12 点',
    fillableSpace: '8 点',
    suggestionAction: '匹配会员补员',
    suggestionSource: '系统规则建议',
    owner: '课程管家 · 周航',
    status: '待处理',
  },
  roster: [
    { id: 'r-1', name: '王静怡', stageLabel: 'S3', cardSummary: '锦鲤卡 · 剩余 42 点', tag: '腰背不适', checkinStatus: '待签到' },
    { id: 'r-2', name: '许倩', stageLabel: 'S4', cardSummary: '天选卡 · 剩余 96 点', tag: '高余额低耗课', checkinStatus: '待签到' },
    { id: 'r-3', name: '林可', stageLabel: 'S2', cardSummary: '初遇卡 · 剩余 39 点', tag: '新成交', checkinStatus: '未预约' },
    { id: 'r-4', name: '何珊', stageLabel: 'S5', cardSummary: '锦鲤卡 · 剩余 18 点', tag: '续费窗口', checkinStatus: '未预约' },
  ],
  checkin: { checkedIn: 0, pendingCheckin: 2, pendingResign: 0 },
  recommendation: {
    recommendedCount: 18,
    highMatchCount: 6,
    suggestionAction: '进入会员经营匹配名单',
    actionLabel: '匹配会员',
  },
  exceptions: [{ label: '低预约' }, { label: '候补未处理' }, { label: '老师负载偏高' }],
};

const FLOW_YOGA_DETAIL: CourseV2Detail = {
  id: 'cs-fri-1830',
  title: '18:30 流瑜伽',
  subtitle: '滨江馆 · Nora · 2026年6月26日 18:30–19:30',
  courseName: '流瑜伽',
  teacher: 'Nora',
  room: 'B 教室',
  timeRange: '18:30–19:30',
  capacity: 18,
  booked: 18,
  waitlistCount: 4,
  statusLabel: '满员候补',
  status: 'waitlist',
  consumptionSummary: {
    pointPerPerson: 1,
    fullConsumptionPoints: 18,
    bookedConsumptionPoints: 18,
    historicalAttendanceRate: 0.9,
    predictedAttendanceConsumptionPoints: 16.2,
    remainingConsumptionSpace: 0,
    consumptionNote: '耗课点数为交付口径，不等于实收现金',
  },
  roster: [
    { id: 'r-5', name: '王静怡', stageLabel: 'S3', cardSummary: '锦鲤卡 · 剩余 42 点', tag: '腰背不适', checkinStatus: '已签到' },
    { id: 'r-6', name: '赵敏', stageLabel: 'S5', cardSummary: '锦鲤卡 · 剩余 28 点', tag: '续费窗口', checkinStatus: '已签到' },
  ],
  checkin: { checkedIn: 16, pendingCheckin: 2, pendingResign: 0 },
  recommendation: {
    recommendedCount: 0,
    highMatchCount: 0,
    suggestionAction: '评估加开 19:45 同类课程',
    actionLabel: '加课建议',
  },
  exceptions: [{ label: '候补未处理' }, { label: '容量偏紧' }],
};

const HEATMAP_DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const HEATMAP_SLOT_LABELS = ['上午', '午间', '下午', '晚高峰', '夜间'];

type HeatmapSeed = {
  day: string;
  timeSlot: string;
  courseCount: number;
  estimatedConsumption: number;
  tone: CourseV2HeatmapTone;
  statusLabel: string;
  issueCount?: number;
};

function buildHeatmapCells(): CourseV2HeatmapCell[] {
  const seeds: HeatmapSeed[] = [
    { day: '周一', timeSlot: '上午', courseCount: 1, estimatedConsumption: 10, tone: 'normal', statusLabel: '正常' },
    { day: '周一', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周一', timeSlot: '下午', courseCount: 2, estimatedConsumption: 16, tone: 'normal', statusLabel: '正常' },
    { day: '周一', timeSlot: '晚高峰', courseCount: 1, estimatedConsumption: 12, tone: 'normal', statusLabel: '正常' },
    { day: '周一', timeSlot: '夜间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '低供给' },
    { day: '周二', timeSlot: '上午', courseCount: 1, estimatedConsumption: 8, tone: 'normal', statusLabel: '正常' },
    { day: '周二', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周二', timeSlot: '下午', courseCount: 2, estimatedConsumption: 12, tone: 'idle', statusLabel: '闲时' },
    { day: '周二', timeSlot: '晚高峰', courseCount: 1, estimatedConsumption: 14, tone: 'normal', statusLabel: '正常' },
    { day: '周二', timeSlot: '夜间', courseCount: 1, estimatedConsumption: 10, tone: 'normal', statusLabel: '正常' },
    { day: '周三', timeSlot: '上午', courseCount: 1, estimatedConsumption: 6, tone: 'idle', statusLabel: '低供给' },
    { day: '周三', timeSlot: '午间', courseCount: 1, estimatedConsumption: 6, tone: 'low_booking', statusLabel: '低预约' },
    { day: '周三', timeSlot: '下午', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周三', timeSlot: '晚高峰', courseCount: 1, estimatedConsumption: 15, tone: 'normal', statusLabel: '正常' },
    { day: '周三', timeSlot: '夜间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '低供给' },
    { day: '周四', timeSlot: '上午', courseCount: 1, estimatedConsumption: 8, tone: 'normal', statusLabel: '正常' },
    { day: '周四', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周四', timeSlot: '下午', courseCount: 1, estimatedConsumption: 10, tone: 'normal', statusLabel: '正常' },
    { day: '周四', timeSlot: '晚高峰', courseCount: 1, estimatedConsumption: 11, tone: 'normal', statusLabel: '正常' },
    { day: '周四', timeSlot: '夜间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '低供给' },
    { day: '周五', timeSlot: '上午', courseCount: 2, estimatedConsumption: 22, tone: 'normal', statusLabel: '正常' },
    { day: '周五', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周五', timeSlot: '下午', courseCount: 1, estimatedConsumption: 8, tone: 'normal', statusLabel: '正常' },
    { day: '周五', timeSlot: '晚高峰', courseCount: 4, estimatedConsumption: 42, tone: 'risk', statusLabel: '异常 2', issueCount: 2 },
    { day: '周五', timeSlot: '夜间', courseCount: 1, estimatedConsumption: 9, tone: 'low_booking', statusLabel: '低预约' },
    { day: '周六', timeSlot: '上午', courseCount: 3, estimatedConsumption: 56, tone: 'high_demand', statusLabel: '高需求' },
    { day: '周六', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周六', timeSlot: '下午', courseCount: 1, estimatedConsumption: 14, tone: 'normal', statusLabel: '正常' },
    { day: '周六', timeSlot: '晚高峰', courseCount: 1, estimatedConsumption: 10, tone: 'normal', statusLabel: '正常' },
    { day: '周六', timeSlot: '夜间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '低供给' },
    { day: '周日', timeSlot: '上午', courseCount: 2, estimatedConsumption: 16, tone: 'normal', statusLabel: '正常' },
    { day: '周日', timeSlot: '午间', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '空档' },
    { day: '周日', timeSlot: '下午', courseCount: 1, estimatedConsumption: 7, tone: 'normal', statusLabel: '正常' },
    { day: '周日', timeSlot: '晚高峰', courseCount: 0, estimatedConsumption: 0, tone: 'idle', statusLabel: '低供给' },
    { day: '周日', timeSlot: '夜间', courseCount: 2, estimatedConsumption: 18, tone: 'normal', statusLabel: '正常' },
  ];

  return seeds.map((seed, index) => ({
    id: `hm-${index}`,
    ...seed,
  }));
}

function buildGenericDetail(sess: CourseV2Session, dayLabel: string): CourseV2Detail {
  return {
    id: sess.id,
    title: `${sess.time} ${sess.courseName}`,
    subtitle: `滨江馆 · ${sess.teacher} · ${dayLabel} ${sess.time}`,
    courseName: sess.courseName,
    teacher: sess.teacher,
    room: 'A 教室',
    timeRange: `${sess.time}–${sess.time.replace(/(\d+):(\d+)/, (_, h, m) => `${Number(h) + 1}:${m}`)}`,
    capacity: sess.capacity,
    booked: sess.booked,
    waitlistCount: sess.waitlistCount ?? 0,
    statusLabel: sess.statusLabel,
    status: sess.status,
    consumptionSummary: consumptionFromSession(sess),
    roster: FRIDAY_PILATES_DETAIL.roster.slice(0, 3),
    checkin: {
      checkedIn: sess.status === 'completed' ? sess.booked : 0,
      pendingCheckin: sess.status === 'pending_checkin' || sess.status === 'pending_start' ? sess.booked : 0,
      pendingResign: sess.status === 'pending_resign' ? 1 : 0,
    },
    recommendation: {
      recommendedCount: sess.status === 'low_booking' ? 18 : 0,
      highMatchCount: sess.status === 'low_booking' ? 6 : 0,
      suggestionAction: sess.status === 'low_booking' ? '进入会员经营匹配名单' : '暂无补员建议',
      actionLabel: sess.status === 'low_booking' ? '匹配会员' : '查看',
    },
    exceptions: [{ label: sess.statusLabel }],
  };
}

export function buildCourseV2Snapshot(): CourseV2Snapshot {
  const weekDays: CourseV2Day[] = [
    {
      id: 'day-mon', label: '周一', dateLabel: '6/22',
      sessions: [
        session({ id: 'cs-mon-1030', time: '10:30', courseName: '基础流瑜伽', teacher: 'Anna', booked: 10, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
        session({ id: 'cs-mon-1400', time: '14:00', courseName: '普拉提小班', teacher: 'Mia', booked: 4, capacity: 6, status: 'normal', actionLabel: '名单', pointPerPerson: 2 }),
        session({ id: 'cs-mon-1600', time: '16:00', courseName: '私教', teacher: 'Leo', booked: 1, capacity: 1, status: 'pending_confirm', actionLabel: '确认', pointPerPerson: 8 }),
      ],
    },
    {
      id: 'day-tue', label: '周二', dateLabel: '6/23',
      sessions: [
        session({ id: 'cs-tue-1100', time: '11:00', courseName: '肩颈舒缓', teacher: 'Anna', booked: 8, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
        session({ id: 'cs-tue-1430', time: '14:30', courseName: '器械普拉提', teacher: 'Mia', booked: 5, capacity: 6, status: 'normal', actionLabel: '签到', pointPerPerson: 2 }),
        session({ id: 'cs-tue-1930', time: '19:30', courseName: '内观流', teacher: 'Nora', booked: 12, capacity: 18, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
    {
      id: 'day-wed', label: '周三', dateLabel: '6/24',
      sessions: [
        session({ id: 'cs-wed-0930', time: '09:30', courseName: '阴瑜伽', teacher: 'Anna', booked: 9, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
        session({ id: 'cs-wed-1200', time: '12:00', courseName: '普拉提小班', teacher: 'Mia', booked: 3, capacity: 6, status: 'low_booking', actionLabel: '处理', pointPerPerson: 2, contributionTone: 'low' }),
        session({ id: 'cs-wed-1830', time: '18:30', courseName: '流瑜伽', teacher: 'Nora', booked: 15, capacity: 18, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
    {
      id: 'day-thu', label: '周四', dateLabel: '6/25',
      sessions: [
        session({ id: 'cs-thu-1000', time: '10:00', courseName: '私教', teacher: 'Leo', booked: 1, capacity: 1, status: 'pending_confirm', actionLabel: '确认', pointPerPerson: 8 }),
        session({ id: 'cs-thu-1400', time: '14:00', courseName: '核心普拉提', teacher: 'Mia', booked: 5, capacity: 6, status: 'normal', actionLabel: '名单', pointPerPerson: 2 }),
        session({ id: 'cs-thu-1930', time: '19:30', courseName: '肩颈舒缓', teacher: 'Anna', booked: 11, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
    {
      id: 'day-fri', label: '周五', dateLabel: '6/26',
      sessions: [
        session({ id: 'cs-fri-0930', time: '09:30', courseName: '阴瑜伽', teacher: 'Anna', booked: 12, capacity: 16, status: 'completed', actionLabel: '名单', pointPerPerson: 1, contributionTone: 'muted' }),
        session({ id: 'cs-fri-1100', time: '11:00', courseName: '普拉提小班', teacher: 'Mia', booked: 5, capacity: 6, status: 'pending_checkin', actionLabel: '签到', pointPerPerson: 2 }),
        session({ id: 'cs-fri-1400', time: '14:00', courseName: '私教', teacher: 'Leo', booked: 1, capacity: 1, status: 'pending_confirm', actionLabel: '确认', pointPerPerson: 8 }),
        session({ id: 'cs-fri-1830', time: '18:30', courseName: '流瑜伽', teacher: 'Nora', booked: 18, capacity: 18, waitlistCount: 4, status: 'waitlist', actionLabel: '建议', pointPerPerson: 1, contributionTone: 'high_demand' }),
        session({ id: 'cs-fri-1930', time: '19:30', courseName: '普拉提小班', teacher: 'Mia', booked: 2, capacity: 6, status: 'low_booking', actionLabel: '处理', pointPerPerson: 2, contributionTone: 'p0' }),
        session({ id: 'cs-fri-2030', time: '20:30', courseName: '肩颈舒缓', teacher: 'Anna', booked: 9, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
    {
      id: 'day-sat', label: '周六', dateLabel: '6/27',
      sessions: [
        session({ id: 'cs-sat-1000', time: '10:00', courseName: '普拉提小班', teacher: 'Mia', booked: 6, capacity: 6, waitlistCount: 2, status: 'waitlist', actionLabel: '建议', pointPerPerson: 2, contributionTone: 'high_demand' }),
        session({ id: 'cs-sat-1430', time: '14:30', courseName: '流瑜伽', teacher: 'Nora', booked: 14, capacity: 18, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
        session({ id: 'cs-sat-1930', time: '19:30', courseName: '内观流', teacher: 'Nora', booked: 10, capacity: 18, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
    {
      id: 'day-sun', label: '周日', dateLabel: '6/28',
      sessions: [
        session({ id: 'cs-sun-0900', time: '09:00', courseName: '阴瑜伽', teacher: 'Anna', booked: 8, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
        session({ id: 'cs-sun-1100', time: '11:00', courseName: '周末小班', teacher: 'Mia', booked: 4, capacity: 6, status: 'normal', actionLabel: '名单', pointPerPerson: 2 }),
        session({ id: 'cs-sun-1600', time: '16:00', courseName: '修复瑜伽', teacher: 'Anna', booked: 7, capacity: 16, status: 'normal', actionLabel: '名单', pointPerPerson: 1 }),
      ],
    },
  ];

  const courseDetailMap: Record<string, CourseV2Detail> = {
    'cs-fri-1930': FRIDAY_PILATES_DETAIL,
    'cs-fri-1830': FLOW_YOGA_DETAIL,
  };

  weekDays.forEach(day => {
    day.sessions.forEach(sess => {
      if (!courseDetailMap[sess.id]) {
        courseDetailMap[sess.id] = buildGenericDetail(sess, `2026年6月${day.dateLabel.replace('/', '月')}日`);
      }
    });
  });

  return {
    meta: { title: '课程与排课', subtitle: '滨江馆 · 本周课程供给与排班效率' },
    filters: {
      storeLabel: '滨江馆',
      periodLabel: '本周',
      courseTypeLabel: '全部课程',
      teacherLabel: '全部老师',
      primaryActionLabel: '新增排课',
      secondaryActionLabel: '排课规则',
    },
    viewTabs: [
      { id: 'week', label: '周视图' },
      { id: 'today', label: '今日待处理' },
      { id: 'teacher', label: '老师供给' },
    ],
    warroomSection: {
      title: '本周排课判断',
      subtitle: '结合耗课预测、供给焦点和排课诊断判断本周课程是否需要调整',
    },
    supplyFocus: {
      title: '本周供给焦点',
      subtitle: '按低预约、满员候补、高需求时段与空档识别排课机会',
      items: [
        {
          id: 'sf-1',
          priority: 'P0',
          title: '19:30 普拉提小班低预约',
          coreNumbers: '2/6 人｜耗课 4/12 点｜可补 8 点',
          judgement: '已排老师和场地，但当前耗课贡献偏低',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '匹配会员',
          tone: 'low_booking',
          relatedCourseId: 'cs-fri-1930',
        },
        {
          id: 'sf-2',
          priority: 'P1',
          title: '18:30 流瑜伽满员候补',
          coreNumbers: '18/18 人｜候补 4｜耗课已满',
          judgement: '晚高峰容量已满，有加课机会',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '加课建议',
          tone: 'waitlist',
          toastMessage: '进入加课建议（待建设）',
        },
        {
          id: 'sf-3',
          priority: 'P1',
          title: '周六上午普拉提高需求',
          coreNumbers: '满课率 92%｜候补累计 6｜预计 56 点',
          judgement: '周末上午需求稳定，下周可增加 1 节',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '下周排课',
          tone: 'high_demand',
          toastMessage: '进入下周排课（待建设）',
        },
        {
          id: 'sf-4',
          priority: 'P2',
          title: '周三上午供给偏弱',
          coreNumbers: '预计 6 点｜空档 3.5h',
          judgement: '可观察低强度课或私教补排',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          actionLabel: '记录',
          tone: 'idle_gap',
          toastMessage: '记录供给观察（待建设）',
        },
      ],
    },
    weeklyForecast: {
      title: '本周耗课预测',
      subtitle: '按当前预约与历史到课率估算',
      theoreticalFullConsumption: 620,
      bookedEstimatedConsumption: 412,
      predictedAttendanceConsumption: 386,
      fillableConsumptionSpace: 208,
      attendanceRate: 0.9,
      forecastNote: '耗课点数为交付口径，不等于实收现金',
      conclusion: '本周预计到课耗课 386 点，仍有 208 点可补空间。优先处理 19:30 低预约、18:30 候补与周六高需求时段。',
      conclusionHighlight: '208 点',
      metrics: [
        { label: '理论满班耗课', value: '620 点', note: '全部课程满员后的供给上限' },
        { label: '当前预约预计耗课', value: '412 点', note: '按当前预约人数估算' },
        { label: '预计到课耗课', value: '386 点', note: '按历史到课率折算' },
        { label: '可补员耗课空间', value: '208 点', note: '空位可转化的交付空间', isOpportunity: true },
      ],
    },
    scheduleDiagnosis: {
      title: '排课诊断',
      subtitle: '按预约、容量、老师负载识别本周问题',
      items: [
        {
          id: 'sd-1', priority: 'P0', title: '低预约课程待补员',
          fact: '19:30 普拉提 2/6，预计耗课 4/12 点',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          actionLabel: '处理', relatedSessionId: 'cs-fri-1930',
        },
        {
          id: 'sd-2', priority: 'P1', title: '满员候补可加课',
          fact: '18:30 流瑜伽满员，候补 4 人',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          actionLabel: '建议', relatedSessionId: 'cs-fri-1830',
        },
        {
          id: 'sd-3', priority: 'P1', title: 'Mia 晚高峰负载偏高',
          fact: '晚高峰 7 节，高于建议上限',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          actionLabel: '调课',
        },
        {
          id: 'sd-4', priority: 'P2', title: '周三上午空档较长',
          fact: '10:30–14:00 无课程供给',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          actionLabel: '记录',
        },
      ],
    },
    courseHeatmap: {
      title: '本周课程热力分析',
      subtitle: '通过时段耗课、课程类型与关键结论识别旺时、闲时和补员机会',
      dayLabels: HEATMAP_DAY_LABELS,
      timeSlotLabels: HEATMAP_SLOT_LABELS,
      legend: [
        { label: '低供给', tone: 'idle' },
        { label: '正常', tone: 'normal' },
        { label: '高需求', tone: 'high_demand' },
        { label: '低预约', tone: 'low_booking' },
        { label: '异常', tone: 'risk' },
      ],
      cells: buildHeatmapCells(),
      typeInsightCards: [
        {
          id: 'ti-1', courseType: '普拉提小班', estimatedConsumption: '186 点', fillRate: '82%',
          opportunity: '可补员 42 点', judgement: '晚高峰可加课', judgementTag: '可加课',
          indicators: [
            { label: '耗课贡献', level: 'high' },
            { label: '满课率', level: 'mid' },
            { label: '补员空间', level: 'mid' },
          ],
        },
        {
          id: 'ti-2', courseType: '流瑜伽', estimatedConsumption: '124 点', fillRate: '88%',
          opportunity: '候补 4 人', judgement: '容量偏紧', judgementTag: '加课机会',
          indicators: [
            { label: '耗课贡献', level: 'high' },
            { label: '满课率', level: 'high' },
            { label: '加课机会', level: 'mid' },
          ],
        },
        {
          id: 'ti-3', courseType: '内观流', estimatedConsumption: '32 点', fillRate: '64%',
          opportunity: '可补员 18 点', judgement: '适合精准邀约', judgementTag: '精准邀约',
          indicators: [
            { label: '耗课贡献', level: 'low' },
            { label: '补员机会', level: 'high' },
            { label: '取消风险', level: 'low' },
          ],
        },
        {
          id: 'ti-4', courseType: '肩颈舒缓', estimatedConsumption: '58 点', fillRate: '76%',
          opportunity: '召回价值高', judgement: '适合低频会员召回', judgementTag: '会员召回',
          indicators: [
            { label: '耗课贡献', level: 'mid' },
            { label: '满课率', level: 'mid' },
            { label: '补员空间', level: 'mid' },
          ],
        },
        {
          id: 'ti-5', courseType: '私教', estimatedConsumption: '128 点', fillRate: '稳定',
          opportunity: '档期占用高', judgement: '交付稳定但占用老师档期', judgementTag: '档期占用',
          indicators: [
            { label: '耗课贡献', level: 'high' },
            { label: '档期占用', level: 'high' },
            { label: '交付稳定', level: 'high' },
          ],
        },
      ],
      insights: [
        { id: 'hi-1', title: '周五晚高峰需求集中', summary: '18:30 满员候补，19:30 低预约但可补员 · 先补员后加课' },
        { id: 'hi-2', title: '周三上午供给偏弱', summary: '预计耗课仅 6 点 · 可观察低强度课或私教' },
        { id: 'hi-3', title: '内观流低满课但匹配人群充足', summary: '推荐 18 人高匹配 6 人 · 精准邀约不建议取消' },
      ],
    },
    weekSchedule: {
      title: '本周排课明细',
      subtitle: '用于查看完整课程安排，异常课程已在上方汇总',
      days: weekDays,
    },
    adjustmentBasis: {
      title: '排课调整依据',
      subtitle: '结合课程问题、老师供给、教室资源和课程表现，为加课、补员和调课提供依据',
    },
    courseIssueQueue: {
      title: '课程问题队列',
      subtitle: '低预约、满员候补、签到异常与排课冲突',
      items: [
        {
          id: 'ci-1', priority: 'P0', title: '低预约课程待处理',
          fact: '19:30 普拉提 2/6 · 耗课 4/12 点',
          impact: '耗课交付',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '匹配会员补员', actionLabel: '匹配会员',
          relatedSessionId: 'cs-fri-1930', toastMessage: '进入会员经营匹配名单（待建设）',
        },
        {
          id: 'ci-2', priority: 'P1', title: '满员候补未加课',
          fact: '18:30 流瑜伽 18/18 · 候补 4 人',
          impact: '晚高峰容量',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '评估加开同类课程', actionLabel: '加课建议',
          relatedSessionId: 'cs-fri-1830', toastMessage: '进入加课建议（待建设）',
        },
        {
          id: 'ci-3', priority: 'P1', title: '签到异常待确认',
          fact: '昨日 3 条签到异常',
          impact: '耗课记录',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '核对后补签', actionLabel: '补签',
          toastMessage: '进入签到处理（待建设）',
        },
        {
          id: 'ci-4', priority: 'P1', title: '老师排课负载偏高',
          fact: 'Mia 晚高峰 7 节',
          impact: '老师状态',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '调配同类型老师', actionLabel: '调整',
          toastMessage: '进入老师供给调整（待建设）',
        },
        {
          id: 'ci-5', priority: 'P2', title: '课程结构偏重普拉提',
          fact: '小班占比 62%，修复类偏少',
          impact: '会员偏好',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          suggestionAction: '补充修复类课程', actionLabel: '记录',
        },
      ],
    },
    teacherSupply: {
      title: '老师供给与空闲档期',
      subtitle: '查看老师负载、请假、空闲与可补排时段',
      teachers: [
        { id: 'ts-mia', name: 'Mia', weeklySessions: '18 节', peakSessions: '7 节', estimatedConsumption: '96 点', theoreticalConsumption: '132 点', statusLabel: '负载偏高', availabilityNote: '可调整：周四 19:30 可由 Nora 代课', actionLabel: '调整', loadPercent: 88 },
        { id: 'ts-anna', name: 'Anna', weeklySessions: '14 节', peakSessions: '4 节', estimatedConsumption: '72 点', theoreticalConsumption: '96 点', statusLabel: '稳定', availabilityNote: '可补排：周三 10:30–12:00', actionLabel: '补排', loadPercent: 62 },
        { id: 'ts-nora', name: 'Nora', weeklySessions: '11 节', peakSessions: '3 节', estimatedConsumption: '54 点', theoreticalConsumption: '80 点', statusLabel: '可承接', availabilityNote: '可补排：周五 19:45', actionLabel: '加课', loadPercent: 48 },
        { id: 'ts-leo', name: 'Leo', weeklySessions: '16 节私教', peakSessions: '—', estimatedConsumption: '128 点', theoreticalConsumption: '128 点', statusLabel: '私教为主', availabilityNote: '空闲：周二 14:00–16:00 · 仅私教', actionLabel: '查看', loadPercent: 72 },
      ],
    },
    resourceHints: {
      title: '教室与资源提示',
      items: [
        { id: 'rh-1', title: '小班教室', description: '6 人容量，周五 19:45 空闲', tone: 'free' },
        { id: 'rh-2', title: '团课教室', description: '18 人容量，18:30 已满员', tone: 'busy' },
        { id: 'rh-3', title: '私教房', description: '仅私教，周二 14:00–16:00 空闲', tone: 'free' },
        { id: 'rh-4', title: '器械床位', description: '6 张，普拉提小班满员上限 6 人', tone: 'normal' },
      ],
    },
    coursePerformance: {
      title: '课程表现摘要',
      subtitle: '按课程类型查看预约、满课、耗课与补员机会',
      items: [
        { id: 'cp-1', courseType: '普拉提小班', weeklySessions: '18 节', fillRate: '82%', estimatedConsumption: '186 点', fillableSpace: '42 点', highlight: '低预约 3 节', judgment: '晚高峰需求高，部分时段可加课' },
        { id: 'cp-2', courseType: '流瑜伽', weeklySessions: '12 节', fillRate: '88%', estimatedConsumption: '124 点', fillableSpace: '18 点', highlight: '候补 4 人', judgment: '容量偏紧，需评估加课' },
        { id: 'cp-3', courseType: '内观流', weeklySessions: '4 节', fillRate: '64%', estimatedConsumption: '32 点', fillableSpace: '18 点', highlight: '补员机会：明晚 18 人匹配', judgment: '适合精准邀约，不建议直接取消' },
        { id: 'cp-4', courseType: '肩颈舒缓', weeklySessions: '8 节', fillRate: '76%', estimatedConsumption: '58 点', fillableSpace: '22 点', highlight: '会员偏好：稳定', judgment: '适合低频会员召回' },
        { id: 'cp-5', courseType: '私教', weeklySessions: '16 节', fillRate: '100%', estimatedConsumption: '128 点', fillableSpace: '0 点', highlight: '交付稳定', judgment: '交付稳定，但老师档期占用高' },
      ],
    },
    courseDetailMap,
  };
}

export function getCourseStatusClass(status: CourseV2Status): string {
  const map: Record<CourseV2Status, string> = {
    normal: 'is-normal',
    low_booking: 'is-low',
    waitlist: 'is-waitlist',
    pending_checkin: 'is-checkin',
    pending_confirm: 'is-confirm',
    pending_resign: 'is-resign',
    pending_start: 'is-start',
    completed: 'is-done',
  };
  return map[status];
}

export function getSupplyFocusToneClass(tone: CourseV2SupplyFocusTone): string {
  const map: Record<CourseV2SupplyFocusTone, string> = {
    low_booking: 'is-low-booking',
    waitlist: 'is-waitlist-focus',
    high_demand: 'is-high-demand',
    idle_gap: 'is-idle-gap',
  };
  return map[tone];
}

export function getResourceHintToneClass(tone: CourseV2ResourceHintTone): string {
  const map: Record<CourseV2ResourceHintTone, string> = {
    normal: 'is-normal',
    busy: 'is-busy',
    free: 'is-free',
  };
  return map[tone];
}

export function getIndicatorDotCount(level: CourseV2IndicatorLevel): number {
  const map: Record<CourseV2IndicatorLevel, number> = {
    low: 1,
    mid: 2,
    high: 3,
  };
  return map[level];
}

export function getHeatmapToneClass(tone: CourseV2HeatmapTone): string {
  const map: Record<CourseV2HeatmapTone, string> = {
    idle: 'is-idle',
    normal: 'is-normal',
    high_demand: 'is-high',
    low_booking: 'is-warn',
    risk: 'is-risk',
  };
  return map[tone];
}

export function getContributionClass(tone?: CourseV2ContributionTone): string {
  if (!tone || tone === 'normal') return '';
  return `is-${tone}`;
}
