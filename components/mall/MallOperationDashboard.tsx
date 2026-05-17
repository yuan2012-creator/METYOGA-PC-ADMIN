import React, { useCallback, useMemo, useState } from 'react';
import {
  buildMallOperationSnapshot,
  DEFAULT_MALL_LIST_FILTERS,
  type MallActionItem,
  type MallListFilters,
  type MallWorkbenchSegment,
} from './mallOperationViewModel';
import { mallDemoToast } from './mallDemoToast';
import MallMetricCard from './MallMetricCard';
import MallInsightPanel from './MallInsightPanel';
import MallProductListTable from './MallProductListTable';
import MallActionPanel from './MallActionPanel';
import MallDetailModal from './MallDetailModal';
import type { MallModalOpenIntent } from './mallDetailNavigation';

const MallOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildMallOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<MallWorkbenchSegment>('products');
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<MallModalOpenIntent | null>(null);
  const [listFilters, setListFilters] = useState<MallListFilters>(DEFAULT_MALL_LIST_FILTERS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const modalProduct = useMemo(
    () => snapshot.products.find(p => p.id === modalProductId) ?? null,
    [snapshot.products, modalProductId],
  );

  const openProduct = (id: string) => {
    setModalProductId(id);
    setModalIntent(null);
    setModalOpen(true);
  };

  const openWithIntent = (intent: MallModalOpenIntent) => {
    setModalProductId(intent.productId);
    setModalIntent(intent);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalIntent(null);
  };

  const contractItems = useMemo(() => queue.filter(i => i.group === 'contract'), [queue]);
  const assetItems = useMemo(() => queue.filter(i => i.group === 'asset'), [queue]);
  const riskItems = useMemo(() => queue.filter(i => i.group === 'risk'), [queue]);

  const handleInsight = (key: string) => {
    if (key === 'contract') {
      setSegment('contracts');
      setListFilters({ ...DEFAULT_MALL_LIST_FILTERS, risk: '待签' });
      showToast(mallDemoToast.insightFilter('合同待签'));
      return;
    }
    if (key === 'asset') {
      setSegment('assets');
      setListFilters({ ...DEFAULT_MALL_LIST_FILTERS, asset: '待生成' });
      showToast(mallDemoToast.insightFilter('资产生成'));
      return;
    }
    if (key === 'refund') {
      setSegment('sensitive');
      setListFilters({ ...DEFAULT_MALL_LIST_FILTERS, risk: '待退款' });
      showToast(mallDemoToast.insightFilter('敏感操作待审'));
      return;
    }
    if (key === 'rules') {
      setSegment('products');
      setListFilters({ ...DEFAULT_MALL_LIST_FILTERS, status: '待补规则' });
      const target = snapshot.products.find(p => p.status === '待补规则');
      if (target) openProduct(target.id);
      showToast(mallDemoToast.insightFilter('产品规则缺失'));
    }
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(mallDemoToast.markDone);
  };

  const handleTableMarkDone = () => {
    showToast(mallDemoToast.markDone);
  };

  const requireProduct = (productId: string) => {
    if (snapshot.products.some(p => p.id === productId)) return productId;
    showToast('暂无关联产品（演示）');
    return null;
  };

  const openOrder = (productId: string, orderId: string) => {
    const pid = requireProduct(productId);
    if (!pid) return;
    openWithIntent({
      productId: pid,
      tab: 'orders',
      subview: { type: 'orderDetail', id: orderId },
    });
  };

  const openContract = (productId: string, contractId?: string) => {
    const pid = requireProduct(productId);
    if (!pid) return;
    openWithIntent({
      productId: pid,
      tab: 'contract',
      subview: { type: 'contractDetail', id: contractId },
    });
  };

  const openAsset = (productId: string, assetId?: string) => {
    const pid = requireProduct(productId);
    if (!pid) return;
    openWithIntent({
      productId: pid,
      tab: 'asset',
      subview: { type: 'assetDetail', id: assetId },
    });
  };

  const openRisk = (productId: string, riskId: string) => {
    const pid = requireProduct(productId);
    if (!pid) return;
    openWithIntent({
      productId: pid,
      tab: 'risk',
      subview: { type: 'riskRecord', id: riskId },
    });
  };

  const openFromActionOrder = (item: MallActionItem) => {
    if (!item.productId || !item.relatedOrderId) {
      if (item.productId) openProduct(item.productId);
      return;
    }
    openOrder(item.productId, item.relatedOrderId);
  };

  const openFromActionContract = (item: MallActionItem) => {
    if (!item.productId) return;
    openContract(item.productId, item.relatedContractId);
  };

  const openFromActionAsset = (item: MallActionItem) => {
    if (!item.productId) return;
    openAsset(item.productId, item.relatedAssetId);
  };

  const openFromActionRisk = (item: MallActionItem) => {
    if (!item.productId || !item.relatedRiskId) return;
    openRisk(item.productId, item.relatedRiskId);
  };

  return (
    <div className="met-today-page met-mall-page">
      <header className="met-mall-header">
        <div className="met-mall-header__left">
          <h1>产品与合同</h1>
          <p>产品配置 · 销售订单 · 合同签署 · 资产生成 · 敏感操作风险（仅展示草稿 / 预览）</p>
        </div>
        <div className="met-mall-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(mallDemoToast.exportOrders)}>
            导出订单
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(mallDemoToast.newCard)}>
            新建卡项
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => showToast(mallDemoToast.newContractTemplate)}
          >
            新建合同模板
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(mallDemoToast.ruleCheck)}>
            规则检查
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(mallDemoToast.newOrder)}>
            新建销售订单
          </button>
        </div>
      </header>

      <section className="met-mall-metrics">
        {snapshot.metrics.map(item => (
          <MallMetricCard key={item.id} item={item} />
        ))}
      </section>

      <MallInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-mall-main-grid">
        <MallProductListTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={listFilters}
          onFiltersChange={setListFilters}
          highlightId={modalOpen ? modalProductId : null}
          onOpenProduct={openProduct}
          onOpenOrder={openOrder}
          onOpenContract={openContract}
          onOpenAsset={openAsset}
          onOpenRisk={openRisk}
          onMarkDone={handleTableMarkDone}
        />
        <MallActionPanel
          contractItems={contractItems}
          assetItems={assetItems}
          riskItems={riskItems}
          onViewOrder={openFromActionOrder}
          onViewContract={openFromActionContract}
          onViewAsset={openFromActionAsset}
          onViewRisk={openFromActionRisk}
          onMarkDone={handleMarkDone}
        />
      </div>

      <MallDetailModal
        open={modalOpen}
        product={modalProduct}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        openIntent={modalIntent}
        onConsumeIntent={() => setModalIntent(null)}
      />

      {toast ? (
        <div className="met-mall-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default MallOperationDashboard;
