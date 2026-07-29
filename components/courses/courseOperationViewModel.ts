/** 课程运营页局部 demo 数据（不接全局 mock / 真实接口） */

export type CourseSessionStatus =
  | 'draft'
  | 'published'
  | 'bookable'
  | 'booking_closed'
  | 'full'
  | 'ongoing'
  | 'ended'
  | 'pending_complete'
  | 'completed'
  | 'canceled'
  | 'rescheduled'
  | 'substituting'
  | 'exception';

export const COURSE_STATUS_LABEL: Record<CourseSessionStatus, string> = {
  draft: '草稿',
  published: '已发布',
  bookable: '可预约',
  booking_closed: '预约截止',
  full: '已满员',
  ongoing: '进行中',
  ended: '已结束',
  pending_complete: '待完课',
  completed: '已完课',
  canceled: '已取消',
  rescheduled: '已调课',
  substituting: '代课中',
  exception: '异常待处理',
};

export type CourseTypeTag = '团课' | '小班' | '私教' | '教培';

export interface CourseMetricItem {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  hint?: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface CourseTemplateItem {
  id: string;
  name: string;
  type: CourseTypeTag;
  durationMin: number;
  defaultCapacity: number;
  defaultPoints: number;
  stores: string;
  teacherLevel: string;
  schedulable: boolean;
  description?: string;
  remark?: string;
  updatedAt?: string;
}

export interface ScheduleSessionItem {
  id: string;
  name: string;
  type: CourseTypeTag;
  dayIndex: number;
  timeSlot: string;
  timeLabel: string;
  teacher: string;
  room: string;
  booked: number;
  capacity: number;
  status: CourseSessionStatus;
  abnormalHint?: string;
  /** 本地草稿所属周偏移（0 = demo 本周） */
  weekOffset?: number;
}

export interface OptimizationTipItem {
  id: string;
  category: string;
  summary: string;
  impact: string;
  action: string;
}

export interface SessionMemberRow {
  memberName: string;
  asset: string;
  attendanceStatus: string;
  note?: string;
}

export interface CourseSessionDetail {
  id: string;
  sessionCode: string;
  name: string;
  type: CourseTypeTag;
  dateLabel: string;
  timeStart: string;
  timeEnd: string;
  teacher: string;
  room: string;
  capacity: number;
  booked: number;
  checkedIn: number;
  leaveCount: number;
  cancelCount: number;
  noShowCount: number;
  waitlistCount: number;
  status: CourseSessionStatus;
  abnormalHint?: string;
  expectedConsumption: number;
  actualConsumption: number;
  expectedRevenue: string;
  blockReason?: string;
  teacherLevel: string;
  payRule: string;
  expectedPay: string;
  isSubstitute: boolean;
  members: SessionMemberRow[];
  logs: { at: string; actor: string; action: string }[];
}

export interface PublishPreview {
  scope: string;
  draftTotal: number;
  publishable: number;
  blocked: number;
  blockReasons: string[];
  memberScope: string;
  afterNote: string;
}

export const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export const DRAG_TEMPLATE_MIME = 'application/x-met-course-template-id';

export interface WeekDayHeader {
  dayIndex: number;
  weekday: string;
  dateLabel: string;
  isToday: boolean;
}

/** demo 基准周：2026-05-12 周一 */
const BASE_WEEK_MONDAY = new Date(2026, 4, 12);

export const isLocalDraftSession = (id: string): boolean => id.startsWith('local-');

export const buildWeekDayHeaders = (weekOffset: number): WeekDayHeader[] => {
  const start = new Date(BASE_WEEK_MONDAY);
  start.setDate(start.getDate() + weekOffset * 7);
  return WEEKDAY_LABELS.map((weekday, dayIndex) => {
    const d = new Date(start);
    d.setDate(d.getDate() + dayIndex);
    return {
      dayIndex,
      weekday,
      dateLabel: `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
      isToday: weekOffset === 0 && dayIndex === 0,
    };
  });
};

export const WEEK_DAY_HEADERS = buildWeekDayHeaders(0);

export const getWeekRangeLabel = (weekOffset: number): string => {
  const start = new Date(BASE_WEEK_MONDAY);
  start.setDate(start.getDate() + weekOffset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    `2026.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(start)} – ${fmt(end)}`;
};

export const dateIsoForDayIndex = (dayIndex: number, weekOffset = 0): string => {
  const d = new Date(BASE_WEEK_MONDAY);
  d.setDate(d.getDate() + weekOffset * 7 + dayIndex);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const dayIndexFromIsoDate = (iso: string, weekOffset: number): number => {
  const target = new Date(`${iso}T12:00:00`);
  const weekStart = new Date(BASE_WEEK_MONDAY);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const diff = Math.round((target.getTime() - weekStart.getTime()) / 86400000);
  return Math.max(0, Math.min(6, diff));
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
};

export const buildDraftSessionFromTemplate = (
  template: CourseTemplateItem,
  dayIndex: number,
  timeSlot: string,
  id: string,
  weekOffset = 0,
): ScheduleSessionItem => {
  const end = addMinutesToTime(timeSlot, template.durationMin);
  return {
    id,
    name: template.name,
    type: template.type,
    dayIndex,
    timeSlot,
    timeLabel: `${timeSlot}–${end}`,
    teacher: '待指定',
    room: '待指定',
    booked: 0,
    capacity: template.defaultCapacity,
    status: 'draft',
    weekOffset,
  };
};

export interface SessionFormPatch {
  template: string;
  date: string;
  time: string;
  teacher: string;
  room: string;
  capacity: string;
}

export const applySessionFormPatch = (
  session: ScheduleSessionItem,
  patch: SessionFormPatch,
  templates: CourseTemplateItem[],
  weekOffset: number,
): ScheduleSessionItem => {
  const tpl = templates.find(t => t.name === patch.template);
  const duration = tpl?.durationMin ?? 60;
  const dayIndex = dayIndexFromIsoDate(patch.date, weekOffset);
  const timeSlot = patch.time.slice(0, 5);
  const end = addMinutesToTime(timeSlot, duration);
  return {
    ...session,
    name: patch.template || session.name,
    type: tpl?.type ?? session.type,
    dayIndex,
    timeSlot,
    timeLabel: `${timeSlot}–${end}`,
    teacher: patch.teacher.trim() || '待指定',
    room: patch.room.trim() || '待指定',
    capacity: Number(patch.capacity) || session.capacity,
    weekOffset,
  };
};

const metrics: CourseMetricItem[] = [
  { id: 'm1', label: '本周排课', value: '42', subLabel: '场', hint: '较上周 +4 场' },
  { id: 'm2', label: '可预约场次', value: '28', subLabel: '场', hint: '会员端可见' },
  { id: 'm3', label: '已满员场次', value: '6', subLabel: '场', hint: '可考虑加课', tone: 'amber' },
  { id: 'm4', label: '低预约课程', value: '5', subLabel: '场', hint: '需复盘时段或老师', tone: 'amber' },
  { id: 'm5', label: '待处理异常', value: '3', subLabel: '项', hint: '含冲突 / 待发布', tone: 'rose' },
  { id: 'm6', label: '预计耗课', value: '186', subLabel: '点', hint: '以完课确认为准' },
];

const templates: CourseTemplateItem[] = [
  {
    id: 'tpl-1',
    name: '哈他瑜伽 · 基础',
    type: '团课',
    durationMin: 60,
    defaultCapacity: 18,
    defaultPoints: 1,
    stores: '全部门店',
    teacherLevel: 'T2+',
    schedulable: true,
  },
  {
    id: 'tpl-2',
    name: '流瑜伽 · 进阶',
    type: '团课',
    durationMin: 75,
    defaultCapacity: 16,
    defaultPoints: 1,
    stores: '万象 / 滨江',
    teacherLevel: 'T3+',
    schedulable: true,
  },
  {
    id: 'tpl-3',
    name: '普拉提核心床',
    type: '小班',
    durationMin: 55,
    defaultPoints: 2,
    defaultCapacity: 6,
    stores: '城西旗舰店',
    teacherLevel: 'T3+',
    schedulable: true,
  },
  {
    id: 'tpl-4',
    name: '阴瑜伽 · 修复',
    type: '团课',
    durationMin: 60,
    defaultCapacity: 20,
    defaultPoints: 1,
    stores: '全部门店',
    teacherLevel: 'T2+',
    schedulable: true,
  },
  {
    id: 'tpl-5',
    name: '私教塑形',
    type: '私教',
    durationMin: 60,
    defaultCapacity: 1,
    defaultPoints: 3,
    stores: '预约制',
    teacherLevel: 'T4',
    schedulable: true,
  },
  {
    id: 'tpl-6',
    name: 'RYT200 教培课',
    type: '教培',
    durationMin: 180,
    defaultCapacity: 12,
    defaultPoints: 0,
    stores: '教培中心',
    teacherLevel: 'P1',
    schedulable: false,
  },
  {
    id: 'tpl-7',
    name: '热力燃脂团课',
    type: '团课',
    durationMin: 50,
    defaultCapacity: 20,
    defaultPoints: 1,
    stores: '全部门店',
    teacherLevel: 'T2+',
    schedulable: true,
  },
  {
    id: 'tpl-8',
    name: '阿斯汤加',
    type: '团课',
    durationMin: 90,
    defaultCapacity: 14,
    defaultPoints: 1,
    stores: '万象 / 城西',
    teacherLevel: 'T3+',
    schedulable: true,
  },
  {
    id: 'tpl-9',
    name: '维密塑形小班',
    type: '小班',
    durationMin: 55,
    defaultCapacity: 8,
    defaultPoints: 2,
    stores: '城西旗舰店',
    teacherLevel: 'T3+',
    schedulable: true,
  },
  {
    id: 'tpl-10',
    name: '产后修复私教',
    type: '私教',
    durationMin: 60,
    defaultCapacity: 1,
    defaultPoints: 3,
    stores: '预约制',
    teacherLevel: 'T4',
    schedulable: true,
  },
  {
    id: 'tpl-11',
    name: '空中瑜伽',
    type: '团课',
    durationMin: 60,
    defaultCapacity: 12,
    defaultPoints: 1,
    stores: '滨江店',
    teacherLevel: 'T3+',
    schedulable: true,
  },
  {
    id: 'tpl-12',
    name: '冥想放松',
    type: '团课',
    durationMin: 45,
    defaultCapacity: 24,
    defaultPoints: 1,
    stores: '全部门店',
    teacherLevel: 'T2+',
    schedulable: true,
  },
];

const sessions: ScheduleSessionItem[] = [
  {
    id: 's1',
    name: '哈他瑜伽 · 基础',
    type: '团课',
    dayIndex: 0,
    timeSlot: '08:00',
    timeLabel: '08:00–09:00',
    teacher: '林悦',
    room: 'A厅',
    booked: 0,
    capacity: 18,
    status: 'draft',
  },
  {
    id: 's2',
    name: '流瑜伽 · 进阶',
    type: '团课',
    dayIndex: 0,
    timeSlot: '18:00',
    timeLabel: '18:00–19:15',
    teacher: '周晴',
    room: 'B厅',
    booked: 14,
    capacity: 16,
    status: 'bookable',
  },
  {
    id: 's3',
    name: '普拉提核心床',
    type: '小班',
    dayIndex: 1,
    timeSlot: '10:00',
    timeLabel: '10:00–10:55',
    teacher: '陈宁',
    room: '器械室',
    booked: 6,
    capacity: 6,
    status: 'full',
    abnormalHint: '连续满员，建议加开 1 场',
  },
  {
    id: 's4',
    name: '阴瑜伽 · 修复',
    type: '团课',
    dayIndex: 2,
    timeSlot: '14:00',
    timeLabel: '14:00–15:00',
    teacher: '王静',
    room: 'A厅',
    booked: 4,
    capacity: 20,
    status: 'exception',
    abnormalHint: '预约率低于 50%，老师资质待核对',
  },
  {
    id: 's5',
    name: '小班燃脂',
    type: '小班',
    dayIndex: 3,
    timeSlot: '18:00',
    timeLabel: '18:00–18:55',
    teacher: '李瑶',
    room: 'C厅',
    booked: 3,
    capacity: 8,
    status: 'published',
  },
  {
    id: 's6',
    name: '私教塑形',
    type: '私教',
    dayIndex: 4,
    timeSlot: '12:00',
    timeLabel: '12:00–13:00',
    teacher: '赵晨（代）',
    room: '私教室 2',
    booked: 1,
    capacity: 1,
    status: 'substituting',
  },
  {
    id: 's7',
    name: 'RYT200 教培',
    type: '教培',
    dayIndex: 5,
    timeSlot: '10:00',
    timeLabel: '10:00–13:00',
    teacher: '温言',
    room: '教培厅',
    booked: 9,
    capacity: 12,
    status: 'bookable',
  },
  {
    id: 's8',
    name: '恢复瑜伽',
    type: '团课',
    dayIndex: 6,
    timeSlot: '20:00',
    timeLabel: '20:00–21:00',
    teacher: '孙禾',
    room: 'A厅',
    booked: 0,
    capacity: 18,
    status: 'canceled',
    abnormalHint: '已取消，待通知会员',
  },
  {
    id: 's9',
    name: '晨间流瑜伽',
    type: '团课',
    dayIndex: 1,
    timeSlot: '08:00',
    timeLabel: '08:00–09:15',
    teacher: '周晴',
    room: 'B厅',
    booked: 11,
    capacity: 16,
    status: 'booking_closed',
  },
];

const optimizationTips: OptimizationTipItem[] = [
  {
    id: 'o1',
    category: '低预约课程',
    summary: '周二晚间团课预约率低于 50%',
    impact: '建议调整老师或课程类型',
    action: '去调整',
  },
  {
    id: 'o2',
    category: '连续满员',
    summary: '普拉提核心床连续 3 场满员',
    impact: '建议增加 1 场小班',
    action: '复制排课',
  },
  {
    id: 'o3',
    category: '高价值时段不足',
    summary: '晚间小班供给不足',
    impact: '预计影响本周耗课目标 18 点',
    action: '增加小班',
  },
  {
    id: 'o4',
    category: '排课复核',
    summary: '周晴晚间排课过密；C厅周三晚间空置',
    impact: '老师负荷与教室利用率需复核',
    action: '查看课表',
  },
];

const sessionDetails: Record<string, CourseSessionDetail> = {
  s2: {
    id: 's2',
    sessionCode: 'WK26-0412',
    name: '流瑜伽 · 进阶',
    type: '团课',
    dateLabel: '2026.05.12 周一',
    timeStart: '18:00',
    timeEnd: '19:15',
    teacher: '周晴',
    room: 'B厅',
    capacity: 16,
    booked: 14,
    checkedIn: 0,
    leaveCount: 1,
    cancelCount: 0,
    noShowCount: 0,
    waitlistCount: 2,
    status: 'bookable',
    expectedConsumption: 14,
    actualConsumption: 0,
    expectedRevenue: '¥2,240（预估）',
    teacherLevel: 'T3',
    payRule: '团课课时费 · 阶梯',
    expectedPay: '¥180',
    isSubstitute: false,
    members: [
      { memberName: '张敏', asset: '年卡 · 剩余 42 次', attendanceStatus: '已预约' },
      { memberName: '刘婷', asset: '次卡 · 剩余 8 次', attendanceStatus: '已预约' },
      { memberName: '陈璐', asset: '储值 · 余额 ¥1,200', attendanceStatus: '请假', note: '课前 2h 请假' },
    ],
    logs: [
      { at: '05-10 16:20', actor: '总部教务', action: '创建草稿场次' },
      { at: '05-11 09:00', actor: '店长', action: '发布课表' },
      { at: '05-12 08:30', actor: '系统', action: '开放会员预约' },
    ],
  },
  s4: {
    id: 's4',
    sessionCode: 'WK26-0414',
    name: '阴瑜伽 · 修复',
    type: '团课',
    dateLabel: '2026.05.14 周三',
    timeStart: '14:00',
    timeEnd: '15:00',
    teacher: '王静',
    room: 'A厅',
    capacity: 20,
    booked: 4,
    checkedIn: 0,
    leaveCount: 0,
    cancelCount: 1,
    noShowCount: 0,
    waitlistCount: 0,
    status: 'exception',
    abnormalHint: '老师资质与课程模板不匹配，待总部审核',
    expectedConsumption: 4,
    actualConsumption: 0,
    expectedRevenue: '¥480（预估）',
    blockReason: '资质校验未通过',
    teacherLevel: 'T2',
    payRule: '团课课时费 · 标准',
    expectedPay: '¥120',
    isSubstitute: false,
    members: [
      { memberName: '赵琳', asset: '月卡', attendanceStatus: '已预约' },
      { memberName: '吴倩', asset: '体验课', attendanceStatus: '已取消' },
    ],
    logs: [
      { at: '05-09 11:00', actor: '店长', action: '创建并排课' },
      { at: '05-13 15:40', actor: '系统', action: '标记异常待处理' },
    ],
  },
};

const defaultDetail = (s: ScheduleSessionItem): CourseSessionDetail => ({
  id: s.id,
  sessionCode: `WK26-${s.id.toUpperCase()}`,
  name: s.name,
  type: s.type,
  dateLabel: `2026.05.${10 + s.dayIndex} ${WEEKDAY_LABELS[s.dayIndex]}`,
  timeStart: s.timeSlot,
  timeEnd: s.timeLabel.split('–')[1] ?? s.timeSlot,
  teacher: s.teacher,
  room: s.room,
  capacity: s.capacity,
  booked: s.booked,
  checkedIn: 0,
  leaveCount: 0,
  cancelCount: 0,
  noShowCount: 0,
  waitlistCount: 0,
  status: s.status,
  abnormalHint: s.abnormalHint,
  expectedConsumption: s.booked,
  actualConsumption: 0,
  expectedRevenue: '—',
  teacherLevel: 'T2',
  payRule: '按课程类型规则',
  expectedPay: '¥120',
  isSubstitute: s.status === 'substituting',
  members: [
    { memberName: '演示会员 A', asset: '年卡', attendanceStatus: '已预约' },
    { memberName: '演示会员 B', asset: '次卡', attendanceStatus: '已预约' },
  ],
  logs: [{ at: '05-08 10:00', actor: '教务', action: '创建场次' }],
});

export const resolveSessionDetail = (
  id: string,
  allSessions: ScheduleSessionItem[],
): CourseSessionDetail | null => {
  const s = allSessions.find(x => x.id === id);
  if (!s) return null;
  return sessionDetails[id] ?? defaultDetail(s);
};

export const buildCourseOperationSnapshot = () => ({
  weekLabel: '2026.05.05 – 05.11',
  metrics,
  templates,
  sessions,
  optimizationTips,
  publishPreview: {
    scope: '城西旗舰店 · 本周课表',
    draftTotal: 12,
    publishable: 9,
    blocked: 3,
    blockReasons: [
      '2 场草稿未填写老师或教室',
      '1 场老师资质与课程模板不匹配',
      '1 场教室时段冲突',
    ],
    memberScope: '会员端将看到已发布 / 可预约场次',
    afterNote: '发布后会员可按规则预约；不合规场次保持草稿状态。',
  } satisfies PublishPreview,
  getSessionDetail: (id: string): CourseSessionDetail => {
    const s = sessions.find(x => x.id === id);
    if (!s) return sessionDetails.s2;
    return sessionDetails[id] ?? defaultDetail(s);
  },
});

export const statusBadgeClass = (status: CourseSessionStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-[#F0F1ED] text-[#565D56] ring-1 ring-[#E1E3DD]';
    case 'published':
    case 'bookable':
      return 'bg-[#F4F6F3] text-[#3D5248] ring-1 ring-[#E1E3DD]';
    case 'full':
      return 'bg-[#FAF6F0] text-[#8A6A3A] ring-1 ring-[#E8DFD0]';
    case 'exception':
      return 'bg-[#FAF4F0] text-[#9A6A36] ring-1 ring-[#E8DFD0]';
    case 'substituting':
      return 'bg-[#F5F3EF] text-[#5C5A52] ring-1 ring-[#E1E3DD]';
    case 'canceled':
      return 'bg-[#F5F5F4] text-[#9A9F98] ring-1 ring-[#E1E3DD]';
    case 'ongoing':
      return 'bg-[#F0F4F2] text-[#4A5C4F] ring-1 ring-[#E1E3DD]';
    default:
      return 'bg-[#F7F8F5] text-[#565D56] ring-1 ring-[#E1E3DD]';
  }
};

export const typeTagClass = (type: CourseTypeTag): string => {
  switch (type) {
    case '小班':
      return 'border-[#E1E3DD] bg-[#F7F8F5] text-[#565D56]';
    case '私教':
      return 'border-[#E1E3DD] bg-[#F5F4F2] text-[#565D56]';
    case '教培':
      return 'border-[#E1E3DD] bg-[#F4F3EF] text-[#565D56]';
    default:
      return 'border-[#E1E3DD] bg-[#F7F8F5] text-[#7A817A]';
  }
};
