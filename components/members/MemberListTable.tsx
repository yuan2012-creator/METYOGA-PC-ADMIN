import React, { useMemo, useState } from 'react';
import {
  lifecycleBadgeClass,
  riskBadgeClass,
  type MemberLifecycleStage,
  type MemberRecord,
  type RiskTagType,
  type StageCode,
} from './memberOperationViewModel';
import MemberAvatar from './MemberAvatar';
import MemberStageBadge from './MemberStageBadge';

export interface MemberListFilters {
  query: string;
  stageCode: string;
  lifecycle: string;
  risk: string;
  manager: string;
  frequency: string;
  teacher: string;
  followToday: boolean;
}

interface MemberListTableProps {
  members: MemberRecord[];
  lifecycleStages: MemberLifecycleStage[];
  stageCodes: StageCode[];
  highlightId?: string | null;
  onOpenMember: (id: string) => void;
  externalStageCode?: string;
}

const MemberListTable: React.FC<MemberListTableProps> = ({
  members,
  lifecycleStages,
  stageCodes,
  highlightId,
  onOpenMember,
  externalStageCode,
}) => {
  const [filters, setFilters] = useState<MemberListFilters>({
    query: '',
    stageCode: 'all',
    lifecycle: 'all',
    risk: 'all',
    manager: 'all',
    frequency: 'all',
    teacher: 'all',
    followToday: false,
  });

  const effectiveStage = externalStageCode ?? filters.stageCode;

  const managers = useMemo(
    () => [...new Set(members.map(m => m.manager))].sort(),
    [members],
  );
  const teachers = useMemo(
    () => [...new Set(members.flatMap(m => m.practiceProfile.preferredTeachers))].sort(),
    [members],
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return members.filter(m => {
      if (filters.followToday && !m.needFollowToday) return false;
      if (effectiveStage !== 'all' && m.stageCode !== effectiveStage) return false;
      if (filters.lifecycle !== 'all' && m.lifecycleStage !== filters.lifecycle) return false;
      if (filters.manager !== 'all' && m.manager !== filters.manager) return false;
      if (filters.frequency !== 'all' && m.practiceProfile.classFrequencyLevel !== filters.frequency)
        return false;
      if (
        filters.teacher !== 'all' &&
        !m.practiceProfile.preferredTeachers.includes(filters.teacher) &&
        !m.serviceTeam.mainTeachers.includes(filters.teacher)
      )
        return false;
      if (filters.risk !== 'all' && !m.riskTags.some(r => r.type === filters.risk)) return false;
      if (q) {
        const hay = `${m.name}${m.phone}${m.memberCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [members, filters, effectiveStage]);

  return (
    <section className="met-member-list-card met-today-surface">
      <div className="met-member-list-card__filters">
        <input
          type="search"
          placeholder="搜索姓名 / 手机号 / 会员编号"
          value={filters.query}
          onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
          className="met-member-list-card__search"
        />
        <div className="met-member-list-card__filter-row">
          <select
            value={externalStageCode ?? filters.stageCode}
            onChange={e => setFilters(f => ({ ...f, stageCode: e.target.value }))}
            disabled={!!externalStageCode}
          >
            <option value="all">S 阶段</option>
            {stageCodes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={filters.lifecycle} onChange={e => setFilters(f => ({ ...f, lifecycle: e.target.value }))}>
            <option value="all">二级状态</option>
            {lifecycleStages.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={filters.frequency} onChange={e => setFilters(f => ({ ...f, frequency: e.target.value }))}>
            <option value="all">到课频率</option>
            <option value="高频">高频</option>
            <option value="稳定">稳定</option>
            <option value="低频">低频</option>
            <option value="沉睡">沉睡</option>
          </select>
          <select value={filters.risk} onChange={e => setFilters(f => ({ ...f, risk: e.target.value }))}>
            <option value="all">风险</option>
            {(
              ['快到期', '即将耗尽', '高余额低到课', '流失风险', '体验未成交', '退款风险', '需店长介入', '高价值'] as RiskTagType[]
            ).map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={filters.manager} onChange={e => setFilters(f => ({ ...f, manager: e.target.value }))}>
            <option value="all">管家</option>
            {managers.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select value={filters.teacher} onChange={e => setFilters(f => ({ ...f, teacher: e.target.value }))}>
            <option value="all">主要老师</option>
            {teachers.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="met-member-list-card__checkbox">
            <input
              type="checkbox"
              checked={filters.followToday}
              onChange={e => setFilters(f => ({ ...f, followToday: e.target.checked }))}
            />
            今日需跟进
          </label>
        </div>
      </div>

      <div className="met-member-list-card__table-wrap custom-scroll">
        <table className="met-member-table">
          <colgroup>
            <col className="met-member-table__col-member" />
            <col className="met-member-table__col-stage" />
            <col className="met-member-table__col-asset" />
            <col className="met-member-table__col-practice" />
            <col className="met-member-table__col-visit" />
            <col className="met-member-table__col-service" />
            <col className="met-member-table__col-risk" />
            <col className="met-member-table__col-action" />
          </colgroup>
          <thead>
            <tr>
              <th>会员</th>
              <th>阶段</th>
              <th>资产</th>
              <th>练习画像</th>
              <th>最近到课</th>
              <th>服务</th>
              <th>风险</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const p = m.practiceProfile;
              const lastCourse = m.courseRecords[0]?.courseName ?? p.lastCourseName ?? '—';
              return (
                <tr
                  key={m.id}
                  onClick={() => onOpenMember(m.id)}
                  className={highlightId === m.id ? 'is-selected' : undefined}
                >
                  <td>
                    <div className="met-member-cell-profile">
                      <MemberAvatar text={m.avatarText} tone={m.avatarTone} />
                      <div className="met-member-cell-profile-text">
                        <p className="met-member-table__name">{m.name}</p>
                        <p className="met-member-table__sub">
                          {m.phone} · {m.memberCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="met-member-table__cell-stage">
                    <MemberStageBadge code={m.stageCode} compact />
                    <span className={`met-member-table__badge ${lifecycleBadgeClass(m.lifecycleStage)}`}>
                      {m.lifecycleSubStatus}
                    </span>
                  </td>
                  <td>
                    <p className="met-member-table__primary">{m.primaryAsset}</p>
                    <p className="met-member-table__sub">
                      {m.remainingLabel} · {m.expireLabel}
                    </p>
                  </td>
                  <td>
                    <p className="met-member-table__primary">{p.classFrequencyLevel}</p>
                    <p className="met-member-table__sub">
                      {p.preferredCourseTypes[0] ?? '—'} · {p.preferredTeachers[0] ?? '—'}
                    </p>
                  </td>
                  <td>
                    <p className="met-member-table__primary">{m.lastVisitLabel}</p>
                    <p className="met-member-table__sub">{lastCourse}</p>
                  </td>
                  <td>
                    <p className="met-member-table__primary">{m.serviceTeam.ownerButler}</p>
                    <p className="met-member-table__sub">{m.serviceTeam.mainTeachers[0] ?? '—'}</p>
                  </td>
                  <td className="met-member-table__cell-risk">
                    {m.riskTags.length === 0 ? (
                      <span className="met-member-table__muted">—</span>
                    ) : (
                      <>
                        <span className={`met-member-table__badge ${riskBadgeClass(m.riskTags[0].type)}`}>
                          {m.riskTags[0].type}
                        </span>
                        {m.riskTags[1] ? (
                          <span className={`met-member-table__badge met-member-table__badge--sub ${riskBadgeClass(m.riskTags[1].type)}`}>
                            {m.riskTags[1].type}
                          </span>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="met-member-btn-table"
                      onClick={e => {
                        e.stopPropagation();
                        onOpenMember(m.id);
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="met-member-list-card__foot">
        共 {filtered.length} 位会员
        {effectiveStage !== 'all' ? ` · ${effectiveStage}` : ''}
      </footer>
    </section>
  );
};

export default MemberListTable;
