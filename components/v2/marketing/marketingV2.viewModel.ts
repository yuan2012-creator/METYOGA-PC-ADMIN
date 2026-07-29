export type MarketingV2SuggestionSource = 'system_rule' | 'pending_config';
export type MarketingV2Priority = 'P0' | 'P1' | 'P2';
export type MarketingV2ChannelStatus = 'quality' | 'follow_up' | 'filter' | 'stable' | 'low';
export type MarketingV2CampaignStatus = 'active' | 'ended' | 'review';
export type FunnelBreakSeverity = 'primary' | 'secondary' | 'handoff';
export type ChannelQuadrantTone = 'follow_up' | 'quality' | 'low' | 'stable';

export interface MarketingV2Meta {
  title: string;
  subtitle: string;
}

export interface MarketingV2Filters {
  storeLabel: string;
  periodLabel: string;
  channelLabel: string;
  campaignStatusLabel: string;
  leadStageLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  leadPoolLinkLabel: string;
}

export interface MarketingV2EvidenceMetric {
  label: string;
  value: string;
}

export interface ConversionFunnelStage {
  id: string;
  stage: string;
  count: string;
  conversionRate?: string;
  conversionLabel?: string;
  widthPercent: number;
}

export interface FunnelMainBreakpoint {
  id: string;
  afterStageId: string;
  label: string;
  detail: string;
  severity: FunnelBreakSeverity;
}

export interface TodayActionItem {
  id: string;
  priority: MarketingV2Priority;
  title: string;
  count: string;
  description: string;
  actionLabel: string;
  toastMessage: string;
  relatedLeadId?: string;
  relatedActivityId?: string;
}

export interface MarketingWarroom {
  section: { title: string; subtitle: string };
  funnelStages: ConversionFunnelStage[];
  mainBreakpoints: FunnelMainBreakpoint[];
  todayActions: TodayActionItem[];
  quickMetrics: MarketingV2EvidenceMetric[];
}

export interface ChannelPill {
  id: string;
  channel: string;
  leads: string;
  dealRate: string;
  cost: string;
  judgement: string;
  actionLabel: string;
  toastMessage: string;
  statusLevel: MarketingV2ChannelStatus;
}

export interface ChannelQuadrant {
  id: string;
  title: string;
  tone: ChannelQuadrantTone;
  channels: ChannelPill[];
}

export interface ChannelQuadrants {
  title: string;
  subtitle: string;
  quadrants: ChannelQuadrant[];
  judgements: string[];
}

export interface CampaignProgressStage {
  key: string;
  label: string;
  display: string;
  percent: number;
}

export interface HeroCampaign {
  id: string;
  name: string;
  status: string;
  statusLevel: MarketingV2CampaignStatus;
  goal: string;
  goalProgress: { current: number; target: number; display: string; percent: number };
  progress: CampaignProgressStage[];
  maxIssue: string;
  nextAction: string;
  copyJudgement: string;
  actionLabel: string;
  toastMessage?: string;
}

export interface SupportCampaignCard {
  id: string;
  name: string;
  status: string;
  statusLevel: MarketingV2CampaignStatus;
  leads: string;
  visited: string;
  deals: string;
  copyJudgement: string;
  actionLabel: string;
  toastMessage?: string;
}

export interface CampaignBattle {
  title: string;
  subtitle: string;
  heroCampaign: HeroCampaign;
  supportCampaigns: SupportCampaignCard[];
}

export interface LeadActionItem {
  id: string;
  priority: MarketingV2Priority;
  title: string;
  fact: string;
  impact: string;
  suggestionSource: MarketingV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  toastMessage: string;
  relatedLeadId?: string;
  relatedActivityId?: string;
}

export interface HandoffFlowNode {
  id: string;
  label: string;
  count: string;
}

export interface HandoffBreakpoint {
  id: string;
  title: string;
  count: string;
}

export interface HandoffFlowAction {
  label: string;
  toastMessage: string;
}

export interface HandoffFlow {
  title: string;
  subtitle: string;
  nodes: HandoffFlowNode[];
  breakpoints: HandoffBreakpoint[];
  actions: HandoffFlowAction[];
}

export interface ActivityTimelineNode {
  id: string;
  date: string;
  title: string;
  status: string;
  statusTone: 'done' | 'active' | 'pending';
}

export interface ActivityTimeline {
  title: string;
  subtitle: string;
  nodes: ActivityTimelineNode[];
  addActionLabel: string;
  reviewActionLabel: string;
}

export interface EvidenceChainItem {
  label: string;
  value: string;
}

export interface ActivityDetail {
  id: string;
  title: string;
  subtitle: string;
  overview: EvidenceChainItem[];
  conversion: EvidenceChainItem[];
  channels: string[];
  issues: string[];
  nextActions: string[];
  evidenceChain: EvidenceChainItem[];
  goalCompletion: string;
  copyRecommendation: string;
  mainBreakpoint: string;
  memberHandoffStatus: string;
  actions: { label: string; toastMessage: string }[];
}

export interface LeadDetail {
  id: string;
  title: string;
  subtitle: string;
  fields: EvidenceChainItem[];
  actions: { label: string; toastMessage: string }[];
}

export interface MarketingV2Snapshot {
  meta: MarketingV2Meta;
  filters: MarketingV2Filters;
  warroom: MarketingWarroom;
  channelQuadrants: ChannelQuadrants;
  campaignBattle: CampaignBattle;
  leadActionQueue: { title: string; subtitle: string; items: LeadActionItem[] };
  handoffFlow: HandoffFlow;
  activityTimeline: ActivityTimeline;
  activityDetailMap: Record<string, ActivityDetail>;
  leadDetailMap: Record<string, LeadDetail>;
}

const BINJIANG_ACTIVITY: ActivityDetail = {
  id: 'campaign-binjiang',
  title: '滨江宝龙开业预热 · 活动详情',
  subtitle: '进行中 · 滨江馆 · 2026年7月',
  overview: [
    { label: '活动名称', value: '滨江宝龙开业预热' },
    { label: '所属门店', value: '滨江馆' },
    { label: '活动状态', value: '进行中' },
    { label: '活动周期', value: '2026-06-01 ~ 2026-07-15' },
    { label: '负责人', value: '运营 · 小林 + 滨江馆店长' },
    { label: '目标人群', value: '周边 3km 新客 / 高意向体验用户' },
    { label: '活动目标', value: '开业前积累 120 个体验名单' },
  ],
  conversion: [
    { label: '线索', value: '108 人' },
    { label: '预约体验', value: '42 人' },
    { label: '到店体验', value: '18 人' },
    { label: '成交', value: '5 人' },
    { label: '到店率', value: '42.9%' },
    { label: '成交率', value: '27.8%（到店后）' },
    { label: '未到店人数', value: '24 人' },
  ],
  channels: ['朋友圈', '社群', '老会员转介绍', '门店自然流量'],
  issues: ['预约提醒不足', '高意向未到店', '体验后跟进不及时'],
  nextActions: ['48 小时内二次触达', '生成高意向名单', '同步会员经营', '复盘活动话术'],
  evidenceChain: [
    { label: '线索来源记录', value: '108 条' },
    { label: '跟进记录', value: '86 条' },
    { label: '体验预约记录', value: '42 条' },
    { label: '成交订单', value: '5 笔' },
    { label: '会员经营承接记录', value: '4 人已进入 S1' },
  ],
  goalCompletion: '108 / 120',
  copyRecommendation: '继续推进，需加强到店提醒',
  mainBreakpoint: '预约后未到店',
  memberHandoffStatus: '5 人成交，4 人已进入会员经营，1 人待分配',
  actions: [
    { label: '生成跟进名单', toastMessage: '生成高意向跟进名单（待建设）' },
    { label: '查看线索', toastMessage: '进入线索池（待建设）' },
    { label: '同步会员经营', toastMessage: '进入会员经营新成交激活（待建设）' },
    { label: '记录复盘', toastMessage: '进入活动复盘（待建设）' },
  ],
};

const LEAD_NO_SHOW: LeadDetail = {
  id: 'lead-no-show',
  title: '高意向未到店 · 线索详情',
  subtitle: '滨江宝龙开业预热 · 体验预约',
  fields: [
    { label: '线索来源', value: '朋友圈 / 开业预热' },
    { label: '会员姓名', value: '林**' },
    { label: '手机', value: '138****5621' },
    { label: '意向课程', value: '普拉提体验课' },
    { label: '预约时间', value: '2026-06-18 19:30' },
    { label: '未到店原因', value: '待确认（未接听）' },
    { label: '最近跟进', value: '2026-06-17 短信提醒' },
    { label: '负责人', value: '管家 · 小王' },
    { label: '下一动作', value: '24 小时内电话二次触达' },
    { label: '是否进入会员经营', value: '否（未成交）' },
  ],
  actions: [
    { label: '分配跟进', toastMessage: '分配跟进任务（待建设）' },
    { label: '召回', toastMessage: '进入召回队列（待建设）' },
    { label: '查看活动', toastMessage: '打开活动详情（待建设）' },
  ],
};

function buildCampaignProgress(leads: number, booked: number, visited: number, deals: number): CampaignProgressStage[] {
  const max = leads;
  return [
    { key: 'leads', label: '线索', display: `${leads} 人`, percent: 100 },
    { key: 'booked', label: '预约', display: `${booked} 人`, percent: Math.round((booked / max) * 100) },
    { key: 'visited', label: '到店', display: `${visited} 人`, percent: Math.round((visited / max) * 100) },
    { key: 'deals', label: '成交', display: `${deals} 人`, percent: Math.round((deals / max) * 100) },
  ];
}

export function buildMarketingV2Snapshot(): MarketingV2Snapshot {
  return {
    meta: {
      title: '活动与获客',
      subtitle: '总部经营视角 · 渠道线索、活动转化与会员承接',
    },
    filters: {
      storeLabel: '全部门店',
      periodLabel: '本月',
      channelLabel: '全部渠道',
      campaignStatusLabel: '全部状态',
      leadStageLabel: '全部阶段',
      primaryActionLabel: '新增活动',
      secondaryActionLabel: '渠道规则',
      leadPoolLinkLabel: '线索池',
    },
    warroom: {
      section: {
        title: '获客转化作战台',
        subtitle: '从咨询到成交再到会员经营，识别本月最大转化断点',
      },
      funnelStages: [
        { id: 'fs-1', stage: '曝光', count: '12,800', widthPercent: 100 },
        { id: 'fs-2', stage: '咨询', count: '386', conversionRate: '3.0%', conversionLabel: '转化率', widthPercent: 88 },
        { id: 'fs-3', stage: '预约体验', count: '142', conversionRate: '36.8%', conversionLabel: '转化率', widthPercent: 72 },
        { id: 'fs-4', stage: '到店体验', count: '96', conversionRate: '67.6%', conversionLabel: '到店率', widthPercent: 58 },
        { id: 'fs-5', stage: '成交会员', count: '38', conversionRate: '39.6%', conversionLabel: '成交率', widthPercent: 44 },
        { id: 'fs-6', stage: '进入会员经营', count: '34', conversionRate: '89.5%', conversionLabel: '承接率', widthPercent: 36 },
      ],
      mainBreakpoints: [
        {
          id: 'fb-1', afterStageId: 'fs-3',
          label: '最大断点', detail: '预约未到店 46 人', severity: 'primary',
        },
        {
          id: 'fb-2', afterStageId: 'fs-4',
          label: '次级断点', detail: '体验后未成交 31 人', severity: 'secondary',
        },
        {
          id: 'fb-3', afterStageId: 'fs-5',
          label: '承接断点', detail: '4 人未分配', severity: 'handoff',
        },
      ],
      todayActions: [
        {
          id: 'ta-1', priority: 'P0', title: '预约未到店', count: '46 人',
          description: '已预约但未到店', actionLabel: '召回',
          toastMessage: '进入召回队列（待建设）', relatedLeadId: 'lead-no-show',
        },
        {
          id: 'ta-2', priority: 'P0', title: '48 小时未跟进', count: '23 人',
          description: '朋友圈线索未二次触达', actionLabel: '分配',
          toastMessage: '分配跟进任务（待建设）',
        },
        {
          id: 'ta-3', priority: 'P1', title: '体验后未成交', count: '31 人',
          description: '到店体验后 7 天未成交', actionLabel: '跟进',
          toastMessage: '进入销售跟进队列（待建设）', relatedLeadId: 'lead-no-show',
        },
        {
          id: 'ta-4', priority: 'P1', title: '成交后未承接', count: '4 人',
          description: '已成交但未进入会员经营', actionLabel: '同步',
          toastMessage: '进入会员经营相关队列（待建设）',
        },
      ],
      quickMetrics: [
        { label: '新增线索', value: '386 人' },
        { label: '预约体验', value: '142 人' },
        { label: '到店体验', value: '96 人' },
        { label: '成交会员', value: '38 人' },
      ],
    },
    channelQuadrants: {
      title: '渠道价值四象限',
      subtitle: '按线索规模、成交质量和获客成本判断渠道是否值得继续',
      quadrants: [
        {
          id: 'q-tl', title: '高线索 · 待跟进', tone: 'follow_up',
          channels: [
            {
              id: 'ch-moments', channel: '朋友圈', leads: '126 人', dealRate: '33%', cost: '低',
              judgement: '线索量高，但跟进及时性影响成交', actionLabel: '分配跟进',
              toastMessage: '分配跟进任务（待建设）', statusLevel: 'follow_up',
            },
            {
              id: 'ch-xhs', channel: '小红书 / 内容种草', leads: '74 人', dealRate: '27.8%', cost: '中',
              judgement: '咨询多但意向不均，需要客服初筛', actionLabel: '优化话术',
              toastMessage: '进入话术优化（待建设）', statusLevel: 'filter',
            },
          ],
        },
        {
          id: 'q-tr', title: '高质量 · 可复制', tone: 'quality',
          channels: [
            {
              id: 'ch-referral', channel: '老会员转介绍', leads: '62 人', dealRate: '50%', cost: '低',
              judgement: '质量最高，适合持续激励', actionLabel: '复制机制',
              toastMessage: '复制转介绍机制（待建设）', statusLevel: 'quality',
            },
          ],
        },
        {
          id: 'q-bl', title: '低效 · 需复盘', tone: 'low',
          channels: [
            {
              id: 'ch-partner', channel: '异业合作', leads: '76 人', dealRate: '7.1%', cost: '中',
              judgement: '热闹但成交弱，需暂停或重设门槛', actionLabel: '复盘',
              toastMessage: '进入渠道复盘（待建设）', statusLevel: 'low',
            },
          ],
        },
        {
          id: 'q-br', title: '稳定 · 可承接', tone: 'stable',
          channels: [
            {
              id: 'ch-store', channel: '门店自然到访', leads: '48 人', dealRate: '27.3%', cost: '低',
              judgement: '稳定补充，适合门店承接', actionLabel: '查看',
              toastMessage: '查看渠道详情（待建设）', statusLevel: 'stable',
            },
          ],
        },
      ],
      judgements: [
        '优先复制：老会员转介绍',
        '重点跟进：朋友圈高意向线索',
        '暂停复盘：异业合作',
      ],
    },
    campaignBattle: {
      title: '活动战役复盘',
      subtitle: '按目标、进度、转化结果和复制价值判断活动是否继续',
      heroCampaign: {
        id: 'campaign-binjiang', name: '滨江宝龙开业预热', status: '进行中', statusLevel: 'active',
        goal: '开业前积累 120 个体验名单',
        goalProgress: { current: 108, target: 120, display: '108 / 120', percent: 90 },
        progress: buildCampaignProgress(108, 42, 18, 5),
        maxIssue: '到店率不足',
        nextAction: '48 小时内完成二次触达',
        copyJudgement: '继续推进，但需加强到店提醒',
        actionLabel: '查看详情',
      },
      supportCampaigns: [
        {
          id: 'campaign-referral', name: '老会员同行体验', status: '进行中', statusLevel: 'active',
          leads: '62 人', visited: '25 人', deals: '12 人',
          copyJudgement: '建议复制', actionLabel: '复制机制',
          toastMessage: '复制转介绍机制（待建设）',
        },
        {
          id: 'campaign-assessment', name: '体态评估体验', status: '已结束', statusLevel: 'ended',
          leads: '84 人', visited: '20 人', deals: '8 人',
          copyJudgement: '选择性复制', actionLabel: '复盘',
          toastMessage: '进入活动复盘（待建设）',
        },
        {
          id: 'campaign-partner', name: '异业联名体验', status: '待复盘', statusLevel: 'review',
          leads: '76 人', visited: '14 人', deals: '1 人',
          copyJudgement: '暂不复制', actionLabel: '复盘',
          toastMessage: '进入活动复盘（待建设）',
        },
      ],
    },
    leadActionQueue: {
      title: '线索跟进行动队列',
      subtitle: '按意向、阶段和未跟进时长排序，优先处理会影响转化的线索',
      items: [
        {
          id: 'lf-1', priority: 'P0', title: '高意向体验未到店',
          fact: '已预约但未到店 46 人，其中 18 人来自开业预热',
          impact: '到店率、活动转化、体验成交',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '分配管家 24 小时内二次触达', actionLabel: '生成名单',
          toastMessage: '生成高意向名单（待建设）', relatedLeadId: 'lead-no-show', relatedActivityId: 'campaign-binjiang',
        },
        {
          id: 'lf-2', priority: 'P0', title: '48 小时未跟进线索',
          fact: '朋友圈线索 88 人中 23 人超过 48 小时未跟进',
          impact: '线索有效期、成交机会',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '按负责人分配跟进任务', actionLabel: '分配',
          toastMessage: '分配跟进任务（待建设）',
        },
        {
          id: 'lf-3', priority: 'P1', title: '体验后未成交',
          fact: '到店体验后 7 天未成交 31 人',
          impact: '体验成交率、会员经营承接',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '进入销售跟进队列', actionLabel: '跟进',
          toastMessage: '进入销售跟进队列（待建设）', relatedLeadId: 'lead-no-show',
        },
        {
          id: 'lf-4', priority: 'P1', title: '成交后未进入会员经营',
          fact: '本月成交 38 人，4 人未完成负责人分配',
          impact: '新会员激活、S1/S2 承接',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '同步会员经营新成交激活', actionLabel: '同步',
          toastMessage: '进入会员经营相关队列（待建设）',
        },
        {
          id: 'lf-5', priority: 'P2', title: '低效渠道需复盘',
          fact: '异业合作线索 76 人，仅成交 1 人',
          impact: '活动成本、门店执行',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          suggestionAction: '暂停复制，复盘合作质量', actionLabel: '复盘',
          toastMessage: '进入渠道复盘（待建设）', relatedActivityId: 'campaign-partner',
        },
      ],
    },
    handoffFlow: {
      title: '体验成交承接',
      subtitle: '获客不是成交结束，成交后必须进入会员经营并完成新会员激活',
      nodes: [
        { id: 'hn-1', label: '体验预约', count: '142 人' },
        { id: 'hn-2', label: '到店体验', count: '96 人' },
        { id: 'hn-3', label: '销售跟进', count: '65 人' },
        { id: 'hn-4', label: '成交', count: '38 人' },
        { id: 'hn-5', label: '进入会员经营', count: '34 人' },
        { id: 'hn-6', label: '新会员激活', count: '26 人' },
      ],
      breakpoints: [
        { id: 'hb-1', title: '成交未分配负责人', count: '4 人' },
        { id: 'hb-2', title: '新会员 7 天未预约', count: '8 人' },
        { id: 'hb-3', title: '体验后未成交但高意向', count: '12 人' },
      ],
      actions: [
        { label: '同步会员经营', toastMessage: '进入会员经营相关队列（待建设）' },
        { label: '分配负责人', toastMessage: '进入会员经营相关队列（待建设）' },
        { label: '查看新会员激活', toastMessage: '进入会员经营相关队列（待建设）' },
      ],
    },
    activityTimeline: {
      title: '内容与活动节奏',
      subtitle: '查看本月活动节奏、内容发布和门店执行节点',
      nodes: [
        { id: 'cal-1', date: '6/3', title: '朋友圈预热文案发布', status: '已完成', statusTone: 'done' },
        { id: 'cal-2', date: '6/8', title: '老会员同行体验开始', status: '进行中', statusTone: 'active' },
        { id: 'cal-3', date: '6/15', title: '滨江宝龙开业预热第一轮', status: '进行中', statusTone: 'active' },
        { id: 'cal-4', date: '6/21', title: '体态评估体验课复盘', status: '已完成', statusTone: 'done' },
        { id: 'cal-5', date: '6/28', title: '异业合作复盘', status: '待复盘', statusTone: 'pending' },
      ],
      addActionLabel: '新增节点',
      reviewActionLabel: '查看复盘',
    },
    activityDetailMap: { 'campaign-binjiang': BINJIANG_ACTIVITY },
    leadDetailMap: { 'lead-no-show': LEAD_NO_SHOW },
  };
}

export function getChannelStatusClass(level: MarketingV2ChannelStatus): string {
  const map: Record<MarketingV2ChannelStatus, string> = {
    quality: 'is-quality',
    follow_up: 'is-follow-up',
    filter: 'is-filter',
    stable: 'is-stable',
    low: 'is-low',
  };
  return map[level];
}

export function getQuadrantToneClass(tone: ChannelQuadrantTone): string {
  const map: Record<ChannelQuadrantTone, string> = {
    follow_up: 'is-follow-up',
    quality: 'is-quality',
    low: 'is-low',
    stable: 'is-stable',
  };
  return map[tone];
}

export function getCampaignStatusClass(level: MarketingV2CampaignStatus): string {
  const map: Record<MarketingV2CampaignStatus, string> = {
    active: 'is-active',
    ended: 'is-ended',
    review: 'is-review',
  };
  return map[level];
}

export function getPriorityClass(priority: MarketingV2Priority): string {
  const map: Record<MarketingV2Priority, string> = {
    P0: 'is-p0',
    P1: 'is-p1',
    P2: 'is-p2',
  };
  return map[priority];
}

export function getSuggestionSourceClass(source: MarketingV2SuggestionSource): string {
  return source === 'system_rule' ? 'is-rule' : 'is-pending';
}

export function getCalendarStatusClass(tone: ActivityTimelineNode['statusTone']): string {
  const map: Record<ActivityTimelineNode['statusTone'], string> = {
    done: 'is-done',
    active: 'is-active',
    pending: 'is-pending',
  };
  return map[tone];
}

export function getFunnelBreakClass(severity: FunnelBreakSeverity): string {
  const map: Record<FunnelBreakSeverity, string> = {
    primary: 'is-primary',
    secondary: 'is-secondary',
    handoff: 'is-handoff',
  };
  return map[severity];
}
