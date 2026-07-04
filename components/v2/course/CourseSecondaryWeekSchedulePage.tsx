import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import {
  buildWeekScheduleSnapshot,
  getWeekScheduleStatusClass,
  sortWeekSessions,
  type WeekScheduleFilterOption,
  type WeekScheduleRiskType,
  type WeekScheduleSessionCard,
} from './courseSecondaryWeekSchedule.viewModel';
import './courseSecondaryWeekSchedule.css';

export type WeekScheduleInitialMode = 'default' | 'lowAttendance' | 'teacherConflict';

export interface CourseSecondaryWeekSchedulePageProps {
  initialMode?: WeekScheduleInitialMode;
  onBack: () => void;
  onOpenDetail: (sessionId: string) => void;
  onOpenNewSchedule: () => void;
  onToast: (message: string) => void;
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
  onToast,
}: {
  sess: WeekScheduleSessionCard;
  onOpenDetail: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isRisk =
    sess.status === 'lowAttendance' ||
    sess.status === 'teacherLeaveRisk' ||
    sess.status === 'conflictWarning';

  return (
    <article
      className={['met-week-schedule__card', isRisk ? 'met-week-schedule__card--risk' : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(sess.detailKey)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(sess.detailKey);
      }}
    >
      <div className="met-week-schedule__card-head">
        <span className="met-week-schedule__card-time">{sess.startTime}</span>
        <span className={['met-week-schedule__card-status', getWeekScheduleStatusClass(sess.status)].join(' ')}>
          {sess.statusLabel}
        </span>
      </div>
      <h4 className="met-week-schedule__card-name">{sess.courseName}</h4>
      <p className="met-week-schedule__card-meta">
        {sess.courseType} · {sess.teacherName} · {sess.room}
      </p>
      <div className="met-week-schedule__card-stats">
        <span>{sess.bookedCount}/{sess.capacity}</span>
        {sess.waitlistCount > 0 ? <span>候补 {sess.waitlistCount}</span> : null}
        <span>签到 {sess.checkedInCount}</span>
        <span>{sess.pointCost} 点</span>
      </div>
      {sess.riskTags.length > 0 ? (
        <div className="met-week-schedule__card-tags">
          {sess.riskTags.map(tag => (
            <span key={tag} className="met-week-schedule__tag">{tag}</span>
          ))}
        </div>
      ) : null}
      <p className="met-week-schedule__card-action">{sess.suggestedAction}</p>
      <div className="met-week-schedule__card-btns" onClick={stop}>
        <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm" onClick={() => onOpenDetail(sess.detailKey)}>查看详情</button>
        <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={() => onToast('进入补员名单（待建设）')}>补员</button>
        <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={() => onToast('课程调整（待建设）')}>调整</button>
        <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={() => onToast('协调代课（待建设）')}>代课</button>
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
}) => {
  const snapshot = useMemo(() => buildWeekScheduleSnapshot(), []);
  const [period, setPeriod] = useState('current');
  const [filters, setFilters] = useState<Record<FilterGroupKey, string>>(() => ({
    ...DEFAULT_FILTERS,
    status: initialMode === 'lowAttendance' ? 'lowAttendance' : 'all',
    risk: initialMode === 'teacherConflict' ? 'teacherConflict' : 'all',
  }));
  const [keyword, setKeyword] = useState('');

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, WeekScheduleFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    snapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [snapshot.filterOptions]);

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

  const filteredDays = useMemo(() => {
    return snapshot.days.map(day => {
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
  }, [snapshot.days, filters, keyword]);

  const hasResults = filteredDays.some(d => d.sessions.length > 0);

  return (
    <div className="met-week-schedule">
      <div className="met-week-schedule__inner">
        <header className="met-week-schedule__header">
          <div className="met-week-schedule__header-top">
            <button type="button" className="met-week-schedule__back" onClick={onBack}>
              <ArrowLeft size={16} aria-hidden />
              返回课程与排课
            </button>
            <div className="met-week-schedule__header-actions">
              <div className="met-week-schedule__period-tabs">
                {snapshot.periodTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    className={['met-week-schedule__period-tab', period === tab.value ? 'is-active' : ''].join(' ')}
                    onClick={() => {
                      setPeriod(tab.value);
                      if (tab.value !== 'current') onToast(`切换${tab.label}视图（待建设）`);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button type="button" className="met-week-schedule__btn met-week-schedule__btn--primary" onClick={onOpenNewSchedule}>
                新增排课
              </button>
            </div>
          </div>
          <p className="met-week-schedule__breadcrumb">{snapshot.meta.breadcrumbParent} / {snapshot.meta.breadcrumbCurrent}</p>
          <h1 className="met-week-schedule__title">{snapshot.meta.title}</h1>
          <p className="met-week-schedule__subtitle">{snapshot.meta.subtitle}</p>
          <p className="met-week-schedule__scope">{snapshot.meta.scopeLabel}</p>
          <p className="met-week-schedule__desc">{snapshot.meta.description}</p>
        </header>

        <section className="met-week-schedule__summary">
          {snapshot.summaryItems.map(item => (
            <div key={item.id} className={['met-week-schedule__summary-card', item.isWarning ? 'is-warning' : ''].filter(Boolean).join(' ')}>
              <span className="met-week-schedule__summary-value">{item.value}</span>
              <span className="met-week-schedule__summary-label">{item.label}</span>
            </div>
          ))}
        </section>

        <section className="met-week-schedule__filters">
          <div className="met-week-schedule__filter-groups">
            {FILTER_GROUPS.map(group => (
              <div key={group.key} className="met-week-schedule__filter-group">
                <span className="met-week-schedule__filter-label">{group.label}</span>
                <div className="met-week-schedule__filter-options">
                  {(optionsByGroup.get(group.key) ?? []).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={['met-week-schedule__filter-chip', filters[group.key] === opt.value ? 'is-active' : ''].join(' ')}
                      onClick={() => toggleFilter(group.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="met-week-schedule__filter-foot">
            <div className="met-week-schedule__search">
              <Search size={14} aria-hidden />
              <input type="search" placeholder="搜索课程名、老师或教室" value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <button type="button" className="met-week-schedule__btn met-week-schedule__btn--ghost met-week-schedule__btn--sm" onClick={resetFilters}>重置筛选</button>
          </div>
        </section>

        <section className="met-week-schedule__alerts">
          {snapshot.conflictAlerts.map(alert => (
            <div key={alert.id} className="met-week-schedule__alert">
              <div className="met-week-schedule__alert-main">
                <span className="met-week-schedule__alert-type">{alert.riskTypeLabel}</span>
                <strong>{alert.timeLabel}</strong>
                <span>{alert.targetLabel}</span>
                <em>{alert.suggestedAction}</em>
              </div>
              <div className="met-week-schedule__alert-btns">
                <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={() => alert.relatedSessionId ? onOpenDetail(alert.relatedSessionId) : onToast('查看课程（待建设）')}>查看课程</button>
                <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={onOpenNewSchedule}>去补排</button>
                <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm met-week-schedule__btn--ghost" onClick={() => onToast('协调老师（待建设）')}>协调老师</button>
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
                  <span className="met-week-schedule__day-date">{day.dateLabel}</span>
                  <span className="met-week-schedule__day-count">{day.sessions.length} 节</span>
                </div>
                {day.sessions.length > 0 ? (
                  day.sessions.map(sess => (
                    <SessionCard key={sess.sessionId} sess={sess} onOpenDetail={onOpenDetail} onToast={onToast} />
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
            {snapshot.availableSlots.map(slot => (
              <div key={slot.id} className="met-week-schedule__slot-card">
                <strong>{slot.timeLabel}</strong>
                <span>{slot.suggestedCourseType}</span>
                <span>{slot.availableRoom}</span>
                <em>{slot.leadNote}</em>
                <span>推荐：{slot.recommendedTeacher}</span>
                <button type="button" className="met-week-schedule__btn met-week-schedule__btn--sm" onClick={onOpenNewSchedule}>用此时段新增排课</button>
              </div>
            ))}
          </div>
          <div className="met-week-schedule__resource-col">
            <h3 className="met-week-schedule__resource-title">可补排老师</h3>
            {snapshot.availableTeachers.map(teacher => (
              <div key={teacher.id} className={['met-week-schedule__teacher-card', teacher.isWarning ? 'is-warning' : ''].filter(Boolean).join(' ')}>
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

        <p className="met-week-schedule__batch-placeholder">{snapshot.batchPlaceholder}</p>
      </div>
    </div>
  );
};

export default CourseSecondaryWeekSchedulePage;
