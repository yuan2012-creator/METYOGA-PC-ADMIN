import React, { useState } from 'react';
import {
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_COURSE_SESSIONS,
  MOCK_COURSES,
} from '../constants';
import {
  buildOpsSchedule,
  COURSE_ROOMS,
  COURSE_SUB_TABS,
  assignSubstituteTeacher,
  bookDemoMemberForSession,
  cancelScheduleEvent,
  checkInDemoAttendanceForSession,
  completeDemoAttendanceForSession,
  createDraftEventFromCourse,
  createEventFromScheduleForm,
  createScheduleFormDraft,
  filterOpsSchedule,
  getActiveScheduleEvents,
  getOpsAiGuidance,
  getOpsSummary,
  moveScheduleEvent,
  toCourseLibraryItem,
  toScheduleEvent,
} from '../utils/courseSelectors';
import type {
  CourseLibraryItem,
  CourseSubTab,
  OpsFilter,
  ScheduleEvent,
  ScheduleFormState,
} from '../utils/courseSelectors';
import CourseLibrary from './courses/CourseLibrary';
import ScheduleCalendar from './courses/ScheduleCalendar';
import ScheduleForm from './courses/ScheduleForm';
import TodayOpsPanel from './courses/TodayOpsPanel';

const INITIAL_LIBRARY_LIST = MOCK_COURSES.map(toCourseLibraryItem);
const INITIAL_SCHEDULE_EVENTS = MOCK_COURSE_SESSIONS.map(session => (
  toScheduleEvent(session, INITIAL_LIBRARY_LIST, MOCK_BOOKINGS)
));

type CourseToastTone = 'info' | 'success';

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
  const [currentSubTab, setCurrentSubTab] = useState<CourseSubTab>('schedule');
  const [opsFilter, setOpsFilter] = useState<OpsFilter>('all');
  const [toast, setToast] = useState<CourseToast | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<CourseConfirmDialog | null>(null);
  
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
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [attendances, setAttendances] = useState(MOCK_ATTENDANCES);
  const [draggedCourse, setDraggedCourse] = useState<CourseLibraryItem | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const activeScheduleEvents = getActiveScheduleEvents(scheduleEvents);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
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
  const todayOpsSchedule = buildOpsSchedule(activeScheduleEvents, libraryList, bookings, attendances);
  const filteredOpsSchedule = filterOpsSchedule(todayOpsSchedule, opsFilter);
  const opsSummary = getOpsSummary(todayOpsSchedule);
  const aiGuidance = getOpsAiGuidance(todayOpsSchedule, opsSummary);

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
      if (currentSubTab === 'library') {
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
              colorTag: 'bg-gray-100 text-gray-700 border-gray-200'
          };
          setSelectedCourse(newCourse);
          setEditMode(true);
          setIsDetailModalOpen(true);
          setLibraryList([newCourse, ...libraryList]);
          return;
      }

      const capacity = rooms.find(r => r.id === activeRoomId)?.capacity || 10;
      setScheduleForm(createScheduleFormDraft(4, activeRoomId, '10:00', capacity));
      setIsScheduleModalOpen(true);
  };
  
  const getCreateLabel = () => {
    switch (currentSubTab) {
        case 'schedule': return '排课';
        case 'library': return '新建课程';
        default: return '新建';
    }
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
          openEditModal(newEvent);
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
          setScheduleForm(createScheduleFormDraft(dayIndex, activeRoomId, clickedTime, capacity));
          setIsScheduleModalOpen(true);
      }
  };

  const openEditModal = (evt: ScheduleEvent) => {
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

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">教务中心</h2>
          </div>
          <div className="flex items-center gap-4">
              <button 
                  onClick={handleGlobalCreate} 
                  className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-lg shadow-black/10"
              >
                  <i className="fa-solid fa-plus"></i> {getCreateLabel()}
              </button>
          </div>
      </div>

      {/* Sub Navigation */}
      <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
              {COURSE_SUB_TABS.map(tab => (
                  <button 
                      key={tab.id}
                      onClick={() => setCurrentSubTab(tab.id)}
                      className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${currentSubTab === tab.id ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'}`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          <div className="max-w-[1440px] mx-auto space-y-6">

              {/* --- TAB: SCHEDULE --- */}
              {currentSubTab === 'schedule' && (
                  <div className="space-y-6 animate-fadeIn">
                      <TodayOpsPanel
                          opsFilter={opsFilter}
                          setOpsFilter={setOpsFilter}
                          filteredOpsSchedule={filteredOpsSchedule}
                          opsSummary={opsSummary}
                          aiGuidance={aiGuidance}
                          onBookDemo={handleOpsBooking}
                          onSubstitute={handleSubstitute}
                          onCheckIn={handleOpsCheckIn}
                          onComplete={handleOpsComplete}
                      />
                      <ScheduleCalendar
                          libraryList={libraryList}
                          rooms={rooms}
                          activeRoomId={activeRoomId}
                          setActiveRoomId={setActiveRoomId}
                          weekDays={weekDays}
                          hoursArray={hoursArray}
                          hourHeight={hourHeight}
                          scheduleEvents={activeScheduleEvents}
                          draggedEventId={draggedEventId}
                          handleCourseDragStart={handleCourseDragStart}
                          handleEventDragStart={handleEventDragStart}
                          handleDragOver={handleDragOver}
                          handleDrop={handleDrop}
                          handleGridClick={handleGridClick}
                          openEditModal={openEditModal}
                          onRegenerateAi={() => showToast('Gemini AI 正在根据历史数据生成排课建议...', 'info')}
                      />
                  </div>
              )}

              {/* --- TAB: LIBRARY (Existing) --- */}
              {currentSubTab === 'library' && (
                  <CourseLibrary
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
              )}

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
      />

      {toast && (
          <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
              <div className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                  toast.tone === 'success'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-white text-gray-800 border-gray-100'
              }`}>
                  <i className={`fa-solid ${toast.tone === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`}></i>
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
