/** 合作与授权模块演示 toast */

export const partnerDemoToast = {
  exportData: '前端演示：导出合作数据需接入真实合作服务。',
  newStore: '前端演示：新增合作门店为预览，未写入系统。',
  newAuthPlan: '前端演示：新建授权方案为预览，待接入授权服务。',
  qualityLog: '前端演示：质检记录为预览，以正式协议为准。',
  publishRule: '前端演示：发布授权规则为授权预览，未真实发布。',
  markDone: '前端演示：标记处理仅本地移除待办，未修改真实合作状态。',
  insightFilter: (label: string) => `已切换到：${label}（合作治理预览）`,
  adjustPreview: '前端演示：调整预览待接入合作服务，未写入系统。',
} as const;

export const PARTNER_PREVIEW_TOAST =
  '前端演示：需接入真实合作服务与审批流后才可执行。本页仅作合作治理预览，不构成法律或经营承诺。';
