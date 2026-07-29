export const isInvestmentEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const formatInvestmentCny = (n: number): string =>
  `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

export const investmentRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '正常') return 'ok';
  if (level === '关注') return 'pending';
  if (level === '高风险') return 'risk';
  return 'neutral';
};

export const investmentStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/达标|安全|正常|充足/.test(status)) return 'ok';
  if (/关注|偏紧|不足|缺口/.test(status)) return 'pending';
  if (/高风险|危险|超支|延后/.test(status)) return 'risk';
  return 'neutral';
};
