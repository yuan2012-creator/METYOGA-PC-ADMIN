/** 权限审计模块演示 toast */

export const auditDemoToast = {
  exportAudit: '前端演示：导出审计记录需接入真实审计服务。',
  newRole: '前端演示：新建角色需接入权限服务与审批流。',
  permCheck: '前端演示：权限检查为预览，未修改真实配置。',
  approvalRules: '前端演示：审批规则需接入真实服务。',
  sensitiveReview: '前端演示：敏感操作复核未写入系统。',
  markDone: '前端演示：仅本地移除待办，未修改真实审计状态。',
  insightFilter: (label: string) => `已切换到：${label}（前端演示）`,
} as const;

export const AUDIT_PREVIEW_TOAST =
  '前端演示：需接入真实审计服务、审批流和操作日志后才可执行，未写入系统。';
