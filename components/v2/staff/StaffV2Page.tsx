import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildStaffV2Snapshot,
  getApplicationTypeClass,
  getAttentionToneClass,
  getAvailabilityToneClass,
  getCoverageToneClass,
  getIndicatorDotCount,
  getIssueOriginClass,
  getWorkloadToneClass,
  type StaffV2AttentionHighlight,
  type StaffV2CourseCoverageItem,
  type StaffV2IssueItem,
  type StaffV2Priority,
  type StaffV2SuggestionSource,
  type StaffV2TeacherApplicationItem,
  type StaffV2TeacherContributionItem,
  type StaffV2TeacherDetail,
  type StaffV2WorkloadCell,
} from './staffV2.viewModel';
import './staffV2.css';

const SOURCE_TAG_CLASS: Record<StaffV2SuggestionSource, string> = {
  system_rule: 'met-staff-v2-source-tag--rule',
  pending_config: 'met-staff-v2-source-tag--pending',
};

const PRIORITY_CLASS: Record<StaffV2Priority, string> = {
  P0: 'met-staff-v2-priority--p0',
  P1: 'met-staff-v2-priority--p1',
  P2: 'met-staff-v2-priority--p2',
};

const APPLICATION_PRIORITY_CLASS: Record<string, string> = {
  'ta-1': 'met-staff-v2-application-card--p0',
  'ta-2': 'met-staff-v2-application-card--p1',
  'ta-3': 'met-staff-v2-application-card--p1',
  'ta-4': 'met-staff-v2-application-card--p2',
  'ta-5': 'met-staff-v2-application-card--p2',
};

const StaffV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildStaffV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerTeacherId, setDrawerTeacherId] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[StaffV2]', message);
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

  const openDrawer = useCallback((teacherId: string) => {
    setDrawerTeacherId(teacherId);
  }, []);

  const closeDrawer = useCallback(() => setDrawerTeacherId(null), []);

  const drawerDetail: StaffV2TeacherDetail | null = drawerTeacherId
    ? snapshot.teacherDetailMap[drawerTeacherId] ?? null
    : null;

  const handleIssueAction = useCallback(
    (item: StaffV2IssueItem) => {
      if (item.toastMessage) showToast(item.toastMessage);
      if (item.relatedTeacherId) openDrawer(item.relatedTeacherId);
    },
    [openDrawer, showToast],
  );

  const handleTeacherAction = useCallback(
    (teacher: StaffV2TeacherContributionItem, action: 'primary' | 'secondary') => {
      if (action === 'primary') {
        openDrawer(teacher.id);
        return;
      }
      const msg =
        teacher.secondaryActionLabel === '调整'
          ? '进入课程与排课调整（待建设）'
          : teacher.secondaryActionLabel === '补排'
            ? '进入补排建议（待建设）'
            : teacher.secondaryActionLabel === '加课'
              ? '进入加课建议（待建设）'
              : teacher.secondaryActionLabel === '带教'
                ? '进入成长与带教（待建设）'
                : `${teacher.secondaryActionLabel}（待建设）`;
      showToast(msg);
    },
    [openDrawer, showToast],
  );

  const handleAttentionAction = useCallback(
    (item: StaffV2AttentionHighlight, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (item.toastMessage) showToast(item.toastMessage);
    },
    [showToast],
  );

  const handleCoverageAction = useCallback(
    (item: StaffV2CourseCoverageItem) => {
      if (item.toastMessage) showToast(item.toastMessage);
      else showToast(`${item.actionLabel}（待建设）`);
    },
    [showToast],
  );

  const handleApplicationAction = useCallback(
    (item: StaffV2TeacherApplicationItem) => {
      showToast(item.toastMessage);
      if (item.relatedTeacherId) openDrawer(item.relatedTeacherId);
    },
    [openDrawer, showToast],
  );

  const handleWorkloadCellClick = useCallback(
    (cell: StaffV2WorkloadCell) => {
      showToast(`查看 ${cell.teacher} ${cell.day} 排课（待建设）`);
    },
    [showToast],
  );

  const {
    meta,
    filters,
    warroom,
    teacherApplications,
    workloadHeatmap,
    courseCoverage,
    teacherContribution,
    staffIssueQueue,
    growthCoaching,
  } = snapshot;

  const workloadCellMap = useMemo(() => {
    const map = new Map<string, StaffV2WorkloadCell>();
    workloadHeatmap.cells.forEach(cell => {
      map.set(`${cell.teacher}-${cell.day}`, cell);
    });
    return map;
  }, [workloadHeatmap.cells]);

  const { supplySummary, attentionPanel, availabilitySummary } = warroom;

  return (
    <div className="met-staff-v2">
      <div className="met-staff-v2__inner">
        <header className="met-staff-v2__header">
          <div className="met-staff-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-staff-v2__header-actions">
            <div className="met-staff-v2__filters">
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                onClick={() => handleAction('切换门店筛选')}
              >
                门店：{filters.storeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                onClick={() => handleAction('切换角色筛选')}
              >
                角色：{filters.roleLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                onClick={() => handleAction('切换课程类型筛选')}
              >
                课程类型：{filters.courseTypeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                onClick={() => handleAction('切换等级筛选')}
              >
                等级：{filters.levelLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn"
                onClick={() => handleAction('切换状态筛选')}
              >
                状态：{filters.statusLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn met-staff-v2__filter-btn--ghost"
                onClick={() => showToast('打开成长规则配置（待建设）')}
              >
                {filters.secondaryActionLabel}
              </button>
              <button
                type="button"
                className="met-staff-v2__filter-btn met-staff-v2__filter-btn--primary"
                onClick={() => handleAction('新增老师')}
              >
                {filters.primaryActionLabel}
              </button>
            </div>
            <button
              type="button"
              className="met-staff-v2__archive-link"
              onClick={() => showToast('进入师资档案二级页（待建设）')}
            >
              {filters.archiveLinkLabel}
            </button>
          </div>
        </header>

        <section className="met-staff-v2-zone met-staff-v2-zone--warroom">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{warroom.section.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{warroom.section.subtitle}</p>
          </header>
          <div className="met-staff-v2-warroom">
            <div className="met-staff-v2-panel met-staff-v2-panel--supply">
              <h3 className="met-staff-v2-panel__title">{supplySummary.title}</h3>
              <p className="met-staff-v2-supply-conclusion">{supplySummary.conclusion}</p>
              <p className="met-staff-v2-supply-desc">{supplySummary.description}</p>
              <div className="met-staff-v2-supply-tags">
                {supplySummary.statusTags.map(tag => (
                  <span key={tag} className="met-staff-v2-tag met-staff-v2-tag--warn">{tag}</span>
                ))}
                <span className={['met-staff-v2-source-tag met-staff-v2-source-tag--mini', SOURCE_TAG_CLASS[supplySummary.suggestionSource]].join(' ')}>
                  {supplySummary.suggestionSourceLabel}
                </span>
              </div>
              <div className="met-staff-v2-evidence-grid">
                {supplySummary.evidence.map(ev => (
                  <div key={ev.label} className="met-staff-v2-evidence-item">
                    <span className="met-staff-v2-evidence-item__value">{ev.value}</span>
                    <span className="met-staff-v2-evidence-item__label">{ev.label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="met-staff-v2-btn"
                onClick={() => showToast('查看供给证据（待建设）')}
              >
                {supplySummary.actionLabel}
              </button>
            </div>

            <aside className="met-staff-v2-panel met-staff-v2-panel--attention">
              <h3 className="met-staff-v2-panel__title">{attentionPanel.title}</h3>
              <div className="met-staff-v2-attention-grid">
                {attentionPanel.items.map(item => (
                  <div
                    key={item.id}
                    className={['met-staff-v2-attention-card', getAttentionToneClass(item.tone)].join(' ')}
                  >
                    <span className="met-staff-v2-attention-card__count">{item.count}</span>
                    <p className="met-staff-v2-attention-card__title">{item.title}</p>
                    <p className="met-staff-v2-attention-card__desc">{item.description}</p>
                    <button
                      type="button"
                      className="met-staff-v2-btn met-staff-v2-btn--sm"
                      onClick={e => handleAttentionAction(item, e)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="met-staff-v2-availability">
            <h3 className="met-staff-v2-availability__title">{availabilitySummary.title}</h3>
            <div className="met-staff-v2-availability-grid">
              {availabilitySummary.items.map(item => (
                <div
                  key={item.id}
                  className={['met-staff-v2-availability-card', getAvailabilityToneClass(item.tone)].join(' ')}
                >
                  <span className="met-staff-v2-availability-card__label">{item.title}</span>
                  <span className="met-staff-v2-availability-card__teachers">{item.teachers}</span>
                  <span className="met-staff-v2-availability-card__desc">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <article className="met-staff-v2-zone met-staff-v2-zone--applications">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherApplications.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherApplications.subtitle}</p>
          </header>
          <div className="met-staff-v2-application-list">
            {teacherApplications.items.map(item => (
              <div
                key={item.id}
                className={[
                  'met-staff-v2-application-card',
                  getApplicationTypeClass(item.type),
                  APPLICATION_PRIORITY_CLASS[item.id] ?? '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="met-staff-v2-application-card__head">
                  <span className="met-staff-v2-application-card__type">{item.typeLabel}</span>
                  <span className="met-staff-v2-application-card__source">老师端提交</span>
                </div>
                <p className="met-staff-v2-application-card__teacher">老师：{item.teacher}</p>
                <p className="met-staff-v2-application-card__summary">{item.summary}</p>
                <p className="met-staff-v2-application-card__detail">{item.detail}</p>
                {item.impact ? (
                  <span className="met-staff-v2-application-card__impact">影响：{item.impact}</span>
                ) : null}
                <div className="met-staff-v2-application-card__meta">
                  <span className="met-staff-v2-application-card__status">{item.status}</span>
                  <span className="met-staff-v2-application-card__assignee">{item.assignee}</span>
                </div>
                <button
                  type="button"
                  className="met-staff-v2-btn met-staff-v2-btn--sm"
                  onClick={() => handleApplicationAction(item)}
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="met-staff-v2-zone met-staff-v2-zone--heatmap">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{workloadHeatmap.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{workloadHeatmap.subtitle}</p>
          </header>
          <div className="met-staff-v2-heatmap-legend">
            {workloadHeatmap.legend.map(item => (
              <span key={item.label} className="met-staff-v2-heatmap-legend__item">
                <span className={['met-staff-v2-heatmap-legend__swatch', getWorkloadToneClass(item.tone)].join(' ')} />
                {item.label}
              </span>
            ))}
          </div>
          <div className="met-staff-v2-heatmap-grid">
            <div className="met-staff-v2-heatmap-grid__corner" />
            {workloadHeatmap.dayLabels.map(day => (
              <div key={day} className="met-staff-v2-heatmap-grid__col-head">{day}</div>
            ))}
            {workloadHeatmap.teacherLabels.map(teacher => (
              <React.Fragment key={teacher}>
                <div className="met-staff-v2-heatmap-grid__row-head">{teacher}</div>
                {workloadHeatmap.dayLabels.map(day => {
                  const cell = workloadCellMap.get(`${teacher}-${day}`);
                  if (!cell) return null;
                  return (
                    <button
                      key={`${teacher}-${day}`}
                      type="button"
                      className={['met-staff-v2-heatmap-cell', getWorkloadToneClass(cell.tone)].join(' ')}
                      onClick={() => handleWorkloadCellClick(cell)}
                    >
                      <span className="met-staff-v2-heatmap-cell__count">{cell.sessionCount} 节</span>
                      {cell.peakCount !== undefined ? (
                        <span className="met-staff-v2-heatmap-cell__peak">晚高峰 {cell.peakCount}</span>
                      ) : null}
                      <span className="met-staff-v2-heatmap-cell__status">{cell.statusLabel}</span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </article>

        <article className="met-staff-v2-zone">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{courseCoverage.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{courseCoverage.subtitle}</p>
          </header>
          <div className="met-staff-v2-coverage-grid">
            {courseCoverage.items.map(item => (
              <div
                key={item.id}
                className={['met-staff-v2-coverage-card', getCoverageToneClass(item.coverageTone)].join(' ')}
              >
                <div className="met-staff-v2-coverage-card__head">
                  <span className="met-staff-v2-coverage-card__type">{item.courseType}</span>
                  <span className="met-staff-v2-coverage-card__status">{item.coverageStatus}</span>
                </div>
                <p className="met-staff-v2-coverage-card__meta">
                  可授课 {item.teacherCount} · {item.weeklySessions} · 满课率 {item.fillRate}
                </p>
                <div className="met-staff-v2-coverage-card__roles">
                  <div className="met-staff-v2-coverage-role">
                    <span className="met-staff-v2-coverage-role__label">主授</span>
                    <span className="met-staff-v2-coverage-role__value">{item.roleMap.primary}</span>
                  </div>
                  <div className="met-staff-v2-coverage-role">
                    <span className="met-staff-v2-coverage-role__label">可代</span>
                    <span className="met-staff-v2-coverage-role__value">{item.roleMap.substitute}</span>
                  </div>
                  <div className="met-staff-v2-coverage-role">
                    <span className="met-staff-v2-coverage-role__label">带教中</span>
                    <span className="met-staff-v2-coverage-role__value">{item.roleMap.mentoring}</span>
                  </div>
                </div>
                <div className="met-staff-v2-coverage-card__indicators">
                  {item.indicators.map(ind => (
                    <div key={ind.label} className="met-staff-v2-indicator">
                      <span className="met-staff-v2-indicator__label">{ind.label}</span>
                      <span className="met-staff-v2-indicator__dots">
                        {[1, 2, 3].map(dot => (
                          <span
                            key={dot}
                            className={['met-staff-v2-indicator__dot', dot <= getIndicatorDotCount(ind.level) ? 'is-filled' : ''].filter(Boolean).join(' ')}
                          />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="met-staff-v2-coverage-card__risk">风险：{item.risk}</p>
                <p className="met-staff-v2-coverage-card__action">{item.suggestionAction}</p>
                <button type="button" className="met-staff-v2-btn met-staff-v2-btn--sm" onClick={() => handleCoverageAction(item)}>
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="met-staff-v2-zone">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherContribution.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherContribution.subtitle}</p>
          </header>
          <div className="met-staff-v2-teacher-grid">
            {teacherContribution.teachers.map(teacher => (
              <div key={teacher.id} className="met-staff-v2-teacher-card">
                <div className="met-staff-v2-teacher-card__head">
                  <span className="met-staff-v2-teacher-card__name">{teacher.name}</span>
                  <span className="met-staff-v2-teacher-card__level">{teacher.level}</span>
                </div>
                <p className="met-staff-v2-teacher-card__specialty">{teacher.specialties}</p>
                <div className="met-staff-v2-teacher-card__decision">
                  <div className="met-staff-v2-teacher-card__decision-row">
                    <span className="met-staff-v2-teacher-card__decision-label">状态</span>
                    <span className="met-staff-v2-tag met-staff-v2-tag--status">{teacher.statusLabel}</span>
                  </div>
                  <div className="met-staff-v2-teacher-card__decision-row">
                    <span className="met-staff-v2-teacher-card__decision-label">本周贡献</span>
                    <span>预计耗课 {teacher.estimatedConsumption}</span>
                  </div>
                  <div className="met-staff-v2-teacher-card__decision-row">
                    <span className="met-staff-v2-teacher-card__decision-label">
                      {teacher.riskOrOpportunityTone === 'opportunity' ? '机会' : '风险'}
                    </span>
                    <span className={['met-staff-v2-teacher-card__risk-opp', `is-${teacher.riskOrOpportunityTone}`].join(' ')}>
                      {teacher.riskOrOpportunity}
                    </span>
                  </div>
                  <div className="met-staff-v2-teacher-card__decision-row met-staff-v2-teacher-card__decision-row--action">
                    <span className="met-staff-v2-teacher-card__decision-label">下一动作</span>
                    <span className="met-staff-v2-teacher-card__next-action">{teacher.nextAction}</span>
                  </div>
                </div>
                <p className="met-staff-v2-teacher-card__meta-muted">
                  {teacher.weeklySessions} · 满课率 {teacher.fillRate} · 评分 {teacher.memberRating}
                </p>
                <div className="met-staff-v2-teacher-card__foot">
                  <button type="button" className="met-staff-v2-btn met-staff-v2-btn--sm" onClick={() => handleTeacherAction(teacher, 'primary')}>
                    {teacher.primaryActionLabel}
                  </button>
                  <button type="button" className="met-staff-v2-btn met-staff-v2-btn--sm" onClick={() => handleTeacherAction(teacher, 'secondary')}>
                    {teacher.secondaryActionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="met-staff-v2-zone">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{staffIssueQueue.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{staffIssueQueue.subtitle}</p>
          </header>
          <div className="met-staff-v2-issue-list">
            {staffIssueQueue.items.map(item => (
              <div key={item.id} className={['met-staff-v2-issue-row', `met-staff-v2-issue-row--${item.priority.toLowerCase()}`].join(' ')}>
                <span className={['met-staff-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>{item.priority}</span>
                <div className="met-staff-v2-issue-row__main">
                  <div className="met-staff-v2-issue-row__title-row">
                    <p className="met-staff-v2-issue-row__title">{item.title}</p>
                    <span className={['met-staff-v2-origin-tag', getIssueOriginClass(item.origin)].join(' ')}>
                      {item.originLabel}
                    </span>
                  </div>
                  <p className="met-staff-v2-issue-row__fact">{item.fact}</p>
                  <p className="met-staff-v2-issue-row__action">{item.suggestionAction}</p>
                </div>
                <div className="met-staff-v2-issue-row__aside">
                  <span className={['met-staff-v2-source-tag met-staff-v2-source-tag--mini', SOURCE_TAG_CLASS[item.suggestionSource]].join(' ')}>
                    {item.suggestionSourceLabel}
                  </span>
                  <button type="button" className="met-staff-v2-btn met-staff-v2-btn--sm" onClick={() => handleIssueAction(item)}>
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="met-staff-v2-zone">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{growthCoaching.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{growthCoaching.subtitle}</p>
          </header>
          <div className="met-staff-v2-growth-layout">
            <div className="met-staff-v2-growth-block">
              <h4 className="met-staff-v2-growth-block__title">等级分布</h4>
              <div className="met-staff-v2-level-grid">
                {growthCoaching.levelDistribution.map(lv => (
                  <div key={lv.level} className="met-staff-v2-level-item">
                    <span className="met-staff-v2-level-item__level">{lv.level}</span>
                    <span className="met-staff-v2-level-item__count">{lv.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="met-staff-v2-growth-block">
              <h4 className="met-staff-v2-growth-block__title">晋级评定</h4>
              <ul className="met-staff-v2-review-list">
                {growthCoaching.promotionReviews.map(rv => (
                  <li key={rv.id} className="met-staff-v2-review-item">
                    <strong>{rv.teacher}</strong>：{rv.summary}
                  </li>
                ))}
              </ul>
            </div>
            <div className="met-staff-v2-growth-block">
              <h4 className="met-staff-v2-growth-block__title">资料审核</h4>
              <ul className="met-staff-v2-cert-list">
                {growthCoaching.materialReviews.map(mr => (
                  <li key={mr.id}>{mr.text}</li>
                ))}
              </ul>
            </div>
            <div className="met-staff-v2-growth-block">
              <h4 className="met-staff-v2-growth-block__title">下次动作</h4>
              <div className="met-staff-v2-growth-actions">
                {growthCoaching.nextActions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    className="met-staff-v2-btn met-staff-v2-btn--sm"
                    onClick={() => showToast(action.toastMessage)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      {drawerDetail ? (
        <>
          <button type="button" className="met-staff-v2-drawer-overlay" aria-label="关闭老师详情" onClick={closeDrawer} />
          <aside className="met-staff-v2-drawer" role="dialog" aria-labelledby="staff-v2-drawer-title">
            <div className="met-staff-v2-drawer__head">
              <div>
                <h2 id="staff-v2-drawer-title" className="met-staff-v2-drawer__title">{drawerDetail.title}</h2>
                <p className="met-staff-v2-drawer__subtitle">{drawerDetail.subtitle}</p>
              </div>
              <button type="button" className="met-staff-v2-drawer__close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-staff-v2-drawer__body">
              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">老师概览</h3>
                <div className="met-staff-v2-drawer__row"><span>姓名</span><span>{drawerDetail.name}</span></div>
                <div className="met-staff-v2-drawer__row"><span>等级</span><span>{drawerDetail.level}</span></div>
                <div className="met-staff-v2-drawer__row"><span>主授课程</span><span>{drawerDetail.specialties}</span></div>
                <div className="met-staff-v2-drawer__row"><span>所属门店</span><span>{drawerDetail.store}</span></div>
                <div className="met-staff-v2-drawer__row"><span>当前状态</span><span>{drawerDetail.statusLabel}</span></div>
                <div className="met-staff-v2-drawer__row"><span>本周排课</span><span>{drawerDetail.weeklySessions}</span></div>
                <div className="met-staff-v2-drawer__row"><span>晚高峰节数</span><span>{drawerDetail.peakSessions}</span></div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">个人资料</h3>
                <div className="met-staff-v2-drawer__row"><span>手机号</span><span>{drawerDetail.profile.phone}</span></div>
                <div className="met-staff-v2-drawer__row"><span>入职时间</span><span>{drawerDetail.profile.joinDate}</span></div>
                <div className="met-staff-v2-drawer__row"><span>合作方式</span><span>{drawerDetail.profile.employmentType}</span></div>
                <div className="met-staff-v2-drawer__row"><span>岗位类型</span><span>{drawerDetail.profile.roleType}</span></div>
                <div className="met-staff-v2-drawer__row"><span>所属门店</span><span>{drawerDetail.profile.store}</span></div>
                <div className="met-staff-v2-drawer__row"><span>直属负责人</span><span>{drawerDetail.profile.manager}</span></div>
                <div className="met-staff-v2-drawer__row"><span>当前状态</span><span>{drawerDetail.profile.employmentStatus}</span></div>
                <div className="met-staff-v2-drawer__row"><span>是否可跨店</span><span>{drawerDetail.profile.crossStore}</span></div>
                <div className="met-staff-v2-drawer__row"><span>是否可独立授课</span><span>{drawerDetail.profile.canTeachIndependently}</span></div>
                <div className="met-staff-v2-drawer__row"><span>是否可代课</span><span>{drawerDetail.profile.canSubstitute}</span></div>
                <p className="met-staff-v2-drawer__privacy-note">{drawerDetail.profile.privacyNote}</p>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">可授课程与资质</h3>
                <div className="met-staff-v2-drawer__row"><span>可授课程</span><span>{drawerDetail.qualifications.teachableCourses}</span></div>
                <div className="met-staff-v2-drawer__row"><span>可代课程</span><span>{drawerDetail.qualifications.substituteCourses}</span></div>
                <div className="met-staff-v2-drawer__row"><span>不可授课程</span><span>{drawerDetail.qualifications.restrictedCourses}</span></div>
                <div className="met-staff-v2-drawer__row"><span>资质</span><span>{drawerDetail.qualifications.certifications}</span></div>
                <div className="met-staff-v2-drawer__row"><span>证书状态</span><span>{drawerDetail.qualifications.certStatus}</span></div>
                <div className="met-staff-v2-drawer__row"><span>内部考核</span><span>{drawerDetail.qualifications.internalAssessment}</span></div>
                <div className="met-staff-v2-drawer__row"><span>证书附件</span><span>{drawerDetail.qualifications.attachmentStatus}</span></div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">供给与排课</h3>
                <div className="met-staff-v2-drawer__row"><span>本周排课</span><span>{drawerDetail.supply.weeklySessions}</span></div>
                <div className="met-staff-v2-drawer__row"><span>晚高峰</span><span>{drawerDetail.supply.peakSessions}</span></div>
                <div className="met-staff-v2-drawer__row"><span>可调整时段</span><span>{drawerDetail.supply.adjustableSlot}</span></div>
                <div className="met-staff-v2-drawer__row"><span>可代课</span><span>{drawerDetail.supply.substituteFor}</span></div>
                <div className="met-staff-v2-drawer__row met-staff-v2-drawer__row--highlight"><span>当前风险</span><span>{drawerDetail.supply.currentRisk}</span></div>
                <div className="met-staff-v2-drawer__row"><span>请假 / 代课申请</span><span>{drawerDetail.supply.pendingApplications}</span></div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">课程贡献</h3>
                <div className="met-staff-v2-drawer__row"><span>预计耗课</span><span>{drawerDetail.contribution.estimatedConsumption}</span></div>
                <div className="met-staff-v2-drawer__row"><span>理论满班</span><span>{drawerDetail.contribution.theoreticalConsumption}</span></div>
                <div className="met-staff-v2-drawer__row"><span>平均满课率</span><span>{drawerDetail.contribution.fillRate}</span></div>
                <div className="met-staff-v2-drawer__row"><span>候补关联</span><span>{drawerDetail.contribution.waitlistLinked}</span></div>
                <div className="met-staff-v2-drawer__row"><span>会员评分</span><span>{drawerDetail.contribution.memberRating}</span></div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">老师端功能权限</h3>
                <div className="met-staff-v2-permission-groups">
                  <div className="met-staff-v2-permission-group">
                    <h4 className="met-staff-v2-permission-group__title">可见</h4>
                    <div className="met-staff-v2-permission-tags">
                      {drawerDetail.appPermissions.visible.map(tag => (
                        <span key={tag} className="met-staff-v2-permission-tag is-visible">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="met-staff-v2-permission-group">
                    <h4 className="met-staff-v2-permission-group__title">可操作</h4>
                    <div className="met-staff-v2-permission-tags">
                      {drawerDetail.appPermissions.operable.map(tag => (
                        <span key={tag} className="met-staff-v2-permission-tag is-operable">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="met-staff-v2-permission-group">
                    <h4 className="met-staff-v2-permission-group__title">不可操作</h4>
                    <div className="met-staff-v2-permission-tags">
                      {drawerDetail.appPermissions.restricted.map(tag => (
                        <span key={tag} className="met-staff-v2-permission-tag is-restricted">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">成长与资质</h3>
                <div className="met-staff-v2-drawer__row"><span>等级</span><span>{drawerDetail.growth.level}</span></div>
                <div className="met-staff-v2-drawer__row"><span>当前晋级方向</span><span>{drawerDetail.growth.promotionDirection}</span></div>
                <div className="met-staff-v2-drawer__row"><span>带教状态</span><span>{drawerDetail.growth.mentoringStatus}</span></div>
                <div className="met-staff-v2-drawer__row"><span>本月复盘</span><span>{drawerDetail.growth.monthlyReview}</span></div>
                <div className="met-staff-v2-drawer__row"><span>待补材料</span><span>{drawerDetail.growth.pendingMaterials}</span></div>
                <div className="met-staff-v2-drawer__row"><span>最近评定</span><span>{drawerDetail.growth.lastReviewDate}</span></div>
              </section>

              <section className="met-staff-v2-drawer__section">
                <h3 className="met-staff-v2-drawer__section-title">近期记录</h3>
                <ul className="met-staff-v2-record-list">
                  {drawerDetail.recentRecords.map(rec => (
                    <li key={rec.label}>{rec.label}</li>
                  ))}
                </ul>
              </section>

              <div className="met-staff-v2-drawer__actions">
                {drawerDetail.actions.map(action => (
                  <button
                    key={action.label}
                    type="button"
                    className="met-staff-v2-btn"
                    onClick={() => showToast(action.toastMessage)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-staff-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default StaffV2Page;
