import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { validateScheduleDraft } from './researchCenterCalculations';
import {
  PAY_METHOD_OPTIONS,
  RYT200_COURSE_TEMPLATES,
  defaultCalcPayForSession,
  formatDateShort,
  getClassroomOptions,
  getTeacherPay,
  getTeacherSelectOptions,
  getVenueSelectOptions,
  MOCK_TODAY_ISO,
} from './researchCenterOptions';
import {
  ResearchDateField,
  ResearchFieldError,
  ResearchNumberField,
  ResearchSelect,
  ResearchTextField,
  ResearchTimeField,
  ResearchToggle,
  StaffSelector,
} from './researchFormFields';
import {
  filterSchedulesByCohort,
  getActiveCohortStudents,
} from './researchCenterDeliveryCalculations';
import type {
  AttendanceDraft,
  AttendanceEntry,
  AttendanceSheet,
  AttendanceStatus,
  CohortConfig,
  EnrollmentRecord,
  LeaveDraft,
  LeaveRequest,
  LeadRecord,
  MakeupDraft,
  MakeupMethod,
  MakeupRecord,
  OperationLogEntry,
  ScheduleDraft,
  ScheduleItem,
  ScheduleSessionType,
  TeachingRecord,
  TeachingRecordDraft,
} from './researchCenterV2.viewModel';

export type CohortDeliveryDrawerState =
  | { type: 'attendance'; sessionId: string }
  | { type: 'leave'; studentId?: string; sessionId?: string }
  | { type: 'makeup'; leaveRequestId?: string; studentId?: string; sessionId?: string }
  | { type: 'teaching'; sessionId: string }
  | { type: 'change-teacher'; sessionId: string }
  | { type: 'reschedule'; sessionId: string }
  | { type: 'student-profile'; enrollmentId: string }
  | { type: 'add-session' }
  | { type: 'edit-session'; sessionId: string }
  | { type: 'cohort-list' }
  | { type: 'operation-logs' }
  | null;

const ATTENDANCE_STATUSES: AttendanceStatus[] = ['待签到', '已到', '请假', '缺勤', '迟到', '早退'];
const SESSION_TYPES: ScheduleSessionType[] = ['正常教学', '体能训练', '实践', '自习', '考试', '结业'];
const MAKEUP_METHODS: MakeupMethod[] = [
  '跟随同产品其他班期',
  '当前班期单独补课',
  '线上补课',
  '免补课',
];

function drawerKey(drawer: CohortDeliveryDrawerState): string {
  if (!drawer) return '';
  const base = drawer.type;
  if ('sessionId' in drawer && drawer.sessionId) return `${base}:${drawer.sessionId}`;
  if ('enrollmentId' in drawer && drawer.enrollmentId) return `${base}:${drawer.enrollmentId}`;
  if ('studentId' in drawer && drawer.studentId) return `${base}:${drawer.studentId}`;
  if ('leaveRequestId' in drawer && drawer.leaveRequestId) return `${base}:${drawer.leaveRequestId}`;
  return base;
}

function createEmptyScheduleDraft(cohort: CohortConfig): ScheduleDraft {
  return {
    dateIso: cohort.startDate,
    date: formatDateShort(cohort.startDate),
    startTime: '09:00',
    endTime: '12:00',
    content: '',
    contentTemplateId: '',
    customContent: '',
    teacher: '',
    venue: cohort.venue,
    classroom: cohort.classroom,
    sessionType: '正常教学',
    calcPay: true,
    payMethod: '按天',
    payAmount: 0,
    customPayReason: '',
    note: '',
    cohortId: cohort.id,
    status: '待确认',
  };
}

interface CohortDeliveryDrawerProps {
  cohort: CohortConfig;
  schedules: ScheduleItem[];
  enrollments: EnrollmentRecord[];
  leads: LeadRecord[];
  attendances: AttendanceSheet[];
  leaveRequests: LeaveRequest[];
  makeupRecords: MakeupRecord[];
  teachingRecords: TeachingRecord[];
  operationLogs: OperationLogEntry[];
  cohorts: CohortConfig[];
  drawer: CohortDeliveryDrawerState;
  onClose: () => void;
  onToast: (msg: string) => void;
  onSelectCohort?: (cohortId: string) => void;
  onSaveAttendance: (draft: AttendanceDraft) => { ok: boolean; error?: string };
  onCreateLeaveRequest: (draft: LeaveDraft) => { ok: boolean; error?: string; id?: string };
  onArrangeMakeup: (draft: MakeupDraft) => { ok: boolean; error?: string; id?: string };
  onSaveTeachingRecord: (draft: TeachingRecordDraft) => { ok: boolean; error?: string };
  onChangeSessionTeacher: (sessionId: string, teacher: string, reason: string) => { ok: boolean; error?: string };
  onRescheduleSession: (
    sessionId: string,
    next: { dateIso: string; startTime: string; endTime: string; reason: string },
  ) => { ok: boolean; error?: string };
  onAddSchedule: (draft: ScheduleDraft) => boolean;
  onUpdateSchedule: (id: string, patch: Partial<ScheduleItem>) => boolean;
}

const CohortDeliveryDrawer: React.FC<CohortDeliveryDrawerProps> = ({
  cohort,
  schedules,
  enrollments,
  leads,
  attendances,
  leaveRequests,
  makeupRecords,
  teachingRecords,
  operationLogs,
  cohorts,
  drawer,
  onClose,
  onToast,
  onSelectCohort,
  onSaveAttendance,
  onCreateLeaveRequest,
  onArrangeMakeup,
  onSaveTeachingRecord,
  onChangeSessionTeacher,
  onRescheduleSession,
  onAddSchedule,
  onUpdateSchedule,
}) => {
  const [saving, setSaving] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [leaveForm, setLeaveForm] = useState<LeaveDraft>({
    studentId: '',
    sessionId: '',
    reason: '',
    leaveAt: MOCK_TODAY_ISO,
    needMakeup: true,
    note: '',
    operator: '总部管理员',
  });
  const [makeupForm, setMakeupForm] = useState<MakeupDraft>({
    studentId: '',
    sessionId: '',
    method: '当前班期单独补课',
    makeupDate: MOCK_TODAY_ISO,
    teacher: '',
    note: '',
  });
  const [teachingForm, setTeachingForm] = useState<TeachingRecordDraft>({
    sessionId: '',
    contentActual: '',
    completionStatus: '',
    studentPerformance: '',
    keyIssues: '',
    nextSuggestion: '',
    attachmentNote: '',
    recorder: '总部管理员',
    anomalyNote: '',
  });
  const [teacherForm, setTeacherForm] = useState({ teacher: '', reason: '' });
  const [rescheduleForm, setRescheduleForm] = useState({
    dateIso: '',
    startTime: '09:00',
    endTime: '12:00',
    reason: '',
  });
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft>(() => createEmptyScheduleDraft(cohort));
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string>>({});

  const cohortSchedules = useMemo(
    () => filterSchedulesByCohort(schedules, cohort.id),
    [schedules, cohort.id],
  );
  const activeStudents = useMemo(
    () => getActiveCohortStudents(enrollments, cohort.id),
    [enrollments, cohort.id],
  );

  const currentKey = drawerKey(drawer);

  useEffect(() => {
    if (!drawer) return;
    setSaving(false);
    if (drawer.type === 'attendance') {
      const session = schedules.find(s => s.id === drawer.sessionId);
      const existing = attendances.find(a => a.sessionId === drawer.sessionId);
      if (existing) {
        setAttendanceEntries(existing.entries.map(e => ({ ...e })));
      } else {
        setAttendanceEntries(
          activeStudents.map(s => ({
            studentId: s.id,
            leadId: s.leadId,
            status: '待签到' as AttendanceStatus,
          })),
        );
      }
    } else if (drawer.type === 'leave') {
      setLeaveForm({
        studentId: drawer.studentId ?? activeStudents[0]?.id ?? '',
        sessionId: drawer.sessionId ?? cohortSchedules[0]?.id ?? '',
        reason: '',
        leaveAt: MOCK_TODAY_ISO,
        needMakeup: true,
        note: '',
        operator: '总部管理员',
      });
    } else if (drawer.type === 'makeup') {
      const leave = drawer.leaveRequestId
        ? leaveRequests.find(l => l.id === drawer.leaveRequestId)
        : undefined;
      setMakeupForm({
        leaveRequestId: drawer.leaveRequestId ?? leave?.id,
        studentId: drawer.studentId ?? leave?.studentId ?? activeStudents[0]?.id ?? '',
        sessionId: drawer.sessionId ?? leave?.sessionId ?? cohortSchedules[0]?.id ?? '',
        method: '当前班期单独补课',
        makeupDate: MOCK_TODAY_ISO,
        teacher: '',
        note: '',
      });
    } else if (drawer.type === 'teaching') {
      const session = schedules.find(s => s.id === drawer.sessionId);
      const existing = teachingRecords.find(t => t.sessionId === drawer.sessionId);
      setTeachingForm({
        sessionId: drawer.sessionId,
        contentActual: existing?.contentActual ?? session?.content ?? '',
        completionStatus: existing?.completionStatus ?? '',
        studentPerformance: existing?.studentPerformance ?? '',
        keyIssues: existing?.keyIssues ?? '',
        nextSuggestion: existing?.nextSuggestion ?? '',
        attachmentNote: existing?.attachmentNote ?? '',
        recorder: existing?.recorder ?? '总部管理员',
        anomalyNote: existing?.anomalyNote ?? '',
      });
    } else if (drawer.type === 'change-teacher') {
      const session = schedules.find(s => s.id === drawer.sessionId);
      setTeacherForm({ teacher: session?.teacher ?? '', reason: '' });
    } else if (drawer.type === 'reschedule') {
      const session = schedules.find(s => s.id === drawer.sessionId);
      setRescheduleForm({
        dateIso: session?.dateIso ?? cohort.startDate,
        startTime: session?.startTime ?? '09:00',
        endTime: session?.endTime ?? '12:00',
        reason: '',
      });
    } else if (drawer.type === 'add-session') {
      setScheduleDraft(createEmptyScheduleDraft(cohort));
      setScheduleErrors({});
    } else if (drawer.type === 'edit-session') {
      const session = schedules.find(s => s.id === drawer.sessionId);
      if (session) {
        setScheduleDraft({
          dateIso: session.dateIso,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          content: session.content,
          contentTemplateId: session.contentTemplateId ?? session.content,
          teacher: session.teacher,
          venue: session.venue,
          classroom: session.classroom,
          sessionType: session.sessionType,
          calcPay: session.calcPay,
          payMethod: session.payMethod,
          payAmount: session.payAmount,
          customPayReason: session.customPayReason,
          note: session.note,
          cohortId: cohort.id,
          status: session.status,
        });
      }
      setScheduleErrors({});
    }
  }, [currentKey, drawer, cohort, schedules, attendances, teachingRecords, leaveRequests, activeStudents, cohortSchedules]);

  const runSave = useCallback(
    async (fn: () => { ok: boolean; error?: string }, successMsg: string) => {
      if (saving) return;
      setSaving(true);
      const result = fn();
      if (result.ok) {
        onToast(successMsg);
        onClose();
      } else {
        onToast(result.error ?? '保存失败');
      }
      setSaving(false);
    },
    [onClose, onToast, saving],
  );

  const sessionForDrawer = useMemo(() => {
    if (!drawer) return null;
    if ('sessionId' in drawer && drawer.sessionId) {
      return schedules.find(s => s.id === drawer.sessionId) ?? null;
    }
    return null;
  }, [drawer, schedules]);

  const renderScheduleForm = () => {
    const values = scheduleDraft;
    const contentTemplate = values.contentTemplateId ?? values.content ?? '';
    const isCustom = contentTemplate === '自定义课程';

    return (
      <div className="met-rc-v2-schedule__form-grid">
        <label>
          日期
          <ResearchDateField
            value={values.dateIso}
            min={cohort.startDate}
            max={cohort.endDate}
            onChange={v => setScheduleDraft(prev => ({ ...prev, dateIso: v, date: formatDateShort(v) }))}
          />
          <ResearchFieldError message={scheduleErrors.dateIso} />
        </label>
        <label>
          开始时间
          <ResearchTimeField value={values.startTime} onChange={v => setScheduleDraft(prev => ({ ...prev, startTime: v }))} />
        </label>
        <label>
          结束时间
          <ResearchTimeField value={values.endTime} onChange={v => setScheduleDraft(prev => ({ ...prev, endTime: v }))} />
        </label>
        <label>
          课程内容
          <ResearchSelect
            value={isCustom ? '自定义课程' : String(contentTemplate)}
            options={RYT200_COURSE_TEMPLATES.map(t => ({ value: t, label: t }))}
            onChange={v => {
              setScheduleDraft(prev => ({
                ...prev,
                contentTemplateId: v,
                content: v === '自定义课程' ? prev.customContent ?? '' : v,
                customContent: v === '自定义课程' ? prev.customContent ?? '' : '',
              }));
            }}
            placeholder="请选择课程"
          />
          {isCustom ? (
            <ResearchTextField
              value={values.customContent ?? values.content ?? ''}
              onChange={v => setScheduleDraft(prev => ({ ...prev, customContent: v, content: v, contentTemplateId: '自定义课程' }))}
              placeholder="请输入自定义课程名称"
            />
          ) : null}
          <ResearchFieldError message={scheduleErrors.content} />
        </label>
        <label>
          导师
          <StaffSelector
            value={values.teacher}
            options={getTeacherSelectOptions()}
            onChange={v => {
              const config = getTeacherPay(v);
              setScheduleDraft(prev => ({
                ...prev,
                teacher: v,
                calcPay: defaultCalcPayForSession(prev.sessionType),
                payMethod: config?.payMethod,
                payAmount: config?.defaultAmount ?? 0,
              }));
            }}
            placeholder="请选择导师"
          />
          <ResearchFieldError message={scheduleErrors.teacher} />
        </label>
        <label>
          场地
          <ResearchSelect
            value={values.venue}
            options={getVenueSelectOptions()}
            onChange={v => setScheduleDraft(prev => ({ ...prev, venue: v, classroom: v === cohort.venue ? cohort.classroom : '' }))}
          />
        </label>
        <label>
          教室
          <ResearchSelect
            value={values.classroom}
            options={getClassroomOptions(values.venue)}
            onChange={v => setScheduleDraft(prev => ({ ...prev, classroom: v }))}
            placeholder="请选择教室"
          />
        </label>
        <label>
          课次类型
          <ResearchSelect
            value={values.sessionType}
            options={SESSION_TYPES.map(t => ({ value: t, label: t }))}
            onChange={v => {
              const type = v as ScheduleSessionType;
              setScheduleDraft(prev => ({
                ...prev,
                sessionType: type,
                calcPay: defaultCalcPayForSession(type),
              }));
            }}
          />
        </label>
        <label className="met-rc-v2-schedule__toggle-field">
          是否计算课酬
          <ResearchToggle
            checked={values.calcPay}
            onChange={checked => setScheduleDraft(prev => ({ ...prev, calcPay: checked, payAmount: checked ? prev.payAmount : 0 }))}
          />
        </label>
        {values.calcPay ? (
          <>
            <label>
              课酬方式
              <ResearchSelect
                value={values.payMethod ?? '按天'}
                options={PAY_METHOD_OPTIONS.map(m => ({ value: m, label: m }))}
                onChange={v => setScheduleDraft(prev => ({ ...prev, payMethod: v as ScheduleDraft['payMethod'] }))}
              />
            </label>
            <label>
              课酬金额
              <ResearchNumberField
                value={values.payAmount}
                onChange={v => setScheduleDraft(prev => ({ ...prev, payAmount: v === '' ? 0 : v }))}
                min={0}
                suffix="元"
              />
            </label>
          </>
        ) : null}
        <label>
          备注
          <ResearchTextField value={values.note} onChange={v => setScheduleDraft(prev => ({ ...prev, note: v }))} />
        </label>
      </div>
    );
  };

  if (!drawer) return null;

  const shell = (
    title: string,
    subtitle: string,
    body: React.ReactNode,
    footer?: React.ReactNode,
    testId?: string,
    wide = true,
  ) => (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭" onClick={onClose} />
      <aside
        className={['met-v2-drawer-panel', wide ? 'met-v2-drawer-panel--lg' : 'met-v2-drawer-panel--md'].join(' ')}
        role="dialog"
        aria-modal="true"
        data-testid={testId}
      >
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">{title}</h2>
            <p className="met-v2-drawer-subtitle">{subtitle}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" aria-label="关闭" onClick={onClose}>
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="met-v2-drawer-body">{body}</div>
        {footer ? <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">{footer}</div> : null}
      </aside>
    </>
  );

  const footerBtns = (primaryLabel: string, onPrimary: () => void) => (
    <>
      <button type="button" className="met-v2-drawer-footer-btn" disabled={saving} onClick={onPrimary}>
        {saving ? '保存中…' : primaryLabel}
      </button>
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        取消
      </button>
    </>
  );

  if (drawer.type === 'attendance' && sessionForDrawer) {
    return shell(
      '记录签到',
      `${sessionForDrawer.date} ${sessionForDrawer.startTime}—${sessionForDrawer.endTime} · ${sessionForDrawer.content}`,
      <>
        <div className="met-rc-v2-cohort-attendance__batch">
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
            onClick={() =>
              setAttendanceEntries(prev =>
                prev.map(e => ({ ...e, status: '已到' as AttendanceStatus })),
              )
            }
          >
            全部标记已到
          </button>
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
            onClick={() =>
              setAttendanceEntries(prev =>
                prev.map(e =>
                  e.status === '待签到' ? { ...e, status: '缺勤' as AttendanceStatus } : e,
                ),
              )
            }
          >
            未处理标记缺勤
          </button>
        </div>
        <div className="met-rc-v2-cohort-attendance__rows">
          {attendanceEntries.map(entry => {
            const student = activeStudents.find(s => s.id === entry.studentId);
            return (
              <div key={entry.studentId} className="met-rc-v2-cohort-attendance__row">
                <span className="met-rc-v2-cohort-attendance__name">{student?.studentName ?? entry.studentId}</span>
                <div className="met-rc-v2-cohort-attendance__radios" role="radiogroup" aria-label="签到状态">
                  {ATTENDANCE_STATUSES.map(status => (
                    <label key={status} className="met-rc-v2-cohort-attendance__radio">
                      <input
                        type="radio"
                        name={`att-${entry.studentId}`}
                        checked={entry.status === status}
                        onChange={() =>
                          setAttendanceEntries(prev =>
                            prev.map(e => (e.studentId === entry.studentId ? { ...e, status } : e)),
                          )
                        }
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>,
      footerBtns('保存签到', () =>
        runSave(
          () =>
            onSaveAttendance({
              sessionId: drawer.sessionId,
              entries: attendanceEntries,
              operator: '总部管理员',
            }),
          '签到已保存',
        ),
      ),
      'rc-attendance-drawer',
    );
  }

  if (drawer.type === 'leave') {
    return shell(
      '记录请假',
      '登记学员请假并决定是否安排补课',
      <div className="met-rc-v2-drawer-form">
        <label>
          学员
          <ResearchSelect
            value={leaveForm.studentId}
            options={activeStudents.map(s => ({ value: s.id, label: s.studentName }))}
            onChange={v => setLeaveForm(prev => ({ ...prev, studentId: v }))}
          />
        </label>
        <label>
          对应课次
          <ResearchSelect
            value={leaveForm.sessionId}
            options={cohortSchedules.map(s => ({
              value: s.id,
              label: `${s.date} ${s.content}`,
            }))}
            onChange={v => setLeaveForm(prev => ({ ...prev, sessionId: v }))}
          />
        </label>
        <label>
          请假原因 *
          <ResearchTextField value={leaveForm.reason} onChange={v => setLeaveForm(prev => ({ ...prev, reason: v }))} />
        </label>
        <label>
          请假日期
          <ResearchDateField
            value={leaveForm.leaveAt}
            min={cohort.startDate}
            max={cohort.endDate}
            onChange={v => setLeaveForm(prev => ({ ...prev, leaveAt: v }))}
          />
        </label>
        <label className="met-rc-v2-schedule__toggle-field">
          需要补课
          <ResearchToggle
            checked={leaveForm.needMakeup}
            onChange={checked => setLeaveForm(prev => ({ ...prev, needMakeup: checked }))}
          />
        </label>
        <label>
          备注
          <ResearchTextField value={leaveForm.note} onChange={v => setLeaveForm(prev => ({ ...prev, note: v }))} />
        </label>
      </div>,
      footerBtns('提交请假', () => runSave(() => onCreateLeaveRequest(leaveForm), '请假已登记')),
    );
  }

  if (drawer.type === 'makeup') {
    return shell(
      '安排补课',
      '为请假学员安排补课方式与时间',
      <div className="met-rc-v2-drawer-form">
        <label>
          学员
          <ResearchSelect
            value={makeupForm.studentId}
            options={activeStudents.map(s => ({ value: s.id, label: s.studentName }))}
            onChange={v => setMakeupForm(prev => ({ ...prev, studentId: v }))}
          />
        </label>
        <label>
          原缺课课次
          <ResearchSelect
            value={makeupForm.sessionId}
            options={cohortSchedules.map(s => ({
              value: s.id,
              label: `${s.date} ${s.content}`,
            }))}
            onChange={v => setMakeupForm(prev => ({ ...prev, sessionId: v }))}
          />
        </label>
        <label>
          补课方式 *
          <ResearchSelect
            value={makeupForm.method}
            options={MAKEUP_METHODS.map(m => ({ value: m, label: m }))}
            onChange={v => setMakeupForm(prev => ({ ...prev, method: v as MakeupMethod }))}
          />
        </label>
        <label>
          补课日期 *
          <ResearchDateField
            value={makeupForm.makeupDate}
            onChange={v => setMakeupForm(prev => ({ ...prev, makeupDate: v }))}
          />
        </label>
        <label>
          补课导师
          <StaffSelector
            value={makeupForm.teacher}
            options={getTeacherSelectOptions()}
            onChange={v => setMakeupForm(prev => ({ ...prev, teacher: v }))}
            placeholder="请选择导师"
          />
        </label>
        <label>
          备注
          <ResearchTextField value={makeupForm.note} onChange={v => setMakeupForm(prev => ({ ...prev, note: v }))} />
        </label>
      </div>,
      footerBtns('保存补课安排', () => runSave(() => onArrangeMakeup(makeupForm), '补课已安排')),
      'rc-makeup-drawer',
    );
  }

  if (drawer.type === 'teaching' && sessionForDrawer) {
    return shell(
      '教学记录',
      `${sessionForDrawer.date} · ${sessionForDrawer.content}`,
      <div className="met-rc-v2-drawer-form">
        <label>
          实际授课内容
          <ResearchTextField
            value={teachingForm.contentActual}
            onChange={v => setTeachingForm(prev => ({ ...prev, contentActual: v }))}
          />
        </label>
        <label>
          教学完成情况 *
          <ResearchTextField
            value={teachingForm.completionStatus}
            onChange={v => setTeachingForm(prev => ({ ...prev, completionStatus: v }))}
            placeholder="如：按计划完成"
          />
        </label>
        <label>
          学员表现
          <ResearchTextField
            value={teachingForm.studentPerformance}
            onChange={v => setTeachingForm(prev => ({ ...prev, studentPerformance: v }))}
          />
        </label>
        <label>
          重点问题
          <ResearchTextField value={teachingForm.keyIssues} onChange={v => setTeachingForm(prev => ({ ...prev, keyIssues: v }))} />
        </label>
        <label>
          后续建议
          <ResearchTextField
            value={teachingForm.nextSuggestion}
            onChange={v => setTeachingForm(prev => ({ ...prev, nextSuggestion: v }))}
          />
        </label>
        <label>
          附件说明
          <ResearchTextField
            value={teachingForm.attachmentNote}
            onChange={v => setTeachingForm(prev => ({ ...prev, attachmentNote: v }))}
          />
        </label>
        <label>
          异常说明
          <ResearchTextField
            value={teachingForm.anomalyNote ?? ''}
            onChange={v => setTeachingForm(prev => ({ ...prev, anomalyNote: v }))}
            placeholder="存在请假/缺勤时必填"
          />
        </label>
      </div>,
      footerBtns('保存教学记录', () =>
        runSave(
          () => onSaveTeachingRecord({ ...teachingForm, sessionId: drawer.sessionId }),
          '教学记录已保存',
        ),
      ),
      'rc-teaching-drawer',
    );
  }

  if (drawer.type === 'change-teacher' && sessionForDrawer) {
    return shell(
      '更换导师',
      `${sessionForDrawer.date} · ${sessionForDrawer.content}`,
      <div className="met-rc-v2-drawer-form">
        <label>
          新导师 *
          <StaffSelector
            value={teacherForm.teacher}
            options={getTeacherSelectOptions()}
            onChange={v => setTeacherForm(prev => ({ ...prev, teacher: v }))}
            placeholder="请选择导师"
          />
        </label>
        <label>
          更换原因 *
          <ResearchTextField value={teacherForm.reason} onChange={v => setTeacherForm(prev => ({ ...prev, reason: v }))} />
        </label>
      </div>,
      footerBtns('确认更换', () =>
        runSave(
          () => onChangeSessionTeacher(drawer.sessionId, teacherForm.teacher, teacherForm.reason),
          '导师已更换',
        ),
      ),
    );
  }

  if (drawer.type === 'reschedule' && sessionForDrawer) {
    return shell(
      '改期',
      `${sessionForDrawer.date} · ${sessionForDrawer.content}`,
      <div className="met-rc-v2-drawer-form">
        <label>
          新日期 *
          <ResearchDateField
            value={rescheduleForm.dateIso}
            min={cohort.startDate}
            max={cohort.endDate}
            onChange={v => setRescheduleForm(prev => ({ ...prev, dateIso: v }))}
          />
        </label>
        <label>
          开始时间
          <ResearchTimeField
            value={rescheduleForm.startTime}
            onChange={v => setRescheduleForm(prev => ({ ...prev, startTime: v }))}
          />
        </label>
        <label>
          结束时间
          <ResearchTimeField
            value={rescheduleForm.endTime}
            onChange={v => setRescheduleForm(prev => ({ ...prev, endTime: v }))}
          />
        </label>
        <label>
          改期原因 *
          <ResearchTextField value={rescheduleForm.reason} onChange={v => setRescheduleForm(prev => ({ ...prev, reason: v }))} />
        </label>
      </div>,
      footerBtns('确认改期', () =>
        runSave(
          () =>
            onRescheduleSession(drawer.sessionId, {
              dateIso: rescheduleForm.dateIso,
              startTime: rescheduleForm.startTime,
              endTime: rescheduleForm.endTime,
              reason: rescheduleForm.reason,
            }),
          '课次已改期',
        ),
      ),
      'rc-reschedule-drawer',
    );
  }

  if (drawer.type === 'student-profile') {
    const enrollment = enrollments.find(e => e.id === drawer.enrollmentId);
    const lead = enrollment ? leads.find(l => l.id === enrollment.leadId) : null;
    const history = attendances
      .filter(a => a.cohortId === cohort.id)
      .flatMap(sheet => {
        const entry = sheet.entries.find(e => e.studentId === drawer.enrollmentId);
        if (!entry) return [];
        const session = schedules.find(s => s.id === sheet.sessionId);
        return [{ session, entry, savedAt: sheet.savedAt }];
      })
      .sort((a, b) => (b.session?.dateIso ?? '').localeCompare(a.session?.dateIso ?? ''));

    return shell(
      '学员档案',
      enrollment?.studentName ?? '—',
      <>
        <section className="met-rc-v2-cohort-profile__section">
          <h4>报名信息</h4>
          {enrollment ? (
            <dl className="met-rc-v2-cohort-profile__dl">
              <div><dt>课程</dt><dd>{enrollment.course}</dd></div>
              <div><dt>成交价</dt><dd>{enrollment.dealPrice.toLocaleString()} 元</dd></div>
              <div><dt>已付</dt><dd>{enrollment.paidAmount.toLocaleString()} 元</dd></div>
              <div><dt>合同</dt><dd>{enrollment.contractStatus}</dd></div>
              <div><dt>入班</dt><dd>{enrollment.joined ? '已入班' : '未入班'}</dd></div>
            </dl>
          ) : (
            <p>未找到报名记录</p>
          )}
        </section>
        {lead ? (
          <section className="met-rc-v2-cohort-profile__section">
            <h4>咨询档案</h4>
            <dl className="met-rc-v2-cohort-profile__dl">
              <div><dt>意向</dt><dd>{lead.intentLevel}</dd></div>
              <div><dt>阶段</dt><dd>{lead.stage}</dd></div>
              <div><dt>负责人</dt><dd>{lead.owner}</dd></div>
              <div><dt>电话</dt><dd>{lead.phone ?? '—'}</dd></div>
            </dl>
          </section>
        ) : null}
        <section className="met-rc-v2-cohort-profile__section">
          <h4>签到历史</h4>
          {history.length ? (
            <ul className="met-rc-v2-cohort-profile__history">
              {history.map((row, i) => (
                <li key={`${row.session?.id}-${i}`}>
                  <span>{row.session?.date ?? '—'}</span>
                  <span>{row.session?.content ?? '—'}</span>
                  <span className={`is-${row.entry.status}`}>{row.entry.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="met-rc-v2-cohort-profile__empty">暂无签到记录</p>
          )}
        </section>
      </>,
      undefined,
      undefined,
      true,
    );
  }

  if (drawer.type === 'add-session' || drawer.type === 'edit-session') {
    const isEdit = drawer.type === 'edit-session';
    return shell(
      isEdit ? '编辑课次' : '添加课程',
      cohort.displayTitle,
      renderScheduleForm(),
      footerBtns(isEdit ? '保存修改' : '添加课次', () => {
        if (saving) return;
        const content =
          scheduleDraft.contentTemplateId === '自定义课程'
            ? (scheduleDraft.customContent ?? '').trim()
            : scheduleDraft.content.trim();
        const payload: ScheduleDraft = {
          ...scheduleDraft,
          content,
          date: formatDateShort(scheduleDraft.dateIso),
          cohortId: cohort.id,
        };
        const errors = validateScheduleDraft(payload, cohort);
        if (Object.keys(errors).length) {
          setScheduleErrors(errors as Record<string, string>);
          onToast(Object.values(errors)[0] ?? '请检查课次信息');
          return;
        }
        setSaving(true);
        if (isEdit) {
          const ok = onUpdateSchedule(drawer.sessionId, {
            ...payload,
            date: formatDateShort(payload.dateIso),
          });
          if (ok) {
            onToast('课次已更新');
            onClose();
          } else {
            onToast('保存失败');
          }
        } else {
          const ok = onAddSchedule(payload);
          if (ok) {
            onToast('课次已添加');
            onClose();
          } else {
            onToast('添加失败');
          }
        }
        setSaving(false);
      }),
    );
  }

  if (drawer.type === 'cohort-list') {
    return shell(
      '全部班期',
      '选择班期进入详情管理',
      <ul className="met-rc-v2-cohort-list">
        {cohorts.map(c => (
          <li key={c.id}>
            <button
              type="button"
              className={['met-rc-v2-cohort-list__item', c.id === cohort.id ? 'is-active' : ''].join(' ')}
              onClick={() => {
                onSelectCohort?.(c.id);
                onClose();
              }}
            >
              <strong>{c.displayTitle}</strong>
              <span>{c.status} · 实缴{c.paidCount}人</span>
            </button>
          </li>
        ))}
      </ul>,
    );
  }

  if (drawer.type === 'operation-logs') {
    const logs = operationLogs.filter(l => l.target.includes(cohort.displayTitle) || l.target.includes(cohort.name));
    return shell(
      '操作日志',
      cohort.displayTitle,
      logs.length ? (
        <ul className="met-rc-v2-cohort-logs">
          {logs.map(log => (
            <li key={log.id}>
              <span className="met-rc-v2-cohort-logs__at">{log.at}</span>
              <span className="met-rc-v2-cohort-logs__type">[{log.type}]</span>
              <span>{log.target}：{log.before} → {log.after}</span>
              {log.reason ? <em>{log.reason}</em> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p>暂无操作日志</p>
      ),
    );
  }

  return null;
};

export default CohortDeliveryDrawer;
