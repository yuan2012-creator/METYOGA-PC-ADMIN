export const isPartnerEmpty = (v: string | null | undefined): boolean =>
  !v || v === '—' || v === '--';

export const partnerRiskClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '正常') return 'ok';
  if (level === '关注') return 'pending';
  if (level === '高风险') return 'risk';
  return 'neutral';
};

export const partnerStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/有效|合格|正常|已完成|续约中/.test(status)) return 'ok';
  if (/待|即将|观察|整改中/.test(status)) return 'pending';
  if (/异常|高风险|超期|暂停|退出/.test(status)) return 'risk';
  return 'neutral';
};
