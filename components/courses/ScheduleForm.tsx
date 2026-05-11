import React, { useEffect, useRef, useState } from 'react';
import { COURSE_TYPE_LABELS } from '../../utils/courseSelectors';
import type { CourseLibraryItem, Room, ScheduleFormState } from '../../utils/courseSelectors';

const CUSTOM_COURSE_VALUE = 'custom-course';

interface ScheduleFormProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleForm: ScheduleFormState;
  setScheduleForm: React.Dispatch<React.SetStateAction<ScheduleFormState>>;
  libraryList: CourseLibraryItem[];
  confirmSchedule: () => void;
  deleteEvent: (id: string) => void;
  scheduleFormIsCreate: boolean;
  weekDays: string[];
  rooms: Room[];
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm outline-none transition focus:border-[#1f5e3b]/40 focus:ring-1 focus:ring-[#1f5e3b]/10';

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  setIsOpen,
  scheduleForm,
  setScheduleForm,
  libraryList,
  confirmSchedule,
  deleteEvent,
  scheduleFormIsCreate,
  weekDays,
  rooms,
}) => {
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const coursePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) setCourseMenuOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!courseMenuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = coursePickerRef.current;
      if (el && !el.contains(e.target as Node)) {
        setCourseMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [courseMenuOpen]);

  if (!isOpen) return null;

  const isExplicitCustom = scheduleForm.courseId === CUSTOM_COURSE_VALUE;
  const selectedCourse =
    scheduleForm.courseId && !isExplicitCustom ? libraryList.find(c => c.id === scheduleForm.courseId) : undefined;
  const weekLabel = weekDays[scheduleForm.dayIndex] ?? '—';
  const roomName = rooms.find(r => r.id === scheduleForm.roomId)?.name ?? '未分配教室';

  const triggerLabel = (() => {
    if (scheduleForm.courseId === '') return '请选择课程';
    if (scheduleForm.courseId === CUSTOM_COURSE_VALUE) return '自定义课程';
    return selectedCourse?.name ?? '请选择课程';
  })();

  const applyCourseChoice = (v: string) => {
    if (v === '') {
      setScheduleForm({ ...scheduleForm, courseId: '', duration: 60 });
    } else if (v === CUSTOM_COURSE_VALUE) {
      setScheduleForm({ ...scheduleForm, courseId: CUSTOM_COURSE_VALUE, duration: scheduleForm.duration });
    } else {
      const course = libraryList.find(c => c.id === v);
      setScheduleForm({ ...scheduleForm, courseId: v, duration: course ? course.durationMinutes : scheduleForm.duration });
    }
    setCourseMenuOpen(false);
  };

  const isRowSelected = (value: string) => {
    if (value === '') return scheduleForm.courseId === '';
    if (value === CUSTOM_COURSE_VALUE) return scheduleForm.courseId === CUSTOM_COURSE_VALUE;
    return scheduleForm.courseId === value;
  };

  const summaryParts: string[] = [];
  if (selectedCourse) {
    summaryParts.push(`类型：${COURSE_TYPE_LABELS[selectedCourse.type]}`);
    summaryParts.push(`默认时长：${selectedCourse.durationMinutes} 分钟`);
    if (typeof selectedCourse.price === 'number' && selectedCourse.price > 0) {
      summaryParts.push(`参考单价：¥${selectedCourse.price}`);
    }
  } else if (isExplicitCustom) {
    summaryParts.push('类型：自定义');
    summaryParts.push(`默认时长：${scheduleForm.duration} 分钟`);
  }

  const summaryLine = summaryParts.length > 0 ? summaryParts.join(' · ') : null;

  const optionRowClass = (selected: boolean) =>
    `flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-sm transition ${selected ? 'bg-[#1f5e3b]/[0.06]' : 'hover:bg-gray-50'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} aria-hidden />
      <div className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl animate-fadeInUp">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-[#FCFCFA] px-4 py-3">
          <h3 className="text-base font-bold text-gray-900">{scheduleFormIsCreate ? '新增排课' : '编辑排课'}</h3>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={() => setIsOpen(false)} aria-label="关闭">
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>
        </div>

        <div className="custom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-gray-600" id="schedule-course-label">
              课程选择
            </label>
            <div ref={coursePickerRef} className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={courseMenuOpen}
                aria-labelledby="schedule-course-label"
                onClick={() => setCourseMenuOpen(o => !o)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus-visible:border-[#1f5e3b]/40 focus-visible:ring-1 focus-visible:ring-[#1f5e3b]/10"
              >
                <span className={`min-w-0 flex-1 truncate ${scheduleForm.courseId === '' ? 'text-gray-400' : ''}`}>{triggerLabel}</span>
                <i className={`fa-solid fa-chevron-down shrink-0 text-[10px] text-gray-400 transition ${courseMenuOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>

              {courseMenuOpen ? (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-[13px] border border-gray-200/90 bg-[#FCFCFA] py-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                >
                  <li role="presentation">
                    <button type="button" role="option" aria-selected={isRowSelected('')} className={optionRowClass(isRowSelected(''))} onClick={() => applyCourseChoice('')}>
                      <span className="flex w-5 shrink-0 justify-center text-[#1f5e3b]">{isRowSelected('') ? <i className="fa-solid fa-check text-xs" aria-hidden /> : null}</span>
                      <span className="min-w-0 flex-1 text-gray-500">请选择课程</span>
                    </button>
                  </li>
                  {libraryList.map(c => {
                    const sel = isRowSelected(c.id);
                    return (
                      <li key={c.id} role="presentation">
                        <button type="button" role="option" aria-selected={sel} className={optionRowClass(sel)} onClick={() => applyCourseChoice(c.id)}>
                          <span className="flex w-5 shrink-0 justify-center text-[#1f5e3b]">{sel ? <i className="fa-solid fa-check text-xs" aria-hidden /> : null}</span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                            <span className="truncate font-medium text-gray-900">{c.name}</span>
                            <span className={`w-fit shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.colorTag}`}>{COURSE_TYPE_LABELS[c.type]}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  <li role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isRowSelected(CUSTOM_COURSE_VALUE)}
                      className={optionRowClass(isRowSelected(CUSTOM_COURSE_VALUE))}
                      onClick={() => applyCourseChoice(CUSTOM_COURSE_VALUE)}
                    >
                      <span className="flex w-5 shrink-0 justify-center text-[#1f5e3b]">
                        {isRowSelected(CUSTOM_COURSE_VALUE) ? <i className="fa-solid fa-check text-xs" aria-hidden /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900">自定义课程</span>
                      </span>
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
            {summaryLine ? <p className="mt-1.5 text-[11px] leading-snug text-gray-600">{summaryLine}</p> : null}
            <p className="mt-1 text-[10px] leading-snug text-gray-400">扣点以后端卡项规则为准</p>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-gray-100 bg-gray-50/60 px-2.5 py-2 text-[12px] text-gray-800">
            <span>
              <span className="text-gray-500">日期：</span>
              {weekLabel}
            </span>
            <span className="min-w-0">
              <span className="text-gray-500">教室：</span>
              <span className="font-medium">{roomName}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-500">门店：万象城店</p>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-gray-600">授课老师</label>
            <input
              type="text"
              className={inputClass}
              placeholder="请输入老师姓名"
              value={scheduleForm.teacherName}
              onChange={e => setScheduleForm({ ...scheduleForm, teacherName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-600">开始时间</label>
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.startTime}
                onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-600">时长（分钟）</label>
              <input
                type="number"
                className={inputClass}
                value={scheduleForm.duration}
                onChange={e => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-gray-600">容量</label>
            <input
              type="number"
              className={inputClass}
              value={scheduleForm.capacity}
              onChange={e => setScheduleForm({ ...scheduleForm, capacity: parseInt(e.target.value, 10) })}
            />
            <p className="mt-1 text-[10px] text-gray-400">影响会员可预约人数</p>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-3 pt-2">
          <p className="mb-2 text-center text-[10px] leading-relaxed text-gray-400">
            保存后进入排课草稿，发布与通知规则后续由后台统一处理。
          </p>
          <div className="flex gap-2">
            {!scheduleFormIsCreate && scheduleForm.id ? (
              <button
                type="button"
                onClick={() => deleteEvent(scheduleForm.id)}
                className="shrink-0 rounded-lg border border-rose-200/90 bg-rose-50/40 px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                title="取消排课"
              >
                <i className="fa-solid fa-trash-can" aria-hidden />
              </button>
            ) : null}
            <button type="button" onClick={() => setIsOpen(false)} className="met-secondary-button flex-1 !min-h-[40px] !py-2 !text-sm">
              取消
            </button>
            <button type="button" onClick={confirmSchedule} className="met-primary-button flex-1 !min-h-[40px] !py-2 !text-sm">
              {scheduleFormIsCreate ? '保存草稿' : '保存修改'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
