export type CardConfigCategory =
  | 'quota'
  | 'unlimited'
  | 'trial'
  | 'private'
  | 'training'
  | 'archived';

export type CardConfigStatus =
  | 'draft'
  | 'pendingReview'
  | 'active'
  | 'inactive'
  | 'archived'
  | 'contractMissing'
  | 'ruleRisk';

export type ContractBindingStatus =
  | 'bound'
  | 'missing'
  | 'outdated'
  | 'pendingReview';

export type MemberAppVisibilityStatus =
  | 'visible'
  | 'hidden'
  | 'blockedByContract'
  | 'pendingReview';

export interface CardConfigSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface CardConfigFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface CardConfigOperationLog {
  id: string;
  operator: string;
  time: string;
  action: string;
  note: string;
}

export interface CardConfigDrawerDetail {
  cardTypeId: string;
  cardName: string;
  cardCategory: CardConfigCategory;
  cardCategoryLabel: string;
  drawerTitle: string;
  status: CardConfigStatus;
  statusLabel: string;
  price: string;
  pointsTotal: string;
  benefitUnit: string;
  validityDays: string;
  bookingWindowDays: string;
  applicableStores: string;
  salesChannel: string;
  createdBy: string;
  updatedAt: string;
  applicableCourses: string;
  pointDeductionRule: string;
  crossStoreAllowed: boolean;
  crossStoreSettlement: boolean;
  giftBenefitIncluded: boolean;
  giftBenefitNote: string;
  giftBenefitRelation: string;
  bookingWindow: string;
  cancelDeadline: string;
  noShowRule: string;
  leaveRule: string;
  minClassRule: string;
  waitlistRule: string;
  refundSupported: boolean;
  refundRuleId: string;
  refundRuleSummary: string;
  serviceFeeRule: string;
  giftBenefitInRefund: '不计入';
  pointsCashOut: '不折现';
  freezeAllowed: boolean;
  freezeCondition: string;
  transferAllowed: boolean;
  transferFeeRule: string;
  contractTemplateId: string;
  contractTemplateName: string;
  contractVersion: string;
  contractBindingStatus: ContractBindingStatus;
  contractBindingStatusLabel: string;
  keyClauses: string;
  memberSignStatus: string;
  contractRiskNote: string;
  memberAppVisibilityStatus: MemberAppVisibilityStatus;
  memberAppVisibilityLabel: string;
  visibleOnMemberApp: boolean;
  previewName: string;
  previewPrice: string;
  previewBenefit: string;
  previewValidity: string;
  previewBookingWindow: string;
  previewCourses: string;
  previewClauseHint: string;
  openingPointsReward: string;
  consumptionPointsRule: string;
  pointsDeductOnRefund: string;
  giftActivationRule: string;
  giftValidity: string;
  giftRefundNote: string;
  riskReminder: string;
  suggestedAction: string;
  operationLogs: CardConfigOperationLog[];
}

export interface CardConfigRow {
  cardTypeId: string;
  cardName: string;
  cardCategory: CardConfigCategory;
  cardCategoryLabel: string;
  price: string;
  pointsTotal: string;
  benefitUnit: string;
  validityDays: string;
  bookingWindowDays: string;
  applicableStores: string;
  applicableCourses: string;
  transferAllowed: boolean;
  freezeAllowed: boolean;
  refundRuleId: string;
  refundRuleSummary: string;
  contractTemplateId: string;
  contractTemplateName: string;
  contractBindingStatus: ContractBindingStatus;
  contractBindingStatusLabel: string;
  memberAppVisibilityStatus: MemberAppVisibilityStatus;
  memberAppVisibilityLabel: string;
  status: CardConfigStatus;
  statusLabel: string;
  visibleOnMemberApp: boolean;
  salesChannel: string;
  giftBenefitIncluded: boolean;
  giftBenefitNote: string;
  openingPointsReward: string;
  consumptionPointsRule: string;
  riskTags: string[];
  suggestedAction: string;
  createdBy: string;
  updatedAt: string;
  operationLogs: CardConfigOperationLog[];
  drawerDetail: CardConfigDrawerDetail;
}

export interface CardConfigRuleRiskItem {
  id: string;
  riskType: string;
  cardName: string;
  impactScope: string;
  suggestedAction: string;
  ctaLabel: string;
  relatedCardTypeId?: string;
}

export interface NewCardConfigDraft {
  cardName: string;
  cardCategory: string;
  price: string;
  salesChannel: string;
  applicableStores: string;
  visibleOnMemberApp: boolean;
  pointsTotal: string;
  validityDays: string;
  applicableCourses: string;
  pointDeductionRule: string;
  crossStoreAllowed: boolean;
  crossStoreSettlement: boolean;
  bookingWindow: string;
  cancelDeadline: string;
  noShowRule: string;
  leaveRule: string;
  waitlistRule: string;
  refundRule: string;
  freezeRule: string;
  transferRule: string;
  serviceFeeRule: string;
  pointsDeduct: string;
  giftBenefitHandling: string;
  contractTemplate: string;
  contractVersion: string;
  keyClauses: string;
  clauseHighlight: string;
}

export interface CardConfigSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    disclaimer: string;
    newCardToast: string;
    submitToast: string;
    saveDraftToast: string;
    newCardDisclaimer: string;
  };
  summaryItems: CardConfigSummaryItem[];
  categoryTabs: Array<{ id: string; label: string; value: CardConfigCategory | 'all' | 'inactive' }>;
  categoryDescriptions: Record<CardConfigCategory | 'all' | 'inactive', string>;
  filterOptions: CardConfigFilterOption[];
  ruleRisks: CardConfigRuleRiskItem[];
  rows: CardConfigRow[];
  newCardDraft: NewCardConfigDraft;
}

const CATEGORY_LABELS: Record<CardConfigCategory, string> = {
  quota: '额度型',
  unlimited: '畅练型',
  trial: '体验卡',
  private: '私教包',
  training: '教培产品',
  archived: '历史卡',
};

const STATUS_LABELS: Record<CardConfigStatus, string> = {
  draft: '草稿',
  pendingReview: '待审核',
  active: '在售',
  inactive: '已下架',
  archived: '已归档',
  contractMissing: '合同缺失',
  ruleRisk: '规则待确认',
};

const CONTRACT_LABELS: Record<ContractBindingStatus, string> = {
  bound: '已绑定',
  missing: '合同缺失',
  outdated: '版本待更新',
  pendingReview: '待复核',
};

const VISIBILITY_LABELS: Record<MemberAppVisibilityStatus, string> = {
  visible: '会员端可见',
  hidden: '会员端隐藏',
  blockedByContract: '因合同缺失阻断',
  pendingReview: '待审核',
};

const CATEGORY_DESCRIPTIONS: Record<CardConfigCategory | 'all' | 'inactive', string> = {
  all: '统一查看全部卡项配置，优先处理合同缺失与规则待确认事项。',
  quota: '重点配置价格、点数、有效期、预约窗口、适用课程和退费规则。',
  unlimited: '重点配置有效期、适用门店、预约窗口、请假 / 冻结规则。',
  trial: '重点配置体验次数、有效期、购买限制和会员端展示。',
  private: '重点配置课时权益、老师可见范围和合同条款。',
  training: '重点配置课程周期、报名规则、合同模板和分期 / 定金口径。',
  archived: '仅用于历史查看，不允许重新直接销售。',
  inactive: '已下架卡项，仅用于历史查看与规则追溯。',
};

type RowSeed = Omit<
  CardConfigRow,
  'cardCategoryLabel' | 'statusLabel' | 'contractBindingStatusLabel' | 'memberAppVisibilityLabel' | 'drawerDetail'
>;

function logs(
  entries: Array<{ operator: string; time: string; action: string; note: string }>,
): CardConfigOperationLog[] {
  return entries.map((e, i) => ({ id: `log-${i}`, ...e }));
}

function buildDrawer(seed: RowSeed): CardConfigDrawerDetail {
  const isTraining = seed.cardCategory === 'training';
  const isUnlimited = seed.cardCategory === 'unlimited';
  return {
    cardTypeId: seed.cardTypeId,
    cardName: seed.cardName,
    cardCategory: seed.cardCategory,
    cardCategoryLabel: CATEGORY_LABELS[seed.cardCategory],
    drawerTitle: '卡项详情',
    status: seed.status,
    statusLabel: STATUS_LABELS[seed.status],
    price: seed.price,
    pointsTotal: seed.pointsTotal,
    benefitUnit: seed.benefitUnit,
    validityDays: seed.validityDays,
    bookingWindowDays: seed.bookingWindowDays,
    applicableStores: seed.applicableStores,
    salesChannel: seed.salesChannel,
    createdBy: seed.createdBy,
    updatedAt: seed.updatedAt,
    applicableCourses: seed.applicableCourses,
    pointDeductionRule: isUnlimited ? '不限次数，按门店规则扣课' : '按课程类型扣点',
    crossStoreAllowed: seed.applicableStores.includes('全部门店'),
    crossStoreSettlement: seed.applicableStores.includes('全部门店'),
    giftBenefitIncluded: seed.giftBenefitIncluded,
    giftBenefitNote: seed.giftBenefitNote,
    giftBenefitRelation: seed.giftBenefitIncluded ? '主权益与赠送权益分开核算' : '无赠送权益',
    bookingWindow: seed.bookingWindowDays,
    cancelDeadline: isTraining ? '开课前 7 天' : '开课前 4 小时',
    noShowRule: isUnlimited ? '月度爽约 2 次暂停预约' : '爽约扣 1 点',
    leaveRule: seed.freezeAllowed ? '支持请假，需提前申请' : '不支持请假',
    minClassRule: isTraining ? '满 8 人开班' : '满 2 人开班',
    waitlistRule: '满员后开放候补',
    refundSupported: true,
    refundRuleId: seed.refundRuleId,
    refundRuleSummary: seed.refundRuleSummary,
    serviceFeeRule: isTraining ? '定金不退，尾款按协议' : '按剩余点数比例收取',
    giftBenefitInRefund: '不计入',
    pointsCashOut: '不折现',
    freezeAllowed: seed.freezeAllowed,
    freezeCondition: seed.freezeAllowed ? '年费卡支持 1 次冻结，最长 30 天' : '不支持冻结',
    transferAllowed: seed.transferAllowed,
    transferFeeRule: seed.transferAllowed ? '转卡手续费 5%' : '不支持转卡',
    contractTemplateId: seed.contractTemplateId,
    contractTemplateName: seed.contractTemplateName,
    contractVersion: seed.contractTemplateId ? 'v2.3' : '—',
    contractBindingStatus: seed.contractBindingStatus,
    contractBindingStatusLabel: CONTRACT_LABELS[seed.contractBindingStatus],
    keyClauses: seed.contractTemplateName
      ? '退费条款、赠送权益说明、积分规则、适用门店'
      : '合同模板缺失，无法发布会员端',
    memberSignStatus: seed.contractBindingStatus === 'bound' ? '会员端可签署 mock' : '阻断签署',
    contractRiskNote:
      seed.contractBindingStatus === 'missing'
        ? '没有合同模板的卡项不能发布会员端'
        : seed.status === 'ruleRisk'
          ? '赠送权益说明待总部确认'
          : '合同条款需与会员端展示一致',
    memberAppVisibilityStatus: seed.memberAppVisibilityStatus,
    memberAppVisibilityLabel: VISIBILITY_LABELS[seed.memberAppVisibilityStatus],
    visibleOnMemberApp: seed.visibleOnMemberApp,
    previewName: seed.cardName,
    previewPrice: seed.price,
    previewBenefit: `${seed.pointsTotal} · ${seed.applicableCourses}`,
    previewValidity: seed.validityDays,
    previewBookingWindow: seed.bookingWindowDays,
    previewCourses: seed.applicableCourses,
    previewClauseHint: '赠送权益不计入退费 · 积分不折现',
    openingPointsReward: seed.openingPointsReward,
    consumptionPointsRule: seed.consumptionPointsRule,
    pointsDeductOnRefund: '退费时按已享积分扣回',
    giftActivationRule: seed.giftBenefitIncluded ? '开卡后 7 日内激活' : '不适用',
    giftValidity: seed.giftBenefitIncluded ? '与主卡同期' : '不适用',
    giftRefundNote: '赠送权益不计入退费',
    riskReminder:
      seed.status === 'contractMissing'
        ? '合同模板缺失，会员端展示已阻断。'
        : seed.status === 'ruleRisk'
          ? '赠送权益说明待确认，发布前需总部复核。'
          : '当前为 mock 配置页，操作不会真实生效。',
    suggestedAction: seed.suggestedAction,
    operationLogs: seed.operationLogs,
  };
}

function row(seed: RowSeed): CardConfigRow {
  return {
    ...seed,
    cardCategoryLabel: CATEGORY_LABELS[seed.cardCategory],
    statusLabel: STATUS_LABELS[seed.status],
    contractBindingStatusLabel: CONTRACT_LABELS[seed.contractBindingStatus],
    memberAppVisibilityLabel: VISIBILITY_LABELS[seed.memberAppVisibilityStatus],
    drawerDetail: buildDrawer(seed),
  };
}

const RAW_ROWS: CardConfigRow[] = [
  row({
    cardTypeId: 'card-tianxuan',
    cardName: '天选卡',
    cardCategory: 'quota',
    price: '¥19,990',
    pointsTotal: '160 点',
    benefitUnit: '点',
    validityDays: '24 个月',
    bookingWindowDays: '4–7 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 小班 / 普拉提',
    transferAllowed: true,
    freezeAllowed: true,
    refundRuleId: 'refund-quota-v2',
    refundRuleSummary: '按剩余点数退费，赠送权益不计入',
    contractTemplateId: '',
    contractTemplateName: '—',
    contractBindingStatus: 'missing',
    memberAppVisibilityStatus: 'blockedByContract',
    status: 'contractMissing',
    visibleOnMemberApp: false,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: true,
    giftBenefitNote: '赠送 8 点体验权益',
    openingPointsReward: '开卡赠 200 积分',
    consumptionPointsRule: '每节课按扣点规则累计积分',
    riskTags: ['合同缺失', 'P0'],
    suggestedAction: '优先绑定合同模板后再开放会员端',
    createdBy: '运营负责人',
    updatedAt: '2026-06-24 10:30',
    operationLogs: logs([
      { operator: '系统', time: '2026-06-24 09:00', action: '检测到合同缺失', note: '会员端展示已阻断' },
    ]),
  }),
  row({
    cardTypeId: 'card-yinghe',
    cardName: '硬核卡',
    cardCategory: 'quota',
    price: '¥8,990',
    pointsTotal: '72 点',
    benefitUnit: '点',
    validityDays: '15 个月',
    bookingWindowDays: '4–7 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 小班',
    transferAllowed: true,
    freezeAllowed: false,
    refundRuleId: 'refund-quota-v2',
    refundRuleSummary: '按剩余点数退费',
    contractTemplateId: 'ct-quota-v2',
    contractTemplateName: '额度型会员合同 v2.3',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'pendingReview',
    status: 'ruleRisk',
    visibleOnMemberApp: false,
    salesChannel: '门店',
    giftBenefitIncluded: true,
    giftBenefitNote: '赠送权益说明待确认',
    openingPointsReward: '开卡赠 150 积分',
    consumptionPointsRule: '每节课按扣点规则累计积分',
    riskTags: ['规则待确认', '赠送权益'],
    suggestedAction: '确认赠送权益说明与退费口径',
    createdBy: '运营负责人',
    updatedAt: '2026-06-23 16:20',
    operationLogs: logs([
      { operator: '运营负责人', time: '2026-06-23 16:20', action: '标记规则待确认', note: '赠送权益说明待总部复核' },
    ]),
  }),
  row({
    cardTypeId: 'card-pending',
    cardName: '进阶畅练卡',
    cardCategory: 'unlimited',
    price: '¥6,990',
    pointsTotal: '不限次数',
    benefitUnit: '次',
    validityDays: '6 个月',
    bookingWindowDays: '2–5 天',
    applicableStores: '滨江馆 / 城西馆',
    applicableCourses: '团课 / 基础小班',
    transferAllowed: false,
    freezeAllowed: true,
    refundRuleId: 'refund-unlimited-v1',
    refundRuleSummary: '按剩余月份比例退费',
    contractTemplateId: 'ct-unlimited-v1',
    contractTemplateName: '畅练型合同 v1.2',
    contractBindingStatus: 'pendingReview',
    memberAppVisibilityStatus: 'pendingReview',
    status: 'pendingReview',
    visibleOnMemberApp: false,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 80 积分',
    consumptionPointsRule: '每月最多 12 次',
    riskTags: ['待审核'],
    suggestedAction: '提交总部审核后开放会员端',
    createdBy: '运营负责人',
    updatedAt: '2026-06-22 14:00',
    operationLogs: logs([
      { operator: '运营负责人', time: '2026-06-22 14:00', action: '提交审核 mock', note: '待总部复核' },
    ]),
  }),
  row({
    cardTypeId: 'card-chuyu',
    cardName: '初遇卡',
    cardCategory: 'quota',
    price: '¥4,990',
    pointsTotal: '40 点',
    benefitUnit: '点',
    validityDays: '12 个月',
    bookingWindowDays: '4–7 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 小班',
    transferAllowed: true,
    freezeAllowed: true,
    refundRuleId: 'refund-quota-v2',
    refundRuleSummary: '按剩余点数退费，赠送权益不计入',
    contractTemplateId: 'ct-quota-v2',
    contractTemplateName: '额度型会员合同 v2.3',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 100 积分',
    consumptionPointsRule: '每节课按扣点规则累计积分',
    riskTags: [],
    suggestedAction: '维持当前配置，定期复核预约窗口',
    createdBy: '总部管理员',
    updatedAt: '2026-06-20 09:00',
    operationLogs: logs([
      { operator: '总部管理员', time: '2026-06-20 09:00', action: '更新预约窗口', note: '与会员端展示同步 mock' },
    ]),
  }),
  row({
    cardTypeId: 'card-jinli',
    cardName: '锦鲤卡',
    cardCategory: 'quota',
    price: '¥11,990',
    pointsTotal: '96 点',
    benefitUnit: '点',
    validityDays: '18 个月',
    bookingWindowDays: '4–7 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 小班 / 普拉提',
    transferAllowed: true,
    freezeAllowed: true,
    refundRuleId: 'refund-quota-v2',
    refundRuleSummary: '按剩余点数退费',
    contractTemplateId: 'ct-quota-v2',
    contractTemplateName: '额度型会员合同 v2.3',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: true,
    giftBenefitNote: '赠送 4 点体验课',
    openingPointsReward: '开卡赠 180 积分',
    consumptionPointsRule: '每节课按扣点规则累计积分',
    riskTags: [],
    suggestedAction: '维持在售状态',
    createdBy: '总部管理员',
    updatedAt: '2026-06-18 11:30',
    operationLogs: logs([{ operator: '总部管理员', time: '2026-06-18 11:30', action: '配置更新 mock', note: '合同已绑定' }]),
  }),
  row({
    cardTypeId: 'card-flex',
    cardName: '自由 Flex',
    cardCategory: 'trial',
    price: '¥1,390',
    pointsTotal: '10 点',
    benefitUnit: '点',
    validityDays: '3 个月',
    bookingWindowDays: '2–4 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 体验课',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-trial-v1',
    refundRuleSummary: '体验卡不支持退费',
    contractTemplateId: 'ct-trial-v1',
    contractTemplateName: '体验卡合同 v1.0',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '不允许请假',
    openingPointsReward: '不赠送积分',
    consumptionPointsRule: '按体验课扣点',
    riskTags: [],
    suggestedAction: '维持体验卡购买限制',
    createdBy: '运营负责人',
    updatedAt: '2026-06-17 15:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-month',
    cardName: '瑜伽月卡',
    cardCategory: 'unlimited',
    price: '¥1,680',
    pointsTotal: '不限次数',
    benefitUnit: '次',
    validityDays: '30 天',
    bookingWindowDays: '1–3 天',
    applicableStores: '滨江馆',
    applicableCourses: '团课',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-unlimited-v1',
    refundRuleSummary: '月卡不支持退费',
    contractTemplateId: 'ct-unlimited-v1',
    contractTemplateName: '畅练型合同 v1.2',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 50 积分',
    consumptionPointsRule: '每月最多 15 次',
    riskTags: [],
    suggestedAction: '维持本店畅练规则',
    createdBy: '运营负责人',
    updatedAt: '2026-06-16 10:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-season',
    cardName: '瑜伽季卡',
    cardCategory: 'unlimited',
    price: '¥4,280',
    pointsTotal: '不限次数',
    benefitUnit: '次',
    validityDays: '90 天',
    bookingWindowDays: '2–5 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 基础小班',
    transferAllowed: false,
    freezeAllowed: true,
    refundRuleId: 'refund-unlimited-v1',
    refundRuleSummary: '按剩余月份比例退费',
    contractTemplateId: 'ct-unlimited-v1',
    contractTemplateName: '畅练型合同 v1.2',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 120 积分',
    consumptionPointsRule: '每月最多 12 次',
    riskTags: [],
    suggestedAction: '维持在售',
    createdBy: '运营负责人',
    updatedAt: '2026-06-15 09:30',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-year',
    cardName: '瑜伽年卡',
    cardCategory: 'unlimited',
    price: '¥12,800',
    pointsTotal: '不限次数',
    benefitUnit: '次',
    validityDays: '12 个月',
    bookingWindowDays: '2–5 天',
    applicableStores: '全部门店',
    applicableCourses: '团课 / 基础小班',
    transferAllowed: true,
    freezeAllowed: true,
    refundRuleId: 'refund-unlimited-v1',
    refundRuleSummary: '按剩余月份比例退费',
    contractTemplateId: 'ct-unlimited-v1',
    contractTemplateName: '畅练型合同 v1.2',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店 / 会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 300 积分',
    consumptionPointsRule: '每月最多 15 次',
    riskTags: [],
    suggestedAction: '维持在售',
    createdBy: '总部管理员',
    updatedAt: '2026-06-14 11:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-private-10',
    cardName: '私教 10 节包',
    cardCategory: 'private',
    price: '¥6,800',
    pointsTotal: '10 节',
    benefitUnit: '节',
    validityDays: '6 个月',
    bookingWindowDays: '提前 2 天',
    applicableStores: '滨江馆',
    applicableCourses: '私教',
    transferAllowed: false,
    freezeAllowed: true,
    refundRuleId: 'refund-private-v1',
    refundRuleSummary: '按剩余节数退费',
    contractTemplateId: 'ct-private-v1',
    contractTemplateName: '私教包合同 v1.1',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 100 积分',
    consumptionPointsRule: '每节私教累计积分',
    riskTags: [],
    suggestedAction: '维持私教包规则',
    createdBy: '运营负责人',
    updatedAt: '2026-06-13 14:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-private-20',
    cardName: '私教 20 节包',
    cardCategory: 'private',
    price: '¥12,800',
    pointsTotal: '20 节',
    benefitUnit: '节',
    validityDays: '12 个月',
    bookingWindowDays: '提前 2 天',
    applicableStores: '全部门店',
    applicableCourses: '私教',
    transferAllowed: false,
    freezeAllowed: true,
    refundRuleId: 'refund-private-v1',
    refundRuleSummary: '按剩余节数退费',
    contractTemplateId: 'ct-private-v1',
    contractTemplateName: '私教包合同 v1.1',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '开卡赠 200 积分',
    consumptionPointsRule: '每节私教累计积分',
    riskTags: [],
    suggestedAction: '维持在售',
    createdBy: '运营负责人',
    updatedAt: '2026-06-12 10:30',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-ryt200',
    cardName: 'RYT200 教培产品',
    cardCategory: 'training',
    price: '¥28,800',
    pointsTotal: '200 课时',
    benefitUnit: '课时',
    validityDays: '6 个月',
    bookingWindowDays: '开课前 14 天',
    applicableStores: '滨江馆',
    applicableCourses: '教培课程',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-training-v1',
    refundRuleSummary: '定金不退，尾款按协议',
    contractTemplateId: 'ct-training-v1',
    contractTemplateName: '教培产品合同 v1.0',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '不赠送积分',
    consumptionPointsRule: '教培不计入积分商城',
    riskTags: [],
    suggestedAction: '维持教培报名规则',
    createdBy: '总部管理员',
    updatedAt: '2026-06-11 09:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-ryt300',
    cardName: 'RYT300 模块产品',
    cardCategory: 'training',
    price: '¥18,800',
    pointsTotal: '120 课时',
    benefitUnit: '课时',
    validityDays: '4 个月',
    bookingWindowDays: '开课前 14 天',
    applicableStores: '滨江馆',
    applicableCourses: '教培模块课',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-training-v1',
    refundRuleSummary: '退费规则需总部复核',
    contractTemplateId: 'ct-training-v1',
    contractTemplateName: '教培产品合同 v1.0',
    contractBindingStatus: 'outdated',
    memberAppVisibilityStatus: 'hidden',
    status: 'ruleRisk',
    visibleOnMemberApp: false,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '不赠送积分',
    consumptionPointsRule: '教培不计入积分商城',
    riskTags: ['规则待确认', '退费规则'],
    suggestedAction: '教培退费规则需总部复核',
    createdBy: '运营负责人',
    updatedAt: '2026-06-10 16:00',
    operationLogs: logs([
      { operator: '财务', time: '2026-06-10 16:00', action: '标记待复核', note: '退费规则需总部确认' },
    ]),
  }),
  row({
    cardTypeId: 'card-trial-new',
    cardName: '新客体验卡',
    cardCategory: 'trial',
    price: '¥299',
    pointsTotal: '2 次',
    benefitUnit: '次',
    validityDays: '30 天',
    bookingWindowDays: '1–3 天',
    applicableStores: '全部门店',
    applicableCourses: '体验课 / 团课',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-trial-v1',
    refundRuleSummary: '体验卡不支持退费',
    contractTemplateId: 'ct-trial-v1',
    contractTemplateName: '体验卡合同 v1.0',
    contractBindingStatus: 'bound',
    memberAppVisibilityStatus: 'visible',
    status: 'active',
    visibleOnMemberApp: true,
    salesChannel: '会员端',
    giftBenefitIncluded: false,
    giftBenefitNote: '限购 1 次',
    openingPointsReward: '不赠送积分',
    consumptionPointsRule: '体验课不计积分',
    riskTags: [],
    suggestedAction: '维持新客限购规则',
    createdBy: '运营负责人',
    updatedAt: '2026-06-09 11:00',
    operationLogs: logs([]),
  }),
  row({
    cardTypeId: 'card-draft',
    cardName: '夏季促销卡',
    cardCategory: 'quota',
    price: '¥3,990',
    pointsTotal: '32 点',
    benefitUnit: '点',
    validityDays: '10 个月',
    bookingWindowDays: '4–7 天',
    applicableStores: '滨江馆',
    applicableCourses: '团课',
    transferAllowed: false,
    freezeAllowed: false,
    refundRuleId: 'refund-quota-v2',
    refundRuleSummary: '草稿，规则未确认',
    contractTemplateId: '',
    contractTemplateName: '—',
    contractBindingStatus: 'missing',
    memberAppVisibilityStatus: 'hidden',
    status: 'draft',
    visibleOnMemberApp: false,
    salesChannel: '门店',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '待配置',
    consumptionPointsRule: '待配置',
    riskTags: ['草稿'],
    suggestedAction: '完善规则后提交审核',
    createdBy: '运营负责人',
    updatedAt: '2026-06-08 15:30',
    operationLogs: logs([{ operator: '运营负责人', time: '2026-06-08 15:30', action: '保存草稿 mock', note: '未提交审核' }]),
  }),
  row({
    cardTypeId: 'card-legacy',
    cardName: '经典年卡（已下架）',
    cardCategory: 'archived',
    price: '¥9,990',
    pointsTotal: '不限次数',
    benefitUnit: '次',
    validityDays: '12 个月',
    bookingWindowDays: '—',
    applicableStores: '全部门店',
    applicableCourses: '团课',
    transferAllowed: false,
    freezeAllowed: true,
    refundRuleId: 'refund-legacy-v0',
    refundRuleSummary: '历史规则，不再销售',
    contractTemplateId: 'ct-legacy-v0',
    contractTemplateName: '历史合同 v0.9',
    contractBindingStatus: 'outdated',
    memberAppVisibilityStatus: 'hidden',
    status: 'inactive',
    visibleOnMemberApp: false,
    salesChannel: '—',
    giftBenefitIncluded: false,
    giftBenefitNote: '—',
    openingPointsReward: '历史规则',
    consumptionPointsRule: '历史规则',
    riskTags: ['已下架'],
    suggestedAction: '仅历史查看，不可重新销售',
    createdBy: '总部管理员',
    updatedAt: '2025-12-01 10:00',
    operationLogs: logs([{ operator: '总部管理员', time: '2025-12-01 10:00', action: '下架 mock', note: '历史卡项归档' }]),
  }),
];

const STATUS_PRIORITY: Record<CardConfigStatus, number> = {
  contractMissing: 0,
  ruleRisk: 1,
  pendingReview: 2,
  draft: 3,
  active: 4,
  inactive: 5,
  archived: 6,
};

export function sortCardConfigRows(rows: CardConfigRow[]): CardConfigRow[] {
  return [...rows].sort((a, b) => {
    const p = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (p !== 0) return p;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function getCardConfigCategoryClass(category: CardConfigCategory): string {
  const map: Record<CardConfigCategory, string> = {
    quota: 'met-card-config__cat--quota',
    unlimited: 'met-card-config__cat--unlimited',
    trial: 'met-card-config__cat--trial',
    private: 'met-card-config__cat--private',
    training: 'met-card-config__cat--training',
    archived: 'met-card-config__cat--archived',
  };
  return map[category];
}

export function getCardConfigStatusClass(status: CardConfigStatus): string {
  if (status === 'contractMissing' || status === 'ruleRisk') return 'met-card-config__status--warn';
  if (status === 'pendingReview' || status === 'draft') return 'met-card-config__status--pending';
  if (status === 'active') return 'met-card-config__status--active';
  return 'met-card-config__status--muted';
}

export function getCardConfigDrawerDetail(
  rows: CardConfigRow[],
  cardTypeId: string,
): CardConfigDrawerDetail | null {
  return rows.find(r => r.cardTypeId === cardTypeId)?.drawerDetail ?? null;
}

export function buildCardConfigSnapshot(): CardConfigSnapshot {
  return {
    meta: {
      title: '卡项配置',
      subtitle: '统一管理额度型、畅练型、体验卡、私教包和教培产品的规则、合同绑定与会员端展示',
      breadcrumbParent: '产品与权益',
      breadcrumbCurrent: '卡项配置',
      scopeLabel: '总部规则 · 全部门店 · 运营负责人视角',
      description: '用于配置卡项规则、合同绑定和会员端展示状态，识别合同缺失与规则风险。',
      disclaimer:
        '当前为 mock 配置页，所有新增、编辑、上下架、合同绑定和会员端展示操作均不会真实生效。卡项价格、退费规则、合同模板、赠送权益和积分规则需由总部确认后才能发布。',
      newCardToast: '新增卡项（待建设）',
      submitToast: '卡项配置已提交审核（待建设）',
      saveDraftToast: '保存草稿（待建设）',
      newCardDisclaimer: '当前为 mock 配置流程，保存不会真实创建卡项，也不会发布到会员端。',
    },
    summaryItems: [
      { id: 'sum-all', label: '全部卡项', value: '18' },
      { id: 'sum-active', label: '在售卡项', value: '9' },
      { id: 'sum-pending', label: '待审核', value: '3' },
      { id: 'sum-contract', label: '合同缺失', value: '2', isWarning: true },
      { id: 'sum-hidden', label: '会员端隐藏', value: '4' },
      { id: 'sum-inactive', label: '已下架', value: '5' },
      { id: 'sum-risk', label: '规则待确认', value: '4', isWarning: true },
    ],
    categoryTabs: [
      { id: 'tab-all', label: '全部', value: 'all' },
      { id: 'tab-quota', label: '额度型', value: 'quota' },
      { id: 'tab-unlimited', label: '畅练型', value: 'unlimited' },
      { id: 'tab-trial', label: '体验卡', value: 'trial' },
      { id: 'tab-private', label: '私教包', value: 'private' },
      { id: 'tab-training', label: '教培产品', value: 'training' },
      { id: 'tab-inactive', label: '已下架', value: 'inactive' },
    ],
    categoryDescriptions: CATEGORY_DESCRIPTIONS,
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'cat-all', group: 'category', label: '全部分类', value: 'all' },
      { id: 'cat-quota', group: 'category', label: '额度型', value: 'quota' },
      { id: 'cat-unlimited', group: 'category', label: '畅练型', value: 'unlimited' },
      { id: 'cat-trial', group: 'category', label: '体验卡', value: 'trial' },
      { id: 'cat-private', group: 'category', label: '私教包', value: 'private' },
      { id: 'cat-training', group: 'category', label: '教培产品', value: 'training' },
      { id: 'status-all', group: 'status', label: '全部状态', value: 'all' },
      { id: 'status-active', group: 'status', label: '在售', value: 'active' },
      { id: 'status-pending', group: 'status', label: '待审核', value: 'pendingReview' },
      { id: 'status-draft', group: 'status', label: '草稿', value: 'draft' },
      { id: 'status-inactive', group: 'status', label: '已下架', value: 'inactive' },
      { id: 'contract-all', group: 'contract', label: '全部合同', value: 'all' },
      { id: 'contract-bound', group: 'contract', label: '已绑定', value: 'bound' },
      { id: 'contract-missing', group: 'contract', label: '合同缺失', value: 'missing' },
      { id: 'visibility-all', group: 'visibility', label: '全部展示', value: 'all' },
      { id: 'visibility-visible', group: 'visibility', label: '会员端可见', value: 'visible' },
      { id: 'visibility-hidden', group: 'visibility', label: '会员端隐藏', value: 'hidden' },
      { id: 'channel-all', group: 'channel', label: '全部渠道', value: 'all' },
      { id: 'owner-all', group: 'owner', label: '全部负责人', value: 'all' },
    ],
    ruleRisks: [
      {
        id: 'risk-1',
        riskType: '合同缺失',
        cardName: '天选卡',
        impactScope: '会员端展示已阻断',
        suggestedAction: '绑定合同模板后开放会员端',
        ctaLabel: '去处理',
        relatedCardTypeId: 'card-tianxuan',
      },
      {
        id: 'risk-2',
        riskType: '规则不一致',
        cardName: '初遇卡',
        impactScope: '预约窗口与会员端展示不一致',
        suggestedAction: '同步预约窗口配置',
        ctaLabel: '去处理',
        relatedCardTypeId: 'card-chuyu',
      },
      {
        id: 'risk-3',
        riskType: '赠送权益待确认',
        cardName: '硬核卡',
        impactScope: '赠送权益说明未确认',
        suggestedAction: '确认赠送权益与退费口径',
        ctaLabel: '去处理',
        relatedCardTypeId: 'card-yinghe',
      },
      {
        id: 'risk-4',
        riskType: '退费规则待复核',
        cardName: 'RYT300 模块产品',
        impactScope: '教培退费规则需总部复核',
        suggestedAction: '提交总部复核退费规则',
        ctaLabel: '去处理',
        relatedCardTypeId: 'card-ryt300',
      },
    ],
    rows: sortCardConfigRows(RAW_ROWS),
    newCardDraft: {
      cardName: '新卡项 mock',
      cardCategory: '额度型',
      price: '¥5,990',
      salesChannel: '门店 / 会员端',
      applicableStores: '全部门店',
      visibleOnMemberApp: false,
      pointsTotal: '48 点',
      validityDays: '12 个月',
      applicableCourses: '团课 / 小班',
      pointDeductionRule: '按课程类型扣点',
      crossStoreAllowed: true,
      crossStoreSettlement: true,
      bookingWindow: '4–7 天',
      cancelDeadline: '开课前 4 小时',
      noShowRule: '爽约扣 1 点',
      leaveRule: '支持请假',
      waitlistRule: '满员后开放候补',
      refundRule: '按剩余点数退费',
      freezeRule: '支持 1 次冻结',
      transferRule: '转卡手续费 5%',
      serviceFeeRule: '按剩余点数比例',
      pointsDeduct: '退费时按已享积分扣回',
      giftBenefitHandling: '赠送权益不计入退费',
      contractTemplate: '额度型会员合同 v2.3',
      contractVersion: 'v2.3',
      keyClauses: '退费、赠送权益、积分规则',
      clauseHighlight: '赠送权益不计入退费 · 积分不折现',
    },
  };
}
