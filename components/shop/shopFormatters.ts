export const isShopEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const formatShopCny = (n: number): string =>
  `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

export const shopStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/运营中|正常|已通过|已整改/.test(status)) return 'ok';
  if (/筹备|待|复核|整改中/.test(status)) return 'pending';
  if (/暂停|风险|异常|超/.test(status)) return 'risk';
  return 'neutral';
};

export const shopRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '低') return 'neutral';
  if (level === '中') return 'pending';
  return 'risk';
};
