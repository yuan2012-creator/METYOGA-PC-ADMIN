import React, { useCallback, useMemo, useState } from 'react';
import {
  buildShopOperationSnapshot,
  DEFAULT_SHOP_FILTERS,
  SHOP_WORKBENCH_SEGMENTS,
  type ShopActionItem,
  type ShopListFilters,
  type ShopSegment,
} from './shopOperationViewModel';
import { shopDemoToast } from './shopDemoToast';
import ShopMetricCard from './ShopMetricCard';
import ShopInsightPanel from './ShopInsightPanel';
import ShopWorkspaceTable from './ShopWorkspaceTable';
import ShopActionPanel from './ShopActionPanel';
import ShopDetailModal from './ShopDetailModal';
import type { ShopDetailTabId } from './ShopDetailTabs';

const SHOP_SEGMENTS = new Set<ShopSegment>([
  'stores',
  'rooms',
  'hours',
  'staff',
  'courseTypes',
  'costs',
  'quality',
]);

const ShopOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildShopOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<ShopSegment>('stores');
  const [filters, setFilters] = useState<ShopListFilters>(DEFAULT_SHOP_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<ShopDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: ShopDetailTabId) => {
    setModalEntityId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEntityId(null);
    setModalTab(undefined);
  };

  const capacityItems = useMemo(() => queue.filter(i => i.group === 'capacity'), [queue]);
  const hoursItems = useMemo(() => queue.filter(i => i.group === 'hoursGap'), [queue]);
  const qualityItems = useMemo(() => queue.filter(i => i.group === 'qualityPending'), [queue]);
  const costItems = useMemo(() => queue.filter(i => i.group === 'costRisk'), [queue]);

  const handleInsight = (key: string) => {
    const seg = key as ShopSegment;
    if (SHOP_SEGMENTS.has(seg)) {
      setSegment(seg);
      if (seg === 'rooms') setFilters({ ...DEFAULT_SHOP_FILTERS, risk: '高' });
      else if (seg === 'hours') setFilters({ ...DEFAULT_SHOP_FILTERS, status: '待补齐', query: '节假日' });
      else if (seg === 'costs') setFilters({ ...DEFAULT_SHOP_FILTERS, query: '滨江' });
      else if (seg === 'quality') setFilters({ ...DEFAULT_SHOP_FILTERS, status: '待整改' });
      else setFilters({ ...DEFAULT_SHOP_FILTERS });
      showToast(
        shopDemoToast.insightFilter(
          SHOP_WORKBENCH_SEGMENTS.find(s => s.id === seg)?.label ?? key,
        ),
      );
      return;
    }
    showToast(shopDemoToast.insightFilter(key));
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(shopDemoToast.markDone);
  };

  const tabForItem = (item: ShopActionItem, chain?: boolean): ShopDetailTabId => {
    if (!chain) return item.openTab ?? 'overview';
    if (item.openTab) return item.openTab;
    switch (item.entityType) {
      case 'room':
        return 'capacity';
      case 'hours':
        return 'schedule';
      case 'cost':
        return 'cost';
      case 'quality':
        return 'quality';
      case 'staff':
        return 'staff';
      default:
        return 'overview';
    }
  };

  const openFromAction = (item: ShopActionItem, chain?: boolean) => {
    openDetail(item.entityId, tabForItem(item, chain));
  };

  return (
    <div className="met-today-page met-shop-page">
      <header className="met-shop-header">
        <div className="met-shop-header__left">
          <h1>门店管理</h1>
          <p>门店资料 · 教室容量 · 营业时间 · 员工归属 · 成本与质检</p>
        </div>
        <div className="met-shop-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(shopDemoToast.exportData)}>
            导出门店数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(shopDemoToast.newStore)}>
            新建门店
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(shopDemoToast.newRoom)}>
            新建教室
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(shopDemoToast.qualityLog)}>
            质检记录
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(shopDemoToast.ruleCheck)}>
            门店规则检查
          </button>
        </div>
      </header>

      <section className="met-shop-metrics">
        {snapshot.metrics.map(item => (
          <ShopMetricCard key={item.id} item={item} />
        ))}
      </section>

      <ShopInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-shop-main-grid">
        <ShopWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onOpenChain={id => {
            const tab: ShopDetailTabId =
              segment === 'rooms'
                ? 'capacity'
                : segment === 'hours'
                  ? 'schedule'
                  : segment === 'costs'
                    ? 'cost'
                    : segment === 'quality'
                      ? 'quality'
                      : segment === 'staff'
                        ? 'staff'
                        : 'overview';
            openDetail(id, tab);
          }}
        />
        <ShopActionPanel
          capacityItems={capacityItems}
          hoursItems={hoursItems}
          qualityItems={qualityItems}
          costItems={costItems}
          onViewDetail={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <ShopDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-shop-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default ShopOperationDashboard;
