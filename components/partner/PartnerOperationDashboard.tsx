import React, { useCallback, useMemo, useState } from 'react';
import {
  buildPartnerOperationSnapshot,
  DEFAULT_PARTNER_FILTERS,
  getSegmentActionItems,
  PARTNER_WORKBENCH_SEGMENTS,
  type PartnerActionItem,
  type PartnerListFilters,
  type PartnerSegment,
} from './partnerOperationViewModel';
import type { PartnerDetailTabId } from './PartnerDetailTabs';
import { partnerDemoToast } from './partnerDemoToast';
import PartnerMetricCard from './PartnerMetricCard';
import PartnerInsightPanel from './PartnerInsightPanel';
import PartnerWorkspaceTable from './PartnerWorkspaceTable';
import PartnerActionPanel from './PartnerActionPanel';
import PartnerDetailModal from './PartnerDetailModal';

const PartnerOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildPartnerOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<PartnerSegment>('stores');
  const [filters, setFilters] = useState<PartnerListFilters>(DEFAULT_PARTNER_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<PartnerDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: PartnerDetailTabId) => {
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
    setSegment(key as PartnerSegment);
    setFilters({ ...DEFAULT_PARTNER_FILTERS });
    showToast(
      partnerDemoToast.insightFilter(
        PARTNER_WORKBENCH_SEGMENTS.find(s => s.id === key)?.label ?? key,
      ),
    );
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(partnerDemoToast.markDone);
  };

  const openFromAction = (item: PartnerActionItem, chain?: boolean) => {
    openDetail(item.entityId, chain ? 'overview' : (item.openTab ?? 'overview'));
  };

  const handleSecondary = (id: string) => {
    if (segment === 'stores') openDetail(id, 'authScope');
    else if (segment === 'authStatus') showToast(partnerDemoToast.adjustPreview);
    else if (segment === 'brand') openDetail(id, 'brand');
    else if (segment === 'dataSync') openDetail(id, 'data');
    else if (segment === 'quality') openDetail(id, 'quality');
    else if (segment === 'systemAuth') openDetail(id, 'authScope');
    else if (segment === 'renewal') openDetail(id, 'renewal');
    else showToast(partnerDemoToast.adjustPreview);
  };

  return (
    <div className="met-today-page met-partner-page">
      <header className="met-partner-header">
        <div className="met-partner-header__left">
          <h1>合作与授权</h1>
          <p>合作门店、授权范围、品牌规范、数据回传与质检整改</p>
        </div>
        <div className="met-partner-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(partnerDemoToast.exportData)}>
            导出合作数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(partnerDemoToast.newStore)}>
            新增合作门店
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(partnerDemoToast.newAuthPlan)}>
            新建授权方案
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(partnerDemoToast.qualityLog)}>
            质检记录
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(partnerDemoToast.publishRule)}>
            发布授权规则
          </button>
        </div>
      </header>

      <section className="met-partner-metrics">
        {snapshot.metrics.map(item => (
          <PartnerMetricCard key={item.id} item={item} />
        ))}
      </section>

      <PartnerInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-partner-main-grid">
        <PartnerWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onSecondary={handleSecondary}
        />
        <PartnerActionPanel
          items={segmentActionItems}
          onViewStore={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <PartnerDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-partner-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default PartnerOperationDashboard;
