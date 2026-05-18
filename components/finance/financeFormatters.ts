/** 财务管理模块展示格式化（仅前端 demo） */

const toNumber = (value: string | number): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  if (!raw || raw === '—') return null;
  if (raw.includes('积分')) return null;
  const cleaned = raw.replace(/[¥,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const formatFinanceCny = (value: string | number | null | undefined): string => {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' && value.includes('积分')) return value;
  const n = toNumber(value);
  if (n == null) return '—';
  return `¥${Math.round(n).toLocaleString('en-US')}`;
};

export const formatFinanceCount = (value: number | null | undefined, unit = '笔'): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value} ${unit}`;
};

export const formatFinanceDate = (value: string | null | undefined): string => {
  if (!value || value === '—') return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const short = value.match(/^(\d{2})-(\d{2})/);
  if (short) return `2026-${short[1]}-${short[2]}`;
  return value;
};

export const formatFinanceDateTime = (value: string | null | undefined): string => {
  if (!value || value === '—') return '—';
  const normalized = value.replace('T', ' ').trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(normalized)) {
    const [datePart, timePart] = normalized.split(/\s+/);
    const hm = timePart.match(/^(\d{1,2}):(\d{2})/);
    if (hm) return `${formatFinanceDate(datePart)} ${hm[1].padStart(2, '0')}:${hm[2]}`;
  }
  const d = formatFinanceDate(normalized.split(' ')[0] ?? normalized);
  const t = normalized.match(/(\d{1,2}):(\d{2})/);
  if (d === '—') return value;
  return t ? `${d} ${t[1].padStart(2, '0')}:${t[2]}` : d;
};

export const financeStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/已|完成|通过|正常|已核对|已确认|已发放|已结算|已付款|已归档/.test(status)) {
    if (/待|异常|风险|驳回|需/.test(status)) return 'pending';
    return 'ok';
  }
  if (/待|异常|风险|驳回|需|未/.test(status)) return 'pending';
  if (/退款|负债|金额/.test(status)) return 'risk';
  return 'neutral';
};
