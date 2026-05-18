import React, { useCallback, useMemo, useState } from 'react';
import {
  buildStaffOperationSnapshot,
  DEFAULT_STAFF_FILTERS,
  STAFF_WORKBENCH_SEGMENTS,
  type StaffActionItem,
  type StaffListFilters,
  type StaffWorkbenchSegment,
} from './staffOperationViewModel';
import { staffDemoToast } from './staffDemoToast';
import StaffMetricCard from './StaffMetricCard';
import StaffInsightPanel from './StaffInsightPanel';
import StaffWorkspaceTable from './StaffWorkspaceTable';
import StaffActionPanel from './StaffActionPanel';
import StaffDetailModal from './StaffDetailModal';
import type { StaffDetailTabId } from './StaffDetailTabs';

const STAFF_SEGMENTS = new Set<StaffWorkbenchSegment>([
  'profiles',
  'todayCourses',
  'payIncome',
  'growth',
  'leaveSubstitute',
  'permissions',
]);

const StaffOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildStaffOperationSnapshot(), []);
  const [queue, setQueue] = useState(() => [...snapshot.actionQueue]);
  const [segment, setSegment] = useState<StaffWorkbenchSegment>('profiles');
  const [filters, setFilters] = useState<StaffListFilters>(DEFAULT_STAFF_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeacherId, setModalTeacherId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<StaffDetailTabId | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  }, []);

  const openTeacher = (id: string, tab?: StaffDetailTabId) => {
    setModalTeacherId(id);
    setModalTab(tab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTeacherId(null);
    setModalTab(undefined);
  };

  const courseItems = useMemo(() => queue.filter(i => i.group === 'courseExecution'), [queue]);
  const payItems = useMemo(() => queue.filter(i => i.group === 'payPending'), [queue]);
  const growthItems = useMemo(() => queue.filter(i => i.group === 'growthReview'), [queue]);
  const leaveItems = useMemo(() => queue.filter(i => i.group === 'leaveSubstitute'), [queue]);

  const handleInsight = (key: string) => {
    const seg = key as StaffWorkbenchSegment;
    if (!STAFF_SEGMENTS.has(seg)) return;
    setSegment(seg);
    if (key === 'profiles') {
      setFilters({ ...DEFAULT_STAFF_FILTERS, risk: '有风险' });
    } else if (key === 'growth') {
      setFilters({ ...DEFAULT_STAFF_FILTERS, risk: '成长风险' });
    } else {
      setFilters({ ...DEFAULT_STAFF_FILTERS });
    }
    showToast(
      staffDemoToast.insightFilter(STAFF_WORKBENCH_SEGMENTS.find(s => s.id === seg)?.label ?? key),
    );
  };

  const handleMarkDone = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    showToast(staffDemoToast.markDone);
  };

  const openFromAction = (item: StaffActionItem, chain?: boolean) => {
    const tab = chain ? (item.openTab ?? 'courses') : (item.openTab ?? 'overview');
    openTeacher(item.teacherId, tab);
  };

  return (
    <div className="met-today-page met-staff-page">
      <header className="met-staff-header">
        <div className="met-staff-header__left">
          <h1>师资与团队</h1>
          <p>管理老师档案、排课执行、成长等级、课时收入与团队权限</p>
        </div>
        <div className="met-staff-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast(staffDemoToast.exportData)}>
            导出老师数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(staffDemoToast.newTeacher)}>
            新增老师
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(staffDemoToast.payReview)}>
            课时费核对
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast(staffDemoToast.growthReview)}>
            成长等级复核
          </button>
          <button type="button" className="met-ink-button" onClick={() => showToast(staffDemoToast.newTask)}>
            新建团队任务
          </button>
        </div>
      </header>

      <section className="met-staff-metrics">
        {snapshot.metrics.map(item => (
          <StaffMetricCard key={item.id} item={item} />
        ))}
      </section>

      <StaffInsightPanel tips={snapshot.insights} onAction={handleInsight} />

      <div className="met-staff-main-grid">
        <StaffWorkspaceTable
          segment={segment}
          onSegmentChange={setSegment}
          snapshot={snapshot}
          filters={filters}
          onFiltersChange={setFilters}
          highlightId={modalOpen ? modalTeacherId : null}
          onOpenTeacher={id => openTeacher(id)}
          onViewChain={id => openTeacher(id, 'courses')}
        />
        <StaffActionPanel
          courseItems={courseItems}
          payItems={payItems}
          growthItems={growthItems}
          leaveItems={leaveItems}
          onViewDetail={item => openFromAction(item)}
          onViewChain={item => openFromAction(item, true)}
          onMarkDone={handleMarkDone}
        />
      </div>

      <StaffDetailModal
        open={modalOpen}
        teacherId={modalTeacherId}
        snapshot={snapshot}
        onClose={closeModal}
        onToast={showToast}
        initialTab={modalTab}
      />

      {toast ? (
        <div className="met-staff-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default StaffOperationDashboard;
