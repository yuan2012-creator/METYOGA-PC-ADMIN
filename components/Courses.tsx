import React, { useState } from 'react';
import {
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_COURSE_SESSIONS,
  MOCK_COURSES,
} from '../constants';
import type {
  Attendance,
  Booking,
  Course,
  CourseSession,
} from '../types';

// --- View Types ---
type CourseSubTab = 'schedule' | 'library' | 'ttc' | 'cards' | 'products';

type CourseLibraryItem = Course & {
  levelLabel: string;
  price: number;
  rating: number;
  suitable: string[];
  goals: string;
  notes: string;
  colorTag: string;
};

type ScheduleEvent = CourseSession & {
  name: string;
  teacher: string;
  dayIndex: number; // 0 = Mon, 6 = Sun
  startTime: string; // "10:00"
  duration: number; // minutes
  color: string;
};

type OpsScheduleItem = {
  id: string;
  time: string;
  name: string;
  type: string;
  teacher: string;
  room: string;
  enrolled: number;
  capacity: number;
  status: 'checked_in' | 'upcoming' | 'full';
  signed: number;
  state: 'finished' | 'ongoing' | 'upcoming';
  abnormal: boolean;
  abnormalReason: string;
};

type ScheduleFormState = {
  id: string;
  dayIndex: number;
  roomId: string;
  courseId: string;
  teacherName: string;
  startTime: string;
  duration: number;
  capacity: number;
};

interface CardItem {
    id: number;
    name: string;
    type: '期限' | '次卡' | '储值' | '私教';
    price: number;
    value: string; // e.g. "365天", "50次"
    sales: number;
}

interface Room {
    id: string;
    name: string;
    type: string;
    capacity: number;
    icon: string;
}

const COURSE_TYPE_LABELS: Record<Course['type'], string> = {
  group: '团课',
  small_group: '小班',
  private: '私教',
  workshop: '工作坊',
  ttc: '教培',
};

const COURSE_DIFFICULTY_LABELS: Record<NonNullable<Course['difficulty']>, string> = {
  beginner: 'L1 入门',
  intermediate: 'L2 进阶',
  advanced: 'L3 强力',
  all_levels: '全级别',
};

const COURSE_COLOR_TAGS: Record<Course['type'], string> = {
  group: 'bg-green-50 text-green-700 border-green-200',
  small_group: 'bg-gray-100 text-gray-700 border-gray-200',
  private: 'bg-slate-100 text-slate-700 border-slate-200',
  workshop: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  ttc: 'bg-stone-100 text-stone-700 border-stone-200',
};

const COURSE_ROOMS: Room[] = [
  { id: '101', name: '瑜伽大教室', type: '团课', capacity: 12, icon: 'fa-om' },
  { id: '102', name: '普拉提器械室', type: '小班', capacity: 6, icon: 'fa-dumbbell' },
  { id: '201', name: 'VIP 私教室', type: '私教', capacity: 1, icon: 'fa-user-secret' },
];

const COURSE_SUB_TABS: { id: CourseSubTab; label: string }[] = [
  { id: 'schedule', label: '课表与排课' },
  { id: 'library', label: '课程库' },
];

const TEACHER_NAMES: Record<string, string> = {
  '2': 'Mike',
  '4': 'Leo',
};

const COURSE_LIBRARY_OVERRIDES: Record<string, Partial<CourseLibraryItem>> = {
  'course-flow-yoga': {
    price: 180,
    rating: 4.9,
    suitable: ['零基础', '身体僵硬', '亚健康'],
    goals: '改善身体柔韧性，缓解肩颈腰背酸痛。',
    notes: '建议饭后1小时进行练习。',
    description: '以呼吸串联体式，建立稳定、流动、可持续的练习节奏。',
  },
  'course-pilates-reformer': {
    price: 480,
    rating: 5.0,
    suitable: ['康复需求', '核心强化', '体态矫正'],
    goals: '强化核心肌群，改善骨盆前倾/后倾。',
    notes: '上课必须穿着专业普拉提防滑袜。',
  },
  'course-private-core': {
    price: 680,
    rating: 4.9,
    suitable: ['一对一', '核心稳定', '精准训练'],
    goals: '围绕会员体态问题做个性化核心训练。',
    notes: '课前需完成身体评估。',
  },
  'course-ryt200': {
    price: 18800,
    rating: 4.8,
    suitable: ['教培学员', '进阶习练者'],
    goals: '完成RYT 200小时系统学习，建立授课能力。',
    notes: '需完成报名审核与合同签署。',
  },
};

const toCourseLibraryItem = (course: Course): CourseLibraryItem => {
  const override = COURSE_LIBRARY_OVERRIDES[course.id] ?? {};

  return {
    ...course,
    levelLabel: override.levelLabel ?? COURSE_DIFFICULTY_LABELS[course.difficulty ?? 'all_levels'],
    price: override.price ?? 0,
    rating: override.rating ?? 0,
    suitable: override.suitable ?? [course.category ?? COURSE_TYPE_LABELS[course.type]],
    goals: override.goals ?? '',
    notes: override.notes ?? '',
    colorTag: override.colorTag ?? COURSE_COLOR_TAGS[course.type],
    description: override.description ?? course.description ?? '',
  };
};

const getRoomName = (roomId?: string): string => (
  COURSE_ROOMS.find(room => room.id === roomId)?.name ?? '未分配教室'
);

const getTeacherName = (teacherId?: string): string => (
  teacherId ? TEACHER_NAMES[teacherId] ?? `老师 ${teacherId}` : '待定'
);

const getDayIndexFromIso = (iso: string): number => {
  const day = new Date(iso).getDay();
  return (day + 6) % 7;
};

const getTimeFromIso = (iso: string): string => iso.slice(11, 16);

const getDurationMinutes = (startAt: string, endAt: string): number => {
  const durationMs = new Date(endAt).getTime() - new Date(startAt).getTime();
  return Math.max(15, Math.round(durationMs / 60000));
};

const formatSessionTimeRange = (session: CourseSession): string => (
  `${getTimeFromIso(session.startAt)} - ${getTimeFromIso(session.endAt)}`
);

const getSessionTimes = (dayIndex: number, startTime: string, duration: number) => {
  const baseDate = new Date('2026-05-04T00:00:00+08:00');
  baseDate.setDate(baseDate.getDate() + dayIndex);

  const [hour, minute] = startTime.split(':').map(Number);
  const start = new Date(baseDate);
  start.setHours(hour, minute, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
};

const getCourseById = (courses: CourseLibraryItem[], courseId: string): CourseLibraryItem | undefined => (
  courses.find(course => course.id === courseId)
);

const getActiveBookings = (sessionId: string, bookings: Booking[]): Booking[] => (
  bookings.filter(booking => (
    booking.courseSessionId === sessionId
    && booking.status !== 'cancelled'
    && booking.status !== 'late_cancelled'
  ))
);

const getSessionAttendances = (sessionId: string, attendances: Attendance[]): Attendance[] => (
  attendances.filter(attendance => attendance.courseSessionId === sessionId)
);

const getAttendanceCount = (sessionId: string, attendances: Attendance[]): number => (
  getSessionAttendances(sessionId, attendances).filter(attendance => (
    attendance.status === 'checked_in'
    || attendance.status === 'attended'
    || attendance.status === 'consumed'
  )).length
);

const isEventFull = (event: Pick<CourseSession, 'bookedCount' | 'capacity'>): boolean => (
  (event.bookedCount ?? 0) >= event.capacity
);

const toScheduleEvent = (session: CourseSession, courses: CourseLibraryItem[]): ScheduleEvent => {
  const course = getCourseById(courses, session.courseId);

  return {
    ...session,
    name: session.title ?? course?.name ?? '自定义课程',
    teacher: getTeacherName(session.teacherId),
    dayIndex: getDayIndexFromIso(session.startAt),
    startTime: getTimeFromIso(session.startAt),
    duration: getDurationMinutes(session.startAt, session.endAt),
    color: course?.colorTag.replace('text-', 'border-').replace('700', '800') ?? 'bg-gray-100 text-gray-800 border-gray-200',
    bookedCount: session.bookedCount ?? getActiveBookings(session.id, MOCK_BOOKINGS).length,
  };
};

const toOpsScheduleItem = (
  session: CourseSession,
  courses: CourseLibraryItem[],
  bookings: Booking[],
  attendances: Attendance[]
): OpsScheduleItem => {
  const course = getCourseById(courses, session.courseId);
  const activeBookings = getActiveBookings(session.id, bookings);
  const signed = getAttendanceCount(session.id, attendances);
  const enrolled = session.bookedCount ?? activeBookings.length;
  const lateCancelledCount = bookings.filter(booking => (
    booking.courseSessionId === session.id && booking.status === 'late_cancelled'
  )).length;
  const state: OpsScheduleItem['state'] = session.status === 'completed'
    ? 'finished'
    : session.status === 'in_progress'
      ? 'ongoing'
      : 'upcoming';

  return {
    id: session.id,
    time: formatSessionTimeRange(session),
    name: session.title ?? course?.name ?? '自定义课程',
    type: course ? COURSE_TYPE_LABELS[course.type] : '课程',
    teacher: getTeacherName(session.teacherId),
    room: getRoomName(session.roomId),
    enrolled,
    capacity: session.capacity,
    status: signed >= enrolled && enrolled > 0 ? 'checked_in' : isEventFull(session) ? 'full' : 'upcoming',
    signed,
    state,
    abnormal: lateCancelledCount > 0,
    abnormalReason: lateCancelledCount > 0 ? `${lateCancelledCount} 个迟取消预约` : '',
  };
};

const INITIAL_LIBRARY_LIST = MOCK_COURSES.map(toCourseLibraryItem);
const INITIAL_SCHEDULE_EVENTS = MOCK_COURSE_SESSIONS.map(session => toScheduleEvent(session, INITIAL_LIBRARY_LIST));

const Courses: React.FC = () => {
  const [currentSubTab, setCurrentSubTab] = useState<CourseSubTab>('schedule');
  const [opsFilter, setOpsFilter] = useState<'all' | 'group' | 'private'>('all');
  
  // --- Library State (Courses) ---
  const [libraryList, setLibraryList] = useState<CourseLibraryItem[]>(INITIAL_LIBRARY_LIST);

  // --- Transitional commerce demo states ---
  // These belong to Mall later; kept here only because hidden legacy tabs still reference them.
  const [cards, setCards] = useState<CardItem[]>([
      { id: 1, name: '全馆通年卡 (Yearly)', type: '期限', price: 12800, value: '365天', sales: 45 },
      { id: 2, name: '50次常规大课卡', type: '次卡', price: 6800, value: '50次', sales: 120 },
      { id: 3, name: '私教常规20节', type: '私教', price: 9000, value: '20节', sales: 85 },
      { id: 4, name: '新客体验周卡', type: '期限', price: 199, value: '7天', sales: 300 },
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: 'Lulu 瑜伽背心', type: 'wear', stock: 24, price: 380, icon: 'fa-shirt' },
    { id: 2, name: '天然橡胶瑜伽垫', type: 'gear', stock: 5, price: 680, icon: 'fa-mattress-pillow' },
    { id: 3, name: '防滑铺巾', type: 'gear', stock: 15, price: 120, icon: 'fa-rug' },
    { id: 4, name: '普拉提防滑袜', type: 'wear', stock: 50, price: 58, icon: 'fa-socks' },
  ]);

  const [ttcList, setTtcList] = useState([
      { id: 1, name: 'RYT 200 全美瑜伽联盟认证', batch: '2024春季班', dates: '3.15 - 4.15', price: 18800, enrolled: 12, max: 16 },
      { id: 2, name: '孕产瑜伽修复工作坊', batch: '第5期', dates: '5.1 - 5.3', price: 3800, enrolled: 8, max: 20 },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<CourseLibraryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // --- Scheduling State ---
  const rooms = COURSE_ROOMS;
  const [activeRoomId, setActiveRoomId] = useState(rooms[0].id);
  
  // DRAG & DROP STATE
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE_EVENTS);
  const [draggedCourse, setDraggedCourse] = useState<CourseLibraryItem | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

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
  const todayOpsSchedule = MOCK_COURSE_SESSIONS.map(session => (
    toOpsScheduleItem(session, libraryList, MOCK_BOOKINGS, MOCK_ATTENDANCES)
  ));

  const filteredOpsSchedule = todayOpsSchedule.filter(cls => {
      if (opsFilter === 'group') return cls.type === '团课' || cls.type === '小班';
      if (opsFilter === 'private') return cls.type === '私教';
      return true;
  });

  const opsSummary = {
      totalCourses: todayOpsSchedule.length,
      smallClass: todayOpsSchedule.filter(c => c.type === '小班').length,
      groupClass: todayOpsSchedule.filter(c => c.type === '团课').length,
      privateClass: todayOpsSchedule.filter(c => c.type === '私教').length,
      totalEnrolled: todayOpsSchedule.reduce((sum, c) => sum + c.enrolled, 0),
      totalEmptySpots: todayOpsSchedule.reduce((sum, c) => sum + (c.capacity - c.enrolled), 0),
      totalConsumed: todayOpsSchedule.reduce((sum, c) => sum + c.signed, 0),
  };

  const abnormalCount = todayOpsSchedule.filter(c => c.abnormal).length;
  let aiGuidance = "";
  if (abnormalCount > 0) {
      aiGuidance = `发现 ${abnormalCount} 个课程异常（未签到等），请优先处理。`;
  } else if (opsSummary.totalEmptySpots > 0) {
      aiGuidance = `今日还有 ${opsSummary.totalEmptySpots} 个空位，建议提醒老师在社群或私聊邀约会员。`;
  } else if (opsSummary.totalCourses < 6) {
      aiGuidance = `今日排课较少，下午时段场地空闲，建议安排老师进行私教体验课或场馆内训。`;
  } else {
      aiGuidance = `今日课程安排饱满，运行状态良好，请继续保持。`;
  }

  // --- Actions ---
  
  const handleDuplicate = (course: CourseLibraryItem, e: React.MouseEvent) => {
      e.stopPropagation();
      const newCourse: CourseLibraryItem = { ...course, id: `course-${Date.now()}`, name: `${course.name} (复制)` };
      setLibraryList([newCourse, ...libraryList]);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('确定要删除该课程吗？此操作不可恢复。')) setLibraryList(libraryList.filter(c => c.id !== id));
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
      switch(currentSubTab) {
          case 'library':
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
              break;
          case 'schedule':
              alert('请从右侧课程库拖拽课程至日历，或点击日历空白处进行排课。');
              break;
          case 'cards':
              const cardName = prompt('请输入卡项名称 (如: 月卡):');
              if(cardName) setCards([...cards, { id: Date.now(), name: cardName, type: '期限', price: 0, value: '30天', sales: 0 }]);
              break;
          case 'products':
              const prodName = prompt('请输入商品名称:');
              if(prodName) setProducts([...products, { id: Date.now(), name: prodName, type: 'gear', stock: 0, price: 0, icon: 'fa-box' }]);
              break;
          case 'ttc':
              alert('已打开教培发布表单...');
              break;
      }
  };
  
  const getCreateLabel = () => {
    switch (currentSubTab) {
        case 'schedule': return '排课';
        case 'library': return '新建课程';
        case 'ttc': return '发布教培';
        case 'cards': return '新建卡项';
        case 'products': return '上架商品';
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
          const { startAt, endAt } = getSessionTimes(dayIndex, dropTime, draggedCourse.durationMinutes);
          const newEvent: ScheduleEvent = {
              id: `evt_${Date.now()}`,
              courseId: draggedCourse.id,
              name: draggedCourse.name,
              teacher: '待定',
              roomId: activeRoomId,
              dayIndex: dayIndex,
              startTime: dropTime,
              duration: draggedCourse.durationMinutes,
              color: draggedCourse.colorTag.replace('text-', 'border-').replace('100', '100').replace('700', '800'),
              status: 'draft',
              startAt,
              endAt,
              capacity,
              bookedCount: 0
          };
          setScheduleEvents([...scheduleEvents, newEvent]);
          openEditModal(newEvent);
      } else if (draggedEventId) {
          const updatedEvents = scheduleEvents.map(evt => {
              if (evt.id === draggedEventId) {
                  const { startAt, endAt } = getSessionTimes(dayIndex, dropTime, evt.duration);
                  return { ...evt, dayIndex: dayIndex, startTime: dropTime, roomId: activeRoomId, startAt, endAt };
              }
              return evt;
          });
          setScheduleEvents(updatedEvents);
      }
      setDraggedCourse(null);
      setDraggedEventId(null);
  };

  const handleGridClick = (e: React.MouseEvent, dayIndex: number) => {
      if (e.target === e.currentTarget) {
          const clickedTime = getClickedTime(e, e.currentTarget as HTMLDivElement);
          const capacity = rooms.find(r => r.id === activeRoomId)?.capacity || 10;
          const { startAt, endAt } = getSessionTimes(dayIndex, clickedTime, 60);
          const newEvent: ScheduleEvent = {
              id: `evt_${Date.now()}`,
              courseId: 'custom-course',
              name: '', teacher: '', roomId: activeRoomId, dayIndex: dayIndex, startTime: clickedTime, duration: 60,
              color: 'bg-gray-100 text-gray-800 border-gray-200', status: 'draft', startAt, endAt,
              capacity, bookedCount: 0
          };
          setScheduleForm({ id: newEvent.id, dayIndex: dayIndex, roomId: activeRoomId, courseId: '', teacherName: '', startTime: clickedTime, duration: 60, capacity: newEvent.capacity });
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
      const course = libraryList.find(c => c.id === scheduleForm.courseId);
      const existingIdx = scheduleEvents.findIndex(e => e.id === scheduleForm.id);
      const { startAt, endAt } = getSessionTimes(scheduleForm.dayIndex, scheduleForm.startTime, scheduleForm.duration);
      
      const newEventData: ScheduleEvent = {
          id: scheduleForm.id || `evt_${Date.now()}`,
          courseId: scheduleForm.courseId || 'custom-course',
          name: course ? course.name : '自定义课程',
          teacher: scheduleForm.teacherName || '待定',
          roomId: scheduleForm.roomId,
          dayIndex: scheduleForm.dayIndex,
          startTime: scheduleForm.startTime,
          duration: scheduleForm.duration,
          color: course ? course.colorTag.replace('text-', 'border-').replace('100', '100').replace('700', '800') : 'bg-gray-100 text-gray-800 border-gray-200',
          status: existingIdx >= 0 ? scheduleEvents[existingIdx].status : 'draft',
          startAt,
          endAt,
          bookedCount: existingIdx >= 0 ? scheduleEvents[existingIdx].bookedCount : 0,
          capacity: scheduleForm.capacity
      };

      if (existingIdx >= 0) {
          const updated = [...scheduleEvents];
          updated[existingIdx] = newEventData;
          setScheduleEvents(updated);
      } else {
          setScheduleEvents([...scheduleEvents, newEventData]);
      }
      setIsScheduleModalOpen(false);
  };

  const deleteEvent = (id: string) => {
      if(confirm('确定取消该排课？')) {
          setScheduleEvents(scheduleEvents.filter(e => e.id !== id));
          setIsScheduleModalOpen(false);
      }
  };

  const getEventStyle = (startTime: string, duration: number) => {
      const [h, m] = startTime.split(':').map(Number);
      const startMinutes = (h - startHour) * 60 + m;
      const top = (startMinutes / 60) * hourHeight;
      const height = (duration / 60) * hourHeight;
      return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">课程与产品中心</h2>
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
                      
                      {/* SECTION 1: TODAY'S OPERATIONS & LIVE STATUS */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center mb-6">
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                      <i className="fa-solid fa-calendar-day text-black"></i> 今日课程执行面板
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1">2026年05月05日 · 星期二</p>
                              </div>
                              <div className="flex gap-3">
                                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition text-gray-700">
                                      <i className="fa-solid fa-qrcode"></i> 扫码消课
                                  </button>
                                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition text-gray-700">
                                      <i className="fa-solid fa-clipboard-check"></i> 批量补签
                                  </button>
                              </div>
                          </div>

                          {/* Filter Toggle */}
                          <div className="flex gap-2 mb-4">
                              <button 
                                  onClick={() => setOpsFilter('all')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  全部课程
                              </button>
                              <button 
                                  onClick={() => setOpsFilter('group')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'group' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  团课/小班
                              </button>
                              <button 
                                  onClick={() => setOpsFilter('private')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'private' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  私教预约
                              </button>
                          </div>

                          {/* Course Timeline (Horizontal) */}
                          <div className="relative mt-8 pb-4 overflow-x-auto custom-scroll">
                              {/* Horizontal Line */}
                              <div className="absolute top-[6px] left-0 right-0 h-0.5 bg-gray-200 min-w-max"></div>
                              
                              <div className="flex gap-8 min-w-max px-2">
                                  {filteredOpsSchedule.map((cls, index) => {
                                      const emptySpots = cls.capacity - cls.enrolled;
                                      const isPast = cls.state === 'finished';
                                      const isOngoing = cls.state === 'ongoing';
                                      
                                      return (
                                      <div key={cls.id} className="relative w-72 flex-shrink-0 pt-6">
                                          {/* Timeline Node */}
                                          <div className={`absolute left-0 top-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isPast ? 'bg-gray-300' : isOngoing ? 'bg-green-500 ring-4 ring-green-100' : 'bg-black'}`}></div>
                                          
                                          <div className="mb-3 flex items-center gap-2">
                                              <span className={`text-lg font-bold font-mono ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>{cls.time.split(' - ')[0]}</span>
                                              <span className="text-sm text-gray-400 font-mono">- {cls.time.split(' - ')[1]}</span>
                                          </div>

                                          <div className={`border ${cls.abnormal ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-[#FAFAFA]'} rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition relative group h-full`}>
                                              <div className="flex justify-between items-start mb-3">
                                                  <div>
                                                      <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                          {cls.name}
                                                          <span className="text-[10px] font-normal bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{cls.type}</span>
                                                      </div>
                                                      <div className="text-xs text-gray-500 mt-1">{cls.room}</div>
                                                  </div>
                                                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                      isOngoing ? 'bg-green-100 text-green-700' : isPast ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-600'
                                                  }`}>
                                                      {isOngoing ? '进行中' : isPast ? '已结束' : '未开始'}
                                                  </div>
                                              </div>
                                              
                                              <div className="flex flex-col gap-2 mb-4">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                                          <i className="fa-solid fa-user text-gray-400"></i> {cls.teacher}
                                                      </div>
                                                      {cls.status === 'full' ? (
                                                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">满员</span>
                                                      ) : (
                                                          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 animate-pulse">
                                                              空位 {emptySpots} 人 - 需拉新
                                                          </span>
                                                      )}
                                                  </div>
                                                  {cls.abnormal && (
                                                      <div className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1.5">
                                                          <i className="fa-solid fa-triangle-exclamation"></i> 异常: {cls.abnormalReason}
                                                      </div>
                                                  )}
                                              </div>

                                              <div className="flex justify-between items-end border-t border-gray-200 pt-3 mt-auto">
                                                  <div className="text-xs">
                                                      <div className="text-gray-400">实到/预约</div>
                                                      <div className="font-bold text-lg font-mono text-gray-900">{cls.signed} <span className="text-gray-400 text-xs font-normal">/ {cls.enrolled}</span></div>
                                                  </div>
                                                  <div className="flex gap-2">
                                                      <button className="bg-white border border-gray-200 hover:border-black text-gray-600 hover:text-black text-xs px-3 py-1.5 rounded transition" onClick={() => alert('处理代课')}>代课</button>
                                                      <button className="bg-black text-white text-xs px-4 py-1.5 rounded hover:opacity-80 transition shadow-sm">签到</button>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      )})}
                                      
                                      {/* Add New Check-in Slot (Placeholder) */}
                                      <div className="relative w-32 flex-shrink-0 pt-6">
                                          <div className="absolute left-0 top-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-200"></div>
                                          <div className="h-full min-h-[120px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition">
                                              <i className="fa-solid fa-plus text-xl mb-2"></i>
                                              <span className="text-xs font-bold">临时加课</span>
                                          </div>
                                      </div>
                                  </div>
                          </div>

                          {/* 今日运营小结 & 智能指导 (Compact Bottom Bar) */}
                          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                      <i className="fa-solid fa-chart-pie text-gray-400"></i>
                                      <span>今日总课: <strong className="text-gray-900">{opsSummary.totalCourses}</strong> 节 <span className="text-xs text-gray-400">(团{opsSummary.groupClass}/小{opsSummary.smallClass}/私{opsSummary.privateClass})</span></span>
                                  </div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>上课人数: <strong className="text-gray-900">{opsSummary.totalEnrolled}</strong></div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>空位: <strong className="text-orange-500">{opsSummary.totalEmptySpots}</strong></div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>预计耗课: <strong className="text-gray-900">{opsSummary.totalEnrolled}</strong> 节</div>
                              </div>
                              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 flex-1 lg:max-w-md">
                                  <i className="fa-solid fa-wand-magic-sparkles text-black"></i>
                                  <span className="text-xs text-gray-700 font-medium leading-relaxed">{aiGuidance}</span>
                                  <button className="ml-auto text-xs bg-black text-white px-3 py-1.5 rounded hover:opacity-80 transition whitespace-nowrap shadow-sm">去处理</button>
                              </div>
                          </div>
                      </div>

                      {/* SECTION 2: SMART SCHEDULING GUIDANCE (Moved here for better visibility) */}
                      <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                  <i className="fa-solid fa-wand-magic-sparkles text-black"></i> 智能排课指导
                              </h3>
                              <div className="flex items-center gap-4">
                                  <button 
                                      onClick={() => alert('Gemini AI 正在根据历史数据生成排课建议...')}
                                      className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline"
                                  >
                                      <i className="fa-solid fa-rotate-right"></i> AI 重新生成
                                  </button>
                                  <button className="text-xs text-gray-500 hover:text-black transition">查看更多建议 <i className="fa-solid fa-arrow-right ml-1"></i></button>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Suggestion 1 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">空闲预警</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      <span className="font-bold text-gray-900">周二晚间</span> 普拉提教室空置率预测 <span className="text-red-500 font-bold">60%</span>。
                                  </p>
                                  <button className="mt-3 text-xs text-black bg-white border border-gray-200 hover:border-black px-3 py-1.5 rounded transition shadow-sm">一键排热门课</button>
                              </div>
                              {/* Suggestion 2 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">爆款推荐</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      <span className="font-bold text-gray-900">Sarah</span> 的哈他瑜伽上周满员，建议本周增加 1 节排期。
                                  </p>
                                  <button className="mt-3 text-xs text-black bg-white border border-gray-200 hover:border-black px-3 py-1.5 rounded transition shadow-sm">去排课</button>
                              </div>
                              {/* Suggestion 3 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">课程优化</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      [晨间唤醒] 连续3周取消率 &gt; 20%，建议调整时段或下架。
                                  </p>
                                  <button className="mt-3 text-xs text-gray-600 bg-white border border-gray-200 hover:text-black hover:border-black px-3 py-1.5 rounded transition shadow-sm">查看详情</button>
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-6 h-[720px] items-start">
                          
                          {/* SECTION 3: COURSE LIBRARY SIDEBAR */}
                          <div className="w-64 flex flex-col h-full sticky top-0">
                              {/* Course Library (Source for D&D) */}
                              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                          <i className="fa-solid fa-book-open text-gray-400"></i> 课程库 (拖拽排课)
                                      </h3>
                                      <input type="text" placeholder="搜索课程..." className="mt-3 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition" />
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scroll">
                                      {libraryList.map(course => (
                                          <div 
                                              key={course.id}
                                              draggable
                                              onDragStart={(e) => handleCourseDragStart(e, course)}
                                              className={`p-3 rounded-xl border border-gray-200 bg-white shadow-sm cursor-move hover:border-black hover:shadow-md transition group active:cursor-grabbing`}
                                          >
                                              <div className="flex justify-between items-start mb-1">
                                                  <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${course.colorTag}`}>{COURSE_TYPE_LABELS[course.type]}</div>
                                                  <span className="text-xs text-gray-400">{course.durationMinutes}min</span>
                                              </div>
                                              <div className="font-bold text-sm text-gray-900 mb-1">{course.name}</div>
                                              <div className="text-[10px] text-gray-500">难度: {course.levelLabel}</div>
                                              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400">
                                                  <i className="fa-solid fa-grip-vertical"></i> 拖拽至日历
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* SECTION 3: WEEKLY CALENDAR (Target for D&D) */}
                          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                              
                              {/* Calendar Toolbar */}
                              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
                                  <div className="flex items-center gap-4">
                                      <div className="flex bg-gray-100 p-1 rounded-lg">
                                          {rooms.map(room => (
                                              <button 
                                                  key={room.id}
                                                  onClick={() => setActiveRoomId(room.id)}
                                                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeRoomId === room.id ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'}`}
                                              >
                                                  <i className={`fa-solid ${room.icon} text-[10px]`}></i>
                                                  {room.name.split(' ')[0]}
                                              </button>
                                          ))}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500">
                                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                          容量: {rooms.find(r => r.id === activeRoomId)?.capacity}人
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                                          <button className="px-3 py-1 text-xs hover:bg-gray-50 text-gray-600"><i className="fa-solid fa-chevron-left"></i></button>
                                          <span className="px-3 py-1 text-xs font-bold border-x border-gray-100 flex items-center min-w-[100px] justify-center">05.04 - 05.10</span>
                                          <button className="px-3 py-1 text-xs hover:bg-gray-50 text-gray-600"><i className="fa-solid fa-chevron-right"></i></button>
                                      </div>
                                      <button className="bg-black text-white text-xs px-3 py-2 rounded-lg font-bold hover:opacity-80 transition shadow">
                                          <i className="fa-solid fa-check mr-1"></i> 发布课表
                                      </button>
                                  </div>
                              </div>

                              {/* Calendar Grid */}
                              <div className="flex-1 flex flex-col overflow-hidden">
                                  {/* Week Header */}
                                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 ml-12 pr-2 flex-shrink-0">
                                      {weekDays.map(day => (
                                          <div key={day} className="py-3 text-center text-xs font-bold text-gray-700 border-l border-gray-100">
                                              {day}
                                          </div>
                                      ))}
                                  </div>
                                  
                                  {/* Scrollable Body */}
                                  <div className="flex-1 overflow-y-auto custom-scroll relative bg-white">
                                      <div className="flex relative" style={{ height: `${hoursArray.length * hourHeight}px` }}>
                                          
                                          {/* Time Axis */}
                                          <div className="w-12 flex-shrink-0 bg-white border-r border-gray-100 z-10 sticky left-0">
                                              {hoursArray.map(hour => (
                                                  <div key={hour} className="text-[10px] text-gray-400 font-bold text-right pr-2 relative" style={{ height: `${hourHeight}px` }}>
                                                      <span className="relative -top-2">{hour}:00</span>
                                                  </div>
                                              ))}
                                          </div>

                                          {/* Columns */}
                                          <div className="flex-1 grid grid-cols-7 relative">
                                              {/* Horizontal Guides */}
                                              <div className="absolute inset-0 z-0 pointer-events-none">
                                                  {hoursArray.map((_, i) => (
                                                      <div key={i} className="border-b border-gray-100 w-full" style={{ height: `${hourHeight}px` }}></div>
                                                  ))}
                                              </div>

                                              {/* Day Columns */}
                                              {weekDays.map((_, dayIdx) => (
                                                  <div 
                                                      key={dayIdx} 
                                                      className="border-l border-gray-100 relative h-full group"
                                                      onDragOver={handleDragOver}
                                                      onDrop={(e) => handleDrop(e, dayIdx)}
                                                      onClick={(e) => handleGridClick(e, dayIdx)}
                                                  >
                                                      {/* Hover Effect */}
                                                      <div className="absolute inset-0 bg-green-50/30 opacity-0 group-hover:opacity-100 pointer-events-none transition"></div>

                                                      {/* Events */}
                                                      {scheduleEvents
                                                          .filter(evt => evt.dayIndex === dayIdx && evt.roomId === activeRoomId)
                                                          .map(evt => (
                                                              <div
                                                                  key={evt.id}
                                                                  draggable
                                                                  onDragStart={(e) => handleEventDragStart(e, evt)}
                                                                  onClick={(e) => { e.stopPropagation(); openEditModal(evt); }}
                                                                  className={`absolute left-1 right-1 rounded-lg px-2 py-1.5 text-xs border cursor-move shadow-sm hover:shadow-md transition-all z-10 flex flex-col justify-between overflow-hidden ${evt.color}`}
                                                                  style={{
                                                                      ...getEventStyle(evt.startTime, evt.duration),
                                                                      opacity: draggedEventId === evt.id ? 0.5 : 1
                                                                  }}
                                                              >
                                                                  <div>
                                                                      <div className="font-bold truncate">{evt.name}</div>
                                                                      <div className="opacity-80 truncate text-[10px]">{evt.startTime} - {evt.teacher}</div>
                                                                  </div>
                                                                  {isEventFull(evt) && (
                                                                      <div className="text-[9px] bg-red-500 text-white px-1 rounded w-fit self-end font-bold">FULL</div>
                                                                  )}
                                                              </div>
                                                          ))
                                                      }
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* --- TAB: LIBRARY (Existing) --- */}
              {currentSubTab === 'library' && (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                              <div className="flex gap-6 text-sm">
                                  <button className="font-bold text-black border-b-2 border-black pb-1">全部课程</button>
                                  <button className="text-gray-400 hover:text-black transition">小班团课</button>
                                  <button className="text-gray-400 hover:text-black transition">私教</button>
                              </div>
                              <div className="relative">
                                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                  <input type="text" placeholder="搜索课程..." className="pl-8 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs w-48 focus:bg-white focus:border-gray-300 transition outline-none" />
                              </div>
                          </div>
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                  <tr>
                                      <th className="p-4 pl-6 font-bold">课程名称</th>
                                      <th className="p-4 font-bold">类型</th>
                                      <th className="p-4 font-bold">难度 / 时长</th>
                                      <th className="p-4 font-bold">单节价格</th>
                                      <th className="p-4 font-bold">适用标签</th>
                                      <th className="p-4 font-bold text-right pr-6">操作</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {libraryList.map(course => (
                                      <tr key={course.id} onClick={() => handleOpenDetail(course)} className="group hover:bg-gray-50 transition cursor-pointer">
                                          <td className="p-4 pl-6 font-bold text-gray-900">
                                              <div className="flex items-center gap-2">
                                                  {course.name}
                                                  {course.rating >= 4.9 && <i className="fa-solid fa-crown text-yellow-400 text-[10px]"></i>}
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${course.colorTag}`}>
                                                  {COURSE_TYPE_LABELS[course.type]}
                                              </span>
                                          </td>
                                          <td className="p-4 text-gray-600">
                                              <span className="font-medium text-black">{course.levelLabel}</span> <span className="text-gray-300 mx-1">|</span> {course.durationMinutes}min
                                          </td>
                                          <td className="p-4 font-mono font-bold">¥{course.price}</td>
                                          <td className="p-4">
                                              <div className="flex gap-1 flex-wrap max-w-[150px]">
                                                  {course.suitable.slice(0, 2).map((tag, i) => (
                                                      <span key={i} className="text-[9px] border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 bg-white">{tag}</span>
                                                  ))}
                                                  {course.suitable.length > 2 && <span className="text-[9px] text-gray-400">+{course.suitable.length - 2}</span>}
                                              </div>
                                          </td>
                                          <td className="p-4 text-right pr-6" onClick={e => e.stopPropagation()}>
                                              <button 
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setEditMode(true);
                                                    setIsDetailModalOpen(true);
                                                }} 
                                                className="text-gray-400 hover:text-black mr-3 transition" title="编辑"
                                              >
                                                  <i className="fa-regular fa-pen-to-square"></i>
                                              </button>
                                              <button 
                                                onClick={(e) => handleDuplicate(course, e)} 
                                                className="text-gray-400 hover:text-blue-600 mr-3 transition" title="复制"
                                              >
                                                  <i className="fa-regular fa-copy"></i>
                                              </button>
                                              <button 
                                                onClick={(e) => handleDelete(course.id, e)} 
                                                className="text-gray-400 hover:text-red-500 transition" title="删除"
                                              >
                                                  <i className="fa-regular fa-trash-can"></i>
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* --- TAB: TTC (Existing) --- */}
              {currentSubTab === 'ttc' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                      {ttcList.map(ttc => (
                          <div key={ttc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full group cursor-pointer hover:shadow-md hover:border-gray-300 transition">
                              <div className="h-32 bg-gray-200 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition"></div>
                                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded shadow-sm text-gray-800">
                                      {ttc.name.split(' ')[0]}
                                  </span>
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                  <h3 className="font-bold text-lg mb-1 text-gray-900">{ttc.name}</h3>
                                  <p className="text-xs text-gray-500 mb-4">{ttc.batch} · {ttc.dates}</p>
                                  
                                  <div className="mb-4">
                                      <div className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-400">招生进度</span>
                                          <span className="font-bold">{ttc.enrolled} / {ttc.max}</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-black rounded-full" style={{width: `${(ttc.enrolled/ttc.max)*100}%`}}></div>
                                      </div>
                                  </div>

                                  <div className="mt-auto flex justify-between items-center border-t border-gray-50 pt-4">
                                      <span className="font-bold text-gray-900 font-mono">¥{ttc.price.toLocaleString()}</span>
                                      <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 transition">学员管理</button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* --- TAB: CARDS (Existing) --- */}
              {currentSubTab === 'cards' && (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-3 gap-6">
                          {cards.map(card => (
                              <div key={card.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition cursor-pointer relative group overflow-hidden">
                                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition">
                                      <i className="fa-solid fa-address-card text-6xl"></i>
                                  </div>
                                  <div className="relative z-10">
                                      <div className="flex justify-between items-start mb-4">
                                          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${card.type === '期限' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                              {card.type}
                                          </span>
                                          <button className="text-gray-300 hover:text-black transition"><i className="fa-solid fa-ellipsis"></i></button>
                                      </div>
                                      <h3 className="font-bold text-lg text-gray-900 mb-1">{card.name}</h3>
                                      <p className="text-sm text-gray-500 mb-6">包含权益: {card.value}</p>
                                      <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                          <div>
                                              <div className="text-[10px] text-gray-400">标准售价</div>
                                              <div className="font-bold text-lg font-mono">¥{card.price.toLocaleString()}</div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-[10px] text-gray-400">累计销量</div>
                                              <div className="font-bold text-sm">{card.sales}</div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* --- TAB: PRODUCTS (Existing) --- */}
              {currentSubTab === 'products' && (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center">
                          <div className="flex gap-4 text-sm font-medium text-gray-500">
                              <button className="text-black border-b-2 border-black pb-0.5">全部商品</button>
                              <button className="hover:text-black transition">瑜伽服</button>
                              <button className="hover:text-black transition">辅具</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {products.map(product => (
                              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition">
                                  <div className="h-48 bg-gray-50 relative flex items-center justify-center">
                                      <i className={`fa-solid ${product.icon} text-4xl text-gray-300`}></i>
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition"></div>
                                  </div>
                                  <div className="p-4">
                                      <h4 className="font-bold text-sm text-gray-900">{product.name}</h4>
                                      <p className="text-xs text-gray-400 mt-1">库存: {product.stock}</p>
                                      <div className="mt-3 flex justify-between items-end">
                                          <div>
                                              <div className="text-sm font-bold text-gray-900">¥{product.price}</div>
                                          </div>
                                          <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition">
                                              <i className="fa-solid fa-plus text-[10px]"></i>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* --- Schedule Edit Modal --- */}
      {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsScheduleModalOpen(false)}></div>
              <div className="bg-white w-[480px] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeInUp">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-900">排课详情</h3>
                      <button onClick={() => setIsScheduleModalOpen(false)}><i className="fa-solid fa-xmark text-gray-400"></i></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">选择课程</label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                            value={scheduleForm.courseId}
                            onChange={(e) => {
                                const cId = e.target.value;
                                const course = libraryList.find(c => c.id === cId);
                                setScheduleForm({...scheduleForm, courseId: cId, duration: course ? course.durationMinutes : 60});
                            }}
                          >
                              <option value="">自定义课程</option>
                              {libraryList.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} ({COURSE_TYPE_LABELS[c.type]})</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">授课老师</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" 
                            placeholder="输入老师姓名"
                            value={scheduleForm.teacherName}
                            onChange={(e) => setScheduleForm({...scheduleForm, teacherName: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">开始时间</label>
                              <input 
                                type="time"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                value={scheduleForm.startTime}
                                onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">时长 (分钟)</label>
                              <input 
                                type="number" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                value={scheduleForm.duration}
                                onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">席位容量</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                            value={scheduleForm.capacity}
                            onChange={(e) => setScheduleForm({...scheduleForm, capacity: parseInt(e.target.value)})}
                          />
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 flex gap-3">
                      {scheduleForm.id && (
                          <button onClick={() => deleteEvent(scheduleForm.id)} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition"><i className="fa-solid fa-trash-can"></i></button>
                      )}
                      <button onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">取消</button>
                      <button onClick={confirmSchedule} className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:opacity-80 transition shadow-lg">确认保存</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Detail/Edit Modal (For Library Courses) --- */}
      {isDetailModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="bg-white w-[900px] h-[85vh] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeInUp">
                  
                  {/* Modal Header */}
                  <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${selectedCourse.colorTag}`}>
                              <i className="fa-solid fa-layer-group"></i>
                          </div>
                          <div>
                              {editMode ? (
                                  <input 
                                    type="text" 
                                    value={selectedCourse.name} 
                                    onChange={e => setSelectedCourse({...selectedCourse, name: e.target.value})}
                                    className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-black outline-none bg-transparent"
                                  />
                              ) : (
                                  <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                              )}
                              <p className="text-xs text-gray-500 mt-1">课程 ID: #{selectedCourse.id}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {!editMode ? (
                              <button onClick={() => setEditMode(true)} className="bg-white border border-gray-200 text-black text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition">
                                  <i className="fa-regular fa-pen-to-square mr-1"></i> 编辑
                              </button>
                          ) : (
                              <button onClick={() => handleSaveCourse(selectedCourse)} className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg">
                                  保存修改
                              </button>
                          )}
                          <button onClick={() => setIsDetailModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                              <i className="fa-solid fa-xmark text-gray-500"></i>
                          </button>
                      </div>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-[#FBFBFD]">
                      <div className="grid grid-cols-12 gap-8">
                          
                          {/* Left Column: Basic Info */}
                          <div className="col-span-4 space-y-6">
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">基础参数</h3>
                                  <div className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 mb-1.5">课程类型</label>
                                          {editMode ? (
                                              <select 
                                                value={selectedCourse.type} 
                                                onChange={e => {
                                                    const nextType = e.target.value as Course['type'];
                                                    setSelectedCourse({...selectedCourse, type: nextType, colorTag: COURSE_COLOR_TAGS[nextType]});
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition"
                                              >
                                                  <option value="group">团课</option>
                                                  <option value="small_group">小班</option>
                                                  <option value="private">私教</option>
                                                  <option value="workshop">工作坊</option>
                                                  <option value="ttc">教培</option>
                                              </select>
                                          ) : (
                                              <div className="text-sm font-medium">{COURSE_TYPE_LABELS[selectedCourse.type]}</div>
                                          )}
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 mb-1.5">难度等级</label>
                                          {editMode ? (
                                              <input type="text" value={selectedCourse.levelLabel} onChange={e => setSelectedCourse({...selectedCourse, levelLabel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                          ) : (
                                              <div className="text-sm font-medium">{selectedCourse.levelLabel}</div>
                                          )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5">时长 (min)</label>
                                              {editMode ? (
                                                  <input type="number" value={selectedCourse.durationMinutes} onChange={e => setSelectedCourse({...selectedCourse, durationMinutes: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                              ) : (
                                                  <div className="text-sm font-medium">{selectedCourse.durationMinutes}</div>
                                              )}
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5">单价 (¥)</label>
                                              {editMode ? (
                                                  <input type="number" value={selectedCourse.price} onChange={e => setSelectedCourse({...selectedCourse, price: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                              ) : (
                                                  <div className="text-sm font-bold text-black">¥{selectedCourse.price}</div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">适用人群 / 基础</h3>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                      {selectedCourse.suitable.map((tag, idx) => (
                                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border border-gray-200 flex items-center gap-1">
                                              {tag}
                                              {editMode && (
                                                  <i 
                                                    className="fa-solid fa-xmark cursor-pointer hover:text-red-500 ml-1"
                                                    onClick={() => setSelectedCourse({...selectedCourse, suitable: selectedCourse.suitable.filter((_, i) => i !== idx)})}
                                                  ></i>
                                              )}
                                          </span>
                                      ))}
                                  </div>
                                  {editMode && (
                                      <div className="flex gap-2">
                                          <input 
                                            type="text" 
                                            placeholder="输入标签按回车..." 
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black transition"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if(val && !selectedCourse.suitable.includes(val)) {
                                                        setSelectedCourse({...selectedCourse, suitable: [...selectedCourse.suitable, val]});
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                          />
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Right Column: Detailed Content */}
                          <div className="col-span-8 space-y-6">
                              
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-align-left text-gray-400"></i> 课程简介
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={4} 
                                        value={selectedCourse.description ?? ''}
                                        onChange={e => setSelectedCourse({...selectedCourse, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="请输入课程的详细介绍，包括课程特色、流派渊源等..."
                                      ></textarea>
                                  ) : (
                                      <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description || '暂无简介'}</p>
                                  )}
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-bullseye text-red-400"></i> 练习目标
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={3} 
                                        value={selectedCourse.goals} 
                                        onChange={e => setSelectedCourse({...selectedCourse, goals: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="列出本课程的主要练习目标，如：改善体态、增强核心..."
                                      ></textarea>
                                  ) : (
                                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800">
                                          {selectedCourse.goals || '暂无目标设定'}
                                      </div>
                                  )}
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-triangle-exclamation text-orange-400"></i> 注意事项 / 禁忌
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={3} 
                                        value={selectedCourse.notes} 
                                        onChange={e => setSelectedCourse({...selectedCourse, notes: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="输入特殊人群禁忌、课前准备等..."
                                      ></textarea>
                                  ) : (
                                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800">
                                          {selectedCourse.notes || '暂无注意事项'}
                                      </div>
                                  )}
                              </div>

                          </div>
                      </div>
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
