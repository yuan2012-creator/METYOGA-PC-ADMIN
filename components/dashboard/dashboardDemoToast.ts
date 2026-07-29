/** 经营总览模块演示 toast */

export const dashboardDemoToast = {
  exportSummary: '前端演示：导出经营摘要需接入真实数据服务。',
  storeCompare: '前端演示：门店对比为经营判断预览，未写入系统。',
  dailyReport: '前端演示：生成经营日报为预览，未真实生成日报。',
  riskReview: '前端演示：风险复盘为预览，待接入真实数据服务。',
  actionList: '前端演示：今日行动清单为预览，标记处理仅本地移除。',
  markDone: '前端演示：标记处理仅本地移除，未修改真实经营状态。',
  insightFilter: (label: string) => `已切换到：${label}（经营判断预览）`,
  adjustPreview: '前端演示：调整预览待接入真实数据服务，未写入系统。',
  storeFilter: (store: string) => `前端演示：后续将按「${store}」筛选明细（经营判断预览）`,
  actionSuggestion: (label: string) => `前端演示：${label}（经营判断预览，未写入系统）`,
} as const;

export const DASHBOARD_PREVIEW_TOAST =
  '前端演示：需接入真实数据服务与审批流后才可执行。本页仅作经营总览预览，不作为最终财务或人事结论。';
