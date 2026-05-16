import React, { useEffect, useRef, useState } from 'react';
import { useMockAdminScope } from '../context/MockAdminScopeContext';
import { MOCK_STORE_ROWS } from '../constants/mockStoresCatalog';

/**
 * 左下角身份与数据范围入口（承接原主内容区 mock 门店筛选条能力）。
 */
const MockSidebarIdentityCard: React.FC = () => {
  const { config, effectiveStoreId, setHqSelectedStoreId, storeLabelById } = useMockAdminScope();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isHq = config.mode === 'hq';
  const scopeLabel = isHq
    ? effectiveStoreId
      ? storeLabelById(effectiveStoreId)
      : '全部门店'
    : storeLabelById(config.lockedStoreId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="met-sidebar-identity-card flex min-h-[56px] items-center px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium leading-tight text-[var(--met-text)]">{config.role}</div>
            <div className="mt-0.5 truncate text-xs leading-snug text-[var(--met-text-faint)]">
              {scopeLabel}
              <span className="text-[#b5bab4]"> · mock 数据</span>
            </div>
          </div>
          {isHq ? (
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="shrink-0 px-1 text-[11px] font-normal leading-none text-[var(--met-text-faint)] transition-colors hover:text-[var(--met-text-secondary)]"
              aria-expanded={open}
              aria-haspopup="dialog"
            >
              切换
            </button>
          ) : null}
        </div>
      </div>

      {isHq && open ? (
        <div
          className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-[0_4px_16px_rgba(24,24,27,0.08)]"
          role="dialog"
          aria-label="数据范围"
        >
          <div className="space-y-3 px-3 py-3 text-xs">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-stone-400">当前角色</div>
              <div className="mt-0.5 font-semibold text-[#292524]">{config.role}</div>
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                数据范围
              </div>
              <div className="mt-0.5 font-semibold text-[#292524]">{scopeLabel}</div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-stone-400">
                门店筛选
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setHqSelectedStoreId(null)}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    effectiveStoreId == null
                      ? 'border-stone-300 bg-stone-100 text-[#3d4540]'
                      : 'border-transparent bg-stone-50 text-stone-500 hover:border-stone-200'
                  }`}
                >
                  全部门店
                </button>
                {MOCK_STORE_ROWS.map(row => (
                  <button
                    key={row.numericIdStr}
                    type="button"
                    onClick={() => setHqSelectedStoreId(row.numericIdStr)}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                      effectiveStoreId === row.numericIdStr
                        ? 'border-stone-300 bg-stone-100 text-[#3d4540]'
                        : 'border-transparent bg-stone-50 text-stone-500 hover:border-stone-200'
                    }`}
                  >
                    {row.shortName}
                  </button>
                ))}
              </div>
            </div>
            <p className="border-t border-stone-100 pt-2 text-[10px] leading-relaxed text-stone-400">
              仅影响当前页面 mock 数据筛选，不改变真实权限
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MockSidebarIdentityCard;
