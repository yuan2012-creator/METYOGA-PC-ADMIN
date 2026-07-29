/** 师资与团队模块演示 toast */

export const staffDemoToast = {
  exportData: '前端演示：导出老师数据需接入真实员工服务。',
  newTeacher: '前端演示：新增老师需接入真实员工服务。',
  payReview: '前端演示：课时费核对为预览，未写入真实数据。',
  growthReview: '前端演示：成长等级复核为预览，待店长确认。',
  newTask: '前端演示：新建团队任务需接入真实服务。',
  markDone: '前端演示：标记处理未修改真实状态。',
  insightFilter: (label: string) => `已切换到：${label}（前端演示）`,
  demoAction: '前端演示：本操作未保存，需接入真实审核服务。',
} as const;
