/** 活动运营模块演示 toast */

export const marketingDemoToast = {
  exportData: '前端演示：导出活动数据需接入真实活动服务。',
  newActivity: '前端演示：新建活动需接入活动服务与审批流。',
  newCoupon: '前端演示：新建优惠券需接入权益服务。',
  review: '前端演示：活动复盘为预览，未写入真实数据。',
  publish: '前端演示：发布活动需总部审批，未真实发布。',
  markDone: '前端演示：仅本地移除待办，未修改真实活动状态。',
  insightFilter: (label: string) => `已切换到：${label}（前端演示）`,
  remindArrival: '前端演示：到店提醒为预览，待接入消息服务。',
  assignFollow: '前端演示：分配跟进为预览，需审批后执行。',
  checkRule: '前端演示：权益规则核对为预览，不做真实发券或作废。',
  checkReward: '前端演示：奖励核对为预览，需审批后执行。',
  addVoucher: '前端演示：补凭证为预览，待接入财务服务。',
  generateReview: '前端演示：生成复盘结论为预览，未写入系统。',
} as const;

export const MARKETING_PREVIEW_TOAST =
  '前端演示：需接入真实活动服务、审批流和操作日志后才可执行，未写入系统。';
