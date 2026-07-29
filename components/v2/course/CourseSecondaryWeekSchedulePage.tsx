import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getDefaultStaffService } from '../staff/services/createStaffService';
import { SecondaryPageHeader } from '../shared';
import { projectWeekScheduleDays } from './courseScheduleCalculations';
import {
  buildWeekScheduleSnapshot,
  getWeekScheduleStatusClass,
  sortWeekSessions,
  type WeekScheduleFilterOption,
  type WeekScheduleRiskType,
  type WeekScheduleSessionCard,
  type WeekScheduleSummaryItem,
} from './courseSecondaryWeekSchedule.viewModel';
import { projectSessionToWeekCard } from './courseWeekScheduleProjection';
import { useCourseScheduleState } from './useCourseScheduleState';
import './courseSecondaryWeekSchedule.css';

export type WeekScheduleInitialMode = 'default' | 'lowAttendance' | 'teacherConflict';

export interface CourseSecondaryWeekSchedulePageProps {
  initialMode?: WeekScheduleInitialMode;
  onBack: () => void;
  onOpenDetail: (sessionId: string) => void;
  onOpenNewSchedule: () => void;
  onToast: (message: string) => void;
  onNavigateToStaff?: (sessionId: string, mode?: 'assign' | 'replace' | 'detail') => void;
  onOpenStaffTeacher?: (staffId: string) => void;
}

function mapWeekScheduleSummaryToMetrics(items: WeekScheduleSummaryItem[]) {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    status: item.isWarning ? ('warning' as const) : ('normal' as const),
  }));
}

type FilterGroupKey = 'store' | 'type' | 'teacher' | 'room' | 'status' | 'risk';

const FILTER_GROUPS: { key: FilterGroupKey; label: string; mockOnly?: boolean }[] = [
  { key: 'store', label: '门店', mockOnly: true },
  { key: 'type', label: '课程类型' },
  { key: 'teacher', label: '老师' },
  { key: 'room', label: '教室', mockOnly: true },
  { key: 'status', label: '课程状态' },
  { key: 'risk', label: '风险类型' },
];

const PRIMARY_FILTER_KEYS: FilterGroupKey[] = ['store', 'type', 'teacher', 'status'];
const MORE_FILTER_KEYS: FilterGroupKey[] = ['room', 'risk'];
const CORE_SUMMARY_IDS = new Set(['sum-total', 'sum-low', 'sum-conflict', 'sum-wait']);

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  type: 'all',
  teacher: 'all',
  room: 'all',
  status: 'all',
  risk: 'all',
};

function SessionCard({
  sess,
  onOpenDetail,
  onNavigateToStaff,
  onReschedule,
  onSuspend,
}: {
  sess: WeekScheduleSessionCard;
  onOpenDetail: (id: string) => void;
  onNavigateToStaff?: (sessionId: string, mode?: 'assign' | 'replace' | 'detail') => void;
  onReschedule: (sessionId: string) => void;
  onSuspend: (sessionId: string) => void;
}) {
  const [opsOpen, setOpsOpen] = useState(false);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isRisk =
    sess.status === 'lowAttendance' ||
    sess.status === 'teacherLeaveRisk' ||
    sess.status === 'conflictWarning' ||
    sess.needsStaffAction;

  const needsAssign = !sess.staffId || sess.assignmentStatus === '待指定';
  const canReplace = Boolean(sess.staffId) && sess.assignmentStatus !== '待指定';
  const primaryStaffAction = needsAssign
    ? ({ label: '指定老师', mode: 'assign' as const, testId: `course-assign-${sess.sessionId}` })
    : canReplace
      ? ({ label: '更换老师', mode: 'replace' as const, testId: `course-replace-${sess.sessionId}` })
      : null;

  const factBits = [
    sess.storeName,
    sess.teacherName,
    sess.room,
    `${sess.bookedCount}/${sess.capacity}`,
    sess.waitlistCount > 0 ? `候补${sess.waitlistCount}` : null,
    sess.isSubstitute ? '代课' : null,
  ].filter(Boolean);

  return (
    <article
      className={['met-week-schedule__card', isRisk ? 'met-week-schedule__card--risk' : '']
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      data-testid={`course-session-card-${sess.sessionId}`}
      onClick={() => onOpenDetail(sess.detailKey)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(sess.detailKey);
      }}
    >
      <div className="met-week-schedule__card-top">
        <span className="met-week-schedule__card-time">{sess.startTime}</span>
        <h4 className="met-week-schedule__card-name">{sess.courseName}</h4>
        <span
          className={['met-week-schedule__card-status', getWeekScheduleStatusClass(sess.status)].join(' ')}
        >
          {sess.statusLabel}
        </span>
      </div>
      <div className="met-week-schedule__card-bottom">
        <p className="met-week-schedule__card-meta">
          {factBits.map((bit, idx) => (
            <span key={`${bit}-${idx}`} className="met-week-schedule__nowrap">
              {idx > 0 ? ' · ' : ''}
              {bit}
            </span>
          ))}
        </p>
        {sess.riskTags.length > 0 ? (
          <div className="met-week-schedule__card-tags">
            {sess.riskTags.slice(0, 2).map(tag => (
              <span key={tag} className="met-week-schedule__tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="met-week-schedule__card-btns met-v2-btn-row" onClick={stop}>
          {primaryStaffAction && onNavigateToStaff ? (
            <button
              type="button"
              className="met-week-schedule__btn met-week-schedule__btn--sm"
              data-testid={primaryStaffAction.testId}
              onClick={() => onNavigateToStaff(sess.sessionId, primaryStaffAction.mode)}
            >
              {primaryStaffAction.label}
            </button>
          ) : (
            <button
              type="button"
              className="met-week-schedule__btn met-week-schedule__btn--sm"
              data-testid={`course-detail-${sess.sessionId}`}
              onClick={() => onOpenDetail(sess.detailKey)}
            >
              查看详情
            </button>
          )}
          <div className="met-v2-more">
            <button
              type="button"
              className="met-v2-more__trigger"
              aria-expanded={opsOpen}
              onClick={() => setOpsOpen(v => !v)}
            >
              更多
            </button>
            {opsOpen ? (
              <div className="met-v2-more__menu" role="menu">
                {primaryStaffAction ? (
                  <button
                    type="button"
                    className="met-v2-more__item"
                    role="menuitem"
                    data-testid={`course-detail-${sess.sessionId}`}
                    onClick={() => {
                      setOpsOpen(false);
                      onOpenDetail(sess.detailKey);
                    }}
                  >
                    查看详情
                  </button>
                ) : null}
                <button
                  type="button"
                  className="met-v2-more__item"
                  role="menuitem"
                  onClick={() => {
                    setOpsOpen(false);
                    onReschedule(sess.sessionId);
                  }}
                >
                  改期
                </button>
                <button
                  type="button"
                  className="met-v2-more__item"
                  role="menuitem"
                  onClick={() => {
                    setOpsOpen(false);
                    onSuspend(sess.sessionId);
                  }}
                >
                  停课
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}


const CourseSecondaryWeekSchedulePage: React.FC<CourseSecondaryWeekSchedulePageProps> = ({
  initialMode = 'default',
  onBack,
  onOpenDetail,
  onOpenNewSchedule,
  onToast,
  onNavigateToStaff,
}) => {
  const mockSnapshot = useMemo(() => buildWeekScheduleSnapshot(), []);
  const { service, snapshot, ready } = useCourseScheduleState();
  const [staffNameMap, setStaffNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getDefaultStaffService()
      .hydrate()
      .then(() => {
        const members = getDefaultStaffService().getSnapshot().members;
        setStaffNameMap(new Map(members.map(m => [m.id, m.name])));
      });
  }, []);

  const serviceDays = useMemo(() => {
    if (!ready) return [];
    const sessions = snapshot.sessions;
    const cards = sessions.map(s =>
      projectSessionToWeekCard(s, snapshot.risks, staffNameMap),
    );
    const cardById = new Map(cards.map(c => [c.sessionId, c]));
    return projectWeekScheduleDays(sessions).map(day => ({
      id: day.id,
      label: day.label,
      dateLabel: day.dateLabel,
      sessions: sortWeekSessions(
        day.sessions.map(s => cardById.get(s.id)!).filter(Boolean),
      ),
    }));
  }, [ready, snapshot, staffNameMap]);

  const summaryMetrics = useMemo(
    () => mapWeekScheduleSummaryToMetrics(mockSnapshot.summaryItems),
    [mockSnapshot.summaryItems],
  );
  const coreMetrics = useMemo(
    () => summaryMetrics.filter(item => CORE_SUMMARY_IDS.has(item.id)),
    [summaryMetrics],
  );
  const auxMetrics = useMemo(
    () => summaryMetrics.filter(item => !CORE_SUMMARY_IDS.has(item.id)),
    [summaryMetrics],
  );
  const [period, setPeriod] = useState('current');
  const [filters, setFilters] = useState<Record<FilterGroupKey, string>>(() => ({
    ...DEFAULT_FILTERS,
    status: initialMode === 'lowAttendance' ? 'lowAttendance' : 'all',
    risk: initialMode === 'teacherConflict' ? 'teacherConflict' : 'all',
  }));
  const [keyword, setKeyword] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, WeekScheduleFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    mockSnapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [mockSnapshot.filterOptions]);

  const activeMoreFilterChips = useMemo(() => {
    return MORE_FILTER_KEYS.filter(key => filters[key] !== 'all').map(key => {
      const group = FILTER_GROUPS.find(g => g.key === key)!;
      const opt = (optionsByGroup.get(key) ?? []).find(o => o.value === filters[key]);
      return { key, label: `${group.label}：${opt?.label ?? filters[key]}` };
    });
  }, [filters, optionsByGroup]);

  const toggleFilter = useCallback(
    (group: FilterGroupKey, value: string) => {
      const groupDef = FILTER_GROUPS.find(g => g.key === group);
      if (groupDef?.mockOnly && value !== 'all') {
        onToast(`切换${groupDef.label}筛选（待建设）`);
      }
      setFilters(prev => ({ ...prev, [group]: value }));
    },
    [onToast],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setKeyword('');
    setPeriod('current');
    onToast('已恢复默认筛选');
  }, [onToast]);

  const handleResetTestData = useCallback(() => {
    const result = service.resetTestData();
    if (result.ok) {
      onToast('已重置课程排课测试数据');
    } else {
      onToast(result.error);
    }
  }, [service, onToast]);

  const handleReschedule = useCallback(
    (sessionId: string) => {
      const session = service.getSession(sessionId);
      if (!session) {
        onToast('课次不存在');
        return;
      }
      const start = new Date(session.startAt);
      start.setHours(start.getHours() + 1);
      const end = new Date(session.endAt);
      end.setHours(end.getHours() + 1);
      const result = service.rescheduleSession(sessionId, {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        reason: '门店改期（演示）',
      });
      if (result.ok) {
        onToast('会员改约与权益处理待后续联动');
      } else {
        onToast(result.error);
      }
    },
    [service, onToast],
  );

  const handleSuspend = useCallback(
    (sessionId: string) => {
      const reason = window.prompt('请输入停课原因', '门店临时停课') ?? '';
      if (!reason.trim()) return;
      const result = service.suspendSession(sessionId, { reason: reason.trim() });
      if (result.ok) {
        onToast('会员通知和权益回退待后续联动');
      } else {
        onToast(result.error);
      }
    },
    [service, onToast],
  );

  const filteredDays = useMemo(() => {
    return serviceDays.map(day => {
      let sessions = day.sessions;

      if (filters.type !== 'all') {
        sessions = sessions.filter(s => s.courseType === filters.type);
      }
      if (filters.teacher !== 'all') {
        sessions = sessions.filter(s => s.teacherName === filters.teacher);
      }
      if (filters.status !== 'all') {
        sessions = sessions.filter(s => s.status === filters.status);
      }
      if (filters.risk !== 'all') {
        sessions = sessions.filter(s =>
          s.riskTypes.includes(filters.risk as WeekScheduleRiskType),
        );
      }
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        sessions = sessions.filter(
          s =>
            s.courseName.toLowerCase().includes(q) ||
            s.teacherName.toLowerCase().includes(q) ||
            s.room.toLowerCase().includes(q),
        );
      }

      return { ...day, sessions: sortWeekSessions(sessions) };
    });
  }, [serviceDays, filters, keyword]);

  const hasResults = filteredDays.some(d => d.sessions.length > 0);
  const canReset = service.can('course.test_data.reset');

  return (
    <div className="met-week-schedule met-v2-density-compact" data-testid="course-week-root">
      <div className="met-week-schedule__inner">
        <SecondaryPageHeader
          backLabel="返回课程与排课"
          onBack={onBack}
          backVariant="link"
          breadcrumb={`${mockSnapshot.meta.breadcrumbParent} / ${mockSnapshot.meta.breadcrumbCurrent}`}
          title={mockSnapshot.meta.title}
          subtitle={mockSnapshot.meta.subtitle}
          className="met-week-schedule__page-header"
          headerActions={
            <>
              <div className="met-week-schedule__period-tabs">
                {mockSnapshot.periodTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    className={[
                      'met-week-schedule__period-tab',
                      period === tab.value ? 'is-active' : '',
                    ].join(' ')}
                    onClick={() => {
                      setPeriod(tab.value);
                      if (tab.value !== 'current') onToast(`切换${tab.label}视图（待建设）`);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {canReset ? (
                <button
                  type="button"
                  className="met-week-schedule__clear-link"
                  data-testid="course-reset-test-data"
                  onClick={handleResetTestData}
                >
                  重置测试数据
                </button>
              ) : null}
              <button
                type="button"
                className="met-week-schedule__btn met-week-schedule__btn--primary"
                onClick={onOpenNewSchedule}
              >
                新增排课
              </button>
            </>
          }
        />

        <div className="met-week-schedule__kpi-strip" aria-label="排课摘要">
          {coreMetrics.map(item => (
            <div
              key={item.id}
              className={[
                'met-week-schedule__kpi',
                item.status === 'warning' ? 'is-warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="met-week-schedule__kpi-label">{item.label}</span>
              <strong className="met-week-schedule__kpi-value">{item.value}</strong>
            </div>
          ))}
          {auxMetrics.length > 0 ? (
            <div className="met-week-schedule__kpi-aux">
              {auxMetrics.map(item => (
                <span key={item.id}>
                  {item.label} <b>{item.value}</b>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <section className="met-week-schedule__filters met-week-schedule__filters--toolbar">
          <div className="met-week-schedule__filter-toolbar">
            <div className="met-week-schedule__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索课程、老师或教室"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            {PRIMARY_FILTER_KEYS.map(key => {
              const group = FILTER_GROUPS.find(g => g.key === key)!;
              return (
                <label key={key} className="met-week-schedule__filter-field">
                  <span className="met-week-schedule__filter-field-label">{group.label}</span>
                  <select
                    className="met-week-schedule__filter-select"
                    value={filters[key]}
                    onChange={e => toggleFilter(key, e.target.value)}
                  >
                    {(optionsByGroup.get(key) ?? []).map(opt => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
            <button
              type="button"
              className="met-week-schedule__more-filters-btn"
              aria-expanded={showMoreFilters}
              onClick={() => setShowMoreFilters(v => !v)}
            >
              {showMoreFilters ? '收起筛选' : '更多筛选'}
            </button>
            <button type="button" className="met-week-schedule__clear-link" onClick={resetFilters}>
              清空
            </button>
          </div>
          {showMoreFilters ? (
            <div className="met-week-schedule__filter-toolbar met-week-schedule__filter-toolbar--more">
              {MORE_FILTER_KEYS.map(key => {
                const group = FILTER_GROUPS.find(g => g.key === key)!;
                return (
                  <label key={key} className="met-week-schedule__filter-field">
                    <span className="met-week-schedule__filter-field-label">{group.label}</span>
                    <select
                      className="met-week-schedule__filter-select"
                      value={filters[key]}
                      onChange={e => toggleFilter(key, e.target.value)}
                    >
                      {(optionsByGroup.get(key) ?? []).map(opt => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
          ) : null}
          {activeMoreFilterChips.length > 0 ? (
            <div className="met-week-schedule__active-chips">
              {activeMoreFilterChips.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  className="met-week-schedule__active-chip"
                  onClick={() => toggleFilter(chip.key, 'all')}
                >
                  {chip.label} ×
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="met-week-schedule__alerts">
          {(showAllAlerts
            ? mockSnapshot.conflictAlerts
            : mockSnapshot.conflictAlerts.slice(0, 1)
          ).map((alert, idx) => (
            <div key={alert.id} className="met-week-schedule__alert">
              <div className="met-week-schedule__alert-main">
                <span className="met-week-schedule__alert-type">{alert.riskTypeLabel}</span>
                <strong className="met-week-schedule__nowrap">{alert.timeLabel}</strong>
                <span className="met-week-schedule__alert-target">{alert.targetLabel}</span>
                <em>{alert.suggestedAction}</em>
              </div>
              <div className="met-week-schedule__alert-btns met-v2-btn-row">
                <button
                  type="button"
                  className="met-week-schedule__btn met-week-schedule__btn--sm"
                  onClick={() =>
                    alert.relatedSessionId
                      ? onOpenDetail(alert.relatedSessionId)
                      : onToast('查看课程（待建设）')
                  }
                >
                  查看课程
                </button>
                {idx === 0 && !showAllAlerts && mockSnapshot.conflictAlerts.length > 1 ? (
                  <button
                    type="button"
                    className="met-week-schedule__clear-link"
                    onClick={() => setShowAllAlerts(true)}
                  >
                    {`还有 ${mockSnapshot.conflictAlerts.length - 1} 条`}
                  </button>
                ) : null}
                {idx === 0 && showAllAlerts && mockSnapshot.conflictAlerts.length > 1 ? (
                  <button
                    type="button"
                    className="met-week-schedule__clear-link"
                    onClick={() => setShowAllAlerts(false)}
                  >
                    收起
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        {hasResults ? (
          <section className="met-week-schedule__grid">
            {filteredDays.map(day => (
              <div key={day.id} className="met-week-schedule__day-col">
                <div className="met-week-schedule__day-head">
                  <span className="met-week-schedule__day-label">{day.label}</span>
                  <span className="met-week-schedule__day-date met-week-schedule__nowrap">{day.dateLabel}</span>
                  <span className="met-week-schedule__day-count">{day.sessions.length} 节</span>
                </div>
                {day.sessions.length > 0 ? (
                  day.sessions.map(sess => (
                    <SessionCard
                      key={sess.sessionId}
                      sess={sess}
                      onOpenDetail={onOpenDetail}
                      onNavigateToStaff={onNavigateToStaff}
                      onReschedule={handleReschedule}
                      onSuspend={handleSuspend}
                    />
                  ))
                ) : (
                  <p className="met-week-schedule__day-empty">当日无匹配课程</p>
                )}
              </div>
            ))}
          </section>
        ) : (
          <div className="met-week-schedule__empty">
            <h3>暂无匹配课程</h3>
            <p>当前筛选条件下没有课程，请调整筛选或重置后重试。</p>
          </div>
        )}

        <section className="met-week-schedule__resources">
          <div className="met-week-schedule__resource-col">
            <h3 className="met-week-schedule__resource-title">可补排时段</h3>
            {mockSnapshot.availableSlots.map(slot => (
              <div key={slot.id} className="met-week-schedule__slot-card">
                <strong>{slot.timeLabel}</strong>
                <span>{slot.suggestedCourseType}</span>
                <span>{slot.availableRoom}</span>
                <em>{slot.leadNote}</em>
                <span>推荐：{slot.recommendedTeacher}</span>
                <button
                  type="button"
                  className="met-week-schedule__btn met-week-schedule__btn--sm"
                  onClick={onOpenNewSchedule}
                >
                  用此时段新增排课
                </button>
              </div>
            ))}
          </div>
          <div className="met-week-schedule__resource-col">
            <h3 className="met-week-schedule__resource-title">可补排老师</h3>
            {mockSnapshot.availableTeachers.map(teacher => (
              <div
                key={teacher.id}
                className={['met-week-schedule__teacher-card', teacher.isWarning ? 'is-warning' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="met-week-schedule__teacher-head">
                  <strong>{teacher.name}</strong>
                  <span>{teacher.statusLabel}</span>
                </div>
                <span>可授：{teacher.teachableCourses}</span>
                <span>{teacher.availabilityNote}</span>
                <em>{teacher.loadNote}</em>
                <p>{teacher.suggestedAction}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="met-week-schedule__batch-placeholder">{mockSnapshot.batchPlaceholder}</p>
      </div>
    </div>
  );
};

export default CourseSecondaryWeekSchedulePage;
