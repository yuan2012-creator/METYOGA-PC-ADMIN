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
import CourseLibrary from './courses/CourseLibrary';
import ScheduleCalendar from './courses/ScheduleCalendar';
import ScheduleForm from './courses/ScheduleForm';
import TodayOpsPanel from './courses/TodayOpsPanel';

// --- View Types ---
type CourseSubTab = 'schedule' | 'library' | 'ttc' | 'cards' | 'products';

export type CourseLibraryItem = Course & {
  levelLabel: string;
  price: number;
  rating: number;
  suitable: string[];
  goals: string;
  notes: string;
  colorTag: string;
};

export type ScheduleEvent = CourseSession & {
  name: string;
  teacher: string;
  dayIndex: number; // 0 = Mon, 6 = Sun
  startTime: string; // "10:00"
  duration: number; // minutes
  color: string;
};

export type OpsScheduleItem = {
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

export type ScheduleFormState = {
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

export interface Room {
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
                      <TodayOpsPanel
                          opsFilter={opsFilter}
                          setOpsFilter={setOpsFilter}
                          filteredOpsSchedule={filteredOpsSchedule}
                          opsSummary={opsSummary}
                          aiGuidance={aiGuidance}
                      />
                      <ScheduleCalendar
                          libraryList={libraryList}
                          rooms={rooms}
                          activeRoomId={activeRoomId}
                          setActiveRoomId={setActiveRoomId}
                          weekDays={weekDays}
                          hoursArray={hoursArray}
                          hourHeight={hourHeight}
                          scheduleEvents={scheduleEvents}
                          draggedEventId={draggedEventId}
                          courseTypeLabels={COURSE_TYPE_LABELS}
                          handleCourseDragStart={handleCourseDragStart}
                          handleEventDragStart={handleEventDragStart}
                          handleDragOver={handleDragOver}
                          handleDrop={handleDrop}
                          handleGridClick={handleGridClick}
                          openEditModal={openEditModal}
                          getEventStyle={getEventStyle}
                          isEventFull={isEventFull}
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
                      courseTypeLabels={COURSE_TYPE_LABELS}
                      courseColorTags={COURSE_COLOR_TAGS}
                  />
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

      <ScheduleForm
        isOpen={isScheduleModalOpen}
        setIsOpen={setIsScheduleModalOpen}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        libraryList={libraryList}
        confirmSchedule={confirmSchedule}
        deleteEvent={deleteEvent}
        courseTypeLabels={COURSE_TYPE_LABELS}
      />

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
