export const isAuditEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const auditStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/已通过|已执行|已发布|正常/.test(status)) return 'ok';
  if (/待|草稿|复核/.test(status)) return 'pending';
  if (/驳回|风险|越权|缺失|异常/.test(status)) return 'risk';
  return 'neutral';
};

export const auditRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '低') return 'neutral';
  if (level === '中') return 'pending';
  return 'risk';
};
