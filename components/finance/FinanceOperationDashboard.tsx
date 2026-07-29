import React, { useCallback, useMemo, useState } from 'react';
import {
  buildFinanceOperationSnapshot,
  type FinanceActionItem,
  type FinanceEntityType,
  type FinanceWorkbenchSegment,
} from './financeOperationViewModel';
import { financeDemoToast } from './financeDemoToast';
import FinanceMetricCard from './FinanceMetricCard';
import FinanceInsightPanel from './FinanceInsightPanel';
import FinanceWorkspaceTable from './FinanceWorkspaceTable';
import FinanceActionPanel from './FinanceActionPanel';
import FinanceDetailModal from './FinanceDetailModal';
import type { FinanceDetailTabId } from './FinanceDetailTabs';

const FinanceOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildFinanceOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<FinanceWorkbenchSegment>('payments');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityType, setModalEntityType] = useState<FinanceEntityType | null>(null);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<FinanceDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openEntity = (type: FinanceEntityType, id: string, tab?: FinanceDetailTabId) => {
    setModalEntityType(type);
    setModalEntityId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEntityType(null);
    setModalEntityId(null);
    setModalTab(undefined);
  };

  const paymentPendingItems = useMemo(
    () => queue.filter(i => i.group === 'paymentPending'),
    [queue],
  );
  const refundPendingItems = useMemo(() => queue.filter(i => i.group === 'refundPending'), [queue]);
  const consumptionPendingItems = useMemo(
    () => queue.filter(i => i.group === 'consumptionPending'),
    [queue],
  );
  const teacherFeePendingItems = useMemo(
    () => queue.filter(i => i.group === 'teacherFeePending'),
    [queue],
  );
  const settlementPendingItems = useMemo(
    () => queue.filter(i => i.group === 'settlementPending'),
    [queue],
  );
  const expenseVoucherItems = useMemo(
    () => queue.filter(i => i.group === 'expenseVoucherPending'),
    [queue],
  );

  const handleInsight = (key: string) => {
    if (key === 'judgment1' || key === 'judgment2') {
      setSegment('reports');
      showToast(financeDemoToast.insightFilter('财务报表 · 经营判断'));
      return;
    }
    if (key === 'refunds') {
      setSegment('refunds');
      showToast(financeDemoToast.insightFilter('退款核对'));
      return;
    }
    if (key === 'teacherFees') {
      setSegment('teacherFees');
      showToast(financeDemoToast.insightFilter('老师课时费'));
    }
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(financeDemoToast.markDone);
  };

  const openFromAction = (item: FinanceActionItem, chain?: boolean) => {
    const tab: FinanceDetailTabId | undefined = chain
      ? item.entityType === 'consumption'
        ? 'consumption'
        : item.entityType === 'teacherFee' || item.entityType === 'settlement'
          ? 'feeSettlement'
          : 'orderPay'
      : 'overview';
    openEntity(item.entityType, item.entityId, tab);
  };

  return (
    <div className="met-today-page met-finance-page">
      <header className="met-finance-header">
        <div className="met-finance-header__left">
          <h1>财务管理</h1>
          <p>核对收款、预收负债、耗课确认收入、支出与风险</p>
        </div>
        <div className="met-finance-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(financeDemoToast.exportData)}>
            导出财务数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(financeDemoToast.newExpense)}>
            新增费用支出
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(financeDemoToast.reconcileOrder)}>
            核对订单
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(financeDemoToast.monthlyReport)}>
            生成月报
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(financeDemoToast.ruleCheck)}>
            财务规则检查
          </button>
        </div>
      </header>

      <section className="met-finance-metrics">
        {snapshot.metrics.map(item => (
          <FinanceMetricCard key={item.id} item={item} />
        ))}
      </section>

      <FinanceInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-finance-main-grid">
        <FinanceWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenEntity={openEntity}
          onViewChain={(type, id) => openEntity(type, id, 'orderPay')}
        />
        <FinanceActionPanel
          paymentPendingItems={paymentPendingItems}
          refundPendingItems={refundPendingItems}
          consumptionPendingItems={consumptionPendingItems}
          teacherFeePendingItems={teacherFeePendingItems}
          settlementPendingItems={settlementPendingItems}
          expenseVoucherItems={expenseVoucherItems}
          onViewDetail={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <FinanceDetailModal
        open={modalOpen}
        entityType={modalEntityType}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-finance-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default FinanceOperationDashboard;
