/** 合作与授权模块局部 demo 数据 */

import type { PartnerDetailTabId } from './PartnerDetailTabs';

export type PartnerSegment =
  | 'stores'
  | 'authStatus'
  | 'brand'
  | 'dataSync'
  | 'quality'
  | 'systemAuth'
  | 'renewal';

export type PartnerEntityType =
  | 'store'
  | 'auth'
  | 'brand'
  | 'dataSync'
  | 'quality'
  | 'systemAuth'
  | 'renewal';

export type PartnerActionGroup =
  | 'authExpire'
  | 'dataAnomaly'
  | 'qualityFix'
  | 'brandRisk';

export interface PartnerListFilters {
  query: string;
  coopType: string;
  authStatus: string;
  risk: string;
  region: string;
}

export const DEFAULT_PARTNER_FILTERS: PartnerListFilters = {
  query: '',
  coopType: '全部',
  authStatus: '全部',
  risk: '全部',
  region: '全部',
};

export const PARTNER_FILTER_OPTIONS = {
  coopTypes: ['全部', 'L1 轻挂牌', 'L2 系统服务', 'L3 深度共管', '课程授权', '试运营合作'],
  authStatuses: ['全部', '有效', '即将到期', '暂停', '已到期', '退出中'],
  risks: ['全部', '正常', '关注', '高风险'],
  regions: ['全部', '杭州', '宁波', '上海', '外地合作'],
};

export const PARTNER_WORKBENCH_SEGMENTS: { id: PartnerSegment; label: string }[] = [
  { id: 'stores', label: '合作门店' },
  { id: 'authStatus', label: '授权状态' },
  { id: 'brand', label: '品牌规范' },
  { id: 'dataSync', label: '数据回传' },
  { id: 'quality', label: '质检整改' },
  { id: 'systemAuth', label: '课程 / 系统授权' },
  { id: 'renewal', label: '续约 / 退出' },
];

export const PARTNER_SEGMENT_HINTS: Record<PartnerSegment, string> = {
  stores: '合作门店清单、授权状态与风险总览',
  authStatus: '授权编号、层级、范围与到期管理',
  brand: '门头、线上展示、物料等品牌规范检查',
  dataSync: '会员、课程、财务等数据回传状态',
  quality: '质检记录、整改项与超期跟踪',
  systemAuth: '课程体系、系统服务与品牌素材授权',
  renewal: '续约意向、观察期与退出流程',
};

export interface PartnerMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface PartnerInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: PartnerSegment;
}

export interface PartnerStoreRecord {
  id: string;
  segment: 'stores';
  storeName: string;
  coopType: string;
  region: string;
  authStatus: string;
  authExpiry: string;
  dataStatus: string;
  qualityStatus: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerAuthRecord {
  id: string;
  segment: 'authStatus';
  authNo: string;
  storeName: string;
  authLevel: string;
  authScope: string;
  startDate: string;
  expiryDate: string;
  currentStatus: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerBrandRecord {
  id: string;
  segment: 'brand';
  ruleItem: string;
  storeName: string;
  checkTarget: string;
  currentResult: string;
  fixContent: string;
  deadline: string;
  status: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerDataSyncRecord {
  id: string;
  segment: 'dataSync';
  storeName: string;
  syncDate: string;
  memberData: string;
  courseData: string;
  financeSummary: string;
  teacherHours: string;
  syncStatus: string;
  anomalyReason: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerQualityRecord {
  id: string;
  segment: 'quality';
  qualityNo: string;
  storeName: string;
  qualityType: string;
  issueLevel: string;
  fixItem: string;
  owner: string;
  deadline: string;
  status: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerSystemAuthRecord {
  id: string;
  segment: 'systemAuth';
  authContent: string;
  storeName: string;
  authType: string;
  usableScope: string;
  useStatus: string;
  expiryTime: string;
  riskLevel: string;
  storeKey: string;
}

export interface PartnerRenewalRecord {
  id: string;
  segment: 'renewal';
  storeName: string;
  currentPhase: string;
  expiryTime: string;
  renewalIntent: string;
  riskReason: string;
  nextAction: string;
  owner: string;
  status: string;
  riskLevel: string;
  storeKey: string;
}

export type PartnerTableRow =
  | PartnerStoreRecord
  | PartnerAuthRecord
  | PartnerBrandRecord
  | PartnerDataSyncRecord
  | PartnerQualityRecord
  | PartnerSystemAuthRecord
  | PartnerRenewalRecord;

export interface PartnerActionItem {
  id: string;
  segment: PartnerSegment;
  group: PartnerActionGroup;
  entityType: PartnerEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  riskLine: string;
  governanceChain: string[];
  openTab?: PartnerDetailTabId;
}

export interface PartnerJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface PartnerLogItem {
  time: string;
  action: string;
  operator: string;
  note: string;
}

export interface PartnerDetailRecord {
  id: string;
  entityType: PartnerEntityType;
  segment: PartnerSegment;
  title: string;
  subtitle: string;
  storeName: string;
  coopType: string;
  authLevel: string;
  status: string;
  riskLevel: string;
  todaySuggestion: string;
  judgment: PartnerJudgment;
  coreMetrics: { label: string; value: string }[];
  authNo: string;
  authContents: string[];
  usableScope: string;
  forbiddenScope: string;
  expiryTime: string;
  contractStatus: string;
  boundaryNote: string;
  brandDisplayName: string;
  onlinePlatformName: string;
  visualStandard: string;
  courseNaming: string;
  materialUsage: string;
  brandCheckResult: string;
  brandFixAdvice: string;
  dataSyncStatus: string;
  dataSummary: { type: string; status: string; note: string }[];
  systemServiceLevel: string;
  anomalyFields: string;
  lastSyncTime: string;
  qualityRecords: { no: string; type: string; level: string; status: string }[];
  fixItems: string[];
  fixOwner: string;
  fixDeadline: string;
  fixStatus: string;
  operationLogs: PartnerLogItem[];
  renewalExpiry: string;
  renewalIntent: string;
  renewalRisk: string;
  exitConditions: string;
  nextAction: string;
  responsibleRole: string;
  renewalRiskNote: string;
  governanceChain: string[];
  caliberNote: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface PartnerOperationSnapshot {
  metrics: PartnerMetric[];
  insights: PartnerInsight[];
  stores: PartnerStoreRecord[];
  authStatus: PartnerAuthRecord[];
  brand: PartnerBrandRecord[];
  dataSync: PartnerDataSyncRecord[];
  quality: PartnerQualityRecord[];
  systemAuth: PartnerSystemAuthRecord[];
  renewal: PartnerRenewalRecord[];
  details: PartnerDetailRecord[];
  actionQueue: PartnerActionItem[];
}

const STORES = [
  { key: '云兮瑜伽 · MET YOGA 授权馆', type: 'L2 系统服务', region: '杭州', city: '杭州', auth: '有效', expiry: '2026-08-15', data: '正常', quality: '合格', risk: '正常' },
  { key: '湖滨轻挂牌馆', type: 'L1 轻挂牌', region: '杭州', city: '杭州', auth: '有效', expiry: '2026-12-01', data: '正常', quality: '合格', risk: '正常' },
  { key: '城南系统服务馆', type: 'L2 系统服务', region: '杭州', city: '杭州', auth: '即将到期', expiry: '2026-06-20', data: '异常', quality: '待整改', risk: '关注' },
  { key: '未来科技城共管馆', type: 'L3 深度共管', region: '杭州', city: '杭州', auth: '有效', expiry: '2027-03-10', data: '正常', quality: '合格', risk: '正常' },
  { key: '滨江课程授权馆', type: '课程授权', region: '杭州', city: '杭州', auth: '有效', expiry: '2026-09-30', data: '部分缺失', quality: '合格', risk: '关注' },
  { key: '转塘试运营馆', type: '试运营合作', region: '外地合作', city: '宁波', auth: '暂停', expiry: '2026-05-28', data: '未回传', quality: '整改中', risk: '高风险' },
  { key: '上海徐汇授权馆', type: 'L2 系统服务', region: '上海', city: '上海', auth: '有效', expiry: '2026-11-15', data: '正常', quality: '合格', risk: '正常' },
  { key: '宁波江北轻挂牌', type: 'L1 轻挂牌', region: '宁波', city: '宁波', auth: '即将到期', expiry: '2026-06-08', data: '异常', quality: '待整改', risk: '高风险' },
];

const CHECK_TARGETS = ['门头', '大众点评 / 美团名称', '小程序展示', '课程命名', '视觉物料', '员工话术', '品牌标识'];
const AUTH_CONTENTS = ['MET 课程体系', '老师端系统', '会员端小程序', 'PC 后台', '教培课程', '运营 SOP', '品牌素材库'];

const mkJudgment = (risk: string): PartnerJudgment => ({
  summary:
    risk === '高风险'
      ? '合作门店存在授权、数据或质检多重风险，建议优先复核授权范围与整改计划'
      : risk === '关注'
        ? '部分治理项需跟进，建议核对品牌规范与数据回传完整性'
        : '合作治理状态稳定，可按计划推进续约准备',
  stuck: risk === '高风险' ? '数据回传或质检整改未完成' : risk === '关注' ? '授权将到期或品牌待复核' : '—',
  nextStep: '按建议动作跟进，以正式协议、授权范围和操作日志为准（合作治理预览）',
});

const mkLogs = (store: string): PartnerLogItem[] => [
  { time: '2026-05-14 09:00', action: '授权状态查看', operator: '总部运营', note: `${store} · 前端演示` },
  { time: '2026-05-13 15:30', action: '数据回传核对预览', operator: '系统', note: '待接入真实合作服务' },
  { time: '2026-05-12 11:00', action: '质检整改跟进预览', operator: '质检专员', note: '以正式协议为准' },
];

const buildStoreDetail = (s: (typeof STORES)[0], id: string): PartnerDetailRecord => ({
  id,
  entityType: 'store',
  segment: 'stores',
  title: s.key,
  subtitle: `${s.type} · ${s.region} · ${s.auth}`,
  storeName: s.key,
  coopType: s.type,
  authLevel: s.type.includes('L1') ? 'L1' : s.type.includes('L2') ? 'L2' : s.type.includes('L3') ? 'L3' : '专项',
  status: s.auth,
  riskLevel: s.risk,
  todaySuggestion: `关注 ${s.key} 授权 ${s.expiry} / 数据 ${s.data} / 质检 ${s.quality}`,
  judgment: mkJudgment(s.risk),
  coreMetrics: [
    { label: '合作类型', value: s.type },
    { label: '授权状态', value: s.auth },
    { label: '授权到期', value: s.expiry },
    { label: '数据状态', value: s.data },
    { label: '质检状态', value: s.quality },
  ],
  authNo: `AUTH-2024-${s.key.slice(0, 2)}`,
  authContents: AUTH_CONTENTS.slice(0, s.type.includes('L3') ? 7 : s.type.includes('L1') ? 3 : 5),
  usableScope: s.type.includes('课程') ? 'MET 课程体系 + 品牌素材' : '品牌授权 + 系统服务 + 运营 SOP',
  forbiddenScope: '不得擅自修改品牌标识；不得超范围使用 MET 课程体系',
  expiryTime: s.expiry,
  contractStatus: s.auth === '暂停' ? '协议待复核' : '有效（演示）',
  boundaryNote: '以正式协议和授权范围附件为准，本页仅作合作治理预览',
  brandDisplayName: s.key,
  onlinePlatformName: s.key.includes('云兮') ? '云兮瑜伽 · MET YOGA' : s.key,
  visualStandard: '门头 / 物料需符合 MET YOGA 视觉规范 V2',
  courseNaming: '课程命名需带 MET 体系标识',
  materialUsage: '品牌素材库授权范围内使用',
  brandCheckResult: s.risk === '高风险' ? '待整改' : '基本合格',
  brandFixAdvice: s.risk !== '正常' ? '复核大众点评名称与小程序展示' : '—',
  dataSyncStatus: s.data,
  dataSummary: [
    { type: '会员数据', status: s.data === '正常' ? '完整' : '缺失', note: '每日增量（演示）' },
    { type: '课程数据', status: s.data === '未回传' ? '未回传' : '完整', note: '排课 + 签到' },
    { type: '财务摘要', status: s.data === '异常' ? '异常' : '完整', note: '不含真实入账' },
    { type: '老师课时', status: '完整', note: '课时汇总（演示）' },
  ],
  systemServiceLevel: s.type.includes('L2') || s.type.includes('L3') ? '系统服务 L2' : '轻量服务 L1',
  anomalyFields: s.data !== '正常' ? '财务摘要 / 会员增量' : '—',
  lastSyncTime: s.data === '未回传' ? '—' : '2026-05-14 06:00（演示）',
  qualityRecords: [
    { no: 'QC-001', type: '品牌规范', level: '中', status: s.quality },
    { no: 'QC-002', type: '数据回传', level: s.data === '异常' ? '高' : '低', status: '已记录' },
  ],
  fixItems: s.quality !== '合格' ? ['门头标识复核', '数据回传补全'] : [],
  fixOwner: '合作运营 A',
  fixDeadline: s.quality !== '合格' ? '2026-05-20' : '—',
  fixStatus: s.quality,
  operationLogs: mkLogs(s.key),
  renewalExpiry: s.expiry,
  renewalIntent: s.risk === '高风险' ? '待沟通' : '有意向续约',
  renewalRisk: s.risk === '高风险' ? '数据与质检未达标' : '—',
  exitConditions: '授权到期未续约；连续 30 天数据未回传；重大品牌违规',
  nextAction: s.auth === '即将到期' ? '启动续约沟通（预览）' : '例行巡检',
  responsibleRole: '总部合作运营',
  renewalRiskNote: '本页仅作合作治理预览，不构成法律或经营承诺',
  governanceChain: ['授权', '数据', '质检', '续约'],
  caliberNote: '以正式协议、授权范围和操作日志为准',
  updatedAt: '2026-05-14 18:00（演示）',
  isDemo: true,
});

const buildDetails = (
  stores: PartnerStoreRecord[],
  authStatus: PartnerAuthRecord[],
  brand: PartnerBrandRecord[],
  dataSync: PartnerDataSyncRecord[],
  quality: PartnerQualityRecord[],
  systemAuth: PartnerSystemAuthRecord[],
  renewal: PartnerRenewalRecord[],
): PartnerDetailRecord[] => {
  const storeDetails = stores.map(s => buildStoreDetail(STORES.find(x => x.key === s.storeName)!, s.id));

  const rowDetail = (
    row: PartnerTableRow,
    entityType: PartnerEntityType,
    title: string,
    subtitle: string,
    metrics: { label: string; value: string }[],
    chain: string[],
    storeKey: string,
  ): PartnerDetailRecord => {
    const store = stores.find(s => s.storeName === storeKey)!;
    const base = storeDetails.find(d => d.id === store.id)!;
    return { ...base, id: row.id, entityType, segment: row.segment, title, subtitle, coreMetrics: metrics, governanceChain: chain };
  };

  return [
    ...storeDetails,
    ...authStatus.map(a =>
      rowDetail(a, 'auth', a.authNo, `${a.storeName} · ${a.currentStatus}`, [
        { label: '授权层级', value: a.authLevel },
        { label: '授权范围', value: a.authScope },
        { label: '开始日期', value: a.startDate },
        { label: '到期日期', value: a.expiryDate },
        { label: '当前状态', value: a.currentStatus },
      ], ['授权', '范围', '到期', '续约'], a.storeKey),
    ),
    ...brand.map(b =>
      rowDetail(b, 'brand', b.ruleItem, `${b.checkTarget} · ${b.currentResult}`, [
        { label: '检查对象', value: b.checkTarget },
        { label: '当前结果', value: b.currentResult },
        { label: '需整改内容', value: b.fixContent },
        { label: '截止时间', value: b.deadline },
        { label: '状态', value: b.status },
      ], ['品牌', '规范', '整改', '复核'], b.storeKey),
    ),
    ...dataSync.map(d =>
      rowDetail(d, 'dataSync', d.storeName, `${d.syncDate} · ${d.syncStatus}`, [
        { label: '会员数据', value: d.memberData },
        { label: '课程数据', value: d.courseData },
        { label: '财务摘要', value: d.financeSummary },
        { label: '老师课时', value: d.teacherHours },
        { label: '异常原因', value: d.anomalyReason },
      ], ['授权', '数据', '回传', '质检'], d.storeKey),
    ),
    ...quality.map(q =>
      rowDetail(q, 'quality', q.qualityNo, `${q.storeName} · ${q.issueLevel}`, [
        { label: '质检类型', value: q.qualityType },
        { label: '问题等级', value: q.issueLevel },
        { label: '整改项', value: q.fixItem },
        { label: '负责人', value: q.owner },
        { label: '截止时间', value: q.deadline },
      ], ['质检', '整改', '复核', '续约'], q.storeKey),
    ),
    ...systemAuth.map(s =>
      rowDetail(s, 'systemAuth', s.authContent, `${s.storeName} · ${s.useStatus}`, [
        { label: '授权类型', value: s.authType },
        { label: '可用范围', value: s.usableScope },
        { label: '使用状态', value: s.useStatus },
        { label: '到期时间', value: s.expiryTime },
      ], ['系统', '授权', '使用', '到期'], s.storeKey),
    ),
    ...renewal.map(r =>
      rowDetail(r, 'renewal', r.storeName, `${r.currentPhase} · ${r.renewalIntent}`, [
        { label: '当前阶段', value: r.currentPhase },
        { label: '到期时间', value: r.expiryTime },
        { label: '续约意向', value: r.renewalIntent },
        { label: '风险原因', value: r.riskReason },
        { label: '下一步动作', value: r.nextAction },
      ], ['授权', '续约', '退出', '摘牌'], r.storeKey),
    ),
  ];
};

export const buildPartnerOperationSnapshot = (): PartnerOperationSnapshot => {
  const stores: PartnerStoreRecord[] = STORES.map((s, i) => ({
    id: `pt-store-${i + 1}`,
    segment: 'stores',
    storeName: s.key,
    coopType: s.type,
    region: `${s.city} / ${s.region}`,
    authStatus: s.auth,
    authExpiry: s.expiry,
    dataStatus: s.data,
    qualityStatus: s.quality,
    riskLevel: s.risk,
    storeKey: s.key,
  }));

  const authStatus: PartnerAuthRecord[] = STORES.map((s, i) => ({
    id: `pt-auth-${i + 1}`,
    segment: 'authStatus',
    authNo: `AUTH-2024-${String(i + 1).padStart(3, '0')}`,
    storeName: s.key,
    authLevel: s.type.includes('L1') ? 'L1' : s.type.includes('L2') ? 'L2' : s.type.includes('L3') ? 'L3' : '专项',
    authScope: s.type.includes('课程') ? '课程体系 + 品牌素材' : '品牌 + 系统 + 运营',
    startDate: '2024-06-01',
    expiryDate: s.expiry,
    currentStatus: s.auth,
    riskLevel: s.risk,
    storeKey: s.key,
  }));

  const brand: PartnerBrandRecord[] = STORES.flatMap((s, si) =>
    CHECK_TARGETS.slice(0, 3).map((target, ti) => ({
      id: `pt-brand-${si}-${ti}`,
      segment: 'brand' as const,
      ruleItem: `${target}规范`,
      storeName: s.key,
      checkTarget: target,
      currentResult: s.risk === '高风险' ? '待整改' : ti === 0 ? '合格' : '基本合格',
      fixContent: s.risk !== '正常' && ti === 1 ? '名称需与授权一致' : '—',
      deadline: s.risk !== '正常' ? '2026-05-25' : '—',
      status: s.risk === '高风险' ? '待整改' : '合格',
      riskLevel: s.risk === '高风险' && ti === 1 ? '高风险' : '正常',
      storeKey: s.key,
    })),
  ).slice(0, 24);

  const dataSync: PartnerDataSyncRecord[] = Array.from({ length: 12 }, (_, i) => {
    const s = STORES[i % STORES.length];
    return {
      id: `pt-data-${i + 1}`,
      segment: 'dataSync',
      storeName: s.key,
      syncDate: `2026-05-${14 - (i % 7)}`,
      memberData: s.data === '正常' ? '完整' : '缺失',
      courseData: s.data === '未回传' ? '未回传' : '完整',
      financeSummary: s.data === '异常' ? '字段异常' : '完整',
      teacherHours: '完整',
      syncStatus: s.data === '正常' ? '正常' : '异常',
      anomalyReason: s.data !== '正常' ? '近 7 天未完整回传（演示）' : '—',
      riskLevel: s.data === '正常' ? '正常' : '关注',
      storeKey: s.key,
    };
  });

  const quality: PartnerQualityRecord[] = STORES.flatMap((s, si) =>
    ['品牌规范', '数据回传', '系统使用'].map((type, ti) => ({
      id: `pt-qc-${si}-${ti}`,
      segment: 'quality' as const,
      qualityNo: `QC-2026-${String(si * 3 + ti + 1).padStart(3, '0')}`,
      storeName: s.key,
      qualityType: type,
      issueLevel: s.risk === '高风险' ? '高' : s.risk === '关注' ? '中' : '低',
      fixItem: s.quality !== '合格' ? `${type}待整改` : '—',
      owner: '合作运营 A',
      deadline: s.quality !== '合格' ? '2026-05-22' : '—',
      status: s.quality,
      riskLevel: s.risk,
      storeKey: s.key,
    })),
  ).slice(0, 24);

  const systemAuth: PartnerSystemAuthRecord[] = STORES.flatMap((s, si) =>
    AUTH_CONTENTS.slice(0, 4).map((content, ci) => ({
      id: `pt-sys-${si}-${ci}`,
      segment: 'systemAuth' as const,
      authContent: content,
      storeName: s.key,
      authType: content.includes('课程') ? '课程授权' : '系统授权',
      usableScope: s.type,
      useStatus: s.auth === '暂停' ? '暂停' : '正常',
      expiryTime: s.expiry,
      riskLevel: s.auth === '暂停' ? '高风险' : '正常',
      storeKey: s.key,
    })),
  ).slice(0, 32);

  const renewal: PartnerRenewalRecord[] = STORES.map((s, i) => ({
    id: `pt-ren-${i + 1}`,
    segment: 'renewal',
    storeName: s.key,
    currentPhase: s.auth === '即将到期' ? '续约评估' : s.auth === '暂停' ? '退出观察' : '正常合作',
    expiryTime: s.expiry,
    renewalIntent: s.risk === '高风险' ? '待沟通' : '有意向',
    riskReason: s.risk !== '正常' ? '数据或质检未达标' : '—',
    nextAction: s.auth === '即将到期' ? '启动续约沟通（预览）' : '例行巡检',
    owner: '合作运营 A',
    status: s.auth,
    riskLevel: s.risk,
    storeKey: s.key,
  }));

  const details = buildDetails(stores, authStatus, brand, dataSync, quality, systemAuth, renewal);

  const expiring = authStatus.filter(a => a.currentStatus === '即将到期').length;
  const dataAnomaly = dataSync.filter(d => d.syncStatus === '异常').length;
  const qualityPending = quality.filter(q => q.status === '待整改' || q.status === '整改中').length;
  const riskCount = stores.filter(s => s.riskLevel !== '正常').length + brand.filter(b => b.riskLevel === '高风险').length;

  const metrics: PartnerMetric[] = [
    { id: 'pm1', label: '合作门店', value: `${stores.length} 家`, hint: '挂牌 / 授权 / 系统服务' },
    { id: 'pm2', label: '有效授权', value: `${authStatus.filter(a => a.currentStatus === '有效').length} 项`, hint: '以协议状态为准（演示）' },
    { id: 'pm3', label: '授权将到期', value: `${expiring} 项`, hint: '30 天内到期', tone: 'amber' },
    { id: 'pm4', label: '数据回传异常', value: `${dataAnomaly} 项`, hint: '近 7 天未完整回传' },
    { id: 'pm5', label: '质检待整改', value: `${qualityPending} 项`, hint: '超期或未提交证明', tone: 'amber' },
    { id: 'pm6', label: '合作风险项', value: `${riskCount} 项`, hint: '授权 / 数据 / 品牌 / 质检', tone: 'rose' },
  ];

  const insights: PartnerInsight[] = [
    { id: 'pi1', tag: '授权将到期', line: '城南系统服务馆、宁波江北轻挂牌授权 30 天内到期', actionLabel: '查看', actionKey: 'authStatus' },
    { id: 'pi2', tag: '数据回传异常', line: '转塘试运营馆近 7 天未完整回传会员与课程数据', actionLabel: '分析', actionKey: 'dataSync' },
    { id: 'pi3', tag: '品牌规范风险', line: '2 家门店线上展示名称需复核', actionLabel: '查看', actionKey: 'brand' },
    { id: 'pi4', tag: '质检整改未完成', line: '3 项整改超期或未提交证明', actionLabel: '分析', actionKey: 'quality' },
  ];

  const actionQueue: PartnerActionItem[] = [
    { id: 'pa1', segment: 'authStatus', group: 'authExpire', entityType: 'auth', entityId: 'pt-auth-3', title: '城南系统服务馆', statusLabel: '即将到期', riskLine: '授权 2026-06-20 到期，需启动续约沟通', governanceChain: ['授权', '到期', '续约', '复核'], openTab: 'renewal' },
    { id: 'pa2', segment: 'authStatus', group: 'authExpire', entityType: 'auth', entityId: 'pt-auth-8', title: '宁波江北轻挂牌', statusLabel: '即将到期', riskLine: '授权 30 天内到期且数据异常', governanceChain: ['授权', '数据', '续约', '退出'] },
    { id: 'pa3', segment: 'renewal', group: 'authExpire', entityType: 'renewal', entityId: 'pt-ren-3', title: '城南系统服务馆', statusLabel: '续约评估', riskLine: '续约前需完成数据回传整改', governanceChain: ['授权', '数据', '质检', '续约'] },
    { id: 'pa4', segment: 'dataSync', group: 'dataAnomaly', entityType: 'dataSync', entityId: 'pt-data-6', title: '转塘试运营馆', statusLabel: '未回传', riskLine: '连续 7 天未回传会员与课程数据', governanceChain: ['授权', '数据', '质检', '续约'], openTab: 'data' },
    { id: 'pa5', segment: 'dataSync', group: 'dataAnomaly', entityType: 'dataSync', entityId: 'pt-data-8', title: '宁波江北轻挂牌', statusLabel: '异常', riskLine: '财务摘要字段异常', governanceChain: ['数据', '回传', '质检', '复核'] },
    { id: 'pa6', segment: 'dataSync', group: 'dataAnomaly', entityType: 'store', entityId: 'pt-store-5', title: '滨江课程授权馆', statusLabel: '部分缺失', riskLine: '会员增量数据部分缺失', governanceChain: ['授权', '数据', '系统', '复核'] },
    { id: 'pa7', segment: 'quality', group: 'qualityFix', entityType: 'quality', entityId: 'pt-qc-5-0', title: '转塘试运营馆', statusLabel: '整改中', riskLine: '品牌规范质检整改未完成', governanceChain: ['质检', '整改', '复核', '续约'], openTab: 'quality' },
    { id: 'pa8', segment: 'quality', group: 'qualityFix', entityType: 'quality', entityId: 'pt-qc-2-1', title: '城南系统服务馆', statusLabel: '待整改', riskLine: '数据回传质检项超期', governanceChain: ['数据', '质检', '整改', '续约'] },
    { id: 'pa9', segment: 'quality', group: 'qualityFix', entityType: 'quality', entityId: 'pt-qc-7-2', title: '宁波江北轻挂牌', statusLabel: '超期', riskLine: '整改证明未提交', governanceChain: ['质检', '整改', '退出', '复核'] },
    { id: 'pa10', segment: 'brand', group: 'brandRisk', entityType: 'brand', entityId: 'pt-brand-5-1', title: '转塘试运营馆', statusLabel: '名称异常', riskLine: '大众点评名称与授权不一致', governanceChain: ['品牌', '规范', '整改', '复核'], openTab: 'brand' },
    { id: 'pa11', segment: 'brand', group: 'brandRisk', entityType: 'brand', entityId: 'pt-brand-7-1', title: '宁波江北轻挂牌', statusLabel: '待复核', riskLine: '小程序展示需复核', governanceChain: ['品牌', '线上', '规范', '整改'] },
    { id: 'pa12', segment: 'brand', group: 'brandRisk', entityType: 'brand', entityId: 'pt-brand-2-2', title: '城南系统服务馆', statusLabel: '物料风险', riskLine: '视觉物料使用待复核', governanceChain: ['品牌', '物料', '质检', '复核'] },
    { id: 'pa13', segment: 'renewal', group: 'authExpire', entityType: 'renewal', entityId: 'pt-ren-6', title: '转塘试运营馆', statusLabel: '退出观察', riskLine: '授权暂停，观察期数据与质检未达标', governanceChain: ['授权', '退出', '摘牌', '复核'], openTab: 'renewal' },
    { id: 'pa14', segment: 'systemAuth', group: 'dataAnomaly', entityType: 'systemAuth', entityId: 'pt-sys-5-2', title: '转塘试运营馆 · PC 后台', statusLabel: '暂停', riskLine: '系统授权已暂停使用', governanceChain: ['系统', '授权', '数据', '退出'] },
    { id: 'pa15', segment: 'stores', group: 'brandRisk', entityType: 'store', entityId: 'pt-store-6', title: '转塘试运营馆', statusLabel: '高风险', riskLine: '多项治理指标未达标', governanceChain: ['授权', '数据', '质检', '退出'] },
    { id: 'pa16', segment: 'authStatus', group: 'authExpire', entityType: 'auth', entityId: 'pt-auth-6', title: '转塘试运营馆', statusLabel: '暂停', riskLine: '授权暂停，需复核退出条件', governanceChain: ['授权', '暂停', '退出', '复核'] },
  ];

  return { metrics, insights, stores, authStatus, brand, dataSync, quality, systemAuth, renewal, details, actionQueue };
};

export const findPartnerDetail = (snapshot: PartnerOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getPartnerRows = (snapshot: PartnerOperationSnapshot, segment: PartnerSegment): PartnerTableRow[] => {
  switch (segment) {
    case 'stores': return snapshot.stores;
    case 'authStatus': return snapshot.authStatus;
    case 'brand': return snapshot.brand;
    case 'dataSync': return snapshot.dataSync;
    case 'quality': return snapshot.quality;
    case 'systemAuth': return snapshot.systemAuth;
    case 'renewal': return snapshot.renewal;
    default: return [];
  }
};

export const filterPartnerRows = (
  rows: PartnerTableRow[],
  filters: PartnerListFilters,
): PartnerTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    if (filters.coopType !== '全部' && 'coopType' in row && row.coopType !== filters.coopType) return false;
    if (filters.authStatus !== '全部') {
      const st = 'authStatus' in row ? row.authStatus : 'currentStatus' in row ? row.currentStatus : 'status' in row ? row.status : '';
      if (st && !String(st).includes(filters.authStatus.replace('即将', '')) && st !== filters.authStatus) {
        if (filters.authStatus === '即将到期' && !String(st).includes('即将')) return false;
        else if (filters.authStatus !== '即将到期' && st !== filters.authStatus) return false;
      }
    }
    if ('riskLevel' in row && filters.risk !== '全部' && row.riskLevel !== filters.risk) return false;
    const region = 'region' in row ? row.region : 'storeName' in row ? row.storeName : '';
    if (filters.region !== '全部' && region && !String(region).includes(filters.region)) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computePartnerSegmentMiniSummary = (
  snapshot: PartnerOperationSnapshot,
  segment: PartnerSegment,
): { label: string; value: string }[] => {
  switch (segment) {
    case 'stores': {
      const rows = snapshot.stores;
      return [
        { label: '门店数', value: `${rows.length} 家` },
        { label: '有效授权', value: `${rows.filter(s => s.authStatus === '有效').length} 家` },
        { label: '异常门店', value: `${rows.filter(s => s.dataStatus !== '正常' || s.qualityStatus !== '合格').length} 家` },
        { label: '高风险', value: `${rows.filter(s => s.riskLevel === '高风险').length} 家` },
      ];
    }
    case 'authStatus': {
      const rows = snapshot.authStatus;
      return [
        { label: '授权数', value: `${rows.length} 项` },
        { label: '即将到期', value: `${rows.filter(a => a.currentStatus === '即将到期').length} 项` },
        { label: '已暂停', value: `${rows.filter(a => a.currentStatus === '暂停').length} 项` },
        { label: '待续约', value: `${rows.filter(a => a.currentStatus === '即将到期').length} 项` },
      ];
    }
    case 'brand': {
      const rows = snapshot.brand;
      return [
        { label: '检查项', value: `${rows.length} 项` },
        { label: '合格项', value: `${rows.filter(b => b.status === '合格').length} 项` },
        { label: '待整改', value: `${rows.filter(b => b.status === '待整改').length} 项` },
        { label: '高风险', value: `${rows.filter(b => b.riskLevel === '高风险').length} 项` },
      ];
    }
    case 'dataSync': {
      const rows = snapshot.dataSync;
      return [
        { label: '今日回传', value: `${rows.filter(d => d.syncDate.includes('05-14')).length} 家` },
        { label: '缺失门店', value: `${rows.filter(d => d.syncStatus === '异常').length} 家` },
        { label: '异常字段', value: `${rows.filter(d => d.anomalyReason !== '—').length} 项` },
        { label: '连续异常', value: `${rows.filter(d => d.anomalyReason.includes('7 天')).length} 家` },
      ];
    }
    case 'quality': {
      const rows = snapshot.quality;
      return [
        { label: '质检记录', value: `${rows.length} 条` },
        { label: '待整改', value: `${rows.filter(q => q.status === '待整改' || q.status === '整改中').length} 条` },
        { label: '超期项', value: `${rows.filter(q => q.status === '超期' || q.riskLevel === '高风险').length} 条` },
        { label: '已完成', value: `${rows.filter(q => q.status === '合格').length} 条` },
      ];
    }
    case 'systemAuth': {
      const rows = snapshot.systemAuth;
      return [
        { label: '授权内容', value: `${rows.length} 项` },
        { label: '正常使用', value: `${rows.filter(s => s.useStatus === '正常').length} 项` },
        { label: '即将到期', value: `${rows.filter(s => s.expiryTime.startsWith('2026-06')).length} 项` },
        { label: '异常使用', value: `${rows.filter(s => s.useStatus === '暂停').length} 项` },
      ];
    }
    case 'renewal': {
      const rows = snapshot.renewal;
      return [
        { label: '到期门店', value: `${rows.filter(r => r.currentPhase === '续约评估').length} 家` },
        { label: '续约中', value: `${rows.filter(r => r.renewalIntent === '有意向').length} 家` },
        { label: '观察中', value: `${rows.filter(r => r.currentPhase === '退出观察').length} 家` },
        { label: '退出风险', value: `${rows.filter(r => r.riskLevel === '高风险').length} 家` },
      ];
    }
    default:
      return [];
  }
};

export const ACTION_GROUP_TITLES: Record<PartnerActionGroup, string> = {
  authExpire: '授权到期',
  dataAnomaly: '数据回传异常',
  qualityFix: '质检整改',
  brandRisk: '品牌规范风险',
};

const SEGMENT_ACTION_MAP: Record<PartnerSegment, PartnerActionGroup[]> = {
  stores: ['authExpire', 'brandRisk'],
  authStatus: ['authExpire'],
  brand: ['brandRisk'],
  dataSync: ['dataAnomaly'],
  quality: ['qualityFix'],
  systemAuth: ['dataAnomaly', 'authExpire'],
  renewal: ['authExpire', 'qualityFix'],
};

export const getSegmentActionItems = (queue: PartnerActionItem[], segment: PartnerSegment): PartnerActionItem[] => {
  const groups = new Set(SEGMENT_ACTION_MAP[segment] ?? Object.keys(ACTION_GROUP_TITLES));
  return queue.filter(i => i.segment === segment || groups.has(i.group));
};
