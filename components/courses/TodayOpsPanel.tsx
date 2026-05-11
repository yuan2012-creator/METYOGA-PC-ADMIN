import React from 'react';
import type { Attendance, Booking, CourseSession } from '../../types';
import type {
  CourseOpsSummary,
  OpsFilter,
  OpsScheduleItem,
  ScheduleEvent,
} from '../../utils/courseSelectors';
import {
  getCourseSessionDisplayStatus,
  getCourseSessionToneBadgeClass,
} from '../../utils/courseSessionStatus';
import type { CourseSessionOpsTab } from './CourseSessionOpsDrawer';

interface TodayOpsPanelProps {
  opsFilter: OpsFilter;
  setOpsFilter: React.Dispatch<React.SetStateAction<OpsFilter>>;
  filteredOpsSchedule: OpsScheduleItem[];
  opsSummary: CourseOpsSummary;
  aiGuidance: string;
  calendarSessions: ScheduleEvent[];
  bookings: Booking[];
  attendances: Attendance[];
  onOpenSessionCard: (sessionId: string) => void;
  onOpenSessionOpsDrawer: (tab: CourseSessionOpsTab, sessionId?: string) => void;
  onOpenCheckInReview: () => void;
  onOpenExceptionCenter: () => void;
}

const courseSessionForDisplay = (cls: OpsScheduleItem, evt: ScheduleEvent | undefined): CourseSession => {
  if (evt) return evt;
  return {
    id: cls.id,
    courseId: cls.courseId,
    status: cls.courseSessionStatus,
    startAt: cls.startAt,
    endAt: cls.endAt,
    capacity: cls.capacity,
    bookedCount: cls.enrolled,
    title: cls.name,
  };
};

const filterBtnClass = (active: boolean): string =>
  active
    ? 'border border-[#1f5e3b] bg-[#1f5e3b] text-white shadow-sm'
    : 'border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200';

const actionBtnSecondary =
  'met-secondary-button !min-h-[34px] !max-h-[38px] !h-9 !px-3 !py-0 !text-xs !rounded-[13px] whitespace-nowrap';
const TodayOpsPanel: React.FC<TodayOpsPanelProps> = ({
  opsFilter,
  setOpsFilter,
  filteredOpsSchedule,
  opsSummary,
  aiGuidance,
  calendarSessions,
  bookings,
  attendances,
  onOpenSessionCard,
  onOpenSessionOpsDrawer,
  onOpenCheckInReview,
  onOpenExceptionCenter,
}) => (
  <>
                      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                              <div>
                                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                      <i className="fa-solid fa-calendar-day text-[#1f5e3b]" aria-hidden /> 今日课程执行面板
                                  </h3>
                                  <p className="mt-1 text-xs text-gray-500">2026年05月05日 · 星期二</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  <button type="button" className={`${actionBtnSecondary} gap-1.5`} onClick={onOpenCheckInReview}>
                                      <i className="fa-solid fa-qrcode text-[11px]" aria-hidden /> 签到核验
                                  </button>
                                  <button type="button" className={`${actionBtnSecondary} gap-1.5`} onClick={onOpenExceptionCenter}>
                                      <i className="fa-solid fa-clipboard-check text-[11px]" aria-hidden /> 异常处理
                                  </button>
                              </div>
                          </div>

                          <div className="mb-5 flex flex-wrap gap-2">
                              <button
                                  type="button"
                                  onClick={() => setOpsFilter('all')}
                                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterBtnClass(opsFilter === 'all')}`}
                              >
                                  全部课程
                              </button>
                              <button
                                  type="button"
                                  onClick={() => setOpsFilter('group')}
                                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterBtnClass(opsFilter === 'group')}`}
                              >
                                  团课 / 小班
                              </button>
                              <button
                                  type="button"
                                  onClick={() => setOpsFilter('private')}
                                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filterBtnClass(opsFilter === 'private')}`}
                              >
                                  私教预约
                              </button>
                          </div>

                          <div className="relative pb-2">
                              <div className="absolute left-0 right-0 top-[7px] z-0 h-px min-w-max bg-gray-200" aria-hidden />
                              <div className="relative z-10 flex min-w-max gap-5 px-1">
                                  {filteredOpsSchedule.map((cls) => {
                                      const emptySpots = cls.capacity - cls.enrolled;
                                      const isPast = cls.state === 'finished';
                                      const isOngoing = cls.state === 'ongoing';
                                      const timeParts = cls.time.split(' - ');
                                      const timeStart = timeParts[0]?.trim() ?? '';
                                      const timeEnd = timeParts[1]?.trim() ?? '';
                                      const cardBorder = cls.abnormal
                                          ? 'border border-rose-100/90 bg-white'
                                          : 'border border-gray-200 bg-white';
                                      const evt = calendarSessions.find(s => s.id === cls.id);
                                      const sessionRow = courseSessionForDisplay(cls, evt);
                                      const displayStatus = getCourseSessionDisplayStatus({
                                        session: sessionRow,
                                        bookings,
                                        attendances,
                                      });
                                      const statusBadgeClass = getCourseSessionToneBadgeClass(displayStatus.tone);

                                      return (
                                          <div key={cls.id} className="relative w-[268px] max-w-[280px] flex-shrink-0 pt-5">
                                              <div
                                                  className={`absolute left-2 top-0 z-10 h-2.5 w-2.5 rounded-full border-2 border-white ${
                                                      isPast ? 'bg-gray-300' : isOngoing ? 'bg-[#2d7a4f]' : 'bg-[#1f5e3b]/70'
                                                  }`}
                                                  aria-hidden
                                              />
                                              <div
                                                  role="button"
                                                  tabIndex={0}
                                                  onClick={() => onOpenSessionCard(cls.id)}
                                                  onKeyDown={e => {
                                                      if (e.key === 'Enter' || e.key === ' ') {
                                                          e.preventDefault();
                                                          onOpenSessionCard(cls.id);
                                                      }
                                                  }}
                                                  className={`mt-2 flex min-h-0 cursor-pointer flex-col gap-3 rounded-2xl p-5 outline-none transition-colors ${cardBorder} hover:border-gray-300 hover:bg-gray-50/60 focus-visible:ring-2 focus-visible:ring-[#1f5e3b]/30 ${cls.abnormal ? 'hover:border-rose-100/90' : ''}`}
                                              >
                                                  {/* 第一层：顶部状态行 */}
                                                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                                                      <div className="min-w-0 flex-1">
                                                          <div className="text-base font-bold leading-snug text-gray-900">{cls.name}</div>
                                                          <span className="mt-1 inline-block rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                                              {cls.type}
                                                          </span>
                                                      </div>
                                                      <span
                                                          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${statusBadgeClass}`}
                                                      >
                                                          {displayStatus.label}
                                                      </span>
                                                  </div>

                                                  {/* 第二层：基础信息行 */}
                                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                                      <span className="font-mono font-medium text-gray-700">
                                                          {timeStart}
                                                          <span className="text-gray-400"> — </span>
                                                          {timeEnd}
                                                      </span>
                                                      <span className="text-gray-300" aria-hidden>
                                                          |
                                                      </span>
                                                      <span className="inline-flex items-center gap-1">
                                                          <i className="fa-solid fa-user text-[10px] text-gray-400" aria-hidden />
                                                          {cls.teacher}
                                                      </span>
                                                      <span className="text-gray-300" aria-hidden>
                                                          |
                                                      </span>
                                                      <span className="inline-flex items-center gap-1">
                                                          <i className="fa-solid fa-door-open text-[10px] text-gray-400" aria-hidden />
                                                          {cls.room}
                                                      </span>
                                                  </div>

                                                  {/* 第三层：执行数据行 */}
                                                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                                                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-[11px] text-gray-500">
                                                          <div>
                                                              <span className="text-gray-500">预约 </span>
                                                              <span className="text-lg font-semibold tabular-nums text-gray-900">{cls.enrolled}</span>
                                                              <span className="text-gray-400"> / </span>
                                                              <span className="text-sm font-semibold tabular-nums text-gray-700">{cls.capacity}</span>
                                                          </div>
                                                          <div>
                                                              <span className="text-gray-500">已到 </span>
                                                              <span className="text-lg font-semibold tabular-nums text-gray-900">{cls.signed}</span>
                                                          </div>
                                                          <div>
                                                              <span className="text-gray-500">空位 </span>
                                                              <span className="text-lg font-semibold tabular-nums text-gray-900">{emptySpots}</span>
                                                          </div>
                                                          <div className="inline-flex items-center gap-1.5">
                                                              <span className="text-gray-500">满员</span>
                                                              <span
                                                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                                                      cls.status === 'full'
                                                                          ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
                                                                          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                                                                  }`}
                                                              >
                                                                  {cls.status === 'full' ? '是' : '否'}
                                                              </span>
                                                          </div>
                                                          <div className="inline-flex items-center gap-1.5">
                                                              <span className="text-gray-500">异常</span>
                                                              <span
                                                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                                                      cls.abnormal
                                                                          ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-100'
                                                                          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                                                                  }`}
                                                              >
                                                                  {cls.abnormal ? '有' : '无'}
                                                              </span>
                                                          </div>
                                                      </div>
                                                      {cls.abnormal && cls.abnormalReason ? (
                                                          <p className="mt-2 border-t border-rose-50 pt-2 text-[10px] leading-relaxed text-rose-700/90">
                                                              {cls.abnormalReason}
                                                          </p>
                                                      ) : null}
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}

                                  <div className="relative w-28 flex-shrink-0 pt-5">
                                      <div className="absolute left-2 top-0 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-200" aria-hidden />
                                      <div className="mt-2 flex min-h-[132px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-2 text-center text-gray-400 transition hover:border-gray-300 hover:bg-gray-50">
                                          <i className="fa-solid fa-plus mb-1.5 text-lg" aria-hidden />
                                          <span className="text-[11px] font-semibold">临时加课</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-gray-600">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                                      <span>
                                          今日总课 <strong className="ml-1 tabular-nums text-gray-800">{opsSummary.totalCourses}</strong>
                                          <span className="text-gray-400"> 节</span>
                                          <span className="text-gray-400">（团{opsSummary.groupClass}/小{opsSummary.smallClass}/私{opsSummary.privateClass}）</span>
                                      </span>
                                      <span className="hidden text-gray-200 sm:inline" aria-hidden>
                                          |
                                      </span>
                                      <span>
                                          班级人数 <strong className="ml-1 tabular-nums text-gray-800">{opsSummary.totalEnrolled}</strong>
                                      </span>
                                      <span className="hidden text-gray-200 sm:inline" aria-hidden>
                                          |
                                      </span>
                                      <span>
                                          空位 <strong className="ml-1 tabular-nums text-amber-700">{opsSummary.totalEmptySpots}</strong>
                                      </span>
                                      <span className="hidden text-gray-200 sm:inline" aria-hidden>
                                          |
                                      </span>
                                      <span>
                                          预计课耗 <strong className="ml-1 tabular-nums text-gray-800">{opsSummary.totalEnrolled}</strong>
                                          <span className="text-gray-400"> 节</span>
                                      </span>
                                  </div>
                                  <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white/80 px-3 py-2 lg:max-w-md">
                                      <i className="fa-solid fa-wand-magic-sparkles mt-0.5 shrink-0 text-[11px] text-[#1f5e3b]" aria-hidden />
                                      <span className="min-w-0 flex-1 text-[11px] font-medium leading-relaxed text-gray-600">{aiGuidance}</span>
                                      <button type="button" className={`${actionBtnSecondary} shrink-0`} onClick={() => onOpenSessionOpsDrawer('exceptions')}>
                                          查看异常
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
  </>
);

export default TodayOpsPanel;
