import React, { useCallback, useMemo, useState } from 'react';
import {
  buildDashboardOperationSnapshot,
  DEFAULT_DASHBOARD_FILTERS,
  getSegmentActionItems,
  DASHBOARD_WORKBENCH_SEGMENTS,
  type DashboardActionItem,
  type DashboardListFilters,
  type DashboardSegment,
} from './dashboardOperationViewModel';
import type { DashboardDetailTabId } from './DashboardDetailTabs';
import { dashboardDemoToast } from './dashboardDemoToast';
import DashboardMetricCard from './DashboardMetricCard';
import DashboardInsightPanel from './DashboardInsightPanel';
import DashboardWorkspaceTable from './DashboardWorkspaceTable';
import DashboardActionPanel from './DashboardActionPanel';
import DashboardDetailModal from './DashboardDetailModal';

const DashboardOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildDashboardOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<DashboardSegment>('todayTodo');
  const [filters, setFilters] = useState<DashboardListFilters>(DEFAULT_DASHBOARD_FILTERS);
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

  const segmentActionItems = useMemo(
    () => getSegmentActionItems(queue, segment),
    [queue, segment],
  );

  const handleInsight = (key: string) => {
    setSegment(key as DashboardSegment);
    setFilters({ ...DEFAULT_DASHBOARD_FILTERS });
    showToast(
      dashboardDemoToast.insightFilter(
        DASHBOARD_WORKBENCH_SEGMENTS.find(s => s.id === key)?.label ?? key,
      ),
    );
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(dashboardDemoToast.markDone);
  };

  const openFromAction = (item: DashboardActionItem, chain?: boolean) => {
    openDetail(item.entityId, chain ? 'evidence' : (item.openTab ?? 'judgment'));
  };

  const handleSecondary = (id: string) => {
    if (segment === 'todayTodo') openDetail(id, 'evidence');
    else if (segment === 'storeHealth') openDetail(id, 'store');
    else if (segment === 'memberRisk') showToast(dashboardDemoToast.adjustPreview);
    else if (segment === 'courseAnomaly') openDetail(id, 'evidence');
    else if (segment === 'financeRisk') openDetail(id, 'finance');
    else if (segment === 'teacherExec') openDetail(id, 'memberCourse');
    else if (segment === 'crossModule') showToast(dashboardDemoToast.markDone);
    else showToast(dashboardDemoToast.adjustPreview);
  };

  return (
    <div className="met-today-page met-dashboard-page">
      <header className="met-dashboard-header">
        <div className="met-dashboard-header__left">
          <h1>经营总览</h1>
          <p>问题优先、动作优先、责任人优先</p>
        </div>
        <div className="met-dashboard-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dashboardDemoToast.exportSummary)}>
            导出经营摘要
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dashboardDemoToast.storeCompare)}>
            门店对比
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dashboardDemoToast.dailyReport)}>
            生成经营日报
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dashboardDemoToast.riskReview)}>
            风险复盘
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(dashboardDemoToast.actionList)}>
            今日行动清单
          </button>
        </div>
      </header>

      <section className="met-dashboard-metrics">
        {snapshot.metrics.map(item => (
          <DashboardMetricCard key={item.id} item={item} />
        ))}
      </section>

      <DashboardInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-dashboard-main-grid">
        <DashboardWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onSecondary={handleSecondary}
        />
        <DashboardActionPanel
          items={segmentActionItems}
          onViewDetail={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

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
