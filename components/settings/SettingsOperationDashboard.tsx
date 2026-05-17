import React, { useCallback, useMemo, useState } from 'react';
import {
  buildSettingsOperationSnapshot,
  DEFAULT_SETTINGS_FILTERS,
  SETTINGS_WORKBENCH_SEGMENTS,
  type SettingsActionItem,
  type SettingsListFilters,
  type SettingsWorkbenchSegment,
} from './settingsOperationViewModel';
import { settingsDemoToast } from './settingsDemoToast';
import SettingsMetricCard from './SettingsMetricCard';
import SettingsInsightPanel from './SettingsInsightPanel';
import SettingsWorkspaceTable from './SettingsWorkspaceTable';
import SettingsActionPanel from './SettingsActionPanel';
import SettingsDetailModal from './SettingsDetailModal';
import type { SettingsDetailTabId } from './SettingsDetailTabs';

const SETTINGS_SEGMENTS = new Set<SettingsWorkbenchSegment>([
  'booking',
  'courses',
  'cardBenefits',
  'contract',
  'points',
  'teacherPay',
  'crossStore',
  'notifyPerm',
]);

const SettingsOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildSettingsOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<SettingsWorkbenchSegment>('booking');
  const [filters, setFilters] = useState<SettingsListFilters>(DEFAULT_SETTINGS_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRuleId, setModalRuleId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<SettingsDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openRule = (id: string, tab?: SettingsDetailTabId) => {
    setModalRuleId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalRuleId(null);
    setModalTab(undefined);
  };

  const conflictItems = useMemo(() => queue.filter(i => i.group === 'conflict'), [queue]);
  const pendingItems = useMemo(() => queue.filter(i => i.group === 'pendingPublish'), [queue]);
  const missingItems = useMemo(() => queue.filter(i => i.group === 'missing'), [queue]);
  const sensitiveItems = useMemo(() => queue.filter(i => i.group === 'sensitive'), [queue]);

  const handleInsight = (key: string) => {
    const seg = key as SettingsWorkbenchSegment;
    if (!SETTINGS_SEGMENTS.has(seg)) return;
    setSegment(seg);
    if (key === 'booking') {
      setFilters({ ...DEFAULT_SETTINGS_FILTERS, conflictOnly: true, query: '取消' });
    } else if (key === 'cardBenefits') {
      setFilters({ ...DEFAULT_SETTINGS_FILTERS, query: '冻结' });
    } else if (key === 'teacherPay') {
      setFilters({ ...DEFAULT_SETTINGS_FILTERS, pendingOnly: true });
    } else if (key === 'notifyPerm') {
      setFilters({ ...DEFAULT_SETTINGS_FILTERS, query: '通知' });
    } else {
      setFilters({ ...DEFAULT_SETTINGS_FILTERS });
    }
    showToast(
      settingsDemoToast.insightFilter(
        SETTINGS_WORKBENCH_SEGMENTS.find(s => s.id === seg)?.label ?? key,
      ),
    );
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(settingsDemoToast.markDone);
  };

  const openFromAction = (item: SettingsActionItem, impact?: boolean) => {
    const tab: SettingsDetailTabId = impact
      ? 'sync'
      : item.openTab === 'approval'
        ? 'approval'
        : item.openTab === 'risk'
          ? 'risk'
          : item.openTab === 'sync'
            ? 'sync'
            : 'overview';
    openRule(item.ruleId, tab);
  };

  return (
    <div className="met-today-page met-settings-page">
      <header className="met-settings-header">
        <div className="met-settings-header__left">
          <h1>规则配置</h1>
          <p>统一预约、权益、合同、积分、课时费、结算与权限规则</p>
        </div>
        <div className="met-settings-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(settingsDemoToast.exportRules)}>
            导出规则
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(settingsDemoToast.newRule)}>
            新建规则
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(settingsDemoToast.ruleCheck)}>
            规则检查
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(settingsDemoToast.versionHistory)}>
            版本记录
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(settingsDemoToast.publish)}>
            申请发布预览
          </button>
        </div>
      </header>

      <section className="met-settings-metrics">
        {snapshot.metrics.map(item => (
          <SettingsMetricCard key={item.id} item={item} />
        ))}
      </section>

      <SettingsInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-settings-main-grid">
        <SettingsWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalRuleId : null}
          onOpenRule={id => openRule(id)}
          onViewImpact={id => openRule(id, 'sync')}
        />
        <SettingsActionPanel
          conflictItems={conflictItems}
          pendingItems={pendingItems}
          missingItems={missingItems}
          sensitiveItems={sensitiveItems}
          onViewRule={item => openFromAction(item)}
          onViewImpact={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <SettingsDetailModal
        open={modalOpen}
        ruleId={modalRuleId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-settings-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default SettingsOperationDashboard;
