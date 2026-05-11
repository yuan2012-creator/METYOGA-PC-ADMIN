import React, { useEffect, useMemo } from 'react';
import type { Attendance, Booking, CourseSession, Member } from '../../types';
import type { OpsScheduleItem, ScheduleEvent } from '../../utils/courseSelectors';
import {
  buildMockOperationLogEntries,
  parseSessionChangeEntriesFromNotes,
  parseSubstituteTeachersFromDetail,
  sanitizeStaffFacingCopy,
} from '../../utils/courseSessionChange';
import {
  getCourseSessionDisplayStatus,
  getCourseSessionStatusMeta,
  getCourseSessionToneBadgeClass,
} from '../../utils/courseSessionStatus';

export type CourseSessionOpsTabId =
  | 'overview'
  | 'bookings'
  | 'attendance'
  | 'substitute'
  | 'exceptions'
  | 'ops_log';

/** 抽屉 tab；兼容外部别名 `booking` / `exception` */
export type CourseSessionOpsTab = CourseSessionOpsTabId | 'booking' | 'exception';

const TAB_IDS: CourseSessionOpsTabId[] = [
  'overview',
  'bookings',
  'attendance',
  'substitute',
  'exceptions',
  'ops_log',
];

const TABS: { id: CourseSessionOpsTabId; label: string }[] = [
  { id: 'overview', label: '课程概览' },
  { id: 'bookings', label: '预约名单' },
  { id: 'attendance', label: '签到记录' },
  { id: 'substitute', label: '代课记录' },
  { id: 'exceptions', label: '异常记录' },
  { id: 'ops_log', label: '操作日志' },
];

export const normalizeCourseSessionOpsTab = (tab: CourseSessionOpsTab): CourseSessionOpsTabId => {
  let t: CourseSessionOpsTabId =
    tab === 'booking' ? 'bookings' : tab === 'exception' ? 'exceptions' : (tab as CourseSessionOpsTabId);
  if (!TAB_IDS.includes(t)) t = 'overview';
  return t;
};

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

const CANCEL_REASON_OPTIONS = ['老师临时请假', '预约人数不足', '教室不可用', '门店临时调整', '其他原因'] as const;
const RESCHEDULE_REASON_OPTIONS = ['时间调整', '教室调整', '老师调整', '门店安排', '其他原因'] as const;
const SUBSTITUTE_REASON_OPTIONS = ['原老师请假', '临时调配', '课程安排调整', '其他原因'] as const;

type SessionOpsPanel = 'cancel' | 'reschedule' | 'substitute';

type SessionChangeOpsBlockProps = {
  sessionId: string;
  isCanceled: boolean;
  onCancelSession: (id: string, reason: string) => void;
  onRescheduleSession: (id: string, reason: string, note?: string) => void;
  onSubstituteSession: (id: string, substituteTeacherName: string, reason: string) => void;
};

const resolvePresetReason = (key: string, otherText: string, otherLabel: string): string => {
  if (!key.trim()) return '';
  if (key === otherLabel) return otherText.trim();
  return key.trim();
};

const SessionChangeOpsBlock: React.FC<SessionChangeOpsBlockProps> = ({
  sessionId,
  isCanceled,
  onCancelSession,
  onRescheduleSession,
  onSubstituteSession,
}) => {
  const [panel, setPanel] = React.useState<SessionOpsPanel | null>(null);
  const [cancelKey, setCancelKey] = React.useState('');
  const [cancelOther, setCancelOther] = React.useState('');
  const [rescheduleKey, setRescheduleKey] = React.useState('');
  const [rescheduleOther, setRescheduleOther] = React.useState('');
  const [rescheduleNote, setRescheduleNote] = React.useState('');
  const [subName, setSubName] = React.useState('');
  const [subReasonKey, setSubReasonKey] = React.useState('');
  const [subOther, setSubOther] = React.useState('');

  React.useEffect(() => {
    setPanel(null);
    setCancelKey('');
    setCancelOther('');
    setRescheduleKey('');
    setRescheduleOther('');
    setRescheduleNote('');
    setSubName('');
    setSubReasonKey('');
    setSubOther('');
  }, [sessionId]);

  const formShell = 'mt-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-xs text-gray-700 shadow-none';
  const labelCls = 'mb-1 block font-medium text-gray-600';
  const inputCls =
    'mt-0.5 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-gray-800 outline-none ring-0 focus:border-gray-300';

  const submitCancel = () => {
    const reason = resolvePresetReason(cancelKey, cancelOther, '其他原因');
    if (!reason) return;
    onCancelSession(sessionId, reason);
    setPanel(null);
  };

  const submitReschedule = () => {
    const reason = resolvePresetReason(rescheduleKey, rescheduleOther, '其他原因');
    if (!reason) return;
    onRescheduleSession(sessionId, reason, rescheduleNote.trim() || undefined);
    setPanel(null);
  };

  const submitSubstitute = () => {
    const name = subName.trim();
    if (!name) return;
    const reason = resolvePresetReason(subReasonKey, subOther, '其他原因');
    if (!reason) return;
    onSubstituteSession(sessionId, name, reason);
    setPanel(null);
  };

  return (
    <div className="mt-4 rounded-xl border border-gray-100 bg-white/80 px-3 py-3">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-gray-400">场次操作</p>
      <div className="flex flex-wrap gap-2">
        {!isCanceled ? (
          <button
            type="button"
            onClick={() => setPanel(panel === 'cancel' ? null : 'cancel')}
            className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-medium text-rose-900 hover:bg-rose-50"
          >
            取消课程
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setPanel(panel === 'reschedule' ? null : 'reschedule')}
          className="met-secondary-button !h-auto !min-h-0 !rounded-lg !px-3 !py-1.5 !text-xs"
        >
          标记调课
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === 'substitute' ? null : 'substitute')}
          className="met-secondary-button !h-auto !min-h-0 !rounded-lg !px-3 !py-1.5 !text-xs"
        >
          标记代课
        </button>
      </div>

      {panel === 'cancel' ? (
        <div className={formShell}>
          <label className={labelCls}>取消原因</label>
          <select className={inputCls} value={cancelKey} onChange={e => setCancelKey(e.target.value)}>
            <option value="">请选择</option>
            {CANCEL_REASON_OPTIONS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {cancelKey === '其他原因' ? (
            <div className="mt-2">
              <label className={labelCls}>请填写原因</label>
              <input className={inputCls} value={cancelOther} onChange={e => setCancelOther(e.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          <p className="mt-3 rounded-md border border-rose-100/80 bg-rose-50/40 px-2.5 py-2 text-[11px] leading-relaxed text-rose-900/90">
            确认取消后，该课程将标记为已取消。当前版本仅更新后台演示状态，不会真实通知会员或处理权益退回。
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px]" onClick={() => setPanel(null)}>
              收起
            </button>
            <button
              type="button"
              disabled={!resolvePresetReason(cancelKey, cancelOther, '其他原因')}
              onClick={submitCancel}
              className="rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-[11px] font-semibold text-rose-900 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              确认取消
            </button>
          </div>
        </div>
      ) : null}

      {panel === 'reschedule' ? (
        <div className={formShell}>
          <label className={labelCls}>调课原因</label>
          <select className={inputCls} value={rescheduleKey} onChange={e => setRescheduleKey(e.target.value)}>
            <option value="">请选择</option>
            {RESCHEDULE_REASON_OPTIONS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {rescheduleKey === '其他原因' ? (
            <div className="mt-2">
              <label className={labelCls}>请填写原因</label>
              <input className={inputCls} value={rescheduleOther} onChange={e => setRescheduleOther(e.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          <label className={`${labelCls} mt-2`}>补充说明（可选）</label>
          <textarea
            className={`${inputCls} min-h-[64px] resize-y`}
            value={rescheduleNote}
            onChange={e => setRescheduleNote(e.target.value)}
            placeholder="可填写对会员或老师的补充说明"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px]" onClick={() => setPanel(null)}>
              收起
            </button>
            <button
              type="button"
              disabled={!resolvePresetReason(rescheduleKey, rescheduleOther, '其他原因')}
              onClick={submitReschedule}
              className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px]"
            >
              确认标记调课
            </button>
          </div>
        </div>
      ) : null}

      {panel === 'substitute' ? (
        <div className={formShell}>
          <label className={labelCls}>代课老师姓名</label>
          <input className={inputCls} value={subName} onChange={e => setSubName(e.target.value)} placeholder="请输入代课老师姓名" />
          <label className={`${labelCls} mt-2`}>代课原因</label>
          <select className={inputCls} value={subReasonKey} onChange={e => setSubReasonKey(e.target.value)}>
            <option value="">请选择</option>
            {SUBSTITUTE_REASON_OPTIONS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {subReasonKey === '其他原因' ? (
            <div className="mt-2">
              <label className={labelCls}>请填写原因</label>
              <input className={inputCls} value={subOther} onChange={e => setSubOther(e.target.value)} placeholder="请输入" />
            </div>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px]" onClick={() => setPanel(null)}>
              收起
            </button>
            <button
              type="button"
              disabled={!subName.trim() || !resolvePresetReason(subReasonKey, subOther, '其他原因')}
              onClick={submitSubstitute}
              className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              确认标记代课
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const bookingStatusLabel = (status: Booking['status']): string => {
  switch (status) {
    case 'booked':
      return '已预约';
    case 'waitlisted':
      return '候补';
    case 'cancelled':
      return '已取消';
    case 'late_cancelled':
      return '迟取消';
    case 'no_show':
      return '爽约';
    default:
      return status;
  }
};

const attendanceStatusLabel = (status: Attendance['status']): string => {
  switch (status) {
    case 'pending_checkin':
      return '待签到';
    case 'checked_in':
      return '已签到';
    case 'attended':
      return '已到课';
    case 'consumed':
      return '已扣课';
    case 'absent':
      return '缺席';
    default:
      return status;
  }
};

const maskPhone = (phone: string | undefined): string => {
  if (!phone) return '—';
  if (phone.includes('*')) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  return phone;
};

const formatIsoDisplay = (iso?: string): string => {
  if (!iso) return '暂未接入';
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const formatIsoOrRecord = (iso?: string): string => {
  if (!iso?.trim()) return '暂未记录';
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const checkInMethodLabel = (notes?: string): string => {
  if (!notes) return '暂未记录';
  if (/前台|front/i.test(notes)) return '前台登记';
  if (/扫码|qr/i.test(notes)) return '扫码签到';
  return '暂未记录';
};

const attendanceAbnormalFlag = (a: Attendance): string => (a.status === 'absent' ? '是' : '否');

interface CourseSessionOpsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tab: CourseSessionOpsTab;
  onTabChange: (tab: CourseSessionOpsTabId) => void;
  session: OpsScheduleItem | null;
  scheduleEvent: ScheduleEvent | null;
  bookings: Booking[];
  attendances: Attendance[];
  members: Member[];
  onCancelSession: (sessionId: string, reason: string) => void;
  onRescheduleSession: (sessionId: string, reason: string, note?: string) => void;
  onSubstituteSession: (sessionId: string, substituteTeacherName: string, reason: string) => void;
}

const CourseSessionOpsDrawer: React.FC<CourseSessionOpsDrawerProps> = ({
  isOpen,
  onClose,
  tab,
  onTabChange,
  session,
  scheduleEvent,
  bookings,
  attendances,
  members,
  onCancelSession,
  onRescheduleSession,
  onSubstituteSession,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const statusInput = useMemo((): CourseSession | null => {
    if (!isOpen) return null;
    if (session) return courseSessionForDisplay(session, scheduleEvent ?? undefined);
    if (scheduleEvent) return scheduleEvent;
    return null;
  }, [isOpen, session, scheduleEvent]);

  const displayStatus = useMemo(() => {
    if (!statusInput) return null;
    try {
      return getCourseSessionDisplayStatus({ session: statusInput, bookings, attendances });
    } catch {
      return null;
    }
  }, [statusInput, bookings, attendances]);

  const statusMeta = useMemo(() => {
    if (!statusInput) return null;
    try {
      return getCourseSessionStatusMeta({ session: statusInput, bookings, attendances });
    } catch {
      return null;
    }
  }, [statusInput, bookings, attendances]);

  type SessionMaybeNotes = OpsScheduleItem & { notes?: string };

  const mergedNotes = useMemo(() => {
    const fromEvent = scheduleEvent?.notes;
    if (fromEvent != null && String(fromEvent).trim() !== '') return String(fromEvent);
    const fromSession = (session as SessionMaybeNotes | null)?.notes;
    if (fromSession != null && String(fromSession).trim() !== '') return String(fromSession);
    const fromStatus = statusInput?.notes;
    if (fromStatus != null && String(fromStatus).trim() !== '') return String(fromStatus);
    return '';
  }, [scheduleEvent?.notes, session, statusInput?.notes]);

  const sessionChangeEntries = useMemo(
    () => parseSessionChangeEntriesFromNotes(mergedNotes),
    [mergedNotes],
  );

  const canonicalTab = useMemo(() => normalizeCourseSessionOpsTab(tab), [tab]);

  const operationLogEntries = useMemo(() => {
    type OptionalAuditFields = {
      publishedAt?: string;
      publishedBy?: string;
      createdAt?: string;
      createdBy?: string;
    };
    const logSource = scheduleEvent ?? session ?? null;
    const audit = (logSource ?? {}) as OptionalAuditFields;
    return buildMockOperationLogEntries(mergedNotes || undefined, {
      publishedAt: audit.publishedAt,
      publishedBy: audit.publishedBy,
      createdAt: audit.createdAt,
      createdBy: audit.createdBy,
    });
  }, [scheduleEvent, session, mergedNotes]);

  const mainStatusBadgeClass = displayStatus ? getCourseSessionToneBadgeClass(displayStatus.tone) : '';

  if (!isOpen) return null;

  const hasAnySession = !!(session || scheduleEvent);
  const sessionId = session?.id ?? scheduleEvent?.id ?? null;
  const memberById = new Map(members.map(m => [m.id, m]));

  const rawTitle = session?.name ?? scheduleEvent?.name ?? scheduleEvent?.title ?? '';
  const titleSan = sanitizeStaffFacingCopy(rawTitle);
  const displayTitle = hasAnySession
    ? (titleSan && titleSan !== '—' ? titleSan : '未命名课程')
    : '课程场次详情';
  const displayType = session?.type ? sanitizeStaffFacingCopy(session.type) || '暂未记录' : '暂未记录';

  const sessionBookings = sessionId
    ? bookings.filter(b => b.courseSessionId === sessionId)
    : [];

  const sessionAttendances = sessionId
    ? attendances.filter(a => a.courseSessionId === sessionId)
    : [];

  const isSessionCompleted =
    scheduleEvent?.status === 'completed' || session?.courseSessionStatus === 'completed';
  const isScheduleCanceled =
    scheduleEvent?.status === 'cancelled'
    || scheduleEvent?.publishStatus === 'canceled'
    || session?.courseSessionStatus === 'cancelled';

  const opsBlockSessionId = scheduleEvent?.id ?? session?.id ?? null;

  const tabBtnClass = (active: boolean) =>
    active
      ? 'border-b-2 border-[#1F5E3B] pb-2.5 text-[13px] font-semibold text-[#1F5E3B]'
      : 'border-b-2 border-transparent pb-2.5 text-[13px] font-medium text-gray-500 hover:text-gray-700';

  const overviewStatusLabels = statusMeta ?? {
    publishStatusLabel: '暂未记录',
    bookingStatusLabel: '暂未记录',
    sessionStatusLabel: '暂未记录',
    exceptionStatusLabel: '暂未记录',
    settlementStatusLabel: '暂未记录',
  };

  const rowHead = 'text-[11px] font-semibold tracking-wide text-gray-400';
  const cell = 'border-b border-gray-100 py-2.5 text-xs text-gray-700';

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="course-session-ops-drawer-title">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px]"
        aria-label="关闭抽屉"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-[600px] flex-col rounded-l-2xl border-l border-gray-200/80 bg-[#FCFCFA] shadow-[0_0_0_1px_rgba(0,0,0,0.03)] animate-fadeIn"
        style={{ animationDuration: '0.22s' }}
      >
        <header className="shrink-0 border-b border-gray-200/90 bg-[#FCFCFA] px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="course-session-ops-drawer-title" className="truncate text-base font-bold text-gray-900">
                {displayTitle}
              </h2>
              {hasAnySession ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80">
                    {displayType}
                  </span>
                  {displayStatus ? (
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${mainStatusBadgeClass}`}>
                      {displayStatus.label}
                    </span>
                  ) : (
                    <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      状态计算中
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500">暂未找到该课程场次信息</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="met-secondary-button !h-9 !min-h-0 !px-2.5 !py-0 !text-xs shrink-0"
              aria-label="关闭"
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          </div>

          {hasAnySession && !isSessionCompleted && !isScheduleCanceled ? (
            opsBlockSessionId ? (
              <SessionChangeOpsBlock
                sessionId={opsBlockSessionId}
                isCanceled={isScheduleCanceled}
                onCancelSession={onCancelSession}
                onRescheduleSession={onRescheduleSession}
                onSubstituteSession={onSubstituteSession}
              />
            ) : (
              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-950/95">
                请从排课日历或今日课程执行列表打开本场次，以便进行取消、调课或代课标记。
              </div>
            )
          ) : null}
        </header>

        <nav className="shrink-0 border-b border-gray-200/80 bg-white/60 px-4 pt-1 sm:px-5">
          <div className="flex gap-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] sm:gap-5">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                className={`shrink-0 whitespace-nowrap ${tabBtnClass(canonicalTab === t.id)}`}
                onClick={() => onTabChange(t.id)}
              >
                <span className="text-[12px] sm:text-[13px]">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="custom-scroll min-h-0 flex-1 overflow-y-auto bg-white/40 px-5 py-4">
          {canonicalTab === 'overview' && (
            <div className="space-y-4">
              {!hasAnySession || !statusInput ? (
                <p className="py-8 text-center text-sm text-gray-500">暂未找到该课程场次信息</p>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                    <p className="mb-3 text-[11px] font-semibold tracking-wide text-gray-400">基础信息</p>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-2">
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">课程名称</dt>
                        <dd className="font-medium text-gray-900">{displayTitle}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">课程类型</dt>
                        <dd className="font-medium text-gray-800">{session?.type ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">上课时间</dt>
                        <dd className="font-medium text-gray-800">{session?.time ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">老师</dt>
                        <dd className="font-medium text-gray-800">{session?.teacher ?? scheduleEvent?.teacher ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">教室</dt>
                        <dd className="font-medium text-gray-800">{session?.room ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">容量</dt>
                        <dd className="font-medium text-gray-800 tabular-nums">{session?.capacity ?? scheduleEvent?.capacity ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">预约人数</dt>
                        <dd className="font-medium text-gray-800 tabular-nums">{session?.enrolled ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">签到人数</dt>
                        <dd className="font-medium text-gray-800 tabular-nums">{session?.signed ?? '暂未记录'}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:col-span-2 sm:block">
                        <dt className="text-gray-500">空位</dt>
                        <dd className="font-medium text-gray-800 tabular-nums">
                          {session
                            ? session.capacity - session.enrolled
                            : typeof scheduleEvent?.capacity === 'number' && typeof scheduleEvent?.bookedCount === 'number'
                              ? scheduleEvent.capacity - scheduleEvent.bookedCount
                              : '暂未记录'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                    <p className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wide text-gray-400">
                      <span>状态信息</span>
                      {displayStatus ? (
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${mainStatusBadgeClass}`}>
                          {displayStatus.label}
                        </span>
                      ) : null}
                    </p>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">发布状态</dt>
                        <dd className="font-medium text-gray-800">{overviewStatusLabels.publishStatusLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">预约状态</dt>
                        <dd className="font-medium text-gray-800">{overviewStatusLabels.bookingStatusLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">执行状态</dt>
                        <dd className="font-medium text-gray-800">{overviewStatusLabels.sessionStatusLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">异常状态</dt>
                        <dd className="font-medium text-gray-800">{overviewStatusLabels.exceptionStatusLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2 sm:col-span-2 sm:block">
                        <dt className="text-gray-500">结算状态</dt>
                        <dd className="font-medium text-gray-800">{overviewStatusLabels.settlementStatusLabel}</dd>
                      </div>
                    </dl>
                  </div>
                </>
              )}
            </div>
          )}

          {canonicalTab === 'bookings' && (
            <div>
              {!sessionId ? (
                <p className="py-8 text-center text-sm text-gray-500">暂无预约记录</p>
              ) : sessionBookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">暂无预约记录</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                  <div className={`grid grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 ${rowHead}`}>
                    <div className="col-span-3">会员姓名</div>
                    <div className="col-span-3">手机</div>
                    <div className="col-span-2">预约状态</div>
                    <div className="col-span-2">卡项/扣点</div>
                    <div className="col-span-2">预约时间</div>
                  </div>
                  {sessionBookings.map(b => {
                    const m = memberById.get(b.memberId);
                    return (
                      <div key={b.id} className={`grid grid-cols-12 gap-2 px-3 ${cell}`}>
                        <div className="col-span-3 truncate font-medium text-gray-900">{m?.name ?? '—'}</div>
                        <div className="col-span-3 truncate text-gray-600">{maskPhone(m?.phone)}</div>
                        <div className="col-span-2 text-gray-700">{bookingStatusLabel(b.status)}</div>
                        <div className="col-span-2 text-gray-500">暂未记录</div>
                        <div className="col-span-2 text-gray-600">{formatIsoOrRecord(b.bookedAt)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {canonicalTab === 'attendance' && (
            <div>
              {!sessionId ? (
                <p className="py-8 text-center text-sm text-gray-500">暂无签到记录</p>
              ) : sessionAttendances.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">暂无签到记录</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                  <div className={`grid grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 ${rowHead}`}>
                    <div className="col-span-2">会员姓名</div>
                    <div className="col-span-2">签到状态</div>
                    <div className="col-span-3">签到时间</div>
                    <div className="col-span-3">签到方式</div>
                    <div className="col-span-2">异常标记</div>
                  </div>
                  {sessionAttendances.map(a => {
                    const m = memberById.get(a.memberId);
                    const at = a.checkedInAt ?? a.attendedAt;
                    return (
                      <div key={a.id} className={`grid grid-cols-12 gap-2 px-3 ${cell}`}>
                        <div className="col-span-2 truncate font-medium text-gray-900">{m?.name ?? '—'}</div>
                        <div className="col-span-2 text-gray-700">{attendanceStatusLabel(a.status)}</div>
                        <div className="col-span-3 text-gray-600">{formatIsoOrRecord(at)}</div>
                        <div className="col-span-3 text-gray-600">{checkInMethodLabel(a.notes)}</div>
                        <div className="col-span-2 text-gray-700">{attendanceAbnormalFlag(a)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {canonicalTab === 'substitute' && (() => {
            const subEntry = sessionChangeEntries.find(e => e.tag === 'substitute');
            const parsed = subEntry ? parseSubstituteTeachersFromDetail(subEntry.detail) : {};
            const hasSubstituteRecord =
              scheduleEvent?.sessionStatus === 'substitute'
              || statusInput?.sessionStatus === 'substitute'
              || !!subEntry;
            const reasonFromDetail = subEntry?.detail
              ? (/原因：(.+)/.exec(subEntry.detail)?.[1]?.trim() ?? subEntry.detail)
              : '';
            const reasonText = reasonFromDetail || '—';
            return (
              <div className="space-y-3">
                {!hasSubstituteRecord ? (
                  <p className="py-8 text-center text-sm text-gray-500">当前场次暂无代课记录</p>
                ) : (
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                        <span className="text-gray-500">当前老师（排课展示）</span>
                        <span className="font-medium text-gray-800">
                          {session?.teacher ?? scheduleEvent?.teacher ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                        <span className="text-gray-500">原老师</span>
                        <span className="max-w-[55%] text-right font-medium text-gray-800">
                          {parsed.original ?? '暂未记录'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                        <span className="text-gray-500">代课老师</span>
                        <span className="max-w-[55%] text-right font-medium text-gray-800">
                          {parsed.substitute
                            ?? (scheduleEvent?.sessionStatus === 'substitute' || statusInput?.sessionStatus === 'substitute'
                              ? (scheduleEvent?.teacher ?? session?.teacher)
                              : '—')}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                        <span className="text-gray-500">代课原因</span>
                        <span className="max-w-[58%] text-right text-gray-700">
                          {sanitizeStaffFacingCopy(reasonText)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">当前状态</span>
                        <span className="font-medium text-gray-800">{displayStatus?.label ?? '—'}</span>
                      </div>
                    </div>
                    <p className="rounded-lg bg-amber-50/60 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900/90 ring-1 ring-amber-100/80">
                      代课涉及老师课时、会员通知与排课记录，当前仅只读展示，正式修改需接入审核流程。
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {canonicalTab === 'exceptions' && (
            <div className="space-y-4">
              {!hasAnySession || !statusInput ? (
                <p className="py-8 text-center text-sm text-gray-500">当前场次暂无异常记录</p>
              ) : sessionChangeEntries.length === 0 && !session?.abnormal ? (
                <p className="py-8 text-center text-sm text-gray-500">当前场次暂无异常记录</p>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs">
                    <div className="mb-2 text-[11px] font-semibold text-gray-400">当前汇总</div>
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="flex justify-between gap-2 sm:block">
                        <dt className="text-gray-500">异常状态</dt>
                        <dd className="font-medium text-gray-900">{overviewStatusLabels.exceptionStatusLabel}</dd>
                      </div>
                    </dl>
                  </div>
                  {sessionChangeEntries.length > 0 ? (
                    <div className="space-y-3">
                      {sessionChangeEntries.map((entry, idx) => (
                        <div
                          key={`${entry.tag}-${idx}`}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-800"
                        >
                          <dl className="space-y-2">
                            <div className="flex justify-between gap-2">
                              <dt className="text-gray-500">异常状态</dt>
                              <dd className="font-medium text-gray-900">{overviewStatusLabels.exceptionStatusLabel}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className="text-gray-500">异常类型</dt>
                              <dd className="font-medium text-gray-900">{entry.typeLabel}</dd>
                            </div>
                            <div className="border-t border-gray-100 pt-2">
                              <dt className="text-gray-500">异常说明</dt>
                              <dd className="mt-1 leading-relaxed text-gray-700">{sanitizeStaffFacingCopy(entry.detail)}</dd>
                            </div>
                            <div className="flex justify-between gap-2 border-t border-gray-100 pt-2">
                              <dt className="text-gray-500">处理状态</dt>
                              <dd className="font-medium text-gray-800">已记录</dd>
                            </div>
                          </dl>
                          <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                            当前仅记录后台状态，正式通知与审批流程将在后续接入。
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {session?.abnormal ? (
                    <div className="rounded-xl border border-rose-100/90 bg-rose-50/50 px-4 py-4 text-xs text-rose-900/90">
                      <dl className="space-y-2">
                        <div className="flex justify-between gap-2">
                          <dt className="text-rose-800/80">异常状态</dt>
                          <dd className="font-semibold text-rose-950">{overviewStatusLabels.exceptionStatusLabel}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-rose-800/80">异常类型</dt>
                          <dd className="font-medium">预约侧提醒</dd>
                        </div>
                        <div>
                          <dt className="text-rose-800/80">异常说明</dt>
                          <dd className="mt-1 leading-relaxed">
                            {sanitizeStaffFacingCopy(session.abnormalReason) || '—'}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2 border-t border-rose-100/70 pt-2">
                          <dt className="text-rose-800/80">处理状态</dt>
                          <dd className="font-medium">待跟进</dd>
                        </div>
                      </dl>
                      <p className="mt-3 border-t border-rose-100/70 pt-2 text-[11px] leading-relaxed text-rose-900/85">
                        当前仅记录后台状态，正式通知与审批流程将在后续接入。
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {canonicalTab === 'ops_log' && (
            <div>
              {operationLogEntries.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">暂无操作日志</p>
              ) : (
                <div className="space-y-3">
                  {operationLogEntries.map((row, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs">
                      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500">操作类型</dt>
                          <dd className="mt-0.5 font-semibold text-gray-900">{row.actionType}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500">操作说明</dt>
                          <dd className="mt-0.5 leading-relaxed text-gray-700">
                            {sanitizeStaffFacingCopy(row.detail)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2 sm:block">
                          <dt className="text-gray-500">操作人</dt>
                          <dd className="font-medium text-gray-800">{row.operatorName}</dd>
                        </div>
                        <div className="flex justify-between gap-2 sm:block">
                          <dt className="text-gray-500">操作时间</dt>
                          <dd className="font-medium text-gray-800">{row.timeLabel}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CourseSessionOpsDrawer;
