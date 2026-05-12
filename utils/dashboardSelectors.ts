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
  MOCK_STAFF_LIST,
  MOCK_TEAM_TASKS,
} from '../constants';
import type { Attendance } from '../types';
import {
  buildFinanceOverviewSummary,
  countPendingOrders,
  countPendingRefunds,
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
    desc: `分录侧已登记 ${formatDashboardMoney(summary.recognizedIncomeAmount)}（待核对），退款 ${formatDashboardMoney(summary.refundAmount)}`,
    icon: 'fa-solid fa-coins',
    tone: 'bg-orange-50 text-orange-600',
  },
];

/** 第六阶段：经营总览「问题 / 动作 / 责任人」入口卡片（模块内展示；仅用于经营判断） */
export interface DashboardOperatingZoneCard {
  id: string;
  title: string;
  problem: string;
  action: string;
  owner: string;
  metricLine: string;
}

const DEMO_BEGINNING_DEFERRED = 1_420_000;

export const buildDashboardOperatingZoneCards = (summary: DashboardSummary): DashboardOperatingZoneCard[] => {
  const financeOverview = buildFinanceOverviewSummary({
    orders: MOCK_ORDERS,
    payments: MOCK_PAYMENTS,
    refunds: MOCK_REFUNDS,
    ledgerEntries: MOCK_FINANCE_LEDGER_ENTRIES,
    beginningDeferredRevenue: DEMO_BEGINNING_DEFERRED,
  });
  const pendingTeam = MOCK_TEAM_TASKS.filter(t => t.status === 'pending').length;
  const absentLike = MOCK_ATTENDANCES.filter(a => a.status === 'absent').length;
  const cancelledSessions = MOCK_COURSE_SESSIONS.filter(s => s.status === 'cancelled').length;
  const teachers = MOCK_STAFF_LIST.filter(s => s.type === 'teacher');
  const avgOcc = teachers.length
    ? Math.round(teachers.reduce((sum, t) => sum + t.occupancyRate, 0) / teachers.length)
    : 0;
  const pendingRefundN = countPendingRefunds(MOCK_REFUNDS);
  const unconfirmedIncomeDemo = Math.max(
    0,
    Math.round(financeOverview.cashIncomeTotal * 0.12 - financeOverview.recognizedIncomeTotal * 0.05)
  );

  return [
    {
      id: 'dz-today',
      title: '今日待处理',
      problem: `前台 / 运营队列堆积：订单待办 ${summary.pendingOrderCount}、团队任务待办 ${pendingTeam}（模块内展示）`,
      action: '晨会 10 分钟对齐优先级，先清「待支付 / 待退款核对」',
      owner: '值班店长',
      metricLine: `待办信号：${summary.pendingOrderCount + pendingTeam} 条（待核对）`,
    },
    {
      id: 'dz-store-health',
      title: '门店健康概览',
      problem: `MHS 综合 ${summary.mhsScore} 分 · ${summary.mhsStatusLabel}：需盯住短板维度（模块内展示）`,
      action: '打开雷达图，优先复盘评分最低的维度并指派跟进人',
      owner: '区域运营',
      metricLine: `活跃会员约 ${summary.activeMemberCount} 人（待接入真实经营数据）`,
    },
    {
      id: 'dz-cash',
      title: '实收 / 退款 / 净收款',
      problem: `净现金流 ${formatDashboardMoney(financeOverview.netCashFlow)}：需对齐收款登记与退款进度（模块内展示）`,
      action: '按日核对支付流水与退款台账，标记异常金额',
      owner: '店长 + 财务核对',
      metricLine: `实收 ${formatDashboardMoney(financeOverview.cashIncomeTotal)} · 退款 ${formatDashboardMoney(financeOverview.refundTotal)}（待核对）`,
    },
    {
      id: 'dz-deferred',
      title: '预收负债 / 待确认收入',
      problem: `预收负债（演示口径）约 ${formatDashboardMoney(financeOverview.endingDeferredRevenue)}；待确认收入（模块内测算）约 ${formatDashboardMoney(unconfirmedIncomeDemo)}`,
      action: '拉出「未耗课 / 已耗课未入账」清单做人工抽样核对',
      owner: '财务 BP',
      metricLine: '后续需接入真实经营数据与正式分录服务（待接入规则）',
    },
    {
      id: 'dz-attendance',
      title: '预约 / 到课 / 缺席',
      problem: `预约在册 ${summary.activeBookingCount}；已消课 ${summary.consumedAttendanceCount}；缺席登记 ${absentLike}（模块内展示）`,
      action: '对缺席高发时段安排替补与提醒脚本（演示）',
      owner: '排课主管',
      metricLine: `今日场次约 ${summary.upcomingSessionCount}（待核对）`,
    },
    {
      id: 'dz-member-risk',
      title: '会员风险',
      problem: `风险标签会员约 ${summary.riskMemberCount} 人：续费 / 沉默需分层跟进（模块内展示）`,
      action: '今日优先回访「高价值 + 高风险」名单各 5 人',
      owner: '会员顾问',
      metricLine: `活跃会员约 ${summary.activeMemberCount} 人（待接入真实经营数据）`,
    },
    {
      id: 'dz-course',
      title: '课程异常',
      problem: `异常场次信号：取消 / 改期类约 ${cancelledSessions} 场（演示占位，待核对）`,
      action: '核对教室占用与教练可用性，避免连环爽约',
      owner: '教务',
      metricLine: '课程状态以教务系统为准（模块内展示）',
    },
    {
      id: 'dz-staff-exec',
      title: '老师执行',
      problem: `满课率均值约 ${avgOcc}%：尾部教练需帮扶（模块内测算）`,
      action: '本周安排 1 次课堂旁听与模板化反馈',
      owner: '教学督导',
      metricLine: `在册老师 ${teachers.length} 人（演示）`,
    },
    {
      id: 'dz-finance-risk',
      title: '财务风险',
      problem: `在途退款 / 待核对约 ${pendingRefundN} 笔：证据链易断档（模块内展示）`,
      action: '按「订单 → 资产 → 退款登记」顺序做抽样对齐',
      owner: '财务核对',
      metricLine: `待办财务信号 ${financeOverview.pendingCount} 条（待核对）`,
    },
    {
      id: 'dz-suggest',
      title: '经营建议',
      problem: '问题优先：先收口现金流与退款核对，再拉升满课与人效（模块内展示）',
      action: '本周固定三件事：①退款核对 ②满课尾部门店 ③风险会员回访',
      owner: '总经理 / 区域',
      metricLine: '仅用于经营判断；不生成正式报告（模块内测算）',
    },
  ];
};

/** 今日待处理问题明细（模块内判断；不写真实任务） */
export interface DashboardTodayIssueRow {
  id: string;
  problemType: string;
  storeLabel: string;
  relatedObject: string;
  riskLevel: string;
  suggestedAction: string;
  owner: string;
  statusLabel: string;
  pendingIntegrationNote: string;
}

const riskMemberSample = MOCK_MEMBERS.find(m => m.riskTag) ?? MOCK_MEMBERS[0];
const firstPendingContract = MOCK_CONTRACTS.find(c => c.status === 'draft' || c.status === 'pending_signature');

export const buildDashboardTodayIssueRows = (summary: DashboardSummary): DashboardTodayIssueRow[] => {
  const cancelledSessions = MOCK_COURSE_SESSIONS.filter(s => s.status === 'cancelled').length;
  const pendingRefundN = countPendingRefunds(MOCK_REFUNDS);
  const lowOccTeacher = MOCK_STAFF_LIST.find(s => s.type === 'teacher' && s.occupancyRate < 62);

  return [
    {
      id: 'ti-member-risk',
      problemType: '会员风险',
      storeLabel: 'MET YOGA 西湖馆（演示）',
      relatedObject: riskMemberSample ? `会员 ${riskMemberSample.name}（${riskMemberSample.riskTag ?? '风险待标注'}）` : '会员池（演示）',
      riskLevel: summary.riskMemberCount >= 3 ? '高（模块内判断）' : '中（模块内判断）',
      suggestedAction: '今日电话回访并登记跟进纪要（人工执行；不自动生成任务）',
      owner: '会员顾问',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '待接入真实经营数据与任务系统；不自动通知责任人',
    },
    {
      id: 'ti-course',
      problemType: '课程异常',
      storeLabel: 'MET YOGA 西湖馆（演示）',
      relatedObject: `取消 / 异常场次信号约 ${cancelledSessions} 场（演示占位）`,
      riskLevel: cancelledSessions > 0 ? '中（模块内判断）' : '低（模块内判断）',
      suggestedAction: '核对教室占用与教练替补池，避免连环爽约',
      owner: '教务',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '课程状态以教务系统为准；待接入真实经营数据',
    },
    {
      id: 'ti-finance',
      problemType: '财务风险',
      storeLabel: 'MET YOGA 西湖馆（演示）',
      relatedObject: `在途退款 / 待核对约 ${pendingRefundN} 笔（演示）`,
      riskLevel: pendingRefundN > 2 ? '高（模块内判断）' : '中（模块内判断）',
      suggestedAction: '按订单 → 资产 → 退款登记抽样对齐',
      owner: '财务核对',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '待接入真实经营数据；不同步财务',
    },
    {
      id: 'ti-staff',
      problemType: '老师执行',
      storeLabel: 'MET YOGA 钱江馆（演示）',
      relatedObject: lowOccTeacher ? `老师 ${lowOccTeacher.name}（满课率约 ${lowOccTeacher.occupancyRate}%）` : '教学岗（演示）',
      riskLevel: '中（模块内判断）',
      suggestedAction: '安排旁听与模板化反馈（人工排期）',
      owner: '教学督导',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '不改老师数据；待接入真实经营数据',
    },
    {
      id: 'ti-booking',
      problemType: '预约 / 到课异常',
      storeLabel: 'MET YOGA 钱江馆（演示）',
      relatedObject: `在册预约 ${summary.activeBookingCount} · 已消课 ${summary.consumedAttendanceCount}（模块内展示）`,
      riskLevel: '中（模块内判断）',
      suggestedAction: '对高峰缺席时段加提醒与替补预案',
      owner: '排课主管',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '待接入真实经营数据与到课事实对齐',
    },
    {
      id: 'ti-contract-asset',
      problemType: '合同 / 资产待核对',
      storeLabel: 'MET YOGA 西湖馆（演示）',
      relatedObject: firstPendingContract
        ? `合同 ${firstPendingContract.id}（${firstPendingContract.status}）`
        : `待生效合同约 ${summary.pendingContractCount} 份（演示）`,
      riskLevel: '中（模块内判断）',
      suggestedAction: '核对签署与资产开通是否一致',
      owner: '店长',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '待接入产品与合同模块事实；不自动生成任务',
    },
  ];
};

/** 门店健康明细（模块内判断） */
export interface DashboardStoreHealthRow {
  id: string;
  storeName: string;
  businessStatus: string;
  bookingSummary: string;
  attendanceSummary: string;
  collectionSummary: string;
  refundRiskSummary: string;
  teacherExecSummary: string;
  memberRiskSummary: string;
  holisticHint: string;
}

export const buildDashboardStoreHealthRows = (summary: DashboardSummary): DashboardStoreHealthRow[] => {
  const teachers = MOCK_STAFF_LIST.filter(s => s.type === 'teacher');
  const avgOcc = teachers.length
    ? Math.round(teachers.reduce((sum, t) => sum + t.occupancyRate, 0) / teachers.length)
    : 0;
  const pendingRefundN = countPendingRefunds(MOCK_REFUNDS);

  return [
    {
      id: 'sh-xh',
      storeName: 'MET YOGA 西湖馆（演示）',
      businessStatus: `${summary.mhsStatusLabel} · MHS 约 ${summary.mhsScore}（模块内判断）`,
      bookingSummary: `在册预约约 ${summary.activeBookingCount}（待核对）`,
      attendanceSummary: `已消课约 ${summary.consumedAttendanceCount}（模块内展示）`,
      collectionSummary: `收款侧演示口径约 ${formatDashboardMoney(summary.paidPaymentAmount)}（待核对）`,
      refundRiskSummary: `在途退款信号 ${pendingRefundN} 笔（模块内判断）`,
      teacherExecSummary: `满课率均值约 ${avgOcc}%（模块内测算）`,
      memberRiskSummary: `风险会员约 ${summary.riskMemberCount} 人（待核对）`,
      holisticHint: '优先收口退款核对与风险会员回访；仅用于经营判断',
    },
    {
      id: 'sh-qj',
      storeName: 'MET YOGA 钱江馆（演示）',
      businessStatus: '待核对（模块内展示）',
      bookingSummary: `预约约 ${Math.max(0, summary.activeBookingCount - 2)}（演示拆分）`,
      attendanceSummary: `到课 / 消课约 ${Math.max(0, summary.consumedAttendanceCount - 4)}（演示拆分）`,
      collectionSummary: `收款演示口径约 ${formatDashboardMoney(Math.round(summary.paidPaymentAmount * 0.42))}（待核对）`,
      refundRiskSummary: `退款信号约 ${Math.max(0, pendingRefundN - 1)} 笔（演示）`,
      teacherExecSummary: '尾部教练需帮扶（模块内判断）',
      memberRiskSummary: `风险会员约 ${Math.max(0, summary.riskMemberCount - 1)} 人（演示）`,
      holisticHint: '关注满课与缺席波动；待接入真实经营数据',
    },
  ];
};

/** 经营建议明细（模块内经营建议；不自动生成任务） */
export interface DashboardSuggestionRow {
  id: string;
  suggestionType: string;
  triggerReason: string;
  suggestedAction: string;
  impactScope: string;
  ownerRole: string;
  statusLabel: string;
}

export const buildDashboardSuggestionRows = (summary: DashboardSummary): DashboardSuggestionRow[] => [
  {
    id: 'sg-cash',
    suggestionType: '现金流与退款',
    triggerReason: `待支付 / 退款待核对与订单堆积（模块内判断）`,
    suggestedAction: '晨会固定 15 分钟过一遍「待支付 + 在途退款」',
    impactScope: '全店收款与会员体验',
    ownerRole: '店长 + 财务核对',
    statusLabel: '待处理（模块内展示）',
  },
  {
    id: 'sg-occ',
    suggestionType: '满课与人效',
    triggerReason: `教务负荷与预约结构存在波动（模块内判断）`,
    suggestedAction: '对低满课时段做排课模板微调（人工）',
    impactScope: '排课与教室利用率',
    ownerRole: '排课主管',
    statusLabel: '待处理（模块内展示）',
  },
  {
    id: 'sg-member',
    suggestionType: '会员留存',
    triggerReason: `风险标签会员约 ${summary.riskMemberCount} 人（模块内判断）`,
    suggestedAction: '本周完成分层回访清单（人工登记）',
    impactScope: '续费与沉默唤醒',
    ownerRole: '会员顾问',
    statusLabel: '待处理（模块内展示）',
  },
  {
    id: 'sg-contract',
    suggestionType: '合同 / 资产一致',
    triggerReason: `待生效 / 待核对合同约 ${summary.pendingContractCount} 份（模块内判断）`,
    suggestedAction: '抽样核对「签署 ↔ 资产开通」',
    impactScope: '履约与合规风险',
    ownerRole: '店长',
    statusLabel: '待处理（模块内展示）',
  },
];
