export type WeekScheduleStatus =
  | 'draft'
  | 'scheduled'
  | 'openForBooking'
  | 'full'
  | 'lowAttendance'
  | 'waitlist'
  | 'completed'
  | 'cancelledMock'
  | 'teacherLeaveRisk'
  | 'conflictWarning';

export type WeekScheduleRiskType =
  | 'lowAttendance'
  | 'waitlistOpportunity'
  | 'teacherConflict'
  | 'roomConflict'
  | 'teacherLeave'
  | 'highDemand'
  | 'overLoad';

export interface WeekScheduleSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface WeekScheduleFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface WeekScheduleSessionCard {
  sessionId: string;
  detailKey: string;
  courseName: string;
  courseType: string;
  teacherId: string;
  teacherName: string;
  room: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  checkedInCount: number;
  pointCost: number;
  status: WeekScheduleStatus;
  statusLabel: string;
  riskTags: string[];
  attendanceRisk: boolean;
  teacherAvailability: string;
  conflictStatus: string;
  suggestedAction: string;
  riskTypes: WeekScheduleRiskType[];
}

export interface WeekScheduleDay {
  id: string;
  label: string;
  dateLabel: string;
  sessions: WeekScheduleSessionCard[];
}

export interface ScheduleConflictAlert {
  id: string;
  riskType: WeekScheduleRiskType;
  riskTypeLabel: string;
  timeLabel: string;
  targetLabel: string;
  suggestedAction: string;
  relatedSessionId?: string;
}

export interface AvailableSlotItem {
  id: string;
  timeLabel: string;
  suggestedCourseType: string;
  availableRoom: string;
  leadNote: string;
  recommendedTeacher: string;
}

export interface AvailableTeacherItem {
  id: string;
  name: string;
  statusLabel: string;
  teachableCourses: string;
  availabilityNote: string;
  loadNote: string;
  suggestedAction: string;
  isWarning?: boolean;
}

export interface NewScheduleDraft {
  store: string;
  room: string;
  courseType: string;
  courseName: string;
  pointCost: number;
  capacity: number;
  teacher: string;
  teachableCourses: string;
  teacherLoad: string;
  teacherAvailability: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  teacherConflict: string;
  roomConflict: string;
  openBookingTime: string;
  cancelRule: string;
  waitlistRule: string;
  minStudents: number;
  maxStudents: number;
}

export interface WeekScheduleSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    newScheduleDisclaimer: string;
    submitToast: string;
    saveDraftToast: string;
  };
  summaryItems: WeekScheduleSummaryItem[];
  periodTabs: Array<{ id: string; label: string; value: string }>;
  filterOptions: WeekScheduleFilterOption[];
  conflictAlerts: ScheduleConflictAlert[];
  days: WeekScheduleDay[];
  availableSlots: AvailableSlotItem[];
  availableTeachers: AvailableTeacherItem[];
  newScheduleDraft: NewScheduleDraft;
  batchPlaceholder: string;
}

const STATUS_LABELS: Record<WeekScheduleStatus, string> = {
  draft: '草稿',
  scheduled: '已排',
  openForBooking: '开放预约',
  full: '已满员',
  lowAttendance: '低满班',
  waitlist: '候补中',
  completed: '已完成',
  cancelledMock: '已取消 mock',
  teacherLeaveRisk: '老师请假风险',
  conflictWarning: '冲突预警',
};

const RISK_LABELS: Record<WeekScheduleRiskType, string> = {
  lowAttendance: '低满班',
  waitlistOpportunity: '候补可补排',
  teacherConflict: '老师冲突',
  roomConflict: '教室冲突',
  teacherLeave: '老师请假',
  highDemand: '高需求',
  overLoad: '负载偏高',
};

type RawSession = Omit<WeekScheduleSessionCard, 'statusLabel'>;

function card(raw: RawSession): WeekScheduleSessionCard {
  return { ...raw, statusLabel: STATUS_LABELS[raw.status] };
}

function buildDay(
  id: string,
  label: string,
  dateLabel: string,
  sessions: RawSession[],
): WeekScheduleDay {
  return { id, label, dateLabel, sessions: sessions.map(card) };
}

const RAW_DAYS: WeekScheduleDay[] = [
  buildDay('day-mon', '周一', '6/22', [
    { sessionId: 'cs-mon-0930', detailKey: 'cs-mon-0930', courseName: '晨间流瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 18, bookedCount: 14, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'openForBooking', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '维持开放预约', riskTypes: [] },
    { sessionId: 'cs-mon-1030', detailKey: 'cs-mon-1030', courseName: '基础流瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '10:30', endTime: '11:30', durationMinutes: 60, capacity: 16, bookedCount: 10, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-mon-1200', detailKey: 'cs-mon-1200', courseName: '基础瑜伽小班', courseType: '瑜伽小班', teacherId: 't-lily', teacherName: 'Lily', room: 'B 教室', startTime: '12:00', endTime: '13:00', durationMinutes: 60, capacity: 8, bookedCount: 3, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'lowAttendance', riskTags: ['低满班'], attendanceRisk: true, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '复核时间或课程主题', riskTypes: ['lowAttendance'] },
    { sessionId: 'cs-mon-1400', detailKey: 'cs-mon-1400', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 6, bookedCount: 4, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-mon-1600', detailKey: 'cs-mon-1600', courseName: '私教', courseType: '私教', teacherId: 't-leo', teacherName: 'Leo', room: '私教区', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 1, bookedCount: 1, waitlistCount: 0, checkedInCount: 0, pointCost: 8, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '待确认预约', riskTypes: [] },
    { sessionId: 'cs-mon-1830', detailKey: 'cs-mon-1830', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 16, bookedCount: 12, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'openForBooking', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '维持开放预约', riskTypes: [] },
  ]),
  buildDay('day-tue', '周二', '6/23', [
    { sessionId: 'cs-tue-0930', detailKey: 'cs-tue-0930', courseName: '晨间修复瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 11, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-tue-1100', detailKey: 'cs-tue-1100', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 16, bookedCount: 8, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-tue-1430', detailKey: 'cs-tue-1430', courseName: '器械普拉提', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '14:30', endTime: '15:30', durationMinutes: 60, capacity: 6, bookedCount: 5, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '待签到核对', riskTypes: [] },
    { sessionId: 'cs-tue-1830', detailKey: 'cs-tue-1830', courseName: '基础瑜伽', courseType: '团课', teacherId: 't-lily', teacherName: 'Lily', room: 'B 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 6, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'lowAttendance', riskTags: ['低满班'], attendanceRisk: true, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '考虑调整时段或主题', riskTypes: ['lowAttendance'] },
    { sessionId: 'cs-tue-1930', detailKey: 'cs-tue-1930', courseName: '内观流', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 18, bookedCount: 12, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '请假中', conflictStatus: '需人工确认', suggestedAction: '确认代课安排', riskTypes: ['teacherLeave'] },
  ]),
  buildDay('day-wed', '周三', '6/24', [
    { sessionId: 'cs-wed-0930', detailKey: 'cs-wed-0930', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 9, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-wed-1100', detailKey: 'cs-wed-1100', courseName: '基础小班', courseType: '瑜伽小班', teacherId: 't-lily', teacherName: 'Lily', room: 'B 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 8, bookedCount: 2, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'lowAttendance', riskTags: ['低满班', '连续低满班'], attendanceRisk: true, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '建议调整时间或课程主题', riskTypes: ['lowAttendance'] },
    { sessionId: 'cs-wed-1200', detailKey: 'cs-wed-1200', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '12:00', endTime: '13:00', durationMinutes: 60, capacity: 6, bookedCount: 3, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'lowAttendance', riskTags: ['低满班'], attendanceRisk: true, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '匹配会员补员', riskTypes: ['lowAttendance'] },
    { sessionId: 'cs-wed-1830', detailKey: 'cs-wed-1830', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 15, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '请假中', conflictStatus: '冲突预警', suggestedAction: '确认代课老师', riskTypes: ['teacherLeave', 'teacherConflict'] },
    { sessionId: 'cs-wed-1930', detailKey: 'cs-wed-1930', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 6, bookedCount: 2, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'teacherLeaveRisk', riskTags: ['老师请假风险', '低满班'], attendanceRisk: true, teacherAvailability: '需代课', conflictStatus: '需人工确认', suggestedAction: '店长确认代课并补员', riskTypes: ['teacherLeave', 'lowAttendance'] },
    { sessionId: 'cs-wed-2030', detailKey: 'cs-wed-2030', courseName: '晚间基础瑜伽', courseType: '团课', teacherId: 't-lily', teacherName: 'Lily', room: 'B 教室', startTime: '20:30', endTime: '21:30', durationMinutes: 60, capacity: 16, bookedCount: 5, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '可补排同类课程', riskTypes: ['highDemand'] },
  ]),
  buildDay('day-thu', '周四', '6/25', [
    { sessionId: 'cs-thu-1000', detailKey: 'cs-thu-1000', courseName: '私教', courseType: '私教', teacherId: 't-leo', teacherName: 'Leo', room: '私教区', startTime: '10:00', endTime: '11:00', durationMinutes: 60, capacity: 1, bookedCount: 1, waitlistCount: 0, checkedInCount: 0, pointCost: 8, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '待确认预约', riskTypes: [] },
    { sessionId: 'cs-thu-1200', detailKey: 'cs-thu-1200', courseName: '瑜伽教培', courseType: '教培 / 内训', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '12:00', endTime: '14:00', durationMinutes: 120, capacity: 12, bookedCount: 10, waitlistCount: 0, checkedInCount: 0, pointCost: 0, status: 'scheduled', riskTags: ['内训'], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '教培场次，不对外开放', riskTypes: [] },
    { sessionId: 'cs-thu-1400', detailKey: 'cs-thu-1400', courseName: '核心普拉提', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 6, bookedCount: 5, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-thu-1830', detailKey: 'cs-thu-1830', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 16, waitlistCount: 2, checkedInCount: 0, pointCost: 1, status: 'waitlist', riskTags: ['候补'], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '评估补排同类课程', riskTypes: ['waitlistOpportunity'] },
    { sessionId: 'cs-thu-1930', detailKey: 'cs-thu-1930', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 16, bookedCount: 11, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
  ]),
  buildDay('day-fri', '周五', '6/26', [
    { sessionId: 'cs-fri-0930', detailKey: 'cs-fri-0930', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 12, waitlistCount: 0, checkedInCount: 12, pointCost: 1, status: 'completed', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '已完成 mock', riskTypes: [] },
    { sessionId: 'cs-fri-1100', detailKey: 'cs-fri-1100', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 6, bookedCount: 5, waitlistCount: 0, checkedInCount: 3, pointCost: 2, status: 'openForBooking', riskTags: [], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '待签到核对', riskTypes: [] },
    { sessionId: 'cs-fri-1400', detailKey: 'cs-fri-1400', courseName: '私教', courseType: '私教', teacherId: 't-leo', teacherName: 'Leo', room: '私教区', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 1, bookedCount: 1, waitlistCount: 0, checkedInCount: 0, pointCost: 8, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '待确认预约', riskTypes: [] },
    { sessionId: 'cs-fri-1830', detailKey: 'cs-fri-1830', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 18, waitlistCount: 4, checkedInCount: 0, pointCost: 1, status: 'full', riskTags: ['满员', '候补'], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '评估加开同类课程', riskTypes: ['waitlistOpportunity', 'highDemand'] },
    { sessionId: 'cs-fri-1930', detailKey: 'cs-fri-1930', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 6, bookedCount: 2, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'lowAttendance', riskTags: ['低满班', 'P0'], attendanceRisk: true, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '匹配会员补员', riskTypes: ['lowAttendance', 'highDemand'] },
    { sessionId: 'cs-fri-2030', detailKey: 'cs-fri-2030', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '20:30', endTime: '21:30', durationMinutes: 60, capacity: 16, bookedCount: 9, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
  ]),
  buildDay('day-sat', '周六', '6/27', [
    { sessionId: 'cs-sat-0930', detailKey: 'cs-sat-0930', courseName: '周末流瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 18, bookedCount: 15, waitlistCount: 3, checkedInCount: 0, pointCost: 1, status: 'waitlist', riskTags: ['候补', '高需求'], attendanceRisk: false, teacherAvailability: '可补排', conflictStatus: '通过', suggestedAction: '建议补排同类型课程', riskTypes: ['waitlistOpportunity', 'highDemand'] },
    { sessionId: 'cs-sat-1000', detailKey: 'cs-sat-1000', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', teacherName: 'Mia', room: '普拉提教室', startTime: '10:00', endTime: '11:00', durationMinutes: 60, capacity: 6, bookedCount: 6, waitlistCount: 5, checkedInCount: 0, pointCost: 2, status: 'full', riskTags: ['满员', '候补 5 人'], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '优先补排周六上午普拉提', riskTypes: ['waitlistOpportunity', 'highDemand'] },
    { sessionId: 'cs-sat-1030', detailKey: 'cs-sat-1030', courseName: '基础普拉提', courseType: '普拉提小班', teacherId: 't-anna', teacherName: 'Anna', room: '普拉提教室', startTime: '10:30', endTime: '11:30', durationMinutes: 60, capacity: 6, bookedCount: 4, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可补排', conflictStatus: '通过', suggestedAction: '可承接候补会员', riskTypes: ['highDemand'] },
    { sessionId: 'cs-sat-1430', detailKey: 'cs-sat-1430', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '14:30', endTime: '15:30', durationMinutes: 60, capacity: 18, bookedCount: 14, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-sat-1600', detailKey: 'cs-sat-1600', courseName: '私教体验', courseType: '私教', teacherId: 't-leo', teacherName: 'Leo', room: '私教区', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 1, bookedCount: 0, waitlistCount: 0, checkedInCount: 0, pointCost: 8, status: 'openForBooking', riskTags: ['可开放'], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '可补排私教体验时段', riskTypes: ['highDemand'] },
    { sessionId: 'cs-sat-1930', detailKey: 'cs-sat-1930', courseName: '内观流', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 18, bookedCount: 10, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
  ]),
  buildDay('day-sun', '周日', '6/28', [
    { sessionId: 'cs-sun-0900', detailKey: 'cs-sun-0900', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '09:00', endTime: '10:00', durationMinutes: 60, capacity: 16, bookedCount: 8, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-sun-1100', detailKey: 'cs-sun-1100', courseName: '周末小班', courseType: '瑜伽小班', teacherId: 't-mia', teacherName: 'Mia', room: 'B 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 6, bookedCount: 4, waitlistCount: 0, checkedInCount: 0, pointCost: 2, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '负载偏高', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
    { sessionId: 'cs-sun-1400', detailKey: 'cs-sun-1400', courseName: '基础瑜伽', courseType: '团课', teacherId: 't-lily', teacherName: 'Lily', room: 'A 教室', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 16, bookedCount: 5, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'lowAttendance', riskTags: ['低满班'], attendanceRisk: true, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '复核课程主题匹配度', riskTypes: ['lowAttendance'] },
    { sessionId: 'cs-sun-1600', detailKey: 'cs-sun-1600', courseName: '修复瑜伽', courseType: '团课', teacherId: 't-anna', teacherName: 'Anna', room: 'A 教室', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 16, bookedCount: 7, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '可开放私教体验引流', riskTypes: ['highDemand'] },
    { sessionId: 'cs-sun-1830', detailKey: 'cs-sun-1830', courseName: '晚间流瑜伽', courseType: '团课', teacherId: 't-nora', teacherName: 'Nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 13, waitlistCount: 0, checkedInCount: 0, pointCost: 1, status: 'scheduled', riskTags: [], attendanceRisk: false, teacherAvailability: '可排', conflictStatus: '通过', suggestedAction: '正常开放名单', riskTypes: [] },
  ]),
];

export function buildWeekScheduleSnapshot(): WeekScheduleSnapshot {
  return {
    meta: {
      title: '完整周排课',
      subtitle: '查看本周完整课程分布、低满班风险、老师冲突和补排机会，并发起新增排课 mock',
      breadcrumbParent: '课程与排课',
      breadcrumbCurrent: '完整周排课',
      scopeLabel: '滨江馆 · 本周 · 教学负责人视角',
      description:
        '用于查看完整周排课、识别低满班与老师冲突、发现补排机会，并发起新增排课 mock 流程。',
      newScheduleDisclaimer: '当前为 mock 流程，提交不会真实发布课程，也不会通知会员。',
      submitToast: '排课已提交审核（待建设）',
      saveDraftToast: '保存草稿（待建设）',
    },
    summaryItems: [
      { id: 'sum-total', label: '本周课程', value: '42 节' },
      { id: 'sum-low', label: '低满班课程', value: '6 节', isWarning: true },
      { id: 'sum-full', label: '满员课程', value: '8 节' },
      { id: 'sum-wait', label: '候补课程', value: '5 节' },
      { id: 'sum-conflict', label: '老师冲突', value: '2 条', isWarning: true },
      { id: 'sum-slot', label: '可补排时段', value: '7 个' },
      { id: 'sum-teacher', label: '可补排老师', value: '4 人' },
    ],
    periodTabs: [
      { id: 'period-prev', label: '上周', value: 'prev' },
      { id: 'period-current', label: '本周', value: 'current' },
      { id: 'period-next', label: '下周', value: 'next' },
    ],
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'store-bj', group: 'store', label: '滨江馆', value: 'binjiang' },
      { id: 'type-all', group: 'type', label: '全部类型', value: 'all' },
      { id: 'type-pilates', group: 'type', label: '普拉提小班', value: '普拉提小班' },
      { id: 'type-yoga', group: 'type', label: '瑜伽小班', value: '瑜伽小班' },
      { id: 'type-group', group: 'type', label: '团课', value: '团课' },
      { id: 'type-private', group: 'type', label: '私教', value: '私教' },
      { id: 'type-train', group: 'type', label: '教培 / 内训', value: '教培 / 内训' },
      { id: 'teacher-all', group: 'teacher', label: '全部老师', value: 'all' },
      { id: 'teacher-anna', group: 'teacher', label: 'Anna', value: 'Anna' },
      { id: 'teacher-mia', group: 'teacher', label: 'Mia', value: 'Mia' },
      { id: 'teacher-nora', group: 'teacher', label: 'Nora', value: 'Nora' },
      { id: 'teacher-lily', group: 'teacher', label: 'Lily', value: 'Lily' },
      { id: 'teacher-leo', group: 'teacher', label: 'Leo', value: 'Leo' },
      { id: 'status-all', group: 'status', label: '全部状态', value: 'all' },
      { id: 'status-low', group: 'status', label: '低满班', value: 'lowAttendance' },
      { id: 'status-full', group: 'status', label: '已满员', value: 'full' },
      { id: 'status-wait', group: 'status', label: '候补中', value: 'waitlist' },
      { id: 'status-risk', group: 'status', label: '老师请假风险', value: 'teacherLeaveRisk' },
      { id: 'risk-all', group: 'risk', label: '全部风险', value: 'all' },
      { id: 'risk-low', group: 'risk', label: '低满班', value: 'lowAttendance' },
      { id: 'risk-wait', group: 'risk', label: '候补机会', value: 'waitlistOpportunity' },
      { id: 'risk-teacher', group: 'risk', label: '老师冲突', value: 'teacherConflict' },
      { id: 'risk-leave', group: 'risk', label: '老师请假', value: 'teacherLeave' },
      { id: 'room-all', group: 'room', label: '全部教室', value: 'all' },
      { id: 'room-a', group: 'room', label: 'A 教室', value: 'A 教室' },
      { id: 'room-b', group: 'room', label: 'B 教室', value: 'B 教室' },
      { id: 'room-pilates', group: 'room', label: '普拉提教室', value: '普拉提教室' },
    ],
    conflictAlerts: [
      {
        id: 'alert-1',
        riskType: 'teacherLeave',
        riskTypeLabel: RISK_LABELS.teacherLeave,
        timeLabel: '周三 19:30',
        targetLabel: '普拉提小班 · Mia',
        suggestedAction: '老师请假风险，需要确认代课',
        relatedSessionId: 'cs-wed-1930',
      },
      {
        id: 'alert-2',
        riskType: 'waitlistOpportunity',
        riskTypeLabel: RISK_LABELS.waitlistOpportunity,
        timeLabel: '周六 10:00',
        targetLabel: '普拉提小班 · 候补 5 人',
        suggestedAction: '建议补排同类型课程',
        relatedSessionId: 'cs-sat-1000',
      },
      {
        id: 'alert-3',
        riskType: 'lowAttendance',
        riskTypeLabel: RISK_LABELS.lowAttendance,
        timeLabel: '周三 11:00',
        targetLabel: '基础小班 · 连续 2 周低满班',
        suggestedAction: '建议调整时间或课程主题',
        relatedSessionId: 'cs-wed-1100',
      },
      {
        id: 'alert-4',
        riskType: 'overLoad',
        riskTypeLabel: RISK_LABELS.overLoad,
        timeLabel: '本周晚间',
        targetLabel: 'Mia 晚间负载偏高',
        suggestedAction: '不建议继续追加晚间课',
      },
    ],
    days: RAW_DAYS,
    availableSlots: [
      { id: 'slot-1', timeLabel: '周三 20:30', suggestedCourseType: '普拉提小班', availableRoom: '普拉提教室', leadNote: '高需求晚间时段', recommendedTeacher: 'Anna' },
      { id: 'slot-2', timeLabel: '周六 10:30', suggestedCourseType: '普拉提小班', availableRoom: '普拉提教室', leadNote: '候补会员 5 人', recommendedTeacher: 'Anna' },
      { id: 'slot-3', timeLabel: '周五 18:30', suggestedCourseType: '基础瑜伽', availableRoom: 'B 教室', leadNote: '晚间基础课可补排', recommendedTeacher: 'Lily' },
      { id: 'slot-4', timeLabel: '周日 16:00', suggestedCourseType: '私教体验', availableRoom: '私教区', leadNote: '低频会员线索 3 人', recommendedTeacher: 'Leo' },
    ],
    availableTeachers: [
      { id: 'at-1', name: 'Anna', statusLabel: '可补排', teachableCourses: '瑜伽小班 / 团课', availabilityNote: '周末上午有空档', loadNote: '负载正常', suggestedAction: '适合承接周末补排' },
      { id: 'at-2', name: 'Lily', statusLabel: '可代课', teachableCourses: '基础瑜伽 / 团课', availabilityNote: '工作日傍晚可排', loadNote: '负载正常', suggestedAction: '适合承接调整课程' },
      { id: 'at-3', name: 'Nora', statusLabel: '请假中', teachableCourses: '流瑜伽 / 内观流', availabilityNote: '周三晚间需代课', loadNote: '本周请假', suggestedAction: '安排代课老师', isWarning: true },
      { id: 'at-4', name: 'Mia', statusLabel: '负载偏高', teachableCourses: '普拉提 / 私教', availabilityNote: '晚间课程集中', loadNote: '不建议继续加晚间课', suggestedAction: '避免继续加晚间课', isWarning: true },
    ],
    newScheduleDraft: {
      store: '滨江馆',
      room: '普拉提教室',
      courseType: '普拉提小班',
      courseName: '基础普拉提',
      pointCost: 2,
      capacity: 6,
      teacher: 'Anna',
      teachableCourses: '普拉提小班 / 瑜伽小班',
      teacherLoad: '负载正常',
      teacherAvailability: '可补排',
      date: '2026-06-28',
      startTime: '10:30',
      endTime: '11:30',
      duration: '60 分钟',
      teacherConflict: '通过',
      roomConflict: '通过',
      openBookingTime: '排课审核通过后 2 小时',
      cancelRule: '开课前 4 小时可免费取消',
      waitlistRule: '满员后开放候补，按顺序通知',
      minStudents: 2,
      maxStudents: 6,
    },
    batchPlaceholder: '批量操作待建设',
  };
}

export function getWeekScheduleRiskLabel(risk: WeekScheduleRiskType): string {
  return RISK_LABELS[risk];
}

export function getWeekScheduleStatusClass(status: WeekScheduleStatus): string {
  switch (status) {
    case 'lowAttendance':
    case 'teacherLeaveRisk':
    case 'conflictWarning':
      return 'met-week-schedule__status--warning';
    case 'full':
    case 'waitlist':
      return 'met-week-schedule__status--busy';
    case 'completed':
    case 'cancelledMock':
      return 'met-week-schedule__status--muted';
    default:
      return '';
  }
}

export function sortWeekSessions(sessions: WeekScheduleSessionCard[]): WeekScheduleSessionCard[] {
  const priority: Record<WeekScheduleStatus, number> = {
    conflictWarning: 0,
    teacherLeaveRisk: 1,
    lowAttendance: 2,
    waitlist: 3,
    full: 4,
    openForBooking: 5,
    scheduled: 6,
    draft: 7,
    completed: 8,
    cancelledMock: 9,
  };
  return [...sessions].sort((a, b) => {
    const p = priority[a.status] - priority[b.status];
    if (p !== 0) return p;
    return a.startTime.localeCompare(b.startTime);
  });
}
