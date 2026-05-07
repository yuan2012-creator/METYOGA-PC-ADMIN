import {
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_CONTRACTS,
  MOCK_COURSE_SESSIONS,
  MOCK_FINANCE_LEDGER_ENTRIES,
  MOCK_MEMBERS,
  MOCK_MHS_DATA,
  MOCK_ORDERS,
  MOCK_PAYMENTS,
  MOCK_REFUNDS,
} from '../constants';
import type { Attendance } from '../types';
import {
  countPendingOrders,
  sumPayments,
  sumRecognizedIncome,
  sumRefunds,
} from './financeSelectors';
import { MEMBER_LIFECYCLE_GROUPS, getMemberLifecycleStatus } from './memberLifecycle';

export type MhsDimensionKey = 'L' | 'F' | 'E' | 'S';

export interface DashboardRadarItem {
  subject: string;
  A: number;
  fullMark: number;
  key: MhsDimensionKey;
}

export interface DashboardSnapshotItem {
  label: string;
  value: string;
  desc: string;
  icon: string;
  tone: string;
}

export interface DashboardSummary {
  mhsScore: number;
  mhsStatusLabel: string;
  mhsStatusClass: string;
  mhsStrokeOffset: number;
  activeMemberCount: number;
  riskMemberCount: number;
  pendingOrderCount: number;
  pendingContractCount: number;
  upcomingSessionCount: number;
  activeBookingCount: number;
  consumedAttendanceCount: number;
  paidPaymentAmount: number;
  refundAmount: number;
  netCashFlow: number;
  recognizedIncomeAmount: number;
}

export const MHS_DIMENSION_KEYS: MhsDimensionKey[] = ['L', 'F', 'E', 'S'];
export const MHS_CIRCLE_LENGTH = 440;

const MHS_RADAR_SUBJECTS: Record<MhsDimensionKey, string> = {
  L: '留存 (L)',
  F: '财务 (F)',
  E: '效率 (E)',
  S: '员工 (S)',
};

const MONEY_FORMATTER = new Intl.NumberFormat('zh-CN');

export const formatDashboardMoney = (amount: number): string => `¥${MONEY_FORMATTER.format(amount)}`;

export const countConsumedAttendances = (attendances: Attendance[]): number => (
  attendances.filter(attendance => attendance.status === 'consumed').length
);

export const buildRadarData = (): DashboardRadarItem[] => (
  MHS_DIMENSION_KEYS.map(key => ({
    subject: MHS_RADAR_SUBJECTS[key],
    A: MOCK_MHS_DATA[key].score,
    fullMark: 100,
    key,
  }))
);

const getMhsStatus = (score: number): Pick<DashboardSummary, 'mhsStatusLabel' | 'mhsStatusClass'> => {
  if (score >= 80) return { mhsStatusLabel: '健康状态', mhsStatusClass: 'bg-green-100 text-green-700' };
  if (score >= 60) return { mhsStatusLabel: '亚健康状态', mhsStatusClass: 'bg-yellow-100 text-yellow-800' };
  return { mhsStatusLabel: '需重点关注', mhsStatusClass: 'bg-red-100 text-red-700' };
};

export const buildDashboardSummary = (): DashboardSummary => {
  const mhsScore = Math.round(
    MHS_DIMENSION_KEYS.reduce((sum, key) => sum + MOCK_MHS_DATA[key].score, 0) / MHS_DIMENSION_KEYS.length
  );
  const paidPaymentAmount = sumPayments(MOCK_PAYMENTS);
  const refundAmount = sumRefunds(MOCK_REFUNDS, ['completed', 'processing', 'approved']);
  const activeMemberCount = MOCK_MEMBERS.filter(member => (
    MEMBER_LIFECYCLE_GROUPS.active.includes(getMemberLifecycleStatus(member))
  )).length;
  const riskMemberCount = MOCK_MEMBERS.filter(member => Boolean(member.riskTag)).length;
  const pendingOrderCount = countPendingOrders(MOCK_ORDERS);
  const pendingContractCount = MOCK_CONTRACTS.filter(contract => (
    contract.status === 'draft' || contract.status === 'pending_signature' || contract.status === 'signed'
  )).length;
  const upcomingSessionCount = MOCK_COURSE_SESSIONS.filter(session => (
    session.status === 'scheduled' || session.status === 'published'
  )).length;
  const activeBookingCount = MOCK_BOOKINGS.filter(booking => (
    booking.status === 'booked' || booking.status === 'waitlisted'
  )).length;
  const consumedAttendanceCount = countConsumedAttendances(MOCK_ATTENDANCES);
  const recognizedIncomeAmount = sumRecognizedIncome(MOCK_FINANCE_LEDGER_ENTRIES);
  const { mhsStatusLabel, mhsStatusClass } = getMhsStatus(mhsScore);

  return {
    mhsScore,
    mhsStatusLabel,
    mhsStatusClass,
    mhsStrokeOffset: MHS_CIRCLE_LENGTH - (mhsScore / 100) * MHS_CIRCLE_LENGTH,
    activeMemberCount,
    riskMemberCount,
    pendingOrderCount,
    pendingContractCount,
    upcomingSessionCount,
    activeBookingCount,
    consumedAttendanceCount,
    paidPaymentAmount,
    refundAmount,
    netCashFlow: paidPaymentAmount - refundAmount,
    recognizedIncomeAmount,
  };
};

export const buildSnapshotItems = (summary: DashboardSummary): DashboardSnapshotItem[] => [
  {
    label: '会员池',
    value: `${summary.activeMemberCount}人`,
    desc: `${summary.riskMemberCount} 个风险标签待跟进`,
    icon: 'fa-regular fa-user',
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    label: '商品履约',
    value: `${summary.pendingOrderCount}单`,
    desc: `${summary.pendingContractCount} 份合同待签/生效`,
    icon: 'fa-solid fa-file-signature',
    tone: 'bg-purple-50 text-purple-600',
  },
  {
    label: '今日教务',
    value: `${summary.upcomingSessionCount}场`,
    desc: `${summary.activeBookingCount} 个预约，${summary.consumedAttendanceCount} 次已消课`,
    icon: 'fa-regular fa-calendar-check',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: '财务净额',
    value: formatDashboardMoney(summary.netCashFlow),
    desc: `已确认收入 ${formatDashboardMoney(summary.recognizedIncomeAmount)}，退款 ${formatDashboardMoney(summary.refundAmount)}`,
    icon: 'fa-solid fa-coins',
    tone: 'bg-orange-50 text-orange-600',
  },
];
