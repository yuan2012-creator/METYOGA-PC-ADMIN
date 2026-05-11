import React, { useMemo, useState } from 'react';
import {
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_COURSE_SESSIONS,
  MOCK_COURSES,
  MOCK_MEMBERS,
} from '../constants';
import {
  buildOpsSchedule,
  COURSE_ROOMS,
  assignSubstituteTeacher,
  bookDemoMemberForSession,
  cancelScheduleEvent,
  checkInDemoAttendanceForSession,
  completeDemoAttendanceForSession,
  createDraftEventFromCourse,
  createEventFromScheduleForm,
  createScheduleFormDraft,
  filterOpsSchedule,
  getTodayOperationScheduleEvents,
  getOpsAiGuidance,
  getOpsSummary,
  moveScheduleEvent,
  scheduleEventMatchesSessionId,
  toCourseLibraryItem,
  toOpsScheduleItem,
  toScheduleEvent,
} from '../utils/courseSelectors';
import type {
  CourseLibraryItem,
  OpsFilter,
  OpsScheduleItem,
  ScheduleEvent,
  ScheduleFormState,
} from '../utils/courseSelectors';
import CourseLibrary from './courses/CourseLibrary';
import ScheduleCalendar from './courses/ScheduleCalendar';
import ScheduleForm from './courses/ScheduleForm';
import CourseSessionOpsDrawer from './courses/CourseSessionOpsDrawer';
import type { CourseSessionOpsTab } from './courses/CourseSessionOpsDrawer';
import TodayOpsPanel from './courses/TodayOpsPanel';
import {
  cancelScheduleEvent as markScheduleEventCanceled,
  rescheduleScheduleEvent,
  substituteScheduleEvent,
} from '../utils/courseSessionChange';
import {
  getPublishToastMessage,
  isScheduleEventPublishDraft,
  publishScheduleEvents,
} from '../utils/courseSchedulePublish';
import type { CourseSession, FinanceLedgerEntry, MockCourseConsumptionRecord, MockTeacherSessionPayRecord } from '../types';
import {
  canCompleteCourseSession,
  completeCourseSessionMock,
} from '../utils/courseSessionSettlement';
import {
  COURSE_OPS_SCENARIO_ATTENDANCES,
  COURSE_OPS_SCENARIO_BOOKINGS,
  COURSE_OPS_SCENARIO_EVENTS,
} from '../utils/courseOpsScenarioFixtures';

const INITIAL_LIBRARY_LIST = MOCK_COURSES.map(toCourseLibraryItem);

const COURSE_OPS_MERGED_SESSIONS: CourseSession[] = [
  ...MOCK_COURSE_SESSIONS,
  ...COURSE_OPS_SCENARIO_EVENTS,
];
const COURSE_OPS_MERGED_BOOKINGS = [...MOCK_BOOKINGS, ...COURSE_OPS_SCENARIO_BOOKINGS];
const COURSE_OPS_MERGED_ATTENDANCES = [...MOCK_ATTENDANCES, ...COURSE_OPS_SCENARIO_ATTENDANCES];

const INITIAL_SCHEDULE_EVENTS = COURSE_OPS_MERGED_SESSIONS.map(session => (
  toScheduleEvent(session, INITIAL_LIBRARY_LIST, COURSE_OPS_MERGED_BOOKINGS)
));

type CourseToastTone = 'info' | 'success' | 'warning';

interface CourseToast {
  id: number;
  message: string;
  tone: CourseToastTone;
}

interface CourseConfirmDialog {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const Courses: React.FC = () => {
  const [opsFilter, setOpsFilter] = useState<OpsFilter>('all');
  const [isLibraryManagementOpen, setIsLibraryManagementOpen] = useState(false);
  const [toast, setToast] = useState<CourseToast | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<CourseConfirmDialog | null>(null);
  const [isOpsDrawerOpen, setIsOpsDrawerOpen] = useState(false);
  const [activeOpsSessionId, setActiveOpsSessionId] = useState<string | null>(null);
  const [activeOpsDrawerTab, setActiveOpsDrawerTab] = useState<CourseSessionOpsTab>('overview');
  
  // --- Library State (Courses) ---
  const [libraryList, setLibraryList] = useState<CourseLibraryItem[]>(INITIAL_LIBRARY_LIST);

  const [selectedCourse, setSelectedCourse] = useState<CourseLibraryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // --- Scheduling State ---
  const rooms = COURSE_ROOMS;
  const [activeRoomId, setActiveRoomId] = useState(rooms[0].id);
  
  // DRAG & DROP STATE
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE_EVENTS);
  const [bookings, setBookings] = useState(COURSE_OPS_MERGED_BOOKINGS);
  const [attendances, setAttendances] = useState(COURSE_OPS_MERGED_ATTENDANCES);
  const [draggedCourse, setDraggedCourse] = useState<CourseLibraryItem | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [mockConsumptions, setMockConsumptions] = useState<MockCourseConsumptionRecord[]>([]);
  const [mockTeacherSessionPays, setMockTeacherSessionPays] = useState<MockTeacherSessionPayRecord[]>([]);
  const [mockFinanceLedgerEntries, setMockFinanceLedgerEntries] = useState<FinanceLedgerEntry[]>([]);
  const todayOperationScheduleEvents = getTodayOperationScheduleEvents(scheduleEvents);
  const draftScheduleCount = scheduleEvents.filter(isScheduleEventPublishDraft).length;

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormIsCreate, setScheduleFormIsCreate] = useState(true);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
      id: '',
      dayIndex: 0,
      roomId: '',
      courseId: '',
      teacherName: '',
      startTime: '',
      duration: 60,
      capacity: 0,
  });

  const weekDays = ['Mon 05/04', 'Tue 05/05', 'Wed 05/06', 'Thu 05/07', 'Fri 05/08', 'Sat 05/09', 'Sun 05/10'];
  const startHour = 8;
  const endHour = 22;
  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  const hourHeight = 70; // pixels per hour for a slightly compact view

  // --- Today's Ops: CourseSession + Booking + Attendance ---
  const todayOpsSchedule = buildOpsSchedule(todayOperationScheduleEvents, libraryList, bookings, attendances);
  const filteredOpsSchedule = filterOpsSchedule(todayOpsSchedule, opsFilter);
  const opsSummary = getOpsSummary(todayOpsSchedule);
  const aiGuidance = getOpsAiGuidance(todayOpsSchedule, opsSummary);

  const activeDrawerScheduleEvent = useMemo(() => {
    if (activeOpsSessionId == null) return null;
    return scheduleEvents.find(e => scheduleEventMatchesSessionId(e, activeOpsSessionId)) ?? null;
  }, [activeOpsSessionId, scheduleEvents]);

  const activeOpsSession = useMemo((): OpsScheduleItem | null => {
    if (activeOpsSessionId == null) return null;
    const fromOps = todayOpsSchedule.find(s => s.id === activeOpsSessionId);
    if (fromOps) return fromOps;
    const ev = scheduleEvents.find(e => scheduleEventMatchesSessionId(e, activeOpsSessionId));
    if (!ev) return null;
    return toOpsScheduleItem(ev, libraryList, bookings, attendances);
  }, [activeOpsSessionId, todayOpsSchedule, scheduleEvents, libraryList, bookings, attendances]);

  const openSessionOpsDrawer = (tab: CourseSessionOpsTab, sessionId?: string) => {
    const resolved =
      sessionId ??
      todayOpsSchedule.find(s => s.abnormal)?.id ??
      todayOpsSchedule[0]?.id ??
      null;
    setActiveOpsDrawerTab(tab);
    setActiveOpsSessionId(resolved);
    setIsOpsDrawerOpen(true);
  };

  const openSessionCard = (sessionId: string) => {
    const item = todayOpsSchedule.find(s => s.id === sessionId);
    setActiveOpsDrawerTab(item?.abnormal ? 'exceptions' : 'overview');
    setActiveOpsSessionId(sessionId);
    setIsOpsDrawerOpen(true);
  };

  const closeSessionOpsDrawer = () => setIsOpsDrawerOpen(false);

  // --- Actions ---
  const showToast = (message: string, tone: CourseToastTone = 'info') => {
      setToast({ id: Date.now(), message, tone });
      window.setTimeout(() => {
          setToast(current => (current?.message === message ? null : current));
      }, 2400);
  };
  
  const handleDuplicate = (course: CourseLibraryItem, e: React.MouseEvent) => {
      e.stopPropagation();
      const newCourse: CourseLibraryItem = { ...course, id: `course-${Date.now()}`, name: `${course.name} (复制)` };
      setLibraryList([newCourse, ...libraryList]);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmDialog({
          title: '删除课程',
          message: '确定要删除该课程吗？此操作不可恢复。',
          confirmLabel: '删除课程',
          onConfirm: () => setLibraryList(current => current.filter(c => c.id !== id)),
      });
  };

  const handleOpenDetail = (course: CourseLibraryItem) => {
      setSelectedCourse(course);
      setEditMode(false);
      setIsDetailModalOpen(true);
  };

  const handleSaveCourse = (updatedCourse: CourseLibraryItem) => {
      setLibraryList(libraryList.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setIsDetailModalOpen(false);
  };

  const handleGlobalCreate = () => {
      const capacity = rooms.find(r => r.id === activeRoomId)?.capacity || 10;
      setScheduleFormIsCreate(true);
      setScheduleForm(createScheduleFormDraft(4, activeRoomId, '10:00', capacity));
      setIsScheduleModalOpen(true);
  };

  const handlePublishSchedule = () => {
      const result = publishScheduleEvents(scheduleEvents);
      const message = getPublishToastMessage(result);
      if (result.publishedCount > 0) {
          setScheduleEvents(result.nextEvents);
          const hasIssues = result.invalidCount + result.blockedExceptionCount > 0;
          showToast(message, hasIssues ? 'info' : 'success');
      } else {
          showToast(message, 'warning');
      }
  };

  const handleCompleteCourseSettlement = (sessionId: string) => {
      const event = scheduleEvents.find(ev => scheduleEventMatchesSessionId(ev, sessionId));
      if (!event) {
          showToast('暂未找到该课程场次，操作未完成。', 'warning');
          return;
      }
      const gate = canCompleteCourseSession(event, attendances, bookings);
      if (!gate.allowed) {
          showToast(gate.reason, 'warning');
          return;
      }
      const result = completeCourseSessionMock(event, attendances, bookings, libraryList);
      if (result.consumptions.length === 0 || result.financeEntries.length === 0) {
          showToast(result.summary, 'warning');
          return;
      }
      setScheduleEvents(prev => prev.map(ev => (
          scheduleEventMatchesSessionId(ev, sessionId) ? result.nextEvent : ev
      )));
      setMockConsumptions(prev => [...prev, ...result.consumptions]);
      if (result.teacherPay) {
          setMockTeacherSessionPays(prev => [...prev, result.teacherPay]);
      }
      setMockFinanceLedgerEntries(prev => [...prev, ...result.financeEntries]);
      showToast('课程已完成归档，已生成耗课、老师课时与确认收入估算记录。', 'success');
  };

  const handleCancelScheduleSession = (sessionId: string, reason: string) => {
      let applied = false;
      setScheduleEvents(prev => {
          if (!prev.some(ev => scheduleEventMatchesSessionId(ev, sessionId))) return prev;
          applied = true;
          return prev.map(ev => (
              scheduleEventMatchesSessionId(ev, sessionId) ? markScheduleEventCanceled(ev, { reason }) : ev
          ));
      });
      if (applied) {
          showToast('课程已标记为已取消。会员通知与权益处理将在后续接入。', 'success');
      } else {
          showToast('暂未找到该课程场次，操作未完成。', 'warning');
      }
  };

  const handleRescheduleSession = (sessionId: string, reason: string, note?: string) => {
      let applied = false;
      setScheduleEvents(prev => {
          if (!prev.some(ev => scheduleEventMatchesSessionId(ev, sessionId))) return prev;
          applied = true;
          return prev.map(ev => (
              scheduleEventMatchesSessionId(ev, sessionId) ? rescheduleScheduleEvent(ev, { reason, note }) : ev
          ));
      });
      if (applied) {
          showToast('课程已标记为已调课。会员与老师通知将在后续接入。', 'success');
      } else {
          showToast('暂未找到该课程场次，操作未完成。', 'warning');
      }
  };

  const handleSubstituteSession = (sessionId: string, substituteTeacherName: string, reason: string) => {
      let applied = false;
      setScheduleEvents(prev => {
          if (!prev.some(ev => scheduleEventMatchesSessionId(ev, sessionId))) return prev;
          applied = true;
          return prev.map(ev => (
              scheduleEventMatchesSessionId(ev, sessionId) ? substituteScheduleEvent(ev, { substituteTeacherName, reason }) : ev
          ));
      });
      if (applied) {
          showToast('课程已标记为代课中。老师课时与通知规则将在后续接入。', 'success');
      } else {
          showToast('暂未找到该课程场次，操作未完成。', 'warning');
      }
  };

  const handleCreateNewCourse = () => {
      setIsLibraryManagementOpen(true);
      const newCourse: CourseLibraryItem = {
          id: `course-${Date.now()}`,
          name: '新课程',
          type: 'group',
          durationMinutes: 60,
          category: '瑜伽',
          difficulty: 'beginner',
          status: 'active',
          levelLabel: 'L1 入门',
          price: 0,
          rating: 0,
          suitable: [],
          description: '',
          goals: '',
          notes: '',
          colorTag: 'bg-gray-100 text-gray-700 border-gray-200',
      };
      setSelectedCourse(newCourse);
      setEditMode(true);
      setIsDetailModalOpen(true);
      setLibraryList([newCourse, ...libraryList]);
  };

  // --- Drag & Drop Handlers ---

  const handleCourseDragStart = (e: React.DragEvent, course: CourseLibraryItem) => {
      setDraggedCourse(course);
      setDraggedEventId(null);
      e.dataTransfer.effectAllowed = 'copy';
  };

  const handleEventDragStart = (e: React.DragEvent, event: ScheduleEvent) => {
      setDraggedEventId(event.id);
      setDraggedCourse(null);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = draggedEventId ? 'move' : 'copy';
  };

  const getClickedTime = (e: React.DragEvent | React.MouseEvent, container: HTMLDivElement) => {
      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top + container.scrollTop;
      const hoursPassed = y / hourHeight;
      const totalMinutes = hoursPassed * 60;
      const snappedMinutes = Math.floor(totalMinutes / 15) * 15; // Snap to 15 mins
      const hour = Math.floor(snappedMinutes / 60) + startHour;
      const minute = snappedMinutes % 60;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
      e.preventDefault();
      const dropTime = getClickedTime(e, e.currentTarget as HTMLDivElement);

      if (draggedCourse) {
          const capacity = rooms.find(r => r.id === activeRoomId)?.capacity || 10;
          const newEvent = createDraftEventFromCourse(draggedCourse, dayIndex, activeRoomId, dropTime, capacity);
          setScheduleEvents(current => [...current, newEvent]);
          openScheduleFormFromEvent(newEvent, true);
      } else if (draggedEventId) {
          setScheduleEvents(current => current.map(evt => (
              evt.id === draggedEventId
                ? moveScheduleEvent(evt, dayIndex, activeRoomId, dropTime)
                : evt
          )));
      }
      setDraggedCourse(null);
      setDraggedEventId(null);
  };

  const handleGridClick = (e: React.MouseEvent, dayIndex: number) => {
      if (e.target === e.currentTarget) {
          const clickedTime = getClickedTime(e, e.currentTarget as HTMLDivElement);
          const capacity = rooms.find(r => r.id === activeRoomId)?.capacity || 10;
          setScheduleFormIsCreate(true);
          setScheduleForm(createScheduleFormDraft(dayIndex, activeRoomId, clickedTime, capacity));
          setIsScheduleModalOpen(true);
      }
  };

  const openScheduleFormFromEvent = (evt: ScheduleEvent, isCreate: boolean) => {
      setScheduleFormIsCreate(isCreate);
      setScheduleForm({
          id: evt.id, dayIndex: evt.dayIndex, roomId: evt.roomId, courseId: evt.courseId, teacherName: evt.teacher,
          startTime: evt.startTime, duration: evt.duration, capacity: evt.capacity
      });
      setIsScheduleModalOpen(true);
  };

  const confirmSchedule = () => {
      const existingIdx = scheduleEvents.findIndex(e => e.id === scheduleForm.id);
      const newEventData = createEventFromScheduleForm(
          scheduleForm,
          libraryList,
          existingIdx >= 0 ? scheduleEvents[existingIdx] : undefined
      );

      if (existingIdx >= 0) {
          const updated = [...scheduleEvents];
          updated[existingIdx] = newEventData;
          setScheduleEvents(updated);
      } else {
          setScheduleEvents(current => [...current, newEventData]);
      }
      setIsScheduleModalOpen(false);
  };

  const deleteEvent = (id: string) => {
      setConfirmDialog({
          title: '取消排课',
          message: '确定取消该排课？',
          confirmLabel: '取消排课',
          onConfirm: () => {
              setScheduleEvents(current => current.map(event => (
                  event.id === id ? cancelScheduleEvent(event) : event
              )));
              setIsScheduleModalOpen(false);
          },
      });
  };

  const handleSubstitute = (sessionId: string) => {
      let feedback = '';
      setScheduleEvents(current => current.map(event => {
          if (event.id !== sessionId) return event;
          const result = assignSubstituteTeacher(event);
          feedback = result.message;
          return result.event;
      }));
      showToast(feedback || '已进入代课处理演示流程', 'success');
  };

  const handleOpsBooking = (sessionId: string) => {
      let feedback = '';
      setScheduleEvents(current => current.map(event => {
          if (event.id !== sessionId) return event;
          const result = bookDemoMemberForSession(event, bookings);
          setBookings(result.bookings);
          feedback = result.message;
          return result.event;
      }));
      showToast(feedback || '已新增演示预约', 'success');
  };

  const handleOpsCheckIn = (sessionId: string) => {
      let feedback = '';
      setScheduleEvents(current => current.map(event => {
          if (event.id !== sessionId) return event;
          const result = checkInDemoAttendanceForSession(event, bookings, attendances);
          setBookings(result.bookings);
          setAttendances(result.attendances);
          feedback = result.message;
          return result.event;
      }));
      showToast(feedback || '已处理签到演示状态', 'success');
  };

  const handleOpsComplete = (sessionId: string) => {
      let feedback = '';
      setScheduleEvents(current => current.map(event => {
          if (event.id !== sessionId) return event;
          const result = completeDemoAttendanceForSession(event, bookings, attendances);
          setBookings(result.bookings);
          setAttendances(result.attendances);
          feedback = result.message;
          return result.event;
      }));
      showToast(feedback || '已完成课程演示状态', 'success');
  };

  const handleOpenCheckInReview = () => {
      showToast('签到核验记录待接入，当前仅展示课程执行状态。', 'info');
  };

  const handleOpenExceptionCenter = () => {
      showToast('课程异常处理待接入，当前仅展示异常提醒。', 'info');
  };

  const handleRequestCompleteCourse = (sessionId: string) => {
      setConfirmDialog({
          title: '确认完课',
          message: '确认后将把该课程场次标记为已完课，并更新当前演示状态。真实扣课、老师课时与财务确认需以后端记录为准。',
          confirmLabel: '确认完课',
          onConfirm: () => handleOpsComplete(sessionId),
      });
  };

  return (
    <div className="relative flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-x-hidden bg-[#F5F5F7] animate-fadeIn">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">课程运营</h2>
          </div>
          <div className="flex items-center gap-4">
              <button
                  type="button"
                  onClick={handleGlobalCreate}
                  className="met-primary-button flex items-center gap-2 text-xs"
              >
                  <i className="fa-solid fa-plus" aria-hidden /> 排课
              </button>
          </div>
      </div>

      {/* Content Area */}
      <div className="custom-scroll min-h-0 w-full max-w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-6">
              <TodayOpsPanel
                  opsFilter={opsFilter}
                  setOpsFilter={setOpsFilter}
                  filteredOpsSchedule={filteredOpsSchedule}
                  opsSummary={opsSummary}
                  aiGuidance={aiGuidance}
                  calendarSessions={todayOperationScheduleEvents}
                  bookings={bookings}
                  attendances={attendances}
                  onOpenSessionCard={openSessionCard}
                  onOpenSessionOpsDrawer={openSessionOpsDrawer}
                  onOpenCheckInReview={handleOpenCheckInReview}
                  onOpenExceptionCenter={handleOpenExceptionCenter}
              />

              <section className="space-y-4">
                  <h3 className="px-0.5 text-base font-bold text-gray-900">排课工作台</h3>
                  <ScheduleCalendar
                      libraryList={libraryList}
                      rooms={rooms}
                      activeRoomId={activeRoomId}
                      setActiveRoomId={setActiveRoomId}
                      weekDays={weekDays}
                      hoursArray={hoursArray}
                      hourHeight={hourHeight}
                      scheduleEvents={todayOperationScheduleEvents}
                      bookings={bookings}
                      attendances={attendances}
                      draggedEventId={draggedEventId}
                      handleCourseDragStart={handleCourseDragStart}
                      handleEventDragStart={handleEventDragStart}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      handleGridClick={handleGridClick}
                      openEditModal={evt => openScheduleFormFromEvent(evt, false)}
                      onRegenerateAi={() => showToast('正在根据历史数据重新计算排课建议…', 'info')}
                      isLibraryManagementOpen={isLibraryManagementOpen}
                      onToggleLibraryManagement={() => setIsLibraryManagementOpen(o => !o)}
                      onPublishSchedule={handlePublishSchedule}
                      draftScheduleCount={draftScheduleCount}
                  />

                  {isLibraryManagementOpen ? (
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
                              <h4 className="text-sm font-bold text-gray-900">课程库管理</h4>
                              <button
                                  type="button"
                                  onClick={() => setIsLibraryManagementOpen(false)}
                                  className="met-secondary-button !h-8 !min-h-0 !px-3 !py-0 !text-[11px]"
                              >
                                  收起
                              </button>
                          </div>
                          <CourseLibrary
                              embedded
                              onCreateCourse={handleCreateNewCourse}
                              libraryList={libraryList}
                              selectedCourse={selectedCourse}
                              setSelectedCourse={setSelectedCourse}
                              isDetailModalOpen={isDetailModalOpen}
                              setIsDetailModalOpen={setIsDetailModalOpen}
                              editMode={editMode}
                              setEditMode={setEditMode}
                              handleOpenDetail={handleOpenDetail}
                              handleDuplicate={handleDuplicate}
                              handleDelete={handleDelete}
                              handleSaveCourse={handleSaveCourse}
                          />
                      </div>
                  ) : null}
              </section>
          </div>
      </div>

      <ScheduleForm
        isOpen={isScheduleModalOpen}
        setIsOpen={setIsScheduleModalOpen}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        libraryList={libraryList}
        confirmSchedule={confirmSchedule}
        deleteEvent={deleteEvent}
        scheduleFormIsCreate={scheduleFormIsCreate}
        weekDays={weekDays}
        rooms={rooms}
      />

      <CourseSessionOpsDrawer
          isOpen={isOpsDrawerOpen}
          onClose={closeSessionOpsDrawer}
          tab={activeOpsDrawerTab}
          onTabChange={setActiveOpsDrawerTab}
          session={activeOpsSession}
          scheduleEvent={activeDrawerScheduleEvent}
          bookings={bookings}
          attendances={attendances}
          members={MOCK_MEMBERS}
          onCancelSession={handleCancelScheduleSession}
          onRescheduleSession={handleRescheduleSession}
          onSubstituteSession={handleSubstituteSession}
          onCompleteCourseSettlement={handleCompleteCourseSettlement}
          mockConsumptions={mockConsumptions}
          mockTeacherSessionPays={mockTeacherSessionPays}
          mockFinanceLedgerEntries={mockFinanceLedgerEntries}
      />

      {toast && (
          <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
              <div className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                  toast.tone === 'success'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : toast.tone === 'warning'
                    ? 'bg-amber-50 text-amber-900 border-amber-100'
                    : 'bg-white text-gray-800 border-gray-100'
              }`}>
                  <i className={`fa-solid ${
                    toast.tone === 'success'
                      ? 'fa-circle-check'
                      : toast.tone === 'warning'
                        ? 'fa-triangle-exclamation'
                        : 'fa-circle-info'
                  }`}></i>
                  {toast.message}
                  <button onClick={() => setToast(null)} className="ml-2 text-current opacity-50 hover:opacity-100">
                      <i className="fa-solid fa-xmark"></i>
                  </button>
              </div>
          </div>
      )}

      {confirmDialog && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setConfirmDialog(null)}></div>
              <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 p-6 animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">{confirmDialog.message}</p>
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                          取消
                      </button>
                      <button
                          onClick={() => {
                              confirmDialog.onConfirm();
                              setConfirmDialog(null);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition"
                      >
                          {confirmDialog.confirmLabel || '确认'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Courses;
