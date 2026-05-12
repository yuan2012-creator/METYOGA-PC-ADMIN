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

const ROW_RISK = '当前为授权治理入口；不自动变更授权状态；不生成正式合同或整改通知；待接入授权服务；仅用于经营判断';

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
