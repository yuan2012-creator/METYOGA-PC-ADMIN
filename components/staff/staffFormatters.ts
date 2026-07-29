/** 师资与团队模块展示格式化（仅前端 demo） */

const toNumber = (value: string | number): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const n = Number(String(value).replace(/[¥,\s%]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const formatStaffCny = (value: string | number | null | undefined): string => {
  if (value == null || value === '') return '—';
  const n = toNumber(value);
  if (n == null) return '—';
  return `¥${Math.round(n).toLocaleString('en-US')}`;
};

export const formatStaffPercent = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${Math.round(value)}%`;
};

export const formatStaffCount = (value: number | null | undefined, unit = '人'): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value} ${unit}`;
};

export const formatStaffScore = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toFixed(1);
};

export const staffStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (/已|完成|通过|稳定|正常|已完课|已确认/.test(status)) {
    if (/待|异常|风险|预警/.test(status)) return 'pending';
    return 'ok';
  }
  if (/待|异常|风险|预警|观察|代课|请假/.test(status)) return 'pending';
  if (/降级|拒绝|取消|影响/.test(status)) return 'risk';
  return 'neutral';
};
