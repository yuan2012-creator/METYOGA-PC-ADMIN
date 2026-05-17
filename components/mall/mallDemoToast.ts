/** 产品与合同模块演示 toast 文案（统一占位说明） */

export const mallDemoToast = {
  exportOrders: '当前为前端演示，未导出真实订单数据。',
  newCard: '当前为前端演示，未创建真实卡项配置。',
  newContractTemplate: '当前为前端演示，未创建真实合同模板。',
  ruleCheck: '当前为前端演示，规则检查为预览，未写入真实配置。',
  newOrder: '当前为前端演示，未生成真实订单。',
  markDone: '当前为前端演示，未修改合同/资产/订单状态。',
  viewAllOrders: '当前为前端演示，未加载全部订单列表。',
  viewRecord: '当前为前端演示，仅展示记录预览，待接入真实服务。',
  applyPending: '当前为前端演示，发起申请待接入审批流程，未写入真实数据。',
  refundApply: '发起退款申请为前端演示，待接入真实服务，未写入真实数据。',
  resignContract: '补签合同为前端演示，待接入真实服务，未写入真实数据。',
  freezeApply: '冻结申请为前端演示，待接入真实服务，未写入真实数据。',
  transferApply: '转卡申请为前端演示，待接入真实服务，未写入真实数据。',
  markRiskDone: '标记处理为前端演示，未修改真实风险状态。',
  insightFilter: (label: string) => `已筛选：${label}（前端演示，未修改真实数据）`,
  clearedFilters: '已清空筛选条件。',
} as const;
