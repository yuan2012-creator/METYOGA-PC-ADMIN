/** 数据中心模块演示 toast */

export const dataCenterDemoToast = {
  exportReport: '前端演示：导出报表需接入真实数据服务与权限审批。',
  saveView: '前端演示：保存视图为预览，未写入系统。',
  customMetric: '前端演示：自定义指标待接入指标配置服务。',
  caliberNote: '前端演示：数据口径说明以财务和业务系统真实数据为准。',
  analysisPreview: '前端演示：经营分析预览未生成真实报表。',
  markRead: '前端演示：标记已读仅本地移除关注项，未修改真实数据。',
  insightFilter: (label: string) => `已切换到：${label}（分析预览）`,
  viewAllPreview: '前端演示：查看全部明细待接入真实数据服务。',
} as const;

export const DATA_CENTER_PREVIEW_TOAST =
  '前端演示：需接入真实数据服务、审批流和操作日志后才可执行，未写入系统。';
