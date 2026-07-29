import React from 'react';
import { useMockAdminScope } from '../context/MockAdminScopeContext';
import { MOCK_STORE_ROWS } from '../constants/mockStoresCatalog';

/**
 * 总部 mock：可选择门店筛选数据；单店 mock：只读展示当前门店，不提供「全部门店」选项。
 * 真实权限接入后可替换为 session.storeScope。
 */
const MockAdminStoreScopeBar: React.FC = () => {
  const { config, effectiveStoreId, setHqSelectedStoreId, storeLabelById } = useMockAdminScope();

  if (config.mode === 'store') {
    return (
      <div
        className="flex shrink-0 items-center gap-3 border-b px-8 py-2.5 text-xs"
        style={{ borderColor: 'var(--met-border)', backgroundColor: 'var(--met-surface)' }}
      >
        <span className="font-bold text-[#202020]">{config.role}</span>
        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 font-semibold text-gray-700">
          当前门店：{storeLabelById(config.lockedStoreId)}
        </span>
        <span className="text-gray-400">单店视角不显示门店切换（mock）</span>
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-3 border-b px-8 py-2.5 text-xs"
      style={{ borderColor: 'var(--met-border)', backgroundColor: 'var(--met-surface)' }}
    >
      <span className="font-bold text-[#202020]">{config.role}</span>
      <label htmlFor="mock-hq-store-filter" className="text-gray-500">
        门店筛选
      </label>
      <select
        id="mock-hq-store-filter"
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-800 outline-none focus:border-[#1f5e3b]"
        value={effectiveStoreId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          setHqSelectedStoreId(v === '' ? null : v);
        }}
      >
        <option value="">全部门店</option>
        {MOCK_STORE_ROWS.map((row) => (
          <option key={row.numericIdStr} value={row.numericIdStr}>
            {row.shortName}
          </option>
        ))}
      </select>
      <span className="text-gray-400">仅 mock 数据过滤，不接真实权限</span>
    </div>
  );
};

export default MockAdminStoreScopeBar;
