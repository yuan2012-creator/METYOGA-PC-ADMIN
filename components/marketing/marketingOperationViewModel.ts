/** 活动运营模块局部 demo 数据 */

import { formatMarketingCny } from './marketingFormatters';
import type { MarketingDetailTabId } from './MarketingDetailTabs';

export type MarketingSegment =
  | 'activities'
  | 'signups'
  | 'conversions'
  | 'coupons'
  | 'referrals'
  | 'costs'
  | 'reviews';

export type MarketingEntityType =
  | 'activity'
  | 'signup'
  | 'conversion'
  | 'coupon'
  | 'referral'
  | 'cost'
  | 'review';

export type MarketingActionGroup =
  | 'activityRisk'
  | 'configMissing'
  | 'endingNoReview'
  | 'noShow'
  | 'registeredUnconfirmed'
  | 'arrivalAnomaly'
  | 'noFollowUp'
  | 'noDeal'
  | 'needButler'
  | 'ruleConflict'
  | 'expiring'
  | 'issuedUnused'
  | 'rewardPending'
  | 'relationCheck'
  | 'newNoArrival'
  | 'overBudget'
  | 'voucherMissing'
  | 'vendorCheck'
  | 'endNoReview'
  | 'lowConversion'
  | 'lowRoi';

export const SEGMENT_ACTION_GROUPS: Record<MarketingSegment, MarketingActionGroup[]> = {
  activities: ['activityRisk', 'configMissing', 'endingNoReview'],
  signups: ['noShow', 'registeredUnconfirmed', 'arrivalAnomaly'],
  conversions: ['noFollowUp', 'noDeal', 'needButler'],
  coupons: ['ruleConflict', 'expiring', 'issuedUnused'],
  referrals: ['rewardPending', 'relationCheck', 'newNoArrival'],
  costs: ['overBudget', 'voucherMissing', 'vendorCheck'],
  reviews: ['endNoReview', 'lowConversion', 'lowRoi'],
};

export const SEGMENT_ACTION_GROUP_TITLES: Record<MarketingActionGroup, string> = {
  activityRisk: '活动风险',
  configMissing: '活动配置缺失',
  endingNoReview: '即将结束未复盘',
  noShow: '报名未到',
  registeredUnconfirmed: '已报名未确认',
  arrivalAnomaly: '到店异常',
  noFollowUp: '体验后未跟进',
  noDeal: '体验后未成交',
  needButler: '需要分配管家',
  ruleConflict: '权益规则冲突',
  expiring: '券即将过期',
  issuedUnused: '发放未使用',
  rewardPending: '奖励待确认',
  relationCheck: '推荐关系待核对',
  newNoArrival: '新客未到店',
  overBudget: '成本超预算',
  voucherMissing: '物料凭证缺失',
  vendorCheck: '供应方待核对',
  endNoReview: '活动结束未复盘',
  lowConversion: '成交率偏低',
  lowRoi: '成本回收不足',
};

export const SEGMENT_ACTION_BUTTONS: Record<
  MarketingSegment,
  { primary: string; secondary: string; mark: string }
> = {
  activities: { primary: '查看活动', secondary: '查看链路', mark: '标记处理' },
  signups: { primary: '查看报名', secondary: '提醒到店', mark: '标记处理' },
  conversions: { primary: '查看会员', secondary: '分配跟进', mark: '标记处理' },
  coupons: { primary: '查看权益', secondary: '核对规则', mark: '标记处理' },
  referrals: { primary: '查看推荐', secondary: '核对奖励', mark: '标记处理' },
  costs: { primary: '查看成本', secondary: '补凭证', mark: '标记处理' },
  reviews: { primary: '查看复盘', secondary: '生成复盘', mark: '标记处理' },
};

export const SEGMENT_ACTION_SUBTITLES: Record<MarketingSegment, string> = {
  activities: '优先处理活动风险、配置缺失与即将结束未复盘',
  signups: '优先处理报名未到、未确认与到店异常',
  conversions: '优先处理体验未跟进、未成交与管家分配',
  coupons: '优先处理权益规则冲突、即将过期与发放未使用',
  referrals: '优先处理奖励待确认、关系核对与新客未到店',
  costs: '优先处理成本超预算、凭证缺失与供应方核对',
  reviews: '优先处理未复盘、成交率偏低与成本回收不足',
};

export interface MarketingListFilters {
  query: string;
  activityType: string;
  status: string;
  store: string;
  risk: string;
  arrivalStatus: string;
}

export const DEFAULT_MARKETING_FILTERS: MarketingListFilters = {
  query: '',
  activityType: '全部',
  status: '全部',
  store: '全部',
  risk: '全部',
  arrivalStatus: '全部',
};

export const MARKETING_FILTER_OPTIONS = {
  activityTypes: [
    '全部',
    '节日活动',
    '体验课活动',
    '老带新活动',
    '教培活动',
    '积分兑换活动',
    '会员回访活动',
    '品牌联名活动',
  ],
  statuses: ['全部', '进行中', '已结束', '已结束待复盘', '已复盘', '未开始'],
  stores: ['全部', '万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'],
  risks: ['全部', '低', '中', '高'],
  arrivalStatuses: ['全部', '已报名', '已确认', '已到店', '未到店', '已取消'],
};

export const MARKETING_WORKBENCH_SEGMENTS: { id: MarketingSegment; label: string }[] = [
  { id: 'activities', label: '活动列表' },
  { id: 'signups', label: '报名与到店' },
  { id: 'conversions', label: '体验转化' },
  { id: 'coupons', label: '优惠券 / 权益' },
  { id: 'referrals', label: '老带新' },
  { id: 'costs', label: '成本与物料' },
  { id: 'reviews', label: '活动复盘' },
];

export const MARKETING_SEGMENT_HINTS: Record<MarketingSegment, string> = {
  activities: '活动配置、报名、到店与成交总览',
  signups: '报名来源、到店状态与管家跟进',
  conversions: '体验后跟进、成交状态与店长介入',
  coupons: '优惠券、赠课、积分等权益发放与使用',
  referrals: '老带新推荐关系与奖励状态',
  costs: '物料、礼品、投放等活动成本',
  reviews: '活动结束后的转化与复用复盘',
};

export interface MarketingMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface MarketingInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface MarketingActivityRecord {
  id: string;
  segment: 'activities';
  activityName: string;
  activityType: string;
  stores: string;
  activityTime: string;
  signupCount: number;
  arrivalCount: number;
  revenue: number;
  riskLevel: string;
  status: string;
}

export interface MarketingSignupRecord {
  id: string;
  segment: 'signups';
  signupNo: string;
  memberName: string;
  phoneTail: string;
  activityName: string;
  source: string;
  store: string;
  arrivalStatus: string;
  butler: string;
  riskLevel: string;
}

export interface MarketingConversionRecord {
  id: string;
  segment: 'conversions';
  memberName: string;
  activityName: string;
  arrivalTime: string;
  trialCourse: string;
  teacher: string;
  followStatus: string;
  dealStatus: string;
}

export interface MarketingCouponRecord {
  id: string;
  segment: 'coupons';
  benefitName: string;
  benefitType: string;
  activityName: string;
  issued: number;
  used: number;
  applicableProducts: string;
  validUntil: string;
  riskLevel: string;
}

export interface MarketingReferralRecord {
  id: string;
  segment: 'referrals';
  referrer: string;
  newCustomer: string;
  activityName: string;
  newStatus: string;
  reward: string;
  rewardStatus: string;
  butler: string;
}

export interface MarketingCostRecord {
  id: string;
  segment: 'costs';
  activityName: string;
  costType: string;
  budget: number;
  actual: number;
  vendor: string;
  owner: string;
  voucherStatus: string;
  costRisk: string;
}

export interface MarketingReviewRecord {
  id: string;
  segment: 'reviews';
  activityName: string;
  signupCount: number;
  arrivalRate: string;
  dealCount: number;
  revenue: number;
  cost: number;
  reuseAdvice: string;
  status: string;
}

export type MarketingTableRow =
  | MarketingActivityRecord
  | MarketingSignupRecord
  | MarketingConversionRecord
  | MarketingCouponRecord
  | MarketingReferralRecord
  | MarketingCostRecord
  | MarketingReviewRecord;

export interface MarketingActionItem {
  id: string;
  segment: MarketingSegment;
  group: MarketingActionGroup;
  entityType: MarketingEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  riskLine: string;
  evidenceChain: string[];
  openTab?: MarketingDetailTabId;
}

export interface MarketingSignupLineItem {
  memberName: string;
  source: string;
  store: string;
  arrivalStatus: string;
  butler: string;
  nextAction: string;
}

export interface MarketingConversionLineItem {
  memberName: string;
  trialCourse: string;
  teacher: string;
  butler: string;
  followStatus: string;
  dealStatus: string;
  nextAction: string;
}

export interface MarketingCostLineItem {
  costType: string;
  budget: number;
  actual: number;
  vendor: string;
  voucherStatus: string;
  overBudget: boolean;
}

export interface MarketingOperationLog {
  time: string;
  action: string;
  operator: string;
  note: string;
}

export interface MarketingJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface MarketingDetailRecord {
  id: string;
  entityType: MarketingEntityType;
  segment: MarketingSegment;
  title: string;
  subtitle: string;
  activityType: string;
  stores: string;
  status: string;
  riskLevel: string;
  affectsBenefit: boolean;
  needsReview: boolean;
  todaySuggestion: string;
  judgment: MarketingJudgment;
  activityGoal: string;
  activityTime: string;
  targetAudience: string;
  currentPhase: string;
  revenueNote: string;
  signupCount: number;
  arrivalCount: number;
  revenue: number;
  cost: number;
  signupConfirmed: number;
  signupArrived: number;
  signupNoShow: number;
  signupPendingReminder: number;
  recentSignups: MarketingSignupLineItem[];
  convTrialCount: number;
  convFollowed: number;
  convDealt: number;
  convNoDeal: number;
  convPendingAssign: number;
  conversionList: MarketingConversionLineItem[];
  benefitRemaining: number;
  benefitThreshold: string;
  benefitStackable: string;
  costOverBudget: boolean;
  costRecoveryJudgment: string;
  costDetails: MarketingCostLineItem[];
  reviewDealRate: string;
  reviewRoiJudgment: string;
  reviewOptimizeAdvice: string;
  structuredLogs: MarketingOperationLog[];
  currentRisks: string[];
  signupSummary: string;
  sourceDistribution: string;
  noShowList: string;
  reminderLogs: string[];
  trialMember: string;
  butler: string;
  teacher: string;
  followStatus: string;
  dealStatus: string;
  nextAction: string;
  managerHint: string;
  benefitName: string;
  benefitType: string;
  issued: number;
  used: number;
  applicableProducts: string;
  validUntil: string;
  benefitRisk: string;
  benefitBoundaries: string[];
  budget: number;
  actual: number;
  costType: string;
  vendor: string;
  voucherStatus: string;
  costRatio: string;
  costRisk: string;
  financeHint: string;
  reviewGoal: string;
  arrivalRate: string;
  dealCount: number;
  roiSummary: string;
  userFeedback: string;
  staffFeedback: string;
  reuseAdvice: string;
  operationLogs: string[];
  evidenceChain: string[];
}

export interface MarketingOperationSnapshot {
  metrics: MarketingMetric[];
  insights: MarketingInsight[];
  activities: MarketingActivityRecord[];
  signups: MarketingSignupRecord[];
  conversions: MarketingConversionRecord[];
  coupons: MarketingCouponRecord[];
  referrals: MarketingReferralRecord[];
  costs: MarketingCostRecord[];
  reviews: MarketingReviewRecord[];
  details: MarketingDetailRecord[];
  actionQueue: MarketingActionItem[];
}

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];
const ACTIVITY_TYPES = [
  '节日活动',
  '体验课活动',
  '老带新活动',
  '教培活动',
  '积分兑换活动',
  '会员回访活动',
  '品牌联名活动',
];
const ACTIVITY_NAMES = [
  '520 瑜伽疗愈节',
  '新客体验周',
  '老带新春日礼',
  '普拉提教培开放日',
  '积分兑换专场',
  '沉睡会员唤醒',
  '品牌联名快闪',
  '母亲节专题',
  '夏日燃脂挑战',
  '周年庆预售',
  '社群裂变体验',
  '大众点评专享',
];

const SOURCES = ['小程序', '社群', '朋友圈', '门店邀约', '大众点评', '老会员推荐'];
const BENEFIT_TYPES = ['现金券', '折扣券', '体验权益', '积分加赠', '赠课权益', '礼品兑换'];
const COST_TYPES = ['物料', '礼品', '投放', '摄影', '场地', '合作方费用'];

const mkJudgment = (status: string, risk: string): MarketingJudgment => ({
  summary:
    risk === '高'
      ? '活动链路存在转化或权益风险，建议优先跟进报名未到与体验未转化'
      : status.includes('待复盘')
        ? '活动已结束，需完成复盘结论后方可复用模板'
        : '活动转化链路正常，建议持续跟进管家与权益规则一致性',
  stuck: risk === '高' ? '报名未到或权益异常' : status.includes('待复盘') ? '待复盘' : '—',
  nextStep: '按建议动作跟进，需审批后执行（前端演示）',
});

const benefitBoundaries = [
  '优惠券、赠课、积分、礼品兑换必须有规则来源，不允许前台口头承诺后后台补救。',
  '权益发放与使用以活动配置和规则服务为准。',
  '本页只做权益规则预览，不做真实发券或作废。',
  '敏感权益变更需留痕（前端演示）。',
];

const mkStructuredLogs = (activityName: string): MarketingOperationLog[] => [
  {
    time: '2026-05-14 09:30',
    action: '活动配置预览',
    operator: '运营 A',
    note: `${activityName} · 前端演示，未写入系统`,
  },
  {
    time: '2026-05-14 11:00',
    action: '报名链路查看',
    operator: '管家 B',
    note: '待接入真实活动服务',
  },
  {
    time: '2026-05-14 15:20',
    action: '权益规则核对预览',
    operator: '运营 C',
    note: '需审批后执行，不做真实发券',
  },
];

const mkSignupLine = (s: MarketingSignupRecord): MarketingSignupLineItem => ({
  memberName: s.memberName,
  source: s.source,
  store: s.store,
  arrivalStatus: s.arrivalStatus,
  butler: s.butler,
  nextAction:
    s.arrivalStatus === '未到店'
      ? '提醒到店（预览）'
      : s.arrivalStatus === '已报名'
        ? '确认预约（预览）'
        : '跟进体验转化（预览）',
});

const padSignupLines = (actSignups: MarketingSignupRecord[]): MarketingSignupLineItem[] => {
  const lines = actSignups.slice(0, 5).map(mkSignupLine);
  while (lines.length < 5) {
    const i = lines.length;
    lines.push({
      memberName: `线索${1200 + i}`,
      source: SOURCES[i % SOURCES.length],
      store: STORES[i % STORES.length],
      arrivalStatus: ['已报名', '已确认', '已到店', '未到店'][i % 4],
      butler: ['管家 A', '管家 B', '管家 C'][i % 3],
      nextAction: '确认到店（预览）',
    });
  }
  return lines;
};

const mkConversionLine = (
  c: MarketingConversionRecord,
  butler = '管家 A',
): MarketingConversionLineItem => ({
  memberName: c.memberName,
  trialCourse: c.trialCourse,
  teacher: c.teacher,
  butler,
  followStatus: c.followStatus,
  dealStatus: c.dealStatus,
  nextAction:
    c.followStatus === '待跟进'
      ? '24h 内回访（预览）'
      : c.dealStatus === '犹豫中'
        ? '店长协助谈判（预览）'
        : '持续跟进（预览）',
});

const padConversionLines = (actConvs: MarketingConversionRecord[]): MarketingConversionLineItem[] => {
  const lines = actConvs.slice(0, 5).map(c => mkConversionLine(c));
  while (lines.length < 5) {
    const i = lines.length;
    lines.push({
      memberName: `体验客${500 + i}`,
      trialCourse: ['流瑜伽体验', '普拉提小班', '阴瑜伽'][i % 3],
      teacher: ['李老师', '王老师'][i % 2],
      butler: ['管家 A', '管家 B'][i % 2],
      followStatus: ['待跟进', '已跟进'][i % 2],
      dealStatus: ['未成交', '犹豫中'][i % 2],
      nextAction: '分配管家（预览）',
    });
  }
  return lines;
};

const mkCostLines = (actCosts: MarketingCostRecord[]): MarketingCostLineItem[] => {
  const lines = actCosts.slice(0, 4).map(c => ({
    costType: c.costType,
    budget: c.budget,
    actual: c.actual,
    vendor: c.vendor,
    voucherStatus: c.voucherStatus,
    overBudget: c.actual > c.budget,
  }));
  while (lines.length < 4) {
    const i = lines.length;
    lines.push({
      costType: COST_TYPES[i % COST_TYPES.length],
      budget: [3000, 5000, 8000][i % 3],
      actual: [2800, 5200, 7500][i % 3],
      vendor: ['印刷厂', '礼品商'][i % 2],
      voucherStatus: i % 2 === 0 ? '待上传' : '已登记',
      overBudget: i === 1,
    });
  }
  return lines;
};

const buildDetails = (
  activities: MarketingActivityRecord[],
  signups: MarketingSignupRecord[],
  conversions: MarketingConversionRecord[],
  coupons: MarketingCouponRecord[],
  referrals: MarketingReferralRecord[],
  costs: MarketingCostRecord[],
  reviews: MarketingReviewRecord[],
): MarketingDetailRecord[] => {
  const activityDetails: MarketingDetailRecord[] = activities.map(a => {
    const actSignups = signups.filter(s => s.activityName === a.activityName);
    const actConvs = conversions.filter(c => c.activityName === a.activityName);
    const actCosts = costs.filter(c => c.activityName === a.activityName);
    const totalCost = actCosts.reduce((n, c) => n + c.actual, 0);
    const totalBudget = actCosts.reduce((n, c) => n + c.budget, 0);
    const review = reviews.find(r => r.activityName === a.activityName);
    const confirmed = actSignups.filter(s => s.arrivalStatus === '已确认').length;
    const arrived = actSignups.filter(s => s.arrivalStatus === '已到店').length;
    const noShow = actSignups.filter(s => s.arrivalStatus === '未到店').length;
    const pendingReminder = actSignups.filter(s =>
      ['已报名', '已确认'].includes(s.arrivalStatus),
    ).length;
    const convList = padConversionLines(actConvs);
    const costLines = mkCostLines(actCosts);
    const dealRate =
      actConvs.length > 0
        ? `${Math.round((actConvs.filter(c => c.dealStatus === '已成交').length / actConvs.length) * 100)}%`
        : '—';
    return {
      id: a.id,
      entityType: 'activity',
      segment: 'activities',
      title: a.activityName,
      subtitle: `${a.activityType} · ${a.stores} · ${a.status}`,
      activityType: a.activityType,
      stores: a.stores,
      status: a.status,
      riskLevel: a.riskLevel,
      affectsBenefit: a.activityType.includes('积分') || a.activityType.includes('体验'),
      needsReview: a.status === '已结束待复盘',
      todaySuggestion: `关注 ${a.activityName} 报名 ${a.signupCount} / 到店 ${a.arrivalCount} / 成交 ${formatMarketingCny(a.revenue)}（前端演示）`,
      judgment: mkJudgment(a.status, a.riskLevel),
      activityGoal: '拉新体验 + 续费转化',
      activityTime: a.activityTime,
      targetAudience: a.activityType.includes('老带新') ? '老会员 + 新客线索' : '新客 + 沉睡会员',
      currentPhase:
        a.status === '进行中' ? '报名转化期' : a.status.includes('复盘') ? '复盘沉淀期' : '筹备配置期',
      revenueNote: '前端演示金额，不代表真实财务确认收入',
      signupCount: a.signupCount,
      arrivalCount: a.arrivalCount,
      revenue: a.revenue,
      cost: totalCost || 12800,
      signupConfirmed: confirmed || Math.round(a.signupCount * 0.35),
      signupArrived: arrived || a.arrivalCount,
      signupNoShow: noShow || Math.round(a.signupCount * 0.15),
      signupPendingReminder: pendingReminder || Math.round(a.signupCount * 0.25),
      recentSignups: padSignupLines(actSignups),
      convTrialCount: actConvs.length || Math.round(a.arrivalCount * 0.8),
      convFollowed: actConvs.filter(c => c.followStatus === '已跟进').length || Math.round(a.arrivalCount * 0.5),
      convDealt: actConvs.filter(c => c.dealStatus === '已成交').length || Math.round(a.arrivalCount * 0.2),
      convNoDeal: actConvs.filter(c => c.dealStatus === '未成交').length || Math.round(a.arrivalCount * 0.3),
      convPendingAssign: actConvs.filter(c => c.followStatus === '待跟进').length || 3,
      conversionList: convList,
      benefitRemaining: 58,
      benefitThreshold: '满 ¥3,000 可用',
      benefitStackable: '不可与折扣券叠加',
      costOverBudget: totalCost > totalBudget,
      costRecoveryJudgment:
        a.revenue > totalCost
          ? `成本回收约 ${Math.round((a.revenue / Math.max(totalCost, 1)) * 100)}%（前端演示判断）`
          : '成本回收不足，建议复盘（前端演示）',
      costDetails: costLines,
      reviewDealRate: dealRate,
      reviewRoiJudgment:
        a.revenue > 0
          ? `ROI 约 ${((a.revenue - (totalCost || 12800)) / Math.max(totalCost || 12800, 1)).toFixed(1)}x（前端演示）`
          : '待复盘后判断',
      reviewOptimizeAdvice: '加强体验后 24h 回访；优化权益规则说明',
      structuredLogs: mkStructuredLogs(a.activityName),
      currentRisks: a.riskLevel === '高' ? ['报名未到', '成本占比偏高'] : [],
      signupSummary: `${actSignups.length || a.signupCount} 条报名记录`,
      sourceDistribution: '小程序 40% / 社群 25% / 门店 20%',
      noShowList: actSignups.filter(s => s.arrivalStatus === '未到店').map(s => s.memberName).join('、') || '—',
      reminderLogs: ['2026-05-14 10:00 · 短信提醒预览（前端演示）'],
      trialMember: '—',
      butler: '管家 A',
      teacher: '—',
      followStatus: '—',
      dealStatus: '—',
      nextAction: '跟进未到店名单（预览）',
      managerHint: '—',
      benefitName: '—',
      benefitType: '—',
      issued: 0,
      used: 0,
      applicableProducts: '—',
      validUntil: '—',
      benefitRisk: '—',
      benefitBoundaries,
      budget: totalBudget || 15000,
      actual: totalCost || 12800,
      costType: '综合',
      vendor: '—',
      voucherStatus: '待核对',
      costRatio: totalCost && a.revenue ? `${Math.round((totalCost / a.revenue) * 100)}%` : '—',
      costRisk: a.riskLevel === '高' ? '偏高' : '正常',
      financeHint: '预算成本与实际成本需财务核对后方可确认（前端演示）',
      reviewGoal: review ? '已完成目标 82%' : '待复盘',
      arrivalRate: review?.arrivalRate ?? `${Math.round((a.arrivalCount / Math.max(a.signupCount, 1)) * 100)}%`,
      dealCount: review?.dealCount ?? Math.round(a.arrivalCount * 0.35),
      roiSummary: a.revenue > 0 ? `成交 ${formatMarketingCny(a.revenue)} / 成本 ${formatMarketingCny(totalCost || 12800)}（演示）` : '—',
      userFeedback: '体验氛围好，希望更多小班名额',
      staffFeedback: '晚场跟进人手偏紧',
      reuseAdvice: review?.reuseAdvice ?? '待复盘',
      operationLogs: mkStructuredLogs(a.activityName).map(l => `${l.time} · ${l.action} · ${l.note}`),
      evidenceChain: ['活动', '报名', '到店', '成交'],
    };
  });

  const signupDetails: MarketingDetailRecord[] = signups.map(s => {
    const act = activities.find(a => a.activityName === s.activityName)!;
    const base = activityDetails.find(d => d.id === act.id)!;
    return {
      ...base,
      id: s.id,
      entityType: 'signup',
      segment: 'signups',
      title: s.signupNo,
      subtitle: `${s.memberName} · ${s.activityName} · ${s.arrivalStatus}`,
      todaySuggestion: s.arrivalStatus === '未到店' ? '建议管家提前 1 天确认到店' : '跟进体验转化',
      butler: s.butler,
      trialMember: s.memberName,
      followStatus: s.arrivalStatus === '已到店' ? '已跟进' : '待跟进',
      evidenceChain: ['活动', '报名', '到店', '跟进'],
    };
  });

  const conversionDetails: MarketingDetailRecord[] = conversions.map(c => {
    const act = activities.find(a => a.activityName === c.activityName)!;
    const base = activityDetails.find(d => d.id === act.id)!;
    return {
      ...base,
      id: c.id,
      entityType: 'conversion',
      segment: 'conversions',
      title: `${c.memberName} · ${c.activityName}`,
      subtitle: `${c.trialCourse} · ${c.dealStatus}`,
      todaySuggestion: c.dealStatus === '未成交' ? '体验超过 3 天未跟进，建议分配管家' : '持续跟进成交',
      trialMember: c.memberName,
      teacher: c.teacher,
      followStatus: c.followStatus,
      dealStatus: c.dealStatus,
      nextAction: c.followStatus === '待跟进' ? '24h 内回访' : '—',
      managerHint: c.followStatus === '需店长介入' ? '需店长协助成交谈判' : '—',
      evidenceChain: ['活动', '体验', '管家', '成交'],
    };
  });

  const couponDetails: MarketingDetailRecord[] = coupons.map(c => {
    const act = activities.find(a => a.activityName === c.activityName);
    const base = act ? activityDetails.find(d => d.id === act.id)! : activityDetails[0];
    return {
      ...base,
      id: c.id,
      entityType: 'coupon',
      segment: 'coupons',
      title: c.benefitName,
      subtitle: `${c.benefitType} · ${c.activityName}`,
      affectsBenefit: true,
      benefitName: c.benefitName,
      benefitType: c.benefitType,
      issued: c.issued,
      used: c.used,
      benefitRemaining: c.issued - c.used,
      benefitThreshold: c.benefitType.includes('现金') ? '满 ¥2,000 可用' : '无门槛体验',
      benefitStackable: c.benefitType.includes('折扣') ? '不可叠加' : '可与积分加赠叠加',
      applicableProducts: c.applicableProducts,
      validUntil: c.validUntil,
      benefitRisk: c.riskLevel === '高' ? '规则与活动配置不一致' : '—',
      evidenceChain: ['活动', '优惠券', '使用', '资产'],
    };
  });

  const costDetails: MarketingDetailRecord[] = costs.map(c => {
    const act = activities.find(a => a.activityName === c.activityName)!;
    const base = activityDetails.find(d => d.id === act.id)!;
    const actCosts = costs.filter(x => x.activityName === c.activityName);
    return {
      ...base,
      id: c.id,
      entityType: 'cost',
      segment: 'costs',
      title: `${c.activityName} · ${c.costType}`,
      subtitle: `${c.costType} · ${formatMarketingCny(c.actual)}`,
      budget: c.budget,
      actual: c.actual,
      costType: c.costType,
      vendor: c.vendor,
      voucherStatus: c.voucherStatus,
      costRisk: c.costRisk,
      costOverBudget: c.actual > c.budget,
      costRecoveryJudgment:
        act.revenue > c.actual
          ? '单项成本在预算内（前端演示判断）'
          : '需结合成交判断是否回收（前端演示）',
      costDetails: mkCostLines(actCosts),
      evidenceChain: ['活动', '成本', '成交', '复盘'],
    };
  });

  const reviewDetails: MarketingDetailRecord[] = reviews.map(r => {
    const act = activities.find(a => a.activityName === r.activityName)!;
    const base = activityDetails.find(d => d.id === act.id)!;
    return {
      ...base,
      id: r.id,
      entityType: 'review',
      segment: 'reviews',
      title: `${r.activityName} 复盘`,
      subtitle: `${r.status} · ${r.reuseAdvice}`,
      needsReview: r.status === '已结束待复盘',
      reuseAdvice: r.reuseAdvice,
      arrivalRate: r.arrivalRate,
      dealCount: r.dealCount,
      revenue: r.revenue,
      cost: r.cost,
      evidenceChain: ['活动', '成本', '成交', '复盘'],
    };
  });

  const referralDetails: MarketingDetailRecord[] = referrals.map(r => {
    const act = activities.find(a => a.activityName === r.activityName)!;
    const base = activityDetails.find(d => d.id === act.id)!;
    return {
      ...base,
      id: r.id,
      entityType: 'referral',
      segment: 'referrals',
      title: `${r.referrer} → ${r.newCustomer}`,
      subtitle: `${r.activityName} · ${r.newStatus}`,
      todaySuggestion:
        r.newStatus === '未成交' || r.newStatus === '已流失'
          ? '建议管家跟进新客转化与奖励核对'
          : '核对推荐奖励发放规则',
      trialMember: r.newCustomer,
      butler: r.butler,
      followStatus: r.newStatus === '已成交' ? '已跟进' : '待跟进',
      dealStatus: r.newStatus === '已成交' ? '已成交' : r.newStatus === '未成交' ? '未成交' : '犹豫中',
      nextAction: r.rewardStatus === '待发放' ? '核对奖励后发放（需审批后执行）' : '—',
      evidenceChain: ['活动', '推荐', '新客', '奖励'],
    };
  });

  return [
    ...activityDetails,
    ...signupDetails,
    ...conversionDetails,
    ...couponDetails,
    ...referralDetails,
    ...costDetails,
    ...reviewDetails,
  ];
};

export const buildMarketingOperationSnapshot = (): MarketingOperationSnapshot => {
  const activities: MarketingActivityRecord[] = ACTIVITY_NAMES.map((name, i) => {
    const type = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
    const signup = [48, 36, 28, 22, 18, 15, 42, 30, 25, 20, 35, 16][i];
    const arrival = Math.round(signup * [0.55, 0.6, 0.5, 0.7, 0.45, 0.65, 0.58, 0.52, 0.48, 0.62, 0.55, 0.4][i]);
    const revenue = [86400, 42000, 28000, 156000, 12000, 18000, 52000, 38000, 24000, 96000, 32000, 8000][i];
    return {
      id: `mkt-act-${i + 1}`,
      segment: 'activities',
      activityName: name,
      activityType: type,
      stores: i % 3 === 0 ? '全馆' : STORES[i % STORES.length],
      activityTime: `2026-05-${10 + (i % 10)} ~ 2026-05-${20 + (i % 8)}`,
      signupCount: signup,
      arrivalCount: arrival,
      revenue,
      riskLevel: i < 3 || i === 8 ? '高' : i < 6 ? '中' : '低',
      status: i < 6 ? '进行中' : i < 9 ? '已结束待复盘' : i < 11 ? '已复盘' : '未开始',
    };
  });

  const signups: MarketingSignupRecord[] = Array.from({ length: 28 }, (_, i) => ({
    id: `mkt-sign-${i + 1}`,
    segment: 'signups',
    signupNo: `SG-20260514-${String(i + 1).padStart(3, '0')}`,
    memberName: `会员${1000 + i}`,
    phoneTail: String(8000 + i).slice(-4),
    activityName: ACTIVITY_NAMES[i % ACTIVITY_NAMES.length],
    source: SOURCES[i % SOURCES.length],
    store: STORES[i % STORES.length],
    arrivalStatus: ['已报名', '已确认', '已到店', '未到店', '已取消'][i % 5],
    butler: ['管家 A', '管家 B', '管家 C'][i % 3],
    riskLevel: i % 5 === 3 ? '高' : i % 3 === 0 ? '中' : '低',
  }));

  const conversions: MarketingConversionRecord[] = Array.from({ length: 18 }, (_, i) => ({
    id: `mkt-conv-${i + 1}`,
    segment: 'conversions',
    memberName: `体验客${200 + i}`,
    activityName: ACTIVITY_NAMES[i % 6],
    arrivalTime: `2026-05-14 ${9 + (i % 8)}:${(i * 7) % 60}`,
    trialCourse: ['流瑜伽体验', '普拉提小班', '阴瑜伽', '私教体验'][i % 4],
    teacher: ['李老师', '王老师', '陈老师'][i % 3],
    followStatus: ['待跟进', '已跟进', '需店长介入', '已关闭'][i % 4],
    dealStatus: ['未成交', '已成交', '犹豫中', '不适合'][i % 4],
  }));

  const coupons: MarketingCouponRecord[] = Array.from({ length: 12 }, (_, i) => ({
    id: `mkt-cpn-${i + 1}`,
    segment: 'coupons',
    benefitName: `${['新客', '续费', '体验', '积分'][i % 4]}权益券 ${i + 1}`,
    benefitType: BENEFIT_TYPES[i % BENEFIT_TYPES.length],
    activityName: ACTIVITY_NAMES[i % ACTIVITY_NAMES.length],
    issued: [100, 80, 50, 200, 60, 120][i % 6],
    used: [42, 35, 28, 90, 20, 55][i % 6],
    applicableProducts: '瑜伽月卡 / 体验包',
    validUntil: `2026-06-${15 + (i % 10)}`,
    riskLevel: i < 2 ? '高' : '低',
  }));

  const referrals: MarketingReferralRecord[] = Array.from({ length: 10 }, (_, i) => ({
    id: `mkt-ref-${i + 1}`,
    segment: 'referrals',
    referrer: `老会员${300 + i}`,
    newCustomer: `新客${400 + i}`,
    activityName: '老带新春日礼',
    newStatus: ['已报名', '已到店', '已成交', '未成交', '已流失'][i % 5],
    reward: '赠课 1 节',
    rewardStatus: ['待发放', '已发放', '待核对', '不符合'][i % 4],
    butler: ['管家 A', '管家 B'][i % 2],
  }));

  const costs: MarketingCostRecord[] = Array.from({ length: 10 }, (_, i) => ({
    id: `mkt-cost-${i + 1}`,
    segment: 'costs',
    activityName: ACTIVITY_NAMES[i % ACTIVITY_NAMES.length],
    costType: COST_TYPES[i % COST_TYPES.length],
    budget: [5000, 8000, 12000, 3000, 6000, 15000][i % 6],
    actual: [4800, 9200, 11500, 3200, 6800, 14200][i % 6],
    vendor: ['印刷厂', '礼品商', '投放平台', '摄影工作室'][i % 4],
    owner: '运营 A',
    voucherStatus: i % 3 === 0 ? '待上传' : '已登记',
    costRisk: i === 1 ? '超标' : '正常',
  }));

  const reviews: MarketingReviewRecord[] = ACTIVITY_NAMES.slice(6).map((name, i) => ({
    id: `mkt-rev-${i + 1}`,
    segment: 'reviews',
    activityName: name,
    signupCount: [30, 25, 20, 35, 16, 22][i],
    arrivalRate: ['62%', '55%', '70%', '48%', '58%', '65%'][i],
    dealCount: [8, 6, 12, 5, 4, 7][i],
    revenue: [38000, 24000, 96000, 32000, 8000, 42000][i],
    cost: [9200, 6800, 14200, 4800, 3200, 5600][i],
    reuseAdvice: ['可复用', '需优化', '不建议复用', '待复盘', '可复用', '需优化'][i],
    status: ['已结束待复盘', '已复盘', '进行中', '已结束待复盘', '未开始', '已复盘'][i],
  }));

  const details = buildDetails(activities, signups, conversions, coupons, referrals, costs, reviews);

  const ongoing = activities.filter(a => a.status === '进行中').length;
  const todaySignups = signups.filter(s => s.arrivalStatus !== '已取消').length;
  const todayArrivals = signups.filter(s => s.arrivalStatus === '已到店').length;
  const totalRevenue = activities.reduce((n, a) => n + a.revenue, 0);
  const totalBudget = costs.reduce((n, c) => n + c.budget, 0);
  const totalCost = costs.reduce((n, c) => n + c.actual, 0);
  const riskCount =
    signups.filter(s => s.arrivalStatus === '未到店').length +
    conversions.filter(c => c.dealStatus === '未成交' && c.followStatus === '待跟进').length +
    coupons.filter(c => c.riskLevel === '高').length;

  const metrics: MarketingMetric[] = [
    { id: 'mm1', label: '进行中活动', value: `${ongoing} 个`, hint: '节日 / 体验 / 老带新' },
    { id: 'mm2', label: '今日报名', value: `${todaySignups} 人`, hint: '小程序 / 社群 / 门店' },
    { id: 'mm3', label: '今日到店', value: `${todayArrivals} 人`, hint: '已签到 / 待到店' },
    {
      id: 'mm4',
      label: '活动成交',
      value: formatMarketingCny(totalRevenue),
      hint: '前端演示金额 · 体验转化 / 续费 / 升级',
      tone: 'amber',
    },
    {
      id: 'mm5',
      label: '活动成本',
      value: formatMarketingCny(totalCost),
      hint: `预算 ${formatMarketingCny(totalBudget)} / 实际 ${formatMarketingCny(totalCost)}`,
    },
    {
      id: 'mm6',
      label: '活动风险',
      value: `${riskCount} 项`,
      hint: '报名未到 / 成本超标 / 权益异常',
      tone: 'rose',
    },
  ];

  const insights: MarketingInsight[] = [
    {
      id: 'mi1',
      tag: '报名未到风险',
      line: '12 位报名用户尚未确认到店，建议提前提醒',
      actionLabel: '查看',
      actionKey: 'signups',
    },
    {
      id: 'mi2',
      tag: '体验后未转化',
      line: '8 位体验用户超过 3 天未跟进',
      actionLabel: '分配',
      actionKey: 'conversions',
    },
    {
      id: 'mi3',
      tag: '成本偏高',
      line: '1 个活动成本占比超过预警线',
      actionLabel: '分析',
      actionKey: 'costs',
    },
    {
      id: 'mi4',
      tag: '优惠权益异常',
      line: '2 张优惠券规则与活动配置不一致',
      actionLabel: '核对',
      actionKey: 'coupons',
    },
  ];

  const actionQueue: MarketingActionItem[] = [
    // 活动列表
    {
      id: 'mq-a1', segment: 'activities', group: 'activityRisk',
      entityType: 'activity', entityId: 'mkt-act-1',
      title: '520 瑜伽疗愈节', statusLabel: '高风险',
      riskLine: '报名未到占比偏高，成本接近预警线',
      evidenceChain: ['活动', '报名', '到店', '成交'], openTab: 'overview',
    },
    {
      id: 'mq-a2', segment: 'activities', group: 'activityRisk',
      entityType: 'activity', entityId: 'mkt-act-2',
      title: '新客体验周', statusLabel: '中风险',
      riskLine: '体验转化跟进滞后',
      evidenceChain: ['活动', '报名', '到店', '成交'],
    },
    {
      id: 'mq-a3', segment: 'activities', group: 'activityRisk',
      entityType: 'activity', entityId: 'mkt-act-9',
      title: '夏日燃脂挑战', statusLabel: '成本预警',
      riskLine: '成本占比接近预警线',
      evidenceChain: ['活动', '成本', '成交', '复盘'], openTab: 'cost',
    },
    {
      id: 'mq-a4', segment: 'activities', group: 'activityRisk',
      entityType: 'activity', entityId: 'mkt-act-3',
      title: '老带新春日礼', statusLabel: '权益风险',
      riskLine: '推荐奖励规则待核对',
      evidenceChain: ['活动', '推荐', '新客', '奖励'],
    },
    {
      id: 'mq-b1', segment: 'activities', group: 'configMissing',
      entityType: 'activity', entityId: 'mkt-act-12',
      title: '大众点评专享', statusLabel: '配置缺失',
      riskLine: '权益规则与适用门店未补齐',
      evidenceChain: ['活动', '配置', '权益', '发布'],
    },
    {
      id: 'mq-b2', segment: 'activities', group: 'configMissing',
      entityType: 'activity', entityId: 'mkt-act-11',
      title: '社群裂变体验', statusLabel: '待补齐',
      riskLine: '活动目标人群与转化路径未配置',
      evidenceChain: ['活动', '配置', '报名', '转化'],
    },
    {
      id: 'mq-c1', segment: 'activities', group: 'endingNoReview',
      entityType: 'activity', entityId: 'mkt-act-7',
      title: '品牌联名快闪', statusLabel: '即将结束',
      riskLine: '活动 3 天后结束，复盘模板未准备',
      evidenceChain: ['活动', '结束', '复盘', '模板'], openTab: 'review',
    },
    {
      id: 'mq-c2', segment: 'activities', group: 'endingNoReview',
      entityType: 'review', entityId: 'mkt-rev-1',
      title: '母亲节专题', statusLabel: '待复盘',
      riskLine: '活动已结束，需生成复盘结论',
      evidenceChain: ['活动', '成本', '成交', '复盘'], openTab: 'review',
    },
    // 报名与到店
    {
      id: 'mq-s1', segment: 'signups', group: 'noShow',
      entityType: 'signup', entityId: 'mkt-sign-4',
      title: '会员1003 · 520 瑜伽疗愈节', statusLabel: '未到店',
      riskLine: '已报名未确认到店，建议提前提醒',
      evidenceChain: ['活动', '报名', '到店', '跟进'], openTab: 'signup',
    },
    {
      id: 'mq-s2', segment: 'signups', group: 'noShow',
      entityType: 'signup', entityId: 'mkt-sign-9',
      title: '会员1008 · 新客体验周', statusLabel: '未到店',
      riskLine: '预约城西馆，待确认到店时间',
      evidenceChain: ['活动', '报名', '到店', '跟进'],
    },
    {
      id: 'mq-s3', segment: 'signups', group: 'noShow',
      entityType: 'signup', entityId: 'mkt-sign-14',
      title: '会员1013 · 普拉提教培', statusLabel: '未到店',
      riskLine: '社群来源，超过 48h 未确认',
      evidenceChain: ['活动', '报名', '到店', '跟进'],
    },
    {
      id: 'mq-s4', segment: 'signups', group: 'noShow',
      entityType: 'signup', entityId: 'mkt-sign-19',
      title: '会员1018', statusLabel: '未到店',
      riskLine: '大众点评来源待确认',
      evidenceChain: ['活动', '报名', '到店', '跟进'],
    },
    {
      id: 'mq-s5', segment: 'signups', group: 'registeredUnconfirmed',
      entityType: 'signup', entityId: 'mkt-sign-1',
      title: '会员1000', statusLabel: '已报名',
      riskLine: '已报名未确认预约门店',
      evidenceChain: ['活动', '报名', '确认', '到店'],
    },
    {
      id: 'mq-s6', segment: 'signups', group: 'registeredUnconfirmed',
      entityType: 'signup', entityId: 'mkt-sign-6',
      title: '会员1005', statusLabel: '已报名',
      riskLine: '小程序报名，待管家确认',
      evidenceChain: ['活动', '报名', '确认', '到店'],
    },
    {
      id: 'mq-s7', segment: 'signups', group: 'arrivalAnomaly',
      entityType: 'signup', entityId: 'mkt-sign-24',
      title: '会员1023', statusLabel: '到店异常',
      riskLine: '签到时间与预约时段不一致',
      evidenceChain: ['活动', '报名', '签到', '异常'],
    },
    {
      id: 'mq-s8', segment: 'signups', group: 'arrivalAnomaly',
      entityType: 'signup', entityId: 'mkt-sign-28',
      title: '会员1027', statusLabel: '跨店异常',
      riskLine: '预约万象馆，实际到店城西馆',
      evidenceChain: ['活动', '报名', '门店', '异常'],
    },
    // 体验转化
    {
      id: 'mq-v1', segment: 'conversions', group: 'noFollowUp',
      entityType: 'conversion', entityId: 'mkt-conv-1',
      title: '体验客200', statusLabel: '待跟进',
      riskLine: '体验后 3 天未跟进',
      evidenceChain: ['活动', '体验', '管家', '成交'], openTab: 'conversion',
    },
    {
      id: 'mq-v2', segment: 'conversions', group: 'noFollowUp',
      entityType: 'conversion', entityId: 'mkt-conv-5',
      title: '体验客204', statusLabel: '待跟进',
      riskLine: '流瑜伽体验后未回访',
      evidenceChain: ['活动', '体验', '管家', '成交'],
    },
    {
      id: 'mq-v3', segment: 'conversions', group: 'noFollowUp',
      entityType: 'conversion', entityId: 'mkt-conv-9',
      title: '体验客208', statusLabel: '待跟进',
      riskLine: '私教体验未转化',
      evidenceChain: ['活动', '体验', '管家', '成交'],
    },
    {
      id: 'mq-v4', segment: 'conversions', group: 'noDeal',
      entityType: 'conversion', entityId: 'mkt-conv-2',
      title: '体验客201', statusLabel: '未成交',
      riskLine: '体验满意但犹豫价格',
      evidenceChain: ['活动', '体验', '成交', '跟进'],
    },
    {
      id: 'mq-v5', segment: 'conversions', group: 'noDeal',
      entityType: 'conversion', entityId: 'mkt-conv-6',
      title: '体验客205', statusLabel: '未成交',
      riskLine: '体验后超过 5 天未成交',
      evidenceChain: ['活动', '体验', '成交', '跟进'],
    },
    {
      id: 'mq-v6', segment: 'conversions', group: 'needButler',
      entityType: 'conversion', entityId: 'mkt-conv-3',
      title: '体验客202', statusLabel: '需分配',
      riskLine: '原管家休假，需重新分配',
      evidenceChain: ['活动', '体验', '管家', '分配'],
    },
    {
      id: 'mq-v7', segment: 'conversions', group: 'needButler',
      entityType: 'conversion', entityId: 'mkt-conv-11',
      title: '体验客210', statusLabel: '需店长介入',
      riskLine: '需店长协助成交谈判',
      evidenceChain: ['活动', '体验', '店长', '成交'],
    },
    // 优惠券 / 权益
    {
      id: 'mq-p1', segment: 'coupons', group: 'ruleConflict',
      entityType: 'coupon', entityId: 'mkt-cpn-1',
      title: '新客权益券 1', statusLabel: '规则异常',
      riskLine: '优惠券规则与活动配置不一致',
      evidenceChain: ['活动', '优惠券', '使用', '资产'], openTab: 'coupon',
    },
    {
      id: 'mq-p2', segment: 'coupons', group: 'ruleConflict',
      entityType: 'coupon', entityId: 'mkt-cpn-2',
      title: '续费权益券 2', statusLabel: '待核对',
      riskLine: '适用产品与活动文案不一致',
      evidenceChain: ['活动', '优惠券', '规则', '核对'],
    },
    {
      id: 'mq-p3', segment: 'coupons', group: 'expiring',
      entityType: 'coupon', entityId: 'mkt-cpn-5',
      title: '体验权益券 5', statusLabel: '即将过期',
      riskLine: '7 天内到期，使用率偏低',
      evidenceChain: ['活动', '优惠券', '过期', '提醒'],
    },
    {
      id: 'mq-p4', segment: 'coupons', group: 'expiring',
      entityType: 'coupon', entityId: 'mkt-cpn-8',
      title: '积分权益券 8', statusLabel: '即将过期',
      riskLine: '剩余 12 张未使用',
      evidenceChain: ['活动', '优惠券', '过期', '提醒'],
    },
    {
      id: 'mq-p5', segment: 'coupons', group: 'issuedUnused',
      entityType: 'coupon', entityId: 'mkt-cpn-3',
      title: '体验权益券 3', statusLabel: '发放未使用',
      riskLine: '已发放 50 张，仅使用 28 张',
      evidenceChain: ['活动', '优惠券', '发放', '使用'],
    },
    {
      id: 'mq-p6', segment: 'coupons', group: 'issuedUnused',
      entityType: 'coupon', entityId: 'mkt-cpn-6',
      title: '赠课权益券 6', statusLabel: '低使用率',
      riskLine: '发放后 2 周使用率不足 30%',
      evidenceChain: ['活动', '优惠券', '发放', '使用'],
    },
    // 老带新
    {
      id: 'mq-r1', segment: 'referrals', group: 'rewardPending',
      entityType: 'referral', entityId: 'mkt-ref-1',
      title: '老会员300 → 新客400', statusLabel: '奖励待发',
      riskLine: '新客已成交，奖励待确认发放',
      evidenceChain: ['活动', '推荐', '成交', '奖励'],
    },
    {
      id: 'mq-r2', segment: 'referrals', group: 'rewardPending',
      entityType: 'referral', entityId: 'mkt-ref-5',
      title: '老会员304 → 新客404', statusLabel: '待核对',
      riskLine: '赠课奖励需核对规则后发放',
      evidenceChain: ['活动', '推荐', '奖励', '核对'],
    },
    {
      id: 'mq-r3', segment: 'referrals', group: 'relationCheck',
      entityType: 'referral', entityId: 'mkt-ref-3',
      title: '老会员302 → 新客402', statusLabel: '关系待核',
      riskLine: '推荐关系缺少活动报名关联',
      evidenceChain: ['活动', '推荐', '关系', '核对'],
    },
    {
      id: 'mq-r4', segment: 'referrals', group: 'newNoArrival',
      entityType: 'referral', entityId: 'mkt-ref-2',
      title: '老会员301 → 新客401', statusLabel: '新客未到店',
      riskLine: '新客已报名 3 天未到店',
      evidenceChain: ['活动', '推荐', '报名', '到店'],
    },
    {
      id: 'mq-r5', segment: 'referrals', group: 'newNoArrival',
      entityType: 'referral', entityId: 'mkt-ref-7',
      title: '老会员306 → 新客406', statusLabel: '新客未到店',
      riskLine: '管家已提醒，待二次确认',
      evidenceChain: ['活动', '推荐', '报名', '到店'],
    },
    // 成本与物料
    {
      id: 'mq-k1', segment: 'costs', group: 'overBudget',
      entityType: 'cost', entityId: 'mkt-cost-2',
      title: '新客体验周 · 投放', statusLabel: '成本超标',
      riskLine: '实际投放超预算 15%',
      evidenceChain: ['活动', '成本', '成交', '复盘'], openTab: 'cost',
    },
    {
      id: 'mq-k2', segment: 'costs', group: 'overBudget',
      entityType: 'cost', entityId: 'mkt-cost-6',
      title: '周年庆预售 · 合作方', statusLabel: '超预算',
      riskLine: '合作方费用接近预警线',
      evidenceChain: ['活动', '成本', '预算', '预警'],
    },
    {
      id: 'mq-k3', segment: 'costs', group: 'voucherMissing',
      entityType: 'cost', entityId: 'mkt-cost-1',
      title: '520 疗愈节 · 物料', statusLabel: '凭证缺失',
      riskLine: '物料采购凭证待上传',
      evidenceChain: ['活动', '成本', '凭证', '核对'],
    },
    {
      id: 'mq-k4', segment: 'costs', group: 'voucherMissing',
      entityType: 'cost', entityId: 'mkt-cost-4',
      title: '积分兑换 · 礼品', statusLabel: '待上传',
      riskLine: '礼品签收单未登记',
      evidenceChain: ['活动', '成本', '凭证', '核对'],
    },
    {
      id: 'mq-k5', segment: 'costs', group: 'vendorCheck',
      entityType: 'cost', entityId: 'mkt-cost-3',
      title: '教培开放日 · 场地', statusLabel: '供应方待核',
      riskLine: '场地费用与合同报价不一致',
      evidenceChain: ['活动', '成本', '供应方', '核对'],
    },
    // 活动复盘
    {
      id: 'mq-e1', segment: 'reviews', group: 'endNoReview',
      entityType: 'review', entityId: 'mkt-rev-1',
      title: '母亲节专题', statusLabel: '待复盘',
      riskLine: '活动已结束，需生成复盘结论',
      evidenceChain: ['活动', '成本', '成交', '复盘'], openTab: 'review',
    },
    {
      id: 'mq-e2', segment: 'reviews', group: 'endNoReview',
      entityType: 'review', entityId: 'mkt-rev-4',
      title: '社群裂变体验', statusLabel: '待复盘',
      riskLine: '活动结束 5 天，复盘未启动',
      evidenceChain: ['活动', '结束', '复盘', '结论'],
    },
    {
      id: 'mq-e3', segment: 'reviews', group: 'lowConversion',
      entityType: 'review', entityId: 'mkt-rev-2',
      title: '夏日燃脂挑战', statusLabel: '成交率偏低',
      riskLine: '体验成交率低于同类活动均值',
      evidenceChain: ['活动', '体验', '成交', '复盘'],
    },
    {
      id: 'mq-e4', segment: 'reviews', group: 'lowConversion',
      entityType: 'review', entityId: 'mkt-rev-3',
      title: '周年庆预售', statusLabel: '转化偏低',
      riskLine: '报名到店率 48%，低于目标',
      evidenceChain: ['活动', '报名', '到店', '复盘'],
    },
    {
      id: 'mq-e5', segment: 'reviews', group: 'lowRoi',
      entityType: 'activity', entityId: 'mkt-act-9',
      title: '夏日燃脂挑战', statusLabel: '成本回收不足',
      riskLine: '成本占比接近预警线，ROI 偏低',
      evidenceChain: ['活动', '成本', '成交', '复盘'], openTab: 'review',
    },
    {
      id: 'mq-e6', segment: 'reviews', group: 'lowRoi',
      entityType: 'review', entityId: 'mkt-rev-5',
      title: '大众点评专享', statusLabel: '回收不足',
      riskLine: '实际成本高于预算，成交未覆盖',
      evidenceChain: ['活动', '成本', '成交', '复盘'],
    },
  ];

  return {
    metrics,
    insights,
    activities,
    signups,
    conversions,
    coupons,
    referrals,
    costs,
    reviews,
    details,
    actionQueue,
  };
};

export const findMarketingDetail = (snapshot: MarketingOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getMarketingRows = (
  snapshot: MarketingOperationSnapshot,
  segment: MarketingSegment,
): MarketingTableRow[] => {
  switch (segment) {
    case 'activities':
      return snapshot.activities;
    case 'signups':
      return snapshot.signups;
    case 'conversions':
      return snapshot.conversions;
    case 'coupons':
      return snapshot.coupons;
    case 'referrals':
      return snapshot.referrals;
    case 'costs':
      return snapshot.costs;
    case 'reviews':
      return snapshot.reviews;
    default:
      return [];
  }
};

export const filterMarketingRows = (
  rows: MarketingTableRow[],
  segment: MarketingSegment,
  filters: MarketingListFilters,
): MarketingTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    if (segment === 'signups' && filters.arrivalStatus !== '全部') {
      const s = row as MarketingSignupRecord;
      if (s.arrivalStatus !== filters.arrivalStatus) return false;
    }
    if ('activityType' in row && filters.activityType !== '全部' && row.activityType !== filters.activityType)
      return false;
    if ('status' in row && filters.status !== '全部' && !String(row.status).includes(filters.status.replace('已结束', '')))
      if (filters.status !== '全部') {
        const st = String((row as { status: string }).status);
        if (filters.status === '进行中' && st !== '进行中') return false;
        if (filters.status === '已复盘' && st !== '已复盘') return false;
        if (filters.status === '已结束待复盘' && st !== '已结束待复盘') return false;
      }
    if ('riskLevel' in row && filters.risk !== '全部' && row.riskLevel !== filters.risk) return false;
    if ('costRisk' in row && filters.risk === '高' && row.costRisk !== '超标') return false;
    const store =
      'stores' in row ? row.stores : 'store' in row ? row.store : '';
    if (filters.store !== '全部' && store && !String(store).includes(filters.store)) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computeMarketingSegmentMiniSummary = (
  snapshot: MarketingOperationSnapshot,
  segment: MarketingSegment,
): { label: string; value: string }[] => {
  switch (segment) {
    case 'activities': {
      const rows = snapshot.activities;
      return [
        { label: '活动数', value: `${rows.length} 个` },
        { label: '进行中', value: `${rows.filter(a => a.status === '进行中').length} 个` },
        { label: '高风险', value: `${rows.filter(a => a.riskLevel === '高').length} 个` },
        { label: '待复盘', value: `${rows.filter(a => a.status === '已结束待复盘').length} 个` },
      ];
    }
    case 'signups': {
      const rows = snapshot.signups;
      return [
        { label: '报名数', value: `${rows.length} 人` },
        { label: '已到店', value: `${rows.filter(s => s.arrivalStatus === '已到店').length} 人` },
        { label: '未到店', value: `${rows.filter(s => s.arrivalStatus === '未到店').length} 人` },
        { label: '待确认', value: `${rows.filter(s => s.arrivalStatus === '已报名').length} 人` },
      ];
    }
    case 'conversions': {
      const rows = snapshot.conversions;
      return [
        { label: '体验数', value: `${rows.length} 人` },
        { label: '已跟进', value: `${rows.filter(c => c.followStatus === '已跟进').length} 人` },
        { label: '已成交', value: `${rows.filter(c => c.dealStatus === '已成交').length} 人` },
        { label: '未转化', value: `${rows.filter(c => c.dealStatus === '未成交').length} 人` },
      ];
    }
    case 'coupons': {
      const rows = snapshot.coupons;
      const issued = rows.reduce((n, c) => n + c.issued, 0);
      const used = rows.reduce((n, c) => n + c.used, 0);
      return [
        { label: '权益数', value: `${rows.length} 项` },
        { label: '已发放', value: `${issued} 张` },
        { label: '已使用', value: `${used} 张` },
        { label: '规则异常', value: `${rows.filter(c => c.riskLevel === '高').length} 项` },
      ];
    }
    case 'referrals': {
      const rows = snapshot.referrals;
      return [
        { label: '推荐数', value: `${rows.length} 对` },
        { label: '新客到店', value: `${rows.filter(r => ['已到店', '已成交'].includes(r.newStatus)).length} 人` },
        { label: '奖励待发', value: `${rows.filter(r => r.rewardStatus === '待发放').length} 项` },
        { label: '关系待核', value: `${rows.filter(r => r.rewardStatus === '待核对').length} 项` },
      ];
    }
    case 'costs': {
      const rows = snapshot.costs;
      const budget = rows.reduce((n, c) => n + c.budget, 0);
      const actual = rows.reduce((n, c) => n + c.actual, 0);
      return [
        { label: '预算', value: formatMarketingCny(budget) },
        { label: '实际成本', value: formatMarketingCny(actual) },
        { label: '超预算项', value: `${rows.filter(c => c.actual > c.budget).length} 项` },
        { label: '缺凭证', value: `${rows.filter(c => c.voucherStatus === '待上传').length} 项` },
      ];
    }
    case 'reviews': {
      const rows = snapshot.reviews;
      return [
        { label: '已结束', value: `${rows.filter(r => r.status.includes('结束') || r.status === '已复盘').length} 个` },
        { label: '已复盘', value: `${rows.filter(r => r.status === '已复盘').length} 个` },
        { label: '可复用', value: `${rows.filter(r => r.reuseAdvice === '可复用').length} 个` },
        { label: '需优化', value: `${rows.filter(r => r.reuseAdvice === '需优化').length} 个` },
      ];
    }
    default:
      return [];
  }
};

export const getSegmentActionItems = (
  queue: MarketingActionItem[],
  segment: MarketingSegment,
): MarketingActionItem[] => queue.filter(i => i.segment === segment);
