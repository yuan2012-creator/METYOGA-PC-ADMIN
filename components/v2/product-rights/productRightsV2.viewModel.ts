/** 产品与权益 v1.1 — mock 数据与类型（引导式分层） */

export type ProductRightsConfigStatus =
  | 'configured'
  | 'partial'
  | 'pending'
  | 'confirm';

export type ProductRightsPriority = 'P0' | 'P1' | 'P2';

export type ProductCardCategory = 'quota' | 'trial' | 'flex';

export type ProductShelfStatus = 'onShelf' | 'draft' | 'soldOut' | 'offShelf';

export type MallProductType = 'physical' | 'course' | 'merch' | 'service';

export interface ProductRightsPageMeta {
  title: string;
  subtitle: string;
}

export interface ProductRightsHealthSummary {
  statusLabel: string;
  conclusion: string;
  description: string;
  impactScopeTags: string[];
  updatedAt: string;
  suggestionSourceLabel: string;
  metrics: { label: string; value: string }[];
  evidenceButtonLabel: string;
  evidenceToastMessage: string;
  primaryActionLabel: string;
  primaryActionToastMessage: string;
  cardConfigListLabel: string;
  pointsMallConfigListLabel: string;
  opensCardConfigOnPrimary?: boolean;
  openNewCardOnPrimary?: boolean;
}

export interface ProductRightsPriorityAction {
  id: string;
  priority: ProductRightsPriority;
  title: string;
  impactScope: string;
  ownerRole: string;
  suggestedAction: string;
  source: string;
  buttonLabel: string;
  actionToast: string;
  opensCardConfig?: boolean;
  opensPointsMall?: boolean;
}

export interface ProductRightsConfigDomain {
  id: string;
  title: string;
  status: ProductRightsConfigStatus;
  statusLabel: string;
  coverage: string;
  pendingItem: string;
  impactModules: string;
  featured?: boolean;
  actionLabel: string;
  actionToast: string;
  opensCardConfig?: boolean;
  opensPointsMall?: boolean;
}

export interface ProductCardSummary {
  cardTypeId: string;
  cardName: string;
  cardCategory: ProductCardCategory;
  cardCategoryLabel: string;
  price: string;
  pointsTotal: string;
  validityDays: string;
  bookingWindowDays?: string;
  applicableStores: string;
  contractBindingLabel?: string;
  status: ProductShelfStatus;
  statusLabel: string;
  visibleOnMemberApp: boolean;
  ruleNotes?: string[];
}

export interface PointsMallSummary {
  onShelfCount: string;
  soldOutCount: string;
  lowStockCount: string;
  approvalRequiredCount: string;
  monthlyExchangeCount: string;
  disclaimer: string;
}

export interface MallProductSummary {
  productId: string;
  productName: string;
  productType: MallProductType;
  productTypeLabel: string;
  pointsPrice: string;
  stock: string;
  shelfStatus: ProductShelfStatus;
  shelfStatusLabel: string;
  deliveryMethod: string;
  riskNote?: string;
}

export interface ProductRightsPermissionRow {
  role: string;
  summary: string;
}

export interface ProductRightsDetailEntry {
  id: string;
  label: string;
  actionToast: string;
  opensCardConfig?: boolean;
  opensPointsMall?: boolean;
}

export interface ProductRightsSnapshot {
  meta: ProductRightsPageMeta;
  healthSummary: ProductRightsHealthSummary;
  priorityActions: ProductRightsPriorityAction[];
  configDomains: ProductRightsConfigDomain[];
  cardProducts: ProductCardSummary[];
  cardProductsViewAllLabel: string;
  pointsMallViewAllLabel: string;
  pointsMallSummary: PointsMallSummary;
  mallProducts: MallProductSummary[];
  rightsGuardrails: string[];
  permissionBoundaries: ProductRightsPermissionRow[];
  detailEntries: ProductRightsDetailEntry[];
}

export function getProductRightsStatusClass(status: ProductRightsConfigStatus): string {
  const map: Record<ProductRightsConfigStatus, string> = {
    configured: 'is-configured',
    partial: 'is-partial',
    pending: 'is-pending',
    confirm: 'is-confirm',
  };
  return map[status];
}

export function getProductRightsPriorityClass(priority: ProductRightsPriority): string {
  const map: Record<ProductRightsPriority, string> = {
    P0: 'is-p0',
    P1: 'is-p1',
    P2: 'is-p2',
  };
  return map[priority];
}

export function buildProductRightsV2Snapshot(): ProductRightsSnapshot {
  return {
    meta: {
      title: '产品与权益',
      subtitle: '卡项、点数、预约权益、积分商城、赠送权益与合同绑定',
    },
    healthSummary: {
      statusLabel: '待完善',
      conclusion: '产品与权益配置状态：待完善',
      description:
        '当前卡项、积分、赠送权益与合同条款已具备基础配置，但仍有 2 个卡项未绑定最新合同，4 条积分 / 赠送权益规则待确认，需在会员端展示前完成校准。',
      impactScopeTags: ['会员端展示', '财务退费', '积分商城', '合同证据链'],
      updatedAt: '2026-06-26 09:30',
      suggestionSourceLabel: '系统规则建议',
      metrics: [
        { label: '已启用卡项', value: '8 个' },
        { label: '草稿卡项', value: '2 个' },
        { label: '积分商城上架商品', value: '12 个' },
        { label: '售罄商品', value: '3 个' },
        { label: '待绑定合同', value: '2 项' },
        { label: '待确认规则', value: '4 条' },
      ],
      evidenceButtonLabel: '查看配置证据链',
      evidenceToastMessage: '查看配置证据链（待建设）',
      primaryActionLabel: '新增卡项',
      primaryActionToastMessage: '新增卡项（待建设）',
      cardConfigListLabel: '卡项配置',
      pointsMallConfigListLabel: '积分商城配置',
      opensCardConfigOnPrimary: true,
      openNewCardOnPrimary: true,
    },
    priorityActions: [
      {
        id: 'pa-1',
        priority: 'P0',
        title: '2 个卡项未绑定最新合同模板',
        impactScope: '会员签约与退费证据链',
        ownerRole: '总部管理员 / 运营负责人',
        suggestedAction: '补齐合同模板绑定并同步会员端展示',
        source: '合同与条款绑定',
        buttonLabel: '去处理',
        actionToast: '查看合同绑定（待建设）',
        opensCardConfig: true,
      },
      {
        id: 'pa-2',
        priority: 'P0',
        title: '4 条积分 / 赠送权益规则待确认',
        impactScope: '退费、积分扣回、赠送权益是否计入',
        ownerRole: '运营负责人',
        suggestedAction: '确认积分扣回和赠送权益退费口径',
        source: '积分规则 / 赠送权益配置',
        buttonLabel: '去确认',
        actionToast: '查看积分规则（待建设）',
        opensPointsMall: true,
      },
      {
        id: 'pa-3',
        priority: 'P1',
        title: '3 个积分商品售罄',
        impactScope: '会员兑换体验',
        ownerRole: '运营负责人',
        suggestedAction: '下架售罄商品或补库存',
        source: '积分商城配置',
        buttonLabel: '去处理',
        actionToast: '查看积分商城（待建设）',
        opensPointsMall: true,
      },
      {
        id: 'pa-4',
        priority: 'P1',
        title: '1 条跨店结算规则待财务复核',
        impactScope: '跨店耗课收入分配',
        ownerRole: '财务',
        suggestedAction: '复核消课店 / 卖卡店结算比例',
        source: '点数与耗课规则',
        buttonLabel: '去复核',
        actionToast: '查看点数规则（待建设）',
      },
    ],
    configDomains: [
      {
        id: 'cd-cards',
        title: '卡项配置',
        status: 'partial',
        statusLabel: '部分配置',
        coverage: '额度型 / 畅练型 / 体验卡 / 私教包 / 教培产品',
        pendingItem: '2 个草稿卡项未审核',
        impactModules: '会员端 / 财务与资产 / 合同',
        featured: true,
        actionLabel: '查看卡项配置',
        actionToast: '进入卡项配置（待建设）',
        opensCardConfig: true,
      },
      {
        id: 'cd-points',
        title: '点数与耗课规则',
        status: 'configured',
        statusLabel: '已配置',
        coverage: '课程扣点、最低开班、爽约扣点、跨店结算',
        pendingItem: '跨店结算待财务复核',
        impactModules: '课程与排课 / 今日运营 / 财务与资产',
        actionLabel: '查看点数规则',
        actionToast: '进入点数与耗课规则（待建设）',
      },
      {
        id: 'cd-booking',
        title: '预约与权益规则',
        status: 'partial',
        statusLabel: '部分配置',
        coverage: '预约窗口、取消时限、请假、冻结、转卡、退费',
        pendingItem: '赠送权益激活规则需确认',
        impactModules: '会员端 / 今日运营 / 会员经营',
        actionLabel: '查看预约权益',
        actionToast: '进入预约与权益规则（待建设）',
      },
      {
        id: 'cd-points-rule',
        title: '积分规则',
        status: 'pending',
        statusLabel: '待完善',
        coverage: '积分获取、开卡积分、耗课积分、退费扣回、过期规则',
        pendingItem: '退费时积分扣回规则需确认',
        impactModules: '会员端 / 积分商城 / 退费',
        featured: true,
        actionLabel: '查看积分规则',
        actionToast: '进入积分规则（待建设）',
      },
      {
        id: 'cd-mall',
        title: '积分商城配置',
        status: 'partial',
        statusLabel: '部分配置',
        coverage: '实物、课程权益、周边、服务权益',
        pendingItem: '3 个售罄，2 个库存低',
        impactModules: '会员端 / 积分规则',
        actionLabel: '查看积分商城',
        actionToast: '进入积分商城配置（待建设）',
        opensPointsMall: true,
      },
      {
        id: 'cd-gift',
        title: '赠送权益配置',
        status: 'confirm',
        statusLabel: '待确认',
        coverage: '赠送点数、赠送课程、活动权益',
        pendingItem: '激活与过期规则待确认',
        impactModules: '会员端 / 退费 / 会员经营',
        actionLabel: '查看赠送权益',
        actionToast: '进入赠送权益配置（待建设）',
      },
      {
        id: 'cd-contract',
        title: '合同与条款绑定',
        status: 'pending',
        statusLabel: '待完善',
        coverage: '会员合同、退费条款、积分条款、赠送权益条款',
        pendingItem: '2 个卡项未绑定最新模板',
        impactModules: '会员端签约 / 退费证据链 / 操作日志',
        featured: true,
        actionLabel: '查看合同绑定',
        actionToast: '进入合同与条款绑定（待建设）',
        opensCardConfig: true,
      },
    ],
    cardProductsViewAllLabel: '查看全部卡项 / 配置卡项',
    pointsMallViewAllLabel: '查看全部商品 / 配置积分商城',
    cardProducts: [
      {
        cardTypeId: 'card-chuyu',
        cardName: '初遇卡',
        cardCategory: 'quota',
        cardCategoryLabel: '额度型',
        price: '¥4,990',
        pointsTotal: '40 点',
        validityDays: '12 个月',
        bookingWindowDays: '4–7 天',
        applicableStores: '全部门店',
        contractBindingLabel: '已绑定',
        status: 'onShelf',
        statusLabel: '上架',
        visibleOnMemberApp: true,
      },
      {
        cardTypeId: 'card-jinli',
        cardName: '锦鲤卡',
        cardCategory: 'quota',
        cardCategoryLabel: '额度型',
        price: '¥11,990',
        pointsTotal: '96 点',
        validityDays: '18 个月',
        applicableStores: '全部门店',
        status: 'onShelf',
        statusLabel: '上架',
        visibleOnMemberApp: true,
      },
      {
        cardTypeId: 'card-tianxuan',
        cardName: '天选卡',
        cardCategory: 'quota',
        cardCategoryLabel: '额度型',
        price: '¥19,990',
        pointsTotal: '160 点',
        validityDays: '24 个月',
        applicableStores: '全部门店',
        status: 'onShelf',
        statusLabel: '上架',
        visibleOnMemberApp: true,
      },
      {
        cardTypeId: 'card-flex',
        cardName: '自由 Flex',
        cardCategory: 'flex',
        cardCategoryLabel: '体验 / 灵活点卡',
        price: '¥1,390',
        pointsTotal: '10 点',
        validityDays: '待配置',
        applicableStores: '全部门店',
        status: 'onShelf',
        statusLabel: '上架',
        visibleOnMemberApp: true,
        ruleNotes: ['不允许请假', '赠送权益：不计入退费'],
      },
    ],
    pointsMallSummary: {
      onShelfCount: '12 个',
      soldOutCount: '3 个',
      lowStockCount: '2 个',
      approvalRequiredCount: '4 个',
      monthlyExchangeCount: '28 条',
      disclaimer: '积分不是现金，兑换规则需要与退费和会员端展示保持一致',
    },
    mallProducts: [
      {
        productId: 'mall-socks',
        productName: 'MET 瑜伽袜',
        productType: 'physical',
        productTypeLabel: '实物',
        pointsPrice: '680',
        stock: '12',
        shelfStatus: 'onShelf',
        shelfStatusLabel: '上架',
        deliveryMethod: '门店自提',
      },
      {
        productId: 'mall-trial',
        productName: '小班体验权益',
        productType: 'course',
        productTypeLabel: '课程权益',
        pointsPrice: '1200',
        stock: '不限',
        shelfStatus: 'onShelf',
        shelfStatusLabel: '上架',
        deliveryMethod: '自动发放权益',
      },
      {
        productId: 'mall-bag',
        productName: '品牌帆布袋',
        productType: 'merch',
        productTypeLabel: '周边',
        pointsPrice: '880',
        stock: '0',
        shelfStatus: 'soldOut',
        shelfStatusLabel: '售罄',
        deliveryMethod: '门店自提',
        riskNote: '需补货或下架',
      },
    ],
    rightsGuardrails: [
      '赠送权益默认不计入退费',
      '积分不是现金，不可与实收 / 确认收入混排',
      '卡项上下架必须同步合同模板',
      '会员端展示口径必须与后台配置一致',
      '转卡 / 冻结 / 退费规则不得由店长直接修改',
      '体验卡 / 活动卡需绑定适用门店和有效期',
    ],
    permissionBoundaries: [
      { role: '总部管理员', summary: '创建 / 编辑 / 上下架 / 归档' },
      { role: '运营负责人', summary: '编辑业务规则 / 提交审核' },
      { role: '财务', summary: '查看价格、退款、结算、积分影响' },
      { role: '店长', summary: '查看本店适用卡项，可提交调整申请，不可改价格和退费规则' },
      { role: '前台 / 管家', summary: '查看可售卡项和会员权益' },
      { role: '老师', summary: '仅查看课程消耗相关必要信息' },
    ],
    detailEntries: [
      { id: 'de-cards', label: '进入卡项配置', actionToast: '进入卡项配置（待建设）', opensCardConfig: true },
      { id: 'de-mall', label: '积分商城配置', actionToast: '进入积分商城（待建设）', opensPointsMall: true },
      { id: 'de-points', label: '进入积分规则', actionToast: '进入积分规则（待建设）' },
      { id: 'de-contract', label: '进入合同绑定', actionToast: '进入合同绑定（待建设）' },
      { id: 'de-log', label: '查看操作日志', actionToast: '查看操作日志（待建设）' },
      { id: 'de-apply', label: '提交调整申请', actionToast: '提交调整申请（待建设）' },
    ],
  };
}
