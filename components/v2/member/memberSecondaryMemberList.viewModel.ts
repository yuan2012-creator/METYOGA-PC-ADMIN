export type MemberListRiskLevel = 'P0' | 'P1' | 'P2' | 'normal';

export type MemberListActiveStatus =
  | 'active'
  | 'inactive'
  | 'lowFrequency'
  | 'renewalWindow'
  | 'sleeping'
  | 'highBalanceLowConsumption'
  | 'refundRisk'
  | 'newMemberNotActivated';

export type MemberListFollowUpStatus = 'pending' | 'inProgress' | 'completed' | 'notRequired';

export type MemberListStageCode = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export interface MemberListSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
  isDanger?: boolean;
}

export interface MemberListFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface MemberListRow {
  memberId: string;
  memberName: string;
  maskedPhone: string;
  store: string;
  memberStage: MemberListStageCode;
  memberStageLabel: string;
  activeStatus: MemberListActiveStatus;
  activeStatusLabel: string;
  cardName: string;
  remainingPoints: number;
  remainingPointsLabel: string;
  expiryDate: string;
  lastVisitDate: string;
  nextBookingDate: string;
  assignedCoach: string;
  assignedStaff: string;
  riskLevel: MemberListRiskLevel;
  riskTags: string[];
  followUpStatus: MemberListFollowUpStatus;
  followUpStatusLabel: string;
  suggestedAction: string;
  latestFollowUp: string;
  pointsBalance: number;
  pointsBalanceLabel: string;
  refundRisk: boolean;
  daysSinceLastVisit: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberListPageMeta {
  title: string;
  subtitle: string;
  breadcrumbParent: string;
  breadcrumbCurrent: string;
  scopeLabel: string;
  description: string;
  exportToast: string;
}

export interface MemberListBatchActions {
  assignOwnerToast: string;
  markFollowedToast: string;
}

export interface MemberListSnapshot {
  meta: MemberListPageMeta;
  summaryItems: MemberListSummaryItem[];
  filterOptions: MemberListFilterOption[];
  rows: MemberListRow[];
  batchActions: MemberListBatchActions;
}

const ACTIVE_STATUS_LABELS: Record<MemberListActiveStatus, string> = {
  active: '活跃',
  inactive: '不活跃',
  lowFrequency: '低频',
  renewalWindow: '续费窗口',
  sleeping: '沉睡',
  highBalanceLowConsumption: '高余额低耗课',
  refundRisk: '退费风险',
  newMemberNotActivated: '新会员未激活',
};

const FOLLOW_UP_STATUS_LABELS: Record<MemberListFollowUpStatus, string> = {
  pending: '待跟进',
  inProgress: '跟进中',
  completed: '已跟进',
  notRequired: '无需跟进',
};

const STAGE_LABELS: Record<MemberListStageCode, string> = {
  S0: 'S0 新成交',
  S1: 'S1 激活中',
  S2: 'S2 稳定练习',
  S3: 'S3 高活跃',
  S4: 'S4 续费窗口',
  S5: 'S5 沉睡预警',
  S6: 'S6 流失风险',
};

const RISK_SORT: Record<MemberListRiskLevel, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  normal: 3,
};

const RAW_ROWS: MemberListRow[] = [
  {
    memberId: 'km-3',
    memberName: '陈雨',
    maskedPhone: '135****2109',
    store: '滨江馆',
    memberStage: 'S1',
    memberStageLabel: STAGE_LABELS.S1,
    activeStatus: 'newMemberNotActivated',
    activeStatusLabel: ACTIVE_STATUS_LABELS.newMemberNotActivated,
    cardName: '体验待转化',
    remainingPoints: 0,
    remainingPointsLabel: '—',
    expiryDate: '不适用',
    lastVisitDate: '2026-06-25',
    nextBookingDate: '未预约',
    assignedCoach: '—',
    assignedStaff: '林敏',
    riskLevel: 'P0',
    riskTags: ['体验后待转化', '48h 内需跟进'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '今日 18:00 前电话回访体验感受',
    latestFollowUp: '尚未完成回访',
    pointsBalance: 0,
    pointsBalanceLabel: '0 分',
    refundRisk: false,
    daysSinceLastVisit: 2,
    createdAt: '2026-06-24',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'km-2',
    memberName: '许倩',
    maskedPhone: '136****8810',
    store: '滨江馆',
    memberStage: 'S4',
    memberStageLabel: STAGE_LABELS.S4,
    activeStatus: 'highBalanceLowConsumption',
    activeStatusLabel: ACTIVE_STATUS_LABELS.highBalanceLowConsumption,
    cardName: '天选卡',
    remainingPoints: 96,
    remainingPointsLabel: '96 点',
    expiryDate: '2027-03-15',
    lastVisitDate: '2026-06-05',
    nextBookingDate: '未预约',
    assignedCoach: 'Mia',
    assignedStaff: '周航',
    riskLevel: 'P0',
    riskTags: ['高余额低耗课', '21 天未到店'],
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.inProgress,
    suggestedAction: '本周五前确认预约意向，必要时分配老师跟进',
    latestFollowUp: '2026-06-17 微信未回复',
    pointsBalance: 420,
    pointsBalanceLabel: '420 分',
    refundRisk: false,
    daysSinceLastVisit: 21,
    createdAt: '2025-11-08',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-7',
    memberName: '周宁',
    maskedPhone: '139****5521',
    store: '滨江馆',
    memberStage: 'S6',
    memberStageLabel: STAGE_LABELS.S6,
    activeStatus: 'refundRisk',
    activeStatusLabel: ACTIVE_STATUS_LABELS.refundRisk,
    cardName: '锦鲤卡',
    remainingPoints: 68,
    remainingPointsLabel: '68 点',
    expiryDate: '2026-09-30',
    lastVisitDate: '2026-04-12',
    nextBookingDate: '未预约',
    assignedCoach: 'Anna',
    assignedStaff: '周航',
    riskLevel: 'P0',
    riskTags: ['退费倾向', '沟通记录异常'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '店长介入沟通，核对合同与耗课记录',
    latestFollowUp: '2026-06-20 表达退费意向',
    pointsBalance: 180,
    pointsBalanceLabel: '180 分',
    refundRisk: true,
    daysSinceLastVisit: 75,
    createdAt: '2025-06-15',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-5',
    memberName: '李曼',
    maskedPhone: '133****7782',
    store: '滨江馆',
    memberStage: 'S6',
    memberStageLabel: STAGE_LABELS.S6,
    activeStatus: 'sleeping',
    activeStatusLabel: ACTIVE_STATUS_LABELS.sleeping,
    cardName: '初遇卡',
    remainingPoints: 24,
    remainingPointsLabel: '24 点',
    expiryDate: '2026-07-18',
    lastVisitDate: '2026-03-08',
    nextBookingDate: '未预约',
    assignedCoach: 'Nora',
    assignedStaff: '小乔',
    riskLevel: 'P0',
    riskTags: ['沉睡流失', '临期'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '点对点召回，结合偏好推荐单次体验课',
    latestFollowUp: '2026-05-10 未回复',
    pointsBalance: 60,
    pointsBalanceLabel: '60 分',
    refundRisk: false,
    daysSinceLastVisit: 110,
    createdAt: '2025-09-01',
    updatedAt: '2026-06-25',
  },
  {
    memberId: 'km-4',
    memberName: '何珊',
    maskedPhone: '137****3390',
    store: '滨江馆',
    memberStage: 'S4',
    memberStageLabel: STAGE_LABELS.S4,
    activeStatus: 'renewalWindow',
    activeStatusLabel: ACTIVE_STATUS_LABELS.renewalWindow,
    cardName: '锦鲤卡',
    remainingPoints: 18,
    remainingPointsLabel: '18 点',
    expiryDate: '2026-08-12',
    lastVisitDate: '2026-06-23',
    nextBookingDate: '2026-06-28 普拉提小班',
    assignedCoach: 'Mia',
    assignedStaff: '陈悦',
    riskLevel: 'P1',
    riskTags: ['续费窗口', '近 2 周活跃'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '本周内安排续费沟通，结合练习偏好推荐方案',
    latestFollowUp: '待安排阶段复盘',
    pointsBalance: 1240,
    pointsBalanceLabel: '1,240 分',
    refundRisk: false,
    daysSinceLastVisit: 3,
    createdAt: '2025-04-20',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-4',
    memberName: '赵宁',
    maskedPhone: '131****9044',
    store: '滨江馆',
    memberStage: 'S4',
    memberStageLabel: STAGE_LABELS.S4,
    activeStatus: 'lowFrequency',
    activeStatusLabel: ACTIVE_STATUS_LABELS.lowFrequency,
    cardName: '锦鲤卡',
    remainingPoints: 36,
    remainingPointsLabel: '36 点',
    expiryDate: '2026-11-02',
    lastVisitDate: '2026-05-28',
    nextBookingDate: '未预约',
    assignedCoach: 'Anna',
    assignedStaff: '小乔',
    riskLevel: 'P1',
    riskTags: ['低频', '近 30 天未到店'],
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.inProgress,
    suggestedAction: '结合晚课偏好做点对点邀约',
    latestFollowUp: '2026-06-18 已发送课程推荐',
    pointsBalance: 320,
    pointsBalanceLabel: '320 分',
    refundRisk: false,
    daysSinceLastVisit: 29,
    createdAt: '2025-08-12',
    updatedAt: '2026-06-24',
  },
  {
    memberId: 'ml-8',
    memberName: '林可',
    maskedPhone: '132****6610',
    store: '滨江馆',
    memberStage: 'S2',
    memberStageLabel: STAGE_LABELS.S2,
    activeStatus: 'newMemberNotActivated',
    activeStatusLabel: ACTIVE_STATUS_LABELS.newMemberNotActivated,
    cardName: '初遇卡',
    remainingPoints: 39,
    remainingPointsLabel: '39 点',
    expiryDate: '2027-01-15',
    lastVisitDate: '2026-06-19',
    nextBookingDate: '未预约',
    assignedCoach: 'Anna',
    assignedStaff: '林敏',
    riskLevel: 'P1',
    riskTags: ['新成交未形成稳定频率'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '确认首次稳定预约时间',
    latestFollowUp: '2026-06-20 成交后首次到店',
    pointsBalance: 120,
    pointsBalanceLabel: '120 分',
    refundRisk: false,
    daysSinceLastVisit: 7,
    createdAt: '2026-06-18',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-9',
    memberName: '孙悦',
    maskedPhone: '158****2237',
    store: '滨江馆',
    memberStage: 'S4',
    memberStageLabel: STAGE_LABELS.S4,
    activeStatus: 'highBalanceLowConsumption',
    activeStatusLabel: ACTIVE_STATUS_LABELS.highBalanceLowConsumption,
    cardName: '天选卡',
    remainingPoints: 72,
    remainingPointsLabel: '72 点',
    expiryDate: '2027-06-01',
    lastVisitDate: '2026-05-15',
    nextBookingDate: '未预约',
    assignedCoach: 'Mia',
    assignedStaff: '周航',
    riskLevel: 'P1',
    riskTags: ['高余额低耗课'],
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.inProgress,
    suggestedAction: '安排周末上午普拉提体验',
    latestFollowUp: '2026-06-10 已沟通偏好',
    pointsBalance: 560,
    pointsBalanceLabel: '560 分',
    refundRisk: false,
    daysSinceLastVisit: 42,
    createdAt: '2025-10-05',
    updatedAt: '2026-06-23',
  },
  {
    memberId: 'ml-12',
    memberName: '吴敏',
    maskedPhone: '136****1188',
    store: '滨江馆',
    memberStage: 'S4',
    memberStageLabel: STAGE_LABELS.S4,
    activeStatus: 'renewalWindow',
    activeStatusLabel: ACTIVE_STATUS_LABELS.renewalWindow,
    cardName: '锦鲤卡',
    remainingPoints: 8,
    remainingPointsLabel: '8 点',
    expiryDate: '2026-07-08',
    lastVisitDate: '2026-06-20',
    nextBookingDate: '2026-06-27 流瑜伽',
    assignedCoach: 'Nora',
    assignedStaff: '陈悦',
    riskLevel: 'P1',
    riskTags: ['即将到期', '续费窗口'],
    followUpStatus: 'pending',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.pending,
    suggestedAction: '课后安排续费沟通',
    latestFollowUp: '待课后复盘',
    pointsBalance: 980,
    pointsBalanceLabel: '980 分',
    refundRisk: false,
    daysSinceLastVisit: 6,
    createdAt: '2025-03-10',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-10',
    memberName: '张薇',
    maskedPhone: '137****4455',
    store: '滨江馆',
    memberStage: 'S3',
    memberStageLabel: STAGE_LABELS.S3,
    activeStatus: 'active',
    activeStatusLabel: ACTIVE_STATUS_LABELS.active,
    cardName: '锦鲤卡',
    remainingPoints: 28,
    remainingPointsLabel: '28 点',
    expiryDate: '2026-12-01',
    lastVisitDate: '2026-06-24',
    nextBookingDate: '2026-06-27 基础瑜伽',
    assignedCoach: '陈悦',
    assignedStaff: '小乔',
    riskLevel: 'P2',
    riskTags: ['老师名下会员', '课后反馈待收集'],
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.inProgress,
    suggestedAction: '收集课后反馈并记录',
    latestFollowUp: '2026-06-24 已到店',
    pointsBalance: 240,
    pointsBalanceLabel: '240 分',
    refundRisk: false,
    daysSinceLastVisit: 2,
    createdAt: '2025-07-22',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'km-1',
    memberName: '王静怡',
    maskedPhone: '138****6721',
    store: '滨江馆',
    memberStage: 'S3',
    memberStageLabel: STAGE_LABELS.S3,
    activeStatus: 'active',
    activeStatusLabel: ACTIVE_STATUS_LABELS.active,
    cardName: '锦鲤卡',
    remainingPoints: 42,
    remainingPointsLabel: '42 点',
    expiryDate: '2026-12-20',
    lastVisitDate: '2026-06-16',
    nextBookingDate: '2026-06-27 流瑜伽',
    assignedCoach: 'Anna',
    assignedStaff: '小乔',
    riskLevel: 'normal',
    riskTags: ['腰背不适', '周三晚课活跃'],
    followUpStatus: 'inProgress',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.inProgress,
    suggestedAction: '课后收集老师反馈并记录',
    latestFollowUp: '2026-06-24 提醒老师关注腰背反馈',
    pointsBalance: 860,
    pointsBalanceLabel: '860 分',
    refundRisk: false,
    daysSinceLastVisit: 10,
    createdAt: '2024-11-02',
    updatedAt: '2026-06-26',
  },
  {
    memberId: 'ml-11',
    memberName: '刘畅',
    maskedPhone: '135****9901',
    store: '滨江馆',
    memberStage: 'S3',
    memberStageLabel: STAGE_LABELS.S3,
    activeStatus: 'active',
    activeStatusLabel: ACTIVE_STATUS_LABELS.active,
    cardName: '锦鲤卡',
    remainingPoints: 55,
    remainingPointsLabel: '55 点',
    expiryDate: '2027-02-28',
    lastVisitDate: '2026-06-22',
    nextBookingDate: '2026-06-29 阴瑜伽',
    assignedCoach: 'Nora',
    assignedStaff: '林敏',
    riskLevel: 'normal',
    riskTags: ['积分较高', '稳定活跃'],
    followUpStatus: 'notRequired',
    followUpStatusLabel: FOLLOW_UP_STATUS_LABELS.notRequired,
    suggestedAction: '维持当前练习频率',
    latestFollowUp: '2026-06-20 常规回访完成',
    pointsBalance: 2180,
    pointsBalanceLabel: '2,180 分',
    refundRisk: false,
    daysSinceLastVisit: 4,
    createdAt: '2024-08-15',
    updatedAt: '2026-06-25',
  },
];

export function buildMemberListSnapshot(): MemberListSnapshot {
  const rows = [...RAW_ROWS].sort((a, b) => {
    const riskDiff = RISK_SORT[a.riskLevel] - RISK_SORT[b.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    return b.daysSinceLastVisit - a.daysSinceLastVisit;
  });

  return {
    meta: {
      title: '会员名单',
      subtitle: '按阶段、风险、资产和跟进状态查看会员，并承接会员详情与跟进处理',
      breadcrumbParent: '会员经营',
      breadcrumbCurrent: '会员名单',
      scopeLabel: '滨江馆 · 全部会员 · 店长视角',
      description: '用于筛选、查看和处理会员跟进事项，支持打开会员详情抽屉进行点对点跟进。',
      exportToast: '导出名单（待建设）',
    },
    summaryItems: [
      { id: 'sum-all', label: '全部会员', value: '1,248' },
      { id: 'sum-pending', label: '待跟进', value: '36', isWarning: true },
      { id: 'sum-high', label: '高风险', value: '12', isWarning: true },
      { id: 'sum-new', label: '新成交未激活', value: '8', isWarning: true },
      { id: 'sum-hblc', label: '高余额低耗课', value: '14', isWarning: true },
      { id: 'sum-renewal', label: '续费窗口', value: '21' },
      { id: 'sum-sleep', label: '沉睡 / 流失风险', value: '18', isDanger: true },
    ],
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'store-bj', group: 'store', label: '滨江馆', value: 'binjiang' },
      { id: 'stage-all', group: 'stage', label: '全部阶段', value: 'all' },
      { id: 'stage-s0', group: 'stage', label: 'S0', value: 'S0' },
      { id: 'stage-s1', group: 'stage', label: 'S1', value: 'S1' },
      { id: 'stage-s2', group: 'stage', label: 'S2', value: 'S2' },
      { id: 'stage-s3', group: 'stage', label: 'S3', value: 'S3' },
      { id: 'stage-s4', group: 'stage', label: 'S4', value: 'S4' },
      { id: 'stage-s5', group: 'stage', label: 'S5', value: 'S5' },
      { id: 'stage-s6', group: 'stage', label: 'S6', value: 'S6' },
      { id: 'active-all', group: 'active', label: '全部状态', value: 'all' },
      { id: 'active-active', group: 'active', label: '活跃', value: 'active' },
      { id: 'active-inactive', group: 'active', label: '不活跃', value: 'inactive' },
      { id: 'active-low', group: 'active', label: '低频', value: 'lowFrequency' },
      { id: 'active-renewal', group: 'active', label: '续费窗口', value: 'renewalWindow' },
      { id: 'active-sleep', group: 'active', label: '沉睡', value: 'sleeping' },
      { id: 'active-hblc', group: 'active', label: '高余额低耗课', value: 'highBalanceLowConsumption' },
      { id: 'active-refund', group: 'active', label: '退费风险', value: 'refundRisk' },
      { id: 'active-new', group: 'active', label: '新会员未激活', value: 'newMemberNotActivated' },
      { id: 'risk-all', group: 'risk', label: '全部风险', value: 'all' },
      { id: 'risk-p0', group: 'risk', label: 'P0 高风险', value: 'P0' },
      { id: 'risk-p1', group: 'risk', label: 'P1 需关注', value: 'P1' },
      { id: 'risk-p2', group: 'risk', label: 'P2 观察', value: 'P2' },
      { id: 'owner-all', group: 'owner', label: '全部负责人', value: 'all' },
      { id: 'owner-xq', group: 'owner', label: '小乔', value: 'xiaoqiao' },
      { id: 'owner-zh', group: 'owner', label: '周航', value: 'zhouhang' },
      { id: 'owner-lm', group: 'owner', label: '林敏', value: 'linmin' },
      { id: 'owner-cy', group: 'owner', label: '陈悦', value: 'chenyue' },
      { id: 'card-all', group: 'card', label: '全部卡项', value: 'all' },
      { id: 'card-jinli', group: 'card', label: '锦鲤卡', value: 'jinli' },
      { id: 'card-tianxuan', group: 'card', label: '天选卡', value: 'tianxuan' },
      { id: 'card-chuyu', group: 'card', label: '初遇卡', value: 'chuyu' },
    ],
    rows,
    batchActions: {
      assignOwnerToast: '批量分配负责人（待建设）',
      markFollowedToast: '批量标记已跟进（待建设）',
    },
  };
}

export function getMemberListRiskClass(level: MemberListRiskLevel): string {
  switch (level) {
    case 'P0':
      return 'met-member-list__risk--p0';
    case 'P1':
      return 'met-member-list__risk--p1';
    case 'P2':
      return 'met-member-list__risk--p2';
    default:
      return 'met-member-list__risk--normal';
  }
}

export function getMemberListActiveStatusClass(status: MemberListActiveStatus): string {
  if (
    status === 'refundRisk' ||
    status === 'highBalanceLowConsumption' ||
    status === 'newMemberNotActivated'
  ) {
    return 'met-member-list__status--warning';
  }
  if (status === 'sleeping' || status === 'inactive' || status === 'lowFrequency') {
    return 'met-member-list__status--muted';
  }
  if (status === 'renewalWindow') {
    return 'met-member-list__status--renewal';
  }
  return 'met-member-list__status--active';
}

export function getMemberListFollowUpClass(status: MemberListFollowUpStatus): string {
  switch (status) {
    case 'pending':
      return 'met-member-list__follow--pending';
    case 'inProgress':
      return 'met-member-list__follow--progress';
    case 'completed':
      return 'met-member-list__follow--done';
    default:
      return 'met-member-list__follow--none';
  }
}

export function getMemberListStageClass(stage: MemberListStageCode): string {
  if (stage === 'S5' || stage === 'S6') return 'met-member-list__stage--risk';
  if (stage === 'S4') return 'met-member-list__stage--renewal';
  if (stage === 'S0' || stage === 'S1') return 'met-member-list__stage--new';
  return 'met-member-list__stage--growth';
}
