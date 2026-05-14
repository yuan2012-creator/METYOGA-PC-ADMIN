import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { MockAdminUiConfig } from '../constants/mockAdminScope';
import { MOCK_ADMIN_UI_DEFAULT } from '../constants/mockAdminScope';
import { MOCK_STORE_ROWS } from '../constants/mockStoresCatalog';

export type MockAdminScopeContextValue = {
  config: MockAdminUiConfig;
  /** 总部：null=全部；单店：始终为 lockedStoreId */
  effectiveStoreId: string | null;
  setHqSelectedStoreId: (id: string | null) => void;
  storeLabelById: (id: string) => string;
};

const MockAdminScopeContext = createContext<MockAdminScopeContextValue | null>(null);

const labelMap = Object.fromEntries(MOCK_STORE_ROWS.map((r) => [r.numericIdStr, r.shortName]));

export const MockAdminScopeProvider: React.FC<{
  children: React.ReactNode;
  initialConfig?: MockAdminUiConfig;
}> = ({ children, initialConfig = MOCK_ADMIN_UI_DEFAULT }) => {
  const [config] = useState<MockAdminUiConfig>(() => ({ ...initialConfig }));
  const [hqSelectedStoreId, setHqSelectedStoreId] = useState<string | null>(
    initialConfig.mode === 'hq' ? initialConfig.hqSelectedStoreId : null,
  );

  const effectiveStoreId = useMemo(() => {
    if (config.mode === 'store') return config.lockedStoreId;
    return hqSelectedStoreId;
  }, [config.mode, config.lockedStoreId, hqSelectedStoreId]);

  const storeLabelById = useCallback((id: string) => labelMap[id] ?? `门店 ${id}`, []);

  const value = useMemo(
    () => ({
      config,
      effectiveStoreId,
      setHqSelectedStoreId,
      storeLabelById,
    }),
    [config, effectiveStoreId, storeLabelById],
  );

  return <MockAdminScopeContext.Provider value={value}>{children}</MockAdminScopeContext.Provider>;
};

export function useMockAdminScope(): MockAdminScopeContextValue {
  const v = useContext(MockAdminScopeContext);
  if (!v) {
    throw new Error('useMockAdminScope must be used within MockAdminScopeProvider');
  }
  return v;
}
