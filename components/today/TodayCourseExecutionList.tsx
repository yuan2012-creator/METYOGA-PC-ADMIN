import React from 'react';
import type { TodayCourseRow, TodayCourseStatusTone } from './todayOperationViewModel';

interface TodayCourseExecutionListProps {
  courses: TodayCourseRow[];
  onViewDetail: (courseId: string) => void;
}

const typeBadgeClass =
  'inline-flex rounded-md border border-stone-200/80 bg-stone-50/80 px-2 py-0.5 text-[10px] font-medium text-stone-500';

const statusToneClass = (tone: TodayCourseStatusTone): string => {
  switch (tone) {
    case 'ongoing':
      return 'bg-[#eef1ee] text-[#4a5c4f] ring-1 ring-[#dfe5df]';
    case 'upcoming':
      return 'bg-stone-50 text-stone-600 ring-1 ring-stone-200/70';
    case 'done':
      return 'bg-stone-50 text-stone-500 ring-1 ring-stone-200/50';
    case 'canceled':
      return 'bg-stone-50 text-stone-400 ring-1 ring-stone-200/50';
    case 'warning':
      return 'bg-amber-50/70 text-[#7A5C2E] ring-1 ring-amber-100/50';
    default:
      return 'bg-stone-50 text-stone-600 ring-1 ring-stone-200/70';
  }
};

const rowSurfaceClass = (course: TodayCourseRow): string => {
  if (course.statusTone === 'ongoing') return 'bg-[#f4f7f5]';
  if (course.abnormal) return 'bg-amber-50/15';
  return 'bg-white';
};

const accentBorderClass = (course: TodayCourseRow): string => {
  if (course.abnormal) return 'border-l-[3px] border-l-[#C9A88A]';
  return 'border-l-[3px] border-l-transparent';
};

const ghostActionClass =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-[10px] border border-stone-200/90 bg-white px-3 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50';

const TodayCourseExecutionList: React.FC<TodayCourseExecutionListProps> = ({ courses, onViewDetail }) => (
  <section className="met-today-surface overflow-hidden">
    <header className="border-b border-stone-100 bg-stone-50/30 px-5 py-4">
      <h3 className="text-sm font-semibold text-[#292524]">今日课程执行</h3>
      <p className="mt-0.5 text-xs text-stone-500">按开课时间 · 纵向工作台视图</p>
    </header>

    <div
      className="hidden grid-cols-[88px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_88px_72px] gap-3 border-b border-stone-100 px-5 py-2.5 text-xs font-medium text-stone-400 lg:grid"
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
        <li key={course.id} className={index > 0 ? 'border-t border-stone-100/90' : ''}>
          <article
            className={`${rowSurfaceClass(course)} ${accentBorderClass(course)} grid min-h-[80px] grid-cols-1 items-center gap-3 px-5 py-3.5 transition-colors hover:bg-stone-50/50 lg:grid-cols-[88px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_88px_72px] lg:gap-3`}
          >
            <div className="font-mono text-xs leading-tight text-stone-500">
              <span className="font-semibold text-[#3F3F46]">{course.timeStart}</span>
              <span className="block text-[11px] text-stone-400">{course.timeEnd}</span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold text-[#292524]">{course.name}</h4>
                <span className={typeBadgeClass}>{course.type}</span>
              </div>
              {course.abnormalHint ? (
                <p className="mt-1 text-xs leading-snug text-[#8B6914]">{course.abnormalHint}</p>
              ) : null}
            </div>

            <div className="text-xs leading-relaxed text-stone-500">
              <p>
                <span className="text-stone-400">老师 </span>
                {course.teacher}
              </p>
              <p className="mt-0.5">
                <span className="text-stone-400">教室 </span>
                {course.room}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <p>
                <span className="text-stone-400">预约 </span>
                <span className="font-medium tabular-nums text-[#3F3F46]">
                  {course.booked}/{course.capacity}
                </span>
              </p>
              <p>
                <span className="text-stone-400">已签到 </span>
                <span className="font-medium tabular-nums text-[#3F3F46]">{course.checkedIn}</span>
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
              <button type="button" className={ghostActionClass} onClick={() => onViewDetail(course.id)}>
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
