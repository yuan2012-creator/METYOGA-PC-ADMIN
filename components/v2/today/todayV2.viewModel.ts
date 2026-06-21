export type TodayV2PriorityLevel = 'P0' | 'P1' | 'P2';

export type TodayV2SuggestionSource = 'system_rule' | 'pending_config';

export type TodayV2CourseStatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export interface TodayV2PageMeta {
  title: string;
  subtitle: string;
  filters: {
    storeLabel: string;
    dateLabel: string;
    primaryActionLabel: string;
  };
}

export interface TodayV2QuickAction {
  id: string;
  label: string;
  icon: 'scan' | 'users' | 'alert' | 'list';
}

export interface TodayV2QuickActions {
  title: string;
  actions: TodayV2QuickAction[];
}

export interface TodayV2MiniStat {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface TodayV2DailyBrief {
  title: string;
  stats: TodayV2MiniStat[];
}

export interface TodayV2UrgentTask {
  id: string;
  priority: TodayV2PriorityLevel;
  title: string;
  deadline: string;
  ownerShort: string;
  actionLabel: string;
}

export interface TodayV2UrgentSection {
  title: string;
  tasks: TodayV2UrgentTask[];
}

export interface TodayV2WorkOrderTask {
  id: string;
  priority: TodayV2PriorityLevel;
  title: string;
  fact: string;
  owner: string;
  deadline: string;
  suggestionSource: TodayV2SuggestionSource;
  suggestionSourceLabel: string;
  actionLabel: string;
}

export interface TodayV2MustHandleSection {
  title: string;
  subtitle: string;
  tasks: TodayV2WorkOrderTask[];
}

export type TodayV2CourseFocusMarker = 'current' | 'next';

export interface TodayV2CourseFocusStatus {
  currentFocusLabel: string;
  currentFocusText: string;
  nextFocusLabel: string;
  nextFocusText: string;
}

export interface TodayV2CourseItem {
  id: string;
  time: string;
  courseName: string;
  teacherName: string;
  bookedCount: number;
  capacity: number;
  status: string;
  statusTone: TodayV2CourseStatusTone;
  actionLabel: string;
  focusMarker?: TodayV2CourseFocusMarker;
}

export interface TodayV2CourseTimeline {
  title: string;
  subtitle: string;
  focusStatus: TodayV2CourseFocusStatus;
  courses: TodayV2CourseItem[];
}

export interface TodayV2MemberReminder {
  id: string;
  label: string;
  value: string;
  note: string;
  actionLabel: string;
}

export interface TodayV2MemberReminders {
  title: string;
  subtitle: string;
  items: TodayV2MemberReminder[];
}

export interface TodayV2WeeklyTask {
  id: string;
  priority: TodayV2PriorityLevel;
  title: string;
  summary: string;
  actionLabel: string;
}

export interface TodayV2WeeklyTasksSection {
  title: string;
  subtitle: string;
  tasks: TodayV2WeeklyTask[];
}

export interface TodayV2Snapshot {
  meta: TodayV2PageMeta;
  courseTimeline: TodayV2CourseTimeline;
  urgentNow: TodayV2UrgentSection;
  quickActions: TodayV2QuickActions;
  dailyBrief: TodayV2DailyBrief;
  mustHandleToday: TodayV2MustHandleSection;
  memberReminders: TodayV2MemberReminders;
  weeklyTasks: TodayV2WeeklyTasksSection;
}

export function buildTodayV2Snapshot(): TodayV2Snapshot {
  return {
    meta: {
      title: '今日运营',
      subtitle: '滨江馆 · 2026年6月26日 · 周五',
      filters: {
        storeLabel: '滨江馆',
        dateLabel: '今日',
        primaryActionLabel: '扫码核销',
      },
    },
    courseTimeline: {
      title: '今日课程',
      subtitle: '按时间顺序 · 可进入名单 / 签到 / 处理',
      focusStatus: {
        currentFocusLabel: '当前关注',
        currentFocusText: '18:30 流瑜伽 · 满员候补 4',
        nextFocusLabel: '下一重点',
        nextFocusText: '19:30 普拉提小班 · 低预约 2/6',
      },
      courses: [
        {
          id: 'c-1',
          time: '09:30',
          courseName: '阴瑜伽',
          teacherName: 'Anna',
          bookedCount: 12,
          capacity: 16,
          status: '已完成',
          statusTone: 'success',
          actionLabel: '名单',
        },
        {
          id: 'c-2',
          time: '11:00',
          courseName: '普拉提小班',
          teacherName: 'Mia',
          bookedCount: 5,
          capacity: 6,
          status: '待开课',
          statusTone: 'neutral',
          actionLabel: '签到',
        },
        {
          id: 'c-3',
          time: '14:00',
          courseName: '私教',
          teacherName: 'Leo',
          bookedCount: 1,
          capacity: 1,
          status: '待确认',
          statusTone: 'info',
          actionLabel: '确认',
        },
        {
          id: 'c-4',
          time: '18:30',
          courseName: '流瑜伽',
          teacherName: 'Nora',
          bookedCount: 18,
          capacity: 18,
          status: '满员候补 4',
          statusTone: 'warning',
          actionLabel: '建议',
          focusMarker: 'current',
        },
        {
          id: 'c-5',
          time: '19:30',
          courseName: '普拉提小班',
          teacherName: 'Mia',
          bookedCount: 2,
          capacity: 6,
          status: '低预约',
          statusTone: 'danger',
          actionLabel: '处理',
          focusMarker: 'next',
        },
        {
          id: 'c-6',
          time: '20:30',
          courseName: '肩颈舒缓',
          teacherName: 'Anna',
          bookedCount: 9,
          capacity: 16,
          status: '正常',
          statusTone: 'success',
          actionLabel: '名单',
        },
      ],
    },
    urgentNow: {
      title: '当前最紧急',
      tasks: [
        {
          id: 'u-1',
          priority: 'P0',
          title: '19:30 普拉提小班预约偏低',
          deadline: '16:00',
          ownerShort: '周航',
          actionLabel: '处理',
        },
        {
          id: 'u-2',
          priority: 'P1',
          title: '18:30 满员候补未加课',
          deadline: '15:00',
          ownerShort: '林敏',
          actionLabel: '建议',
        },
      ],
    },
    quickActions: {
      title: '快捷操作',
      actions: [
        { id: 'qa-scan', label: '扫码核销', icon: 'scan' },
        { id: 'qa-members', label: '今日会员', icon: 'users' },
        { id: 'qa-alerts', label: '今日异常', icon: 'alert' },
        { id: 'qa-roster', label: '课程名单', icon: 'list' },
      ],
    },
    dailyBrief: {
      title: '今日简报',
      stats: [
        { id: 's-bookings', label: '预约人数', value: '46' },
        { id: 's-points', label: '预计耗课', value: '58 点' },
        { id: 's-full-rate', label: '满课率', value: '78.6%', isWarning: true },
        { id: 's-pending', label: '待处理', value: '7 项', isWarning: true },
      ],
    },
    mustHandleToday: {
      title: '必须今天处理',
      subtitle: '按截止时间与影响程度排序',
      tasks: [
        {
          id: 't-1',
          priority: 'P0',
          title: '19:30 普拉提小班预约偏低',
          fact: '2/6 人，低于开班线；距开课 5 小时。',
          owner: '周航',
          deadline: '16:00',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '处理',
        },
        {
          id: 't-2',
          priority: 'P1',
          title: '18:30 流瑜伽已满员但未加课',
          fact: '18/18 人，候补 4 人。',
          owner: '林敏',
          deadline: '15:00',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '建议',
        },
        {
          id: 't-3',
          priority: 'P1',
          title: '3 名会员今日待补签确认',
          fact: '昨日 3 条签到异常待确认。',
          owner: '小乔',
          deadline: '18:00',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          actionLabel: '补签',
        },
        {
          id: 't-4',
          priority: 'P1',
          title: '新客体验后 24h 内未跟进',
          fact: '昨日体验会员 2 人未回访。',
          owner: '陈悦',
          deadline: '20:00',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          actionLabel: '跟进',
        },
      ],
    },
    memberReminders: {
      title: '今日会员提醒',
      subtitle: '需前台 / 管家完成的会员动作',
      items: [
        {
          id: 'mr-1',
          label: '续费窗口',
          value: '8 人',
          note: '未来 14 天权益到期',
          actionLabel: '查看',
        },
        {
          id: 'mr-2',
          label: '高余额低耗课',
          value: '6 人',
          note: '30 天耗课 ≤ 2 次',
          actionLabel: '跟进',
        },
        {
          id: 'mr-3',
          label: '今日生日 / 纪念日',
          value: '3 人',
          note: '适合轻触达',
          actionLabel: '发送',
        },
        {
          id: 'mr-4',
          label: '新客体验后回访',
          value: '2 人',
          note: '24h 内未记录',
          actionLabel: '跟进',
        },
      ],
    },
    weeklyTasks: {
      title: '本周内处理',
      subtitle: '不必今天完成，但需要本周推进',
      tasks: [
        {
          id: 'w-1',
          priority: 'P2',
          title: '本周低频会员唤醒名单',
          summary: '32 人',
          actionLabel: '生成名单',
        },
        {
          id: 'w-2',
          priority: 'P2',
          title: '老师加课建议复核',
          summary: '4 个时段',
          actionLabel: '查看建议',
        },
        {
          id: 'w-3',
          priority: 'P2',
          title: '积分兑换待核销',
          summary: '9 单',
          actionLabel: '核销',
        },
      ],
    },
  };
}
