/** 今日运营页局部展示模型（仅本目录使用；不接全局 types / services / selectors）。 */

export type TodayCourseTypeLabel = '团课' | '小班' | '私教';

export type TodayCourseStatusTone = 'neutral' | 'ongoing' | 'upcoming' | 'done' | 'canceled' | 'warning';

export interface TodayMetricItem {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  /** 轻量经营提示（仅展示） */
  hint?: string;
  tone?: 'neutral' | 'amber' | 'rose';
}

export interface TodayTodoPanelSummary {
  total: number;
  highPriority: number;
}

export interface TodayCourseRow {
  id: string;
  timeStart: string;
  timeEnd: string;
  name: string;
  type: TodayCourseTypeLabel;
  teacher: string;
  room: string;
  booked: number;
  capacity: number;
  checkedIn: number;
  statusLabel: string;
  statusTone: TodayCourseStatusTone;
  abnormal?: boolean;
  abnormalHint?: string;
}

export interface TodayTodoItem {
  id: string;
  category: string;
  summary: string;
  owner: string;
  timeOrPriority: string;
  priority: 'high' | 'medium' | 'low';
  primaryAction: string;
  secondaryAction?: string;
}

export interface TodayBookingSummaryRow {
  memberName: string;
  status: string;
  note?: string;
}

export interface TodayAttendanceSummaryRow {
  memberName: string;
  status: string;
  checkedAt?: string;
}

export interface TodayExceptionSummaryRow {
  title: string;
  detail: string;
}

export interface TodayOpsLogRow {
  at: string;
  actor: string;
  action: string;
}

export interface TodayCourseDetail {
  courseId: string;
  name: string;
  dateLabel: string;
  timeStart: string;
  timeEnd: string;
  type: TodayCourseTypeLabel;
  teacher: string;
  room: string;
  booked: number;
  capacity: number;
  checkedIn: number;
  exceptionCount: number;
  bookings: TodayBookingSummaryRow[];
  attendances: TodayAttendanceSummaryRow[];
  exceptions: TodayExceptionSummaryRow[];
  pendingItems: TodayExceptionSummaryRow[];
  opsLogs: TodayOpsLogRow[];
}

export interface TodayOperationDemoSnapshot {
  dateHeaderLabel: string;
  metrics: TodayMetricItem[];
  courses: TodayCourseRow[];
  todos: TodayTodoItem[];
  todoSummary: TodayTodoPanelSummary;
  courseDetailsById: Record<string, TodayCourseDetail>;
}

const courseDetails: TodayCourseDetail[] = [
  {
    courseId: 'sess-1',
    name: '晨间流瑜伽 · 基础',
    dateLabel: '2026.05.05 周一',
    timeStart: '08:30',
    timeEnd: '09:30',
    type: '团课',
    teacher: 'Anna',
    room: 'A厅',
    booked: 14,
    capacity: 16,
    checkedIn: 11,
    exceptionCount: 1,
    bookings: [
      { memberName: '林晓', status: '已预约' },
      { memberName: '周然', status: '已预约' },
      { memberName: '陈悦', status: '待确认' },
    ],
    attendances: [
      { memberName: '林晓', status: '已到课', checkedAt: '08:22' },
      { memberName: '周然', status: '已到课', checkedAt: '08:25' },
    ],
    exceptions: [{ title: '满员候补', detail: '2 人候补排队，需前台确认是否加座。' }],
    pendingItems: [{ title: '待补签审核', detail: '会员「李婧」申请补签，待店长复核。' }],
    opsLogs: [
      { at: '08:10', actor: '前台·小周', action: '开放签到窗口' },
      { at: '08:22', actor: '系统', action: '记录到课 11 人' },
    ],
  },
  {
    courseId: 'sess-2',
    name: '普拉提核心床 · 小班',
    dateLabel: '2026.05.05 周一',
    timeStart: '10:00',
    timeEnd: '11:00',
    type: '小班',
    teacher: 'David',
    room: '私教室 2',
    booked: 6,
    capacity: 6,
    checkedIn: 6,
    exceptionCount: 0,
    bookings: [
      { memberName: '王琪', status: '已预约' },
      { memberName: '赵敏', status: '已预约' },
    ],
    attendances: [
      { memberName: '王琪', status: '已到课', checkedAt: '09:52' },
      { memberName: '赵敏', status: '已到课', checkedAt: '09:55' },
    ],
    exceptions: [],
    pendingItems: [],
    opsLogs: [{ at: '09:50', actor: 'David', action: '确认教室设备就绪' }],
  },
  {
    courseId: 'sess-3',
    name: '私教 · 肩颈理疗',
    dateLabel: '2026.05.05 周一',
    timeStart: '14:00',
    timeEnd: '15:00',
    type: '私教',
    teacher: 'Leo',
    room: '私教室 1',
    booked: 1,
    capacity: 1,
    checkedIn: 0,
    exceptionCount: 2,
    bookings: [{ memberName: '张岚', status: '已预约', note: '会员备注：近期肩颈不适' }],
    attendances: [],
    exceptions: [
      { title: '老师迟到风险', detail: 'Leo 上一节私教可能延时 10 分钟。' },
      { title: '未到课提醒', detail: '会员尚未到店，建议通知管家跟进。' },
    ],
    pendingItems: [
      { title: '临时调课', detail: '若 Leo 无法准时，需协调代课老师。' },
      { title: '待跟进会员', detail: '张岚近 7 日仅到课 1 次。' },
    ],
    opsLogs: [{ at: '13:40', actor: '管家·Amy', action: '已发送课前提醒' }],
  },
  {
    courseId: 'sess-4',
    name: '阴瑜伽 · 放松修复',
    dateLabel: '2026.05.05 周一',
    timeStart: '18:30',
    timeEnd: '19:30',
    type: '团课',
    teacher: 'Chloe',
    room: 'B厅',
    booked: 10,
    capacity: 18,
    checkedIn: 0,
    exceptionCount: 0,
    bookings: [
      { memberName: '孙悦', status: '已预约' },
      { memberName: '何清', status: '已预约' },
    ],
    attendances: [],
    exceptions: [],
    pendingItems: [],
    opsLogs: [{ at: '12:00', actor: '系统', action: '发布今日课表提醒' }],
  },
  {
    courseId: 'sess-5',
    name: '阿斯汤加 · 进阶',
    dateLabel: '2026.05.05 周一',
    timeStart: '19:45',
    timeEnd: '20:45',
    type: '团课',
    teacher: 'Mike',
    room: 'A厅',
    booked: 12,
    capacity: 14,
    checkedIn: 0,
    exceptionCount: 1,
    bookings: [{ memberName: '许晨', status: '已取消', note: '课前 2 小时取消' }],
    attendances: [],
    exceptions: [{ title: '空位偏多', detail: '当前空位 2，可考虑开放体验名额。' }],
    pendingItems: [],
    opsLogs: [],
  },
];

export const buildTodayOperationDemoSnapshot = (): TodayOperationDemoSnapshot => {
  const courses: TodayCourseRow[] = [
    {
      id: 'sess-1',
      timeStart: '08:30',
      timeEnd: '09:30',
      name: '晨间流瑜伽 · 基础',
      type: '团课',
      teacher: 'Anna',
      room: 'A厅',
      booked: 14,
      capacity: 16,
      checkedIn: 11,
      statusLabel: '进行中',
      statusTone: 'ongoing',
      abnormal: true,
      abnormalHint: '满员候补 2 人',
    },
    {
      id: 'sess-2',
      timeStart: '10:00',
      timeEnd: '11:00',
      name: '普拉提核心床 · 小班',
      type: '小班',
      teacher: 'David',
      room: '私教室 2',
      booked: 6,
      capacity: 6,
      checkedIn: 6,
      statusLabel: '已结束',
      statusTone: 'done',
    },
    {
      id: 'sess-3',
      timeStart: '14:00',
      timeEnd: '15:00',
      name: '私教 · 肩颈理疗',
      type: '私教',
      teacher: 'Leo',
      room: '私教室 1',
      booked: 1,
      capacity: 1,
      checkedIn: 0,
      statusLabel: '待开课',
      statusTone: 'warning',
      abnormal: true,
      abnormalHint: '老师迟到风险 · 会员未到',
    },
    {
      id: 'sess-4',
      timeStart: '18:30',
      timeEnd: '19:30',
      name: '阴瑜伽 · 放松修复',
      type: '团课',
      teacher: 'Chloe',
      room: 'B厅',
      booked: 10,
      capacity: 18,
      checkedIn: 0,
      statusLabel: '待开课',
      statusTone: 'upcoming',
    },
    {
      id: 'sess-5',
      timeStart: '19:45',
      timeEnd: '20:45',
      name: '阿斯汤加 · 进阶',
      type: '团课',
      teacher: 'Mike',
      room: 'A厅',
      booked: 12,
      capacity: 14,
      checkedIn: 0,
      statusLabel: '待开课',
      statusTone: 'upcoming',
      abnormal: true,
      abnormalHint: '空位偏多',
    },
  ];

  const courseDetailsById = Object.fromEntries(courseDetails.map(d => [d.courseId, d]));

  return {
    dateHeaderLabel: '今日 · 2026.05.05 周一',
    metrics: [
      { id: 'm1', label: '今日课程', value: '5', subLabel: '节', hint: '较昨日 +1 场' },
      { id: 'm2', label: '预约人数', value: '43', subLabel: '人', hint: '满员率 82%' },
      { id: 'm3', label: '已签到', value: '17', subLabel: '人', hint: '签到率 39%' },
      {
        id: 'm4',
        label: '异常待处理',
        value: '3',
        subLabel: '项',
        hint: '2 项高优先级',
        tone: 'rose',
      },
      {
        id: 'm5',
        label: '待跟进会员',
        value: '6',
        subLabel: '人',
        hint: '3 人今日需处理',
        tone: 'amber',
      },
      { id: 'm6', label: '今日耗课预估', value: '38', subLabel: '节', hint: '以完课确认为准' },
    ],
    courses,
    todoSummary: { total: 6, highPriority: 2 },
    todos: [
      {
        id: 't1',
        category: '待补签审核',
        summary: '会员李婧申请补签「晨间流瑜伽」',
        owner: '前台·小周',
        timeOrPriority: '高 · 10 分钟内',
        priority: 'high',
        primaryAction: '查看处理方案',
        secondaryAction: '添加跟进记录',
      },
      {
        id: 't2',
        category: '课程异常',
        summary: '私教肩颈理疗：老师可能延时、会员未到',
        owner: '店长',
        timeOrPriority: '高 · 14:00 前',
        priority: 'high',
        primaryAction: '查看详情',
        secondaryAction: '通知管家跟进',
      },
      {
        id: 't3',
        category: '临时调课',
        summary: '若 Leo 无法准时，需确认代课老师',
        owner: '排课专员',
        timeOrPriority: '中 · 今日',
        priority: 'medium',
        primaryAction: '查看处理方案',
      },
      {
        id: 't4',
        category: '请假 / 缺席复核',
        summary: '会员许晨取消晚间阿斯汤加，需复核权益',
        owner: '管家·Amy',
        timeOrPriority: '中 · 今日',
        priority: 'medium',
        primaryAction: '查看详情',
      },
      {
        id: 't5',
        category: '待跟进会员',
        summary: '张岚近 7 日到课偏低，建议课后回访',
        owner: '管家·Amy',
        timeOrPriority: '中',
        priority: 'medium',
        primaryAction: '添加跟进记录',
        secondaryAction: '通知管家跟进',
      },
      {
        id: 't6',
        category: '今日财务核对提醒',
        summary: '晚间课结束后核对待确认收入与课时预览',
        owner: '财务对接',
        timeOrPriority: '低 · 闭店前',
        priority: 'low',
        primaryAction: '查看耗课与课时预览',
      },
    ],
    courseDetailsById,
  };
};
