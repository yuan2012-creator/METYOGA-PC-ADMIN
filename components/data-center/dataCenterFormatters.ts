export const isDataEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const formatDataCny = (n: number): string =>
  `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

export const formatDataPct = (n: number): string => `${n}%`;

export const dataStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/正常|可复用|良好|达标/.test(status)) return 'ok';
  if (/关注|偏慢|不足|偏低/.test(status)) return 'pending';
  if (/高风险|异常|下降|超标|流失/.test(status)) return 'risk';
  return 'neutral';
};

export const dataRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '正常') return 'ok';
  if (level === '关注') return 'pending';
  if (level === '高风险') return 'risk';
  return 'neutral';
};
