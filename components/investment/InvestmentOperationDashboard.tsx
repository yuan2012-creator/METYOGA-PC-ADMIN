import React, { useCallback, useMemo, useState } from 'react';
import {
  buildInvestmentOperationSnapshot,
  DEFAULT_INVESTMENT_FILTERS,
  getSegmentFocusItems,
  INVESTMENT_WORKBENCH_SEGMENTS,
  type InvestmentFocusItem,
  type InvestmentListFilters,
  type InvestmentSegment,
} from './investmentOperationViewModel';
import { investmentDemoToast } from './investmentDemoToast';
import InvestmentMetricCard from './InvestmentMetricCard';
import InvestmentInsightPanel from './InvestmentInsightPanel';
import InvestmentWorkspaceTable from './InvestmentWorkspaceTable';
import InvestmentFocusPanel from './InvestmentFocusPanel';
import InvestmentDetailModal from './InvestmentDetailModal';
import type { InvestmentDetailTabId } from './InvestmentDetailTabs';

const InvestmentOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildInvestmentOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.focusQueue]);
  const [segment, setSegment] = useState<InvestmentSegment>('projects');
  const [filters, setFilters] = useState<InvestmentListFilters>(DEFAULT_INVESTMENT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<InvestmentDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: InvestmentDetailTabId) => {
    setModalEntityId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEntityId(null);
    setModalTab(undefined);
  };

  const segmentFocusItems = useMemo(
    () => getSegmentFocusItems(queue, segment),
    [queue, segment],
  );

  const handleInsight = (key: string) => {
    setSegment(key as InvestmentSegment);
    setFilters({ ...DEFAULT_INVESTMENT_FILTERS });
    showToast(
      investmentDemoToast.insightFilter(
        INVESTMENT_WORKBENCH_SEGMENTS.find(s => s.id === key)?.label ?? key,
      ),
    );
  };

  const handleMarkRead = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(investmentDemoToast.markRead);
  };

  const openFromFocus = (item: InvestmentFocusItem, impact?: boolean) => {
    openDetail(item.entityId, impact ? (item.openTab ?? 'sensitivity') : (item.openTab ?? 'overview'));
  };

  return (
    <div className="met-today-page met-investment-page">
      <header className="met-investment-header">
        <div className="met-investment-header__left">
          <h1>投资测算</h1>
          <p>投入预算、成本结构、产能模型、现金流与回本周期</p>
        </div>
        <div className="met-investment-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(investmentDemoToast.exportCalc)}>
            导出测算
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(investmentDemoToast.newProject)}>
            新建项目
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(investmentDemoToast.savePlan)}>
            保存方案
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(investmentDemoToast.paramNote)}>
            参数说明
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(investmentDemoToast.calcPreview)}>
            生成投资测算预览
          </button>
        </div>
      </header>

      <section className="met-investment-metrics">
        {snapshot.metrics.map(item => (
          <InvestmentMetricCard key={item.id} item={item} />
        ))}
      </section>

      <InvestmentInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-investment-main-grid">
        <InvestmentWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onSecondary={id => {
            if (segment === 'projects') openDetail(id, 'payback');
            else if (segment === 'breakeven') showToast(investmentDemoToast.viewFormula);
            else if (segment === 'cashflow') openDetail(id, 'payback');
            else showToast(investmentDemoToast.adjustPreview);
          }}
        />
        <InvestmentFocusPanel
          items={segmentFocusItems}
          onViewDetail={item => openFromFocus(item)}
          onViewImpact={item => openFromFocus(item, true)}
          onMarkRead={handleMarkRead}
        />
      </div>

      <InvestmentDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-investment-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default InvestmentOperationDashboard;
