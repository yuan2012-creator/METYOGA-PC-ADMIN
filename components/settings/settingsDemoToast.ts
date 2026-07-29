/** 规则配置模块演示 toast */

export const settingsDemoToast = {
  exportRules: '前端演示：导出规则需接入真实规则服务。',
  newRule: '前端演示：新建规则需接入规则服务与审批流。',
  ruleCheck: '前端演示：规则检查为预览，未修改真实配置。',
  versionHistory: '前端演示：版本记录需接入规则服务。',
  publish: '前端演示：发布规则版本需总部审批，未真实发布。',
  markDone: '前端演示：标记处理未修改真实规则状态。',
  insightFilter: (label: string) => `已切换到：${label}（前端演示）`,
  demoAction: '前端演示：本操作未保存，需接入真实规则服务。',
} as const;
