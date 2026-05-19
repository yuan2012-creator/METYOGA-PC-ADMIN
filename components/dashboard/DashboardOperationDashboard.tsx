import React, { useCallback, useMemo, useState } from 'react';
import {
  buildDashboardOperationSnapshot,
  type DashboardActionSuggestion,
} from './dashboardOperationViewModel';
import type { DashboardDetailTabId } from './DashboardDetailTabs';
import { dashboardDemoToast } from './dashboardDemoToast';
import DashboardMetricCard from './DashboardMetricCard';
import DashboardVisualPanel from './DashboardVisualPanel';
import DashboardStoreHealthStrip from './DashboardStoreHealthStrip';
import DashboardRiskFlow from './DashboardRiskFlow';
import DashboardWorkspaceTable from './DashboardWorkspaceTable';
import DashboardActionPanel from './DashboardActionPanel';
import DashboardDetailModal from './DashboardDetailModal';

const DashboardOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildDashboardOperationSnapshot(), []);
  const { stitch } = snapshot;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<DashboardDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: DashboardDetailTabId) => {
    setModalEntityId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEntityId(null);
    setModalTab(undefined);
  };

  const handleSuggestion = (item: DashboardActionSuggestion) => {
    if (item.entityId) openDetail(item.entityId, item.openTab);
    else showToast(dashboardDemoToast.actionSuggestion(item.buttonLabel));
  };

  return (
    <div className="met-today-page met-dashboard-page met-dashboard-page--stitch">
      <header className="met-dashboard-status-hero">
        <div className="met-dashboard-status-hero__copy">
          <h1>{stitch.statusHero.title}</h1>
          <p className="met-dashboard-status-hero__summary">
            {stitch.statusHero.line1}
            <br />
            {stitch.statusHero.line2}
          </p>
        </div>
        <div className="met-dashboard-status-hero__kpis">
          <div className="met-dashboard-status-hero__kpi">
            <span className="met-dashboard-status-hero__kpi-label">待处理</span>
            <span className="met-dashboard-status-hero__kpi-value">{stitch.statusHero.totalPending}</span>
          </div>
          <div className="met-dashboard-status-hero__kpi">
            <span className="met-dashboard-status-hero__kpi-label">高优先级</span>
            <span className="met-dashboard-status-hero__kpi-value is-warn">
              {stitch.statusHero.highPriorityCount}
            </span>
          </div>
          <div className="met-dashboard-status-hero__kpi">
            <span className="met-dashboard-status-hero__kpi-label">临近超时</span>
            <span className="met-dashboard-status-hero__kpi-value is-overdue">
              {stitch.statusHero.nearOverdueCount}
            </span>
          </div>
        </div>
      </header>

      <section className="met-dashboard-hero-grid">
        <DashboardVisualPanel judgment={stitch.judgment} />
        <DashboardStoreHealthStrip
          items={snapshot.cockpit.storeHealthItems}
          onStoreClick={store => showToast(dashboardDemoToast.storeFilter(store))}
        />
      </section>

      <section className="met-dashboard-kpis-section">
        <h2 className="met-dashboard-section-title">核心经营指标（实时）</h2>
        <div className="met-dashboard-kpis">
          {snapshot.metrics.map(item => (
            <DashboardMetricCard key={item.id} item={item} compact stitch />
          ))}
        </div>
      </section>

      <DashboardRiskFlow
        title="跨模块证据链"
        nodes={stitch.evidenceNodes}
        insight={stitch.evidenceInsight}
      />

      <section className="met-dashboard-bottom-grid">
        <DashboardWorkspaceTable
          variant="storeMonitor"
          snapshot={snapshot}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
        />
        <DashboardActionPanel
          variant="suggestions"
          suggestions={stitch.actionSuggestions}
          onSuggestionAction={handleSuggestion}
        />
      </section>

      <DashboardDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-dashboard-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default DashboardOperationDashboard;
