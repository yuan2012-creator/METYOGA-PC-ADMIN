import type { Staff } from '../types';

export type StaffTab = 'decision' | 'archives' | 'schedule';
export type StaffFilterType = 'all' | 'leads' | 'adjust' | 'new' | 'part_time';
export type StaffMemberListTab = 'all' | 'private' | 'followup';

export const STAFF_TABS: Array<{ id: StaffTab; label: string }> = [
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
  if (normalizedLevel === 't5') return 'MENTOR';
  if (normalizedLevel === 'mentor') return 'MAX';
  return 'T2';
};
