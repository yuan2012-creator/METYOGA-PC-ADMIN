/** 门店管理模块演示 toast */

export const shopDemoToast = {
  exportData: '前端演示：导出门店数据需接入真实门店服务。',
  newStore: '前端演示：新建门店需接入门店服务与审批流。',
  newRoom: '前端演示：新建教室需接入门店配置服务。',
  qualityLog: '前端演示：质检记录需接入真实服务。',
  ruleCheck: '前端演示：门店规则检查为预览，未修改真实配置。',
  markDone: '前端演示：仅本地移除待办，未修改真实门店状态。',
  insightFilter: (label: string) => `已切换到：${label}（前端演示）`,
} as const;

export const SHOP_PREVIEW_TOAST =
  '前端演示：需接入真实门店服务、审批流和操作日志后才可执行，未写入系统。';
