import type { MockStaffTeachingSessionRecord, Staff } from '../types';

export type StaffTab = 'closed_loop' | 'decision' | 'archives' | 'schedule';
export type StaffFilterType = 'all' | 'leads' | 'adjust' | 'new' | 'part_time';
export type StaffMemberListTab = 'all' | 'private' | 'followup';

export const STAFF_TABS: Array<{ id: StaffTab; label: string }> = [
  { id: 'closed_loop', label: '师资与规则闭环入口' },
  { id: 'decision', label: '智能决策' },
  { id: 'archives', label: '员工档案' },
  { id: 'schedule', label: '出勤与排班' },
];

export const STAFF_FILTER_TYPES: StaffFilterType[] = ['all', 'leads', 'adjust', 'new', 'part_time'];

export interface StaffMatrixItem {
  x: number;
  y: number;
  name: string;
  id: number;
  level: Staff['level'];
}

export interface StaffDemoMember {
  id: number;
  name: string;
  avatar: string;
  type: 'private' | 'group' | 'small';
  card: string;
  balance: number;
  daysSinceLastClass: number;
  lifecycle: string;
  goal: string;
  isFollowup: boolean;
  isPendingRenewal: boolean;
  isSilent: boolean;
  isNewPendingFollowUp: boolean;
  isSummaryMissing: boolean;
  isPhotoMissing: boolean;
}

export interface StaffDemoMemberFilters {
  memberListTab: StaffMemberListTab;
  filterLifecycle: string;
  filterGoal: string;
  activeFollowUpCategory: string | null;
}

export interface StaffDetailsView extends Omit<Staff, 'incomeStats'> {
  phone: string;
  teachingStartDate: string;
  privateSpecialties: string[];
  groupSpecialties: string[];
  nonReceptionGroups: string[];
  certImages: string[];
  courseVideos: { title: string; url: string; thumb: string }[];
  historicalCourses: { name: string; rating: number; count: number; date?: string }[];
  popularCourses: string[];
  attentionCourses: string[];
  incomeStats: Record<'week' | 'month' | 'quarter', {
    total: number;
    percentage: number;
    baseSalary: number;
    commission: number;
    smallClassFee: number;
    privateClassFee: number;
  }>;
  consumptionStats: Record<'week' | 'month' | 'quarter', {
    total: number;
    studioPercentage: number;
    smallClass: number;
    privateClass: number;
    workshop: number;
  }>;
  historicalPromotions: { date: string; from: string; to: string; reason: string }[];
}

export const buildStaffMatrixData = (staffList: Staff[]): StaffMatrixItem[] => (
  staffList.filter(staff => staff.type === 'teacher').map(staff => ({
    x: staff.conversionRate,
    y: staff.loadFactor,
    name: staff.name,
    id: staff.id,
    level: staff.level,
  }))
);

export const buildStaffRankings = (staffList: Staff[]) => {
  const teachers = staffList.filter(staff => staff.type === 'teacher');

  return {
    teachers,
    consumptionTop: [...staffList].sort((a, b) => b.classHours - a.classHours).slice(0, 3),
    conversionTop: [...teachers].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 3),
    occupancyBottom: [...teachers].sort((a, b) => a.occupancyRate - b.occupancyRate).slice(0, 3),
    followUpBottom: [...teachers].sort((a, b) => (a.followUpRate || 0) - (b.followUpRate || 0)).slice(0, 3),
  };
};

export const filterStaffList = (
  staffList: Staff[],
  filterType: StaffFilterType,
  searchQuery: string
): Staff[] => {
  let list = staffList;

  if (filterType === 'leads') list = list.filter(staff => staff.conversionRate > 60 && staff.loadFactor < 80);
  if (filterType === 'adjust') list = list.filter(staff => staff.loadFactor > 90 || staff.conversionRate < 30);
  if (filterType === 'new') list = list.filter(staff => staff.expYears.includes('0') || staff.expYears.includes('1'));
  if (filterType === 'part_time') list = list.filter(staff => staff.title.includes('兼职'));

  if (!searchQuery) return list;

  const query = searchQuery.toLowerCase();
  return list.filter(staff => (
    staff.name.toLowerCase().includes(query)
    || staff.tags.some(tag => tag.toLowerCase().includes(query))
    || staff.title.toLowerCase().includes(query)
  ));
};

export const getStaffAiSuggestion = (staff: Staff) => {
  if (staff.conversionRate > 75 && staff.loadFactor < 70) return { text: '适合接体验', color: 'text-green-600', bg: 'bg-green-50' };
  if (staff.loadFactor > 90) return { text: '建议控课', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (staff.conversionRate < 30) return { text: '需要培养', color: 'text-blue-600', bg: 'bg-blue-50' };
  return { text: '状态稳定', color: 'text-gray-500', bg: 'bg-gray-100' };
};

export const getStaffLoadBadgePresentation = (loadFactor: number) => {
  if (loadFactor > 85) return { label: '高负载', className: 'bg-red-50 text-red-600 border-red-100' };
  if (loadFactor > 60) return { label: '正常', className: 'bg-gray-50 text-gray-500 border-gray-100' };
  return { label: '低负载', className: 'bg-green-50 text-green-600 border-green-100' };
};

const stableNumber = (seed: string, min: number, max: number): number => {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return min + (hash % (max - min + 1));
};

export const buildStaffDemoMembers = (staff: Staff | null): StaffDemoMember[] => {
  if (!staff) return [];

  const lifecycles = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const goals = ['减脂', '增肌', '塑形', '康复', '产后'];

  return Array.from({ length: 12 }).map((_, index) => {
    const isPrivate = index % 3 === 0;
    const seed = `${staff.id}-${staff.name}-${index}`;
    const balance = isPrivate ? stableNumber(`${seed}-balance`, 0, 19) : stableNumber(`${seed}-balance`, 0, 99);
    const daysSinceLastClass = stableNumber(`${seed}-last-class`, 0, 59);
    const isPendingRenewal = balance <= 3;
    const isSilent = daysSinceLastClass > 30;
    const isNewPendingFollowUp = index % 4 === 0 && lifecycles[index % lifecycles.length] === 'S0';
    const isSummaryMissing = index % 5 === 0;
    const isPhotoMissing = index % 6 === 0;
    const isFollowup = isPendingRenewal || isSilent || isNewPendingFollowUp || isSummaryMissing || isPhotoMissing;

    return {
      id: index,
      name: `会员 ${String.fromCharCode(65 + index)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}Member${index}`,
      type: isPrivate ? 'private' : (index % 2 === 0 ? 'group' : 'small'),
      card: isPrivate ? '私教包月' : '普通次卡',
      balance,
      daysSinceLastClass,
      lifecycle: lifecycles[index % lifecycles.length],
      goal: goals[index % goals.length],
      isFollowup,
      isPendingRenewal,
      isSilent,
      isNewPendingFollowUp,
      isSummaryMissing,
      isPhotoMissing,
    };
  });
};

export const filterStaffDemoMembers = (
  members: StaffDemoMember[],
  filters: StaffDemoMemberFilters
): StaffDemoMember[] => (
  members.filter(member => {
    if (filters.memberListTab === 'private' && member.type !== 'private') return false;
    if (filters.memberListTab === 'followup' && !member.isFollowup) return false;
    if (filters.filterLifecycle !== 'all' && member.lifecycle !== filters.filterLifecycle) return false;
    if (filters.filterGoal !== 'all' && member.goal !== filters.filterGoal) return false;

    if (filters.activeFollowUpCategory === 'pendingRenewal' && !member.isPendingRenewal) return false;
    if (filters.activeFollowUpCategory === 'silent' && !member.isSilent) return false;
    if (filters.activeFollowUpCategory === 'newPending' && !member.isNewPendingFollowUp) return false;
    if (filters.activeFollowUpCategory === 'summaryMissing' && !member.isSummaryMissing) return false;
    if (filters.activeFollowUpCategory === 'photoMissing' && !member.isPhotoMissing) return false;

    return true;
  })
);

export const buildStaffDetails = (staff: Staff): StaffDetailsView => {
  const detailSource = staff as Staff & Partial<StaffDetailsView>;

  return {
    ...staff,
    phone: detailSource.phone || '138-8888-8888',
    teachingStartDate: staff.teachingStartDate || '2019-05-01',
    privateSpecialties: staff.privateSpecialties || ['基础', '塑形'],
    groupSpecialties: staff.groupSpecialties || ['哈他', '流瑜伽', '普拉提大器械'],
    nonReceptionGroups: staff.nonReceptionGroups || ['男士', '孕早期', '严重腰椎间盘突出'],
    certImages: staff.certImages || ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400'],
    courseVideos: staff.courseVideos || [
      { title: '流瑜伽基础串联', url: '#', thumb: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' },
      { title: '核心力量激活', url: '#', thumb: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400' },
    ],
    historicalCourses: staff.historicalCourses || [
      { name: '哈他基础', rating: 4.9, count: 120, date: '2023-10' },
      { name: '流瑜伽进阶', rating: 4.8, count: 85, date: '2023-11' },
      { name: '阴瑜伽', rating: 4.9, count: 60, date: '2023-12' },
    ],
    popularCourses: staff.popularCourses || ['哈他基础', '流瑜伽进阶', '阿斯汤加'],
    attentionCourses: staff.attentionCourses || ['普拉提大器械', '空中瑜伽', '孕产瑜伽'],
    incomeStats: detailSource.incomeStats || {
      week: { total: 12000, percentage: 15, baseSalary: 2000, commission: 3000, smallClassFee: 4000, privateClassFee: 3000 },
      month: { total: 45000, percentage: 18, baseSalary: 8000, commission: 12000, smallClassFee: 15000, privateClassFee: 10000 },
      quarter: { total: 130000, percentage: 17, baseSalary: 24000, commission: 35000, smallClassFee: 45000, privateClassFee: 26000 },
    },
    consumptionStats: detailSource.consumptionStats || {
      week: { total: 11000, studioPercentage: 12, smallClass: 4000, privateClass: 5000, workshop: 2000 },
      month: { total: 42000, studioPercentage: 14, smallClass: 15000, privateClass: 20000, workshop: 7000 },
      quarter: { total: 125000, studioPercentage: 13, smallClass: 45000, privateClass: 60000, workshop: 20000 },
    },
    historicalPromotions: detailSource.historicalPromotions || [
      { date: '2023-01-15', from: 'T1', to: 'T2', reason: '课时达标，评价优异' },
      { date: '2024-06-20', from: 'T2', to: 'T3', reason: '续费率突出，完成培训' },
    ],
  };
};

export const calculateTeachingYears = (startDate: string): string => {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${years}年`;
};

export const getNextStaffLevel = (level: string): string => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 't1') return 'T2';
  if (normalizedLevel === 't2') return 'T3';
  if (normalizedLevel === 't3') return 'T4';
  if (normalizedLevel === 't4') return 'T5';
  if (normalizedLevel === 't5') return 'P1';
  if (normalizedLevel === 'p1') return 'P2';
  if (normalizedLevel === 'p2') return 'MENTOR';
  if (normalizedLevel === 'g1') return 'G2';
  if (normalizedLevel === 'g2') return 'MENTOR';
  if (normalizedLevel === 'mentor') return 'MAX';
  return 'T2';
};

const parseHourlyYuanFromLabel = (hourlyRate: string): number => {
  const cleaned = hourlyRate.replace(/,/g, '');
  const match = cleaned.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

export const levelDisplay = (level: Staff['level']): string => {
  if (level === 'butler') return '管家';
  if (level === 'mentor') return 'MASTER';
  return level.toUpperCase();
};

/** 师资闭环顶部摘要（模块内估算） */
export interface StaffClosedLoopSummary {
  teacherCount: number;
  monthCompletedLessons: number;
  pendingFeeReviewCount: number;
  growthPendingReviewCount: number;
  qualityAttentionCount: number;
  rulesPermissionTodoCount: number;
}

export const buildStaffClosedLoopSummary = (staffList: Staff[]): StaffClosedLoopSummary => {
  const teachers = staffList.filter(s => s.type === 'teacher');
  const monthCompletedLessons = teachers.reduce(
    (sum, t) => sum + Math.min(96, Math.max(0, Math.floor(t.classHours * 0.035))),
    0
  );
  const pendingFeeReviewCount = teachers.filter(
    t => t.promotionStatus === 'pending' || t.loadFactor >= 88 || parseHourlyYuanFromLabel(t.hourlyRate) === 0
  ).length;
  const growthPendingReviewCount = teachers.filter(t => t.promotionStatus === 'pending').length;
  const qualityAttentionCount = teachers.filter(
    t => t.rating < 4.5 || t.occupancyRate < 62 || (t.followUpRate ?? 100) < 70
  ).length;

  return {
    teacherCount: teachers.length,
    monthCompletedLessons,
    pendingFeeReviewCount,
    growthPendingReviewCount,
    qualityAttentionCount,
    rulesPermissionTodoCount: 6,
  };
};

export interface StaffHourIncomeEstimateRow {
  id: number;
  teacherName: string;
  completedCourses: number;
  lessonHours: number;
  feeEstimate: number;
  statusLabel: string;
  riskHints: string[];
}

export const buildStaffHourIncomeEstimateRows = (staffList: Staff[]): StaffHourIncomeEstimateRow[] => (
  staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const completedCourses = Math.max(1, Math.floor(t.classHours / 14));
      const lessonHours = Math.min(88, Math.max(4, Math.floor(t.classHours * 0.032)));
      const rate = parseHourlyYuanFromLabel(t.hourlyRate);
      const feeEstimate = Math.round(lessonHours * rate * 0.85);
      const riskHints = [
        '当前为模块内估算；不生成工资单；不代表已结算；后续需接入正式课时费规则；仅用于经营核对',
      ];
      if (rate <= 0) riskHints.push('课时单价登记不完整：待核对');
      if (t.loadFactor >= 90) riskHints.push('排课负载偏高：课时费口径待核对（模块内估算）');

      return {
        id: t.id,
        teacherName: t.name,
        completedCourses,
        lessonHours,
        feeEstimate,
        statusLabel: t.promotionStatus === 'pending' ? '待核对（模块内估算）' : '待核对（模块内估算）',
        riskHints,
      };
    })
);

const DEMO_STAFF_STORE_LABEL: Record<number, string> = {
  1: 'MET YOGA 西湖馆',
  2: 'MET YOGA 钱江馆（演示）',
  3: 'MET YOGA 钱江馆（演示）',
  4: 'MET YOGA 西湖馆',
  6: 'MET YOGA 西湖馆',
  11: 'MET YOGA 钱江馆（演示）',
  12: 'MET YOGA 西湖馆',
};

const staffTypeRoleLabel = (staff: Staff): string => (
  staff.type === 'teacher' ? `老师 · ${staff.title}` : `管家 · ${staff.title}`
);

const isIsoInMonth = (iso: string, year: number, monthIndex0: number): boolean => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() === monthIndex0;
};

export const formatTeachingSessionStartDisplay = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export interface StaffTeacherArchiveDetailRow {
  id: number;
  teacherName: string;
  typeRoleLabel: string;
  currentLevelLabel: string;
  storeLabel: string;
  teachableTypes: string;
  monthCourseCount: number;
  monthLessonHoursEstimate: number;
  statusLabel: string;
  riskHints: string[];
}

export const buildStaffTeacherArchiveDetailRows = (
  staffList: Staff[],
  sessions: MockStaffTeachingSessionRecord[],
  referenceDate: Date = new Date()
): StaffTeacherArchiveDetailRow[] => {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();

  return staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const monthSessions = sessions.filter(
        s => s.teacherId === t.id && isIsoInMonth(s.startAt, y, m)
      ).length;
      const monthCourseCount = monthSessions;
      const monthLessonHoursEstimate = monthCourseCount;
      const storeLabel = DEMO_STAFF_STORE_LABEL[t.id] ?? '所属门店（演示）';
      const teachableTypes = [...new Set([t.title, ...t.tags])].filter(Boolean).join('、') || '—';
      const rate = parseHourlyYuanFromLabel(t.hourlyRate);
      const riskHints: string[] = [
        '当前为模块内估算；不生成工资单；不代表已结算；后续需接入正式课时费规则与财务结算；仅用于经营核对',
      ];
      if (rate <= 0) riskHints.push('课时单价登记不完整：待核对');
      if (t.promotionStatus === 'pending') riskHints.push('存在晋升待办信号：仍以人工复核为准（待核对）');
      if (t.loadFactor >= 90) riskHints.push('排课负载偏高：口径待核对（模块内估算）');

      const statusLabel = t.promotionStatus === 'pending'
        ? '待核对（模块内估算）'
        : '待核对（模块内估算）';

      return {
        id: t.id,
        teacherName: t.name,
        typeRoleLabel: staffTypeRoleLabel(t),
        currentLevelLabel: levelDisplay(t.level),
        storeLabel,
        teachableTypes,
        monthCourseCount,
        monthLessonHoursEstimate,
        statusLabel,
        riskHints,
      };
    });
};

export interface StaffSessionHourRevenueRow {
  id: string;
  teacherName: string;
  sessionTitle: string;
  courseType: string;
  startDisplay: string;
  headcount: number;
  feeRuleNote: string;
  feeEstimate: number;
  statusLabel: string;
  pendingCheckNote: string;
}

const DEFAULT_SESSION_FEE_RULE_NOTE = '占位：按到课人数与登记单价的模块内估算系数；待接入正式课时费规则。';

const DEFAULT_SESSION_PENDING_NOTE = '正式课时费规则未接入；当前为模块内估算；不生成工资单；不代表已结算；后续需接入正式课时费规则与财务结算；仅用于经营核对。';

export const buildStaffSessionHourRevenueRows = (
  sessions: MockStaffTeachingSessionRecord[],
  staffList: Staff[]
): StaffSessionHourRevenueRow[] => {
  const byId = new Map(staffList.map(s => [s.id, s] as const));

  return [...sessions]
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .map(s => {
      const teacher = byId.get(s.teacherId);
      const teacherName = teacher?.name ?? '未知老师（演示）';
      const rate = teacher ? parseHourlyYuanFromLabel(teacher.hourlyRate) : 0;
      const headFactor = s.courseType === '私教' ? 1 : Math.min(s.headcount, 16);
      const feeEstimate = Math.round(rate * headFactor * 0.12);
      return {
        id: s.id,
        teacherName,
        sessionTitle: s.sessionTitle,
        courseType: s.courseType,
        startDisplay: formatTeachingSessionStartDisplay(s.startAt),
        headcount: s.headcount,
        feeRuleNote: s.feeRuleNote ?? DEFAULT_SESSION_FEE_RULE_NOTE,
        feeEstimate,
        statusLabel: '待核对（模块内估算）',
        pendingCheckNote: DEFAULT_SESSION_PENDING_NOTE,
      };
    });
};

export interface StaffGrowthReviewRow {
  id: number;
  teacherName: string;
  currentLevelLabel: string;
  targetLevelLabel: string;
  recentPerformanceSummary: string;
  reviewStatusLabel: string;
  riskHints: string[];
}

export const buildStaffGrowthReviewRows = (staffList: Staff[]): StaffGrowthReviewRow[] => (
  staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const target = getNextStaffLevel(t.level);
      const reviewStatusLabel = t.promotionStatus === 'pending'
        ? '待复核（仅展示）'
        : '待核对（模块内估算）';
      const targetLevelLabel = t.promotionStatus === 'pending'
        ? `待复核等级倾向：${target}（仅展示）`
        : `目标等级参考：${target}（模块内估算）`;
      const riskHints = [
        '当前为展示入口；不自动升降级；不生成正式考核结果；后续需接入成长规则；仅用于经营核对',
      ];
      if (t.promotionStatus === 'pending') {
        riskHints.push('存在晋升待办信号：仍以人工复核为准（待复核）');
      }

      return {
        id: t.id,
        teacherName: t.name,
        currentLevelLabel: levelDisplay(t.level),
        targetLevelLabel,
        recentPerformanceSummary: `评分 ${t.rating.toFixed(1)} · 满课率约 ${t.occupancyRate}% · 跟进率约 ${t.followUpRate ?? 0}%（模块内估算）`,
        reviewStatusLabel,
        riskHints,
      };
    })
);

export interface StaffGrowthLevelReviewDetailRow {
  id: number;
  teacherName: string;
  currentLevelLabel: string;
  targetLevelLabel: string;
  recentCoursePerformance: string;
  recentLessonPerformance: string;
  privateGroupSmallSummary: string;
  reviewStatusLabel: string;
  riskHints: string[];
}

export const buildStaffGrowthLevelReviewDetailRows = (
  staffList: Staff[]
): StaffGrowthLevelReviewDetailRow[] => (
  staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const target = getNextStaffLevel(t.level);
      const targetLevelLabel = t.promotionStatus === 'pending'
        ? `待复核等级倾向：${target}（模块内展示）`
        : `目标等级参考：${target}（模块内展示）`;
      const reviewStatusLabel = t.promotionStatus === 'pending'
        ? '待复核（模块内展示）'
        : '待核对（模块内展示）';

      const recentCoursePerformance = `转化约 ${t.conversionRate}% · 续费结构新约 ${t.newvsRenewal.new}% / 续约约 ${t.newvsRenewal.renewal}%（模块内展示）`;
      const recentLessonPerformance = `累计课时基数约 ${t.classHours} · 近阶段负荷系数约 ${t.loadFactor}%（模块内展示）`;
      const privateGroupSmallSummary = `经营画像：${t.revenueModel === 'L2' ? '偏私教 / 小班侧重（演示）' : '偏团课侧重（演示）'} · 课种标签：${t.tags.slice(0, 4).join('、') || '—'}（模块内展示）`;

      const riskHints: string[] = [
        '当前为模块内展示；不自动升降级；不生成正式考核结果；后续需接入成长规则与正式复核流程；仅用于经营核对',
      ];
      if (t.promotionStatus === 'pending') {
        riskHints.push('存在晋升待办信号：待复核（模块内展示）');
      }
      if (t.rating < 4.5) {
        riskHints.push('评分偏低：待关注（模块内展示）');
      }
      if ((t.followUpRate ?? 100) < 70) {
        riskHints.push('跟进率偏低：待复核口径（模块内展示）');
      }

      return {
        id: t.id,
        teacherName: t.name,
        currentLevelLabel: levelDisplay(t.level),
        targetLevelLabel,
        recentCoursePerformance,
        recentLessonPerformance,
        privateGroupSmallSummary,
        reviewStatusLabel,
        riskHints,
      };
    })
);

export interface StaffTeachingQualityRow {
  id: number;
  teacherName: string;
  courseExecutionSummary: string;
  attendanceSummary: string;
  feedbackOrWatchSummary: string;
  riskHints: string[];
}

export const buildStaffTeachingQualityRows = (staffList: Staff[]): StaffTeachingQualityRow[] => (
  staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const absentRisk = t.occupancyRate < 60 ? '满课压力偏低，缺席/临缺风险需结合课表核对（模块内估算）' : '满课与到课整体平稳（模块内估算）';
      const feedbackOrWatchSummary = t.rating < 4.5
        ? '会员评价存在波动：建议关注课堂反馈收集（待接入）'
        : '暂无结构化会员反馈登记：待接入评价汇总（仅用于经营核对）';

      return {
        id: t.id,
        teacherName: t.name,
        courseExecutionSummary: `团课 / 小班 / 私教执行：负荷系数约 ${t.loadFactor}%（模块内估算）`,
        attendanceSummary: `满课 / 到课侧：满课率约 ${t.occupancyRate}% · ${absentRisk}`,
        feedbackOrWatchSummary,
        riskHints: [
          '教学质量为经营侧摘要；不生成正式考核结果；仅用于经营核对',
          t.rating < 4.5 ? '评分偏低：待关注（待核对）' : '建议持续例行巡检（待核对）',
        ],
      };
    })
);

export interface StaffTeachingQualityRiskDetailRow {
  id: number;
  teacherName: string;
  courseExecutionSummary: string;
  attendanceSummary: string;
  feedbackOrWatchSummary: string;
  teachingQualityStatusLabel: string;
  riskHints: string[];
  suggestedAction: string;
}

export const buildStaffTeachingQualityRiskDetailRows = (
  staffList: Staff[]
): StaffTeachingQualityRiskDetailRow[] => (
  staffList
    .filter(s => s.type === 'teacher')
    .map(t => {
      const absentRisk = t.occupancyRate < 60
        ? '满课压力偏低，缺席 / 临缺风险需结合课表核对（模块内展示）'
        : '满课与到课整体平稳（模块内展示）';
      const feedbackOrWatchSummary = t.rating < 4.5
        ? '会员评价存在波动：建议关注课堂反馈收集（待接入教学质量评价）'
        : '暂无结构化会员反馈登记：待接入教学质量评价（模块内展示）';

      const teachingQualityStatusLabel = t.rating < 4.5 || t.occupancyRate < 62
        ? '待关注（模块内展示）'
        : '相对平稳（模块内展示）';

      let suggestedAction = '建议例行课堂巡检与反馈登记（模块内展示）';
      if (t.rating < 4.5) {
        suggestedAction = '建议店长抽查课堂与评价登记流程（待接入教学质量评价）';
      } else if ((t.followUpRate ?? 100) < 70) {
        suggestedAction = '建议补强课后跟进节奏与会员回访（模块内展示）';
      } else if (t.occupancyRate < 62) {
        suggestedAction = '建议结合排课与到课事实做专项复盘（模块内展示）';
      }

      const riskHints: string[] = [
        '当前为模块内展示；不生成正式考核结果；待接入教学质量评价；仅用于经营核对',
      ];
      if (t.rating < 4.5) riskHints.push('评分偏低：待关注（模块内展示）');
      if (t.occupancyRate < 62) riskHints.push('满课率偏低：待核对（模块内展示）');

      return {
        id: t.id,
        teacherName: t.name,
        courseExecutionSummary: `团课 / 小班 / 私教执行：负荷系数约 ${t.loadFactor}%（模块内展示）`,
        attendanceSummary: `满课 / 到课侧：满课率约 ${t.occupancyRate}% · ${absentRisk}`,
        feedbackOrWatchSummary,
        teachingQualityStatusLabel,
        riskHints,
        suggestedAction,
      };
    })
);

export interface StaffRulesPendingRow {
  id: string;
  ruleName: string;
  roleOrScope: string;
  operationLogHint: string;
  approvalFlowHint: string;
  pendingIntegrationText: string;
  riskHints: string[];
}

export const buildStaffRulesPendingRows = (): StaffRulesPendingRow[] => [
  {
    id: 'rule-pay',
    ruleName: '课时费规则',
    roleOrScope: '教学 / 排课 / 财务核对角色',
    operationLogHint: '操作日志：待接入统一审计视图（仅展示）',
    approvalFlowHint: '审批流：未接入正式审批链（待接入）',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['待接入规则；仅用于经营核对'],
  },
  {
    id: 'rule-growth',
    ruleName: '成长等级规则',
    roleOrScope: '教研 / 店长复核角色',
    operationLogHint: '操作日志：待接入（仅展示）',
    approvalFlowHint: '审批流：待接入（仅展示）',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['不自动升降级；待接入规则'],
  },
  {
    id: 'rule-leave',
    ruleName: '请假 / 代课规则',
    roleOrScope: '排课 / 替补教练池',
    operationLogHint: '操作日志：待接入（仅展示）',
    approvalFlowHint: '审批流：待接入（仅展示）',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['待核对排班冲突；仅用于经营核对'],
  },
  {
    id: 'rule-perm',
    ruleName: '权限角色',
    roleOrScope: '门店管理员 / 教练 / 管家',
    operationLogHint: '操作日志：待接入（仅展示）',
    approvalFlowHint: '审批流：待接入（仅展示）',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['尚未写入权限变更；待接入规则'],
  },
  {
    id: 'rule-log',
    ruleName: '操作日志',
    roleOrScope: '全角色',
    operationLogHint: '仅入口占位：待接入集中日志服务',
    approvalFlowHint: '审批流：与日志联动待接入',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['待接入规则；仅用于经营核对'],
  },
  {
    id: 'rule-approval',
    ruleName: '审批流',
    roleOrScope: '晋升 / 请假 / 课时争议',
    operationLogHint: '操作日志：待接入（仅展示）',
    approvalFlowHint: '正式审批记录：待接入（不生成正式审批记录）',
    pendingIntegrationText: '当前为入口展示；尚未接入真实规则引擎；尚未写入权限变更；尚未生成正式审批记录。',
    riskHints: ['待接入规则；待核对'],
  },
];

export interface StaffRuleConfigDetailRow {
  id: string;
  ruleTypeLabel: string;
  applicabilityLabel: string;
  configStatusLabel: string;
  impactScope: string;
  pendingIntegrationNote: string;
  riskHints: string[];
}

const RULE_CONFIG_BASE_RISK = '当前为模块内展示；尚未接入真实规则引擎；不自动应用到老师工资、等级、权限；后续需接入统一规则配置；仅用于经营核对';

export const buildStaffRuleConfigDetailRows = (): StaffRuleConfigDetailRow[] => [
  {
    id: 'rc-fee',
    ruleTypeLabel: '课时费规则',
    applicabilityLabel: '教学老师、排课、店长核对（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响课时费口径展示与经营核对范围（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与正式计费口径（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '课时费口径待接入规则后对齐（待接入规则）'],
  },
  {
    id: 'rc-growth',
    ruleTypeLabel: '成长等级规则',
    applicabilityLabel: '教研、店长复核（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响成长展示与复核提示范围（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与正式复核流程（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '不自动升降级；待接入成长规则'],
  },
  {
    id: 'rc-leave',
    ruleTypeLabel: '请假规则',
    applicabilityLabel: '老师、排课、替补池（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响排班可用性与代课触发条件展示（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与请假审批链（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '请假链路待接入规则（待接入规则）'],
  },
  {
    id: 'rc-sub',
    ruleTypeLabel: '代课规则',
    applicabilityLabel: '排课、替补教练池（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响代课匹配与责任边界展示（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与代课登记口径（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '代课口径待核对（模块内展示）'],
  },
  {
    id: 'rc-sched-perm',
    ruleTypeLabel: '排课权限规则',
    applicabilityLabel: '排课专员、店长（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响排课操作边界与冲突校验展示（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与权限矩阵（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '排课权限待接入规则（待接入规则）'],
  },
  {
    id: 'rc-quality-review',
    ruleTypeLabel: '教学质量复核规则',
    applicabilityLabel: '教研、店长、质检角色（演示）',
    configStatusLabel: '占位未接入（模块内展示）',
    impactScope: '影响教学质量复核清单与关注项展示（模块内展示）',
    pendingIntegrationNote: '待接入统一规则配置与评价汇总（模块内展示）',
    riskHints: [RULE_CONFIG_BASE_RISK, '不生成正式考核结果；待接入规则'],
  },
];

export interface StaffPermissionAuditDetailRow {
  id: string;
  roleOrPersonLabel: string;
  permissionScopeLabel: string;
  sensitiveOpsSummary: string;
  auditStatusLabel: string;
  pendingIntegrationNote: string;
  riskHints: string[];
}

const PERM_AUDIT_BASE_RISK = '当前为只读审计入口；不修改员工权限；不生成审批记录；后续需接入角色权限与操作日志；仅用于经营核对';

export const buildStaffPermissionAuditDetailRows = (): StaffPermissionAuditDetailRow[] => [
  {
    id: 'pa-teacher-view',
    roleOrPersonLabel: '教学老师（演示）',
    permissionScopeLabel: '老师查看权限',
    sensitiveOpsSummary: '查看课表、会员基础档案片段（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入角色权限与操作日志查询（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '敏感查看边界待接入规则（待接入权限审计）'],
  },
  {
    id: 'pa-schedule',
    roleOrPersonLabel: '排课专员（演示）',
    permissionScopeLabel: '排课权限',
    sensitiveOpsSummary: '新增 / 调整排课、教室占用（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入角色权限与排课操作留痕（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '排课敏感操作待接入审计（待接入权限审计）'],
  },
  {
    id: 'pa-substitute',
    roleOrPersonLabel: '教学协调（演示）',
    permissionScopeLabel: '代课权限',
    sensitiveOpsSummary: '发起代课、确认替补（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入代课审批与日志串联（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '代课链路待接入权限审计（待接入权限审计）'],
  },
  {
    id: 'pa-fee-view',
    roleOrPersonLabel: '店长 / 财务核对（演示）',
    permissionScopeLabel: '课时费查看权限',
    sensitiveOpsSummary: '查看课时费估算与核对清单（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入分级查看与水印审计（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '课时费查看边界待接入规则（待接入规则）'],
  },
  {
    id: 'pa-growth-view',
    roleOrPersonLabel: '店长 / 教研（演示）',
    permissionScopeLabel: '成长等级查看权限',
    sensitiveOpsSummary: '查看成长展示与复核提示（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入查看脱敏与复核留痕（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '成长查看与复核待接入权限审计（待接入权限审计）'],
  },
  {
    id: 'pa-approval-log',
    roleOrPersonLabel: '门店管理员（演示）',
    permissionScopeLabel: '审批 / 操作日志权限',
    sensitiveOpsSummary: '查看审批入口占位、操作日志占位（模块内展示）',
    auditStatusLabel: '待接入权限审计（模块内展示）',
    pendingIntegrationNote: '待接入集中日志与审批查询（模块内展示）',
    riskHints: [PERM_AUDIT_BASE_RISK, '审批与日志查询待接入（不生成审批记录）'],
  },
];
