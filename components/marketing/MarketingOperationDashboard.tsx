import React, { useCallback, useMemo, useState } from 'react';
import {
  buildMarketingOperationSnapshot,
  DEFAULT_MARKETING_FILTERS,
  getSegmentActionItems,
  MARKETING_WORKBENCH_SEGMENTS,
  type MarketingActionItem,
  type MarketingListFilters,
  type MarketingSegment,
} from './marketingOperationViewModel';
import { marketingDemoToast } from './marketingDemoToast';
import MarketingMetricCard from './MarketingMetricCard';
import MarketingInsightPanel from './MarketingInsightPanel';
import MarketingWorkspaceTable from './MarketingWorkspaceTable';
import MarketingActionPanel from './MarketingActionPanel';
import MarketingDetailModal from './MarketingDetailModal';
import type { MarketingDetailTabId } from './MarketingDetailTabs';

const MARKETING_SEGMENTS = new Set<MarketingSegment>([
  'activities',
  'signups',
  'conversions',
  'coupons',
  'referrals',
  'costs',
  'reviews',
]);

const SEGMENT_TAB: Partial<Record<MarketingSegment, MarketingDetailTabId>> = {
  activities: 'overview',
  signups: 'signup',
  conversions: 'conversion',
  coupons: 'coupon',
  referrals: 'overview',
  costs: 'cost',
  reviews: 'review',
};

const MarketingOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildMarketingOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<MarketingSegment>('activities');
  const [filters, setFilters] = useState<MarketingListFilters>(DEFAULT_MARKETING_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<MarketingDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: MarketingDetailTabId) => {
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

  const handleSecondaryAction = (item: MarketingActionItem) => {
    switch (segment) {
      case 'activities':
        openFromAction(item, true);
        break;
      case 'signups':
        showToast(marketingDemoToast.remindArrival);
        break;
      case 'conversions':
        showToast(marketingDemoToast.assignFollow);
        break;
      case 'coupons':
        showToast(marketingDemoToast.checkRule);
        break;
      case 'referrals':
        showToast(marketingDemoToast.checkReward);
        break;
      case 'costs':
        showToast(marketingDemoToast.addVoucher);
        break;
      case 'reviews':
        showToast(marketingDemoToast.generateReview);
        break;
      default:
        openFromAction(item, true);
    }
  };

  const handleInsight = (key: string) => {
    const seg = key as MarketingSegment;
    if (MARKETING_SEGMENTS.has(seg)) {
      setSegment(seg);
      if (seg === 'signups') {
        setFilters({ ...DEFAULT_MARKETING_FILTERS, arrivalStatus: '未到店' });
      } else if (seg === 'conversions') {
        setFilters({ ...DEFAULT_MARKETING_FILTERS, query: '待跟进' });
      } else if (seg === 'costs') {
        setFilters({ ...DEFAULT_MARKETING_FILTERS, risk: '高' });
      } else if (seg === 'coupons') {
        setFilters({ ...DEFAULT_MARKETING_FILTERS, risk: '高' });
      } else {
        setFilters({ ...DEFAULT_MARKETING_FILTERS });
      }
      showToast(
        marketingDemoToast.insightFilter(
          MARKETING_WORKBENCH_SEGMENTS.find(s => s.id === seg)?.label ?? key,
        ),
      );
      return;
    }
    showToast(marketingDemoToast.insightFilter(key));
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(marketingDemoToast.markDone);
  };

  const tabForItem = (item: MarketingActionItem, chain?: boolean): MarketingDetailTabId => {
    if (!chain && item.openTab) return item.openTab;
    if (chain && item.openTab) return item.openTab;
    switch (item.entityType) {
      case 'signup':
        return 'signup';
      case 'conversion':
        return 'conversion';
      case 'coupon':
        return 'coupon';
      case 'cost':
        return 'cost';
      case 'review':
        return 'review';
      default:
        return 'overview';
    }
  };

  const openFromAction = (item: MarketingActionItem, chain?: boolean) => {
    openDetail(item.entityId, tabForItem(item, chain));
  };

  const chainTabForSegment = (seg: MarketingSegment): MarketingDetailTabId =>
    SEGMENT_TAB[seg] ?? 'overview';

  return (
    <div className="met-today-page met-marketing-page">
      <header className="met-marketing-header">
        <div className="met-marketing-header__left">
          <h1>活动运营</h1>
          <p>活动配置 · 报名转化 · 优惠权益 · 成本复盘 · 可复用模板</p>
        </div>
        <div className="met-marketing-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(marketingDemoToast.exportData)}>
            导出活动数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(marketingDemoToast.newActivity)}>
            新建活动
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(marketingDemoToast.newCoupon)}>
            新建优惠券
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(marketingDemoToast.review)}>
            活动复盘
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(marketingDemoToast.publish)}>
            发布活动
          </button>
        </div>
      </header>

      <section className="met-marketing-metrics">
        {snapshot.metrics.map(item => (
          <MarketingMetricCard key={item.id} item={item} />
        ))}
      </section>

      <MarketingInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-marketing-main-grid">
        <MarketingWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onOpenChain={id => openDetail(id, chainTabForSegment(segment))}
        />
        <MarketingActionPanel
          segment={segment}
          items={segmentActionItems}
          onViewDetail={item => openFromAction(item)}
          onSecondary={handleSecondaryAction}
          onMarkDone={handleMarkDone}
        />
      </div>

      <MarketingDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-marketing-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default MarketingOperationDashboard;
