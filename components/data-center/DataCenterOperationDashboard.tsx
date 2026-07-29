import React, { useCallback, useMemo, useState } from 'react';
import {
  buildDataCenterOperationSnapshot,
  DATA_WORKBENCH_SEGMENTS,
  DEFAULT_DATA_FILTERS,
  getSegmentFocusItems,
  type DataFocusItem,
  type DataListFilters,
  type DataSegment,
} from './dataCenterOperationViewModel';
import { dataCenterDemoToast } from './dataCenterDemoToast';
import DataCenterMetricCard from './DataCenterMetricCard';
import DataCenterInsightPanel from './DataCenterInsightPanel';
import DataCenterWorkspaceTable from './DataCenterWorkspaceTable';
import DataCenterFocusPanel from './DataCenterFocusPanel';
import DataCenterDetailModal from './DataCenterDetailModal';
import type { DataCenterDetailTabId } from './DataCenterDetailTabs';

const SEGMENT_TAB: Partial<Record<DataSegment, DataCenterDetailTabId>> = {
  stores: 'overview',
  members: 'trend',
  courses: 'compare',
  teachers: 'trend',
  sales: 'overview',
  consumption: 'caliber',
  finance: 'caliber',
  activities: 'advice',
};

const DataCenterOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildDataCenterOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.focusQueue]);
  const [segment, setSegment] = useState<DataSegment>('stores');
  const [filters, setFilters] = useState<DataListFilters>(DEFAULT_DATA_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<DataCenterDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: DataCenterDetailTabId) => {
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
    setSegment(key as DataSegment);
    setFilters({ ...DEFAULT_DATA_FILTERS });
    showToast(
      dataCenterDemoToast.insightFilter(
        DATA_WORKBENCH_SEGMENTS.find(s => s.id === key)?.label ?? key,
      ),
    );
  };

  const handleMarkRead = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(dataCenterDemoToast.markRead);
  };

  const openFromFocus = (item: DataFocusItem, trend?: boolean) => {
    openDetail(item.entityId, trend ? (item.openTab ?? 'trend') : (item.openTab ?? 'overview'));
  };

  const trendTabForSegment = (seg: DataSegment): DataCenterDetailTabId =>
    SEGMENT_TAB[seg] === 'overview' ? 'trend' : (SEGMENT_TAB[seg] ?? 'trend');

  return (
    <div className="met-today-page met-data-page">
      <header className="met-data-header">
        <div className="met-data-header__left">
          <h1>数据中心</h1>
          <p>门店对比、会员、课程、老师、销售、耗课、财务与活动趋势</p>
        </div>
        <div className="met-data-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dataCenterDemoToast.exportReport)}>
            导出报表
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dataCenterDemoToast.saveView)}>
            保存视图
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dataCenterDemoToast.customMetric)}>
            自定义指标
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(dataCenterDemoToast.caliberNote)}>
            数据口径说明
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(dataCenterDemoToast.analysisPreview)}>
            生成经营分析预览
          </button>
        </div>
      </header>

      <section className="met-data-metrics">
        {snapshot.metrics.map(item => (
          <DataCenterMetricCard key={item.id} item={item} />
        ))}
      </section>

      <DataCenterInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-data-main-grid">
        <DataCenterWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onOpenTrend={id => openDetail(id, trendTabForSegment(segment))}
        />
        <DataCenterFocusPanel
          items={segmentFocusItems}
          onViewDetail={item => openFromFocus(item)}
          onViewTrend={item => openFromFocus(item, true)}
          onMarkRead={handleMarkRead}
        />
      </div>

      <DataCenterDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-data-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default DataCenterOperationDashboard;
