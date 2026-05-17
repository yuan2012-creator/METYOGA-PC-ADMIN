import React, { useMemo, useState } from 'react';
import type { CourseRecord, MemberRecord } from './memberOperationViewModel';
import {
  MemberModalBlock,
  MemberModalMiniStat,
  MemberModalMiniStatRow,
  MemberModalPanel,
} from './memberModalShared';

const PAGE_SIZE = 20;
const DEMO_LIST_TARGET = 30;

/** 在 Tab 内扩展 demo 列表，不改全局 mock */
export const expandDemoCourseRecords = (records: CourseRecord[], memberId: string): CourseRecord[] => {
  if (records.length === 0) return [];
  const out: CourseRecord[] = [...records];
  let i = 0;
  while (out.length < DEMO_LIST_TARGET) {
    const src = records[i % records.length];
    const day = 28 - (out.length % 28);
    out.push({
      ...src,
      id: `${src.id}-x${out.length}`,
      courseDate: `04-${String(Math.max(1, day)).padStart(2, '0')}`,
      attendanceStatus: out.length % 9 === 0 ? '爽约' : src.attendanceStatus,
      bookingStatus: out.length % 11 === 0 ? '已取消' : src.bookingStatus,
    });
    i += 1;
  }
  return out;
};

const CourseRow: React.FC<{ record: CourseRecord }> = ({ record: r }) => (
  <li className="met-member-course-row">
    <p className="met-member-course-row__line1">
      <span className="met-member-course-row__date">{r.courseDate}</span>
      <span className="met-member-course-row__name">{r.courseName}</span>
      <span className="met-member-course-row__status">{r.attendanceStatus}</span>
    </p>
    <p className="met-member-course-row__line2">
      {r.courseType} / {r.teacherName} / {r.storeName} / 扣 {r.consumedPointsOrTimes}
    </p>
  </li>
);

interface MemberCourseRecordsSubviewProps {
  member: MemberRecord;
  onBack: () => void;
}

export const MemberCourseRecordsSubview: React.FC<MemberCourseRecordsSubviewProps> = ({
  member: m,
  onBack,
}) => {
  const allRecords = useMemo(
    () => expandDemoCourseRecords(m.courseRecords, m.id),
    [m.courseRecords, m.id],
  );

  const [range, setRange] = useState<'30d' | '90d' | 'all'>('all');
  const [courseType, setCourseType] = useState<string>('全部');
  const [attendance, setAttendance] = useState<string>('全部');
  const [teacher, setTeacher] = useState<string>('全部');
  const [page, setPage] = useState(1);

  const teachers = useMemo(
    () => ['全部', ...Array.from(new Set(allRecords.map(r => r.teacherName)))],
    [allRecords],
  );

  const filtered = useMemo(() => {
    return allRecords.filter(r => {
      if (courseType !== '全部' && r.courseType !== courseType) return false;
      if (attendance !== '全部' && r.attendanceStatus !== attendance) return false;
      if (teacher !== '全部' && r.teacherName !== teacher) return false;
      if (range === '30d' && !r.courseDate.startsWith('05-')) return false;
      if (range === '90d' && r.courseDate.startsWith('03-')) return false;
      return true;
    });
  }, [allRecords, courseType, attendance, teacher, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const applyFilter = (next: Partial<{ range: typeof range; courseType: string; attendance: string; teacher: string }>) => {
    setPage(1);
    if (next.range !== undefined) setRange(next.range);
    if (next.courseType !== undefined) setCourseType(next.courseType);
    if (next.attendance !== undefined) setAttendance(next.attendance);
    if (next.teacher !== undefined) setTeacher(next.teacher);
  };

  return (
    <div className="met-member-course-subview">
      <button type="button" className="met-member-asset-detail-subview__back" onClick={onBack}>
        ← 返回课程/私教
      </button>
      <div className="met-member-course-subview__filters">
        <label className="met-member-course-subview__filter">
          <span>时间范围</span>
          <select value={range} onChange={e => applyFilter({ range: e.target.value as typeof range })}>
            <option value="30d">近 30 天</option>
            <option value="90d">近 90 天</option>
            <option value="all">全部</option>
          </select>
        </label>
        <label className="met-member-course-subview__filter">
          <span>课程类型</span>
          <select value={courseType} onChange={e => applyFilter({ courseType: e.target.value })}>
            <option value="全部">全部</option>
            <option value="团课">团课</option>
            <option value="小班">小班</option>
            <option value="私教">私教</option>
            <option value="教培">教培</option>
          </select>
        </label>
        <label className="met-member-course-subview__filter">
          <span>到课状态</span>
          <select value={attendance} onChange={e => applyFilter({ attendance: e.target.value })}>
            <option value="全部">全部</option>
            <option value="已到课">已到课</option>
            <option value="未到课">未到课</option>
            <option value="请假">请假</option>
            <option value="爽约">爽约</option>
          </select>
        </label>
        <label className="met-member-course-subview__filter">
          <span>老师</span>
          <select value={teacher} onChange={e => applyFilter({ teacher: e.target.value })}>
            {teachers.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="met-member-course-subview__summary">
        共 {filtered.length} 条 · 第 {safePage} / {totalPages} 页
      </p>
      {pageItems.length === 0 ? (
        <p className="met-member-empty">暂无符合条件的课程记录</p>
      ) : (
        <ul className="met-member-course-list met-member-course-list--stacked">
          {pageItems.map(r => (
            <CourseRow key={r.id} record={r} />
          ))}
        </ul>
      )}
      {totalPages > 1 ? (
        <div className="met-member-course-subview__pager">
          <button
            type="button"
            className="met-member-btn-sm"
            disabled={safePage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            className="met-member-btn-sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>
      ) : null}
    </div>
  );
};

interface MemberCoursePrivateTabProps {
  member: MemberRecord;
  onViewAllCourses: () => void;
}

const MemberCoursePrivateTab: React.FC<MemberCoursePrivateTabProps> = ({ member: m, onViewAllCourses }) => {
  const att = m.attendanceSummary;
  const recentCourses = m.courseRecords.slice(0, 5);
  const primaryPt = m.privateTrainingRecords[0];
  const recentPt = m.privateTrainingRecords.slice(0, 3);

  return (
    <div className="met-member-tab-content">
      <MemberModalBlock title="课程概览">
        <MemberModalMiniStatRow>
          <MemberModalMiniStat label="近 30 天到课" value={`${att.checkins30d} 次`} />
          <MemberModalMiniStat
            label="近 30 天爽约 / 取消"
            value={`${att.noShows30d} 次 / ${att.cancels30d} 次`}
          />
          <MemberModalMiniStat label="累计耗课" value={`${att.consumption30d} 点`} sub="近 30 天" />
          <MemberModalMiniStat label="最近到店" value={m.lastVisitLabel} />
        </MemberModalMiniStatRow>
      </MemberModalBlock>

      <MemberModalBlock title="最近课程记录">
        {recentCourses.length === 0 ? (
          <p className="met-member-empty">暂无课程记录</p>
        ) : (
          <>
            <ul className="met-member-course-list met-member-course-list--stacked">
              {recentCourses.map(r => (
                <CourseRow key={r.id} record={r} />
              ))}
            </ul>
            {m.courseRecords.length > 0 ? (
              <button type="button" className="met-member-course-all-btn" onClick={onViewAllCourses}>
                查看全部课程记录
              </button>
            ) : null}
          </>
        )}
      </MemberModalBlock>

      <MemberModalBlock title="私教记录">
        {m.privateTrainingRecords.length === 0 ? (
          <div className="met-member-pt-empty">
            <p className="met-member-empty">暂无私教记录</p>
            <p className="met-member-pt-empty__hint">可根据练习目标建议管家跟进私教转化</p>
          </div>
        ) : (
          <>
            {primaryPt ? (
              <MemberModalPanel className="met-member-pt-summary">
                <p className="met-member-pt-summary__title">{primaryPt.packageName}</p>
                <p className="met-member-pt-summary__meta">
                  {primaryPt.coachName} · 进度 {primaryPt.completedSessions}/{primaryPt.totalSessions} 节 ·{' '}
                  {primaryPt.conversionStatus}
                </p>
                <p className="met-member-pt-summary__meta">{primaryPt.nextSuggestedAction}</p>
              </MemberModalPanel>
            ) : null}
            {recentPt.length > 0 ? (
              <ul className="met-member-pt-records">
                {recentPt.map(r => (
                  <li key={r.id} className="met-member-pt-records__item">
                    <p className="met-member-pt-records__title">
                      {r.lastSessionDate} · {r.packageName}
                    </p>
                    <p className="met-member-pt-records__sub">
                      {r.coachName} · 剩余 {r.remainingSessions} 节 · {r.trainingGoal}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </MemberModalBlock>
    </div>
  );
};

export default MemberCoursePrivateTab;
