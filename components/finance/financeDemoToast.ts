/** 财务管理模块演示 toast */

export const financeDemoToast = {
  exportData: '前端演示：真实导出需接入财务服务。',
  newExpense: '前端演示：新增费用支出需接入财务服务。',
  reconcileOrder: '前端演示：订单核对为预览，未写入真实数据。',
  monthlyReport: '前端演示：生成月报需接入财务服务。',
  ruleCheck: '前端演示：规则检查为预览，未修改真实配置。',
  markDone: '前端演示：标记处理未修改真实财务状态。',
  insightFilter: (label: string) => `已筛选：${label}（前端演示）`,
} as const;
