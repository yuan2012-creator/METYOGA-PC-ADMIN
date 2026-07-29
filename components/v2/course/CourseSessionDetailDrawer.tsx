import React from 'react';
import type {
  CourseScheduleOperationLog,
  SessionRisk,
  SessionScheduleChange,
  SessionTeacherChange,
  StoreCourseSession,
} from './domain/types';

export interface CourseSessionDetailDrawerProps {
  session: StoreCourseSession;
  risks: SessionRisk[];
  scheduleChanges: SessionScheduleChange[];
  teacherChanges: SessionTeacherChange[];
  operationLogs: CourseScheduleOperationLog[];
  staffNameMap: Map<string, string>;
  onClose: () => void;
  onNavigateToStaff?: (sessionId: string, mode?: 'assign' | 'replace' | 'detail') => void;
  onOpenStaffTeacher?: (staffId: string) => void;
  onToast: (message: string) => void;
}

function staffLabel(staffId: string | null | undefined, staffNameMap: Map<string, string>): string {
  if (!staffId) return '—';
  return staffNameMap.get(staffId) ?? '老师关联待确认';
}

function matchStatusLabel(session: StoreCourseSession, risks: SessionRisk[]): string {
  if (session.teacherAssignment.teacherUnresolved) return '老师关联待确认';
  if (!session.teacherAssignment.staffId) return '缺老师';
  if (session.teacherAssignment.assignmentStatus === '待替代') return '待替代';
  if (risks.some(r => r.type === '时间冲突')) return '时间冲突';
  if (risks.some(r => r.type === '能力不匹配')) return '能力不匹配';
  if (risks.some(r => r.type === '门店无授权')) return '门店无授权';
  if (risks.some(r => r.type === '请假影响')) return '请假影响';
  return '已匹配';
}

const CourseSessionDetailDrawer: React.FC<CourseSessionDetailDrawerProps> = ({
  session,
  risks,
  scheduleChanges,
  teacherChanges,
  operationLogs,
  staffNameMap,
  onClose,
  onNavigateToStaff,
  onOpenStaffTeacher,
}) => {
  const assignment = session.teacherAssignment;
  const sessionRisks = risks.filter(r => r.sessionId === session.id && !r.resolved);
  const sessionScheduleChanges = scheduleChanges.filter(c => c.sessionId === session.id);
  const sessionTeacherChanges = teacherChanges.filter(c => c.sessionId === session.id);
  const sessionLogs = operationLogs.filter(l => l.targetId === session.id).slice(0, 8);
  const needsStaffAction = sessionRisks.some(
    r =>
      r.type === '缺老师' ||
      r.type === '时间冲突' ||
      r.type === '请假影响' ||
      r.type === '能力不匹配',
  );
  const assignMode =
    !assignment.staffId || assignment.assignmentStatus === '待指定' ? 'assign' : 'replace';

  return (
    <>
      <button
        type="button"
        className="met-course-v2-drawer-overlay met-v2-drawer-overlay"
        aria-label="关闭课程详情"
        onClick={onClose}
      />
      <aside
        className="met-course-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md"
        role="dialog"
        aria-labelledby="course-session-drawer-title"
        data-testid="course-session-drawer"
      >
        <div className="met-course-v2-drawer__head met-v2-drawer-header">
          <div>
            <h2 id="course-session-drawer-title" className="met-course-v2-drawer__title met-v2-drawer-title">
              {session.courseName}
            </h2>
            <p className="met-course-v2-drawer__subtitle met-v2-drawer-subtitle">
              {session.dateIso} {session.startTime}–{session.endTime} · {session.storeName} ·{' '}
              {session.classroomName}
            </p>
          </div>
          <button
            type="button"
            className="met-course-v2-drawer__close met-v2-drawer-close"
            aria-label="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="met-course-v2-drawer__body met-v2-drawer-body">
          <section className="met-course-v2-drawer__section">
            <h3 className="met-course-v2-drawer__section-title">授课老师</h3>
            <div className="met-course-v2-drawer__row">
              <span className="met-course-v2-drawer__row-label">当前老师</span>
              {assignment.staffId ? (
                <button
                  type="button"
                  className="met-course-v2-drawer__row-value met-course-v2-drawer__link-btn"
                  data-testid={`course-teacher-link-${session.id}`}
                  onClick={() => onOpenStaffTeacher?.(assignment.staffId!)}
                >
                  {staffLabel(assignment.staffId, staffNameMap)}
                  {assignment.isSubstitute ? ' · 代课' : ''}
                </button>
              ) : (
                <span className="met-course-v2-drawer__row-value">待指定</span>
              )}
            </div>
            {assignment.previousStaffId ? (
              <div className="met-course-v2-drawer__row">
                <span className="met-course-v2-drawer__row-label">原老师</span>
                <button
                  type="button"
                  className="met-course-v2-drawer__row-value met-course-v2-drawer__link-btn"
                  onClick={() => onOpenStaffTeacher?.(assignment.previousStaffId!)}
                >
                  {staffLabel(assignment.previousStaffId, staffNameMap)}
                </button>
              </div>
            ) : null}
            <div className="met-course-v2-drawer__row">
              <span className="met-course-v2-drawer__row-label">老师匹配状态</span>
              <span className="met-course-v2-drawer__row-value">{matchStatusLabel(session, sessionRisks)}</span>
            </div>
            <div className="met-course-v2-drawer__row">
              <span className="met-course-v2-drawer__row-label">排课状态</span>
              <span className="met-course-v2-drawer__row-value">{assignment.assignmentStatus}</span>
            </div>
            <div className="met-course-v2-drawer__row">
              <span className="met-course-v2-drawer__row-label">课次状态</span>
              <span className="met-course-v2-drawer__row-value">{session.sessionStatus}</span>
            </div>
            <div className="met-course-v2-drawer__row">
              <span className="met-course-v2-drawer__row-label">预约</span>
              <span className="met-course-v2-drawer__row-value">
                {session.bookingCount}/{session.capacity}
                {session.waitlistCount > 0 ? ` · 候补 ${session.waitlistCount}` : ''}
              </span>
            </div>
            {sessionRisks.length > 0 ? (
              <div className="met-course-v2-drawer__tags" style={{ marginTop: 8 }}>
                {sessionRisks.map(risk => (
                  <span key={risk.id} className="met-course-v2-tag">
                    {risk.type}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          {sessionScheduleChanges.length > 0 ? (
            <section className="met-course-v2-drawer__section">
              <h3 className="met-course-v2-drawer__section-title">改期历史</h3>
              {sessionScheduleChanges.map(change => (
                <div key={change.id} className="met-course-v2-drawer__row">
                  <span className="met-course-v2-drawer__row-label">{change.changedAt.slice(0, 10)}</span>
                  <span className="met-course-v2-drawer__row-value">{change.reason}</span>
                </div>
              ))}
            </section>
          ) : null}

          {sessionTeacherChanges.length > 0 ? (
            <section className="met-course-v2-drawer__section">
              <h3 className="met-course-v2-drawer__section-title">老师变更</h3>
              {sessionTeacherChanges.map(change => (
                <div key={change.id} className="met-course-v2-drawer__row">
                  <span className="met-course-v2-drawer__row-label">{change.changeType}</span>
                  <span className="met-course-v2-drawer__row-value">
                    {staffLabel(change.fromStaffId, staffNameMap)} →{' '}
                    {staffLabel(change.toStaffId, staffNameMap)}
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          {sessionLogs.length > 0 ? (
            <section className="met-course-v2-drawer__section">
              <h3 className="met-course-v2-drawer__section-title">操作日志</h3>
              {sessionLogs.map(log => (
                <div key={log.id} className="met-course-v2-drawer__row">
                  <span className="met-course-v2-drawer__row-label">{log.action}</span>
                  <span className="met-course-v2-drawer__row-value">
                    {log.operatorName} · {log.at.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          <div className="met-course-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
            {needsStaffAction && onNavigateToStaff ? (
              <button
                type="button"
                className="met-v2-drawer-footer-btn met-course-v2-btn--primary"
                data-testid={`course-nav-staff-${session.id}`}
                onClick={() => onNavigateToStaff(session.id, assignMode)}
              >
                进入师资处理
              </button>
            ) : null}
            {onNavigateToStaff ? (
              <button
                type="button"
                className="met-v2-drawer-footer-btn"
                data-testid={`course-replace-drawer-${session.id}`}
                onClick={() => onNavigateToStaff(session.id, 'replace')}
              >
                更换老师
              </button>
            ) : null}
            {assignment.staffId && onOpenStaffTeacher ? (
              <button
                type="button"
                className="met-v2-drawer-footer-btn"
                data-testid={`course-open-teacher-${session.id}`}
                onClick={() => onOpenStaffTeacher(assignment.staffId!)}
              >
                查看老师详情
              </button>
            ) : null}
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CourseSessionDetailDrawer;
