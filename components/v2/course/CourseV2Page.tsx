import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildCourseV2Snapshot,
  getCourseStatusClass,
  getHeatmapToneClass,
  getIndicatorDotCount,
  getResourceHintToneClass,
  getSupplyFocusToneClass,
  type CourseV2Detail,
  type CourseV2HeatmapCell,
  type CourseV2IssueItem,
  type CourseV2Priority,
  type CourseV2ScheduleDiagnosisItem,
  type CourseV2Session,
  type CourseV2SuggestionSource,
  type CourseV2SupplyFocusItem,
  type CourseV2ViewMode,
} from './courseV2.viewModel';
import './courseV2.css';

const SOURCE_TAG_CLASS: Record<CourseV2SuggestionSource, string> = {
  system_rule: 'met-course-v2-source-tag--rule',
  pending_config: 'met-course-v2-source-tag--pending',
};

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
}: {
  sess: CourseV2Session;
  onOpen: (id: string) => void;
  onAction: (sess: CourseV2Session, e?: React.MouseEvent) => void;
}) {
  const cls = [
    'met-course-v2-session',
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

function SupplyFocusCard({
  item,
  onOpen,
  onAction,
}: {
  item: CourseV2SupplyFocusItem;
  onOpen: (id: string) => void;
  onAction: (item: CourseV2SupplyFocusItem, e?: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      className={['met-course-v2-supply-focus', getSupplyFocusToneClass(item.tone)].join(' ')}
      onClick={() => {
        if (item.relatedCourseId) {
          onOpen(item.relatedCourseId);
          return;
        }
        if (item.toastMessage) onAction(item);
      }}
    >
      <div className="met-course-v2-supply-focus__head">
        <span className={['met-course-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
          {item.priority}
        </span>
        <span className="met-course-v2-supply-focus__title">{item.title}</span>
        <span className={['met-course-v2-source-tag met-course-v2-source-tag--mini', SOURCE_TAG_CLASS[item.suggestionSource]].join(' ')}>
          {item.suggestionSourceLabel}
        </span>
      </div>
      <p className="met-course-v2-supply-focus__numbers">{item.coreNumbers}</p>
      <p className="met-course-v2-supply-focus__judgement">{item.judgement}</p>
      <span
        role="button"
        tabIndex={0}
        className="met-course-v2-btn met-course-v2-btn--sm met-course-v2-supply-focus__action"
        onClick={e => onAction(item, e)}
        onKeyDown={e => {
          if (e.key === 'Enter') onAction(item);
        }}
      >
        {item.actionLabel}
      </span>
    </button>
  );
}

function renderForecastConclusion(text: string, highlight: string) {
  const parts = text.split(highlight);
  if (parts.length === 1) return text;
  return parts.flatMap((part, index) => {
    const nodes: React.ReactNode[] = [];
    if (part) nodes.push(part);
    if (index < parts.length - 1) {
      nodes.push(
        <strong key={`hl-${index}`} className="met-course-v2-forecast-conclusion__highlight">
          {highlight}
        </strong>,
      );
    }
    return nodes;
  });
}

const CourseV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildCourseV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerSessionId, setDrawerSessionId] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[CourseV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

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

  const handleSupplyFocusAction = useCallback(
    (item: CourseV2SupplyFocusItem, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (item.toastMessage && !item.relatedCourseId) {
        showToast(item.toastMessage);
        return;
      }
      if (item.relatedCourseId) {
        openDrawer(item.relatedCourseId);
        return;
      }
      if (item.toastMessage) showToast(item.toastMessage);
    },
    [openDrawer, showToast],
  );

  const handleDiagnosisAction = useCallback(
    (item: CourseV2ScheduleDiagnosisItem) => {
      if (item.relatedSessionId) {
        openDrawer(item.relatedSessionId);
        return;
      }
      showToast(`${item.actionLabel}（待建设）`);
    },
    [openDrawer, showToast],
  );

  const handleIssueAction = useCallback(
    (item: CourseV2IssueItem) => {
      if (item.toastMessage) showToast(item.toastMessage);
      if (item.relatedSessionId) openDrawer(item.relatedSessionId);
    },
    [openDrawer, showToast],
  );

  const handleHeatmapCellClick = useCallback(
    (cell: CourseV2HeatmapCell) => {
      showToast(`查看 ${cell.day}${cell.timeSlot} 课程明细（待建设）`);
    },
    [showToast],
  );

  const {
    meta,
    filters,
    viewTabs,
    warroomSection,
    supplyFocus,
    weeklyForecast,
    scheduleDiagnosis,
    courseHeatmap,
    weekSchedule,
    adjustmentBasis,
    courseIssueQueue,
    teacherSupply,
    resourceHints,
    coursePerformance,
  } = snapshot;

  const heatmapCellMap = useMemo(() => {
    const map = new Map<string, CourseV2HeatmapCell>();
    courseHeatmap.cells.forEach(cell => {
      map.set(`${cell.day}-${cell.timeSlot}`, cell);
    });
    return map;
  }, [courseHeatmap.cells]);

  const cs = drawerDetail?.consumptionSummary;
  const ex = drawerDetail?.exceptionSummary;

  return (
    <div className="met-course-v2">
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
                className="met-course-v2__filter-btn met-course-v2__filter-btn--ghost"
                onClick={() => showToast('打开排课规则配置（待建设）')}
              >
                {filters.secondaryActionLabel}
              </button>
              <button
                type="button"
                className="met-course-v2__filter-btn met-course-v2__filter-btn--primary"
                onClick={() => handleAction('新增排课')}
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

        <section className="met-course-v2-zone met-course-v2-zone--judgment">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{warroomSection.title}</h2>
            <p className="met-course-v2-zone__subtitle">{warroomSection.subtitle}</p>
          </header>
          <div className="met-course-v2-zone__body met-course-v2__row-warroom">
            <div className="met-course-v2-panel met-course-v2-panel--focus">
              <h3 className="met-course-v2-panel__title">{supplyFocus.title}</h3>
              <div className="met-course-v2-supply-focus-list">
                {supplyFocus.items.map(item => (
                  <SupplyFocusCard
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                    onAction={handleSupplyFocusAction}
                  />
                ))}
              </div>
            </div>

            <aside className="met-course-v2-panel-group">
              <div className="met-course-v2-panel met-course-v2-panel--forecast">
                <h3 className="met-course-v2-panel__title">{weeklyForecast.title}</h3>
                <div className="met-course-v2-forecast-conclusion met-course-v2-forecast-conclusion--hero">
                  {renderForecastConclusion(weeklyForecast.conclusion, weeklyForecast.conclusionHighlight)}
                </div>
                <div className="met-course-v2-forecast-grid">
                  {weeklyForecast.metrics.map(metric => (
                    <div
                      key={metric.label}
                      className={[
                        'met-course-v2-forecast-item',
                        metric.isOpportunity ? 'is-opportunity' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="met-course-v2-forecast-item__value">{metric.value}</span>
                      <span className="met-course-v2-forecast-item__label">{metric.label}</span>
                    </div>
                  ))}
                </div>
                <p className="met-course-v2-forecast-note">{weeklyForecast.forecastNote}</p>
              </div>

              <div className="met-course-v2-panel met-course-v2-panel--diagnosis">
                <h3 className="met-course-v2-panel__title">{scheduleDiagnosis.title}</h3>
                <div className="met-course-v2-diagnosis-list met-course-v2-diagnosis-list--compact">
                  {scheduleDiagnosis.items.map(item => (
                    <div key={item.id} className={['met-course-v2-diagnosis-item', 'met-course-v2-diagnosis-item--compact', `met-course-v2-diagnosis-item--${item.priority.toLowerCase()}`].join(' ')}>
                      <p className="met-course-v2-diagnosis-item__title">
                        <span className={['met-course-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                          {item.priority}
                        </span>
                        {item.title}
                      </p>
                      <p className="met-course-v2-diagnosis-item__fact">{item.fact}</p>
                      <div className="met-course-v2-diagnosis-item__foot">
                        <span className={['met-course-v2-source-tag met-course-v2-source-tag--mini', SOURCE_TAG_CLASS[item.suggestionSource]].join(' ')}>
                          {item.suggestionSourceLabel}
                        </span>
                        <button type="button" className="met-course-v2-btn met-course-v2-btn--sm" onClick={() => handleDiagnosisAction(item)}>
                          {item.actionLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <article className="met-course-v2-zone met-course-v2-zone--heatmap">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{courseHeatmap.title}</h2>
            <p className="met-course-v2-zone__subtitle">{courseHeatmap.subtitle}</p>
          </header>
          <div className="met-course-v2-heatmap-conclusions">
            {courseHeatmap.insights.map(insight => (
              <div key={insight.id} className="met-course-v2-heatmap-conclusion">
                <p className="met-course-v2-heatmap-conclusion__title">{insight.title}</p>
                <p className="met-course-v2-heatmap-conclusion__summary">{insight.summary}</p>
              </div>
            ))}
          </div>
          <div className="met-course-v2-heatmap-legend">
            {courseHeatmap.legend.map(item => (
              <span key={item.label} className="met-course-v2-heatmap-legend__item">
                <span className={['met-course-v2-heatmap-legend__swatch', getHeatmapToneClass(item.tone)].join(' ')} />
                {item.label}
              </span>
            ))}
          </div>
          <div className="met-course-v2-heatmap-body">
            <div className="met-course-v2-heatmap-grid-wrap">
              <p className="met-course-v2-heatmap-section-label">时段耗课热力图</p>
              <div className="met-course-v2-heatmap-grid">
                <div className="met-course-v2-heatmap-grid__corner" />
                {courseHeatmap.dayLabels.map(day => (
                  <div key={day} className="met-course-v2-heatmap-grid__col-head">
                    {day}
                  </div>
                ))}
                {courseHeatmap.timeSlotLabels.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="met-course-v2-heatmap-grid__row-head">{slot}</div>
                    {courseHeatmap.dayLabels.map(day => {
                      const cell = heatmapCellMap.get(`${day}-${slot}`);
                      if (!cell) return null;
                      return (
                        <button
                          key={`${day}-${slot}`}
                          type="button"
                          className={['met-course-v2-heatmap-cell', getHeatmapToneClass(cell.tone)].join(' ')}
                          onClick={() => handleHeatmapCellClick(cell)}
                        >
                          <span className="met-course-v2-heatmap-cell__points">{cell.estimatedConsumption} 点</span>
                          <span className="met-course-v2-heatmap-cell__count">{cell.courseCount} 节</span>
                          <span className="met-course-v2-heatmap-cell__status">{cell.statusLabel}</span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="met-course-v2-heatmap-types">
              <p className="met-course-v2-heatmap-section-label">课程结构判断</p>
              <div className="met-course-v2-insight-cards">
                {courseHeatmap.typeInsightCards.map(card => (
                  <div key={card.id} className="met-course-v2-insight-card">
                    <div className="met-course-v2-insight-card__head">
                      <span className="met-course-v2-insight-card__type">{card.courseType}</span>
                      <span className="met-course-v2-insight-card__tag">{card.judgementTag}</span>
                    </div>
                    <p className="met-course-v2-insight-card__stats">
                      {card.estimatedConsumption} · 满课率 {card.fillRate} · {card.opportunity}
                    </p>
                    <div className="met-course-v2-insight-card__indicators">
                      {card.indicators.map(ind => (
                        <div key={ind.label} className="met-course-v2-indicator">
                          <span className="met-course-v2-indicator__label">{ind.label}</span>
                          <span className="met-course-v2-indicator__dots">
                            {[1, 2, 3].map(dot => (
                              <span
                                key={dot}
                                className={[
                                  'met-course-v2-indicator__dot',
                                  dot <= getIndicatorDotCount(ind.level) ? 'is-filled' : '',
                                ].filter(Boolean).join(' ')}
                              />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="met-course-v2-insight-card__judgment">{card.judgement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="met-course-v2-zone met-course-v2-zone--evidence">
          <header className="met-course-v2-zone__head met-course-v2-zone__head--compact">
            <h2 className="met-course-v2-zone__title met-course-v2-zone__title--secondary">{weekSchedule.title}</h2>
            <p className="met-course-v2-zone__subtitle">{weekSchedule.subtitle}</p>
          </header>
          <div className="met-course-v2-lanes">
            {weekSchedule.days.map(day => (
              <div key={day.id} className={['met-course-v2-lane', day.id === 'day-fri' ? 'is-today' : ''].filter(Boolean).join(' ')}>
                <div className="met-course-v2-lane__head">
                  <span className="met-course-v2-lane__day">{day.label}</span>
                  <span className="met-course-v2-lane__date">{day.dateLabel}</span>
                </div>
                {day.sessions.map(sess => (
                  <SessionCard
                    key={sess.id}
                    sess={sess}
                    onOpen={openDrawer}
                    onAction={handleSessionAction}
                  />
                ))}
              </div>
            ))}
          </div>
        </article>

        <section className="met-course-v2-zone met-course-v2-zone--basis">
          <header className="met-course-v2-zone__head">
            <h2 className="met-course-v2-zone__title">{adjustmentBasis.title}</h2>
            <p className="met-course-v2-zone__subtitle">{adjustmentBasis.subtitle}</p>
          </header>

          <div className="met-course-v2-zone__stack">
            <article className="met-course-v2-subcard met-course-v2-subcard--issues">
              <h3 className="met-course-v2-subcard__title">{courseIssueQueue.title}</h3>
              <div className="met-course-v2-issue-list">
                {courseIssueQueue.items.map(item => (
                  <div key={item.id} className={['met-course-v2-issue-row', `met-course-v2-issue-row--${item.priority.toLowerCase()}`].join(' ')}>
                    <span className={['met-course-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>{item.priority}</span>
                    <div className="met-course-v2-issue-row__main">
                      <p className="met-course-v2-issue-row__title">{item.title}</p>
                      <p className="met-course-v2-issue-row__fact">{item.fact}</p>
                      <p className="met-course-v2-issue-row__action">{item.suggestionAction}</p>
                    </div>
                    <div className="met-course-v2-issue-row__aside">
                      <span className={['met-course-v2-source-tag met-course-v2-source-tag--mini', SOURCE_TAG_CLASS[item.suggestionSource]].join(' ')}>
                        {item.suggestionSourceLabel}
                      </span>
                      <button type="button" className="met-course-v2-btn met-course-v2-btn--sm" onClick={() => handleIssueAction(item)}>
                        {item.actionLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="met-course-v2__row-resources">
              <article className="met-course-v2-subcard met-course-v2-subcard--teachers">
                <h3 className="met-course-v2-subcard__title">{teacherSupply.title}</h3>
                <div className="met-course-v2-teacher-grid">
                  {teacherSupply.teachers.map(teacher => (
                    <div key={teacher.id} className="met-course-v2-teacher-card">
                      <h4 className="met-course-v2-teacher-card__name">{teacher.name}</h4>
                      <p className="met-course-v2-teacher-card__stats">
                        {teacher.weeklySessions} · 预计 {teacher.estimatedConsumption} / 满班 {teacher.theoreticalConsumption}
                        <br />
                        晚高峰 {teacher.peakSessions} · {teacher.statusLabel}
                      </p>
                      <div className="met-course-v2-teacher-card__load">
                        <div
                          className={['met-course-v2-teacher-card__load-fill', teacher.loadPercent >= 80 ? 'is-high' : ''].filter(Boolean).join(' ')}
                          style={{ width: `${teacher.loadPercent}%` }}
                        />
                      </div>
                      <p className="met-course-v2-teacher-card__note">{teacher.availabilityNote}</p>
                      <div className="met-course-v2-teacher-card__foot">
                        <button
                          type="button"
                          className="met-course-v2-btn met-course-v2-btn--sm"
                          onClick={() =>
                            showToast(
                              teacher.actionLabel === '调整'
                                ? '进入老师供给调整（待建设）'
                                : `${teacher.actionLabel}（待建设）`,
                            )
                          }
                        >
                          {teacher.actionLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="met-course-v2-subcard met-course-v2-subcard--resources">
                <h3 className="met-course-v2-subcard__title">{resourceHints.title}</h3>
                <ul className="met-course-v2-resource-list">
                  {resourceHints.items.map(item => (
                    <li
                      key={item.id}
                      className={['met-course-v2-resource-item', getResourceHintToneClass(item.tone)].join(' ')}
                    >
                      <span className="met-course-v2-resource-item__title">{item.title}</span>
                      <span className="met-course-v2-resource-item__desc">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

            <article className="met-course-v2-subcard met-course-v2-subcard--performance">
              <h3 className="met-course-v2-subcard__title">{coursePerformance.title}</h3>
              <div className="met-course-v2-perf-grid">
                {coursePerformance.items.map(item => (
                  <div key={item.id} className="met-course-v2-perf-card">
                    <h4 className="met-course-v2-perf-card__type">{item.courseType}</h4>
                    <div className="met-course-v2-perf-card__rate">{item.estimatedConsumption}</div>
                    <p className="met-course-v2-perf-card__meta">
                      {item.weeklySessions} · 满课率 {item.fillRate} · 可补 {item.fillableSpace}
                    </p>
                    <p className="met-course-v2-perf-card__judgment">{item.judgment}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>

      {drawerSessionId ? (
        <>
          <button type="button" className="met-course-v2-drawer-overlay met-v2-drawer-overlay" aria-label="关闭课程详情" onClick={closeDrawer} />
          <aside className="met-course-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog" aria-labelledby="course-v2-drawer-title">
            <div className="met-course-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="course-v2-drawer-title" className="met-course-v2-drawer__title met-v2-drawer-title">
                  {drawerDetail?.title ?? '暂无详情'}
                </h2>
                {drawerDetail?.subtitle ? (
                  <p className="met-course-v2-drawer__subtitle met-v2-drawer-subtitle">{drawerDetail.subtitle}</p>
                ) : (
                  <p className="met-course-v2-drawer__subtitle met-v2-drawer-subtitle">当前记录缺少详情数据</p>
                )}
              </div>
              <button type="button" className="met-course-v2-drawer__close met-v2-drawer-close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-course-v2-drawer__body met-v2-drawer-body">
              {drawerDetail && cs ? (
                <>
              {ex ? (
                <section className="met-course-v2-drawer__section met-course-v2-drawer__section--exception">
                  <h3 className="met-course-v2-drawer__section-title">异常处理摘要</h3>
                  <div className="met-course-v2-exception-summary">
                    <div className="met-course-v2-exception-summary__row">
                      <span>异常原因</span><strong>{ex.reason}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row">
                      <span>当前耗课</span><strong>{ex.currentConsumption}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row met-course-v2-exception-summary__row--highlight">
                      <span>可补空间</span><strong>{ex.fillableSpace}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row">
                      <span>建议动作</span><strong>{ex.suggestionAction}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row">
                      <span>建议来源</span><strong>{ex.suggestionSource}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row">
                      <span>负责人</span><strong>{ex.owner}</strong>
                    </div>
                    <div className="met-course-v2-exception-summary__row">
                      <span>处理状态</span>
                      <span className="met-course-v2-exception-summary__status">{ex.status}</span>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="met-course-v2-drawer__section">
                <h3 className="met-course-v2-drawer__section-title">课程概览</h3>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">课程名称</span><span className="met-course-v2-drawer__row-value">{drawerDetail.courseName}</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">老师</span><span className="met-course-v2-drawer__row-value">{drawerDetail.teacher}</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">教室</span><span className="met-course-v2-drawer__row-value">{drawerDetail.room}</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">时间</span><span className="met-course-v2-drawer__row-value">{drawerDetail.timeRange}</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">容量</span><span className="met-course-v2-drawer__row-value">{drawerDetail.capacity} 人</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">当前预约</span><span className="met-course-v2-drawer__row-value">{drawerDetail.booked} 人</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">候补</span><span className="met-course-v2-drawer__row-value">{drawerDetail.waitlistCount} 人</span></div>
                <span className={['met-course-v2-status', getCourseStatusClass(drawerDetail.status)].join(' ')}>{drawerDetail.statusLabel}</span>
              </section>

              <section className="met-course-v2-drawer__section">
                <h3 className="met-course-v2-drawer__section-title">耗课结构</h3>
                <div className="met-course-v2-consumption-bar">
                  <div
                    className="met-course-v2-consumption-bar__fill"
                    style={{ width: `${(cs.bookedConsumptionPoints / cs.fullConsumptionPoints) * 100}%` }}
                  />
                </div>
                <p className="met-course-v2-consumption-bar__label">
                  当前预约预计耗课 {cs.bookedConsumptionPoints} / {cs.fullConsumptionPoints} 点
                </p>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">单人扣点</span><span className="met-course-v2-drawer__row-value">{cs.pointPerPerson} 点</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">理论满班耗课</span><span className="met-course-v2-drawer__row-value">{cs.fullConsumptionPoints} 点</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">历史到课率</span><span className="met-course-v2-drawer__row-value">{Math.round(cs.historicalAttendanceRate * 100)}%</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">预计到课耗课</span><span className="met-course-v2-drawer__row-value">{cs.predictedAttendanceConsumptionPoints} 点</span></div>
                <div className="met-course-v2-drawer__row met-course-v2-drawer__row--highlight">
                  <span className="met-course-v2-drawer__row-label">剩余可补耗课空间</span>
                  <span className="met-course-v2-drawer__row-value">{cs.remainingConsumptionSpace} 点</span>
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
                    <p className="met-course-v2-roster-item__meta">{member.stageLabel} · {member.cardSummary} · {member.tag}</p>
                  </div>
                ))}
              </section>

              <section className="met-course-v2-drawer__section">
                <h3 className="met-course-v2-drawer__section-title">签到与核销</h3>
                <div className="met-course-v2-checkin-grid">
                  <div className="met-course-v2-checkin-stat"><span className="met-course-v2-checkin-stat__num">{drawerDetail.checkin.checkedIn}</span><span className="met-course-v2-checkin-stat__label">已签到</span></div>
                  <div className="met-course-v2-checkin-stat"><span className="met-course-v2-checkin-stat__num">{drawerDetail.checkin.pendingCheckin}</span><span className="met-course-v2-checkin-stat__label">待签到</span></div>
                  <div className="met-course-v2-checkin-stat"><span className="met-course-v2-checkin-stat__num">{drawerDetail.checkin.pendingResign}</span><span className="met-course-v2-checkin-stat__label">待补签</span></div>
                </div>
                <div className="met-course-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
                  <button type="button" className="met-v2-drawer-footer-btn" onClick={() => handleAction('扫码核销')}>扫码核销</button>
                  <button type="button" className="met-v2-drawer-footer-btn" onClick={() => handleAction('手动签到')}>手动签到</button>
                  <button type="button" className="met-v2-drawer-footer-btn" onClick={() => showToast('进入签到处理（待建设）')}>标记爽约</button>
                </div>
              </section>

              <section className="met-course-v2-drawer__section">
                <h3 className="met-course-v2-drawer__section-title">补员建议</h3>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">推荐匹配会员</span><span className="met-course-v2-drawer__row-value">{drawerDetail.recommendation.recommendedCount} 人</span></div>
                <div className="met-course-v2-drawer__row"><span className="met-course-v2-drawer__row-label">高匹配</span><span className="met-course-v2-drawer__row-value">{drawerDetail.recommendation.highMatchCount} 人</span></div>
                <button type="button" className="met-v2-drawer-footer-btn" style={{ marginTop: 10 }} onClick={() => showToast('进入会员经营匹配名单（待建设）')}>
                  {drawerDetail.recommendation.actionLabel}
                </button>
              </section>

              <section className="met-course-v2-drawer__section">
                <h3 className="met-course-v2-drawer__section-title">异常记录</h3>
                <div className="met-course-v2-drawer__tags">
                  {drawerDetail.exceptions.map(exItem => (
                    <span key={exItem.label} className="met-course-v2-tag">{exItem.label}</span>
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

      {toast ? <div className="met-course-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default CourseV2Page;
