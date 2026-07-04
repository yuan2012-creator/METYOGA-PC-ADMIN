import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildCourseV2Snapshot,
  getConsumptionCardStatusClass,
  getCourseStatusClass,
  getCourseSupplyStatusClass,
  getIssueCategoryStatusClass,
  type CourseV2Detail,
  type CourseV2Priority,
  type CourseV2Session,
  type CourseV2ViewMode,
  type CourseDetailEntry,
  type CoursePriorityAction,
} from './courseV2.viewModel';
import CourseSecondaryWeekSchedulePage, {
  type WeekScheduleInitialMode,
} from './CourseSecondaryWeekSchedulePage';
import {
  buildWeekScheduleSnapshot,
  type NewScheduleDraft,
} from './courseSecondaryWeekSchedule.viewModel';
import './courseV2.css';
import './courseSecondaryWeekSchedule.css';

type CourseV2PageViewMode = 'overview' | 'weekSchedule';

const NEW_SCHEDULE_STEPS = [
  '选择门店',
  '选择课程类型',
  '选择老师',
  '选择日期与时段',
  '冲突检查',
  '设置预约规则',
  '会员端预览',
  '提交 mock',
] as const;

function resolveWeekScheduleMode(
  sourceId: string,
): WeekScheduleInitialMode {
  if (sourceId === 'cpa-2' || sourceId === 'cde-3') return 'lowAttendance';
  if (sourceId === 'cpa-3') return 'teacherConflict';
  return 'default';
}

function NewScheduleDrawer({
  draft,
  disclaimer,
  submitToast,
  saveDraftToast,
  onClose,
  onToast,
}: {
  draft: NewScheduleDraft;
  disclaimer: string;
  submitToast: string;
  saveDraftToast: string;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const showTeacherWarn = draft.teacher === 'Mia';

  return (
    <>
      <button
        type="button"
        className="met-course-v2-drawer-overlay met-v2-drawer-overlay"
        aria-label="关闭新增排课"
        onClick={onClose}
      />
      <aside
        className="met-course-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md"
        role="dialog"
        aria-labelledby="new-schedule-drawer-title"
      >
        <div className="met-course-v2-drawer__head met-v2-drawer-header">
          <div>
            <h2 id="new-schedule-drawer-title" className="met-course-v2-drawer__title met-v2-drawer-title">
              新增排课
            </h2>
            <p className="met-new-schedule-drawer__disclaimer">{disclaimer}</p>
          </div>
          <button
            type="button"
            className="met-course-v2-drawer__close met-v2-drawer-close"
            aria-label="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="met-course-v2-drawer__body met-v2-drawer-body">
          <div className="met-new-schedule-drawer__steps">
            {NEW_SCHEDULE_STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                className={[
                  'met-new-schedule-drawer__step',
                  index === activeStep ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveStep(index)}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {activeStep === 0 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 1：选择门店</h3>
              <div className="met-new-schedule-drawer__row"><span>门店</span><span>{draft.store}</span></div>
              <div className="met-new-schedule-drawer__row"><span>教室</span><span>{draft.room}</span></div>
            </section>
          ) : null}

          {activeStep === 1 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 2：选择课程类型</h3>
              <div className="met-new-schedule-drawer__row"><span>课程类型</span><span>{draft.courseType}</span></div>
              <div className="met-new-schedule-drawer__row"><span>课程名称</span><span>{draft.courseName}</span></div>
              <div className="met-new-schedule-drawer__row"><span>扣点数</span><span>{draft.pointCost} 点</span></div>
              <div className="met-new-schedule-drawer__row"><span>容量</span><span>{draft.capacity} 人</span></div>
            </section>
          ) : null}

          {activeStep === 2 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 3：选择老师</h3>
              <div className="met-new-schedule-drawer__row"><span>老师</span><span>{draft.teacher}</span></div>
              <div className="met-new-schedule-drawer__row"><span>可授课程</span><span>{draft.teachableCourses}</span></div>
              <div className="met-new-schedule-drawer__row"><span>老师负载</span><span>{draft.teacherLoad}</span></div>
              <div className="met-new-schedule-drawer__row"><span>可用状态</span><span>{draft.teacherAvailability}</span></div>
              {showTeacherWarn ? (
                <p className="met-new-schedule-drawer__warn">
                  该老师本周晚间负载偏高，建议优先选择可补排老师。
                </p>
              ) : null}
            </section>
          ) : null}

          {activeStep === 3 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 4：选择日期与时段</h3>
              <div className="met-new-schedule-drawer__row"><span>日期</span><span>{draft.date}</span></div>
              <div className="met-new-schedule-drawer__row"><span>开始时间</span><span>{draft.startTime}</span></div>
              <div className="met-new-schedule-drawer__row"><span>结束时间</span><span>{draft.endTime}</span></div>
              <div className="met-new-schedule-drawer__row"><span>时长</span><span>{draft.duration}</span></div>
            </section>
          ) : null}

          {activeStep === 4 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 5：冲突检查</h3>
              <div className="met-new-schedule-drawer__row">
                <span>老师冲突</span>
                <span className={draft.teacherConflict === '通过' ? 'met-new-schedule-drawer__check-ok' : 'met-new-schedule-drawer__check-warn'}>
                  {draft.teacherConflict}
                </span>
              </div>
              <div className="met-new-schedule-drawer__row">
                <span>教室冲突</span>
                <span className={draft.roomConflict === '通过' ? 'met-new-schedule-drawer__check-ok' : 'met-new-schedule-drawer__check-warn'}>
                  {draft.roomConflict}
                </span>
              </div>
            </section>
          ) : null}

          {activeStep === 5 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 6：设置预约规则</h3>
              <div className="met-new-schedule-drawer__row"><span>开放预约时间</span><span>{draft.openBookingTime}</span></div>
              <div className="met-new-schedule-drawer__row"><span>取消规则</span><span>{draft.cancelRule}</span></div>
              <div className="met-new-schedule-drawer__row"><span>候补规则</span><span>{draft.waitlistRule}</span></div>
              <div className="met-new-schedule-drawer__row"><span>最低开班人数</span><span>{draft.minStudents} 人</span></div>
              <div className="met-new-schedule-drawer__row"><span>满班人数</span><span>{draft.maxStudents} 人</span></div>
              <p className="met-new-schedule-drawer__disclaimer">
                实际规则后续来自「产品与权益 / 排课规则配置」。
              </p>
            </section>
          ) : null}

          {activeStep === 6 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 7：会员端预览</h3>
              <div className="met-new-schedule-drawer__preview">
                <p className="met-new-schedule-drawer__preview-title">只读预览</p>
                <div className="met-new-schedule-drawer__row"><span>课程名称</span><span>{draft.courseName}</span></div>
                <div className="met-new-schedule-drawer__row"><span>老师</span><span>{draft.teacher}</span></div>
                <div className="met-new-schedule-drawer__row"><span>时间</span><span>{draft.date} {draft.startTime}–{draft.endTime}</span></div>
                <div className="met-new-schedule-drawer__row"><span>教室</span><span>{draft.room}</span></div>
                <div className="met-new-schedule-drawer__row"><span>扣点</span><span>{draft.pointCost} 点</span></div>
                <div className="met-new-schedule-drawer__row"><span>可预约人数</span><span>{draft.capacity} 人</span></div>
                <div className="met-new-schedule-drawer__row"><span>预约窗口</span><span>{draft.openBookingTime}</span></div>
              </div>
            </section>
          ) : null}

          {activeStep === 7 ? (
            <section className="met-new-schedule-drawer__section">
              <h3 className="met-new-schedule-drawer__section-title">步骤 8：提交 mock</h3>
              <p className="met-new-schedule-drawer__disclaimer">
                提交后仅进入审核 mock 流程，不会真实发布课程，也不会通知会员。
              </p>
            </section>
          ) : null}

          <div className="met-course-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="met-v2-drawer-footer-btn"
              onClick={() => onToast(saveDraftToast)}
            >
              保存草稿（待建设）
            </button>
            <button
              type="button"
              className="met-v2-drawer-footer-btn met-course-v2-btn--primary"
              onClick={() => {
                onToast(submitToast);
                onClose();
              }}
            >
              提交审核（待建设）
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

const PRIORITY_CLASS: Record<CourseV2Priority, string> = {
  P0: 'met-course-v2-priority--p0',
  P1: 'met-course-v2-priority--p1',
  P2: 'met-course-v2-priority--p2',
};

const VIEW_ENTRY_META: Record<
  CourseV2ViewMode,
  { label: string; toast: string; isCurrent: boolean }
> = {
  week: { label: '周排课视图', toast: '当前为周排课视图', isCurrent: true },
  today: { label: '今日待处理入口', toast: '进入今日待处理视图（待建设）', isCurrent: false },
  teacher: { label: '老师供给入口', toast: '进入老师供给视图（待建设）', isCurrent: false },
};

function V2DrawerEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="met-v2-drawer-empty">
      <h3 className="met-v2-drawer-empty__title">暂无详情</h3>
      <p className="met-v2-drawer-empty__desc">当前记录缺少详情数据，请检查 mock 配置</p>
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        关闭
      </button>
    </div>
  );
}

const SESSION_STATUS_CLASS: Record<string, string> = {
  low_booking: 'is-low',
  waitlist: 'is-waitlist',
  pending_checkin: 'is-checkin-pending',
  pending_confirm: 'is-checkin-pending',
  completed: 'is-muted',
};

function SessionCard({
  sess,
  onOpen,
  onAction,
  compact,
}: {
  sess: CourseV2Session;
  onOpen: (id: string) => void;
  onAction: (sess: CourseV2Session, e?: React.MouseEvent) => void;
  compact?: boolean;
}) {
  const cls = [
    'met-course-v2-session',
    compact ? 'met-course-v2-session--compact' : '',
    SESSION_STATUS_CLASS[sess.status] ?? 'is-normal-card',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={cls} onClick={() => onOpen(sess.id)}>
      <div className="met-course-v2-session__row">
        <span className="met-course-v2-session__time">{sess.time}</span>
        <span className="met-course-v2-session__name">{sess.courseName}</span>
      </div>
      <div className="met-course-v2-session__row met-course-v2-session__row--mid">
        <span className="met-course-v2-session__booking">
          {sess.booked}/{sess.capacity}
          {sess.waitlistCount ? ` · 候补 ${sess.waitlistCount}` : ''}
        </span>
        <span className="met-course-v2-session__consumption">{sess.consumptionLabel}</span>
      </div>
      <div className="met-course-v2-session__foot">
        <span className={['met-course-v2-status', getCourseStatusClass(sess.status)].join(' ')}>
          {sess.statusLabel}
        </span>
        <span
          role="button"
          tabIndex={0}
          className="met-course-v2-btn met-course-v2-btn--sm"
          onClick={e => onAction(sess, e)}
          onKeyDown={e => {
            if (e.key === 'Enter') onAction(sess);
          }}
        >
          {sess.actionLabel}
        </span>
      </div>
    </button>
  );
}

const CourseV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildCourseV2Snapshot(), []);
  const weekScheduleSnapshot = useMemo(() => buildWeekScheduleSnapshot(), []);
  const [pageView, setPageView] = useState<CourseV2PageViewMode>('overview');
  const [weekScheduleMode, setWeekScheduleMode] = useState<WeekScheduleInitialMode>('default');
  const [pendingNewSchedule, setPendingNewSchedule] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerSessionId, setDrawerSessionId] = useState<string | null>(null);
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);

  const showToast = useCallback((message: string) => {
    console.log('[CourseV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

  const openWeekSchedule = useCallback(
    (mode: WeekScheduleInitialMode = 'default', openNewSchedule = false) => {
      setWeekScheduleMode(mode);
      setPendingNewSchedule(openNewSchedule);
      setPageView('weekSchedule');
    },
    [],
  );

  const backToOverview = useCallback(() => {
    setPageView('overview');
    setWeekScheduleMode('default');
    setPendingNewSchedule(false);
  }, []);

  const openNewScheduleDrawer = useCallback(() => {
    setNewScheduleOpen(true);
  }, []);

  const closeNewScheduleDrawer = useCallback(() => {
    setNewScheduleOpen(false);
  }, []);

  useEffect(() => {
    if (pageView === 'weekSchedule' && pendingNewSchedule) {
      setNewScheduleOpen(true);
      setPendingNewSchedule(false);
    }
  }, [pageView, pendingNewSchedule]);

  const handlePriorityAction = useCallback(
    (item: CoursePriorityAction) => {
      if (item.opensWeekSchedule) {
        openWeekSchedule(
          resolveWeekScheduleMode(item.id),
          Boolean(item.openNewSchedule),
        );
        return;
      }
      showToast(item.ctaToast);
    },
    [openWeekSchedule, showToast],
  );

  const handleDetailEntry = useCallback(
    (entry: CourseDetailEntry) => {
      if (entry.opensWeekSchedule) {
        openWeekSchedule(
          resolveWeekScheduleMode(entry.id),
          Boolean(entry.openNewSchedule),
        );
        return;
      }
      showToast(entry.toastMessage);
    },
    [openWeekSchedule, showToast],
  );

  const handleAction = useCallback(
    (label: string) => {
      const message =
        label.includes('（待建设）') || label.startsWith('进入 ')
          ? label
          : `${label}（待建设）`;
      showToast(message);
    },
    [showToast],
  );

  const openDrawer = useCallback((sessionId: string) => {
    setDrawerSessionId(sessionId);
  }, []);

  const closeDrawer = useCallback(() => setDrawerSessionId(null), []);

  const drawerDetail: CourseV2Detail | null = drawerSessionId
    ? snapshot.courseDetailMap[drawerSessionId] ?? null
    : null;

  const handleSessionAction = useCallback(
    (sess: CourseV2Session, e?: React.MouseEvent) => {
      e?.stopPropagation();
      openDrawer(sess.id);
    },
    [openDrawer],
  );

  const {
    meta,
    filters,
    viewTabs,
    courseSupplySummary,
    coursePriorityActions,
    consumptionSupply,
    courseIssueCategories,
    weeklyScheduleSummary,
    teacherSupplyLinks,
    courseTypePerformanceSummary,
    courseDetailEntries,
  } = snapshot;

  const cs = drawerDetail?.consumptionSummary;
  const ex = drawerDetail?.exceptionSummary;

  return (
    <div className="met-course-v2">
      {pageView === 'weekSchedule' ? (
        <CourseSecondaryWeekSchedulePage
          initialMode={weekScheduleMode}
          onBack={backToOverview}
          onOpenDetail={openDrawer}
          onOpenNewSchedule={openNewScheduleDrawer}
          onToast={showToast}
        />
      ) : (
      <div className="met-course-v2__inner">
        <header className="met-course-v2__header">
          <div className="met-course-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-course-v2__header-actions">
            <div className="met-course-v2__filters">
              <button
                type="button"
                className="met-course-v2__filter-btn"
                onClick={() => handleAction('切换门店筛选')}
              >
                门店：{filters.storeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn"
                onClick={() => handleAction('切换周期筛选')}
              >
                周期：{filters.periodLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn"
                onClick={() => handleAction('切换课程类型筛选')}
              >
                课程类型：{filters.courseTypeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn"
                onClick={() => handleAction('切换老师筛选')}
              >
                老师：{filters.teacherLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn met-course-v2__filter-btn--ghost met-course-v2__detail-link"
                onClick={() => openWeekSchedule()}
              >
                {filters.weekScheduleListLabel}
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn met-course-v2__filter-btn--ghost"
                onClick={() => showToast('打开排课规则配置（待建设）')}
              >
                {filters.secondaryActionLabel}
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn met-course-v2__filter-btn--primary"
                onClick={() => openWeekSchedule('default', true)}
              >
                {filters.primaryActionLabel}
              </button>
            </div>
            <div className="met-course-v2__view-entries">
              <span className="met-course-v2__view-entries-label">视图入口</span>
              {viewTabs.map(tab => {
                const entry = VIEW_ENTRY_META[tab.id];
                if (entry.isCurrent) {
                  return (
                    <span
                      key={tab.id}
                      className="met-course-v2__view-entry met-course-v2__view-entry--current"
                    >
                      {entry.label}
                      <span className="met-course-v2__view-entry-badge">当前</span>
                    </span>
                  );
                }
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="met-course-v2__view-entry met-course-v2__view-entry--link"
                    onClick={() => showToast(entry.toast)}
                  >
                    {entry.label}
                    <span className="met-course-v2__view-entry-badge is-pending">待建设</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* 1. 课程供给结论 */}
        <section className="met-course-v2-zone met-course-v2-zone--hero">
          <article className="met-course-v2-panel met-course-v2-panel--hero">
            <div className="met-course-v2-hero__head">
              <h2 className="met-course-v2-hero__headline">{courseSupplySummary.headline}</h2>
              <span
                className={[
                  'met-course-v2-status-pill',
                  getCourseSupplyStatusClass(courseSupplySummary.status),
                ].join(' ')}
              >
                {courseSupplySummary.statusLabel}
              </span>
            </div>
            <p className="met-course-v2-hero__text">{courseSupplySummary.conclusion}</p>
            <div className="met-course-v2-hero__tags">
              {courseSupplySummary.impactTags.map(tag => (
                <span key={tag} className="met-course-v2-tag met-course-v2-tag--impact">
                  {tag}
                </span>
              ))}
              <span className="met-course-v2-tag met-course-v2-tag--source">
                {courseSupplySummary.sourceLabel}
              </span>
            </div>
            <p className="met-course-v2-hero__meta">
              最近更新时间：{courseSupplySummary.updatedAt}
            </p>
            <div className="met-course-v2-evidence-grid met-course-v2-evidence-grid--hero">
              {courseSupplySummary.evidenceItems.map(item => (
                <div
                  key={item.label}
                  className={[
                    'met-course-v2-evidence-item',
                    item.isWarning ? 'is-warning' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="met-course-v2-evidence-item__value">{item.value}</span>
                  <span className="met-course-v2-evidence-item__label">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="met-course-v2-hero__actions">
              <button
                type="button"
                className="met-course-v2-btn met-course-v2-btn--ghost"
                onClick={() => showToast(courseSupplySummary.evidenceToastMessage)}
              >
                {courseSupplySummary.evidenceButtonLabel}
              </button>
            </div>
          </article>
        </section>

        {/* 2. 本周排课优先动作 */}
        <section className="met-course-v2-zone met-course-v2-zone--priority">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{coursePriorityActions.title}</h2>
            <p className="met-course-v2-zone__subtitle">{coursePriorityActions.subtitle}</p>
          </header>
          <div className="met-course-v2-action-queue">
            {coursePriorityActions.items.map(item => (
              <div
                key={item.id}
                className={`met-course-v2-action-item met-course-v2-action-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-course-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-course-v2-action-item__main">
                  <p className="met-course-v2-action-item__title">{item.title}</p>
                  <p className="met-course-v2-action-item__meta">
                    影响：{item.impact} · 负责人：{item.owner} · 来源：
                    {item.sourceModules.join(' / ')}
                  </p>
                  <p className="met-course-v2-action-item__action">
                    建议动作：{item.suggestedAction}
                  </p>
                </div>
                <button
                  type="button"
                  className="met-course-v2-btn met-course-v2-btn--sm met-course-v2-btn--ghost"
                  onClick={() => handlePriorityAction(item)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 耗课目标与课程供给 */}
        <section className="met-course-v2-zone met-course-v2-zone--consumption">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{consumptionSupply.title}</h2>
            <p className="met-course-v2-zone__subtitle">{consumptionSupply.subtitle}</p>
          </header>
          <div className="met-course-v2-consumption-grid">
            {consumptionSupply.cards.map(card => (
              <article
                key={card.id}
                className={[
                  'met-course-v2-consumption-card',
                  getConsumptionCardStatusClass(card.status),
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <h3 className="met-course-v2-consumption-card__title">{card.title}</h3>
                <div className="met-course-v2-consumption-card__metrics">
                  {card.metrics.map(metric => (
                    <div key={metric.label} className="met-course-v2-consumption-card__metric">
                      <span className="met-course-v2-consumption-card__metric-label">
                        {metric.label}
                      </span>
                      <span className="met-course-v2-consumption-card__metric-value">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="met-course-v2-consumption-card__conclusion">{card.conclusion}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 4. 课程问题分类 */}
        <section className="met-course-v2-zone met-course-v2-zone--issues">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{courseIssueCategories.title}</h2>
            <p className="met-course-v2-zone__subtitle">{courseIssueCategories.subtitle}</p>
          </header>
          <div className="met-course-v2-issue-cat-grid">
            {courseIssueCategories.items.map(item => (
              <article key={item.id} className="met-course-v2-issue-cat">
                <div className="met-course-v2-issue-cat__head">
                  <h3 className="met-course-v2-issue-cat__title">{item.title}</h3>
                  <span
                    className={[
                      'met-course-v2-issue-cat__status',
                      getIssueCategoryStatusClass(item.statusLabel),
                    ].join(' ')}
                  >
                    {item.statusLabel}
                  </span>
                </div>
                <p className="met-course-v2-issue-cat__issue">{item.representativeIssue}</p>
                <p className="met-course-v2-issue-cat__action">{item.suggestedAction}</p>
                <button
                  type="button"
                  className="met-course-v2-btn met-course-v2-btn--sm"
                  onClick={() => showToast(item.entryToast)}
                >
                  {item.entryLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 5. 本周排课摘要 */}
        <article className="met-course-v2-zone met-course-v2-zone--summary">
          <header className="met-course-v2-zone__head met-course-v2-zone__head--compact">
            <h2 className="met-course-v2-zone__title met-course-v2-zone__title--secondary">
              {weeklyScheduleSummary.title}
            </h2>
            <p className="met-course-v2-zone__subtitle">{weeklyScheduleSummary.subtitle}</p>
          </header>
          <div className="met-course-v2-lanes met-course-v2-lanes--summary">
            {weeklyScheduleSummary.days.map(day => (
              <div
                key={day.id}
                className={['met-course-v2-lane', day.id === 'day-fri' ? 'is-today' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="met-course-v2-lane__head">
                  <span className="met-course-v2-lane__day">{day.label}</span>
                  <span className="met-course-v2-lane__date">{day.dateLabel}</span>
                </div>
                {day.sessions.length > 0 ? (
                  day.sessions.map(sess => (
                    <SessionCard
                      key={sess.id}
                      sess={sess}
                      onOpen={openDrawer}
                      onAction={handleSessionAction}
                      compact
                    />
                  ))
                ) : (
                  <p className="met-course-v2-lane__empty">暂无关键课程</p>
                )}
              </div>
            ))}
          </div>
          <div className="met-course-v2-zone__foot">
            <button
              type="button"
              className="met-course-v2-btn met-course-v2-btn--ghost met-course-v2__detail-link"
              onClick={() => openWeekSchedule()}
            >
              {weeklyScheduleSummary.viewAllLabel}
            </button>
          </div>
        </article>

        {/* 6. 老师供给联动 */}
        <section className="met-course-v2-zone met-course-v2-zone--teachers">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{teacherSupplyLinks.title}</h2>
            <p className="met-course-v2-zone__subtitle">{teacherSupplyLinks.subtitle}</p>
          </header>
          <div className="met-course-v2-teacher-link-grid">
            {teacherSupplyLinks.teachers.map(teacher => (
              <article key={teacher.id} className="met-course-v2-teacher-link-card">
                <div className="met-course-v2-teacher-link-card__head">
                  <h3 className="met-course-v2-teacher-link-card__name">{teacher.name}</h3>
                  <span className="met-course-v2-teacher-link-card__status">
                    {teacher.statusLabel}
                  </span>
                </div>
                <p className="met-course-v2-teacher-link-card__courses">
                  可授课程：{teacher.teachableCourses}
                </p>
                <p className="met-course-v2-teacher-link-card__note">{teacher.riskOrNote}</p>
                <p className="met-course-v2-teacher-link-card__action">
                  建议动作：{teacher.suggestedAction}
                </p>
              </article>
            ))}
          </div>
          <div className="met-course-v2-zone__foot">
            <button
              type="button"
              className="met-course-v2-btn met-course-v2-btn--ghost"
              onClick={() => showToast(teacherSupplyLinks.ctaToast)}
            >
              {teacherSupplyLinks.ctaLabel}
            </button>
          </div>
        </section>

        {/* 7. 课程类型表现与补员入口 */}
        <section className="met-course-v2-zone met-course-v2-zone--performance">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{courseTypePerformanceSummary.title}</h2>
            <p className="met-course-v2-zone__subtitle">{courseTypePerformanceSummary.subtitle}</p>
          </header>
          <div className="met-course-v2-type-perf-grid">
            {courseTypePerformanceSummary.items.map(item => (
              <article key={item.id} className="met-course-v2-type-perf-card">
                <h3 className="met-course-v2-type-perf-card__type">{item.courseType}</h3>
                <div className="met-course-v2-type-perf-card__stats">
                  <span>本周 {item.weeklySessions}</span>
                  <span>满班率 {item.fillRate}</span>
                  <span>耗课 {item.consumptionContribution}</span>
                </div>
                <p className="met-course-v2-type-perf-card__issue">问题：{item.issue}</p>
                <p className="met-course-v2-type-perf-card__action">{item.suggestedAction}</p>
                <button
                  type="button"
                  className="met-course-v2-btn met-course-v2-btn--sm"
                  onClick={() => showToast(item.fillMemberToast)}
                >
                  {item.fillMemberLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 8. 排课明细入口 */}
        <section className="met-course-v2-zone met-course-v2-zone--entries">
          <header className="met-course-v2-zone__head met-course-v2-zone__head--compact">
            <h2 className="met-course-v2-zone__title met-course-v2-zone__title--secondary">
              {courseDetailEntries.title}
            </h2>
          </header>
          <div className="met-course-v2-entry-grid">
            {courseDetailEntries.items.map(entry => (
              <button
                key={entry.id}
                type="button"
                className={[
                  'met-course-v2-entry-card',
                  entry.opensWeekSchedule ? 'met-course-v2-entry-card--accent' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleDetailEntry(entry)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      )}

      {drawerSessionId ? (
        <>
          <button
            type="button"
            className="met-course-v2-drawer-overlay met-v2-drawer-overlay"
            aria-label="关闭课程详情"
            onClick={closeDrawer}
          />
          <aside
            className="met-course-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md"
            role="dialog"
            aria-labelledby="course-v2-drawer-title"
          >
            <div className="met-course-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2
                  id="course-v2-drawer-title"
                  className="met-course-v2-drawer__title met-v2-drawer-title"
                >
                  {drawerDetail?.title ?? '暂无详情'}
                </h2>
                {drawerDetail?.subtitle ? (
                  <p className="met-course-v2-drawer__subtitle met-v2-drawer-subtitle">
                    {drawerDetail.subtitle}
                  </p>
                ) : (
                  <p className="met-course-v2-drawer__subtitle met-v2-drawer-subtitle">
                    当前记录缺少详情数据
                  </p>
                )}
              </div>
              <button
                type="button"
                className="met-course-v2-drawer__close met-v2-drawer-close"
                aria-label="关闭"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>
            <div className="met-course-v2-drawer__body met-v2-drawer-body">
              {drawerDetail && cs ? (
                <>
                  {ex ? (
                    <section className="met-course-v2-drawer__section met-course-v2-drawer__section--exception">
                      <h3 className="met-course-v2-drawer__section-title">异常处理摘要</h3>
                      <div className="met-course-v2-exception-summary">
                        <div className="met-course-v2-exception-summary__row">
                          <span>异常原因</span>
                          <strong>{ex.reason}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row">
                          <span>当前耗课</span>
                          <strong>{ex.currentConsumption}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row met-course-v2-exception-summary__row--highlight">
                          <span>可补空间</span>
                          <strong>{ex.fillableSpace}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row">
                          <span>建议动作</span>
                          <strong>{ex.suggestionAction}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row">
                          <span>建议来源</span>
                          <strong>{ex.suggestionSource}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row">
                          <span>负责人</span>
                          <strong>{ex.owner}</strong>
                        </div>
                        <div className="met-course-v2-exception-summary__row">
                          <span>处理状态</span>
                          <span className="met-course-v2-exception-summary__status">
                            {ex.status}
                          </span>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">课程概览</h3>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">课程名称</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.courseName}
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">老师</span>
                      <span className="met-course-v2-drawer__row-value">{drawerDetail.teacher}</span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">教室</span>
                      <span className="met-course-v2-drawer__row-value">{drawerDetail.room}</span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">时间</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.timeRange}
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">容量</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.capacity} 人
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">当前预约</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.booked} 人
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">候补</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.waitlistCount} 人
                      </span>
                    </div>
                    <span
                      className={[
                        'met-course-v2-status',
                        getCourseStatusClass(drawerDetail.status),
                      ].join(' ')}
                    >
                      {drawerDetail.statusLabel}
                    </span>
                  </section>

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">耗课结构</h3>
                    <div className="met-course-v2-consumption-bar">
                      <div
                        className="met-course-v2-consumption-bar__fill"
                        style={{
                          width: `${(cs.bookedConsumptionPoints / cs.fullConsumptionPoints) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="met-course-v2-consumption-bar__label">
                      当前预约预计耗课 {cs.bookedConsumptionPoints} / {cs.fullConsumptionPoints} 点
                    </p>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">单人扣点</span>
                      <span className="met-course-v2-drawer__row-value">{cs.pointPerPerson} 点</span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">理论满班耗课</span>
                      <span className="met-course-v2-drawer__row-value">
                        {cs.fullConsumptionPoints} 点
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">历史到课率</span>
                      <span className="met-course-v2-drawer__row-value">
                        {Math.round(cs.historicalAttendanceRate * 100)}%
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">预计到课耗课</span>
                      <span className="met-course-v2-drawer__row-value">
                        {cs.predictedAttendanceConsumptionPoints} 点
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row met-course-v2-drawer__row--highlight">
                      <span className="met-course-v2-drawer__row-label">剩余可补耗课空间</span>
                      <span className="met-course-v2-drawer__row-value">
                        {cs.remainingConsumptionSpace} 点
                      </span>
                    </div>
                    <p className="met-course-v2-consumption-note">{cs.consumptionNote}</p>
                  </section>

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">名单与预约</h3>
                    {drawerDetail.roster.map(member => (
                      <div key={member.id} className="met-course-v2-roster-item">
                        <div className="met-course-v2-roster-item__head">
                          <span className="met-course-v2-roster-item__name">{member.name}</span>
                          <span className="met-course-v2-tag">{member.checkinStatus}</span>
                        </div>
                        <p className="met-course-v2-roster-item__meta">
                          {member.stageLabel} · {member.cardSummary} · {member.tag}
                        </p>
                      </div>
                    ))}
                  </section>

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">签到与核销</h3>
                    <div className="met-course-v2-checkin-grid">
                      <div className="met-course-v2-checkin-stat">
                        <span className="met-course-v2-checkin-stat__num">
                          {drawerDetail.checkin.checkedIn}
                        </span>
                        <span className="met-course-v2-checkin-stat__label">已签到</span>
                      </div>
                      <div className="met-course-v2-checkin-stat">
                        <span className="met-course-v2-checkin-stat__num">
                          {drawerDetail.checkin.pendingCheckin}
                        </span>
                        <span className="met-course-v2-checkin-stat__label">待签到</span>
                      </div>
                      <div className="met-course-v2-checkin-stat">
                        <span className="met-course-v2-checkin-stat__num">
                          {drawerDetail.checkin.pendingResign}
                        </span>
                        <span className="met-course-v2-checkin-stat__label">待补签</span>
                      </div>
                    </div>
                    <div className="met-course-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
                      <button
                        type="button"
                        className="met-v2-drawer-footer-btn"
                        onClick={() => handleAction('扫码核销')}
                      >
                        扫码核销
                      </button>
                      <button
                        type="button"
                        className="met-v2-drawer-footer-btn"
                        onClick={() => handleAction('手动签到')}
                      >
                        手动签到
                      </button>
                      <button
                        type="button"
                        className="met-v2-drawer-footer-btn"
                        onClick={() => showToast('进入签到处理（待建设）')}
                      >
                        标记爽约
                      </button>
                    </div>
                  </section>

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">补员建议</h3>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">推荐匹配会员</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.recommendation.recommendedCount} 人
                      </span>
                    </div>
                    <div className="met-course-v2-drawer__row">
                      <span className="met-course-v2-drawer__row-label">高匹配</span>
                      <span className="met-course-v2-drawer__row-value">
                        {drawerDetail.recommendation.highMatchCount} 人
                      </span>
                    </div>
                    <button
                      type="button"
                      className="met-v2-drawer-footer-btn"
                      style={{ marginTop: 10 }}
                      onClick={() => showToast('进入会员经营匹配名单（待建设）')}
                    >
                      {drawerDetail.recommendation.actionLabel}
                    </button>
                  </section>

                  <section className="met-course-v2-drawer__section">
                    <h3 className="met-course-v2-drawer__section-title">异常记录</h3>
                    <div className="met-course-v2-drawer__tags">
                      {drawerDetail.exceptions.map(exItem => (
                        <span key={exItem.label} className="met-course-v2-tag">
                          {exItem.label}
                        </span>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <V2DrawerEmpty onClose={closeDrawer} />
              )}
            </div>
          </aside>
        </>
      ) : null}

      {newScheduleOpen ? (
        <NewScheduleDrawer
          draft={weekScheduleSnapshot.newScheduleDraft}
          disclaimer={weekScheduleSnapshot.meta.newScheduleDisclaimer}
          submitToast={weekScheduleSnapshot.meta.submitToast}
          saveDraftToast={weekScheduleSnapshot.meta.saveDraftToast}
          onClose={closeNewScheduleDrawer}
          onToast={showToast}
        />
      ) : null}

      {toast ? <div className="met-course-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default CourseV2Page;
