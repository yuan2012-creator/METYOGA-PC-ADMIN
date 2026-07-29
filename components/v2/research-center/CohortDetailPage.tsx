import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, MoreHorizontal } from 'lucide-react';
import { SummaryMetricGrid } from '../shared';
import CohortDeliveryDrawer, { type CohortDeliveryDrawerState } from './CohortDeliveryDrawer';
import type { ResearchCenterDrawerState } from './ResearchCenterDrawer';
import { computeScheduleSummary, formatCurrency } from './researchCenterCalculations';
import {
  buildCohortOverviewMetrics,
  buildDeliveryTodos,
  buildStudentDeliveryRows,
  buildTeachingProgress,
  canCompleteSession,
  COHORT_PROGRESS_NODES,
  dayIndexLabel,
  filterSchedulesByCohort,
  formatAttendanceRate,
  getActiveCohortStudents,
  groupSchedulesByDate,
  resolveCohortProgressNode,
} from './researchCenterDeliveryCalculations';
import type {
  AttendanceDraft,
  AttendanceSheet,
  CohortConfig,
  EnrollmentRecord,
  LeaveDraft,
  LeaveRequest,
  LeadRecord,
  MakeupDraft,
  MakeupRecord,
  OperationLogEntry,
  ScheduleDraft,
  ScheduleItem,
  TeachingRecord,
  TeachingRecordDraft,
} from './researchCenterV2.viewModel';

export type CohortDetailTab = 'overview' | 'students' | 'schedule' | 'delivery';

interface CohortDetailPageProps {
  cohort: CohortConfig;
  schedules: ScheduleItem[];
  enrollments: EnrollmentRecord[];
  leads: LeadRecord[];
  attendances: AttendanceSheet[];
  leaveRequests: LeaveRequest[];
  makeupRecords: MakeupRecord[];
  teachingRecords: TeachingRecord[];
  operationLogs: OperationLogEntry[];
  cohorts: CohortConfig[];
  canDirectManage: boolean;
  initialTab?: CohortDetailTab;
  initialDrawer?: CohortDeliveryDrawerState;
  onBack: () => void;
  onToast: (msg: string) => void;
  onOpenHomeDrawer?: (drawer: ResearchCenterDrawerState) => void;
  onOpenCohort?: (cohortId: string, tab?: CohortDetailTab) => void;
  onViewFinance?: () => void;
  onSaveAttendance: (draft: AttendanceDraft) => { ok: boolean; error?: string };
  onCreateLeaveRequest: (draft: LeaveDraft) => { ok: boolean; error?: string; id?: string };
  onArrangeMakeup: (draft: MakeupDraft) => { ok: boolean; error?: string; id?: string };
  onCompleteMakeup: (makeupId: string) => { ok: boolean; error?: string };
  onSaveTeachingRecord: (draft: TeachingRecordDraft) => { ok: boolean; error?: string };
  onCompleteTeachingSession: (sessionId: string) => { ok: boolean; error?: string };
  onChangeSessionTeacher: (sessionId: string, teacher: string, reason: string) => { ok: boolean; error?: string };
  onRescheduleSession: (
    sessionId: string,
    next: { dateIso: string; startTime: string; endTime: string; reason: string },
  ) => { ok: boolean; error?: string };
  onCancelSession: (sessionId: string, reason: string) => { ok: boolean; error?: string };
  onAddSchedule: (draft: ScheduleDraft) => boolean;
  onUpdateSchedule: (id: string, patch: Partial<ScheduleItem>) => boolean;
  onDeleteSchedule: (id: string) => void;
}

const DETAIL_TABS: { id: CohortDetailTab; label: string }[] = [
  { id: 'overview', label: '班期概览' },
  { id: 'students', label: '学员管理' },
  { id: 'schedule', label: '完整课程表' },
  { id: 'delivery', label: '教学交付' },
];

const LEARNING_FILTERS = ['全部', '正常', '请假中', '缺勤异常', '补课中', '已退出'] as const;

const CohortDetailPage: React.FC<CohortDetailPageProps> = ({
  cohort,
  schedules,
  enrollments,
  leads,
  attendances,
  leaveRequests,
  makeupRecords,
  teachingRecords,
  operationLogs,
  cohorts,
  canDirectManage,
  initialTab = 'overview',
  initialDrawer = null,
  onBack,
  onToast,
  onOpenHomeDrawer,
  onOpenCohort,
  onViewFinance,
  onSaveAttendance,
  onCreateLeaveRequest,
  onArrangeMakeup,
  onCompleteMakeup,
  onSaveTeachingRecord,
  onCompleteTeachingSession,
  onChangeSessionTeacher,
  onRescheduleSession,
  onCancelSession,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<CohortDetailTab>(initialTab);
  const [drawer, setDrawer] = useState<CohortDeliveryDrawerState>(initialDrawer);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, cohort.id]);

  useEffect(() => {
    if (initialDrawer) setDrawer(initialDrawer);
  }, [initialDrawer]);
  const [showMore, setShowMore] = useState(false);
  const [studentFilter, setStudentFilter] = useState<(typeof LEARNING_FILTERS)[number]>('全部');
  const [scheduleMenuId, setScheduleMenuId] = useState<string | null>(null);
  const [studentMenuId, setStudentMenuId] = useState<string | null>(null);

  const cohortSchedules = useMemo(
    () => filterSchedulesByCohort(schedules, cohort.id),
    [schedules, cohort.id],
  );
  const joinedCount = useMemo(
    () => getActiveCohortStudents(enrollments, cohort.id).length,
    [enrollments, cohort.id],
  );

  const overviewMetrics = useMemo(
    () => buildCohortOverviewMetrics(cohort, schedules, attendances, leaveRequests, makeupRecords),
    [cohort, schedules, attendances, leaveRequests, makeupRecords],
  );

  const metricItems = useMemo(
    () => [
      { id: 'paid', label: '当前实缴', value: `${overviewMetrics.paidCount}人`, status: 'normal' as const },
      { id: 'receipt', label: '已收金额', value: formatCurrency(overviewMetrics.totalReceipt), status: 'normal' as const },
      { id: 'days', label: '已排教学日', value: `${overviewMetrics.scheduledDays}天`, status: 'normal' as const },
      { id: 'sessions', label: '已完成课次', value: `${overviewMetrics.completedSessions}次`, status: 'normal' as const },
      {
        id: 'avg-attendance',
        label: '平均到课率',
        value: formatAttendanceRate(overviewMetrics.averageAttendanceRate),
        status: (overviewMetrics.averageAttendanceRate != null && overviewMetrics.averageAttendanceRate < 80
          ? 'warning'
          : 'normal') as 'normal' | 'warning',
        testId: 'rc-avg-attendance',
      },
      {
        id: 'exceptions',
        label: '待处理异常',
        value: `${overviewMetrics.pendingExceptions}项`,
        status: (overviewMetrics.pendingExceptions > 0 ? 'warning' : 'success') as 'warning' | 'success',
      },
    ],
    [overviewMetrics],
  );

  const progressNode = useMemo(
    () => resolveCohortProgressNode(cohort, cohortSchedules),
    [cohort, cohortSchedules],
  );
  const teachingProgress = useMemo(
    () => buildTeachingProgress(cohort, schedules),
    [cohort, schedules],
  );
  const deliveryTodos = useMemo(
    () =>
      buildDeliveryTodos({
        cohort,
        schedules,
        attendances,
        leaveRequests,
        makeupRecords,
        teachingRecords,
      }),
    [cohort, schedules, attendances, leaveRequests, makeupRecords, teachingRecords],
  );

  const recentSessions = useMemo(
    () =>
      [...cohortSchedules]
        .filter(s => s.status !== '已取消')
        .sort((a, b) => `${b.dateIso}${b.startTime}`.localeCompare(`${a.dateIso}${a.startTime}`))
        .slice(0, 3),
    [cohortSchedules],
  );

  const studentRows = useMemo(
    () => buildStudentDeliveryRows(enrollments, leads, cohort.id, attendances, leaveRequests, makeupRecords),
    [enrollments, leads, cohort.id, attendances, leaveRequests, makeupRecords],
  );

  const filteredStudents = useMemo(() => {
    if (studentFilter === '全部') return studentRows;
    return studentRows.filter(r => r.learningStatus === studentFilter);
  }, [studentRows, studentFilter]);

  const scheduleSummary = useMemo(
    () => computeScheduleSummary(cohort, cohortSchedules),
    [cohort, cohortSchedules],
  );
  const groupedSchedule = useMemo(() => groupSchedulesByDate(cohortSchedules), [cohortSchedules]);

  const sessionsNeedingAttendance = useMemo(
    () =>
      cohortSchedules.filter(
        s =>
          !s.attendanceSaved &&
          s.status !== '已取消' &&
          s.status !== '草稿' &&
          s.status !== '已完成',
      ),
    [cohortSchedules],
  );

  const sessionsNeedingTeaching = useMemo(
    () =>
      cohortSchedules.filter(
        s =>
          s.attendanceSaved &&
          !teachingRecords.some(t => t.sessionId === s.id) &&
          s.status !== '已完成' &&
          s.status !== '已取消',
      ),
    [cohortSchedules, teachingRecords],
  );

  const leavesWithoutMakeup = useMemo(
    () =>
      leaveRequests.filter(
        l =>
          l.cohortId === cohort.id &&
          l.status === '已批准' &&
          l.needMakeup &&
          !l.makeupId &&
          !makeupRecords.some(m => m.leaveRequestId === l.id && m.status !== '已取消'),
      ),
    [leaveRequests, cohort.id, makeupRecords],
  );

  const pendingMakeups = useMemo(
    () =>
      makeupRecords.filter(
        m => m.cohortId === cohort.id && (m.status === '待安排' || m.status === '已安排'),
      ),
    [makeupRecords, cohort.id],
  );

  const openDrawer = useCallback((next: CohortDeliveryDrawerState) => setDrawer(next), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const handleTodoAction = useCallback(
    (todo: { actionId: string; sessionId?: string; studentId?: string; leaveRequestId?: string }) => {
      if (todo.actionId === 'add-student') {
        onOpenHomeDrawer?.({ type: 'enrollment' });
      } else if (todo.actionId === 'add-session') {
        openDrawer({ type: 'add-session' });
        setActiveTab('schedule');
      } else if (todo.actionId === 'record-attendance' && todo.sessionId) {
        openDrawer({ type: 'attendance', sessionId: todo.sessionId });
      } else if (todo.actionId === 'teaching-record' && todo.sessionId) {
        openDrawer({ type: 'teaching', sessionId: todo.sessionId });
      } else if (todo.actionId === 'change-teacher' && todo.sessionId) {
        openDrawer({ type: 'change-teacher', sessionId: todo.sessionId });
      } else if (todo.actionId === 'arrange-makeup') {
        openDrawer({
          type: 'makeup',
          leaveRequestId: todo.leaveRequestId,
          studentId: todo.studentId,
          sessionId: todo.sessionId,
        });
      } else if (todo.actionId === 'complete-makeup' && todo.leaveRequestId) {
        const makeup = makeupRecords.find(
          m => m.leaveRequestId === todo.leaveRequestId && m.status !== '已完成',
        );
        if (makeup) {
          const result = onCompleteMakeup(makeup.id);
          onToast(result.ok ? '补课已标记完成' : result.error ?? '操作失败');
        }
      }
    },
    [makeupRecords, onCompleteMakeup, onOpenHomeDrawer, onToast, openDrawer],
  );

  const payLabel = (item: ScheduleItem) => {
    if (!item.calcPay) return '不计课酬';
    return `${item.payAmount.toLocaleString()}元`;
  };

  const firstAttendanceSession = sessionsNeedingAttendance[0] ?? cohortSchedules.find(s => s.status !== '已取消');

  return (
    <div className="met-rc-v2-cohort-detail">
      <header className="met-rc-v2-cohort-detail__header">
        <button
          type="button"
          className="met-rc-v2-cohort-detail__back"
          data-testid="rc-cohort-back"
          onClick={onBack}
        >
          <ArrowLeft size={16} aria-hidden />
          返回
        </button>
        <div className="met-rc-v2-cohort-detail__title-block">
          <h1>{cohort.displayTitle}</h1>
          <p>管理本班期的学员、课程表与教学交付。</p>
        </div>
        <div className="met-rc-v2-cohort-detail__header-actions">
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
            onClick={() => onOpenHomeDrawer?.({ type: 'enrollment' })}
          >
            添加学员
          </button>
          <div className="met-rc-v2-more">
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              onClick={() => setShowMore(v => !v)}
            >
              更多操作<ChevronDown size={14} aria-hidden />
            </button>
            {showMore ? (
              <div className="met-rc-v2-more__menu">
                <button type="button" onClick={() => { openDrawer({ type: 'add-session' }); setShowMore(false); }}>添加课程</button>
                <button
                  type="button"
                  onClick={() => {
                    if (firstAttendanceSession) openDrawer({ type: 'attendance', sessionId: firstAttendanceSession.id });
                    else onToast('暂无可签到课次');
                    setShowMore(false);
                  }}
                >
                  记录签到
                </button>
                <button type="button" onClick={() => { onToast('发布通知（待建设）'); setShowMore(false); }}>发布通知</button>
                <button type="button" onClick={() => { onToast('编辑班期（待建设）'); setShowMore(false); }}>编辑班期</button>
                <button type="button" onClick={() => { onViewFinance?.(); setShowMore(false); }}>查看财务</button>
                <button type="button" onClick={() => { onToast('导出名单（待建设）'); setShowMore(false); }}>导出名单</button>
                <button type="button" onClick={() => { onToast('取消班期（待建设）'); setShowMore(false); }}>取消班期</button>
                <button type="button" onClick={() => { openDrawer({ type: 'operation-logs' }); setShowMore(false); }}>查看操作日志</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="met-rc-v2-cohort-detail__meta">
        <span className={`met-rc-v2-status met-rc-v2-status--${cohort.statusTone}`}>{cohort.status}</span>
        <span>{cohort.venue} · {cohort.classroom}</span>
        <span>{cohort.startDate} — {cohort.endDate}</span>
        <span>实缴 {cohort.paidCount} 人</span>
        <span>锁班 {cohort.lockCount} 人</span>
        <span>目标 {cohort.targetCount} 人</span>
        <span>最大 {cohort.maxCount} 人</span>
      </div>

      <nav className="met-rc-v2-cohort-detail__tabs" data-testid="rc-cohort-detail-tabs" role="tablist">
        {DETAIL_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={['met-rc-v2-cohort-detail__tab', activeTab === tab.id ? 'is-active' : ''].join(' ')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <div className="met-rc-v2-cohort-detail__overview">
          <SummaryMetricGrid
            items={metricItems}
            className="met-rc-v2-cohort-detail__metrics"
            columns={6}
            compact
            data-testid="rc-cohort-overview-metrics"
          />
          <div className="met-rc-v2-cohort-detail__layout">
            <div className="met-rc-v2-cohort-detail__main">
              <section className="met-rc-v2-cohort-detail__card">
                <h3>班期进度</h3>
                <div className="met-rc-v2-cohort-progress-nodes">
                  {COHORT_PROGRESS_NODES.map(node => (
                    <span
                      key={node}
                      className={['met-rc-v2-cohort-progress-nodes__node', node === progressNode ? 'is-current' : ''].join(' ')}
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </section>
              <section className="met-rc-v2-cohort-detail__card">
                <h3>教学进度</h3>
                <p className="met-rc-v2-cohort-detail__progress-text">
                  计划{teachingProgress.plannedDays}天 · 已排{teachingProgress.scheduledDays}天 · 已完成{teachingProgress.completedDays}天 · 课次{teachingProgress.completedSessions}/{teachingProgress.sessionCount}
                  {teachingProgress.pendingDays > 0 ? ` · 待排${teachingProgress.pendingDays}天` : ''}
                </p>
                {teachingProgress.nextSession ? (
                  <p className="met-rc-v2-cohort-detail__next-session">
                    下一课：{teachingProgress.nextSession.date} {teachingProgress.nextSession.content}
                  </p>
                ) : null}
              </section>
              <section className="met-rc-v2-cohort-detail__card">
                <h3>最近课次</h3>
                <ul className="met-rc-v2-cohort-recent-sessions">
                  {recentSessions.map(s => (
                    <li key={s.id}>
                      <span>{s.date} {s.startTime}</span>
                      <span>{s.content}</span>
                      <span>{s.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <aside className="met-rc-v2-cohort-detail__sidebar">
              <h3>待办事项</h3>
              {deliveryTodos.length ? (
                <ul className="met-rc-v2-cohort-todos">
                  {deliveryTodos.map(todo => (
                    <li key={todo.id}>
                      <span>{todo.title}</span>
                      <button
                        type="button"
                        className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                        onClick={() => handleTodoAction(todo)}
                      >
                        {todo.actionLabel}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="met-rc-v2-cohort-detail__empty">暂无待办</p>
              )}
            </aside>
          </div>
        </div>
      ) : null}

      {activeTab === 'students' ? (
        <div className="met-rc-v2-cohort-detail__students">
          <div className="met-rc-v2-cohort-detail__students-head">
            <span data-testid="rc-cohort-student-count">实缴学员 {joinedCount}</span>
            <div className="met-rc-v2-cohort-detail__filters">
              {LEARNING_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  className={['met-rc-v2-cohort-detail__filter', studentFilter === f ? 'is-active' : ''].join(' ')}
                  onClick={() => setStudentFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="met-rc-v2-cohort-student-table">
            <div className="met-rc-v2-cohort-student-table__head">
              <span>学员</span>
              <span>学习状态</span>
              <span>出勤率</span>
              <span>已到/请假/缺勤</span>
              <span>建议操作</span>
              <span>操作</span>
            </div>
            {filteredStudents.map(row => (
              <div key={row.enrollment.id} className="met-rc-v2-cohort-student-table__row">
                <span>
                  <strong>{row.enrollment.studentName}</strong>
                  <em>{row.enrollment.paymentStatus}</em>
                </span>
                <span>{row.learningStatus}</span>
                <span>{formatAttendanceRate(row.attendanceRate)}</span>
                <span>{row.presentCount}/{row.leaveCount}/{row.absentCount}</span>
                <span>{row.nextAction}</span>
                <span className="met-rc-v2-cohort-student-table__actions">
                  <button
                    type="button"
                    className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                    onClick={() => openDrawer({ type: 'student-profile', enrollmentId: row.enrollment.id })}
                  >
                    查看档案
                  </button>
                  <div className="met-rc-v2-row-more">
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      onClick={() => setStudentMenuId(prev => (prev === row.enrollment.id ? null : row.enrollment.id))}
                      aria-label="更多操作"
                    >
                      <MoreHorizontal size={14} aria-hidden />
                    </button>
                    {studentMenuId === row.enrollment.id ? (
                      <div className="met-rc-v2-row-more__menu">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenHomeDrawer?.({ type: 'record-payment', enrollmentId: row.enrollment.id });
                            setStudentMenuId(null);
                          }}
                        >
                          录入收款
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openDrawer({ type: 'leave', studentId: row.enrollment.id });
                            setStudentMenuId(null);
                          }}
                        >
                          记录请假
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openDrawer({ type: 'makeup', studentId: row.enrollment.id });
                            setStudentMenuId(null);
                          }}
                        >
                          安排补课
                        </button>
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => {
                            onOpenHomeDrawer?.({ type: 'refund', enrollmentId: row.enrollment.id });
                            setStudentMenuId(null);
                          }}
                        >
                          发起退款
                        </button>
                      </div>
                    ) : null}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'schedule' ? (
        <div className="met-rc-v2-cohort-detail__schedule" data-testid="rc-cohort-schedule">
          <div className="met-rc-v2-cohort-detail__schedule-head">
            <p>
              计划{scheduleSummary.plannedDays}天 · 已排{scheduleSummary.scheduledDays}天 · 共{scheduleSummary.sessionCount}课次 · 课酬合计{scheduleSummary.mentorCostTotal.toLocaleString()}元
            </p>
            <div className="met-rc-v2-cohort-detail__schedule-tools">
              <button type="button" className="met-rc-v2-cohort-detail__view-switch is-active">按日期</button>
              <button type="button" className="met-rc-v2-cohort-detail__view-switch" onClick={() => onToast('按导师/日历视图（待建设）')}>按导师</button>
              <button type="button" className="met-rc-v2-cohort-detail__view-switch" onClick={() => onToast('按导师/日历视图（待建设）')}>日历</button>
              {canDirectManage ? (
                <button
                  type="button"
                  className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
                  onClick={() => openDrawer({ type: 'add-session' })}
                >
                  添加课程
                </button>
              ) : null}
            </div>
          </div>
          {groupedSchedule.map(([dateIso, items]) => (
            <section key={dateIso} className="met-rc-v2-cohort-schedule-day">
              <h4>
                {dayIndexLabel(cohort, dateIso)} · {items[0]?.date ?? dateIso}
              </h4>
              <ul>
                {items.map(item => (
                  <li key={item.id} className="met-rc-v2-cohort-schedule-day__item">
                    <div className="met-rc-v2-cohort-schedule-day__main">
                      <span>{item.startTime}—{item.endTime}</span>
                      <span>{item.content}</span>
                      <span>{item.teacher || '—'}</span>
                      <span>{item.classroom}</span>
                      <span className={`is-status-${item.status}`}>{item.status}</span>
                      <span>{payLabel(item)}</span>
                    </div>
                    {canDirectManage ? (
                      <div className="met-rc-v2-cohort-schedule-day__actions">
                        <button
                          type="button"
                          className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                          onClick={() => openDrawer({ type: 'attendance', sessionId: item.id })}
                        >
                          {item.attendanceSaved ? '查看签到' : '记录签到'}
                        </button>
                        <div className="met-rc-v2-row-more">
                          <button
                            type="button"
                            className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                            onClick={() => setScheduleMenuId(prev => (prev === item.id ? null : item.id))}
                            aria-label="更多操作"
                          >
                            <MoreHorizontal size={14} aria-hidden />
                          </button>
                          {scheduleMenuId === item.id ? (
                            <div className="met-rc-v2-row-more__menu">
                              <button type="button" onClick={() => { openDrawer({ type: 'edit-session', sessionId: item.id }); setScheduleMenuId(null); }}>编辑</button>
                              <button type="button" onClick={() => { openDrawer({ type: 'change-teacher', sessionId: item.id }); setScheduleMenuId(null); }}>更换导师</button>
                              <button type="button" onClick={() => { openDrawer({ type: 'reschedule', sessionId: item.id }); setScheduleMenuId(null); }}>改期</button>
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = window.prompt('取消原因');
                                  if (reason?.trim()) {
                                    const result = onCancelSession(item.id, reason.trim());
                                    onToast(result.ok ? '课次已取消' : result.error ?? '取消失败');
                                  }
                                  setScheduleMenuId(null);
                                }}
                              >
                                取消课次
                              </button>
                              <button
                                type="button"
                                className="is-danger"
                                onClick={() => {
                                  if (window.confirm('确认删除这个课次？')) {
                                    onDeleteSchedule(item.id);
                                    onToast('课次已删除');
                                  }
                                  setScheduleMenuId(null);
                                }}
                              >
                                删除
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {activeTab === 'delivery' ? (
        <div className="met-rc-v2-cohort-detail__delivery" data-testid="rc-cohort-delivery">
          <section className="met-rc-v2-cohort-delivery-card">
            <h3>待签到 / 待教学</h3>
            {sessionsNeedingAttendance.length || sessionsNeedingTeaching.length ? (
              <ul>
                {sessionsNeedingAttendance.map(s => (
                  <li key={`att-${s.id}`}>
                    <span>{s.date} {s.content} · 待签到</span>
                    <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => openDrawer({ type: 'attendance', sessionId: s.id })}>记录签到</button>
                  </li>
                ))}
                {sessionsNeedingTeaching.map(s => (
                  <li key={`teach-${s.id}`}>
                    <span>{s.date} {s.content} · 待教学记录</span>
                    <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => openDrawer({ type: 'teaching', sessionId: s.id })}>填写记录</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>暂无待处理课次</p>
            )}
          </section>
          <section className="met-rc-v2-cohort-delivery-card">
            <h3>请假未安排补课</h3>
            {leavesWithoutMakeup.length ? (
              <ul>
                {leavesWithoutMakeup.map(leave => {
                  const student = enrollments.find(e => e.id === leave.studentId);
                  return (
                    <li key={leave.id}>
                      <span>{student?.studentName ?? leave.studentId} · {leave.reason}</span>
                      <button
                        type="button"
                        className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                        onClick={() => openDrawer({ type: 'makeup', leaveRequestId: leave.id, studentId: leave.studentId, sessionId: leave.sessionId })}
                      >
                        安排补课
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>暂无</p>
            )}
          </section>
          <section className="met-rc-v2-cohort-delivery-card">
            <h3>补课待完成</h3>
            {pendingMakeups.length ? (
              <ul>
                {pendingMakeups.map(m => {
                  const student = enrollments.find(e => e.id === m.studentId);
                  return (
                    <li key={m.id}>
                      <span>{student?.studentName ?? m.studentId} · {m.method} · {m.makeupDate}</span>
                      <button
                        type="button"
                        className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                        onClick={() => {
                          const result = onCompleteMakeup(m.id);
                          onToast(result.ok ? '补课已完成' : result.error ?? '操作失败');
                        }}
                      >
                        标记完成
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>暂无</p>
            )}
          </section>
          <section className="met-rc-v2-cohort-delivery-card">
            <h3>可完成课次</h3>
            <ul>
              {cohortSchedules
                .filter(s => s.attendanceSaved && s.status !== '已完成' && s.status !== '已取消')
                .map(s => {
                  const attendance = attendances.find(a => a.sessionId === s.id);
                  const teaching = teachingRecords.find(t => t.sessionId === s.id);
                  const check = canCompleteSession({ session: s, attendance, teaching });
                  return (
                    <li key={s.id}>
                      <span>{s.date} {s.content}</span>
                      <button
                        type="button"
                        className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
                        disabled={!check.ok}
                        title={check.error}
                        onClick={() => {
                          const result = onCompleteTeachingSession(s.id);
                          onToast(result.ok ? '课次已完成' : result.error ?? '无法完成');
                        }}
                      >
                        完成课次
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      ) : null}

      <CohortDeliveryDrawer
        cohort={cohort}
        schedules={schedules}
        enrollments={enrollments}
        leads={leads}
        attendances={attendances}
        leaveRequests={leaveRequests}
        makeupRecords={makeupRecords}
        teachingRecords={teachingRecords}
        operationLogs={operationLogs}
        cohorts={cohorts}
        drawer={drawer}
        onClose={closeDrawer}
        onToast={onToast}
        onSelectCohort={id => onOpenCohort?.(id)}
        onSaveAttendance={onSaveAttendance}
        onCreateLeaveRequest={onCreateLeaveRequest}
        onArrangeMakeup={onArrangeMakeup}
        onSaveTeachingRecord={onSaveTeachingRecord}
        onChangeSessionTeacher={onChangeSessionTeacher}
        onRescheduleSession={onRescheduleSession}
        onAddSchedule={onAddSchedule}
        onUpdateSchedule={onUpdateSchedule}
      />
    </div>
  );
};

export default CohortDetailPage;
