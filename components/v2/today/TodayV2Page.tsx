import React, { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  QrCode,
  Users,
} from 'lucide-react';
import {
  buildTodayV2Snapshot,
  type TodayV2CourseStatusTone,
  type TodayV2PriorityLevel,
  type TodayV2QuickAction,
  type TodayV2SuggestionSource,
} from './todayV2.viewModel';
import './todayV2.css';

const PRIORITY_CLASS: Record<TodayV2PriorityLevel, string> = {
  P0: 'met-today-v2-priority--p0',
  P1: 'met-today-v2-priority--p1',
  P2: 'met-today-v2-priority--p2',
};

const SOURCE_TAG_CLASS: Record<TodayV2SuggestionSource, string> = {
  system_rule: 'met-today-v2-source-tag--rule',
  pending_config: 'met-today-v2-source-tag--pending',
};

const COURSE_STATUS_CLASS: Record<TodayV2CourseStatusTone, string> = {
  success: 'met-today-v2-course-status--success',
  warning: 'met-today-v2-course-status--warning',
  danger: 'met-today-v2-course-status--danger',
  neutral: 'met-today-v2-course-status--neutral',
  info: 'met-today-v2-course-status--info',
};

const MEMBER_ITEM_CLASS: Record<string, string> = {
  'mr-1': 'met-today-v2-member-item--service',
  'mr-2': 'met-today-v2-member-item--service',
  'mr-3': 'met-today-v2-member-item--care',
  'mr-4': 'met-today-v2-member-item--sales',
};

const QUICK_ACTION_ICON: Record<TodayV2QuickAction['icon'], React.ReactNode> = {
  scan: <QrCode size={16} aria-hidden />,
  users: <Users size={16} aria-hidden />,
  alert: <AlertTriangle size={16} aria-hidden />,
  list: <ClipboardList size={16} aria-hidden />,
};

const TodayV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildTodayV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[TodayV2]', message);
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  const {
    meta,
    courseTimeline,
    urgentNow,
    quickActions,
    dailyBrief,
    mustHandleToday,
    memberReminders,
    weeklyTasks,
  } = snapshot;

  return (
    <div className="met-today-v2">
      <div className="met-today-v2__inner">
        <header className="met-today-v2__header">
          <div className="met-today-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-today-v2__filters">
            <button
              type="button"
              className="met-today-v2__filter-btn"
              onClick={() => showToast('演示：切换门店')}
            >
              {meta.filters.storeLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-today-v2__filter-btn"
              onClick={() => showToast('演示：切换日期')}
            >
              {meta.filters.dateLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-today-v2__filter-btn met-today-v2__filter-btn--ghost"
              onClick={() => showToast('演示：扫码核销')}
            >
              <QrCode size={14} aria-hidden />
              {meta.filters.primaryActionLabel}
            </button>
          </div>
        </header>

        <section className="met-today-v2__war-room">
          <article className="met-today-v2-card met-today-v2-card--timeline">
            <h2 className="met-today-v2-card__title">{courseTimeline.title}</h2>
            <p className="met-today-v2-card__subtitle met-today-v2-card__subtitle--compact">
              {courseTimeline.subtitle}
            </p>
            <div className="met-today-v2-focus-status" aria-label="作战状态">
              <div className="met-today-v2-focus-status__item">
                <span className="met-today-v2-focus-status__label">
                  {courseTimeline.focusStatus.currentFocusLabel}
                </span>
                <span className="met-today-v2-focus-status__text">
                  {courseTimeline.focusStatus.currentFocusText}
                </span>
              </div>
              <div className="met-today-v2-focus-status__item is-next">
                <span className="met-today-v2-focus-status__label">
                  {courseTimeline.focusStatus.nextFocusLabel}
                </span>
                <span className="met-today-v2-focus-status__text">
                  {courseTimeline.focusStatus.nextFocusText}
                </span>
              </div>
            </div>
            <div className="met-today-v2-timeline">
              {courseTimeline.courses.map((course, index) => (
                <div
                  key={course.id}
                  className={[
                    'met-today-v2-timeline__item',
                    course.focusMarker === 'current' ? 'is-current-focus' : '',
                    course.focusMarker === 'next' ? 'is-next-focus' : '',
                    course.statusTone === 'danger' ? 'has-anomaly' : '',
                    course.statusTone === 'warning' ? 'has-watch' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="met-today-v2-timeline__rail" aria-hidden>
                    <span className="met-today-v2-timeline__dot" />
                    {index < courseTimeline.courses.length - 1 ? (
                      <span className="met-today-v2-timeline__line" />
                    ) : null}
                  </div>
                  <div className="met-today-v2-timeline__content">
                    <div className="met-today-v2-timeline__head">
                      <span className="met-today-v2-timeline__time">{course.time}</span>
                      {course.focusMarker === 'current' ? (
                        <span className="met-today-v2-timeline__focus-tag">当前关注</span>
                      ) : null}
                      {course.focusMarker === 'next' ? (
                        <span className="met-today-v2-timeline__focus-tag is-next">下一重点</span>
                      ) : null}
                      <span className={`met-today-v2-course-status ${COURSE_STATUS_CLASS[course.statusTone]}`}>
                        {course.status}
                      </span>
                    </div>
                    <p className="met-today-v2-timeline__title">
                      <span className="met-today-v2-timeline__course">{course.courseName}</span>
                      <span className="met-today-v2-timeline__teacher">{course.teacherName}</span>
                    </p>
                    <p className="met-today-v2-timeline__meta">
                      {course.bookedCount}/{course.capacity} 人
                    </p>
                  </div>
                  <button
                    type="button"
                    className="met-today-v2-btn met-today-v2-btn--ghost met-today-v2-btn--sm"
                    onClick={() => showToast(`演示：${course.actionLabel} · ${course.time} ${course.courseName}`)}
                  >
                    {course.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <aside className="met-today-v2__sidebar">
            <article className="met-today-v2-card met-today-v2-card--urgent">
              <h2 className="met-today-v2-card__title">{urgentNow.title}</h2>
              <div className="met-today-v2-urgent-list">
                {urgentNow.tasks.map(task => (
                <div
                  key={task.id}
                  className={`met-today-v2-urgent-item met-today-v2-urgent-item--${task.priority.toLowerCase()}`}
                >
                    <div className="met-today-v2-urgent-item__main">
                      <div className="met-today-v2-urgent-item__head">
                        <span className={`met-today-v2-priority ${PRIORITY_CLASS[task.priority]}`}>
                          {task.priority}
                        </span>
                        <p className="met-today-v2-urgent-item__title">{task.title}</p>
                      </div>
                      <p className="met-today-v2-urgent-item__meta">
                        <span className="met-today-v2-urgent-item__deadline">
                          截止 {task.deadline}
                        </span>
                        <span>· 负责人 {task.ownerShort}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="met-today-v2-btn met-today-v2-btn--ghost met-today-v2-btn--sm"
                      onClick={() => showToast(`演示：${task.actionLabel} · ${task.title}`)}
                    >
                      {task.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="met-today-v2-card met-today-v2-card--tools">
              <h2 className="met-today-v2-card__title">{quickActions.title}</h2>
              <div className="met-today-v2-quick__grid">
                {quickActions.actions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    className="met-today-v2-quick__btn"
                    onClick={() => showToast(`演示：${action.label}`)}
                  >
                    {QUICK_ACTION_ICON[action.icon]}
                    {action.label}
                  </button>
                ))}
              </div>
            </article>

            <article className="met-today-v2-card met-today-v2-card--brief">
              <h2 className="met-today-v2-card__title">{dailyBrief.title}</h2>
              <div className="met-today-v2-brief-stats">
                {dailyBrief.stats.map(stat => (
                  <div key={stat.id} className="met-today-v2-brief-stat">
                    <span className="met-today-v2-brief-stat__label">{stat.label}</span>
                    <span
                      className={`met-today-v2-brief-stat__value${stat.isWarning ? ' is-warning' : ''}`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="met-today-v2__row-orders">
          <article className="met-today-v2-card met-today-v2-card--orders">
            <h2 className="met-today-v2-card__title">{mustHandleToday.title}</h2>
            <p className="met-today-v2-card__subtitle met-today-v2-card__subtitle--compact">
              {mustHandleToday.subtitle}
            </p>
            <div className="met-today-v2-order-list">
              {mustHandleToday.tasks.map(task => (
                <div
                  key={task.id}
                  className={`met-today-v2-order-row met-today-v2-order-row--${task.priority.toLowerCase()}`}
                >
                  <span className={`met-today-v2-priority ${PRIORITY_CLASS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <div className="met-today-v2-order-row__body">
                    <p className="met-today-v2-order-row__title">{task.title}</p>
                    <p className="met-today-v2-order-row__fact">{task.fact}</p>
                    <p className="met-today-v2-order-row__meta">
                      负责人 {task.owner} · 截止 {task.deadline}
                    </p>
                  </div>
                  <div className="met-today-v2-order-row__aside">
                    <span className={`met-today-v2-source-tag ${SOURCE_TAG_CLASS[task.suggestionSource]}`}>
                      {task.suggestionSourceLabel}
                    </span>
                    <button
                      type="button"
                      className="met-today-v2-btn met-today-v2-btn--ghost met-today-v2-btn--sm"
                      onClick={() => showToast(`演示：${task.actionLabel} · ${task.title}`)}
                    >
                      {task.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="met-today-v2__row-bottom">
          <article className="met-today-v2-card met-today-v2-card--members">
            <h2 className="met-today-v2-card__title">{memberReminders.title}</h2>
            <p className="met-today-v2-card__subtitle met-today-v2-card__subtitle--compact">
              {memberReminders.subtitle}
            </p>
            <div className="met-today-v2-member-list">
              {memberReminders.items.map(item => (
                <div
                  key={item.id}
                  className={[
                    'met-today-v2-member-item',
                    MEMBER_ITEM_CLASS[item.id] ?? '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div>
                    <p className="met-today-v2-member-item__label">{item.label}</p>
                    <p className="met-today-v2-member-item__value">{item.value}</p>
                    <p className="met-today-v2-member-item__note">{item.note}</p>
                  </div>
                  <button
                    type="button"
                    className="met-today-v2-btn met-today-v2-btn--ghost met-today-v2-btn--sm"
                    onClick={() => showToast(`演示：${item.actionLabel} · ${item.label}`)}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="met-today-v2-card met-today-v2-card--weekly">
            <h2 className="met-today-v2-card__title">{weeklyTasks.title}</h2>
            <p className="met-today-v2-card__subtitle met-today-v2-card__subtitle--compact">
              {weeklyTasks.subtitle}
            </p>
            <div className="met-today-v2-weekly-list">
              {weeklyTasks.tasks.map(task => (
                <div key={task.id} className="met-today-v2-weekly-item">
                  <div className="met-today-v2-weekly-item__head">
                    <span className={`met-today-v2-priority ${PRIORITY_CLASS[task.priority]}`}>
                      {task.priority}
                    </span>
                    <p className="met-today-v2-weekly-item__title">{task.title}</p>
                  </div>
                  <p className="met-today-v2-weekly-item__summary">{task.summary}</p>
                  <button
                    type="button"
                    className="met-today-v2-btn met-today-v2-btn--ghost met-today-v2-btn--sm"
                    onClick={() => showToast(`演示：${task.actionLabel} · ${task.title}`)}
                  >
                    {task.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>

      {toast ? (
        <div className="met-today-v2-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default TodayV2Page;
