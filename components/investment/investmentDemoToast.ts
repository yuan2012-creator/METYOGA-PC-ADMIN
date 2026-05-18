/** 投资测算模块演示 toast */

export const investmentDemoToast = {
  exportCalc: '前端演示：导出测算需接入真实数据服务与权限审批。',
  newProject: '前端演示：新建项目为预览，未写入系统。',
  savePlan: '前端演示：保存方案为预览，未真实保存。',
  paramNote: '前端演示：参数说明以合同、财务、排课产能和银行流水为准。',
  calcPreview: '前端演示：生成投资测算预览，本测算不构成投资承诺。',
  markRead: '前端演示：标记已读仅本地移除关注项。',
  insightFilter: (label: string) => `已切换到：${label}（测算预览）`,
  adjustPreview: '前端演示：调整预览待接入测算引擎，未写入系统。',
  viewFormula: '前端演示：公式说明为测算预览，待接入真实服务。',
} as const;

export const INVESTMENT_PREVIEW_TOAST =
  '前端演示：需接入真实数据服务与审批流后才可执行，未写入系统。本测算不构成投资承诺。';
