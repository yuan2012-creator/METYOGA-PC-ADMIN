import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildStaffV2Snapshot,
  getIssueOriginClass,
  getStaffSupplyStatusClass,
  getSuggestionSourceClass,
  type StaffV2IssueItem,
  type StaffV2Priority,
  type StaffV2SuggestionSource,
  type StaffV2TeacherDetail,
  type TeacherOwnedMemberRisk,
  type TeacherRequestStabilityItem,
} from './staffV2.viewModel';
import './staffV2.css';

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

function formatDrawerRecordLabel(label: string): string {
  if (!label.includes('占位')) return label;
  if (label.includes('代课记录')) return '代课记录：暂无记录';
  if (label.includes('请假申请')) return '请假申请记录：待复核记录';
  if (label.includes('资料审核')) return '资料审核记录：待补充资料';
  return label.replace(/占位/g, '暂无记录');
}

const SOURCE_TAG_CLASS: Record<StaffV2SuggestionSource, string> = {
  system_rule: 'met-staff-v2-source-tag--rule',
  pending_config: 'met-staff-v2-source-tag--pending',
};

const PRIORITY_CLASS: Record<StaffV2Priority, string> = {
  P0: 'met-staff-v2-priority--p0',
  P1: 'met-staff-v2-priority--p1',
  P2: 'met-staff-v2-priority--p2',
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

  const handleRequestAction = useCallback(
    (item: TeacherRequestStabilityItem) => {
      showToast(item.ctaToast);
      if (item.relatedTeacherId) openDrawer(item.relatedTeacherId);
    },
    [openDrawer, showToast],
  );

  const handleOwnedMemberRisk = useCallback(
    (teacher: TeacherOwnedMemberRisk) => {
      openDrawer(teacher.teacherId);
    },
    [openDrawer],
  );

  const {
    meta,
    filters,
    staffSupplySummary,
    staffPriorityActions,
    teacherRequestStability,
    teacherSupplyCoverageSummary,
    teacherOwnedMemberRisks,
    staffIssueReviewQueue,
    teacherGrowthSummary,
  } = snapshot;

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

        {/* 1. 师资供给结论 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--hero">
          <article className="met-staff-v2-panel met-staff-v2-panel--hero">
            <div className="met-staff-v2-hero__head">
              <h2 className="met-staff-v2-hero__headline">{staffSupplySummary.headline}</h2>
              <span
                className={[
                  'met-staff-v2-status',
                  getStaffSupplyStatusClass(staffSupplySummary.status),
                ].join(' ')}
              >
                {staffSupplySummary.statusLabel}
              </span>
            </div>
            <p className="met-staff-v2-hero__text">{staffSupplySummary.conclusion}</p>
            <div className="met-staff-v2-hero__tags">
              {staffSupplySummary.impactTags.map(tag => (
                <span key={tag} className="met-staff-v2-tag met-staff-v2-tag--impact">{tag}</span>
              ))}
              <span className="met-staff-v2-tag met-staff-v2-tag--source">
                {staffSupplySummary.sourceLabel}
              </span>
            </div>
            <p className="met-staff-v2-hero__meta">
              最近更新：{staffSupplySummary.updatedAt}
            </p>
            <div className="met-staff-v2-evidence-grid met-staff-v2-evidence-grid--hero">
              {staffSupplySummary.evidenceItems.map(item => (
                <div
                  key={item.label}
                  className={[
                    'met-staff-v2-evidence-item',
                    item.isWarning ? 'is-warning' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="met-staff-v2-evidence-item__value">{item.value}</span>
                  <span className="met-staff-v2-evidence-item__label">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="met-staff-v2-hero__actions">
              <button
                type="button"
                className="met-staff-v2-btn met-staff-v2-btn--ghost"
                onClick={() => showToast(staffSupplySummary.evidenceToastMessage)}
              >
                {staffSupplySummary.evidenceButtonLabel}
              </button>
            </div>
          </article>
        </section>

        {/* 2. 本周师资优先动作 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--priority">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{staffPriorityActions.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{staffPriorityActions.subtitle}</p>
          </header>
          <div className="met-staff-v2-action-queue">
            {staffPriorityActions.items.map(item => (
              <div
                key={item.id}
                className={`met-staff-v2-action-item met-staff-v2-action-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-staff-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-staff-v2-action-item__main">
                  <p className="met-staff-v2-action-item__title">{item.title}</p>
                  <p className="met-staff-v2-action-item__meta">
                    影响：{item.impact} · 负责人：{item.owner} · 来源：
                    {item.sourceModules.join(' / ')}
                  </p>
                  <p className="met-staff-v2-action-item__action">建议动作：{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-staff-v2-btn met-staff-v2-btn--sm met-staff-v2-btn--ghost"
                  onClick={() => showToast(item.ctaToast)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 老师端申请与排课稳定 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--requests">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherRequestStability.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherRequestStability.subtitle}</p>
          </header>
          <div className="met-staff-v2-request-list">
            {teacherRequestStability.items.map(item => (
              <div
                key={item.id}
                className={`met-staff-v2-request-item met-staff-v2-request-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-staff-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-staff-v2-request-item__main">
                  <p className="met-staff-v2-request-item__title">
                    {item.typeLabel} · {item.teacher}
                  </p>
                  <p className="met-staff-v2-request-item__course">涉及：{item.involvedCourse}</p>
                  <p className="met-staff-v2-request-item__impact">影响：{item.impact}</p>
                  <p className="met-staff-v2-request-item__status">状态：{item.status}</p>
                  <p className="met-staff-v2-request-item__action">{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-staff-v2-btn met-staff-v2-btn--sm"
                  onClick={() => handleRequestAction(item)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 师资供给与课程覆盖 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--supply">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherSupplyCoverageSummary.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherSupplyCoverageSummary.subtitle}</p>
          </header>
          <div className="met-staff-v2-supply-layout">
            <article className="met-staff-v2-supply-block">
              <h3 className="met-staff-v2-supply-block__title">老师负载摘要</h3>
              <div className="met-staff-v2-supply-stats">
                <div><span>负载偏高老师</span><strong>{teacherSupplyCoverageSummary.workload.highLoadCount}</strong></div>
                <div><span>正常负载老师</span><strong>{teacherSupplyCoverageSummary.workload.normalLoadCount}</strong></div>
                <div><span>可补排老师</span><strong>{teacherSupplyCoverageSummary.workload.fillableCount}</strong></div>
                <div><span>可代课老师</span><strong>{teacherSupplyCoverageSummary.workload.substituteCount}</strong></div>
              </div>
              <ul className="met-staff-v2-supply-teachers">
                {teacherSupplyCoverageSummary.workload.representativeTeachers.map(t => (
                  <li key={t.name}>
                    <strong>{t.name}</strong>：{t.note}
                  </li>
                ))}
              </ul>
            </article>
            <article className="met-staff-v2-supply-block">
              <h3 className="met-staff-v2-supply-block__title">课程覆盖摘要</h3>
              <div className="met-staff-v2-coverage-summary">
                {teacherSupplyCoverageSummary.courseCoverage.map(course => (
                  <div key={course.id} className="met-staff-v2-coverage-summary-item">
                    <div className="met-staff-v2-coverage-summary-item__head">
                      <span className="met-staff-v2-coverage-summary-item__type">{course.courseType}</span>
                      <span className="met-staff-v2-coverage-summary-item__status">{course.statusLabel}</span>
                    </div>
                    <p className="met-staff-v2-coverage-summary-item__meta">
                      可用老师 {course.availableTeachers} · {course.riskNote}
                    </p>
                    <p className="met-staff-v2-coverage-summary-item__action">{course.suggestedAction}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="met-staff-v2-supply-block">
              <h3 className="met-staff-v2-supply-block__title">可补排 / 可代课资源</h3>
              <div className="met-staff-v2-substitute-resource">
                <p>本周可补排时间：{teacherSupplyCoverageSummary.substituteResource.fillableSlots}</p>
                <p>可代课老师：{teacherSupplyCoverageSummary.substituteResource.substituteTeachers}</p>
                <p>推荐补排课程：{teacherSupplyCoverageSummary.substituteResource.recommendedCourses}</p>
                <button
                  type="button"
                  className="met-staff-v2-btn met-staff-v2-btn--sm"
                  onClick={() => showToast(teacherSupplyCoverageSummary.substituteResource.ctaToast)}
                >
                  {teacherSupplyCoverageSummary.substituteResource.ctaLabel}
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* 5. 老师名下会员风险 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--owned-members">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherOwnedMemberRisks.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherOwnedMemberRisks.subtitle}</p>
          </header>
          <div className="met-staff-v2-owned-risk-grid">
            {teacherOwnedMemberRisks.teachers.map(teacher => (
              <article key={teacher.teacherId} className="met-staff-v2-owned-risk-card">
                <h3 className="met-staff-v2-owned-risk-card__name">{teacher.teacherName}</h3>
                <div className="met-staff-v2-owned-risk-card__metrics">
                  <div><span>名下会员</span><strong>{teacher.ownedMembers}</strong></div>
                  <div><span>风险会员</span><strong>{teacher.riskMembers}</strong></div>
                  {teacher.newMemberActivationRisk !== undefined ? (
                    <div><span>新成交未激活</span><strong>{teacher.newMemberActivationRisk}</strong></div>
                  ) : null}
                  {teacher.lowFrequencyRisk !== undefined ? (
                    <div><span>低频风险</span><strong>{teacher.lowFrequencyRisk}</strong></div>
                  ) : null}
                  {teacher.renewalWindowRisk !== undefined ? (
                    <div><span>续费窗口</span><strong>{teacher.renewalWindowRisk}</strong></div>
                  ) : null}
                </div>
                <p className="met-staff-v2-owned-risk-card__follow">最近跟进：{teacher.lastFollowUp}</p>
                <p className="met-staff-v2-owned-risk-card__action">{teacher.suggestedAction}</p>
                <button
                  type="button"
                  className="met-staff-v2-btn met-staff-v2-btn--sm"
                  onClick={() => handleOwnedMemberRisk(teacher)}
                >
                  {teacher.ctaLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 6. 师资问题队列 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--issues">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{staffIssueReviewQueue.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{staffIssueReviewQueue.subtitle}</p>
          </header>
          <div className="met-staff-v2-issue-list">
            {staffIssueReviewQueue.items.map(item => (
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
                  <p className="met-staff-v2-issue-row__meta">
                    影响：{item.impact}
                    {item.owner ? ` · 负责人：${item.owner}` : ''}
                  </p>
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
        </section>

        {/* 7. 老师贡献与成长带教 */}
        <section className="met-staff-v2-zone met-staff-v2-zone--growth met-staff-v2-zone--demoted">
          <header className="met-staff-v2-zone__head">
            <h2 className="met-staff-v2-zone__title">{teacherGrowthSummary.title}</h2>
            <p className="met-staff-v2-zone__subtitle">{teacherGrowthSummary.subtitle}</p>
          </header>
          <div className="met-staff-v2-growth-dual">
            <article className="met-staff-v2-growth-panel">
              <h3 className="met-staff-v2-growth-panel__title">{teacherGrowthSummary.contribution.title}</h3>
              <div className="met-staff-v2-contribution-summary">
                {teacherGrowthSummary.contribution.items.map(item => (
                  <div key={item.id} className="met-staff-v2-contribution-summary-item">
                    <div className="met-staff-v2-contribution-summary-item__head">
                      <span className="met-staff-v2-contribution-summary-item__name">{item.name}</span>
                      <span className="met-staff-v2-tag met-staff-v2-tag--status">{item.statusLabel}</span>
                    </div>
                    <p>{item.contributionNote}</p>
                    <p>{item.qualityNote}</p>
                    {item.riskNote ? <p className="is-warn">{item.riskNote}</p> : null}
                  </div>
                ))}
              </div>
            </article>
            <article className="met-staff-v2-growth-panel">
              <h3 className="met-staff-v2-growth-panel__title">{teacherGrowthSummary.growth.title}</h3>
              <div className="met-staff-v2-growth-entry-stats">
                <p>待复盘老师：{teacherGrowthSummary.growth.pendingReviewTeachers}</p>
                <p>待审核资料：{teacherGrowthSummary.growth.pendingMaterials}</p>
                <p>待安排听课：{teacherGrowthSummary.growth.pendingObservations}</p>
                <p>晋级观察：{teacherGrowthSummary.growth.promotionWatch}</p>
              </div>
              <button
                type="button"
                className="met-staff-v2-btn met-staff-v2-btn--sm"
                onClick={() => showToast(teacherGrowthSummary.growth.ctaToast)}
              >
                {teacherGrowthSummary.growth.ctaLabel}
              </button>
            </article>
          </div>
        </section>
      </div>

            {drawerTeacherId ? (
        <>
          <button type="button" className="met-staff-v2-drawer-overlay met-v2-drawer-overlay" aria-label="关闭老师详情" onClick={closeDrawer} />
          <aside className="met-staff-v2-drawer met-v2-drawer-panel" role="dialog" aria-labelledby="staff-v2-drawer-title">
            <div className="met-staff-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="staff-v2-drawer-title" className="met-staff-v2-drawer__title met-v2-drawer-title">
                  {drawerDetail?.title ?? '暂无详情'}
                </h2>
                {drawerDetail?.subtitle ? (
                  <p className="met-staff-v2-drawer__subtitle met-v2-drawer-subtitle">{drawerDetail.subtitle}</p>
                ) : (
                  <p className="met-staff-v2-drawer__subtitle met-v2-drawer-subtitle">当前记录缺少详情数据</p>
                )}
              </div>
              <button type="button" className="met-staff-v2-drawer__close met-v2-drawer-close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-staff-v2-drawer__body met-v2-drawer-body">
              {drawerDetail ? (
                <>
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

              <section className="met-staff-v2-drawer__section met-staff-v2-drawer-owned-members">
                <h3 className="met-staff-v2-drawer__section-title">名下会员</h3>
                <h4 className="met-staff-v2-drawer-owned-members__subtitle">名下会员概览</h4>
                <div className="met-staff-v2-drawer__row"><span>名下会员总数</span><span>{drawerDetail.ownedMemberDetail.overview.totalMembers}</span></div>
                <div className="met-staff-v2-drawer__row"><span>活跃会员</span><span>{drawerDetail.ownedMemberDetail.overview.activeMembers}</span></div>
                <div className="met-staff-v2-drawer__row"><span>高风险会员</span><span>{drawerDetail.ownedMemberDetail.overview.highRiskMembers}</span></div>
                <div className="met-staff-v2-drawer__row"><span>本周已跟进</span><span>{drawerDetail.ownedMemberDetail.overview.followedThisWeek}</span></div>
                <div className="met-staff-v2-drawer__row"><span>待跟进</span><span>{drawerDetail.ownedMemberDetail.overview.pendingFollowUp}</span></div>
                <div className="met-staff-v2-drawer__row"><span>近 14 天未到店</span><span>{drawerDetail.ownedMemberDetail.overview.notVisited14Days}</span></div>
                <div className="met-staff-v2-drawer__row"><span>新会员未激活</span><span>{drawerDetail.ownedMemberDetail.overview.newMemberInactive}</span></div>
                <div className="met-staff-v2-drawer__row"><span>续费窗口会员</span><span>{drawerDetail.ownedMemberDetail.overview.renewalWindow}</span></div>

                <h4 className="met-staff-v2-drawer-owned-members__subtitle">S 阶段分布</h4>
                <div className="met-staff-v2-drawer-owned-members__stages">
                  {drawerDetail.ownedMemberDetail.stageDistribution.map(stage => (
                    <div key={stage.stage} className="met-staff-v2-drawer-owned-members__stage">
                      <span className="met-staff-v2-drawer-owned-members__stage-label">{stage.stageLabel}</span>
                      <span className="met-staff-v2-drawer-owned-members__stage-count">{stage.count} 人</span>
                    </div>
                  ))}
                </div>

                <h4 className="met-staff-v2-drawer-owned-members__subtitle">最近会员动作</h4>
                <ul className="met-staff-v2-drawer-owned-members__actions">
                  {drawerDetail.ownedMemberDetail.recentActions.map(action => (
                    <li key={`${action.memberName}-${action.stageLabel}`} className="met-staff-v2-drawer-owned-members__action-item">
                      <span className="met-staff-v2-drawer-owned-members__action-name">{action.memberName}</span>
                      <span className="met-staff-v2-drawer-owned-members__action-stage">{action.stageLabel}</span>
                      <span className="met-staff-v2-drawer-owned-members__action-status">{action.actionStatus}</span>
                      <span className="met-staff-v2-drawer-owned-members__action-detail">{action.detail}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="met-staff-v2-drawer-owned-members__subtitle">风险提示</h4>
                <ul className="met-staff-v2-drawer-owned-members__risks">
                  {drawerDetail.ownedMemberDetail.riskNotes.map(note => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <div className="met-staff-v2-drawer-owned-members__foot">
                  {drawerDetail.ownedMemberDetail.actions.map(action => (
                    <button
                      key={action.label}
                      type="button"
                      className="met-v2-drawer-footer-btn"
                      onClick={() => showToast(action.toastMessage)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
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
                    <li key={rec.label}>{formatDrawerRecordLabel(rec.label)}</li>
                  ))}
                </ul>
              </section>

              <div className="met-staff-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
                {drawerDetail.actions.map(action => (
                  <button
                    key={action.label}
                    type="button"
                    className="met-v2-drawer-footer-btn"
                    onClick={() => showToast(action.toastMessage)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
                </>
              ) : (
                <V2DrawerEmpty onClose={closeDrawer} />
              )}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-staff-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default StaffV2Page;
