import React, { useMemo, useState } from 'react';
import {
  COURSE_STATUS_LABEL,
  DRAG_TEMPLATE_MIME,
  TIME_SLOTS,
  isLocalDraftSession,
  statusBadgeClass,
  type ScheduleSessionItem,
  type WeekDayHeader,
} from './courseOperationViewModel';
import CourseSessionActionMenu, { type SessionMenuAction } from './CourseSessionActionMenu';

interface WeeklyScheduleBoardProps {
  weekDayHeaders: WeekDayHeader[];
  sessions: ScheduleSessionItem[];
  selectedSessionId: string | null;
  statusFilter: string;
  onSelectSession: (id: string) => void;
  onDropTemplate: (dayIndex: number, timeSlot: string, templateId: string) => void;
  onSessionAction: (sessionId: string, action: SessionMenuAction) => void;
}

/** 62 + 128×7 ≈ 958px，1440 桌面下可完整显示周一至周日 */
const TIME_COL_WIDTH = 62;
const DAY_COL_MIN = 128;
const CALENDAR_MIN_WIDTH = TIME_COL_WIDTH + DAY_COL_MIN * 7;

const SessionCard: React.FC<{
  session: ScheduleSessionItem;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: SessionMenuAction) => void;
}> = ({ session, selected, onSelect, onAction }) => (
  <div
    className={`met-course-session-card group relative w-full ${selected ? 'is-selected' : ''}`}
  >
    <button type="button" onClick={onSelect} className="w-full text-left">
      <div className="met-course-session-card__row met-course-session-card__row--title pr-6">
        <p className="met-course-session-card__name">{session.name}</p>
        <span className={`met-course-session-card__status ${statusBadgeClass(session.status)}`}>
          {COURSE_STATUS_LABEL[session.status]}
        </span>
      </div>
      <p className="met-course-session-card__time">{session.timeLabel}</p>
      <p className="met-course-session-card__meta">
        {session.teacher} · {session.room}
      </p>
      <p className="met-course-session-card__booking">
        预约 {session.booked}/{session.capacity}
      </p>
      {session.abnormalHint ? (
        <p className="met-course-session-card__hint">{session.abnormalHint}</p>
      ) : null}
    </button>
    <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
      <CourseSessionActionMenu
        isLocalDraft={isLocalDraftSession(session.id)}
        onAction={onAction}
      />
    </div>
  </div>
);

const WeeklyScheduleBoard: React.FC<WeeklyScheduleBoardProps> = ({
  weekDayHeaders,
  sessions,
  selectedSessionId,
  statusFilter,
  onSelectSession,
  onDropTemplate,
  onSessionAction,
}) => {
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return sessions;
    return sessions.filter(s => s.status === statusFilter);
  }, [sessions, statusFilter]);

  const cellMap = useMemo(() => {
    const map = new Map<string, ScheduleSessionItem[]>();
    filteredSessions.forEach(s => {
      const key = `${s.dayIndex}-${s.timeSlot}`;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    });
    return map;
  }, [filteredSessions]);

  const isTemplateDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).some(
      t => t === DRAG_TEMPLATE_MIME || t === 'text/plain',
    );

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    if (isTemplateDrag(e)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverCell(cellKey);
    }
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, timeSlot: string) => {
    e.preventDefault();
    setDragOverCell(null);
    const templateId =
      e.dataTransfer.getData(DRAG_TEMPLATE_MIME) || e.dataTransfer.getData('text/plain');
    if (templateId.startsWith('tpl-')) onDropTemplate(dayIndex, timeSlot, templateId);
  };

  return (
    <section className="met-course-calendar met-today-surface min-w-0 flex-1">
      <div className="met-course-calendar__header">
        <div>
          <h2 className="text-sm font-semibold text-[#222622]">周排课日历</h2>
          <p className="mt-0.5 text-[11px] text-[#8A908A]">
            拖拽左侧课程到时间格 · 点击场次查看详情
          </p>
        </div>
        <span className="text-[11px] text-[#8A908A]">{filteredSessions.length} 场</span>
      </div>

      <div className="met-course-calendar__scroll custom-scroll">
        <div className="met-course-calendar__grid" style={{ minWidth: CALENDAR_MIN_WIDTH }}>
          <div
            className="met-course-calendar__head-row"
            style={{
              gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN}px, 1fr))`,
            }}
          >
            <div className="met-course-calendar__time-head" />
            {weekDayHeaders.map(day => (
              <div
                key={day.dayIndex}
                className={`met-course-calendar__day-head ${day.isToday ? 'is-today' : ''}`}
              >
                <span className="met-course-calendar__weekday">{day.weekday}</span>
                <span className="met-course-calendar__date">{day.dateLabel}</span>
              </div>
            ))}
          </div>

          {TIME_SLOTS.map(slot => (
            <div
              key={slot}
              className="met-course-calendar__row"
              style={{
                gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN}px, 1fr))`,
              }}
            >
              <div className="met-course-calendar__time-label">{slot}</div>
              {weekDayHeaders.map(day => {
                const cellKey = `${day.dayIndex}-${slot}`;
                const items = cellMap.get(cellKey) ?? [];
                const isDropTarget = dragOverCell === cellKey;
                return (
                  <div
                    key={cellKey}
                    className={`met-course-calendar__cell ${isDropTarget ? 'is-drop-target' : ''}`}
                    onDragOver={e => handleDragOver(e, cellKey)}
                    onDragLeave={() => setDragOverCell(c => (c === cellKey ? null : c))}
                    onDrop={e => handleDrop(e, day.dayIndex, slot)}
                  >
                    <div className="met-course-calendar__cell-inner">
                      {items.map(session => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          selected={selectedSessionId === session.id}
                          onSelect={() => onSelectSession(session.id)}
                          onAction={action => onSessionAction(session.id, action)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeeklyScheduleBoard;
