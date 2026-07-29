export type PointsMallProductType =
  | 'physical'
  | 'courseVoucher'
  | 'experience'
  | 'service'
  | 'offlinePickup'
  | 'archived';

export type PointsMallShelfStatus =
  | 'draft'
  | 'onShelf'
  | 'offShelf'
  | 'soldOut'
  | 'pendingReview'
  | 'ruleRisk';

export type PointsMallStockStatus =
  | 'sufficient'
  | 'lowStock'
  | 'soldOut'
  | 'unlimited'
  | 'notApplicable';

export type PointsMallApprovalStatus =
  | 'notRequired'
  | 'approvalRequired'
  | 'pendingReview'
  | 'approvedMock'
  | 'rejectedMock';

export type PointsMallVisibilityStatus =
  | 'visible'
  | 'hidden'
  | 'blockedByRule'
  | 'pendingReview';

export interface PointsMallSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface PointsMallFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface PointsMallOperationLog {
  id: string;
  operator: string;
  time: string;
  action: string;
  note: string;
}

export interface PointsMallProductDrawerDetail {
  productId: string;
  productName: string;
  productType: PointsMallProductType;
  productTypeLabel: string;
  drawerTitle: string;
  shelfStatus: PointsMallShelfStatus;
  shelfStatusLabel: string;
  pointsPrice: string;
  stock: string;
  stockWarningLine: string;
  stockStatus: PointsMallStockStatus;
  stockStatusLabel: string;
  applicableStores: string;
  deliveryMethod: string;
  visibleOnMemberApp: boolean;
  visibilityStatus: PointsMallVisibilityStatus;
  visibilityStatusLabel: string;
  createdBy: string;
  updatedAt: string;
  redeemLimit: string;
  monthlyRedeemLimit: string;
  allowRepeatRedeem: boolean;
  pointsDeductionMethod: string;
  pointsRefundRule: string;
  applicableMembers: string;
  redeemValidity: string;
  redeemApprovalRequired: boolean;
  approvalStatus: PointsMallApprovalStatus;
  approvalStatusLabel: string;
  requiresReservation: boolean;
  requiresPickup: boolean;
  redeemMethod: string;
  expiryHandling: string;
  pickupStores: string;
  crossStorePickup: boolean;
  pickupNote: string;
  approver: string;
  writeOffBy: string;
  writeOffMethod: string;
  writeOffRecordSummary: string;
  approvalRiskNote: string;
  previewName: string;
  previewPoints: string;
  previewDescription: string;
  previewStockStatus: string;
  previewRedeemLimit: string;
  previewStores: string;
  previewDelivery: string;
  previewImportantNote: string;
  totalExchangeCount: number;
  monthlyExchangeCount: number;
  pendingWriteOffCount: number;
  writtenOffCount: number;
  abnormalExchangeCount: number;
  riskReminder: string;
  suggestedAction: string;
  operationLogs: PointsMallOperationLog[];
}

export interface PointsMallProductRow {
  productId: string;
  productName: string;
  productType: PointsMallProductType;
  productTypeLabel: string;
  pointsPrice: string;
  stock: string;
  stockWarningLine: number;
  stockStatus: PointsMallStockStatus;
  stockStatusLabel: string;
  redeemLimit: string;
  monthlyRedeemLimit: string;
  applicableStores: string;
  shelfStatus: PointsMallShelfStatus;
  shelfStatusLabel: string;
  redeemApprovalRequired: boolean;
  approvalStatus: PointsMallApprovalStatus;
  approvalStatusLabel: string;
  deliveryMethod: string;
  redeemMethod: string;
  exchangeRecordCount: number;
  pendingWriteOffCount: number;
  abnormalExchangeCount: number;
  riskTags: string[];
  riskNote: string;
  visibleOnMemberApp: boolean;
  visibilityStatus: PointsMallVisibilityStatus;
  visibilityStatusLabel: string;
  updatedBy: string;
  updatedAt: string;
  operationLogs: PointsMallOperationLog[];
  drawerDetail: PointsMallProductDrawerDetail;
}

export interface PointsMallRuleRiskItem {
  id: string;
  riskType: string;
  productName: string;
  impactScope: string;
  suggestedAction: string;
  ctaLabel: string;
  relatedProductId?: string;
}

export interface NewPointsMallProductDraft {
  productName: string;
  productType: string;
  description: string;
  applicableStores: string;
  visibleOnMemberApp: boolean;
  pointsPrice: string;
  stock: string;
  stockWarningLine: string;
  redeemLimit: string;
  monthlyRedeemLimit: string;
  allowRepeatRedeem: boolean;
  applicableMembers: string;
  redeemValidity: string;
  approvalRequired: boolean;
  requiresReservation: boolean;
  requiresPickup: boolean;
  expiryHandling: string;
  deliveryMethod: string;
  writeOffMethod: string;
  writeOffBy: string;
  crossStorePickup: boolean;
  pickupNote: string;
}

export interface PointsMallSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    disclaimer: string;
    newProductToast: string;
    submitToast: string;
    saveDraftToast: string;
    newProductDisclaimer: string;
  };
  summaryItems: PointsMallSummaryItem[];
  typeTabs: Array<{ id: string; label: string; value: PointsMallProductType | 'all' | 'inactive' }>;
  typeDescriptions: Record<PointsMallProductType | 'all' | 'inactive', string>;
  filterOptions: PointsMallFilterOption[];
  ruleRisks: PointsMallRuleRiskItem[];
  rows: PointsMallProductRow[];
  exchangeRecordEntries: Array<{ id: string; label: string; toast: string }>;
  newProductDraft: NewPointsMallProductDraft;
}

const TYPE_LABELS: Record<PointsMallProductType, string> = {
  physical: '实物周边',
  courseVoucher: '课程券',
  experience: '体验权益',
  service: '服务权益',
  offlinePickup: '线下领取',
  archived: '历史商品',
};

const SHELF_LABELS: Record<PointsMallShelfStatus, string> = {
  draft: '草稿',
  onShelf: '已上架',
  offShelf: '已下架',
  soldOut: '售罄',
  pendingReview: '待审核',
  ruleRisk: '规则待确认',
};

const STOCK_LABELS: Record<PointsMallStockStatus, string> = {
  sufficient: '库存充足',
  lowStock: '库存不足',
  soldOut: '售罄',
  unlimited: '不限库存',
  notApplicable: '不适用',
};

const APPROVAL_LABELS: Record<PointsMallApprovalStatus, string> = {
  notRequired: '无需审批',
  approvalRequired: '需审批',
  pendingReview: '待复核',
  approvedMock: '已通过 mock',
  rejectedMock: '已驳回 mock',
};

const VISIBILITY_LABELS: Record<PointsMallVisibilityStatus, string> = {
  visible: '会员端可见',
  hidden: '会员端隐藏',
  blockedByRule: '因规则缺失阻断',
  pendingReview: '待审核',
};

const TYPE_DESCRIPTIONS: Record<PointsMallProductType | 'all' | 'inactive', string> = {
  all: '统一查看全部积分商品，优先处理库存不足、售罄和规则待确认事项。',
  physical: '重点配置积分价格、库存、领取门店和兑换限制。',
  courseVoucher: '重点配置适用课程、有效期、预约规则和核销方式。',
  experience: '重点配置适用人群、兑换次数和会员端展示。',
  service: '重点配置服务内容、预约方式和门店承接。',
  offlinePickup: '重点配置库存、领取门店和核销记录。',
  archived: '仅历史查看，不允许直接恢复上架。',
  inactive: '已下架商品，仅用于历史查看与规则追溯。',
};

type RowSeed = Omit<
  PointsMallProductRow,
  'productTypeLabel' | 'shelfStatusLabel' | 'stockStatusLabel' | 'approvalStatusLabel' | 'visibilityStatusLabel' | 'drawerDetail'
>;

function logs(entries: Array<{ operator: string; time: string; action: string; note: string }>): PointsMallOperationLog[] {
  return entries.map((e, i) => ({ id: `log-${i}`, ...e }));
}

function buildDrawer(seed: RowSeed): PointsMallProductDrawerDetail {
  return {
    productId: seed.productId,
    productName: seed.productName,
    productType: seed.productType,
    productTypeLabel: TYPE_LABELS[seed.productType],
    drawerTitle: '积分商品详情',
    shelfStatus: seed.shelfStatus,
    shelfStatusLabel: SHELF_LABELS[seed.shelfStatus],
    pointsPrice: seed.pointsPrice,
    stock: seed.stock,
    stockWarningLine: `${seed.stockWarningLine}`,
    stockStatus: seed.stockStatus,
    stockStatusLabel: STOCK_LABELS[seed.stockStatus],
    applicableStores: seed.applicableStores,
    deliveryMethod: seed.deliveryMethod,
    visibleOnMemberApp: seed.visibleOnMemberApp,
    visibilityStatus: seed.visibilityStatus,
    visibilityStatusLabel: VISIBILITY_LABELS[seed.visibilityStatus],
    createdBy: seed.updatedBy,
    updatedAt: seed.updatedAt,
    redeemLimit: seed.redeemLimit,
    monthlyRedeemLimit: seed.monthlyRedeemLimit,
    allowRepeatRedeem: seed.productType !== 'experience',
    pointsDeductionMethod: '兑换时扣减积分，不退现金',
    pointsRefundRule: '兑换后积分不退回，过期作废',
    applicableMembers: seed.redeemApprovalRequired ? '指定会员 / 需审批' : '全部会员',
    redeemValidity: seed.productType === 'courseVoucher' ? '兑换后 30 天有效' : '兑换后 90 天有效',
    redeemApprovalRequired: seed.redeemApprovalRequired,
    approvalStatus: seed.approvalStatus,
    approvalStatusLabel: APPROVAL_LABELS[seed.approvalStatus],
    requiresReservation: seed.productType === 'service',
    requiresPickup: seed.deliveryMethod.includes('领取'),
    redeemMethod: seed.redeemMethod,
    expiryHandling: '过期自动失效，积分不退回',
    pickupStores: seed.applicableStores,
    crossStorePickup: seed.applicableStores.includes('全部门店'),
    pickupNote: seed.deliveryMethod,
    approver: seed.redeemApprovalRequired ? '运营负责人' : '—',
    writeOffBy: seed.productType === 'courseVoucher' ? '前台 / 管家' : '门店前台',
    writeOffMethod: seed.redeemMethod,
    writeOffRecordSummary: `${seed.pendingWriteOffCount} 条待核销 mock`,
    approvalRiskNote: seed.redeemApprovalRequired ? '兑换需人工审批，不可自动发放' : '无需审批',
    previewName: seed.productName,
    previewPoints: seed.pointsPrice,
    previewDescription: seed.riskNote || '积分兑换商品，积分不等同现金',
    previewStockStatus: STOCK_LABELS[seed.stockStatus],
    previewRedeemLimit: `每人限兑 ${seed.redeemLimit}`,
    previewStores: seed.applicableStores,
    previewDelivery: seed.deliveryMethod,
    previewImportantNote: '积分不可折现 · 兑换后不退积分',
    totalExchangeCount: seed.exchangeRecordCount,
    monthlyExchangeCount: Math.max(1, Math.round(seed.exchangeRecordCount * 0.2)),
    pendingWriteOffCount: seed.pendingWriteOffCount,
    writtenOffCount: Math.max(0, seed.exchangeRecordCount - seed.pendingWriteOffCount),
    abnormalExchangeCount: seed.abnormalExchangeCount,
    riskReminder: seed.shelfStatus === 'ruleRisk'
      ? '兑换规则待确认，发布前需总部复核。'
      : seed.stockStatus === 'soldOut' && seed.visibleOnMemberApp
        ? '商品已售罄但仍展示在会员端，建议下架或补库存。'
        : '当前为 mock 配置页，操作不会真实生效。积分不等同现金。',
    suggestedAction: seed.riskNote || '维持当前配置',
    operationLogs: seed.operationLogs,
  };
}

function row(seed: RowSeed): PointsMallProductRow {
  return {
    ...seed,
    productTypeLabel: TYPE_LABELS[seed.productType],
    shelfStatusLabel: SHELF_LABELS[seed.shelfStatus],
    stockStatusLabel: STOCK_LABELS[seed.stockStatus],
    approvalStatusLabel: APPROVAL_LABELS[seed.approvalStatus],
    visibilityStatusLabel: VISIBILITY_LABELS[seed.visibilityStatus],
    drawerDetail: buildDrawer(seed),
  };
}

const RAW_ROWS: PointsMallProductRow[] = [
  row({
    productId: 'pm-bag',
    productName: 'MET YOGA 帆布袋',
    productType: 'physical',
    pointsPrice: '880 积分',
    stock: '0',
    stockWarningLine: 5,
    stockStatus: 'soldOut',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'soldOut',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '到店领取',
    redeemMethod: '前台核销领取',
    exchangeRecordCount: 42,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: ['售罄', '会员端仍展示'],
    riskNote: '已售罄但仍显示在会员端',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-24 10:00',
    operationLogs: logs([{ operator: '系统', time: '2026-06-24 09:30', action: '库存预警', note: '库存为 0' }]),
  }),
  row({
    productId: 'pm-socks',
    productName: '防滑袜',
    productType: 'physical',
    pointsPrice: '680 积分',
    stock: '3',
    stockWarningLine: 5,
    stockStatus: 'lowStock',
    redeemLimit: '2 次',
    monthlyRedeemLimit: '2 次',
    applicableStores: '滨江馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '到店领取',
    redeemMethod: '前台核销领取',
    exchangeRecordCount: 28,
    pendingWriteOffCount: 2,
    abnormalExchangeCount: 0,
    riskTags: ['库存不足'],
    riskNote: '库存低于预警线，建议补库存',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-23 15:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-towel',
    productName: '品牌毛巾',
    productType: 'physical',
    pointsPrice: '520 积分',
    stock: '4',
    stockWarningLine: 8,
    stockStatus: 'lowStock',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '到店领取',
    redeemMethod: '前台核销领取',
    exchangeRecordCount: 15,
    pendingWriteOffCount: 1,
    abnormalExchangeCount: 0,
    riskTags: ['库存不足'],
    riskNote: '库存不足，建议补货',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-22 11:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-group-voucher',
    productName: '单次团课券',
    productType: 'courseVoucher',
    pointsPrice: '800 积分',
    stock: '不限',
    stockWarningLine: 0,
    stockStatus: 'unlimited',
    redeemLimit: '2 次 / 月',
    monthlyRedeemLimit: '2 次',
    applicableStores: '全部门店',
    shelfStatus: 'ruleRisk',
    redeemApprovalRequired: false,
    approvalStatus: 'pendingReview',
    deliveryMethod: '课程核销',
    redeemMethod: '预约后核销',
    exchangeRecordCount: 56,
    pendingWriteOffCount: 8,
    abnormalExchangeCount: 0,
    riskTags: ['规则待确认', '有效期'],
    riskNote: '课程券未绑定有效期规则',
    visibleOnMemberApp: true,
    visibilityStatus: 'pendingReview',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-21 16:30',
    operationLogs: logs([{ operator: '运营负责人', time: '2026-06-21 16:30', action: '标记规则待确认', note: '有效期规则缺失' }]),
  }),
  row({
    productId: 'pm-pilates-voucher',
    productName: '普拉提小班体验券',
    productType: 'courseVoucher',
    pointsPrice: '1200 积分',
    stock: '20',
    stockWarningLine: 5,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '滨江馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: true,
    approvalStatus: 'approvalRequired',
    deliveryMethod: '课程核销',
    redeemMethod: '审批后预约核销',
    exchangeRecordCount: 18,
    pendingWriteOffCount: 3,
    abnormalExchangeCount: 0,
    riskTags: ['需审批'],
    riskNote: '兑换需运营负责人审批',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-20 10:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-private-voucher',
    productName: '私教体验抵扣券',
    productType: 'service',
    pointsPrice: '2000 积分',
    stock: '10',
    stockWarningLine: 3,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '滨江馆',
    shelfStatus: 'ruleRisk',
    redeemApprovalRequired: true,
    approvalStatus: 'pendingReview',
    deliveryMethod: '服务预约',
    redeemMethod: '预约后人工发放',
    exchangeRecordCount: 6,
    pendingWriteOffCount: 2,
    abnormalExchangeCount: 1,
    riskTags: ['规则待确认'],
    riskNote: '服务权益规则待总部确认',
    visibleOnMemberApp: false,
    visibilityStatus: 'blockedByRule',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-19 14:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-shoulder',
    productName: '冻龄肩颈体验',
    productType: 'service',
    pointsPrice: '1500 积分',
    stock: '15',
    stockWarningLine: 5,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '滨江馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '服务预约',
    redeemMethod: '预约后到店核销',
    exchangeRecordCount: 12,
    pendingWriteOffCount: 4,
    abnormalExchangeCount: 0,
    riskTags: [],
    riskNote: '需提前预约，门店承接',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-18 09:30',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-birthday',
    productName: '生日积分礼',
    productType: 'experience',
    pointsPrice: '500 积分',
    stock: '不限',
    stockWarningLine: 0,
    stockStatus: 'unlimited',
    redeemLimit: '1 次 / 年',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '自动发放权益',
    redeemMethod: '系统自动发放',
    exchangeRecordCount: 34,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: [],
    riskNote: '生日当月可兑换',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '总部管理员',
    updatedAt: '2026-06-17 11:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-renewal',
    productName: '续费积分礼',
    productType: 'experience',
    pointsPrice: '300 积分',
    stock: '不限',
    stockWarningLine: 0,
    stockStatus: 'unlimited',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '自动发放权益',
    redeemMethod: '续费后自动发放',
    exchangeRecordCount: 22,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: [],
    riskNote: '续费会员专属',
    visibleOnMemberApp: false,
    visibilityStatus: 'hidden',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-16 10:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-legacy-vip',
    productName: '老会员专属兑换',
    productType: 'experience',
    pointsPrice: '1000 积分',
    stock: '50',
    stockWarningLine: 10,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '滨江馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: true,
    approvalStatus: 'approvalRequired',
    deliveryMethod: '人工发放',
    redeemMethod: '审批后发放',
    exchangeRecordCount: 8,
    pendingWriteOffCount: 2,
    abnormalExchangeCount: 0,
    riskTags: ['需审批'],
    riskNote: '老会员专属，需审批兑换',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-15 14:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-cross-store',
    productName: '跨店领取瑜伽垫',
    productType: 'offlinePickup',
    pointsPrice: '1200 积分',
    stock: '8',
    stockWarningLine: 5,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '跨店领取',
    redeemMethod: '任意门店领取核销',
    exchangeRecordCount: 5,
    pendingWriteOffCount: 1,
    abnormalExchangeCount: 0,
    riskTags: [],
    riskNote: '支持跨店领取',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-14 09:00',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-abnormal',
    productName: '限量周边兑换',
    productType: 'physical',
    pointsPrice: '1500 积分',
    stock: '2',
    stockWarningLine: 5,
    stockStatus: 'lowStock',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '滨江馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: true,
    approvalStatus: 'approvalRequired',
    deliveryMethod: '到店领取',
    redeemMethod: '审批后领取',
    exchangeRecordCount: 14,
    pendingWriteOffCount: 3,
    abnormalExchangeCount: 2,
    riskTags: ['异常兑换', '库存不足'],
    riskNote: '存在异常兑换记录，需复核',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-13 16:00',
    operationLogs: logs([{ operator: '系统', time: '2026-06-13 15:30', action: '异常兑换预警', note: '2 条异常记录 mock' }]),
  }),
  row({
    productId: 'pm-low-course',
    productName: '基础瑜伽体验券',
    productType: 'courseVoucher',
    pointsPrice: '600 积分',
    stock: '6',
    stockWarningLine: 10,
    stockStatus: 'lowStock',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '城西馆',
    shelfStatus: 'onShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '课程核销',
    redeemMethod: '预约后核销',
    exchangeRecordCount: 20,
    pendingWriteOffCount: 5,
    abnormalExchangeCount: 0,
    riskTags: ['低库存课程券'],
    riskNote: '低库存课程券，建议补库存',
    visibleOnMemberApp: true,
    visibilityStatus: 'visible',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-12 10:30',
    operationLogs: logs([]),
  }),
  row({
    productId: 'pm-pending',
    productName: '夏季限定周边',
    productType: 'physical',
    pointsPrice: '990 积分',
    stock: '30',
    stockWarningLine: 10,
    stockStatus: 'sufficient',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'pendingReview',
    redeemApprovalRequired: false,
    approvalStatus: 'pendingReview',
    deliveryMethod: '到店领取',
    redeemMethod: '前台核销领取',
    exchangeRecordCount: 0,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: ['待审核'],
    riskNote: '待总部审核后上架',
    visibleOnMemberApp: false,
    visibilityStatus: 'pendingReview',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-11 14:00',
    operationLogs: logs([{ operator: '运营负责人', time: '2026-06-11 14:00', action: '提交审核 mock', note: '待总部复核' }]),
  }),
  row({
    productId: 'pm-draft',
    productName: '新客积分礼草稿',
    productType: 'experience',
    pointsPrice: '200 积分',
    stock: '不限',
    stockWarningLine: 0,
    stockStatus: 'unlimited',
    redeemLimit: '1 次',
    monthlyRedeemLimit: '1 次',
    applicableStores: '全部门店',
    shelfStatus: 'draft',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '自动发放权益',
    redeemMethod: '系统自动发放',
    exchangeRecordCount: 0,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: ['草稿'],
    riskNote: '草稿商品，规则未完善',
    visibleOnMemberApp: false,
    visibilityStatus: 'hidden',
    updatedBy: '运营负责人',
    updatedAt: '2026-06-10 09:00',
    operationLogs: logs([{ operator: '运营负责人', time: '2026-06-10 09:00', action: '保存草稿 mock', note: '未提交审核' }]),
  }),
  row({
    productId: 'pm-legacy',
    productName: '历史兑换商品',
    productType: 'archived',
    pointsPrice: '500 积分',
    stock: '0',
    stockWarningLine: 0,
    stockStatus: 'notApplicable',
    redeemLimit: '—',
    monthlyRedeemLimit: '—',
    applicableStores: '—',
    shelfStatus: 'offShelf',
    redeemApprovalRequired: false,
    approvalStatus: 'notRequired',
    deliveryMethod: '—',
    redeemMethod: '—',
    exchangeRecordCount: 88,
    pendingWriteOffCount: 0,
    abnormalExchangeCount: 0,
    riskTags: ['已下架'],
    riskNote: '历史商品，不可重新销售',
    visibleOnMemberApp: false,
    visibilityStatus: 'hidden',
    updatedBy: '总部管理员',
    updatedAt: '2025-11-01 10:00',
    operationLogs: logs([{ operator: '总部管理员', time: '2025-11-01 10:00', action: '下架 mock', note: '历史归档' }]),
  }),
];

const SHELF_PRIORITY: Record<PointsMallShelfStatus, number> = {
  ruleRisk: 0,
  soldOut: 1,
  pendingReview: 2,
  draft: 3,
  onShelf: 4,
  offShelf: 5,
};

const STOCK_PRIORITY: Record<PointsMallStockStatus, number> = {
  soldOut: 0,
  lowStock: 1,
  sufficient: 2,
  unlimited: 3,
  notApplicable: 4,
};

export function sortPointsMallRows(rows: PointsMallProductRow[]): PointsMallProductRow[] {
  return [...rows].sort((a, b) => {
    const shelf = SHELF_PRIORITY[a.shelfStatus] - SHELF_PRIORITY[b.shelfStatus];
    if (shelf !== 0) return shelf;
    const stock = STOCK_PRIORITY[a.stockStatus] - STOCK_PRIORITY[b.stockStatus];
    if (stock !== 0) return stock;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function getPointsMallTypeClass(type: PointsMallProductType): string {
  const map: Record<PointsMallProductType, string> = {
    physical: 'met-points-mall__type--physical',
    courseVoucher: 'met-points-mall__type--course',
    experience: 'met-points-mall__type--experience',
    service: 'met-points-mall__type--service',
    offlinePickup: 'met-points-mall__type--offline',
    archived: 'met-points-mall__type--archived',
  };
  return map[type];
}

export function getPointsMallShelfClass(status: PointsMallShelfStatus): string {
  if (status === 'ruleRisk' || status === 'soldOut') return 'met-points-mall__status--warn';
  if (status === 'pendingReview' || status === 'draft') return 'met-points-mall__status--pending';
  if (status === 'onShelf') return 'met-points-mall__status--active';
  return 'met-points-mall__status--muted';
}

export function getPointsMallDrawerDetail(
  rows: PointsMallProductRow[],
  productId: string,
): PointsMallProductDrawerDetail | null {
  return rows.find(r => r.productId === productId)?.drawerDetail ?? null;
}

export function buildPointsMallSnapshot(): PointsMallSnapshot {
  return {
    meta: {
      title: '积分商城配置',
      subtitle: '统一管理积分商城商品、库存、兑换规则、审批要求和会员端展示',
      breadcrumbParent: '产品与权益',
      breadcrumbCurrent: '积分商城配置',
      scopeLabel: '总部规则 · 全部门店 · 运营负责人视角',
      description: '用于配置积分商品、库存预警、兑换审批和会员端展示，识别库存与规则风险。',
      disclaimer:
        '当前为 mock 配置页，所有新增、编辑、上架、下架、补库存、兑换发放和会员端展示操作均不会真实生效。积分不等同现金，不可折现；兑换规则、库存和审批要求需由总部确认后才能发布。',
      newProductToast: '新增积分商品（待建设）',
      submitToast: '积分商品配置已提交审核（待建设）',
      saveDraftToast: '保存草稿（待建设）',
      newProductDisclaimer: '当前为 mock 配置流程，保存不会真实创建商品，也不会发布到会员端。',
    },
    summaryItems: [
      { id: 'sum-all', label: '全部商品', value: '16' },
      { id: 'sum-on', label: '已上架', value: '10' },
      { id: 'sum-low', label: '库存不足', value: '3', isWarning: true },
      { id: 'sum-out', label: '售罄', value: '2', isWarning: true },
      { id: 'sum-approval', label: '需审批兑换', value: '4' },
      { id: 'sum-hidden', label: '会员端隐藏', value: '3' },
      { id: 'sum-risk', label: '规则待确认', value: '4', isWarning: true },
    ],
    typeTabs: [
      { id: 'tab-all', label: '全部', value: 'all' },
      { id: 'tab-physical', label: '实物周边', value: 'physical' },
      { id: 'tab-course', label: '课程券', value: 'courseVoucher' },
      { id: 'tab-exp', label: '体验权益', value: 'experience' },
      { id: 'tab-service', label: '服务权益', value: 'service' },
      { id: 'tab-offline', label: '线下领取', value: 'offlinePickup' },
      { id: 'tab-inactive', label: '已下架', value: 'inactive' },
    ],
    typeDescriptions: TYPE_DESCRIPTIONS,
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'type-all', group: 'type', label: '全部类型', value: 'all' },
      { id: 'type-physical', group: 'type', label: '实物周边', value: 'physical' },
      { id: 'type-course', group: 'type', label: '课程券', value: 'courseVoucher' },
      { id: 'type-exp', group: 'type', label: '体验权益', value: 'experience' },
      { id: 'type-service', group: 'type', label: '服务权益', value: 'service' },
      { id: 'type-offline', group: 'type', label: '线下领取', value: 'offlinePickup' },
      { id: 'shelf-all', group: 'shelf', label: '全部状态', value: 'all' },
      { id: 'shelf-on', group: 'shelf', label: '已上架', value: 'onShelf' },
      { id: 'shelf-off', group: 'shelf', label: '已下架', value: 'offShelf' },
      { id: 'shelf-sold', group: 'shelf', label: '售罄', value: 'soldOut' },
      { id: 'shelf-pending', group: 'shelf', label: '待审核', value: 'pendingReview' },
      { id: 'stock-all', group: 'stock', label: '全部库存', value: 'all' },
      { id: 'stock-low', group: 'stock', label: '库存不足', value: 'lowStock' },
      { id: 'stock-out', group: 'stock', label: '售罄', value: 'soldOut' },
      { id: 'approval-all', group: 'approval', label: '全部审批', value: 'all' },
      { id: 'approval-yes', group: 'approval', label: '需审批', value: 'approvalRequired' },
      { id: 'approval-no', group: 'approval', label: '无需审批', value: 'notRequired' },
      { id: 'vis-all', group: 'visibility', label: '全部展示', value: 'all' },
      { id: 'vis-visible', group: 'visibility', label: '会员端可见', value: 'visible' },
      { id: 'vis-hidden', group: 'visibility', label: '会员端隐藏', value: 'hidden' },
      { id: 'delivery-all', group: 'delivery', label: '全部领取方式', value: 'all' },
      { id: 'owner-all', group: 'owner', label: '全部负责人', value: 'all' },
    ],
    ruleRisks: [
      { id: 'risk-1', riskType: '库存不足', productName: '3 个商品', impactScope: '库存低于预警线', suggestedAction: '补库存或调整会员端展示', ctaLabel: '去处理', relatedProductId: 'pm-socks' },
      { id: 'risk-2', riskType: '售罄仍展示', productName: 'MET YOGA 帆布袋', impactScope: '会员端仍可见但无法兑换', suggestedAction: '下架或补库存', ctaLabel: '去处理', relatedProductId: 'pm-bag' },
      { id: 'risk-3', riskType: '审批规则待确认', productName: '4 个兑换商品', impactScope: '兑换审批规则未统一', suggestedAction: '确认审批人与核销流程', ctaLabel: '去处理', relatedProductId: 'pm-pilates-voucher' },
      { id: 'risk-4', riskType: '有效期规则缺失', productName: '单次团课券', impactScope: '课程券未绑定有效期', suggestedAction: '补充有效期与过期处理规则', ctaLabel: '去处理', relatedProductId: 'pm-group-voucher' },
    ],
    rows: sortPointsMallRows(RAW_ROWS),
    exchangeRecordEntries: [
      { id: 'ex-all', label: '查看全部兑换记录', toast: '兑换记录（待建设）' },
      { id: 'ex-pending', label: '查看待核销记录', toast: '兑换记录（待建设）' },
      { id: 'ex-abnormal', label: '查看异常兑换记录', toast: '兑换记录（待建设）' },
      { id: 'ex-stock', label: '查看库存变更记录', toast: '兑换记录（待建设）' },
    ],
    newProductDraft: {
      productName: '新积分商品 mock',
      productType: '实物周边',
      description: '积分兑换商品说明',
      applicableStores: '全部门店',
      visibleOnMemberApp: false,
      pointsPrice: '800 积分',
      stock: '20',
      stockWarningLine: '5',
      redeemLimit: '1 次',
      monthlyRedeemLimit: '1 次',
      allowRepeatRedeem: false,
      applicableMembers: '全部会员',
      redeemValidity: '兑换后 90 天有效',
      approvalRequired: false,
      requiresReservation: false,
      requiresPickup: true,
      expiryHandling: '过期作废，积分不退回',
      deliveryMethod: '到店领取',
      writeOffMethod: '前台核销领取',
      writeOffBy: '前台 / 管家',
      crossStorePickup: false,
      pickupNote: '凭兑换码到店领取',
    },
  };
}
