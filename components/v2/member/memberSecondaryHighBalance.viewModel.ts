export type HighBalanceRiskLevel = 'P0' | 'P1' | 'P2';

export type HighBalanceFollowUpStatus = 'pending' | 'inProgress' | 'completed' | 'notRequired';

export type HighBalanceEvidenceStatus = 'complete' | 'partial' | 'missing';

export interface HighBalanceEvidenceItem {
  key: string;
  label: string;
  status: 'ok' | 'warn' | 'missing';
  statusLabel: string;
}

export interface HighBalanceSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
  isDanger?: boolean;
  note?: string;
}

export interface HighBalanceFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface HighBalanceMemberRow {
  memberId: string;
  memberName: string;
  maskedPhone: string;
  store: string;
  memberStage: string;
  cardName: string;
  remainingPoints: number;
  remainingPointsLabel: string;
  remainingAmountEstimate: string;
  amountEstimateNote: string;
  lastVisitDate: string;
  lastBookingDate: string;
  daysSinceLastVisit: number;
  expiryDate: string;
  assignedCoach: string;
  assignedStaff: string;
  riskLevel: HighBalanceRiskLevel;
  riskReason: string;
  riskTags: string[];
  suggestedAction: string;
  latestFollowUp: string;
  followUpStatus: HighBalanceFollowUpStatus;
  followUpStatusLabel: string;
  evidenceCompleteness: HighBalanceEvidenceStatus;
  evidenceCompletenessLabel: string;
  evidenceItems: HighBalanceEvidenceItem[];
  pointsBalance: number;
  pointsBalanceLabel: string;
  refundRisk: boolean;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HighBalanceHandlingTip {
  id: string;
  text: string;
}

export interface HighBalanceSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    disclaimer: string;
    batchAssignToast: string;
    handlingGuideToast: string;
  };
  summaryItems: HighBalanceSummaryItem[];
  ruleExplanation: {
    title: string;
    rules: string[];
    reminders: string[];
  };
  handlingTips: HighBalanceHandlingTip[];
  filterOptions: HighBalanceFilterOption[];
  rows: HighBalanceMemberRow[];
  batchActions: {
    assignStaffToast: string;
    markPendingToast: string;
    exportToast: string;
  };
}

const FOLLOW_UP_LABELS: Record<HighBalanceFollowUpStatus, string> = {
  pending: '待跟进',
  inProgress: '跟进中',
  completed: '已跟进',
  notRequired: '无需跟进',
};

const EVIDENCE_LABELS: Record<HighBalanceEvidenceStatus, string> = {
  complete: '证据完整',
  partial: '部分缺失',
  missing: '证据不足',
};

const RISK_SORT: Record<HighBalanceRiskLevel, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

function buildEvidence(
  items: Array<{ key: string; label: string; status: 'ok' | 'warn' | 'missing' }>,
): HighBalanceEvidenceItem[] {
  return items.map(item => ({
    ...item,
    statusLabel:
      item.status === 'ok' ? '已具备' : item.status === 'warn' ? '待补充' : '缺失',
  }));
}

const RAW_ROWS: HighBalanceMemberRow[] = [
  {
    memberId: 'hb-1',
    memberName: '钱敏',
    maskedPhone: '139****1180',
    store: '滨江馆',
    memberStage: 'S4 续费窗口',
    cardName: '天选卡',
    remainingPoints: 92,
    remainingPointsLabel: '92 点',
    remainingAmountEstimate: '约 ¥9,200',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-04-25',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 62,
    expiryDate: '2026-07-15',
    assignedCoach: 'Mia',
    assignedStaff: '周航',
    riskLevel: 'P0',
    riskReason: '余额高 + 62 天未到店 + 卡项临期',
    riskTags: ['临期', '高余额低耗课'],
    suggestedAction: '店长先确认风险，管家点对点沟通续练计划',
    latestFollowUp: '2026-06-18 未回复',
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_LABELS.pending,
    evidenceCompleteness: 'partial',
    evidenceCompletenessLabel: EVIDENCE_LABELS.partial,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'warn' },
      { key: 'followup', label: '跟进记录', status: 'warn' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 380,
    pointsBalanceLabel: '380 分',
    refundRisk: false,
    isExpiringSoon: true,
    createdAt: '2025-05-10',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-7',
    memberName: '周宁',
    maskedPhone: '139****5521',
    store: '滨江馆',
    memberStage: 'S6 流失风险',
    cardName: '锦鲤卡',
    remainingPoints: 68,
    remainingPointsLabel: '68 点',
    remainingAmountEstimate: '约 ¥6,800',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-04-12',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 75,
    expiryDate: '2026-09-30',
    assignedCoach: 'Anna',
    assignedStaff: '周航',
    riskLevel: 'P0',
    riskReason: '余额高 + 75 天未到店 + 退费倾向',
    riskTags: ['退费倾向', '沟通异常'],
    suggestedAction: '店长介入沟通，同步财务核对证据链',
    latestFollowUp: '2026-06-20 表达退费意向',
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_LABELS.pending,
    evidenceCompleteness: 'partial',
    evidenceCompletenessLabel: EVIDENCE_LABELS.partial,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'warn' },
      { key: 'followup', label: '跟进记录', status: 'warn' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 180,
    pointsBalanceLabel: '180 分',
    refundRisk: true,
    isExpiringSoon: false,
    createdAt: '2025-06-15',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'hb-3',
    memberName: '唐悦',
    maskedPhone: '137****6623',
    store: '滨江馆',
    memberStage: 'S4 低频风险',
    cardName: '天选卡',
    remainingPoints: 85,
    remainingPointsLabel: '85 点',
    remainingAmountEstimate: '约 ¥8,500',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-04-15',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 72,
    expiryDate: '2027-02-20',
    assignedCoach: 'Mia',
    assignedStaff: '林敏',
    riskLevel: 'P0',
    riskReason: '余额高 + 72 天未到店 + 沟通记录异常',
    riskTags: ['沟通异常', '高余额低耗课'],
    suggestedAction: '先核对最近沟通记录，再安排适合课程体验',
    latestFollowUp: '2026-06-05 微信未回复',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'missing',
    evidenceCompletenessLabel: EVIDENCE_LABELS.missing,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'warn' },
      { key: 'checkin', label: '签到记录', status: 'missing' },
      { key: 'followup', label: '跟进记录', status: 'warn' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 290,
    pointsBalanceLabel: '290 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-07-01',
    updatedAt: '2026-06-25',
  },
  {
    memberId: 'km-2',
    memberName: '许倩',
    maskedPhone: '136****8810',
    store: '滨江馆',
    memberStage: 'S4 低频风险',
    cardName: '天选卡',
    remainingPoints: 96,
    remainingPointsLabel: '96 点',
    remainingAmountEstimate: '约 ¥9,600',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-06-05',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 21,
    expiryDate: '2027-03-15',
    assignedCoach: 'Mia',
    assignedStaff: '周航',
    riskLevel: 'P1',
    riskReason: '余额高 + 21 天未到店',
    riskTags: ['高余额低耗课', '周末上午偏好'],
    suggestedAction: '安排周末上午普拉提，点对点邀约',
    latestFollowUp: '2026-06-17 微信未回复',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'complete',
    evidenceCompletenessLabel: EVIDENCE_LABELS.complete,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 420,
    pointsBalanceLabel: '420 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-11-08',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-9',
    memberName: '孙悦',
    maskedPhone: '158****2237',
    store: '滨江馆',
    memberStage: 'S4 续费窗口',
    cardName: '天选卡',
    remainingPoints: 72,
    remainingPointsLabel: '72 点',
    remainingAmountEstimate: '约 ¥7,200',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-05-15',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 42,
    expiryDate: '2027-06-01',
    assignedCoach: 'Mia',
    assignedStaff: '周航',
    riskLevel: 'P1',
    riskReason: '余额高 + 42 天未到店',
    riskTags: ['高余额低耗课'],
    suggestedAction: '安排周末上午普拉提体验',
    latestFollowUp: '2026-06-10 已沟通偏好',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'complete',
    evidenceCompletenessLabel: EVIDENCE_LABELS.complete,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 560,
    pointsBalanceLabel: '560 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-10-05',
    updatedAt: '2026-06-23',
  },
  {
    memberId: 'hb-5',
    memberName: '郭晨',
    maskedPhone: '136****7702',
    store: '滨江馆',
    memberStage: 'S2 稳定练习',
    cardName: '私教包',
    remainingPoints: 54,
    remainingPointsLabel: '54 点',
    remainingAmountEstimate: '约 ¥10,800',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-05-22',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 35,
    expiryDate: '2026-12-30',
    assignedCoach: 'Mia',
    assignedStaff: '林敏',
    riskLevel: 'P1',
    riskReason: '私教包余额高 + 新私教未激活',
    riskTags: ['私教未激活', '高余额低耗课'],
    suggestedAction: '确认私教时段偏好，安排首次稳定预约',
    latestFollowUp: '2026-06-12 待确认时段',
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_LABELS.pending,
    evidenceCompleteness: 'partial',
    evidenceCompletenessLabel: EVIDENCE_LABELS.partial,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'warn' },
      { key: 'checkin', label: '签到记录', status: 'warn' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 150,
    pointsBalanceLabel: '150 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2026-03-01',
    updatedAt: '2026-06-24',
  },
  {
    memberId: 'hb-6',
    memberName: '沈岚',
    maskedPhone: '135****4418',
    store: '滨江馆',
    memberStage: 'S3 高活跃',
    cardName: '锦鲤卡',
    remainingPoints: 78,
    remainingPointsLabel: '78 点',
    remainingAmountEstimate: '约 ¥7,800',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-05-18',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 39,
    expiryDate: '2027-04-10',
    assignedCoach: 'Nora',
    assignedStaff: '小乔',
    riskLevel: 'P1',
    riskReason: '老师更换后断课，余额仍偏高',
    riskTags: ['老师更换', '高余额低耗课'],
    suggestedAction: '匹配新老师时段，恢复练习节奏',
    latestFollowUp: '2026-06-08 已说明老师调整',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'complete',
    evidenceCompletenessLabel: EVIDENCE_LABELS.complete,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 640,
    pointsBalanceLabel: '640 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-02-18',
    updatedAt: '2026-06-22',
  },
  {
    memberId: 'hb-10',
    memberName: '叶青',
    maskedPhone: '133****9055',
    store: '滨江馆',
    memberStage: 'S4 续费窗口',
    cardName: '锦鲤卡',
    remainingPoints: 62,
    remainingPointsLabel: '62 点',
    remainingAmountEstimate: '约 ¥6,200',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-05-24',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 33,
    expiryDate: '2027-01-20',
    assignedCoach: 'Anna',
    assignedStaff: '陈悦',
    riskLevel: 'P1',
    riskReason: '跨店后练习频率下降，余额仍偏高',
    riskTags: ['跨店低频', '高余额低耗课'],
    suggestedAction: '确认滨江馆练习时段，恢复稳定预约',
    latestFollowUp: '2026-06-14 已确认门店偏好',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'partial',
    evidenceCompletenessLabel: EVIDENCE_LABELS.partial,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'warn' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 310,
    pointsBalanceLabel: '310 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-09-20',
    updatedAt: '2026-06-21',
  },
  {
    memberId: 'ml-4',
    memberName: '赵宁',
    maskedPhone: '131****9044',
    store: '滨江馆',
    memberStage: 'S4 续费窗口',
    cardName: '锦鲤卡',
    remainingPoints: 36,
    remainingPointsLabel: '36 点',
    remainingAmountEstimate: '约 ¥3,600',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-05-28',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 29,
    expiryDate: '2026-11-02',
    assignedCoach: 'Anna',
    assignedStaff: '小乔',
    riskLevel: 'P2',
    riskReason: '余额中等 + 近 30 天低频',
    riskTags: ['低频', '晚课偏好'],
    suggestedAction: '结合晚课偏好做点对点邀约',
    latestFollowUp: '2026-06-18 已发送课程推荐',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'complete',
    evidenceCompletenessLabel: EVIDENCE_LABELS.complete,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 320,
    pointsBalanceLabel: '320 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-08-12',
    updatedAt: '2026-06-24',
  },
  {
    memberId: 'hb-8',
    memberName: '韩露',
    maskedPhone: '138****3371',
    store: '滨江馆',
    memberStage: 'S3 高活跃',
    cardName: '初遇卡',
    remainingPoints: 44,
    remainingPointsLabel: '44 点',
    remainingAmountEstimate: '约 ¥4,400',
    amountEstimateNote: '经营估算，非可退金额',
    lastVisitDate: '2026-06-08',
    lastBookingDate: '未预约',
    daysSinceLastVisit: 18,
    expiryDate: '2027-03-01',
    assignedCoach: 'Anna',
    assignedStaff: '林敏',
    riskLevel: 'P2',
    riskReason: '课程偏好不匹配，练习频率偏低',
    riskTags: ['偏好不匹配', '低频'],
    suggestedAction: '推荐更匹配的低强度课程，不做催促式推销',
    latestFollowUp: '2026-06-15 已了解课程偏好',
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_LABELS.inProgress,
    evidenceCompleteness: 'complete',
    evidenceCompletenessLabel: EVIDENCE_LABELS.complete,
    evidenceItems: buildEvidence([
      { key: 'asset', label: '会员资产', status: 'ok' },
      { key: 'purchase', label: '购买记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'followup', label: '跟进记录', status: 'ok' },
      { key: 'contract', label: '合同条款', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
    ]),
    pointsBalance: 1280,
    pointsBalanceLabel: '1,280 分',
    refundRisk: false,
    isExpiringSoon: false,
    createdAt: '2025-11-20',
    updatedAt: '2026-06-20',
  },
];

export function buildHighBalanceSnapshot(): HighBalanceSnapshot {
  const rows = [...RAW_ROWS].sort((a, b) => {
    const riskDiff = RISK_SORT[a.riskLevel] - RISK_SORT[b.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    if (b.daysSinceLastVisit !== a.daysSinceLastVisit) {
      return b.daysSinceLastVisit - a.daysSinceLastVisit;
    }
    if (b.remainingPoints !== a.remainingPoints) {
      return b.remainingPoints - a.remainingPoints;
    }
    return a.isExpiringSoon === b.isExpiringSoon ? 0 : a.isExpiringSoon ? -1 : 1;
  });

  return {
    meta: {
      title: '高余额低耗课会员名单',
      subtitle: '优先处理已付费但长期低耗课会员，降低预收负债压力，提升交付和会员体验',
      breadcrumbParent: '会员经营',
      breadcrumbCurrent: '高余额低耗课',
      scopeLabel: '滨江馆 · 高余额低耗课 · 店长视角',
      description:
        '用于识别已付费但长期低耗课会员，恢复练习节奏、完成服务交付、降低纠纷风险。邀约必须点对点，不做群发。',
      disclaimer:
        '余额估算仅用于经营风险判断，不代表可退金额；赠送权益不计入可退金额；积分不等同现金。',
      batchAssignToast: '批量分配跟进（待建设）',
      handlingGuideToast: '查看处理口径（待建设）',
    },
    summaryItems: [
      { id: 'sum-total', label: '风险会员', value: '14 人' },
      { id: 'sum-p0', label: 'P0 高风险', value: '4 人', isDanger: true },
      { id: 'sum-p1', label: 'P1 需关注', value: '6 人', isWarning: true },
      { id: 'sum-p2', label: 'P2 观察', value: '4 人' },
      {
        id: 'sum-points',
        label: '剩余点数合计',
        value: '1,286 点',
        note: '非可退金额',
        isWarning: true,
      },
      { id: 'sum-days', label: '平均未到店', value: '47 天' },
      { id: 'sum-done', label: '本周已处理', value: '5 人' },
    ],
    ruleExplanation: {
      title: '高余额低耗课如何判断？',
      rules: [
        'P0：余额高 + 60 天未到店 + 临期 / 退费倾向',
        'P1：余额高 + 30 天未到店',
        'P2：余额中等 + 低频',
        '处理目标不是催促消费，而是恢复练习节奏、完成服务交付、降低纠纷风险',
      ],
      reminders: [
        '剩余金额为经营估算，不等于退款金额',
        '赠送权益不计入退费',
        '积分不等同现金',
        '邀约必须点对点，不做群发',
      ],
    },
    handlingTips: [
      {
        id: 'tip-1',
        text: 'P0 会员由店长先确认风险，再分配管家点对点沟通',
      },
      {
        id: 'tip-2',
        text: '余额高但未临期会员优先安排适合课程，不直接提退费',
      },
      {
        id: 'tip-3',
        text: '已出现退费倾向的会员需同步财务证据链，避免口径不一致',
      },
    ],
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'store-bj', group: 'store', label: '滨江馆', value: 'binjiang' },
      { id: 'risk-all', group: 'risk', label: '全部', value: 'all' },
      { id: 'risk-p0', group: 'risk', label: 'P0', value: 'P0' },
      { id: 'risk-p1', group: 'risk', label: 'P1', value: 'P1' },
      { id: 'risk-p2', group: 'risk', label: 'P2', value: 'P2' },
      { id: 'days-all', group: 'days', label: '全部', value: 'all' },
      { id: 'days-30', group: 'days', label: '30 天以上', value: '30' },
      { id: 'days-60', group: 'days', label: '60 天以上', value: '60' },
      { id: 'days-90', group: 'days', label: '90 天以上', value: '90' },
      { id: 'points-all', group: 'points', label: '全部', value: 'all' },
      { id: 'points-30', group: 'points', label: '30 点以上', value: '30' },
      { id: 'points-50', group: 'points', label: '50 点以上', value: '50' },
      { id: 'points-80', group: 'points', label: '80 点以上', value: '80' },
      { id: 'card-all', group: 'card', label: '全部卡项', value: 'all' },
      { id: 'card-jinli', group: 'card', label: '锦鲤卡', value: 'jinli' },
      { id: 'card-tianxuan', group: 'card', label: '天选卡', value: 'tianxuan' },
      { id: 'card-private', group: 'card', label: '私教包', value: 'private' },
      { id: 'owner-all', group: 'owner', label: '全部负责人', value: 'all' },
      { id: 'owner-zh', group: 'owner', label: '周航', value: 'zhouhang' },
      { id: 'owner-lm', group: 'owner', label: '林敏', value: 'linmin' },
      { id: 'follow-all', group: 'follow', label: '全部状态', value: 'all' },
      { id: 'follow-pending', group: 'follow', label: '待跟进', value: 'pending' },
      { id: 'follow-progress', group: 'follow', label: '跟进中', value: 'inProgress' },
    ],
    rows,
    batchActions: {
      assignStaffToast: '批量分配管家（待建设）',
      markPendingToast: '批量标记待跟进（待建设）',
      exportToast: '批量导出名单（待建设）',
    },
  };
}

export function getHighBalanceRiskClass(level: HighBalanceRiskLevel): string {
  switch (level) {
    case 'P0':
      return 'met-hblc__risk--p0';
    case 'P1':
      return 'met-hblc__risk--p1';
    case 'P2':
      return 'met-hblc__risk--p2';
    default:
      return '';
  }
}

export function getHighBalanceFollowUpClass(status: HighBalanceFollowUpStatus): string {
  switch (status) {
    case 'pending':
      return 'met-hblc__follow--pending';
    case 'inProgress':
      return 'met-hblc__follow--progress';
    case 'completed':
      return 'met-hblc__follow--done';
    default:
      return 'met-hblc__follow--none';
  }
}

export function getHighBalanceEvidenceClass(status: HighBalanceEvidenceStatus): string {
  switch (status) {
    case 'complete':
      return 'met-hblc__evidence--complete';
    case 'partial':
      return 'met-hblc__evidence--partial';
    case 'missing':
      return 'met-hblc__evidence--missing';
    default:
      return '';
  }
}

export function getHighBalanceEvidenceDotClass(status: 'ok' | 'warn' | 'missing'): string {
  switch (status) {
    case 'ok':
      return 'is-ok';
    case 'warn':
      return 'is-warn';
    default:
      return 'is-missing';
  }
}
