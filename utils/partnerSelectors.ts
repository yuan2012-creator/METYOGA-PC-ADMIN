/** 合作授权：治理入口展示；不接接口；不自动变更授权状态 */

export interface PartnerAuthorizationRow {
  id: string;
  partnerStore: string;
  authorizationStatus: string;
  brandUsage: string;
  dataBackhaul: string;
  qualityRecord: string;
  courseAuthorization: string;
  serviceLevel: string;
  rectificationRecord: string;
  renewalExitHint: string;
  riskHints: string[];
}

const ROW_RISK = '当前为授权治理入口；不自动变更授权状态；不生成正式合同或整改通知；待接入授权服务；仅用于授权治理判断';

export const PARTNER_GOVERNANCE_DISCLAIMER_LINES = [
  '当前为授权治理入口',
  '不自动变更授权状态',
  '不生成正式整改通知',
  '不生成正式合同',
  '不自动续约',
  '不自动摘牌',
  '后续需接入真实合作门店数据',
  '仅用于授权治理判断',
] as const;

export interface PartnerStoreDetailRow {
  id: string;
  partnerStore: string;
  cooperationType: string;
  authorizationStatus: string;
  serviceLevel: string;
  cityRegion: string;
  currentPhase: string;
  riskHints: string[];
}

export interface PartnerBrandCourseAuthRow {
  id: string;
  partnerStore: string;
  brandScope: string;
  courseAuthScope: string;
  validityPeriod: string;
  statusLabel: string;
  pendingCheckNote: string;
  riskHints: string[];
}

export interface PartnerDataQualityRow {
  id: string;
  partnerStore: string;
  backhaulStatus: string;
  lastBackhaulAt: string;
  dataCompleteness: string;
  qcStatus: string;
  qcIssues: string;
  suggestedAction: string;
}

export interface PartnerRectificationRenewalRow {
  id: string;
  partnerStore: string;
  problemType: string;
  rectificationRequirement: string;
  owner: string;
  statusLabel: string;
  renewalRisk: string;
  exitDelistingRiskHint: string;
}

const BASE_GOVERNANCE_RISK = '模块内展示；待核对；待接入真实合作数据；不自动变更授权状态；不生成正式合同；不生成整改通知';

export const buildPartnerAuthorizationRows = (): PartnerAuthorizationRow[] => [
  {
    id: 'pa-hz',
    partnerStore: 'MET YOGA 西湖馆（加盟演示）',
    authorizationStatus: '待核对（模块内展示）',
    brandUsage: '门头 / 课件模板：按品牌手册 V1 占位（待接入授权服务）',
    dataBackhaul: '经营日报：回传占位；未接统一数据中台（待接入授权服务）',
    qualityRecord: '质检：最近一次巡检记录待接入（模块内展示）',
    courseAuthorization: '团课 / 小班授权清单：待同步总部课表库（待核对）',
    serviceLevel: '系统服务等级：标准档（演示）',
    rectificationRecord: '整改：无登记（模块内展示）',
    renewalExitHint: '续约窗口：演示占位；不自动续约（待核对）',
    riskHints: [ROW_RISK, '数据回传不完整：待接入权限审计（待接入授权服务）'],
  },
  {
    id: 'pa-qj',
    partnerStore: 'MET YOGA 钱江馆（联营演示）',
    authorizationStatus: '待核对（模块内展示）',
    brandUsage: '联合品牌露出：需总部复核口径（模块内展示）',
    dataBackhaul: '耗课与收款摘要：T+1 占位文件（待接入真实经营数据）',
    qualityRecord: '质检：待排期（模块内展示）',
    courseAuthorization: '教培产品线：授权边界待对齐（待核对）',
    serviceLevel: '系统服务等级：增强档（演示）',
    rectificationRecord: '整改：口头提醒记录占位（不生成整改通知）',
    renewalExitHint: '退出提示：合同周期演示占位；不自动摘牌（待核对）',
    riskHints: [ROW_RISK, '授权边界待复核：待接入统一规则配置'],
  },
  {
    id: 'pa-wx',
    partnerStore: '无锡合作店（意向演示）',
    authorizationStatus: '待核对（模块内展示）',
    brandUsage: '品牌试用：未正式授权（模块内展示）',
    dataBackhaul: '数据回传：未开通（待接入授权服务）',
    qualityRecord: '质检：未开始（模块内展示）',
    courseAuthorization: '课程授权：未下发（待核对）',
    serviceLevel: '系统服务等级：试用档（演示）',
    rectificationRecord: '整改：无（模块内展示）',
    renewalExitHint: '续约 / 退出：待商务对齐（不自动续约）',
    riskHints: [ROW_RISK, '意向阶段：不作为授权完成依据（模块内展示）'],
  },
];

export const buildPartnerStoreDetailRows = (): PartnerStoreDetailRow[] => [
  {
    id: 'ps-hz',
    partnerStore: 'MET YOGA 西湖馆（加盟演示）',
    cooperationType: '加盟（演示）',
    authorizationStatus: '待核对（模块内展示）',
    serviceLevel: '标准档（演示）',
    cityRegion: '浙江 · 杭州 · 西湖区（演示）',
    currentPhase: '运营期 · 授权复核中（模块内展示）',
    riskHints: [BASE_GOVERNANCE_RISK, '授权口径待总部复核（待核对）'],
  },
  {
    id: 'ps-qj',
    partnerStore: 'MET YOGA 钱江馆（联营演示）',
    cooperationType: '联营（演示）',
    authorizationStatus: '待核对（模块内展示）',
    serviceLevel: '增强档（演示）',
    cityRegion: '浙江 · 杭州 · 上城区（演示）',
    currentPhase: '爬坡期 · 数据回传待完善（模块内展示）',
    riskHints: [BASE_GOVERNANCE_RISK, '品牌联合露出边界待对齐（待核对）'],
  },
  {
    id: 'ps-wx',
    partnerStore: '无锡合作店（意向演示）',
    cooperationType: '意向 / 洽谈（演示）',
    authorizationStatus: '待核对（模块内展示）',
    serviceLevel: '试用档（演示）',
    cityRegion: '江苏 · 无锡（演示）',
    currentPhase: '意向期 · 未形成正式授权包（模块内展示）',
    riskHints: [BASE_GOVERNANCE_RISK, '不作为授权完成依据（模块内展示）'],
  },
];

export const buildPartnerBrandCourseAuthRows = (): PartnerBrandCourseAuthRow[] => [
  {
    id: 'bc-hz',
    partnerStore: 'MET YOGA 西湖馆（加盟演示）',
    brandScope: '门头、店内标识、统一课件模板（演示范围）',
    courseAuthScope: '哈他 / 流瑜伽团课；小班授权清单待同步（待核对）',
    validityPeriod: '2025-01-01 至 2027-12-31（演示）',
    statusLabel: '待核对（模块内展示）',
    pendingCheckNote: '授权包版本待总部确认；不生成正式合同',
    riskHints: [BASE_GOVERNANCE_RISK, '课程授权与课表库需人工对齐（待核对）'],
  },
  {
    id: 'bc-qj',
    partnerStore: 'MET YOGA 钱江馆（联营演示）',
    brandScope: '联合 LOGO 露出 + 指定物料包（演示）',
    courseAuthScope: '教培 RYT 产品线：边界待复核（模块内展示）',
    validityPeriod: '2024-06-01 至 2026-05-31（演示）',
    statusLabel: '待核对（模块内展示）',
    pendingCheckNote: '联营补充条款待接入真实合作数据后核对',
    riskHints: [BASE_GOVERNANCE_RISK, '品牌与教培授权需双线复核（待核对）'],
  },
  {
    id: 'bc-wx',
    partnerStore: '无锡合作店（意向演示）',
    brandScope: '试用物料包（未正式授权范围）（模块内展示）',
    courseAuthScope: '未下发正式课程授权（模块内展示）',
    validityPeriod: '—（演示）',
    statusLabel: '待处理（模块内展示）',
    pendingCheckNote: '意向阶段：不生成正式合同；不自动续约',
    riskHints: [BASE_GOVERNANCE_RISK],
  },
];

export const buildPartnerDataQualityRows = (): PartnerDataQualityRow[] => [
  {
    id: 'dq-hz',
    partnerStore: 'MET YOGA 西湖馆（加盟演示）',
    backhaulStatus: '部分回传（模块内展示）',
    lastBackhaulAt: '2026-05-08 06:30（演示）',
    dataCompleteness: '约 72%（模块内测算）',
    qcStatus: '待核对（模块内展示）',
    qcIssues: '缺省「到课—耗课」对齐字段（演示）',
    suggestedAction: '人工拉取一周样本对照教务导出（不自动生成任务）',
  },
  {
    id: 'dq-qj',
    partnerStore: 'MET YOGA 钱江馆（联营演示）',
    backhaulStatus: '延迟（模块内展示）',
    lastBackhaulAt: '2026-05-06 22:10（演示）',
    dataCompleteness: '约 58%（模块内测算）',
    qcStatus: '待核对（模块内展示）',
    qcIssues: '收款摘要字段缺失（演示）',
    suggestedAction: '与财务口径抽样对齐（待接入真实合作数据）',
  },
  {
    id: 'dq-wx',
    partnerStore: '无锡合作店（意向演示）',
    backhaulStatus: '未开通（模块内展示）',
    lastBackhaulAt: '—',
    dataCompleteness: '—（模块内展示）',
    qcStatus: '未开始（模块内展示）',
    qcIssues: '无质检记录（模块内展示）',
    suggestedAction: '完成授权包后再开通回传（待核对）',
  },
];

export const buildPartnerRectificationRenewalRows = (): PartnerRectificationRenewalRow[] => [
  {
    id: 'rr-hz',
    partnerStore: 'MET YOGA 西湖馆（加盟演示）',
    problemType: '品牌露出边界（演示）',
    rectificationRequirement: '补齐门头与课件版本登记表（人工；不生成整改通知）',
    owner: '区域督导（演示）',
    statusLabel: '待处理（模块内展示）',
    renewalRisk: '窗口临近：需人工评估续约条件（不自动续约）',
    exitDelistingRiskHint: '摘牌风险：低（演示）；不自动摘牌；待接入真实合作数据',
  },
  {
    id: 'rr-qj',
    partnerStore: 'MET YOGA 钱江馆（联营演示）',
    problemType: '数据回传延迟（演示）',
    rectificationRequirement: 'T+1 回传改为工作日双推送（人工协调；不生成整改通知）',
    owner: '总部运营（演示）',
    statusLabel: '待处理（模块内展示）',
    renewalRisk: '联营条款变更谈判中（模块内展示）',
    exitDelistingRiskHint: '退出风险：中（演示）；不自动摘牌；测算结果需人工复核',
  },
  {
    id: 'rr-wx',
    partnerStore: '无锡合作店（意向演示）',
    problemType: '授权未闭合（演示）',
    rectificationRequirement: '完成尽调与授权清单后再进入整改流程（不生成整改通知）',
    owner: '商务拓展（演示）',
    statusLabel: '待处理（模块内展示）',
    renewalRisk: '不适用（意向阶段）（模块内展示）',
    exitDelistingRiskHint: '退出 / 摘牌：以商务协议为准（模块内展示）；不自动续约',
  },
];
