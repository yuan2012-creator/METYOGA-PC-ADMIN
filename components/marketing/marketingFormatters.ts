export const isMarketingEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const formatMarketingCny = (n: number): string =>
  `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

export const marketingStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/进行中|已到店|已成交|已复盘|已发放|正常/.test(status)) return 'ok';
  if (/待|犹豫|需|已报名|已确认/.test(status)) return 'pending';
  if (/未到店|未成交|风险|超标|异常|不适合|已流失/.test(status)) return 'risk';
  return 'neutral';
};

export const marketingRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '低') return 'neutral';
  if (level === '中') return 'pending';
  return 'risk';
};
