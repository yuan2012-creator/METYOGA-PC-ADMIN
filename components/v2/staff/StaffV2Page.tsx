import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  canViewPayableAmount,
  STAFF_PERMISSIONS,
  type StaffApplication,
  type StaffIssueSeverity,
  type StaffTodo,
} from './domain';
import { STAFF_SEED_STORES } from './services/buildInitialStaffSnapshot';
import type {
  AvailableTeacherCandidate,
  ScheduleAssignment,
  StaffMember,
  TeachingCapability,
} from './domain/types';
import { useStaffState } from './useStaffState';
import StaffSecondaryTeacherApplicationsPage, {
  type TeacherApplicationsInitialTab,
} from './StaffSecondaryTeacherApplicationsPage';
import './staffV2.css';
import './staffSecondaryTeacherApplications.css';

type InternalView = 'workbench' | 'schedule' | 'archive' | 'growth' | 'payable';
type PageView = 'home' | 'teacherApplications';
type AssignMode = 'assign' | 'replace';
type ApprovalAction = 'approve' | 'reject' | 'supplement' | null;
type CandidateTier = '系统推荐' | '完全匹配' | '可用但有提醒' | '不建议';

const VIEW_TABS: { id: InternalView; label: string }[] = [
  { id: 'workbench', label: '团队工作台' },
  { id: 'schedule', label: '排班与供给' },
  { id: 'archive', label: '老师档案' },
  { id: 'growth', label: '成长与评价' },
  { id: 'payable', label: '课酬与结算' },
];

const STORE_OPTIONS = [
  { id: 'all', label: '全部门店' },
  { id: STAFF_SEED_STORES.wanxiang.id, label: STAFF_SEED_STORES.wanxiang.name },
  { id: STAFF_SEED_STORES.chengxi.id, label: STAFF_SEED_STORES.chengxi.name },
  { id: STAFF_SEED_STORES.binjiang.id, label: STAFF_SEED_STORES.binjiang.name },
];

const STORE_NAME: Record<string, string> = {
  [STAFF_SEED_STORES.wanxiang.id]: STAFF_SEED_STORES.wanxiang.name,
  [STAFF_SEED_STORES.chengxi.id]: STAFF_SEED_STORES.chengxi.name,
  [STAFF_SEED_STORES.binjiang.id]: STAFF_SEED_STORES.binjiang.name,
};

const PENDING_RISKS = new Set(['缺老师', '老师请假', '时间冲突', '能力不匹配', '负荷过高', '能力不匹配风险']);

const SEVERITY_RANK: Record<StaffIssueSeverity, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  info: 3,
};

function staffName(members: StaffMember[], id: string | null | undefined): string {
  if (!id) return '待指定';
  return members.find(m => m.id === id)?.name ?? '人员关联待确认';
}

function storeLabel(storeId: string | null | undefined): string {
  if (!storeId) return '—';
  return STORE_NAME[storeId] ?? '—';
}

function capabilityLabels(
  ids: string[],
  capabilities: TeachingCapability[],
): string {
  if (!ids.length) return '—';
  return ids
    .map(id => capabilities.find(c => c.capabilityId === id)?.capabilityLabel ?? null)
    .filter(Boolean)
    .join('、') || '—';
}

function formatSessionDate(dateIso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!m) return dateIso;
  return `${Number(m[2])}月${Number(m[3])}日`;
}

function riskTagsForDisplay(assignment: ScheduleAssignment): Array<{ label: string; tone: 'p0' | 'p1' | 'neutral' }> {
  const raw = assignment.riskTags.length
    ? assignment.riskTags
    : assignment.status === '待指定' || !assignment.staffId
      ? ['缺老师']
      : assignment.status === '有冲突'
        ? ['时间冲突']
        : [];
  const mapped = raw.map(tag => {
    if (tag.includes('关联待确认') || tag.includes('课次关联')) return '关联待确认';
    if (tag === '能力不匹配风险') return '能力不匹配';
    if (tag === '老师请假') return '请假影响';
    return tag;
  });
  const unique = Array.from(new Set(mapped)).slice(0, 2);
  return unique.map(label => ({
    label,
    tone:
      label === '缺老师' || label === '时间冲突'
        ? 'p0'
        : label === '请假影响' || label === '能力不匹配' || label === '负荷过高'
          ? 'p1'
          : 'neutral',
  }));
}

function riskLabel(assignment: ScheduleAssignment): string {
  const tags = riskTagsForDisplay(assignment);
  if (tags.length) return tags.map(t => t.label).join(' / ');
  return '正常';
}

function isPendingSession(a: ScheduleAssignment): boolean {
  if (a.status === '已取消') return false;
  if (a.status === '待指定' || !a.staffId) return true;
  if (a.status === '有冲突') return true;
  return a.riskTags.some(t => PENDING_RISKS.has(t));
}

function primaryActionForSession(a: ScheduleAssignment): { label: string; mode: AssignMode } {
  if (a.status === '待指定' || !a.staffId || a.riskTags.includes('缺老师')) {
    return { label: '指定老师', mode: 'assign' };
  }
  return { label: '更换老师', mode: 'replace' };
}

function parseWeekCount(label: string): number {
  const m = label.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function candidateTier(c: AvailableTeacherCandidate): CandidateTier {
  const hasConflict = c.riskNotes.includes('时间冲突');
  const hasCapRisk = c.riskNotes.some(n => n.includes('能力'));
  if (hasConflict || hasCapRisk) return '不建议';
  if (c.riskNotes.length > 0) return '可用但有提醒';
  if (c.score >= 95) return '系统推荐';
  return '完全匹配';
}

function tierRank(tier: CandidateTier): number {
  switch (tier) {
    case '系统推荐':
      return 0;
    case '完全匹配':
      return 1;
    case '可用但有提醒':
      return 2;
    default:
      return 3;
  }
}

function workloadFromCount(weekCount: number, availability: string): string {
  if (availability === '暂不可排' || availability === '请假中') return '暂不可排';
  if (weekCount >= 12) return '超负荷';
  if (weekCount >= 8) return '偏高';
  if (weekCount <= 2) return '空闲';
  return '正常';
}

function formatDue(dueAt?: string): string {
  if (!dueAt) return '—';
  return dueAt.replace('T', ' ').slice(0, 16);
}

function isOpenApplication(status: string): boolean {
  return status === '待审批' || status === '待补充' || status === '草稿' || status === '待提交';
}

export interface StaffV2PageProps {
  initialStoreId?: string;
  focusRisk?: string;
  onNavigateToCourse?: (sessionId: string) => void;
  onNavigateToStaff?: never;
  focusSessionId?: string | null;
  focusAssignMode?: 'assign' | 'replace' | null;
  onFocusConsumed?: () => void;
}

const StaffV2Page: React.FC<StaffV2PageProps> = ({
  initialStoreId,
  focusRisk,
  onNavigateToCourse,
  focusSessionId,
  focusAssignMode,
  onFocusConsumed,
}) => {
  const { service, snapshot, ready } = useStaffState();
  const [pageView, setPageView] = useState<PageView>('home');
  const [internalView, setInternalView] = useState<InternalView>('workbench');
  const [storeFilter, setStoreFilter] = useState<string>(initialStoreId ?? 'all');
  const [applicationsTab, setApplicationsTab] = useState<TeacherApplicationsInitialTab>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [drawerStaffId, setDrawerStaffId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ assignmentId: string; mode: AssignMode } | null>(
    null,
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [forceAssignReason, setForceAssignReason] = useState('');
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showUnresolved, setShowUnresolved] = useState(false);
  const [opsMenuRowId, setOpsMenuRowId] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  useEffect(() => {
    if (initialStoreId) {
      setStoreFilter(initialStoreId);
      service.setStoreFilter(initialStoreId);
    }
  }, [initialStoreId, service]);

  useEffect(() => {
    if (focusRisk && ready) setInternalView('workbench');
  }, [focusRisk, ready]);

  const workbench = useMemo(
    () => service.getStaffWorkbench(storeFilter),
    [service, snapshot, storeFilter],
  );

  const members = snapshot.members;
  const capabilities = snapshot.capabilities;
  const unresolvedCount = snapshot.unresolvedReferences.length;
  const isHqAdmin = service.getActorRole() === 'hq_admin';

  const openTeacherApplications = useCallback((tab: TeacherApplicationsInitialTab = 'all') => {
    setApplicationsTab(tab);
    setPageView('teacherApplications');
  }, []);

  const openAssign = useCallback((assignmentId: string, mode: AssignMode) => {
    setDrawerStaffId(null);
    setApplicationId(null);
    setAssignTarget({ assignmentId, mode });
    setSelectedCandidateId(null);
    setForceAssignReason('');
  }, []);

  useEffect(() => {
    if (!focusSessionId || !ready) return;
    const match = snapshot.scheduleAssignments.find(
      a => a.session.sessionId === focusSessionId,
    );
    if (match) {
      const mode = focusAssignMode ?? primaryActionForSession(match).mode;
      openAssign(match.id, mode);
    }
    onFocusConsumed?.();
  }, [focusSessionId, focusAssignMode, ready, snapshot.scheduleAssignments, openAssign, onFocusConsumed]);

  const pendingSessions = useMemo(() => {
    const list = workbench.scheduleWindow.filter(isPendingSession);
    return [...list].sort((a, b) => {
      const aP0 = a.riskTags.includes('缺老师') || a.status === '待指定' ? 0 : 1;
      const bP0 = b.riskTags.includes('缺老师') || b.status === '待指定' ? 0 : 1;
      if (aP0 !== bP0) return aP0 - bP0;
      return `${a.session.dateIso}${a.session.startTime}`.localeCompare(
        `${b.session.dateIso}${b.session.startTime}`,
      );
    });
  }, [workbench.scheduleWindow]);

  const displayedSessions = showAllSessions
    ? workbench.scheduleWindow
    : pendingSessions.slice(0, 6);
  const hiddenPendingCount = showAllSessions
    ? 0
    : Math.max(0, pendingSessions.length - 6);

  const pendingSessionIds = useMemo(
    () => new Set(pendingSessions.map(s => s.session.sessionId)),
    [pendingSessions],
  );

  const workbenchTodos = useMemo(() => {
    const filtered = workbench.todos.filter(todo => {
      // Session-linked todos already covered by 待处理课次
      if (todo.relatedSessionId && pendingSessionIds.has(todo.relatedSessionId)) return false;
      if (
        todo.type === '缺老师待指定' ||
        todo.type === '排课冲突待处理'
      ) {
        return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  }, [workbench.todos, pendingSessionIds]);

  const displayedTodos = showAllTodos ? workbenchTodos : workbenchTodos.slice(0, 5);
  const hiddenTodoCount = showAllTodos ? 0 : Math.max(0, workbenchTodos.length - 5);

  const candidatesRaw: AvailableTeacherCandidate[] = useMemo(() => {
    if (!assignTarget) return [];
    return service.listAvailableTeachers(assignTarget.assignmentId);
  }, [assignTarget, service, snapshot]);

  const rankedCandidates = useMemo(() => {
    return [...candidatesRaw]
      .map(c => ({ ...c, tier: candidateTier(c) }))
      .sort((a, b) => {
        const tr = tierRank(a.tier) - tierRank(b.tier);
        if (tr !== 0) return tr;
        return b.score - a.score;
      });
  }, [candidatesRaw]);

  const recommendId = rankedCandidates.find(c => c.tier === '系统推荐' || c.tier === '完全匹配')
    ?.staffId;

  const assignAssignment = assignTarget
    ? snapshot.scheduleAssignments.find(a => a.id === assignTarget.assignmentId) ?? null
    : null;

  const selectedCandidate = rankedCandidates.find(c => c.staffId === selectedCandidateId);
  const selectedNeedsForce =
    !!selectedCandidate &&
    (selectedCandidate.tier === '不建议' || selectedCandidate.riskNotes.includes('时间冲突'));

  const drawerMember = drawerStaffId ? service.getStaff(drawerStaffId) : null;
  const drawerLogs = useMemo(
    () =>
      snapshot.operationLogs.filter(
        l => l.targetType === 'staff' && l.targetId === drawerStaffId,
      ),
    [snapshot.operationLogs, drawerStaffId],
  );
  const drawerApps = useMemo(
    () => snapshot.applications.filter(a => a.applicantStaffId === drawerStaffId),
    [snapshot.applications, drawerStaffId],
  );
  const drawerSessions = useMemo(
    () =>
      snapshot.scheduleAssignments.filter(
        a => a.staffId === drawerStaffId && a.status !== '已取消',
      ),
    [snapshot.scheduleAssignments, drawerStaffId],
  );

  const application = applicationId ? service.getApplication(applicationId) : null;

  const handleSaveAssign = () => {
    if (!assignTarget || !selectedCandidateId) {
      showToast('请选择老师');
      return;
    }
    if (selectedNeedsForce) {
      if (!isHqAdmin) {
        showToast('该老师存在冲突或风险，不可选择');
        return;
      }
      if (!forceAssignReason.trim()) {
        showToast('强制选择须填写原因');
        return;
      }
    }
    const assignOptions =
      selectedNeedsForce && forceAssignReason.trim()
        ? { forced: true, forcedReason: forceAssignReason.trim() }
        : undefined;
    const result =
      assignTarget.mode === 'assign'
        ? service.assignTeacherToSession(
            assignTarget.assignmentId,
            selectedCandidateId,
            assignOptions,
          )
        : service.replaceTeacherForSession(
            assignTarget.assignmentId,
            selectedCandidateId,
            assignOptions,
          );
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast(assignTarget.mode === 'assign' ? '已指定老师' : '已更换老师');
    setAssignTarget(null);
    setSelectedCandidateId(null);
    setForceAssignReason('');
  };

  const handleReset = () => {
    if (!service.can(STAFF_PERMISSIONS.TEST_DATA_RESET)) return;
    if (!window.confirm('确认重置师资测试数据？将恢复初始示例数据。')) return;
    const result = service.resetTestData();
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast('已重置师资测试数据');
    setShowAllSessions(false);
    setShowAllTodos(false);
  };

  const handleApprove = (
    app: StaffApplication,
    form: {
      comment: string;
      substituteStaffId: string;
      confirmSessions: boolean;
      rescheduleDate: string;
      rescheduleStart: string;
      rescheduleEnd: string;
    },
  ) => {
    if (!form.comment.trim()) {
      showToast('请填写审批意见');
      return;
    }
    let substituteStaffId: string | undefined;
    let rescheduleTo: { dateIso: string; startTime: string; endTime: string } | undefined;
    if (app.type === '代课') {
      if (!form.substituteStaffId.trim()) {
        showToast('代课必须选择替代老师');
        return;
      }
      substituteStaffId = form.substituteStaffId.trim();
    }
    if (app.type === '请假') {
      if (!form.confirmSessions) {
        showToast('请假审批必须确认影响课次');
        return;
      }
      if (form.substituteStaffId.trim()) substituteStaffId = form.substituteStaffId.trim();
    }
    if (app.type === '改期') {
      if (!form.rescheduleDate || !form.rescheduleStart || !form.rescheduleEnd) {
        showToast('改期必须选择新日期时间');
        return;
      }
      rescheduleTo = {
        dateIso: form.rescheduleDate,
        startTime: form.rescheduleStart,
        endTime: form.rescheduleEnd,
      };
    }
    const result = service.approveApplication(app.id, {
      comment: form.comment.trim(),
      substituteStaffId,
      rescheduleTo,
    });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast('申请已通过');
    setApplicationId(null);
  };

  const handleReject = (app: StaffApplication, reason: string) => {
    if (!reason.trim()) {
      showToast('驳回必须填写原因');
      return;
    }
    const result = service.rejectApplication(app.id, reason.trim());
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast('申请已驳回');
    setApplicationId(null);
  };

  const handleSupplement = (app: StaffApplication, message: string) => {
    if (!message.trim()) {
      showToast('请填写补充要求');
      return;
    }
    const result = service.requestApplicationSupplement(app.id, message.trim());
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast('已发送补充要求');
  };

  const handleAssignOwner = (app: StaffApplication, ownerStaffId: string) => {
    if (!ownerStaffId.trim()) return;
    const result = service.assignApplicationOwner(app.id, ownerStaffId.trim());
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast('已指定负责人');
  };

  const saveTeacherEdits = (
    staffId: string,
    supportStoreIds: string[],
    capabilityIds: string[],
  ) => {
    const member = service.getStaff(staffId);
    if (!member) return;
    const storeResult = service.updateStoreAssignments(
      staffId,
      member.primaryStoreId,
      supportStoreIds,
    );
    if (!storeResult.ok) {
      showToast(storeResult.error);
      return;
    }
    const capResult = service.updateTeachingCapabilities(staffId, capabilityIds);
    if (!capResult.ok) {
      showToast(capResult.error);
      return;
    }
    showToast('已保存门店与教学能力');
  };

  const todoPrimaryAction = (todo: StaffTodo): string => {
    if (todo.relatedApplicationId) return '去审批';
    if (todo.relatedStaffId) return '查看老师';
    return '处理';
  };

  const todoTitleForDisplay = (todo: StaffTodo): string => {
    const id = todo.relatedApplicationId;
    if (id && todo.title.startsWith(id)) {
      return todo.title.slice(id.length).replace(/^[·\s]+/, '') || todo.title;
    }
    return todo.title;
  };

  const todoMetaForDisplay = (todo: StaffTodo): string => {
    const parts = [`负责人 ${staffName(members, todo.ownerStaffId)}`, `截止 ${formatDue(todo.dueAt)}`];
    if (todo.relatedApplicationId) parts.unshift(todo.relatedApplicationId);
    else parts.unshift(todo.type);
    return parts.join(' · ');
  };

  if (!ready) {
    return (
      <div className="met-staff-v2 met-v2-density-workbench">
        <div className="met-staff-v2__inner">加载中…</div>
      </div>
    );
  }

  if (pageView === 'teacherApplications') {
    return (
      <div className="met-staff-v2 met-v2-density-compact">
        <StaffSecondaryTeacherApplicationsPage
          initialTab={applicationsTab}
          onBack={() => {
            setPageView('home');
            setApplicationId(null);
          }}
          onOpenDetail={id => setApplicationId(id)}
          onToast={showToast}
          applications={snapshot.applications}
          members={members}
        />
        {application ? (
          <ApplicationActionDrawer
            app={application}
            members={members}
            assignments={snapshot.scheduleAssignments}
            canApprove={service.can(STAFF_PERMISSIONS.APPLICATION_APPROVE)}
            canReject={service.can(STAFF_PERMISSIONS.APPLICATION_REJECT)}
            canAssignOwner={service.can(STAFF_PERMISSIONS.APPLICATION_ASSIGN_OWNER)}
            isHqAdmin={isHqAdmin}
            defaultOwnerId={snapshot.actorStaffId}
            onClose={() => setApplicationId(null)}
            onApprove={form => handleApprove(application, form)}
            onReject={reason => handleReject(application, reason)}
            onSupplement={message => handleSupplement(application, message)}
            onAssignOwner={ownerId => handleAssignOwner(application, ownerId)}
          />
        ) : null}
        {toast ? <div className="met-staff-v2-toast">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="met-staff-v2 met-v2-density-workbench" data-testid="staff-v2-root">
      <div className="met-staff-v2__inner">
        <header className="met-staff-v2__header">
          <div className="met-staff-v2__header-copy">
            <h1>团队工作台</h1>
            <p>处理缺老师、请假代课与排课风险，保障今日与未来 7 天供给</p>
          </div>
          <div className="met-staff-v2__header-actions">
            <div className="met-staff-v2__filters">
              {STORE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`met-staff-v2__filter-btn${storeFilter === opt.id ? ' is-active' : ''}`}
                  data-testid={`staff-store-filter-${opt.id}`}
                  onClick={() => {
                    setStoreFilter(opt.id);
                    service.setStoreFilter(opt.id);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="met-staff-v2__filters">
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                data-testid="staff-open-applications"
                onClick={() => openTeacherApplications('all')}
              >
                老师端申请审批
              </button>
              {service.can(STAFF_PERMISSIONS.TEST_DATA_RESET) ? (
                <button
                  type="button"
                  className="met-staff-v2__filter-btn"
                  data-testid="staff-reset-test-data"
                  onClick={handleReset}
                >
                  重置测试数据
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <nav className="met-staff-v2__filters" aria-label="师资视图">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`met-staff-v2__filter-btn${internalView === tab.id ? ' is-active' : ''}`}
              data-testid={`staff-view-${tab.id}`}
              onClick={() => setInternalView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {isHqAdmin && unresolvedCount > 0 ? (
          <div className="met-staff-v2-unresolved-hint" data-testid="staff-unresolved-banner">
            <span>{unresolvedCount}条历史人员数据待确认</span>
            <button
              type="button"
              className="met-staff-v2__filter-btn"
              data-testid="staff-unresolved-open"
              onClick={() => setShowUnresolved(v => !v)}
            >
              查看待确认人员
            </button>
          </div>
        ) : null}
        {isHqAdmin && showUnresolved ? (
          <ul className="met-staff-v2-list met-staff-v2-unresolved-list" data-testid="staff-unresolved-list">
            {snapshot.unresolvedReferences.slice(0, 12).map(ref => (
              <li key={ref.id} className="met-staff-v2-list__item">
                <div>
                  <strong>{ref.rawValue}</strong>
                  <div className="met-staff-v2-muted">{ref.context}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {internalView === 'workbench' ? (
          <>
            <section className="met-staff-v2-zone" data-testid="staff-workbench-metrics">
              <div className="met-staff-v2-summary-grid">
                {[
                  { id: 'm1', label: '今日授课老师', value: String(workbench.metrics.todayTeachingStaffCount) },
                  { id: 'm2', label: '待处理师资缺口', value: String(workbench.metrics.pendingGapCount) },
                  { id: 'm3', label: '请假代课待办', value: String(workbench.metrics.leaveSubstituteTodoCount) },
                  { id: 'm4', label: '未来7天供给风险', value: String(workbench.metrics.supplyRiskNext7Days) },
                ].map(m => (
                  <div key={m.id} className="met-staff-v2-summary-card" data-testid={`staff-metric-${m.id}`}>
                    <div className="met-staff-v2-summary-card__label">{m.label}</div>
                    <div className="met-staff-v2-summary-card__value">{m.value}</div>
                  </div>
                ))}
              </div>
              <p className="met-staff-v2-muted" style={{ marginTop: 8 }}>
                课酬待确认 {workbench.metrics.payablePendingCount} · 异常{' '}
                {workbench.metrics.payableAbnormalCount}
              </p>
            </section>

            <div className="met-staff-v2-workbench-layout">
              <section className="met-staff-v2-zone" data-testid="staff-schedule-window">
                <div className="met-staff-v2-zone__head met-staff-v2-zone__head--row">
                  <div>
                    <h2>{showAllSessions ? '全部师资安排' : '待处理课次'}</h2>
                    <p>{showAllSessions ? '含正常课次' : '缺老师 / 请假 / 冲突 / 能力 / 负荷'}</p>
                  </div>
                  <button
                    type="button"
                    className="met-staff-v2__filter-btn"
                    data-testid="staff-toggle-all-sessions"
                    onClick={() => setShowAllSessions(v => !v)}
                  >
                    {showAllSessions ? '只看待处理' : '查看全部安排'}
                  </button>
                </div>
                <div className="met-staff-v2-table-wrap">
                  <table className="met-staff-v2-compact-table met-v2-table--compact">
                    <thead>
                      <tr>
                        <th className="is-col-date">日期</th>
                        <th className="is-col-time">时间</th>
                        <th className="is-col-course">课程</th>
                        <th className="is-col-store">门店</th>
                        <th className="is-col-teacher">当前老师</th>
                        <th className="is-col-risk">风险</th>
                        <th className="is-col-ops">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSessions.length === 0 ? (
                        <tr>
                          <td colSpan={7}>暂无待处理课次</td>
                        </tr>
                      ) : (
                        displayedSessions.map(row => {
                          const action = primaryActionForSession(row);
                          const canAct =
                            (action.mode === 'assign' &&
                              service.can(STAFF_PERMISSIONS.SCHEDULE_ASSIGN)) ||
                            (action.mode === 'replace' &&
                              service.can(STAFF_PERMISSIONS.SCHEDULE_REPLACE));
                          const tags = riskTagsForDisplay(row);
                          const primaryLabel =
                            canAct && isPendingSession(row) ? action.label : '查看可用老师';
                          const primaryTestId =
                            canAct && isPendingSession(row)
                              ? action.mode === 'assign'
                                ? `staff-assign-${row.id}`
                                : `staff-replace-${row.id}`
                              : `staff-view-teachers-${row.id}`;
                          return (
                            <tr key={row.id} data-testid={`staff-session-row-${row.id}`}>
                              <td className="is-nowrap is-col-date">
                                {formatSessionDate(row.session.dateIso)}
                              </td>
                              <td className="is-nowrap is-col-time">
                                {row.session.startTime}–{row.session.endTime}
                              </td>
                              <td className="is-course">
                                <span className="met-v2-text-clamp-2">{row.session.courseName}</span>
                              </td>
                              <td className="is-nowrap is-col-store">{row.session.storeName}</td>
                              <td className="is-nowrap is-col-teacher">
                                {row.staffId ? (
                                  <button
                                    type="button"
                                    className="met-staff-v2-link"
                                    onClick={() => setDrawerStaffId(row.staffId)}
                                  >
                                    {staffName(members, row.staffId)}
                                  </button>
                                ) : (
                                  '待指定'
                                )}
                              </td>
                              <td className="is-col-risk">
                                {tags.length === 0 ? (
                                  <span className="met-v2-risk-tag">正常</span>
                                ) : (
                                  <span className="met-v2-risk-tags">
                                    {tags.map(tag => (
                                      <span
                                        key={tag.label}
                                        className={`met-v2-risk-tag is-${tag.tone}`}
                                      >
                                        {tag.label}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </td>
                              <td className="is-ops">
                                <div className="met-v2-btn-row">
                                  <button
                                    type="button"
                                    className="met-staff-v2__filter-btn met-v2-btn-nowrap"
                                    data-testid={primaryTestId}
                                    onClick={() =>
                                      openAssign(
                                        row.id,
                                        canAct && isPendingSession(row)
                                          ? action.mode
                                          : row.staffId
                                            ? 'replace'
                                            : 'assign',
                                      )
                                    }
                                  >
                                    {primaryLabel}
                                  </button>
                                  {onNavigateToCourse ? (
                                    <div className="met-v2-more">
                                      <button
                                        type="button"
                                        className="met-v2-more__trigger"
                                        aria-expanded={opsMenuRowId === row.id}
                                        onClick={() =>
                                          setOpsMenuRowId(cur => (cur === row.id ? null : row.id))
                                        }
                                      >
                                        更多
                                      </button>
                                      {opsMenuRowId === row.id ? (
                                        <div className="met-v2-more__menu" role="menu">
                                          <button
                                            type="button"
                                            className="met-v2-more__item"
                                            data-testid={`staff-view-course-${row.id}`}
                                            role="menuitem"
                                            onClick={() => {
                                              setOpsMenuRowId(null);
                                              onNavigateToCourse(row.session.sessionId);
                                            }}
                                          >
                                            查看课程
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {hiddenPendingCount > 0 ? (
                  <p className="met-staff-v2-muted">还有 {hiddenPendingCount} 条待处理课次未展示</p>
                ) : null}
              </section>

              <aside className="met-staff-v2-zone met-staff-v2-zone--side" data-testid="staff-todos">
                <div className="met-staff-v2-zone__head met-staff-v2-zone__head--row">
                  <div>
                    <h2>今日待办</h2>
                    <p>申请与非课次风险</p>
                  </div>
                  {workbenchTodos.length > 5 ? (
                    <button
                      type="button"
                      className="met-staff-v2__filter-btn"
                      data-testid="staff-toggle-all-todos"
                      onClick={() => setShowAllTodos(v => !v)}
                    >
                      {showAllTodos ? '收起' : '查看全部待办'}
                    </button>
                  ) : null}
                </div>
                <ul className="met-v2-side-task-list">
                  {displayedTodos.map(todo => (
                    <li
                      key={todo.id}
                      className="met-v2-side-task-card"
                      data-testid={`staff-todo-${todo.id}`}
                    >
                      <div>
                        <div className="met-v2-side-task-card__head">
                          <span className={`met-staff-v2-sev is-${todo.severity}`}>{todo.severity}</span>
                          <h3 className="met-v2-side-task-card__title">{todoTitleForDisplay(todo)}</h3>
                        </div>
                        <div className="met-v2-side-task-card__meta">
                          {todoMetaForDisplay(todo)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="met-v2-side-task-card__action"
                        onClick={() => {
                          if (todo.relatedApplicationId) {
                            openTeacherApplications('all');
                            setApplicationId(todo.relatedApplicationId);
                          } else if (todo.relatedStaffId) {
                            setDrawerStaffId(todo.relatedStaffId);
                          }
                        }}
                      >
                        {todoPrimaryAction(todo)}
                      </button>
                    </li>
                  ))}
                  {displayedTodos.length === 0 ? (
                    <li className="met-v2-side-task-card">
                      <div className="met-v2-side-task-card__meta">暂无待办</div>
                    </li>
                  ) : null}
                </ul>
                {hiddenTodoCount > 0 ? (
                  <p className="met-staff-v2-muted">还有 {hiddenTodoCount} 条待办未展示</p>
                ) : null}
              </aside>
            </div>

            <section className="met-staff-v2-zone" data-testid="staff-load-rows">
              <div className="met-staff-v2-zone__head">
                <h2>老师状态与负荷</h2>
                <p>紧凑名单</p>
              </div>
              <div className="met-staff-v2-table-wrap">
                <table className="met-staff-v2-compact-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>主门店</th>
                      <th>今日课次</th>
                      <th>未来7天</th>
                      <th>负荷</th>
                      <th>可排</th>
                      <th>异常</th>
                      <th>下一步</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workbench.loadRows.map(row => (
                      <tr key={row.staffId} data-testid={`staff-load-${row.staffId}`}>
                        <td>
                          <button
                            type="button"
                            className="met-staff-v2-link"
                            onClick={() => setDrawerStaffId(row.staffId)}
                          >
                            {row.name}
                          </button>
                        </td>
                        <td>{row.primaryStoreName}</td>
                        <td>{row.todaySessionCount}</td>
                        <td>{row.next7DaySessionCount}</td>
                        <td>{row.workloadStatus}</td>
                        <td>{row.availabilityStatus}</td>
                        <td>{row.currentIssues.join('、') || '—'}</td>
                        <td>{row.nextAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {internalView === 'schedule' ? (
          <section className="met-staff-v2-zone">
            <div className="met-staff-v2-zone__head">
              <h2>排班与供给</h2>
              <p>承接工作台排课窗口；完整课程同步后续接入。</p>
            </div>
            <p>
              缺口 {service.listScheduleGaps().length} · 冲突{' '}
              {service.listScheduleConflicts().length}
            </p>
          </section>
        ) : null}

        {internalView === 'archive' ? (
          <section className="met-staff-v2-zone" data-testid="staff-archive-list">
            <div className="met-staff-v2-zone__head">
              <h2>老师档案</h2>
              <p>点击姓名打开详情</p>
            </div>
            <ul className="met-staff-v2-list">
              {service.listStaff(storeFilter).map(m => (
                <li key={m.id} className="met-staff-v2-list__item">
                  <div>
                    <strong>{m.name}</strong>
                    {m.teachingLevel ? ` · ${m.teachingLevel}` : ''}
                    {` · ${storeLabel(m.primaryStoreId)}`}
                  </div>
                  <button
                    type="button"
                    className="met-staff-v2__filter-btn"
                    data-testid={`staff-open-detail-${m.id}`}
                    onClick={() => setDrawerStaffId(m.id)}
                  >
                    打开详情
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {internalView === 'growth' ? (
          <section className="met-staff-v2-zone">
            <div className="met-staff-v2-zone__head">
              <h2>成长与评价</h2>
              <p>本轮不建设完整成长考核。</p>
            </div>
          </section>
        ) : null}

        {internalView === 'payable' ? (
          <section className="met-staff-v2-zone">
            <div className="met-staff-v2-zone__head">
              <h2>课酬与结算</h2>
              <p>仅显示待确认数量与异常状态。</p>
            </div>
            <p>
              待确认课酬 {workbench.metrics.payablePendingCount} · 异常{' '}
              {workbench.metrics.payableAbnormalCount}
            </p>
          </section>
        ) : null}
      </div>

      {assignTarget && assignAssignment ? (
        <AssignTeacherDrawer
          mode={assignTarget.mode}
          assignment={assignAssignment}
          members={members}
          capabilities={capabilities}
          rankedCandidates={rankedCandidates}
          recommendId={recommendId}
          selectedCandidateId={selectedCandidateId}
          forceReason={forceAssignReason}
          isHqAdmin={isHqAdmin}
          selectedNeedsForce={selectedNeedsForce}
          onSelect={setSelectedCandidateId}
          onForceReason={setForceAssignReason}
          onClose={() => setAssignTarget(null)}
          onSave={handleSaveAssign}
        />
      ) : null}

      {drawerMember ? (
        <TeacherDetailDrawer
          member={drawerMember}
          capabilities={capabilities}
          sessions={drawerSessions}
          apps={drawerApps}
          logs={drawerLogs}
          issues={
            workbench.loadRows.find(r => r.staffId === drawerMember.id)?.currentIssues ?? []
          }
          canEdit={service.can(STAFF_PERMISSIONS.PROFILE_EDIT)}
          canViewPayable={canViewPayableAmount(
            service.getActorRole(),
            snapshot.actorStaffId,
            drawerMember.id,
          )}
          onClose={() => setDrawerStaffId(null)}
          onSave={(support, caps) => saveTeacherEdits(drawerMember.id, support, caps)}
        />
      ) : null}

      {toast ? (
        <div className="met-staff-v2-toast" data-testid="staff-toast">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

function AssignTeacherDrawer({
  mode,
  assignment,
  members,
  capabilities,
  rankedCandidates,
  recommendId,
  selectedCandidateId,
  forceReason,
  isHqAdmin,
  selectedNeedsForce,
  onSelect,
  onForceReason,
  onClose,
  onSave,
}: {
  mode: AssignMode;
  assignment: ScheduleAssignment;
  members: StaffMember[];
  capabilities: TeachingCapability[];
  rankedCandidates: Array<AvailableTeacherCandidate & { tier: CandidateTier }>;
  recommendId?: string;
  selectedCandidateId: string | null;
  forceReason: string;
  isHqAdmin: boolean;
  selectedNeedsForce: boolean;
  onSelect: (id: string) => void;
  onForceReason: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="met-staff-v2-drawer-overlay met-v2-drawer-overlay"
        aria-label="关闭"
        onClick={onClose}
      />
      <aside
        className="met-staff-v2-drawer met-staff-v2-drawer--sticky-footer met-v2-drawer-panel met-v2-drawer-panel--md"
        role="dialog"
        data-testid="staff-assign-drawer"
      >
        <div className="met-staff-v2-drawer__head met-v2-drawer-header">
          <div>
            <h2 className="met-staff-v2-drawer__title">
              {mode === 'assign' ? '指定老师' : '更换老师'}
            </h2>
            <p className="met-staff-v2-drawer__subtitle">按能力、门店授权与负荷筛选候选</p>
          </div>
          <button type="button" className="met-staff-v2-drawer__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="met-staff-v2-drawer__body met-v2-drawer-body">
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">当前课次</h3>
            <div className="met-staff-v2-drawer__row">
              <span>课程名称</span>
              <span>{assignment.session.courseName}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>日期时间</span>
              <span>
                {assignment.session.dateIso} {assignment.session.startTime}–
                {assignment.session.endTime}
              </span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>门店</span>
              <span>{assignment.session.storeName}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>教室</span>
              <span>{assignment.session.room}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>当前老师</span>
              <span>{staffName(members, assignment.staffId)}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>所需能力</span>
              <span>
                {capabilityLabels(assignment.session.requiredCapabilityIds, capabilities)}
              </span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>当前风险</span>
              <span>
                <strong>{riskLabel(assignment)}</strong>
              </span>
            </div>
          </section>

          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">候选老师</h3>
            <ul className="met-staff-v2-candidate-list">
              {rankedCandidates.map(c => {
                const weekCount = parseWeekCount(c.weekLoadLabel);
                const blocked = c.tier === '不建议' && !isHqAdmin;
                const load = workloadFromCount(weekCount, '可排');
                return (
                  <li
                    key={c.staffId}
                    className={[
                      'met-staff-v2-candidate',
                      selectedCandidateId === c.staffId ? 'is-selected' : '',
                      blocked ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <label className="met-staff-v2-candidate__label">
                      <input
                        type="radio"
                        name="candidate"
                        data-testid={`staff-candidate-${c.staffId}`}
                        data-disabled={blocked ? 'true' : 'false'}
                        disabled={blocked}
                        checked={selectedCandidateId === c.staffId}
                        onChange={() => onSelect(c.staffId)}
                      />
                      <div className="met-staff-v2-candidate__body">
                        <div className="met-staff-v2-candidate__head">
                          <strong>{c.name}</strong>
                          <span>{c.teachingLevel ?? '—'}</span>
                          {c.staffId === recommendId ? (
                            <span className="met-staff-v2-badge">推荐</span>
                          ) : null}
                          <span className="met-staff-v2-muted">{c.tier}</span>
                        </div>
                        <div className="met-staff-v2-candidate__meta">
                          {c.primaryStoreName}
                          {c.isSupport ? ' · 支援' : ' · 主店'} · 今日 {c.todaySessionCount} 节 ·
                          未来7天 {weekCount} 节 · 负荷{load}
                        </div>
                        <div className="met-staff-v2-candidate__flags">
                          <span>课程能力：匹配</span>
                          <span>
                            时间冲突：{c.riskNotes.includes('时间冲突') ? '有冲突' : '无'}
                          </span>
                          <span>门店授权：{c.isSupport ? '支援授权' : '主店授权'}</span>
                        </div>
                        <div className="met-staff-v2-muted">
                          {c.riskNotes.length
                            ? `风险：${c.riskNotes.join('；')}`
                            : `推荐：${c.matchNotes.join('；')}`}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
            {selectedNeedsForce && isHqAdmin ? (
              <label className="met-staff-v2-drawer__row">
                <span>强制选择原因</span>
                <input
                  data-testid="staff-assign-force-reason"
                  value={forceReason}
                  onChange={e => onForceReason(e.target.value)}
                  placeholder="说明为何强制选择该老师"
                />
              </label>
            ) : null}
          </section>
        </div>
        <div className="met-staff-v2-drawer__footer-fixed">
          <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="met-v2-drawer-footer-btn met-v2-drawer-footer-btn--primary"
            data-testid="staff-assign-save"
            disabled={
              !selectedCandidateId || (selectedNeedsForce && (!isHqAdmin || !forceReason.trim()))
            }
            onClick={onSave}
          >
            {mode === 'assign' ? '确认指定老师' : '确认更换老师'}
          </button>
        </div>
      </aside>
    </>
  );
}

function ApplicationActionDrawer({
  app,
  members,
  assignments,
  canApprove,
  canReject,
  canAssignOwner,
  isHqAdmin,
  defaultOwnerId,
  onClose,
  onApprove,
  onReject,
  onSupplement,
  onAssignOwner,
}: {
  app: StaffApplication;
  members: StaffMember[];
  assignments: ScheduleAssignment[];
  canApprove: boolean;
  canReject: boolean;
  canAssignOwner: boolean;
  isHqAdmin: boolean;
  defaultOwnerId: string;
  onClose: () => void;
  onApprove: (form: {
    comment: string;
    substituteStaffId: string;
    confirmSessions: boolean;
    rescheduleDate: string;
    rescheduleStart: string;
    rescheduleEnd: string;
  }) => void;
  onReject: (reason: string) => void;
  onSupplement: (message: string) => void;
  onAssignOwner: (ownerStaffId: string) => void;
}) {
  const open = isOpenApplication(app.status);
  const [action, setAction] = useState<ApprovalAction>(null);
  const [comment, setComment] = useState('同意');
  const [rejectReason, setRejectReason] = useState('');
  const [supplementMsg, setSupplementMsg] = useState('请补充证明材料');
  const [ownerId, setOwnerId] = useState(app.ownerStaffId ?? defaultOwnerId);
  const [showMore, setShowMore] = useState(false);
  const [substituteStaffId, setSubstituteStaffId] = useState(
    app.substituteStaffId ??
      members.find(m => m.name === '菜菜' || m.name === '一丹')?.id ??
      members[0]?.id ??
      '',
  );
  const [confirmSessions, setConfirmSessions] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(app.rescheduleTo?.dateIso ?? '2026-07-28');
  const [rescheduleStart, setRescheduleStart] = useState(app.rescheduleTo?.startTime ?? '11:00');
  const [rescheduleEnd, setRescheduleEnd] = useState(app.rescheduleTo?.endTime ?? '12:00');
  const [forceReason, setForceReason] = useState('');

  const relatedSessions = assignments.filter(a =>
    app.relatedSessionIds.includes(a.session.sessionId),
  );
  const needsSubstitute = app.type === '代课' || app.type === '请假';
  const applicant = staffName(members, app.applicantStaffId);
  const owner = staffName(members, app.ownerStaffId);
  const evidence = (app.evidence ?? []).map(e => e.label).join('、') || '暂无';

  const submitLabel =
    action === 'approve'
      ? '确认通过'
      : action === 'reject'
        ? '确认驳回'
        : action === 'supplement'
          ? '发送补充要求'
          : '请先选择动作';

  const canSubmit =
    action === 'approve'
      ? canApprove && open && !!comment.trim() && (app.type !== '请假' || confirmSessions)
      : action === 'reject'
        ? canReject && open && !!rejectReason.trim()
        : action === 'supplement'
          ? canApprove && open && !!supplementMsg.trim()
          : false;

  const onSubmit = () => {
    if (action === 'approve') {
      onApprove({
        comment,
        substituteStaffId,
        confirmSessions,
        rescheduleDate,
        rescheduleStart,
        rescheduleEnd,
      });
    } else if (action === 'reject') {
      onReject(rejectReason);
    } else if (action === 'supplement') {
      onSupplement(supplementMsg);
    }
  };

  return (
    <>
      <button
        type="button"
        className="met-staff-v2-drawer-overlay met-v2-drawer-overlay"
        onClick={onClose}
        aria-label="关闭申请"
      />
      <aside
        className="met-staff-v2-drawer met-staff-v2-drawer--sticky-footer met-v2-drawer-panel met-v2-drawer-panel--md"
        role="dialog"
        data-testid="staff-application-drawer"
      >
        <div className="met-staff-v2-drawer__head met-v2-drawer-header">
          <div>
            <h2 className="met-staff-v2-drawer__title">{app.type}申请</h2>
            <p className="met-staff-v2-drawer__subtitle">
              {applicant} · {app.status}
            </p>
          </div>
          <button type="button" className="met-staff-v2-drawer__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="met-staff-v2-drawer__body met-v2-drawer-body">
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">申请信息</h3>
            <div className="met-staff-v2-drawer__row">
              <span>申请类型</span>
              <span>{app.type}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>申请人</span>
              <span>{applicant}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>当前状态</span>
              <span>{app.status}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>所属门店</span>
              <span>{storeLabel(app.storeId)}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>申请时间</span>
              <span>{formatDue(app.submittedAt)}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>申请原因</span>
              <span>{app.reason || '—'}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>当前负责人</span>
              <span>{owner}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>已提交材料</span>
              <span>{evidence}</span>
            </div>
            {canAssignOwner ? (
              <div className="met-staff-v2-more-ops">
                <button
                  type="button"
                  className="met-staff-v2-link"
                  data-testid="staff-app-more-toggle"
                  onClick={() => setShowMore(v => !v)}
                >
                  {showMore ? '收起更多操作' : '更多操作 · 指定负责人'}
                </button>
                {showMore ? (
                  <div className="met-staff-v2-more-ops__body">
                    <label className="met-staff-v2-drawer__row">
                      <span>负责人</span>
                      <select
                        data-testid="staff-app-owner-id"
                        value={ownerId}
                        onChange={e => setOwnerId(e.target.value)}
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="met-staff-v2__filter-btn"
                      data-testid="staff-app-assign-owner"
                      onClick={() => onAssignOwner(ownerId)}
                    >
                      保存负责人
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">影响课次</h3>
            {relatedSessions.length === 0 ? (
              <p className="met-staff-v2-muted">无关联课次</p>
            ) : (
              relatedSessions.map(s => (
                <div key={s.id} className="met-staff-v2-impact-card">
                  <div>
                    <strong>{s.session.courseName}</strong>
                  </div>
                  <div className="met-staff-v2-muted">
                    {s.session.dateIso} {s.session.startTime}–{s.session.endTime} ·{' '}
                    {s.session.storeName}
                  </div>
                  <div>当前老师：{staffName(members, s.staffId)}</div>
                  <div>是否需要替代老师：{needsSubstitute ? '是' : '否'}</div>
                </div>
              ))
            )}
          </section>

          {!open ? (
            <section className="met-staff-v2-drawer__section">
              <h3 className="met-staff-v2-drawer__section-title">审批结果</h3>
              <div className="met-staff-v2-drawer__row">
                <span>状态</span>
                <span>{app.status}</span>
              </div>
              {app.approvalComment ? (
                <div className="met-staff-v2-drawer__row">
                  <span>审批意见</span>
                  <span>{app.approvalComment}</span>
                </div>
              ) : null}
              {app.rejectReason ? (
                <div className="met-staff-v2-drawer__row">
                  <span>驳回原因</span>
                  <span>{app.rejectReason}</span>
                </div>
              ) : null}
              {app.supplementRequest ? (
                <div className="met-staff-v2-drawer__row">
                  <span>补充要求</span>
                  <span>{app.supplementRequest}</span>
                </div>
              ) : null}
              <div className="met-staff-v2-drawer__row">
                <span>更新时间</span>
                <span>{formatDue(app.updatedAt)}</span>
              </div>
              {isHqAdmin ? (
                <label className="met-staff-v2-drawer__row">
                  <span>总部强制修改原因</span>
                  <input
                    data-testid="staff-app-force-reason"
                    value={forceReason}
                    onChange={e => setForceReason(e.target.value)}
                    placeholder="仅总部强制改状态时填写"
                  />
                </label>
              ) : null}
            </section>
          ) : (
            <section className="met-staff-v2-drawer__section">
              <h3 className="met-staff-v2-drawer__section-title">审批动作</h3>
              <div className="met-staff-v2-action-pills">
                {canApprove ? (
                  <button
                    type="button"
                    className={`met-staff-v2__filter-btn${action === 'approve' ? ' is-active' : ''}`}
                    data-testid="staff-app-action-approve"
                    onClick={() => setAction('approve')}
                  >
                    通过
                  </button>
                ) : null}
                {canReject ? (
                  <button
                    type="button"
                    className={`met-staff-v2__filter-btn${action === 'reject' ? ' is-active' : ''}`}
                    data-testid="staff-app-action-reject"
                    onClick={() => setAction('reject')}
                  >
                    驳回
                  </button>
                ) : null}
                {canApprove ? (
                  <button
                    type="button"
                    className={`met-staff-v2__filter-btn${action === 'supplement' ? ' is-active' : ''}`}
                    data-testid="staff-app-action-supplement"
                    onClick={() => setAction('supplement')}
                  >
                    要求补充材料
                  </button>
                ) : null}
              </div>

              {action === 'approve' ? (
                <div className="met-staff-v2-action-fields">
                  <label className="met-staff-v2-drawer__row">
                    <span>审批意见</span>
                    <input
                      data-testid="staff-app-comment"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </label>
                  {app.type === '请假' ? (
                    <label className="met-staff-v2-drawer__row">
                      <span>确认影响课次</span>
                      <input
                        type="checkbox"
                        data-testid="staff-app-confirm-sessions"
                        checked={confirmSessions}
                        onChange={e => setConfirmSessions(e.target.checked)}
                      />
                    </label>
                  ) : null}
                  {needsSubstitute ? (
                    <label className="met-staff-v2-drawer__row">
                      <span>替代老师</span>
                      <select
                        data-testid="staff-app-substitute"
                        value={substituteStaffId}
                        onChange={e => setSubstituteStaffId(e.target.value)}
                      >
                        <option value="">请选择</option>
                        {members
                          .filter(m => m.id !== app.applicantStaffId)
                          .map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                              {m.teachingLevel ? ` · ${m.teachingLevel}` : ''}
                            </option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  {app.type === '改期' ? (
                    <>
                      <label className="met-staff-v2-drawer__row">
                        <span>新日期</span>
                        <input
                          data-testid="staff-app-reschedule-date"
                          value={rescheduleDate}
                          onChange={e => setRescheduleDate(e.target.value)}
                        />
                      </label>
                      <label className="met-staff-v2-drawer__row">
                        <span>开始时间</span>
                        <input
                          data-testid="staff-app-reschedule-start"
                          value={rescheduleStart}
                          onChange={e => setRescheduleStart(e.target.value)}
                        />
                      </label>
                      <label className="met-staff-v2-drawer__row">
                        <span>结束时间</span>
                        <input
                          data-testid="staff-app-reschedule-end"
                          value={rescheduleEnd}
                          onChange={e => setRescheduleEnd(e.target.value)}
                        />
                      </label>
                    </>
                  ) : null}
                  <p className="met-staff-v2-muted">通过后将写入排课影响并更新工作台待办。</p>
                </div>
              ) : null}

              {action === 'reject' ? (
                <label className="met-staff-v2-drawer__row">
                  <span>驳回原因</span>
                  <input
                    data-testid="staff-app-reject-reason"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </label>
              ) : null}

              {action === 'supplement' ? (
                <label className="met-staff-v2-drawer__row">
                  <span>补充要求</span>
                  <input
                    data-testid="staff-app-supplement-msg"
                    value={supplementMsg}
                    onChange={e => setSupplementMsg(e.target.value)}
                  />
                </label>
              ) : null}
            </section>
          )}
        </div>
        <div className="met-staff-v2-drawer__footer-fixed">
          <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
            取消
          </button>
          {open ? (
            <button
              type="button"
              className="met-v2-drawer-footer-btn met-v2-drawer-footer-btn--primary"
              data-testid="staff-app-submit"
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
          ) : null}
          {/* Compat aliases for prior acceptance selectors when action=approve */}
          {open && action === 'approve' ? (
            <button
              type="button"
              className="met-staff-v2-sr-only"
              data-testid="staff-app-approve"
              onClick={onSubmit}
            >
              通过
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

function TeacherDetailDrawer({
  member,
  capabilities,
  sessions,
  apps,
  logs,
  issues,
  canEdit,
  canViewPayable,
  onClose,
  onSave,
}: {
  member: StaffMember;
  capabilities: TeachingCapability[];
  sessions: ScheduleAssignment[];
  apps: StaffApplication[];
  logs: Array<{ id: string; at: string; operatorName: string; action: string }>;
  issues: string[];
  canEdit: boolean;
  canViewPayable: boolean;
  onClose: () => void;
  onSave: (supportStoreIds: string[], capabilityIds: string[]) => void;
}) {
  const [supportIds, setSupportIds] = useState(member.supportStoreIds);
  const [capIds, setCapIds] = useState(member.capabilityIds);
  useEffect(() => {
    setSupportIds(member.supportStoreIds);
    setCapIds(member.capabilityIds);
  }, [member.id, member.supportStoreIds, member.capabilityIds]);

  const toggleSupport = (storeId: string) => {
    setSupportIds(prev =>
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId],
    );
  };
  const toggleCap = (capId: string) => {
    setCapIds(prev =>
      prev.includes(capId) ? prev.filter(id => id !== capId) : [...prev, capId],
    );
  };

  return (
    <>
      <button
        type="button"
        className="met-staff-v2-drawer-overlay met-v2-drawer-overlay"
        onClick={onClose}
        aria-label="关闭老师详情"
      />
      <aside
        className="met-staff-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md"
        role="dialog"
        data-testid="staff-teacher-drawer"
      >
        <div className="met-staff-v2-drawer__head met-v2-drawer-header">
          <div>
            <h2 className="met-staff-v2-drawer__title">{member.name}</h2>
            <p className="met-staff-v2-drawer__subtitle">
              {member.teachingLevel ?? '—'} · {storeLabel(member.primaryStoreId)}
            </p>
          </div>
          <button type="button" className="met-staff-v2-drawer__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="met-staff-v2-drawer__body met-v2-drawer-body">
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">基本信息</h3>
            <div className="met-staff-v2-drawer__row">
              <span>工号</span>
              <span>{member.employeeCode}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>手机</span>
              <span>{member.mobileMasked}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>在职状态</span>
              <span>{member.employmentStatus}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>合作类型</span>
              <span>{member.cooperationType}</span>
            </div>
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">门店与角色</h3>
            <div className="met-staff-v2-drawer__row">
              <span>主门店</span>
              <span>{storeLabel(member.primaryStoreId)}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>支援门店</span>
              <span>
                {member.supportStoreIds.map(storeLabel).filter(n => n !== '—').join('、') || '—'}
              </span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>角色</span>
              <span>{member.roleAssignments.map(r => r.label).join('、')}</span>
            </div>
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">教学能力</h3>
            <div className="met-staff-v2-drawer__row">
              <span>可授课程</span>
              <span>{capabilityLabels(member.capabilityIds, capabilities)}</span>
            </div>
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">可排时间</h3>
            <div className="met-staff-v2-drawer__row">
              <span>状态</span>
              <span>{member.availabilityStatus}</span>
            </div>
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">近期课次</h3>
            {sessions.slice(0, 5).map(s => (
              <div key={s.id} className="met-staff-v2-drawer__row">
                <span>
                  {s.session.dateIso} {s.session.startTime}
                </span>
                <span>
                  {s.session.courseName} · {s.session.storeName}
                </span>
              </div>
            ))}
            {sessions.length === 0 ? <p className="met-staff-v2-muted">暂无</p> : null}
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">当前申请</h3>
            {apps.length ? (
              apps.map(a => (
                <div key={a.id} className="met-staff-v2-drawer__row">
                  <span>{a.type}</span>
                  <span>{a.status}</span>
                </div>
              ))
            ) : (
              <p className="met-staff-v2-muted">暂无</p>
            )}
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">风险与提醒</h3>
            <p className="met-staff-v2-muted">{issues.join('、') || '暂无异常'}</p>
          </section>
          {canViewPayable ? (
            <section className="met-staff-v2-drawer__section">
              <h3 className="met-staff-v2-drawer__section-title">课酬摘要</h3>
              <div className="met-staff-v2-drawer__row">
                <span>应付</span>
                <span>{member.readonlyFacts?.payableDueYuan ?? '—'} 元</span>
              </div>
              <div className="met-staff-v2-drawer__row">
                <span>已付</span>
                <span>{member.readonlyFacts?.payablePaidYuan ?? '—'} 元</span>
              </div>
            </section>
          ) : (
            <section className="met-staff-v2-drawer__section">
              <h3 className="met-staff-v2-drawer__section-title">课酬</h3>
              <p className="met-staff-v2-muted">当前角色不可见具体金额</p>
            </section>
          )}
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">只读事实</h3>
            <div className="met-staff-v2-drawer__row">
              <span>已授课次数</span>
              <span>{member.readonlyFacts?.taughtSessionCount ?? '—'}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>到课率</span>
              <span>{member.readonlyFacts?.attendanceRate ?? '—'}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>满班率</span>
              <span>{member.readonlyFacts?.fillRate ?? '—'}</span>
            </div>
            <div className="met-staff-v2-drawer__row">
              <span>教学评分</span>
              <span>{member.readonlyFacts?.teachingScore ?? '—'}</span>
            </div>
          </section>
          <section className="met-staff-v2-drawer__section">
            <h3 className="met-staff-v2-drawer__section-title">操作日志</h3>
            {logs.slice(0, 8).map(log => (
              <div key={log.id} className="met-teacher-app-drawer__log-item">
                {formatDue(log.at)} · {log.operatorName} · {log.action}
              </div>
            ))}
            {logs.length === 0 ? <p className="met-staff-v2-muted">暂无</p> : null}
          </section>
          {canEdit ? (
            <section className="met-staff-v2-drawer__section">
              <h3 className="met-staff-v2-drawer__section-title">就地编辑</h3>
              <div className="met-staff-v2-check-group" data-testid="staff-edit-support-stores">
                <span className="met-staff-v2-check-group__label">支援门店</span>
                {STORE_OPTIONS.filter(s => s.id !== 'all' && s.id !== member.primaryStoreId).map(
                  s => (
                    <label key={s.id} className="met-staff-v2-check">
                      <input
                        type="checkbox"
                        checked={supportIds.includes(s.id)}
                        onChange={() => toggleSupport(s.id)}
                      />
                      {s.label}
                    </label>
                  ),
                )}
              </div>
              <div className="met-staff-v2-check-group" data-testid="staff-edit-capabilities">
                <span className="met-staff-v2-check-group__label">可授课程</span>
                {capabilities.map(c => (
                  <label key={c.capabilityId} className="met-staff-v2-check">
                    <input
                      type="checkbox"
                      checked={capIds.includes(c.capabilityId)}
                      onChange={() => toggleCap(c.capabilityId)}
                    />
                    {c.capabilityLabel}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="met-v2-drawer-footer-btn"
                data-testid="staff-edit-profile"
                onClick={() => onSave(supportIds, capIds)}
              >
                保存门店/能力
              </button>
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export default StaffV2Page;
