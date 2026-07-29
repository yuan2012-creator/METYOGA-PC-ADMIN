import React, { useCallback, useMemo, useState } from 'react';
import {
  AUDIT_WORKBENCH_SEGMENTS,
  buildAuditOperationSnapshot,
  DEFAULT_AUDIT_FILTERS,
  type AuditActionItem,
  type AuditListFilters,
  type AuditSegment,
} from './auditOperationViewModel';
import { auditDemoToast } from './auditDemoToast';
import AuditMetricCard from './AuditMetricCard';
import AuditInsightPanel from './AuditInsightPanel';
import AuditWorkspaceTable from './AuditWorkspaceTable';
import AuditActionPanel from './AuditActionPanel';
import AuditDetailModal from './AuditDetailModal';
import type { AuditDetailTabId } from './AuditDetailTabs';

const AUDIT_SEGMENTS = new Set<AuditSegment>([
  'roles',
  'approvals',
  'logs',
  'exports',
  'changes',
  'risks',
]);

const AuditOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildAuditOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<AuditSegment>('roles');
  const [filters, setFilters] = useState<AuditListFilters>(DEFAULT_AUDIT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<AuditDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openDetail = (id: string, tab?: AuditDetailTabId) => {
    setModalEntityId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalEntityId(null);
    setModalTab(undefined);
  };

  const approvalItems = useMemo(() => queue.filter(i => i.group === 'approvalPending'), [queue]);
  const riskItems = useMemo(() => queue.filter(i => i.group === 'riskReview'), [queue]);
  const exportItems = useMemo(() => queue.filter(i => i.group === 'exportConfirm'), [queue]);
  const logItems = useMemo(() => queue.filter(i => i.group === 'logGap'), [queue]);

  const handleInsight = (key: string) => {
    const seg = key as AuditSegment;
    if (AUDIT_SEGMENTS.has(seg)) {
      setSegment(seg);
      if (seg === 'approvals') setFilters({ ...DEFAULT_AUDIT_FILTERS, status: '待审批' });
      else if (seg === 'exports') setFilters({ ...DEFAULT_AUDIT_FILTERS, query: '会员' });
      else if (seg === 'roles') setFilters({ ...DEFAULT_AUDIT_FILTERS, query: '店长' });
      else if (seg === 'logs') setFilters({ ...DEFAULT_AUDIT_FILTERS, query: '资产' });
      else setFilters({ ...DEFAULT_AUDIT_FILTERS });
      showToast(
        auditDemoToast.insightFilter(
          AUDIT_WORKBENCH_SEGMENTS.find(s => s.id === seg)?.label ?? key,
        ),
      );
      return;
    }
    showToast(auditDemoToast.insightFilter(key));
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(auditDemoToast.markDone);
  };

  const openFromAction = (item: AuditActionItem, chain?: boolean) => {
    const tab: AuditDetailTabId = chain
      ? item.openTab === 'approval'
        ? 'approval'
        : item.openTab === 'export'
          ? 'export'
          : item.openTab === 'logs'
            ? 'logs'
            : item.openTab === 'risk'
              ? 'risk'
              : 'overview'
      : item.openTab ?? 'overview';
    openDetail(item.entityId, tab);
  };

  return (
    <div className="met-today-page met-audit-page">
      <header className="met-audit-header">
        <div className="met-audit-header__left">
          <h1>权限审计</h1>
          <p>角色权限 · 敏感审批 · 操作日志 · 数据导出 · 关键证据链</p>
        </div>
        <div className="met-audit-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(auditDemoToast.exportAudit)}>
            导出审计记录
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(auditDemoToast.newRole)}>
            新建角色
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(auditDemoToast.permCheck)}>
            权限检查
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(auditDemoToast.approvalRules)}>
            审批规则
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(auditDemoToast.sensitiveReview)}>
            敏感操作复核
          </button>
        </div>
      </header>

      <section className="met-audit-metrics">
        {snapshot.metrics.map(item => (
          <AuditMetricCard key={item.id} item={item} />
        ))}
      </section>

      <AuditInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-audit-main-grid">
        <AuditWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalEntityId : null}
          onOpenDetail={id => openDetail(id)}
          onOpenChain={id => openDetail(id, 'approval')}
          onMarkRisk={() => showToast(auditDemoToast.markDone)}
        />
        <AuditActionPanel
          approvalItems={approvalItems}
          riskItems={riskItems}
          exportItems={exportItems}
          logItems={logItems}
          onViewDetail={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <AuditDetailModal
        open={modalOpen}
        entityId={modalEntityId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-audit-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default AuditOperationDashboard;
