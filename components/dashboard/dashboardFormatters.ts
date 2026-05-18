export const isDashboardEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const dashboardRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '正常' || level === '低') return 'ok';
  if (level === '关注' || level === '中') return 'pending';
  if (level === '高' || level === '高风险') return 'risk';
  return 'neutral';
};

export const dashboardStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/完成|健康|正常|已处理|合格/.test(status)) return 'ok';
  if (/待|进行|跟进|窗口/.test(status)) return 'pending';
  if (/异常|高|超期|风险|缺失/.test(status)) return 'risk';
  return 'neutral';
};
