/** 规则配置模块展示格式化（仅前端 demo） */

export const formatSettingsDateTime = (value: string | null | undefined): string => {
  if (!value || value === '—') return '—';
  const n = value.replace('T', ' ').trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(n)) return n;
  const m = n.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : n;
};

export const formatSettingsPorts = (ports: string[]): string =>
  ports.length === 0 ? '—' : ports.join(' / ');

export const settingsStatusClass = (status: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (status === '已发布') return 'ok';
  if (/草稿|待审核|待发布/.test(status)) return 'pending';
  if (/冲突|缺失|停用/.test(status)) return 'risk';
  return 'neutral';
};

export const settingsSensitivityClass = (level: string): 'ok' | 'pending' | 'risk' | 'neutral' => {
  if (level === '普通') return 'neutral';
  if (level === '重要') return 'pending';
  if (level === '敏感' || level === '高敏感') return 'risk';
  return 'neutral';
};
