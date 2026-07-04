export type MemberV2SuggestionSource = 'system_rule' | 'pending_config';

export type MemberV2LifecycleCode = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export type MemberV2LifecycleZone = 'growth' | 'risk';

export type MemberV2MatchLevel = 'high' | 'medium' | 'low';

export type MemberV2RiskPriority = 'P0' | 'P1' | 'P2';

export type MemberV2HighlightTone = 'service' | 'renewal' | 'recall' | 'opportunity';

export type MemberV2DimensionTone = 'neutral' | 'positive';

export interface MemberV2PageMeta {
  title: string;
  subtitle: string;
  filters: {
    storeLabel: string;
    stageLabel: string;
    ownerLabel: string;
    riskLabel: string;
    primaryActionLabel: string;
    memberListLabel: string;
  };
}

export type MemberV2LifecycleRiskVariant = 's4' | 's5' | 's6';

export interface MemberV2LifecycleStage {
  id: string;
  code: MemberV2LifecycleCode;
  name: string;
  count: number;
  weeklyChange: string;
  weeklyChangeUp: boolean;
  coreAction: string;
  zone: MemberV2LifecycleZone;
  riskVariant?: MemberV2LifecycleRiskVariant;
}

export interface MemberV2LifecycleFlow {
  title: string;
  subtitle: string;
  riskFocusNote?: string;
  stages: MemberV2LifecycleStage[];
}

export type MemberOperationStatus = 'healthy' | 'watch' | 'warning' | 'highRisk';

export interface MemberOperationEvidenceItem {
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface MemberOperationSummary {
  status: MemberOperationStatus;
  statusLabel: string;
  headline: string;
  conclusion: string;
  impactTags: string[];
  sourceLabel: string;
  updatedAt: string;
  evidenceItems: MemberOperationEvidenceItem[];
  evidenceButtonLabel: string;
  evidenceToastMessage: string;
}

export interface MemberPriorityAction {
  id: string;
  priority: MemberV2RiskPriority;
  title: string;
  impact: string;
  owner: string;
  sourceModules: string[];
  suggestedAction: string;
  ctaLabel: string;
  ctaToast: string;
  opensMemberList?: boolean;
}

export interface MemberPriorityActionsSection {
  title: string;
  subtitle: string;
  items: MemberPriorityAction[];
}

export interface MemberQueueSummaryItem {
  id: string;
  priority: MemberV2RiskPriority;
  title: string;
  count: number;
  representativeMembers: string;
  suggestedAction: string;
  ctaLabel: string;
  ctaToast: string;
}

export interface MemberServiceSalesQueuesSection {
  title: string;
  subtitle: string;
  serviceTitle: string;
  salesTitle: string;
  serviceItems: MemberQueueSummaryItem[];
  salesItems: MemberQueueSummaryItem[];
  serviceViewAllLabel: string;
  serviceViewAllKey: string;
  salesViewAllLabel: string;
  salesViewAllKey: string;
}

export interface MemberV2AttentionHighlight {
  id: string;
  label: string;
  count: number;
  note: string;
  typeLabel: string;
  actionLabel: string;
  tone: MemberV2HighlightTone;
  secondaryKey: string;
  matchPreviewPackId?: string;
}

export interface MemberV2AttentionHighlights {
  title: string;
  subtitle: string;
  items: MemberV2AttentionHighlight[];
}

export interface MemberV2QueueSummaryStat {
  label: string;
  value: string;
}

export interface MemberV2ServiceTopTask {
  id: string;
  memberName: string;
  stageCode: string;
  mainTag: string;
  triggerReason: string;
  owner: string;
  deadline: string;
  actionLabel: string;
}

export interface MemberV2ServiceQueueSection {
  title: string;
  subtitle: string;
  summary: MemberV2QueueSummaryStat[];
  topTasks: MemberV2ServiceTopTask[];
  viewAllLabel: string;
  viewAllKey: string;
}

export interface MemberV2SalesTopTask {
  id: string;
  name: string;
  stageCode: string;
  mainTag: string;
  triggerReason: string;
  owner: string;
  deadline: string;
  actionLabel: string;
}

export interface MemberV2SalesQueueSection {
  title: string;
  subtitle: string;
  summary: MemberV2QueueSummaryStat[];
  topTasks: MemberV2SalesTopTask[];
  viewAllLabel: string;
  viewAllKey: string;
}

export interface MemberV2MatchDimension {
  key: string;
  label: string;
  level: MemberV2MatchLevel;
  tone?: MemberV2DimensionTone;
}

export interface MemberV2AudienceMatchPack {
  id: string;
  title: string;
  scene: string;
  recommendedCount: number;
  highMatchCount: number;
  suggestionSource: MemberV2SuggestionSource;
  suggestionSourceLabel: string;
  dimensions: MemberV2MatchDimension[];
  excludeTags: string[];
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  previewId: string;
}

export interface MemberV2AudienceMatchPreviewStat {
  label: string;
  value: string;
}

export interface MemberV2AudienceCandidate {
  id: string;
  name: string;
  stage: string;
  matchLevel: string;
  assetSummary: string;
  lastVisit: string;
  preferredStore: string;
  recommendedTouch: string;
  matchReasons: string[];
  touchStatus: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

export interface MemberV2AudienceExcludedReason {
  label: string;
  count: number;
}

export interface MemberV2AudienceMatchPreview {
  id: string;
  title: string;
  subtitle: string;
  suggestionSource: MemberV2SuggestionSource;
  suggestionSourceLabel: string;
  stats: MemberV2AudienceMatchPreviewStat[];
  ruleTags: string[];
  candidates: MemberV2AudienceCandidate[];
  excludedSummary: string;
  excludedReasons: MemberV2AudienceExcludedReason[];
}

export interface MemberV2AudienceMatchPacksSection {
  title: string;
  subtitle: string;
  packs: MemberV2AudienceMatchPack[];
}

export interface MemberV2RiskGraphItem {
  id: string;
  title: string;
  count: number;
  priority: MemberV2RiskPriority;
  fact: string;
  actionLabel: string;
  suggestionSource: MemberV2SuggestionSource;
  suggestionSourceLabel: string;
  bubbleScale: number;
}

export interface MemberV2RiskGraphSection {
  title: string;
  subtitle: string;
  replayNote?: string;
  items: MemberV2RiskGraphItem[];
}

export interface MemberV2KeyMemberEntrance {
  id: string;
  name: string;
  stageLabel: string;
  mainTag: string;
  assetSummary: string;
  recentAction: string;
  detailActionLabel: string;
  followActionLabel: string;
}

export interface MemberV2KeyMemberEntrancesSection {
  title: string;
  subtitle: string;
  members: MemberV2KeyMemberEntrance[];
  viewAllLabel: string;
  viewAllKey: string;
}

export interface MemberV2SecondaryEntrance {
  key: string;
  label: string;
}

export interface MemberV2MemberDetail {
  id: string;
  name: string;
  phoneMasked: string;
  stageLabel: string;
  owner: string;
  frequentStore: string;
  tagSummary: string[];
  mainCard: string;
  remaining: string;
  validUntil: string;
  bonusBenefits: string;
  pointsBalance: string;
  contractStatus: string;
  favoriteCourses: string;
  favoriteTeachers: string;
  favoriteTimes: string;
  intensityPreference: string;
  bodyNotes: string;
  lastFollowUp: string;
  followUpOwner: string;
  followUpResult: string;
  nextPlan: string;
  riskTrigger: string;
  riskFact: string;
  riskSourceLabel: string;
  riskHandleStatus: string;
}

export interface MemberV2Snapshot {
  meta: MemberV2PageMeta;
  memberOperationSummary: MemberOperationSummary;
  memberPriorityActions: MemberPriorityActionsSection;
  serviceSalesQueues: MemberServiceSalesQueuesSection;
  lifecycleFlow: MemberV2LifecycleFlow;
  attentionHighlights: MemberV2AttentionHighlights;
  serviceQueue: MemberV2ServiceQueueSection;
  salesQueue: MemberV2SalesQueueSection;
  audienceMatchPacks: MemberV2AudienceMatchPacksSection;
  audienceMatchPreviews: Record<string, MemberV2AudienceMatchPreview>;
  riskGraph: MemberV2RiskGraphSection;
  keyMemberEntrances: MemberV2KeyMemberEntrancesSection;
  secondaryEntrances: MemberV2SecondaryEntrance[];
  drawerMemberDetails: Record<string, MemberV2MemberDetail>;
}

const DRAWER_DETAILS: Record<string, MemberV2MemberDetail> = {
  'km-1': {
    id: 'km-1',
    name: '王静怡',
    phoneMasked: '138****6721',
    stageLabel: 'S3 稳定活跃',
    owner: '小乔',
    frequentStore: '滨江馆',
    tagSummary: ['腰背不适', '偏好低强度', '滨江馆常客', '周三晚课活跃'],
    mainCard: '锦鲤卡',
    remaining: '42 点',
    validUntil: '2026-12-20',
    bonusBenefits: '赠送小班 2 节',
    pointsBalance: '860 分',
    contractStatus: '已签署',
    favoriteCourses: '流瑜伽、阴瑜伽',
    favoriteTeachers: 'Anna、Nora',
    favoriteTimes: '周三 / 周五 晚课',
    intensityPreference: '低中强度',
    bodyNotes: '腰背不适，避免深度后弯',
    lastFollowUp: '2026-06-24 提醒老师关注腰背反馈',
    followUpOwner: '前台 · 小乔',
    followUpResult: '已同步至今晚课程名单',
    nextPlan: '课后收集老师反馈并记录',
    riskTrigger: '身体标签提醒',
    riskFact: '今晚 18:30 流瑜伽到店，需老师关注腰背反馈',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待课后确认',
  },
  'km-2': {
    id: 'km-2',
    name: '许倩',
    phoneMasked: '136****8810',
    stageLabel: 'S4 低频风险',
    owner: '周航',
    frequentStore: '滨江馆',
    tagSummary: ['高余额低耗课', '天选卡', '近 21 天未到店'],
    mainCard: '天选卡',
    remaining: '96 点',
    validUntil: '2027-03-15',
    bonusBenefits: '无',
    pointsBalance: '420 分',
    contractStatus: '已签署',
    favoriteCourses: '普拉提小班、流瑜伽',
    favoriteTeachers: 'Mia',
    favoriteTimes: '周末上午',
    intensityPreference: '中强度',
    bodyNotes: '无特殊限制',
    lastFollowUp: '2026-06-17 微信未回复',
    followUpOwner: '管家 · 周航',
    followUpResult: '未回复',
    nextPlan: '本周五前电话确认预约意向',
    riskTrigger: '高余额低耗课',
    riskFact: '剩余 96 点，近 30 天耗课 ≤ 2 次',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '跟进中',
  },
  'km-3': {
    id: 'km-3',
    name: '陈雨',
    phoneMasked: '135****2109',
    stageLabel: 'S1 体验待转化',
    owner: '林敏',
    frequentStore: '滨江馆',
    tagSummary: ['48h 内需跟进', '体验后待转化', '意向普拉提小班'],
    mainCard: '暂无',
    remaining: '体验后待转化',
    validUntil: '不适用',
    bonusBenefits: '体验课 1 节',
    pointsBalance: '0 分',
    contractStatus: '未签署',
    favoriteCourses: '普拉提小班（体验）',
    favoriteTeachers: 'Mia',
    favoriteTimes: '工作日傍晚',
    intensityPreference: '中强度',
    bodyNotes: '暂无',
    lastFollowUp: '尚未完成回访',
    followUpOwner: '销售 · 林敏',
    followUpResult: '待跟进',
    nextPlan: '今日 18:00 前电话回访体验感受',
    riskTrigger: '体验后待跟进',
    riskFact: '昨日体验后未回访，超过 24h',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待处理',
  },
  'km-4': {
    id: 'km-4',
    name: '何珊',
    phoneMasked: '137****3390',
    stageLabel: 'S5 续费窗口',
    owner: '陈悦',
    frequentStore: '滨江馆',
    tagSummary: ['续费窗口', '近 2 周活跃', '偏好普拉提'],
    mainCard: '锦鲤卡',
    remaining: '18 点',
    validUntil: '2026-08-12',
    bonusBenefits: '赠送积分 200',
    pointsBalance: '1,240 分',
    contractStatus: '已签署',
    favoriteCourses: '普拉提小班',
    favoriteTeachers: 'Mia',
    favoriteTimes: '周五晚课',
    intensityPreference: '中高强度',
    bodyNotes: '无',
    lastFollowUp: '待安排阶段复盘',
    followUpOwner: '管家 · 陈悦',
    followUpResult: '待安排',
    nextPlan: '本周内安排续费沟通',
    riskTrigger: '续费窗口',
    riskFact: '剩余 18 点，近 2 周活跃，进入续费窗口',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待安排',
  },
  'ml-4': {
    id: 'ml-4',
    name: '赵宁',
    phoneMasked: '131****9044',
    stageLabel: 'S4 续费窗口',
    owner: '小乔',
    frequentStore: '滨江馆',
    tagSummary: ['低频', '近 30 天未到店', '晚课偏好'],
    mainCard: '锦鲤卡',
    remaining: '36 点',
    validUntil: '2026-11-02',
    bonusBenefits: '无',
    pointsBalance: '320 分',
    contractStatus: '已签署',
    favoriteCourses: '流瑜伽、阴瑜伽',
    favoriteTeachers: 'Anna',
    favoriteTimes: '周三 / 周四 晚课',
    intensityPreference: '低中强度',
    bodyNotes: '无',
    lastFollowUp: '2026-06-18 已发送课程推荐',
    followUpOwner: '前台 · 小乔',
    followUpResult: '待回复',
    nextPlan: '结合晚课偏好做点对点邀约',
    riskTrigger: '低频风险',
    riskFact: '近 30 天未到店，剩余 36 点',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '跟进中',
  },
  'ml-5': {
    id: 'ml-5',
    name: '李曼',
    phoneMasked: '133****7782',
    stageLabel: 'S6 流失风险',
    owner: '小乔',
    frequentStore: '滨江馆',
    tagSummary: ['沉睡流失', '临期', '阴瑜伽偏好'],
    mainCard: '初遇卡',
    remaining: '24 点',
    validUntil: '2026-07-18',
    bonusBenefits: '无',
    pointsBalance: '60 分',
    contractStatus: '已签署',
    favoriteCourses: '阴瑜伽',
    favoriteTeachers: 'Nora',
    favoriteTimes: '周末上午',
    intensityPreference: '低强度',
    bodyNotes: '无',
    lastFollowUp: '2026-05-10 未回复',
    followUpOwner: '前台 · 小乔',
    followUpResult: '未回复',
    nextPlan: '点对点召回，推荐单次体验课',
    riskTrigger: '沉睡流失',
    riskFact: '110 天未到店，卡项临期',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待处理',
  },
  'ml-7': {
    id: 'ml-7',
    name: '周宁',
    phoneMasked: '139****5521',
    stageLabel: 'S6 流失风险',
    owner: '周航',
    frequentStore: '滨江馆',
    tagSummary: ['退费倾向', '沟通记录异常'],
    mainCard: '锦鲤卡',
    remaining: '68 点',
    validUntil: '2026-09-30',
    bonusBenefits: '赠送小班 1 节',
    pointsBalance: '180 分',
    contractStatus: '已签署',
    favoriteCourses: '基础瑜伽',
    favoriteTeachers: 'Anna',
    favoriteTimes: '工作日中午',
    intensityPreference: '低强度',
    bodyNotes: '无',
    lastFollowUp: '2026-06-20 表达退费意向',
    followUpOwner: '管家 · 周航',
    followUpResult: '待店长介入',
    nextPlan: '核对合同与耗课记录后沟通',
    riskTrigger: '退费风险',
    riskFact: '75 天未到店，近期表达退费意向',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待处理',
  },
  'ml-8': {
    id: 'ml-8',
    name: '林可',
    phoneMasked: '132****6610',
    stageLabel: 'S2 稳定练习',
    owner: '林敏',
    frequentStore: '滨江馆',
    tagSummary: ['新成交', '待形成稳定频率'],
    mainCard: '初遇卡',
    remaining: '39 点',
    validUntil: '2027-01-15',
    bonusBenefits: '无',
    pointsBalance: '120 分',
    contractStatus: '已签署',
    favoriteCourses: '流瑜伽',
    favoriteTeachers: 'Anna',
    favoriteTimes: '工作日傍晚',
    intensityPreference: '中强度',
    bodyNotes: '无',
    lastFollowUp: '2026-06-20 成交后首次到店',
    followUpOwner: '销售 · 林敏',
    followUpResult: '待确认下次预约',
    nextPlan: '确认首次稳定预约时间',
    riskTrigger: '新成交未激活',
    riskFact: '成交后仅到店 1 次，未形成稳定频率',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待处理',
  },
  'ml-9': {
    id: 'ml-9',
    name: '孙悦',
    phoneMasked: '158****2237',
    stageLabel: 'S4 续费窗口',
    owner: '周航',
    frequentStore: '滨江馆',
    tagSummary: ['高余额低耗课', '周末上午偏好'],
    mainCard: '天选卡',
    remaining: '72 点',
    validUntil: '2027-06-01',
    bonusBenefits: '无',
    pointsBalance: '560 分',
    contractStatus: '已签署',
    favoriteCourses: '普拉提小班',
    favoriteTeachers: 'Mia',
    favoriteTimes: '周六上午',
    intensityPreference: '中强度',
    bodyNotes: '无',
    lastFollowUp: '2026-06-10 已沟通偏好',
    followUpOwner: '管家 · 周航',
    followUpResult: '待预约',
    nextPlan: '安排周末上午普拉提体验',
    riskTrigger: '高余额低耗课',
    riskFact: '剩余 72 点，42 天未到店',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '跟进中',
  },
  'ml-10': {
    id: 'ml-10',
    name: '张薇',
    phoneMasked: '137****4455',
    stageLabel: 'S3 高活跃',
    owner: '小乔',
    frequentStore: '滨江馆',
    tagSummary: ['老师名下会员', '课后反馈待收集'],
    mainCard: '锦鲤卡',
    remaining: '28 点',
    validUntil: '2026-12-01',
    bonusBenefits: '无',
    pointsBalance: '240 分',
    contractStatus: '已签署',
    favoriteCourses: '基础瑜伽',
    favoriteTeachers: '陈悦',
    favoriteTimes: '周四晚课',
    intensityPreference: '中强度',
    bodyNotes: '肩颈紧张',
    lastFollowUp: '2026-06-24 已到店',
    followUpOwner: '前台 · 小乔',
    followUpResult: '待收集课后反馈',
    nextPlan: '收集老师反馈并记录',
    riskTrigger: '服务跟进',
    riskFact: '课后反馈待收集',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '跟进中',
  },
  'ml-11': {
    id: 'ml-11',
    name: '刘畅',
    phoneMasked: '135****9901',
    stageLabel: 'S3 高活跃',
    owner: '林敏',
    frequentStore: '滨江馆',
    tagSummary: ['积分较高', '稳定活跃'],
    mainCard: '锦鲤卡',
    remaining: '55 点',
    validUntil: '2027-02-28',
    bonusBenefits: '赠送积分 100',
    pointsBalance: '2,180 分',
    contractStatus: '已签署',
    favoriteCourses: '阴瑜伽、流瑜伽',
    favoriteTeachers: 'Nora',
    favoriteTimes: '周末上午',
    intensityPreference: '低中强度',
    bodyNotes: '无',
    lastFollowUp: '2026-06-20 常规回访完成',
    followUpOwner: '销售 · 林敏',
    followUpResult: '维持当前频率',
    nextPlan: '维持当前练习频率',
    riskTrigger: '无',
    riskFact: '练习频率稳定',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '无需跟进',
  },
  'ml-12': {
    id: 'ml-12',
    name: '吴敏',
    phoneMasked: '136****1188',
    stageLabel: 'S4 续费窗口',
    owner: '陈悦',
    frequentStore: '滨江馆',
    tagSummary: ['即将到期', '续费窗口'],
    mainCard: '锦鲤卡',
    remaining: '8 点',
    validUntil: '2026-07-08',
    bonusBenefits: '无',
    pointsBalance: '980 分',
    contractStatus: '已签署',
    favoriteCourses: '流瑜伽',
    favoriteTeachers: 'Nora',
    favoriteTimes: '周五晚课',
    intensityPreference: '中强度',
    bodyNotes: '无',
    lastFollowUp: '待课后复盘',
    followUpOwner: '管家 · 陈悦',
    followUpResult: '待安排',
    nextPlan: '课后安排续费沟通',
    riskTrigger: '续费窗口',
    riskFact: '剩余 8 点，7 天内到期',
    riskSourceLabel: '系统规则建议',
    riskHandleStatus: '待处理',
  },
};

const MATCH_PREVIEWS: Record<string, MemberV2AudienceMatchPreview> = {
  'am-1': {
    id: 'am-1',
    title: '明晚内观流补员 · 匹配名单',
    subtitle: '按课程偏好、时间习惯、门店距离、资产可用和触达疲劳筛选',
    suggestionSource: 'system_rule',
    suggestionSourceLabel: '系统规则建议',
    stats: [
      { label: '匹配会员', value: '18 人' },
      { label: '高匹配', value: '6 人' },
      { label: '待邀约', value: '6 人' },
      { label: '已排除', value: '5 人' },
    ],
    ruleTags: [
      '喜欢内观流',
      '周三晚课活跃',
      '滨江馆常客',
      '剩余点数充足',
      '近 14 天未到店',
      '触达疲劳低',
    ],
    candidates: [
      {
        id: 'ac-1',
        name: '王静怡',
        stage: 'S3 稳定活跃',
        matchLevel: '高匹配',
        assetSummary: '锦鲤卡 · 剩余 42 点',
        lastVisit: '10 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '微信私聊',
        matchReasons: ['喜欢内观流', '周三晚课活跃', '滨江馆常客', '到课稳定'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-2',
        name: '许倩',
        stage: 'S4 低频风险',
        matchLevel: '高匹配',
        assetSummary: '天选卡 · 剩余 96 点',
        lastVisit: '21 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '微信私聊',
        matchReasons: ['高余额低耗课', '喜欢低强度流动课', '晚课活跃'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-3',
        name: '何珊',
        stage: 'S5 续费窗口',
        matchLevel: '中匹配',
        assetSummary: '锦鲤卡 · 剩余 18 点',
        lastVisit: '3 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '课程复盘后邀约',
        matchReasons: ['近期活跃', '晚课习惯稳定', '可作为续费沟通前的服务触点'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-4',
        name: '林可',
        stage: 'S2 新成交激活',
        matchLevel: '中匹配',
        assetSummary: '初遇卡 · 剩余 39 点',
        lastVisit: '7 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '预约提醒',
        matchReasons: ['新成交未形成稳定频率', '晚间可约', '课程强度适中'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
    ],
    excludedSummary: '已排除 5 人',
    excludedReasons: [
      { label: '近 7 天已邀约 ≥ 2 次', count: 2 },
      { label: '已预约同类课程', count: 1 },
      { label: '身体标签不适合', count: 1 },
      { label: '暂不打扰', count: 1 },
    ],
  },
  'am-2': {
    id: 'am-2',
    title: '周末普拉提小班补员 · 匹配名单',
    subtitle: '按课程偏好、时间习惯、门店距离、资产可用和触达疲劳筛选',
    suggestionSource: 'system_rule',
    suggestionSourceLabel: '系统规则建议',
    stats: [
      { label: '匹配会员', value: '22 人' },
      { label: '高匹配', value: '9 人' },
      { label: '待邀约', value: '9 人' },
      { label: '已排除', value: '4 人' },
    ],
    ruleTags: ['常约普拉提', '周末上午活跃', '小班偏好', '剩余点数充足', '触达疲劳中'],
    candidates: [
      {
        id: 'ac-5',
        name: '陈雨',
        stage: 'S3 稳定活跃',
        matchLevel: '高匹配',
        assetSummary: '锦鲤卡 · 剩余 48 点',
        lastVisit: '6 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '微信私聊',
        matchReasons: ['常约普拉提', '周末上午活跃', '课程强度适中', '到课稳定'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-6',
        name: '林可',
        stage: 'S2 新成交激活',
        matchLevel: '高匹配',
        assetSummary: '初遇卡 · 剩余 39 点',
        lastVisit: '7 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '课程邀约',
        matchReasons: ['小班偏好', '晚间可约', '新成交未激活', '触达疲劳低'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-7',
        name: '周岚',
        stage: 'S4 低频风险',
        matchLevel: '中匹配',
        assetSummary: '天选卡 · 剩余 72 点',
        lastVisit: '14 天前',
        preferredStore: '万象馆',
        recommendedTouch: '电话回访',
        matchReasons: ['常约普拉提', '剩余点数充足', '跨店可接受', '触达疲劳低'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-8',
        name: '何珊',
        stage: 'S5 续费窗口',
        matchLevel: '中匹配',
        assetSummary: '锦鲤卡 · 剩余 18 点',
        lastVisit: '3 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '约下一节',
        matchReasons: ['周末上午活跃', '近期活跃', '课程强度适中', '可作为服务触点'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
    ],
    excludedSummary: '已排除 4 人',
    excludedReasons: [
      { label: '近 7 天已邀约 ≥ 2 次', count: 1 },
      { label: '已预约同类课程', count: 1 },
      { label: '身体状态不适合', count: 1 },
      { label: '暂不打扰', count: 1 },
    ],
  },
  'am-3': {
    id: 'am-3',
    title: '高余额低耗课召回 · 匹配名单',
    subtitle: '按课程偏好、时间习惯、门店距离、资产可用和触达疲劳筛选',
    suggestionSource: 'system_rule',
    suggestionSourceLabel: '系统规则建议',
    stats: [
      { label: '匹配会员', value: '12 人' },
      { label: '高匹配', value: '5 人' },
      { label: '待邀约', value: '5 人' },
      { label: '已排除', value: '3 人' },
    ],
    ruleTags: ['余额 ≥ 60 点', '30 天耗课 ≤ 2 次', '近期未触达', '触达疲劳低'],
    candidates: [
      {
        id: 'ac-9',
        name: '许倩',
        stage: 'S4 低频风险',
        matchLevel: '高匹配',
        assetSummary: '天选卡 · 剩余 96 点',
        lastVisit: '21 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '微信私聊',
        matchReasons: ['高余额低耗课', '近 14 天未到店', '晚课活跃', '触达疲劳低'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-10',
        name: '赵琳',
        stage: 'S4 低频风险',
        matchLevel: '高匹配',
        assetSummary: '天选卡 · 剩余 88 点',
        lastVisit: '28 天前',
        preferredStore: '城北馆',
        recommendedTouch: '电话回访',
        matchReasons: ['高余额低耗课', '30 天耗课 ≤ 2 次', '课程强度适中', '触达疲劳低'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-11',
        name: '孙悦',
        stage: 'S3 稳定活跃',
        matchLevel: '中匹配',
        assetSummary: '锦鲤卡 · 剩余 64 点',
        lastVisit: '18 天前',
        preferredStore: '滨江馆',
        recommendedTouch: '课程邀约',
        matchReasons: ['余额 ≥ 60 点', '喜欢流瑜伽', '到课稳定', '近期未触达'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-12',
        name: '马婷',
        stage: 'S5 续费窗口',
        matchLevel: '中匹配',
        assetSummary: '锦鲤卡 · 剩余 78 点',
        lastVisit: '25 天前',
        preferredStore: '万象馆',
        recommendedTouch: '约下一节',
        matchReasons: ['高余额低耗课', '续费窗口', '跨店可接受', '触达疲劳低'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
    ],
    excludedSummary: '已排除 3 人',
    excludedReasons: [
      { label: '近 7 天已邀约 ≥ 2 次', count: 1 },
      { label: '身体状态不适合', count: 1 },
      { label: '暂不打扰', count: 1 },
    ],
  },
  'am-4': {
    id: 'am-4',
    title: '新成交 7 天未预约 · 匹配名单',
    subtitle: '按课程偏好、时间习惯、门店距离、资产可用和触达疲劳筛选',
    suggestionSource: 'pending_config',
    suggestionSourceLabel: '待配置规则',
    stats: [
      { label: '匹配会员', value: '8 人' },
      { label: '高匹配', value: '4 人' },
      { label: '待邀约', value: '4 人' },
      { label: '已排除', value: '2 人' },
    ],
    ruleTags: ['S2 新成交', '7 天内未预约', '合同已签', '触达疲劳低'],
    candidates: [
      {
        id: 'ac-13',
        name: '张薇',
        stage: 'S2 新成交激活',
        matchLevel: '高匹配',
        assetSummary: '初遇卡 · 剩余 24 点',
        lastVisit: '近 14 天未到店',
        preferredStore: '滨江馆',
        recommendedTouch: '微信私聊',
        matchReasons: ['新成交未激活', '7 天内未预约', '合同已签', '触达疲劳低'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-14',
        name: '李萌',
        stage: 'S2 新成交激活',
        matchLevel: '高匹配',
        assetSummary: '体验待转化 · 剩余 18 点',
        lastVisit: '近 14 天未到店',
        preferredStore: '滨江馆',
        recommendedTouch: '课程邀约',
        matchReasons: ['新成交未激活', '体验待转化', '晚间可约', '课程强度适中'],
        touchStatus: '待邀约',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
      {
        id: 'ac-15',
        name: '陈雨',
        stage: 'S2 新成交激活',
        matchLevel: '中匹配',
        assetSummary: '初遇卡 · 剩余 36 点',
        lastVisit: '8 天前',
        preferredStore: '城北馆',
        recommendedTouch: '预约提醒',
        matchReasons: ['S2 新成交', '7 天内未预约', '跨店可接受', '到课稳定'],
        touchStatus: '待分配',
        primaryActionLabel: '分配邀约',
        secondaryActionLabel: '记录',
      },
    ],
    excludedSummary: '已排除 2 人',
    excludedReasons: [
      { label: '合同未签', count: 1 },
      { label: '卡项未生效', count: 1 },
    ],
  },
};

export function getMemberOperationStatusClass(status: MemberOperationStatus): string {
  switch (status) {
    case 'healthy':
      return 'met-member-v2-status--healthy';
    case 'watch':
      return 'met-member-v2-status--watch';
    case 'warning':
      return 'met-member-v2-status--warning';
    case 'highRisk':
      return 'met-member-v2-status--high-risk';
    default:
      return 'met-member-v2-status--watch';
  }
}

export function buildMemberV2Snapshot(): MemberV2Snapshot {
  return {
    meta: {
      title: '会员经营',
      subtitle: '滨江馆 · 会员生命周期、服务待办、销售跟进与风险经营',
      filters: {
        storeLabel: '滨江馆',
        stageLabel: '全部阶段',
        ownerLabel: '全部负责人',
        riskLabel: '全部风险',
        primaryActionLabel: '新增线索',
        memberListLabel: '会员列表',
      },
    },
    memberOperationSummary: {
      status: 'watch',
      statusLabel: '观察',
      headline: '会员经营状态：观察',
      conclusion:
        '本月会员总量稳定，但新成交激活偏慢，高余额低耗课会员增加，续费窗口会员未及时跟进。今天应优先处理高余额低耗课、新成交未预约和续费窗口会员。',
      impactTags: ['会员资产', '耗课交付', '续费窗口', '老师名下会员'],
      sourceLabel: '系统规则建议',
      updatedAt: '2026-06-21 09:30',
      evidenceItems: [
        { label: '高余额低耗课会员', value: '12 人', isWarning: true },
        { label: '新成交未预约', value: '8 人', isWarning: true },
        { label: '续费窗口会员', value: '28 人', isWarning: true },
        { label: '低频风险会员', value: '42 人' },
        { label: '沉睡流失会员', value: '31 人' },
      ],
      evidenceButtonLabel: '查看判断依据',
      evidenceToastMessage: '查看会员经营判断依据（待建设）',
    },
    memberPriorityActions: {
      title: '今日会员优先动作',
      subtitle: '优先处理会影响耗课、续费、流失和会员体验的会员',
      items: [
        {
          id: 'mpa-1',
          priority: 'P0',
          title: '跟进 12 名高余额低耗课会员',
          impact: '预收负债与耗课交付',
          owner: '管家 / 对应老师',
          sourceModules: ['会员经营', '财务与资产'],
          suggestedAction: '点对点沟通近期约课计划，必要时分配老师跟进',
          ctaLabel: '去处理',
          ctaToast: '进入会员经营处理（待建设）',
          opensMemberList: true,
        },
        {
          id: 'mpa-2',
          priority: 'P1',
          title: '激活 8 名新成交未预约会员',
          impact: '新会员体验和首次到店',
          owner: '管家',
          sourceModules: ['会员经营', '今日运营'],
          suggestedAction: '确认首次预约时间，降低成交后沉默风险',
          ctaLabel: '去激活',
          ctaToast: '进入新成交激活（待建设）',
          opensMemberList: true,
        },
        {
          id: 'mpa-3',
          priority: 'P1',
          title: '跟进 28 名续费窗口会员',
          impact: '续费转化和会员留存',
          owner: '管家 / 店长',
          sourceModules: ['会员经营'],
          suggestedAction: '按剩余权益、到期时间和练习频率分层跟进',
          ctaLabel: '去跟进',
          ctaToast: '进入续费窗口跟进（待建设）',
          opensMemberList: true,
        },
        {
          id: 'mpa-4',
          priority: 'P2',
          title: '唤醒 31 名沉睡流失会员',
          impact: '会员流失和复购机会',
          owner: '运营 / 管家',
          sourceModules: ['会员经营', '活动与获客'],
          suggestedAction: '结合课程偏好做点对点召回，不做群发',
          ctaLabel: '去唤醒',
          ctaToast: '进入沉睡会员唤醒（待建设）',
          opensMemberList: true,
        },
      ],
    },
    serviceSalesQueues: {
      title: '服务与销售队列',
      subtitle: '服务问题先稳住体验，销售跟进再承接续费和转化',
      serviceTitle: '服务待办',
      salesTitle: '销售跟进',
      serviceItems: [
        {
          id: 'sqs-1',
          priority: 'P0',
          title: '新成交未预约',
          count: 8,
          representativeMembers: '林可、周宁 等',
          suggestedAction: '确认首次预约时间，避免成交后沉默',
          ctaLabel: '去激活',
          ctaToast: '进入新成交激活（待建设）',
        },
        {
          id: 'sqs-2',
          priority: 'P0',
          title: '高余额低耗课',
          count: 12,
          representativeMembers: '许倩、赵宁 等',
          suggestedAction: '点对点沟通约课计划，必要时分配老师跟进',
          ctaLabel: '去处理',
          ctaToast: '进入会员经营处理（待建设）',
        },
        {
          id: 'sqs-3',
          priority: 'P1',
          title: '低频风险',
          count: 42,
          representativeMembers: '何珊、李曼 等',
          suggestedAction: '结合偏好做召回触达，优先处理近 30 天未到店',
          ctaLabel: '去召回',
          ctaToast: '进入低频风险召回（待建设）',
        },
      ],
      salesItems: [
        {
          id: 'sls-1',
          priority: 'P1',
          title: '续费窗口',
          count: 28,
          representativeMembers: '何珊、陈雨 等',
          suggestedAction: '按剩余权益和练习频率分层沟通续费方案',
          ctaLabel: '去跟进',
          ctaToast: '进入续费窗口跟进（待建设）',
        },
        {
          id: 'sls-2',
          priority: 'P1',
          title: '体验未转化',
          count: 6,
          representativeMembers: '陈雨、李曼 等',
          suggestedAction: '48h 内回访体验感受，确认下一步练习计划',
          ctaLabel: '去跟进',
          ctaToast: '进入体验转化跟进（待建设）',
        },
        {
          id: 'sls-3',
          priority: 'P2',
          title: '高意向复购',
          count: 9,
          representativeMembers: '王静怡、周航 等',
          suggestedAction: '结合练习偏好推荐合适卡项，不做催促式推销',
          ctaLabel: '去沟通',
          ctaToast: '进入高意向复购沟通（待建设）',
        },
      ],
      serviceViewAllLabel: '查看全部服务任务',
      serviceViewAllKey: 'service_tasks',
      salesViewAllLabel: '查看全部销售跟进',
      salesViewAllKey: 'sales_followups',
    },
    lifecycleFlow: {
      title: '会员生命周期分布',
      subtitle: '从新线索到稳定练习、续费窗口和沉睡流失，判断会员经营结构是否健康',
      riskFocusNote: '当前风险集中在 S4 低频风险、S5 续费窗口和 S6 沉睡流失。',
      stages: [
        {
          id: 'ls-s0',
          code: 'S0',
          name: '新线索',
          count: 18,
          weeklyChange: '+4',
          weeklyChangeUp: true,
          coreAction: '分配跟进',
          zone: 'growth',
        },
        {
          id: 'ls-s1',
          code: 'S1',
          name: '体验待转化',
          count: 12,
          weeklyChange: '+2',
          weeklyChangeUp: true,
          coreAction: '48h 内回访',
          zone: 'growth',
        },
        {
          id: 'ls-s2',
          code: 'S2',
          name: '新成交激活',
          count: 21,
          weeklyChange: '+5',
          weeklyChangeUp: true,
          coreAction: '建立上课习惯',
          zone: 'growth',
        },
        {
          id: 'ls-s3',
          code: 'S3',
          name: '稳定活跃',
          count: 168,
          weeklyChange: '+9',
          weeklyChangeUp: true,
          coreAction: '保持服务',
          zone: 'growth',
        },
        {
          id: 'ls-s4',
          code: 'S4',
          name: '低频风险',
          count: 42,
          weeklyChange: '+8',
          weeklyChangeUp: true,
          coreAction: '召回触达',
          zone: 'risk',
          riskVariant: 's4',
        },
        {
          id: 'ls-s5',
          code: 'S5',
          name: '续费窗口',
          count: 28,
          weeklyChange: '+6',
          weeklyChangeUp: true,
          coreAction: '续费跟进',
          zone: 'risk',
          riskVariant: 's5',
        },
        {
          id: 'ls-s6',
          code: 'S6',
          name: '沉睡流失',
          count: 31,
          weeklyChange: '+3',
          weeklyChangeUp: true,
          coreAction: '唤醒 / 归档',
          zone: 'risk',
          riskVariant: 's6',
        },
      ],
    },
    attentionHighlights: {
      title: '重点关注',
      subtitle: '今日需要服务、召回或转化的关键人群',
      items: [
        {
          id: 'ah-1',
          label: '身体标签到店',
          count: 5,
          note: '今晚到店需老师注意',
          typeLabel: '服务',
          actionLabel: '查看',
          tone: 'service',
          secondaryKey: 'service_tasks',
        },
        {
          id: 'ah-2',
          label: '续费窗口',
          count: 24,
          note: '余额或有效期接近阈值',
          typeLabel: '续费',
          actionLabel: '跟进',
          tone: 'renewal',
          secondaryKey: 'sales_followups',
        },
        {
          id: 'ah-3',
          label: '高余额低耗课',
          count: 12,
          note: '余额 ≥ 60 点，30 天耗课 ≤ 2 次',
          typeLabel: '风险',
          actionLabel: '名单',
          tone: 'recall',
          secondaryKey: 'risk_list',
        },
        {
          id: 'ah-4',
          label: '明晚内观流补员',
          count: 18,
          note: '同类同频可邀约人群',
          typeLabel: '机会',
          actionLabel: '匹配',
          tone: 'opportunity',
          secondaryKey: 'match_list',
          matchPreviewPackId: 'am-1',
        },
      ],
    },
    serviceQueue: {
      title: '服务待办',
      subtitle: '已成交会员的服务动作',
      summary: [
        { label: '待处理', value: '12 项' },
        { label: '临近截止', value: '3 项' },
        { label: '今日到店提醒', value: '5 人' },
        { label: '合同待签', value: '3 人' },
      ],
      topTasks: [
        {
          id: 'st-1',
          memberName: '王静怡',
          stageCode: 'S3',
          mainTag: '腰背不适',
          triggerReason: '今晚到店，提醒老师关注腰背反馈',
          owner: '小乔',
          deadline: '18:00',
          actionLabel: '查看',
        },
        {
          id: 'st-2',
          memberName: '林可',
          stageCode: 'S2',
          mainTag: '合同待签',
          triggerReason: '新购后电子合同未完成',
          owner: '陈悦',
          deadline: '今日',
          actionLabel: '提醒',
        },
        {
          id: 'st-3',
          memberName: '许倩',
          stageCode: 'S4',
          mainTag: '高余额低耗课',
          triggerReason: '剩余 96 点，21 天未到店',
          owner: '周航',
          deadline: '本周五',
          actionLabel: '预约',
        },
      ],
      viewAllLabel: '查看全部服务任务',
      viewAllKey: 'service_tasks',
    },
    salesQueue: {
      title: '销售跟进',
      subtitle: '潜客、体验后、续费窗口的成交动作',
      summary: [
        { label: '待跟进', value: '18 项' },
        { label: '体验后待跟进', value: '6 人' },
        { label: '48h 未跟进', value: '4 人' },
        { label: '续费窗口', value: '5 人' },
      ],
      topTasks: [
        {
          id: 'sf-1',
          name: '陈雨',
          stageCode: 'S1',
          mainTag: '体验后待跟进',
          triggerReason: '昨日体验后未回访',
          owner: '林敏',
          deadline: '今日 18:00',
          actionLabel: '跟进',
        },
        {
          id: 'sf-2',
          name: '李曼',
          stageCode: 'S0',
          mainTag: '48h 未跟进',
          triggerReason: '小红书留资 2 天未触达',
          owner: '周航',
          deadline: '今日',
          actionLabel: '记录',
        },
        {
          id: 'sf-3',
          name: '何珊',
          stageCode: 'S5',
          mainTag: '续费窗口',
          triggerReason: '剩余 18 点，近 2 周活跃',
          owner: '陈悦',
          deadline: '本周内',
          actionLabel: '跟进',
        },
      ],
      viewAllLabel: '查看全部销售跟进',
      viewAllKey: 'sales_followups',
    },
    audienceMatchPacks: {
      title: '精准人群匹配',
      subtitle: '只做点对点邀约，不做群发',
      packs: [
        {
          id: 'am-1',
          title: '明晚内观流补员',
          scene: '课程补员',
          recommendedCount: 18,
          highMatchCount: 6,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'high' },
            { key: 'time', label: '时间习惯', level: 'high' },
            { key: 'store', label: '门店距离', level: 'medium' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low', tone: 'positive' },
          ],
          excludeTags: ['近 7 天已邀约 ≥ 2 次', '已预约同类课程', '身体标签不适合'],
          primaryActionLabel: '查看名单',
          secondaryActionLabel: '分配邀约',
          previewId: 'am-1',
        },
        {
          id: 'am-2',
          title: '周末普拉提小班补员',
          scene: '课程补员',
          recommendedCount: 22,
          highMatchCount: 9,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'high' },
            { key: 'time', label: '时间习惯', level: 'high' },
            { key: 'store', label: '门店距离', level: 'medium' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'medium' },
          ],
          excludeTags: ['不接受跨店', '近 7 天已拒绝邀约'],
          primaryActionLabel: '查看名单',
          secondaryActionLabel: '分配邀约',
          previewId: 'am-2',
        },
        {
          id: 'am-3',
          title: '高余额低耗课召回',
          scene: '会员召回',
          recommendedCount: 12,
          highMatchCount: 5,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'medium' },
            { key: 'time', label: '时间习惯', level: 'medium' },
            { key: 'store', label: '门店距离', level: 'high' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low', tone: 'positive' },
          ],
          excludeTags: ['暂不打扰', '冻结中'],
          primaryActionLabel: '生成任务',
          previewId: 'am-3',
        },
        {
          id: 'am-4',
          title: '新成交 7 天未预约',
          scene: '新会员激活',
          recommendedCount: 8,
          highMatchCount: 4,
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'medium' },
            { key: 'time', label: '时间习惯', level: 'medium' },
            { key: 'store', label: '门店距离', level: 'medium' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low', tone: 'positive' },
          ],
          excludeTags: ['合同未签', '卡项未生效'],
          primaryActionLabel: '查看名单',
          previewId: 'am-4',
        },
      ],
    },
    audienceMatchPreviews: MATCH_PREVIEWS,
    riskGraph: {
      title: '会员风险图谱',
      subtitle: '用于复盘低频、续费、资产和流失风险，不代替今日优先动作',
      replayNote: '风险图谱用于判断结构性问题，今日处理以优先动作队列为准。',
      items: [
        {
          id: 'mr-1',
          title: '高余额低耗课',
          count: 12,
          priority: 'P0',
          fact: '剩余点数 ≥ 60 点，近 30 天耗课 ≤ 2 次',
          actionLabel: '查看名单',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          bubbleScale: 1,
        },
        {
          id: 'mr-2',
          title: '即将到期未跟进',
          count: 8,
          priority: 'P1',
          fact: '未来 14 天内到期且未记录续费沟通',
          actionLabel: '生成任务',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          bubbleScale: 0.82,
        },
        {
          id: 'mr-3',
          title: '频繁取消 / 爽约',
          count: 6,
          priority: 'P1',
          fact: '近 30 天取消 ≥ 3 次或爽约 ≥ 2 次',
          actionLabel: '处理',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          bubbleScale: 0.72,
        },
        {
          id: 'mr-4',
          title: '积分 / 赠送权益即将失效',
          count: 15,
          priority: 'P2',
          fact: '积分或赠送权益 14 天内失效',
          actionLabel: '提醒',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          bubbleScale: 0.88,
        },
      ],
    },
    keyMemberEntrances: {
      title: '重点会员',
      subtitle: '查看需要单独跟进的会员档案、资产、偏好和证据链',
      members: [
        {
          id: 'km-1',
          name: '王静怡',
          stageLabel: 'S3 稳定活跃',
          mainTag: '腰背不适',
          assetSummary: '锦鲤卡 · 剩余 42 点',
          recentAction: '今晚到店，需老师关注',
          detailActionLabel: '详情',
          followActionLabel: '记录',
        },
        {
          id: 'km-2',
          name: '许倩',
          stageLabel: 'S4 低频风险',
          mainTag: '高余额低耗课',
          assetSummary: '天选卡 · 剩余 96 点',
          recentAction: '21 天未到店',
          detailActionLabel: '详情',
          followActionLabel: '跟进',
        },
        {
          id: 'km-3',
          name: '陈雨',
          stageLabel: 'S1 体验待转化',
          mainTag: '48h 内需跟进',
          assetSummary: '体验后待转化',
          recentAction: '昨日体验后未回访',
          detailActionLabel: '详情',
          followActionLabel: '跟进',
        },
        {
          id: 'km-4',
          name: '何珊',
          stageLabel: 'S5 续费窗口',
          mainTag: '续费窗口',
          assetSummary: '锦鲤卡 · 剩余 18 点',
          recentAction: '待安排阶段复盘',
          detailActionLabel: '详情',
          followActionLabel: '跟进',
        },
      ],
      viewAllLabel: '查看全部会员',
      viewAllKey: 'member_list',
    },
    secondaryEntrances: [
      { key: 'member_list', label: '会员列表' },
      { key: 'service_tasks', label: '服务任务' },
      { key: 'sales_followups', label: '销售跟进' },
      { key: 'match_list', label: '匹配名单' },
      { key: 'assign_invite', label: '分配邀约' },
      { key: 'risk_list', label: '风险名单' },
      { key: 'tag_center', label: '标签中心' },
    ],
    drawerMemberDetails: DRAWER_DETAILS,
  };
}

export function getSecondaryEntranceLabel(
  entrances: MemberV2SecondaryEntrance[],
  key: string,
): string {
  return entrances.find(item => item.key === key)?.label ?? key;
}
