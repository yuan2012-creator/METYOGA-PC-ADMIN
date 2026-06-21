export type MemberV2SuggestionSource = 'system_rule' | 'pending_config';

export type MemberV2LifecycleCode = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export type MemberV2LifecycleZone = 'growth' | 'risk';

export type MemberV2MatchLevel = 'high' | 'medium' | 'low';

export type MemberV2RiskPriority = 'P0' | 'P1' | 'P2';

export type MemberV2HighlightTone = 'service' | 'risk' | 'recall' | 'opportunity';

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

export interface MemberV2LifecycleStage {
  id: string;
  code: MemberV2LifecycleCode;
  name: string;
  count: number;
  weeklyChange: string;
  weeklyChangeUp: boolean;
  coreAction: string;
  zone: MemberV2LifecycleZone;
}

export interface MemberV2LifecycleFlow {
  title: string;
  subtitle: string;
  stages: MemberV2LifecycleStage[];
}

export interface MemberV2AttentionHighlight {
  id: string;
  label: string;
  count: number;
  note: string;
  actionLabel: string;
  tone: MemberV2HighlightTone;
  secondaryKey: string;
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
}

export interface MemberV2AudienceMatchPack {
  id: string;
  title: string;
  recommendedCount: number;
  highMatchCount: number;
  suggestionSource: MemberV2SuggestionSource;
  suggestionSourceLabel: string;
  dimensions: MemberV2MatchDimension[];
  excludeTags: string[];
  primaryActionLabel: string;
  secondaryActionLabel?: string;
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
  lifecycleFlow: MemberV2LifecycleFlow;
  attentionHighlights: MemberV2AttentionHighlights;
  serviceQueue: MemberV2ServiceQueueSection;
  salesQueue: MemberV2SalesQueueSection;
  audienceMatchPacks: MemberV2AudienceMatchPacksSection;
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
};

export function buildMemberV2Snapshot(): MemberV2Snapshot {
  return {
    meta: {
      title: '会员经营',
      subtitle: '滨江馆 · 会员资产与生命周期管理',
      filters: {
        storeLabel: '滨江馆',
        stageLabel: '全部阶段',
        ownerLabel: '全部负责人',
        riskLabel: '全部风险',
        primaryActionLabel: '新增线索',
        memberListLabel: '会员列表',
      },
    },
    lifecycleFlow: {
      title: '会员生命周期流转图',
      subtitle: '从线索到活跃，再到风险与沉睡的经营链路',
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
          count: 36,
          weeklyChange: '+8',
          weeklyChangeUp: true,
          coreAction: '召回触达',
          zone: 'risk',
        },
        {
          id: 'ls-s5',
          code: 'S5',
          name: '续费窗口',
          count: 24,
          weeklyChange: '+6',
          weeklyChangeUp: true,
          coreAction: '续费跟进',
          zone: 'risk',
        },
        {
          id: 'ls-s6',
          code: 'S6',
          name: '沉睡流失',
          count: 42,
          weeklyChange: '+3',
          weeklyChangeUp: true,
          coreAction: '唤醒 / 归档',
          zone: 'risk',
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
          actionLabel: '查看',
          tone: 'service',
          secondaryKey: 'service_tasks',
        },
        {
          id: 'ah-2',
          label: '续费窗口',
          count: 24,
          note: '余额或有效期接近阈值',
          actionLabel: '跟进',
          tone: 'risk',
          secondaryKey: 'sales_followups',
        },
        {
          id: 'ah-3',
          label: '高余额低耗课',
          count: 12,
          note: '余额 ≥ 60 点，30 天耗课 ≤ 2 次',
          actionLabel: '名单',
          tone: 'recall',
          secondaryKey: 'risk_list',
        },
        {
          id: 'ah-4',
          label: '明晚内观流补员',
          count: 18,
          note: '同类同频可邀约人群',
          actionLabel: '匹配',
          tone: 'opportunity',
          secondaryKey: 'match_list',
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
      subtitle: '按课程偏好、时间习惯、资产状态和触达疲劳生成可执行人群',
      packs: [
        {
          id: 'am-1',
          title: '明晚内观流补员',
          recommendedCount: 18,
          highMatchCount: 6,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'high' },
            { key: 'time', label: '时间习惯', level: 'high' },
            { key: 'store', label: '门店距离', level: 'medium' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low' },
          ],
          excludeTags: ['近 7 天已邀约 ≥ 2 次', '已预约同类课程', '身体标签不适合'],
          primaryActionLabel: '查看名单',
          secondaryActionLabel: '分配邀约',
        },
        {
          id: 'am-2',
          title: '周末普拉提小班补员',
          recommendedCount: 22,
          highMatchCount: 9,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'high' },
            { key: 'time', label: '时间习惯', level: 'high' },
            { key: 'store', label: '门店距离', level: 'high' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'medium' },
          ],
          excludeTags: ['不接受跨店', '近 7 天已拒绝邀约'],
          primaryActionLabel: '查看名单',
          secondaryActionLabel: '分配邀约',
        },
        {
          id: 'am-3',
          title: '高余额低耗课召回',
          recommendedCount: 12,
          highMatchCount: 5,
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'medium' },
            { key: 'time', label: '时间习惯', level: 'medium' },
            { key: 'store', label: '门店距离', level: 'high' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low' },
          ],
          excludeTags: ['暂不打扰', '冻结中'],
          primaryActionLabel: '生成任务',
        },
        {
          id: 'am-4',
          title: '新成交 7 天未预约',
          recommendedCount: 8,
          highMatchCount: 4,
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          dimensions: [
            { key: 'course', label: '课程偏好', level: 'medium' },
            { key: 'time', label: '时间习惯', level: 'low' },
            { key: 'store', label: '门店距离', level: 'high' },
            { key: 'asset', label: '资产可用', level: 'high' },
            { key: 'fatigue', label: '触达疲劳', level: 'low' },
          ],
          excludeTags: ['合同未签', '卡项未生效'],
          primaryActionLabel: '查看名单',
        },
      ],
    },
    riskGraph: {
      title: '会员风险图谱',
      subtitle: '按资产、行为和触达状态识别风险会员',
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
      subtitle: '用于快速进入详情、跟进和证据链',
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
