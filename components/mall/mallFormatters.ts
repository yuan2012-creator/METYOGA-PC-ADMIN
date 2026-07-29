/** 产品与合同模块展示格式化（仅前端 demo） */

const parseDigits = (label: string): number => {
  const n = label.replace(/[^0-9]/g, '');
  return n ? Number(n) : 0;
};

/** 从订单号 SO-YYYYMMDD-NNN 解析日期 */
export const parseOrderNoDateTime = (
  orderNo: string,
  time = '10:20',
): { date: string; dateTime: string } => {
  const m = orderNo.match(/^SO-(\d{4})(\d{2})(\d{2})/);
  if (!m) return { date: '—', dateTime: '—' };
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  return { date, dateTime: `${date} ${time}` };
};

/** 操作日志时间 MM-DD HH:mm → 2026-MM-DD HH:mm */
export const formatMallLogAt = (at: string): string => {
  if (/^\d{4}-\d{2}-\d{2}/.test(at)) return at;
  const m = at.match(/^(\d{2})-(\d{2})\s+(\d{1,2}:\d{2})/);
  if (m) return `2026-${m[1]}-${m[2]} ${m[3]}`;
  return at;
};

export const formatMallCny = (value: string | number | null | undefined): string => {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' && value.includes('积分')) return value;
  const n = typeof value === 'number' ? value : parseDigits(value);
  if (!Number.isFinite(n)) return typeof value === 'string' ? value : '—';
  if (n === 0 && typeof value === 'string' && !value.includes('0')) {
    return value.trim().startsWith('¥') ? value : `¥${value}`;
  }
  return `¥${n.toLocaleString('en-US')}`;
};

export const lookupOrderNo = (
  orders: { id: string; orderNo: string }[],
  orderId?: string,
): string => {
  if (!orderId) return '—';
  return orders.find(o => o.id === orderId)?.orderNo ?? '—';
};

export const lookupContractNo = (
  contracts: { id: string; contractNo: string }[],
  contractId?: string,
): string => {
  if (!contractId) return '—';
  return contracts.find(c => c.id === contractId)?.contractNo ?? '—';
};

export const lookupAssetName = (
  assets: { id: string; assetName: string }[],
  assetId?: string,
): string => {
  if (!assetId) return '—';
  return assets.find(a => a.id === assetId)?.assetName ?? '—';
};
