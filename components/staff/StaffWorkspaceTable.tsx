import React, { useMemo } from 'react';
import {
  computeStaffSegmentMiniSummary,
  filterStaffTeachers,
  STAFF_FILTER_OPTIONS,
  STAFF_SEGMENT_HINTS,
  STAFF_WORKBENCH_SEGMENTS,
  type StaffListFilters,
  type StaffOperationSnapshot,
  type StaffWorkbenchSegment,
} from './staffOperationViewModel';
import { formatStaffCny, formatStaffPercent, formatStaffScore, staffStatusClass } from './staffFormatters';

interface StaffWorkspaceTableProps {
  segment: StaffWorkbenchSegment;
  onSegmentChange: (s: StaffWorkbenchSegment) => void;
  snapshot: StaffOperationSnapshot;
  filters: StaffListFilters;
  onFiltersChange: (f: StaffListFilters) => void;
  highlightId?: string | null;
  onOpenTeacher: (id: string) => void;
  onViewChain: (id: string) => void;
}

const Chip: React.FC<{ text: string }> = ({ text }) => (
  <span className={`met-staff-chip met-staff-chip--${staffStatusClass(text)}`}>{text}</span>
);

const RowActions: React.FC<{
  id: string;
  onOpen: (id: string) => void;
  onChain: (id: string) => void;
}> = ({ id, onOpen, onChain }) => (
  <td className="met-staff-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-staff-table-btn" onClick={() => onOpen(id)}>
      查看详情
    </button>
    <button type="button" className="met-staff-table-btn" onClick={() => onChain(id)}>
      查看链路
    </button>
  </td>
);

const MiniSummary: React.FC<{ segment: StaffWorkbenchSegment; snapshot: StaffOperationSnapshot }> = ({
  segment,
  snapshot,
}) => {
  const stats = useMemo(() => computeStaffSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  return (
    <div className="met-staff-segment-summary" role="group">
      {stats.map(s => (
        <div key={s.label} className="met-staff-segment-summary__item">
          <span className="met-staff-segment-summary__label">{s.label}</span>
          <span className="met-staff-segment-summary__value">{s.value}</span>
        </div>
      ))}
    </div>
  );
};

const StaffWorkspaceTable: React.FC<StaffWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenTeacher,
  onViewChain,
}) => {
  const filteredTeachers = useMemo(
    () => filterStaffTeachers(snapshot.teachers, filters),
    [snapshot.teachers, filters],
  );

  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const filterBar = (
    <div className="met-staff-list-card__filters">
      <input
        type="search"
        placeholder="搜索老师 / 手机 / 门店 / 等级 / 课程"
        value={filters.query}
        onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
      />
      <select value={filters.store} onChange={e => onFiltersChange({ ...filters, store: e.target.value })}>
        {STAFF_FILTER_OPTIONS.stores.map(o => (
          <option key={o} value={o}>
            {o === '全部' ? '门店' : o}
          </option>
        ))}
      </select>
      <select
        value={filters.employmentType}
        onChange={e => onFiltersChange({ ...filters, employmentType: e.target.value })}
      >
        {STAFF_FILTER_OPTIONS.employmentTypes.map(o => (
          <option key={o} value={o}>
            {o === '全部' ? '类型' : o}
          </option>
        ))}
      </select>
      <select value={filters.level} onChange={e => onFiltersChange({ ...filters, level: e.target.value })}>
        {STAFF_FILTER_OPTIONS.levels.map(o => (
          <option key={o} value={o}>
            {o === '全部' ? '等级' : o}
          </option>
        ))}
      </select>
      <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
        {STAFF_FILTER_OPTIONS.risks.map(o => (
          <option key={o} value={o}>
            {o === '全部' ? '风险' : o}
          </option>
        ))}
      </select>
    </div>
  );

  const renderBody = () => {
    if (segment === 'profiles') {
      return (
        <table className="met-staff-table met-staff-table--profiles">
          <thead>
            <tr>
              <th>老师</th>
              <th>身份 / 类型</th>
              <th>当前等级</th>
              <th>所属门店</th>
              <th>主要课程</th>
              <th>近 30 天上课</th>
              <th>风险</th>
              <th className="met-staff-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(t => (
              <tr key={t.id} className={rowClass(t.id)} onClick={() => onOpenTeacher(t.id)}>
                <td>
                  <span className="met-staff-teacher-cell">
                    <span className="met-staff-avatar-sm">{t.avatarText}</span>
                    <span>
                      {t.name}
                      <span className="met-staff-table__muted"> {t.phoneMasked}</span>
                    </span>
                  </span>
                </td>
                <td>{t.employmentType}</td>
                <td className="met-staff-col-nowrap">
                  {t.teacherLevel}
                  {t.incomeLevel !== '—' ? (
                    <span className="met-staff-table__muted"> · {t.incomeLevel}</span>
                  ) : null}
                </td>
                <td>{t.storeName}</td>
                <td>{t.mainCourses}</td>
                <td>{t.monthlySessions} 节</td>
                <td>
                  {t.riskTags.length === 0 ? (
                    '—'
                  ) : (
                    t.riskTags.map(tag => (
                      <span key={tag} className="met-staff-risk-tag">
                        {tag}
                      </span>
                    ))
                  )}
                </td>
                <RowActions id={t.id} onOpen={onOpenTeacher} onChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'todayCourses') {
      const courses = snapshot.todayCourses.filter(c => {
        const teacher = snapshot.teachers.find(t => t.id === c.teacherId);
        if (!teacher) return true;
        return filterStaffTeachers([teacher], filters).length > 0;
      });
      return (
        <table className="met-staff-table met-staff-table--courses">
          <thead>
            <tr>
              <th className="met-staff-col-nowrap">时间</th>
              <th>老师</th>
              <th>课程</th>
              <th>类型</th>
              <th>门店 / 教室</th>
              <th>预约 / 到课</th>
              <th className="met-staff-col-status">状态</th>
              <th className="met-staff-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} className={rowClass(c.teacherId)} onClick={() => onOpenTeacher(c.teacherId)}>
                <td className="met-staff-col-nowrap">{c.time}</td>
                <td>{c.teacherName}</td>
                <td>{c.courseName}</td>
                <td>{c.courseType}</td>
                <td>{c.storeRoom}</td>
                <td>
                  {c.booked} / {c.attended}
                </td>
                <td className="met-staff-col-status">
                  <Chip text={c.status} />
                </td>
                <RowActions id={c.teacherId} onOpen={onOpenTeacher} onChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'payIncome') {
      const rows = filteredTeachers.filter(t => t.monthlySessions > 0 || t.pendingPayAmount > 0);
      return (
        <table className="met-staff-table met-staff-table--pay">
          <thead>
            <tr>
              <th>老师</th>
              <th>本月课时</th>
              <th className="met-staff-col-amount">团课课时费</th>
              <th className="met-staff-col-amount">小班课时费</th>
              <th className="met-staff-col-amount">私教收入</th>
              <th className="met-staff-col-amount">待核金额</th>
              <th className="met-staff-col-status">结算状态</th>
              <th className="met-staff-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className={rowClass(t.id)} onClick={() => onOpenTeacher(t.id)}>
                <td>{t.name}</td>
                <td>{t.monthlySessions} 节</td>
                <td className="met-staff-col-amount">{formatStaffCny(t.groupClassPay)}</td>
                <td className="met-staff-col-amount">{formatStaffCny(t.smallClassPay)}</td>
                <td className="met-staff-col-amount">{formatStaffCny(t.privateTrainingRevenue)}</td>
                <td className="met-staff-col-amount">{formatStaffCny(t.pendingPayAmount)}</td>
                <td className="met-staff-col-status">
                  <Chip text={t.payStatus} />
                </td>
                <RowActions id={t.id} onOpen={onOpenTeacher} onChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'growth') {
      const rows = filteredTeachers.filter(t => t.teacherLevel !== '—');
      return (
        <table className="met-staff-table met-staff-table--growth">
          <thead>
            <tr>
              <th>老师</th>
              <th>当前等级</th>
              <th>近 3 月到课 / 满课</th>
              <th>私教转化</th>
              <th>教学质量</th>
              <th>当前判断</th>
              <th>下一步建议</th>
              <th className="met-staff-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className={rowClass(t.id)} onClick={() => onOpenTeacher(t.id)}>
                <td>{t.name}</td>
                <td className="met-staff-col-nowrap">{t.teacherLevel}</td>
                <td>
                  {t.monthlySessions} 节 · {formatStaffPercent(t.fillRate)}
                </td>
                <td>{formatStaffPercent(t.privateConversionRate)}</td>
                <td>{formatStaffScore(t.memberFeedbackScore)}</td>
                <td className="met-staff-col-status">
                  <Chip text={t.growthJudgment} />
                </td>
                <td>{t.growthNextStep}</td>
                <RowActions id={t.id} onOpen={onOpenTeacher} onChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'leaveSubstitute') {
      return (
        <table className="met-staff-table met-staff-table--leave">
          <thead>
            <tr>
              <th>申请类型</th>
              <th>老师</th>
              <th>影响课程</th>
              <th className="met-staff-col-nowrap">时间</th>
              <th>代课老师</th>
              <th>影响会员</th>
              <th className="met-staff-col-status">状态</th>
              <th className="met-staff-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.leaveSubstitutes.map(l => (
              <tr key={l.id} className={rowClass(l.teacherId)} onClick={() => onOpenTeacher(l.teacherId)}>
                <td>{l.applyType}</td>
                <td>{l.teacherName}</td>
                <td>{l.affectedCourse}</td>
                <td className="met-staff-col-nowrap">{l.timeRange}</td>
                <td>{l.substituteName}</td>
                <td>{l.affectedMembers} 人</td>
                <td className="met-staff-col-status">
                  <Chip text={l.status} />
                </td>
                <RowActions id={l.teacherId} onOpen={onOpenTeacher} onChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="met-staff-table met-staff-table--perm">
        <thead>
          <tr>
            <th>员工</th>
            <th>角色</th>
            <th>后台权限</th>
            <th>老师端权限</th>
            <th>数据范围</th>
            <th>敏感权限</th>
            <th className="met-staff-col-status">状态</th>
            <th className="met-staff-col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map(t => (
            <tr key={t.id} className={rowClass(t.id)} onClick={() => onOpenTeacher(t.id)}>
              <td>{t.name}</td>
              <td>{t.permissionProfile.backendRole}</td>
              <td>{t.permissionProfile.backendScopes.slice(0, 2).join(' · ')}</td>
              <td>{t.meteachLabel}</td>
              <td>{t.permissionProfile.dataScope}</td>
              <td>{t.permissionProfile.sensitiveFlags.join(' · ') || '—'}</td>
              <td className="met-staff-col-status">
                <Chip text={t.permissionProfile.status} />
              </td>
              <RowActions id={t.id} onOpen={onOpenTeacher} onChain={onViewChain} />
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className="met-staff-list-card met-today-surface">
      <header className="met-staff-list-card__head">
        <h2>师资经营工作台</h2>
        <p className="met-staff-list-card__hint">{STAFF_SEGMENT_HINTS[segment]}</p>
        <div className="met-staff-segments" role="tablist">
          {STAFF_WORKBENCH_SEGMENTS.map(s => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={segment === s.id}
              className={segment === s.id ? 'is-active' : ''}
              onClick={() => onSegmentChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {filterBar}
      </header>
      <MiniSummary segment={segment} snapshot={snapshot} />
      <div className="met-staff-table-wrap custom-scroll">{renderBody()}</div>
    </section>
  );
};

export default StaffWorkspaceTable;
