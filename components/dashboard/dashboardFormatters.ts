export const isDashboardEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const dashboardRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '正常' || level === '低' || level === '稳定') return 'ok';
  if (level === '关注' || level === '中') return 'pending';
  if (level === '高' || level === '高风险' || level === '风险') return 'risk';
  return 'neutral';
};

export const dashboardStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/完成|健康|正常|已处理|合格|稳定/.test(status)) return 'ok';
  if (/待|进行|跟进|窗口|关注/.test(status)) return 'pending';
  if (/异常|高|超期|风险|缺失/.test(status)) return 'risk';
  return 'neutral';
};

/** 人民币金额：¥ + 千分位，避免截断错误 */
export const formatDashboardCurrency = (amount: number): string => {
  const rounded = Math.round(amount);
  return `¥${rounded.toLocaleString('zh-CN')}`;
};

export const formatDashboardCompactMoney = (amount: number): string => {
  if (amount >= 1_000_000) return `¥${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `¥${(amount / 10_000).toFixed(1)}万`;
  return formatDashboardCurrency(amount);
};
