import React from 'react';
import type { TodayCourseRow, TodayCourseStatusTone } from './todayOperationViewModel';

interface TodayCourseExecutionListProps {
  courses: TodayCourseRow[];
  onViewDetail: (courseId: string) => void;
}

const typeBadgeClass =
  'inline-flex rounded-md border border-[#E1E3DD] bg-[#F7F8F5] px-2 py-0.5 text-[10px] font-medium text-[#7A817A]';

const statusToneClass = (tone: TodayCourseStatusTone): string => {
  switch (tone) {
    case 'ongoing':
      return 'bg-[#F0F3EF] text-[#4a5c4f] ring-1 ring-[#E1E3DD]';
    case 'upcoming':
      return 'bg-[#F7F8F5] text-[#565D56] ring-1 ring-[#E1E3DD]';
    case 'done':
      return 'bg-[#F7F8F5] text-[#7A817A] ring-1 ring-[#E1E3DD]';
    case 'canceled':
      return 'bg-[#F7F8F5] text-[#9A9F98] ring-1 ring-[#E1E3DD]';
    case 'warning':
      return 'bg-[#FAF6F0] text-[#8A6A3A] ring-1 ring-[#E8DFD0]';
    default:
      return 'bg-[#F7F8F5] text-[#565D56] ring-1 ring-[#E1E3DD]';
  }
};

const rowSurfaceClass = (course: TodayCourseRow): string => {
  if (course.statusTone === 'ongoing') return 'bg-[#F5F8F4]';
  if (course.abnormal) return 'bg-[#FAF8F4]';
  return 'bg-[#FCFCFA]';
};

const accentBorderClass = (course: TodayCourseRow): string => {
  if (course.abnormal) return 'border-l-[3px] border-l-[#C7A77A]';
  return 'border-l-[3px] border-l-transparent';
};

const ghostActionClass =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-[10px] border border-[#DADDD5] bg-[#FCFCFA] px-3 text-xs font-medium text-[#333833] transition-colors hover:border-[#C8CCC4] hover:bg-[#F0F1ED]';

const TodayCourseExecutionList: React.FC<TodayCourseExecutionListProps> = ({ courses, onViewDetail }) => (
  <section className="met-today-surface overflow-hidden rounded-2xl">
    <header className="flex h-11 items-center border-b border-[#DDDFD8] bg-[#F7F8F5] px-5">
      <div>
        <h3 className="text-sm font-semibold text-[#222622]" style={{ fontWeight: 650 }}>
          今日课程执行
        </h3>
        <p className="mt-0.5 text-xs text-[#737A73]">按开课时间 · 纵向工作台视图</p>
      </div>
    </header>

    <div
      className="hidden h-11 grid-cols-[88px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_88px_72px] items-center gap-3 border-b border-[#DDDFD8] bg-[#F7F8F5] px-5 text-xs font-medium text-[#737A73] lg:grid"
      aria-hidden
    >
      <span>时间</span>
      <span>课程</span>
      <span>老师 / 教室</span>
      <span>预约 · 签到</span>
      <span>状态</span>
      <span className="text-right">操作</span>
    </div>

    <ul>
      {courses.map((course, index) => (
        <li key={course.id} className={index > 0 ? 'border-t border-[#DDDFD8]' : ''}>
          <article
            className={`${rowSurfaceClass(course)} ${accentBorderClass(course)} grid min-h-[82px] grid-cols-1 items-center gap-3 px-5 py-3 transition-colors hover:bg-[#F7F8F5] lg:grid-cols-[88px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_88px_72px] lg:gap-3`}
          >
            <div className="text-[13px] leading-tight text-[#7A817A]">
              <span className="font-semibold text-[#222622]" style={{ fontWeight: 650 }}>
                {course.timeStart}
              </span>
              <span className="block text-[11px] text-[#9A9F98]">{course.timeEnd}</span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm text-[#222622]" style={{ fontWeight: 650 }}>
                  {course.name}
                </h4>
                <span className={typeBadgeClass}>{course.type}</span>
              </div>
              {course.abnormalHint ? (
                <p className="mt-1 text-xs leading-snug text-[#9A6A36]">{course.abnormalHint}</p>
              ) : null}
            </div>

            <div className="text-xs leading-relaxed text-[#7A817A]">
              <p>
                <span className="text-[#9A9F98]">老师 </span>
                {course.teacher}
              </p>
              <p className="mt-0.5">
                <span className="text-[#9A9F98]">教室 </span>
                {course.room}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#565D56]">
              <p>
                <span className="text-[#9A9F98]">预约 </span>
                <span className="font-medium tabular-nums text-[#222622]">
                  {course.booked}/{course.capacity}
                </span>
              </p>
              <p>
                <span className="text-[#9A9F98]">已签到 </span>
                <span className="font-medium tabular-nums text-[#222622]">{course.checkedIn}</span>
              </p>
            </div>

            <div className="lg:justify-self-start">
              <span
                className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${statusToneClass(course.statusTone)}`}
              >
                {course.statusLabel}
              </span>
            </div>

            <div className="flex lg:justify-end">
              <button
                type="button"
                className={`${ghostActionClass} !h-8`}
                onClick={() => onViewDetail(course.id)}
              >
                查看详情
              </button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  </section>
);

export default TodayCourseExecutionList;
