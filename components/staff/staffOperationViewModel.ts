/** 师资与团队模块局部 demo 数据 */

import { formatStaffCny, formatStaffCount, formatStaffPercent } from './staffFormatters';

export type StaffWorkbenchSegment =
  | 'profiles'
  | 'todayCourses'
  | 'payIncome'
  | 'growth'
  | 'leaveSubstitute'
  | 'permissions';

export const STAFF_WORKBENCH_SEGMENTS: { id: StaffWorkbenchSegment; label: string }[] = [
  { id: 'profiles', label: '老师档案' },
  { id: 'todayCourses', label: '今日课程' },
  { id: 'payIncome', label: '课时与收入' },
  { id: 'growth', label: '成长等级' },
  { id: 'leaveSubstitute', label: '请假 / 代课' },
  { id: 'permissions', label: '权限角色' },
];

export const STAFF_SEGMENT_HINTS: Record<StaffWorkbenchSegment, string> = {
  profiles: '老师基础经营状态 · 等级 · 门店 · 风险',
  todayCourses: '今日排课执行 · 到课 · 代课 · 异常（后台不代签到）',
  payIncome: '课时费预估 · 待核 · 需以完课与规则为准',
  growth: '晋级 / 保级 / 降级系统建议 · 需店长复核',
  leaveSubstitute: '请假 · 代课 · 调课对排课与会员的影响',
  permissions: '后台与老师端 METeach 权限边界',
};

export type StaffActionGroup = 'courseExecution' | 'payPending' | 'growthReview' | 'leaveSubstitute';

export interface StaffListFilters {
  query: string;
  store: string;
  employmentType: string;
  level: string;
  status: string;
  risk: string;
}

export const DEFAULT_STAFF_FILTERS: StaffListFilters = {
  query: '',
  store: '全部',
  employmentType: '全部',
  level: '全部',
  status: '全部',
  risk: '全部',
};

export interface StaffCourseRecord {
  id: string;
  date: string;
  time: string;
  courseName: string;
  courseType: string;
  storeName: string;
  room: string;
  booked: number;
  attended: number;
  status: string;
}

export interface StaffPayRecord {
  id: string;
  label: string;
  amount: number;
  status: string;
  note: string;
}

export interface StaffGrowthRecord {
  period: string;
  fillRate: number;
  attendanceRate: number;
  privateConversion: number;
  qualityScore: number;
  judgment: string;
}

export interface StaffLeaveRecord {
  id: string;
  type: string;
  date: string;
  courseName: string;
  substituteName: string;
  affectedMembers: number;
  status: string;
}

export interface StaffPermissionProfile {
  backendRole: string;
  backendScopes: string[];
  teachVisible: string[];
  teachHidden: string[];
  sensitiveFlags: string[];
  dataScope: string;
  status: string;
}

export interface StaffTeacherRow {
  id: string;
  teacherId: string;
  name: string;
  phoneMasked: string;
  avatarText: string;
  employmentType: string;
  roleType: string;
  teacherLevel: string;
  incomeLevel: string;
  storeName: string;
  mainCourses: string;
  courseTypes: string[];
  monthlySessions: number;
  monthlyEstimatedPay: number;
  pendingPayAmount: number;
  groupClassPay: number;
  smallClassPay: number;
  privateTrainingRevenue: number;
  payStatus: string;
  fillRate: number;
  attendanceRate: number;
  memberFeedbackScore: number;
  privateConversionRate: number;
  growthStatus: string;
  growthJudgment: string;
  growthNextStep: string;
  riskTags: string[];
  nextAction: string;
  managerName: string;
  academicOwner: string;
  financeOwner: string;
  status: string;
  meteachLabel: string;
  todaySuggestion: string;
  permissionProfile: StaffPermissionProfile;
  courseRecords: StaffCourseRecord[];
  payRecords: StaffPayRecord[];
  growthRecords: StaffGrowthRecord[];
  leaveRecords: StaffLeaveRecord[];
  operationLogs: string[];
}

export interface StaffTodayCourseRow {
  id: string;
  teacherId: string;
  time: string;
  teacherName: string;
  courseName: string;
  courseType: string;
  storeRoom: string;
  booked: number;
  attended: number;
  status: string;
}

export interface StaffLeaveSubstituteRow {
  id: string;
  teacherId: string;
  applyType: string;
  teacherName: string;
  affectedCourse: string;
  timeRange: string;
  substituteName: string;
  affectedMembers: number;
  status: string;
}

export interface StaffPermissionRow {
  id: string;
  teacherId: string;
  name: string;
  role: string;
  backendPerm: string;
  teachPerm: string;
  dataScope: string;
  sensitivePerm: string;
  status: string;
}

export interface StaffMetricItem {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface StaffInsightTip {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface StaffActionItem {
  id: string;
  group: StaffActionGroup;
  teacherId: string;
  title: string;
  statusLabel: string;
  riskLine: string;
  evidenceChain: string[];
  openTab?: 'overview' | 'courses' | 'pay' | 'growth' | 'leave' | 'permission';
}

export interface StaffOperationSnapshot {
  teachers: StaffTeacherRow[];
  todayCourses: StaffTodayCourseRow[];
  leaveSubstitutes: StaffLeaveSubstituteRow[];
  metrics: StaffMetricItem[];
  insights: StaffInsightTip[];
  actionQueue: StaffActionItem[];
}

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];
const METEACH_VISIBLE = [
  '自己课程',
  '会员练习画像（脱敏）',
  '课后反馈',
  '成长等级摘要',
  '收入预估摘要',
  '教学任务',
];
const METEACH_HIDDEN = [
  '会员完整手机号',
  '订单金额',
  '合同详情',
  '退款审批',
  '财务真实入账',
  '其他老师完整收入',
  '内部经营判断',
];

const mkCourses = (teacherId: string, name: string, store: string, n: number): StaffCourseRecord[] =>
  Array.from({ length: n }, (_, i) => {
    const types = ['团课', '小班', '私教', '教培'];
    const type = types[i % types.length];
    const day = 14 - (i % 7);
    return {
      id: `scr-${teacherId}-${i}`,
      date: `2026-05-${String(day).padStart(2, '0')}`,
      time: `${9 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
      courseName: type === '私教' ? `${name} · 私教` : type === '小班' ? '核心床小班' : '流瑜伽',
      courseType: type,
      storeName: store,
      room: type === '私教' ? '私教室 A' : '大教室',
      booked: 8 + (i % 6),
      attended: 6 + (i % 5),
      status: i === 0 ? '待上课' : i === 1 ? '异常' : '已完课',
    };
  });

type TeacherSeed = Omit<
  StaffTeacherRow,
  'id' | 'courseRecords' | 'payRecords' | 'growthRecords' | 'leaveRecords' | 'operationLogs'
>;

const buildTeacher = (seed: TeacherSeed, index: number): StaffTeacherRow => {
  const id = `stf-${index + 1}`;
  return {
    ...seed,
    id,
    courseRecords: mkCourses(id, seed.name, seed.storeName, 12),
    payRecords: [
      {
        id: `pay-${id}-1`,
        label: '团课课时费',
        amount: seed.groupClassPay,
        status: seed.pendingPayAmount > 0 ? '待核' : '已确认',
        note: '以完课记录为准',
      },
      {
        id: `pay-${id}-2`,
        label: '小班课时费',
        amount: seed.smallClassPay,
        status: '已确认',
        note: '本页仅展示预估',
      },
      {
        id: `pay-${id}-3`,
        label: '私教预估',
        amount: seed.privateTrainingRevenue,
        status: '待财务复核',
        note: '需以耗课与规则配置为准',
      },
    ],
    growthRecords: [
      {
        period: '近 3 月',
        fillRate: seed.fillRate,
        attendanceRate: seed.attendanceRate,
        privateConversion: seed.privateConversionRate,
        qualityScore: seed.memberFeedbackScore,
        judgment: seed.growthJudgment,
      },
    ],
    leaveRecords:
      seed.riskTags.includes('代课频繁') || seed.riskTags.includes('请假')
        ? [
            {
              id: `lv-${id}-1`,
              type: '代课',
              date: '2026-05-13',
              courseName: seed.mainCourses.split('·')[0]?.trim() ?? '流瑜伽',
              substituteName: 'Mia',
              affectedMembers: 12,
              status: '待审核',
            },
          ]
        : [],
    operationLogs: [
      '2026-05-14 09:00 · 系统 · 生成今日课程清单（前端演示）',
      '2026-05-13 18:20 · 教务 · 标记需核对到课',
    ],
  };
};

export const buildStaffOperationSnapshot = (): StaffOperationSnapshot => {
  const seeds: TeacherSeed[] = [
    {
      teacherId: 'T-1001',
      name: 'Lina',
      phoneMasked: '138****2201',
      avatarText: 'L',
      employmentType: '全职老师',
      roleType: '团课主教',
      teacherLevel: 'T3',
      incomeLevel: 'L2',
      storeName: '万象馆',
      mainCourses: '流瑜伽 · 阴瑜伽',
      courseTypes: ['团课', '小班'],
      monthlySessions: 42,
      monthlyEstimatedPay: 18600,
      pendingPayAmount: 1200,
      groupClassPay: 8200,
      smallClassPay: 3400,
      privateTrainingRevenue: 7000,
      payStatus: '待核',
      fillRate: 88,
      attendanceRate: 91,
      memberFeedbackScore: 4.8,
      privateConversionRate: 12,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '保持满课率，观察私教转化',
      riskTags: [],
      nextAction: '核对本周 2 节待核课时',
      managerName: '王店长',
      academicOwner: '教务 A',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '今日 2 节课，注意 19:00 小班到课核对',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看', '会员练习画像'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '本店 · 本人课程',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1002',
      name: 'Mia',
      phoneMasked: '139****8822',
      avatarText: 'M',
      employmentType: '全职老师',
      roleType: '普拉提主教',
      teacherLevel: 'T4',
      incomeLevel: 'L3',
      storeName: '城西馆',
      mainCourses: '核心床 · 普拉提',
      courseTypes: ['小班', '私教'],
      monthlySessions: 56,
      monthlyEstimatedPay: 26800,
      pendingPayAmount: 0,
      groupClassPay: 6000,
      smallClassPay: 12800,
      privateTrainingRevenue: 8000,
      payStatus: '已确认',
      fillRate: 92,
      attendanceRate: 94,
      memberFeedbackScore: 4.9,
      privateConversionRate: 18,
      growthStatus: '晋级观察',
      growthJudgment: '晋级观察',
      growthNextStep: '系统建议进入 T5 观察，需店长复核',
      riskTags: ['高价值'],
      nextAction: '成长等级复核',
      managerName: '李店长',
      academicOwner: '教务 B',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '满课率优秀，可安排私教体验引流',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看', '会员练习画像', '课后反馈'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '本店 · 本人课程',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1003',
      name: 'Anna',
      phoneMasked: '137****5561',
      avatarText: 'A',
      employmentType: '兼职老师',
      roleType: '团课老师',
      teacherLevel: 'T2',
      incomeLevel: 'L1',
      storeName: '滨江馆',
      mainCourses: '流瑜伽',
      courseTypes: ['团课'],
      monthlySessions: 18,
      monthlyEstimatedPay: 7200,
      pendingPayAmount: 800,
      groupClassPay: 7200,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '待核',
      fillRate: 76,
      attendanceRate: 82,
      memberFeedbackScore: 4.5,
      privateConversionRate: 6,
      growthStatus: '保级风险',
      growthJudgment: '保级风险',
      growthNextStep: '近 3 月满课率偏低，需教务跟进',
      riskTags: ['成长风险'],
      nextAction: '成长保级辅导',
      managerName: '赵店长',
      academicOwner: '教务 A',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '今日 1 节团课，关注预约未满',
      permissionProfile: {
        backendRole: '兼职老师',
        backendScopes: ['课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '本店 · 本人课程',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1004',
      name: 'David',
      phoneMasked: '136****9013',
      avatarText: 'D',
      employmentType: '兼职老师',
      roleType: '私教教练',
      teacherLevel: 'T3',
      incomeLevel: 'L2',
      storeName: '西湖馆',
      mainCourses: '私教 · 功能训练',
      courseTypes: ['私教'],
      monthlySessions: 24,
      monthlyEstimatedPay: 15200,
      pendingPayAmount: 2400,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 15200,
      payStatus: '异常待处理',
      fillRate: 85,
      attendanceRate: 88,
      memberFeedbackScore: 4.7,
      privateConversionRate: 22,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '保持私教复购',
      riskTags: ['课时费待核'],
      nextAction: '核对私教完课 3 节',
      managerName: '周店长',
      academicOwner: '教务 C',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '私教课 2 节，1 节签到需核对',
      permissionProfile: {
        backendRole: '兼职老师',
        backendScopes: ['课程查看', '会员练习画像'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '本店 · 本人课程',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1005',
      name: '王凯',
      phoneMasked: '135****3345',
      avatarText: '王',
      employmentType: '店长兼老师',
      roleType: '店长 · 小班主教',
      teacherLevel: 'T4',
      incomeLevel: 'L3',
      storeName: '万象馆',
      mainCourses: '核心床 · 管理',
      courseTypes: ['小班', '团课'],
      monthlySessions: 28,
      monthlyEstimatedPay: 22000,
      pendingPayAmount: 0,
      groupClassPay: 5000,
      smallClassPay: 9000,
      privateTrainingRevenue: 8000,
      payStatus: '已确认',
      fillRate: 90,
      attendanceRate: 92,
      memberFeedbackScore: 4.8,
      privateConversionRate: 15,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '兼顾管理与教学排课',
      riskTags: [],
      nextAction: '复核团队成长 2 人',
      managerName: '总部督导',
      academicOwner: '教务 A',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 管理视图',
      todaySuggestion: '先处理 1 条代课审批',
      permissionProfile: {
        backendRole: '店长兼老师',
        backendScopes: ['本店经营', '排课', '成长复核', '课程查看'],
        teachVisible: [...METEACH_VISIBLE, '本店老师课表摘要'],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['本店经营数据'],
        dataScope: '万象馆全店',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1006',
      name: '林青',
      phoneMasked: '133****7789',
      avatarText: '林',
      employmentType: '纯管理店长',
      roleType: '店长',
      teacherLevel: '—',
      incomeLevel: '—',
      storeName: '城西馆',
      mainCourses: '—',
      courseTypes: [],
      monthlySessions: 0,
      monthlyEstimatedPay: 0,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '—',
      fillRate: 0,
      attendanceRate: 0,
      memberFeedbackScore: 0,
      privateConversionRate: 0,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '不参与教学等级评定',
      riskTags: [],
      nextAction: '审批请假 1 条',
      managerName: '总部督导',
      academicOwner: '—',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: '无老师端课表',
      todaySuggestion: '关注本店代课与成长复核',
      permissionProfile: {
        backendRole: '纯管理店长',
        backendScopes: ['本店经营', '排课', '成长复核', '员工管理'],
        teachVisible: ['教学任务（管理）'],
        teachHidden: [...METEACH_HIDDEN, '个人课时收入明细'],
        sensitiveFlags: ['本店经营数据', '员工权限'],
        dataScope: '城西馆全店',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1007',
      name: '陈宁',
      phoneMasked: '132****6612',
      avatarText: '陈',
      employmentType: '销售型店长',
      roleType: '店长 · 顾问',
      teacherLevel: 'T2',
      incomeLevel: 'L1',
      storeName: '滨江馆',
      mainCourses: '体验课 · 销售',
      courseTypes: ['私教', '团课'],
      monthlySessions: 12,
      monthlyEstimatedPay: 9800,
      pendingPayAmount: 0,
      groupClassPay: 2800,
      smallClassPay: 0,
      privateTrainingRevenue: 7000,
      payStatus: '已确认',
      fillRate: 80,
      attendanceRate: 85,
      memberFeedbackScore: 4.6,
      privateConversionRate: 28,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '销售与教学并行，控制排课负荷',
      riskTags: [],
      nextAction: '跟进体验课转化',
      managerName: '总部督导',
      academicOwner: '教务 B',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '下午体验私教 1 节',
      permissionProfile: {
        backendRole: '销售型店长',
        backendScopes: ['本店经营', '销售订单查看', '课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['销售数据'],
        dataScope: '滨江馆全店',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1008',
      name: 'Sara',
      phoneMasked: '131****2290',
      avatarText: 'S',
      employmentType: '导师',
      roleType: '导师 P1',
      teacherLevel: 'P1',
      incomeLevel: 'L3',
      storeName: '云谷馆',
      mainCourses: '教培 · 流瑜伽',
      courseTypes: ['教培', '团课'],
      monthlySessions: 20,
      monthlyEstimatedPay: 24000,
      pendingPayAmount: 0,
      groupClassPay: 4000,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '已确认',
      fillRate: 95,
      attendanceRate: 96,
      memberFeedbackScore: 4.9,
      privateConversionRate: 8,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '导师线观察 P2',
      riskTags: ['高价值'],
      nextAction: '教培班级反馈复盘',
      managerName: '孙店长',
      academicOwner: '教培负责人',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 导师版',
      todaySuggestion: '教培模块 1 场，注意课后作业跟进',
      permissionProfile: {
        backendRole: '导师',
        backendScopes: ['教培课程', '学员档案', '课程查看'],
        teachVisible: [...METEACH_VISIBLE, '教培任务'],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['教培合同摘要'],
        dataScope: '云谷馆 · 教培项目',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1009',
      name: 'Tom',
      phoneMasked: '130****1189',
      avatarText: 'T',
      employmentType: '导师',
      roleType: '导师 P2',
      teacherLevel: 'P2',
      incomeLevel: 'L3',
      storeName: '万象馆',
      mainCourses: '普拉提教培',
      courseTypes: ['教培', '小班'],
      monthlySessions: 16,
      monthlyEstimatedPay: 28000,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 6000,
      privateTrainingRevenue: 0,
      payStatus: '已确认',
      fillRate: 93,
      attendanceRate: 95,
      memberFeedbackScore: 5.0,
      privateConversionRate: 10,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '维持导师口碑',
      riskTags: ['高价值'],
      nextAction: '—',
      managerName: '王店长',
      academicOwner: '教培负责人',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 导师版',
      todaySuggestion: '无课日，可处理教培备课',
      permissionProfile: {
        backendRole: '导师',
        backendScopes: ['教培课程', '导师审核建议'],
        teachVisible: [...METEACH_VISIBLE, '教培任务'],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '全馆教培',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1010',
      name: 'Leo',
      phoneMasked: '189****4401',
      avatarText: 'L',
      employmentType: '管培生',
      roleType: '管培老师',
      teacherLevel: 'T1',
      incomeLevel: 'L0',
      storeName: '西湖馆',
      mainCourses: '流瑜伽 · 辅助',
      courseTypes: ['团课'],
      monthlySessions: 14,
      monthlyEstimatedPay: 5600,
      pendingPayAmount: 600,
      groupClassPay: 5600,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '待核',
      fillRate: 68,
      attendanceRate: 75,
      memberFeedbackScore: 4.2,
      privateConversionRate: 4,
      growthStatus: '晋级观察',
      growthJudgment: '晋级观察',
      growthNextStep: '完成带教 20 节后评估 T2',
      riskTags: ['新老师'],
      nextAction: '安排带教复盘',
      managerName: '周店长',
      academicOwner: '教务 C',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '跟课 1 节，勿独立签代',
      permissionProfile: {
        backendRole: '管培生',
        backendScopes: ['课程查看（受限）'],
        teachVisible: ['自己课程', '教学任务', '成长等级摘要'],
        teachHidden: [...METEACH_HIDDEN, '收入预估明细'],
        sensitiveFlags: [],
        dataScope: '西湖馆 · 本人',
        status: '试用期',
      },
    },
    {
      teacherId: 'T-1011',
      name: 'Anthony',
      phoneMasked: '188****3302',
      avatarText: 'A',
      employmentType: '全职老师',
      roleType: '团课老师',
      teacherLevel: 'T3',
      incomeLevel: 'L2',
      storeName: '滨江馆',
      mainCourses: '阿斯汤加',
      courseTypes: ['团课'],
      monthlySessions: 38,
      monthlyEstimatedPay: 15800,
      pendingPayAmount: 900,
      groupClassPay: 15800,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '待核',
      fillRate: 86,
      attendanceRate: 89,
      memberFeedbackScore: 4.7,
      privateConversionRate: 9,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '—',
      riskTags: [],
      nextAction: '—',
      managerName: '赵店长',
      academicOwner: '教务 B',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '晚间大课注意迟到核对',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看', '会员练习画像'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '滨江馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1012',
      name: 'Jessie',
      phoneMasked: '186****9901',
      avatarText: 'J',
      employmentType: '全职老师',
      roleType: '小班主教',
      teacherLevel: 'T4',
      incomeLevel: 'L2',
      storeName: '云谷馆',
      mainCourses: '阴瑜伽 · 疗愈',
      courseTypes: ['团课', '小班'],
      monthlySessions: 44,
      monthlyEstimatedPay: 19200,
      pendingPayAmount: 0,
      groupClassPay: 9000,
      smallClassPay: 5200,
      privateTrainingRevenue: 5000,
      payStatus: '已确认',
      fillRate: 91,
      attendanceRate: 93,
      memberFeedbackScore: 4.9,
      privateConversionRate: 14,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '—',
      riskTags: ['高价值'],
      nextAction: '—',
      managerName: '孙店长',
      academicOwner: '教务 A',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '会员反馈待跟进 1 条',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看', '课后反馈'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '云谷馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1013',
      name: 'Dennis',
      phoneMasked: '158****1122',
      avatarText: 'D',
      employmentType: '兼职老师',
      roleType: '代课老师',
      teacherLevel: 'T2',
      incomeLevel: 'L1',
      storeName: '万象馆',
      mainCourses: '流瑜伽',
      courseTypes: ['团课'],
      monthlySessions: 10,
      monthlyEstimatedPay: 4200,
      pendingPayAmount: 0,
      groupClassPay: 4200,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '已确认',
      fillRate: 72,
      attendanceRate: 78,
      memberFeedbackScore: 4.4,
      privateConversionRate: 5,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '代课为主，不参与晋级',
      riskTags: ['代课频繁'],
      nextAction: '核对本周代课 3 节',
      managerName: '王店长',
      academicOwner: '教务 A',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '代课 1 节，核对原老师请假单',
      permissionProfile: {
        backendRole: '兼职老师',
        backendScopes: ['课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '万象馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1014',
      name: 'Dong',
      phoneMasked: '157****2233',
      avatarText: 'D',
      employmentType: '全职老师',
      roleType: '私教教练',
      teacherLevel: 'T5',
      incomeLevel: 'L3',
      storeName: '城西馆',
      mainCourses: '私教 · 康复',
      courseTypes: ['私教'],
      monthlySessions: 48,
      monthlyEstimatedPay: 32000,
      pendingPayAmount: 1800,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 32000,
      payStatus: '待财务复核',
      fillRate: 94,
      attendanceRate: 96,
      memberFeedbackScore: 5.0,
      privateConversionRate: 25,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '维持 T5 私教口碑',
      riskTags: ['高价值', '课时费待核'],
      nextAction: '核对私教耗课 2 节',
      managerName: '李店长',
      academicOwner: '教务 B',
      financeOwner: '财务 B',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '高价值私教日，注意课后反馈',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看', '会员练习画像', '课后反馈'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '城西馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1015',
      name: 'Hedy',
      phoneMasked: '156****3344',
      avatarText: 'H',
      employmentType: '全职老师',
      roleType: '团课老师',
      teacherLevel: 'T2',
      incomeLevel: 'L1',
      storeName: '滨江馆',
      mainCourses: '燃脂瑜伽',
      courseTypes: ['团课'],
      monthlySessions: 32,
      monthlyEstimatedPay: 12800,
      pendingPayAmount: 1100,
      groupClassPay: 12800,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '待核',
      fillRate: 79,
      attendanceRate: 84,
      memberFeedbackScore: 4.5,
      privateConversionRate: 7,
      growthStatus: '降级预警',
      growthJudgment: '降级预警',
      growthNextStep: '系统建议观察 T1，需店长复核',
      riskTags: ['成长风险'],
      nextAction: '成长降级预警面谈',
      managerName: '赵店长',
      academicOwner: '教务 B',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '关注满课率与课后评分',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '滨江馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1016',
      name: 'Ella',
      phoneMasked: '155****4455',
      avatarText: 'E',
      employmentType: '兼职老师',
      roleType: '小班老师',
      teacherLevel: 'T3',
      incomeLevel: 'L2',
      storeName: '西湖馆',
      mainCourses: '核心床',
      courseTypes: ['小班'],
      monthlySessions: 22,
      monthlyEstimatedPay: 11200,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 11200,
      privateTrainingRevenue: 0,
      payStatus: '已确认',
      fillRate: 87,
      attendanceRate: 90,
      memberFeedbackScore: 4.8,
      privateConversionRate: 11,
      growthStatus: '保级稳定',
      growthJudgment: '保级稳定',
      growthNextStep: '—',
      riskTags: [],
      nextAction: '—',
      managerName: '周店长',
      academicOwner: '教务 C',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '小班课 1 节',
      permissionProfile: {
        backendRole: '兼职老师',
        backendScopes: ['课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '西湖馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1017',
      name: 'Kay',
      phoneMasked: '153****5566',
      avatarText: 'K',
      employmentType: '全职老师',
      roleType: '团课老师',
      teacherLevel: 'T1',
      incomeLevel: 'L0',
      storeName: '云谷馆',
      mainCourses: '基础流瑜伽',
      courseTypes: ['团课'],
      monthlySessions: 16,
      monthlyEstimatedPay: 6400,
      pendingPayAmount: 400,
      groupClassPay: 6400,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '待核',
      fillRate: 70,
      attendanceRate: 76,
      memberFeedbackScore: 4.3,
      privateConversionRate: 5,
      growthStatus: '晋级观察',
      growthJudgment: '晋级观察',
      growthNextStep: '新老师保护期，观察 3 个月',
      riskTags: ['新老师'],
      nextAction: '—',
      managerName: '孙店长',
      academicOwner: '教务 A',
      financeOwner: '财务 A',
      status: '在岗',
      meteachLabel: 'METeach 已开通',
      todaySuggestion: '上午团课注意预约提醒',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看'],
        teachVisible: METEACH_VISIBLE,
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: [],
        dataScope: '云谷馆 · 本人',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1018',
      name: 'Joyce',
      phoneMasked: '152****6677',
      avatarText: 'J',
      employmentType: '全职老师',
      roleType: '团课老师',
      teacherLevel: 'T3',
      incomeLevel: 'L2',
      storeName: '万象馆',
      mainCourses: '流瑜伽',
      courseTypes: ['团课'],
      monthlySessions: 0,
      monthlyEstimatedPay: 0,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '—',
      fillRate: 0,
      attendanceRate: 0,
      memberFeedbackScore: 0,
      privateConversionRate: 0,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '暂停排课中',
      riskTags: ['暂停排课', '请假'],
      nextAction: '复工后排课评估',
      managerName: '王店长',
      academicOwner: '教务 A',
      financeOwner: '财务 A',
      status: '暂停排课',
      meteachLabel: 'METeach 只读',
      todaySuggestion: '暂无课程，关注复工日期',
      permissionProfile: {
        backendRole: '全职老师',
        backendScopes: ['课程查看（只读）'],
        teachVisible: ['成长等级摘要', '教学任务'],
        teachHidden: [...METEACH_HIDDEN, '收入预估摘要'],
        sensitiveFlags: [],
        dataScope: '万象馆 · 本人',
        status: '暂停',
      },
    },
    {
      teacherId: 'T-1019',
      name: 'Danae',
      phoneMasked: '151****7788',
      avatarText: 'D',
      employmentType: '教务',
      roleType: '教务 / 前台',
      teacherLevel: '—',
      incomeLevel: '—',
      storeName: '城西馆',
      mainCourses: '—',
      courseTypes: [],
      monthlySessions: 0,
      monthlyEstimatedPay: 0,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '—',
      fillRate: 0,
      attendanceRate: 0,
      memberFeedbackScore: 0,
      privateConversionRate: 0,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '—',
      riskTags: [],
      nextAction: '处理排课异常 1 条',
      managerName: '李店长',
      academicOwner: '—',
      financeOwner: '—',
      status: '在岗',
      meteachLabel: '无老师端',
      todaySuggestion: '协助核对 2 条代课',
      permissionProfile: {
        backendRole: '教务 / 前台',
        backendScopes: ['排课', '会员预约', '请假代课录入'],
        teachVisible: [],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['会员手机号（脱敏）'],
        dataScope: '城西馆运营',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1020',
      name: 'Lucas',
      phoneMasked: '150****8899',
      avatarText: 'L',
      employmentType: '财务',
      roleType: '财务',
      teacherLevel: '—',
      incomeLevel: '—',
      storeName: '总部',
      mainCourses: '—',
      courseTypes: [],
      monthlySessions: 0,
      monthlyEstimatedPay: 0,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '—',
      fillRate: 0,
      attendanceRate: 0,
      memberFeedbackScore: 0,
      privateConversionRate: 0,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '—',
      riskTags: [],
      nextAction: '课时费批量复核',
      managerName: '财务总监',
      academicOwner: '—',
      financeOwner: '—',
      status: '在岗',
      meteachLabel: '无老师端',
      todaySuggestion: '关注 9 条课时费待核',
      permissionProfile: {
        backendRole: '财务',
        backendScopes: ['课时费复核', '支出查看', '报表预览'],
        teachVisible: [],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['财务入账', '工资数据'],
        dataScope: '全部门店财务',
        status: '正常',
      },
    },
    {
      teacherId: 'T-1021',
      name: '总部管理员',
      phoneMasked: '149****0011',
      avatarText: '总',
      employmentType: '总部管理员',
      roleType: '总部管理员',
      teacherLevel: '—',
      incomeLevel: '—',
      storeName: '总部',
      mainCourses: '—',
      courseTypes: [],
      monthlySessions: 0,
      monthlyEstimatedPay: 0,
      pendingPayAmount: 0,
      groupClassPay: 0,
      smallClassPay: 0,
      privateTrainingRevenue: 0,
      payStatus: '—',
      fillRate: 0,
      attendanceRate: 0,
      memberFeedbackScore: 0,
      privateConversionRate: 0,
      growthStatus: '暂不参与',
      growthJudgment: '暂不参与',
      growthNextStep: '—',
      riskTags: [],
      nextAction: '权限变更复核',
      managerName: '—',
      academicOwner: '—',
      financeOwner: '—',
      status: '在岗',
      meteachLabel: '无老师端',
      todaySuggestion: '敏感权限变更 1 条待审',
      permissionProfile: {
        backendRole: '总部管理员',
        backendScopes: ['全站配置', '权限管理', '经营数据'],
        teachVisible: [],
        teachHidden: METEACH_HIDDEN,
        sensitiveFlags: ['全站敏感权限'],
        dataScope: '全部门店',
        status: '正常',
      },
    },
  ];

  const teachers = seeds.map((s, i) => buildTeacher(s, i));

  const todayCourses: StaffTodayCourseRow[] = teachers
    .filter(t => t.monthlySessions > 0 && t.status === '在岗')
    .flatMap(t => {
      const today = t.courseRecords.filter(c => c.date === '2026-05-14').slice(0, 2);
      if (today.length === 0) {
        return [
          {
            id: `tc-${t.id}-0`,
            teacherId: t.id,
            time: '18:30',
            teacherName: t.name,
            courseName: t.mainCourses.split('·')[0]?.trim() ?? '流瑜伽',
            courseType: t.courseTypes[0] ?? '团课',
            storeRoom: `${t.storeName} · 大教室`,
            booked: 10,
            attended: 0,
            status: '待上课',
          },
        ];
      }
      return today.map(c => ({
        id: `tc-${c.id}`,
        teacherId: t.id,
        time: c.time,
        teacherName: t.name,
        courseName: c.courseName,
        courseType: c.courseType,
        storeRoom: `${c.storeName} · ${c.room}`,
        booked: c.booked,
        attended: c.attended,
        status: c.status === '异常' ? '异常' : c.status === '待上课' ? '待上课' : '已完课',
      }));
    });

  const leaveSubstitutes: StaffLeaveSubstituteRow[] = [
    {
      id: 'ls-1',
      teacherId: 'stf-18',
      applyType: '请假',
      teacherName: 'Joyce',
      affectedCourse: '流瑜伽 · 晚间',
      timeRange: '2026-05-14 19:00',
      substituteName: 'Dennis',
      affectedMembers: 14,
      status: '待审核',
    },
    {
      id: 'ls-2',
      teacherId: 'stf-13',
      applyType: '代课',
      teacherName: 'Dennis',
      affectedCourse: '流瑜伽 · 午间',
      timeRange: '2026-05-14 12:00',
      substituteName: '—',
      affectedMembers: 12,
      status: '已通过',
    },
    {
      id: 'ls-3',
      teacherId: 'stf-5',
      applyType: '调课',
      teacherName: '王凯',
      affectedCourse: '核心床小班',
      timeRange: '2026-05-15 10:00',
      substituteName: 'Ella',
      affectedMembers: 6,
      status: '影响排课',
    },
    {
      id: 'ls-4',
      teacherId: 'stf-3',
      applyType: '请假',
      teacherName: 'Anna',
      affectedCourse: '流瑜伽 · 晨课',
      timeRange: '2026-05-16 08:00',
      substituteName: '待指派',
      affectedMembers: 18,
      status: '待补充',
    },
  ];

  const activeTeachers = teachers.filter(
    t => t.status === '在岗' && /老师|导师|管培|店长兼/.test(t.employmentType),
  );
  const fullTime = teachers.filter(t => t.employmentType === '全职老师').length;
  const partTime = teachers.filter(t => t.employmentType === '兼职老师').length;
  const mentors = teachers.filter(t => t.employmentType === '导师').length;
  const todayTeacherIds = new Set(todayCourses.map(c => c.teacherId));
  const pendingPay = teachers.filter(t => t.pendingPayAmount > 0).length;
  const leaveCount = leaveSubstitutes.length;
  const growthRisk = teachers.filter(t => /风险|预警|观察/.test(t.growthStatus)).length;
  const highValue = teachers.filter(t => t.riskTags.includes('高价值')).length;

  const metrics: StaffMetricItem[] = [
    {
      id: 'sm1',
      label: '在岗老师',
      value: formatStaffCount(activeTeachers.length),
      hint: `全职 ${fullTime} / 兼职 ${partTime} / 导师 ${mentors}`,
    },
    {
      id: 'sm2',
      label: '今日有课',
      value: formatStaffCount(todayTeacherIds.size),
      hint: '团课 / 小班 / 私教',
    },
    {
      id: 'sm3',
      label: '课时费待核',
      value: `${pendingPay} 条`,
      hint: '待确认 / 异常',
      tone: 'amber',
    },
    {
      id: 'sm4',
      label: '请假代课',
      value: `${leaveCount} 项`,
      hint: '请假 / 代课 / 调课',
      tone: 'amber',
    },
    {
      id: 'sm5',
      label: '成长风险',
      value: formatStaffCount(growthRisk),
      hint: '保级 / 降级 / 晋级待审',
      tone: 'rose',
    },
    {
      id: 'sm6',
      label: '高价值老师',
      value: formatStaffCount(highValue),
      hint: '满课率 / 复购 / 私教转化',
    },
  ];

  const insights: StaffInsightTip[] = [
    {
      id: 'si1',
      tag: '课时费待核',
      line: '本周 9 条课时费未确认，建议先核对完课记录',
      actionLabel: '去核对',
      actionKey: 'payIncome',
    },
    {
      id: 'si2',
      tag: '成长复核',
      line: '6 位老师进入保级 / 晋级观察，建议店长复核',
      actionLabel: '去复核',
      actionKey: 'growth',
    },
    {
      id: 'si3',
      tag: '代课异常',
      line: '2 位老师本周代课频繁，需核对排课稳定性',
      actionLabel: '查看',
      actionKey: 'leaveSubstitute',
    },
    {
      id: 'si4',
      tag: '教学反馈',
      line: '3 位老师出现课后反馈待跟进，建议教务查看',
      actionLabel: '查看',
      actionKey: 'profiles',
    },
  ];

  const actionQueue: StaffActionItem[] = [
    {
      id: 'sa-1',
      group: 'courseExecution',
      teacherId: 'stf-4',
      title: 'David · 私教',
      statusLabel: '签到需核对',
      riskLine: '私教课签到异常，后台不代签到，需教务核对',
      evidenceChain: ['课程', '签到', '完课', '课时费'],
      openTab: 'courses',
    },
    {
      id: 'sa-2',
      group: 'courseExecution',
      teacherId: 'stf-11',
      title: 'Anthony · 阿斯汤加',
      statusLabel: '迟到风险',
      riskLine: '今日晚间大课存在迟到记录，需核对',
      evidenceChain: ['课程', '执行', '异常'],
      openTab: 'courses',
    },
    {
      id: 'sa-3',
      group: 'payPending',
      teacherId: 'stf-14',
      title: 'Dong · 私教',
      statusLabel: '待财务复核',
      riskLine: '私教课时费预估待核，不以排课为准',
      evidenceChain: ['完课', '签到', '耗课', '课时费'],
      openTab: 'pay',
    },
    {
      id: 'sa-4',
      group: 'payPending',
      teacherId: 'stf-1',
      title: 'Lina · 流瑜伽',
      statusLabel: '待核',
      riskLine: '团课 2 节完课记录待确认课时费',
      evidenceChain: ['课程', '完课', '课时费'],
      openTab: 'pay',
    },
    {
      id: 'sa-5',
      group: 'growthReview',
      teacherId: 'stf-15',
      title: 'Hedy · 燃脂瑜伽',
      statusLabel: '降级预警',
      riskLine: '系统建议观察降级，需店长复核（仅前端演示）',
      evidenceChain: ['成长', '满课率', '反馈'],
      openTab: 'growth',
    },
    {
      id: 'sa-6',
      group: 'growthReview',
      teacherId: 'stf-2',
      title: 'Mia · 普拉提',
      statusLabel: '晋级观察',
      riskLine: '系统建议 T5 晋级观察，需店长复核',
      evidenceChain: ['成长', '教学', '转化'],
      openTab: 'growth',
    },
    {
      id: 'sa-7',
      group: 'leaveSubstitute',
      teacherId: 'stf-18',
      title: 'Joyce · 请假',
      statusLabel: '待审核',
      riskLine: '请假影响晚间团课，需安排代课',
      evidenceChain: ['请假', '排课', '会员'],
      openTab: 'leave',
    },
    {
      id: 'sa-8',
      group: 'leaveSubstitute',
      teacherId: 'stf-13',
      title: 'Dennis · 代课',
      statusLabel: '代课频繁',
      riskLine: '本周代课 3 节，需核对排课稳定性',
      evidenceChain: ['代课', '课程', '执行'],
      openTab: 'leave',
    },
  ];

  return { teachers, todayCourses, leaveSubstitutes, metrics, insights, actionQueue };
};

export const findStaffTeacher = (s: StaffOperationSnapshot, id: string) =>
  s.teachers.find(t => t.id === id);

export const filterStaffTeachers = (
  teachers: StaffTeacherRow[],
  filters: StaffListFilters,
): StaffTeacherRow[] => {
  const q = filters.query.trim().toLowerCase();
  return teachers.filter(t => {
    if (filters.store !== '全部' && t.storeName !== filters.store) return false;
    if (filters.employmentType !== '全部' && t.employmentType !== filters.employmentType) return false;
    if (filters.level !== '全部' && t.teacherLevel !== filters.level) return false;
    if (filters.status !== '全部' && t.status !== filters.status) return false;
    if (filters.risk !== '全部') {
      if (filters.risk === '有风险' && t.riskTags.length === 0) return false;
      if (filters.risk !== '有风险' && !t.riskTags.includes(filters.risk)) return false;
    }
    if (!q) return true;
    const hay = `${t.name} ${t.phoneMasked} ${t.storeName} ${t.teacherLevel} ${t.mainCourses}`.toLowerCase();
    return hay.includes(q);
  });
};

export const computeStaffSegmentMiniSummary = (
  snapshot: StaffOperationSnapshot,
  segment: StaffWorkbenchSegment,
): { label: string; value: string }[] => {
  const { teachers, todayCourses, leaveSubstitutes } = snapshot;
  if (segment === 'profiles') {
    return [
      { label: '在岗', value: formatStaffCount(teachers.filter(t => t.status === '在岗').length) },
      { label: '有风险', value: formatStaffCount(teachers.filter(t => t.riskTags.length > 0).length) },
      { label: '暂停排课', value: formatStaffCount(teachers.filter(t => t.status === '暂停排课').length) },
      { label: '管培 / 新老师', value: formatStaffCount(teachers.filter(t => t.riskTags.includes('新老师') || t.employmentType === '管培生').length) },
    ];
  }
  if (segment === 'todayCourses') {
    return [
      { label: '今日场次', value: `${todayCourses.length} 场` },
      { label: '待上课', value: `${todayCourses.filter(c => c.status === '待上课').length} 场` },
      { label: '异常', value: `${todayCourses.filter(c => c.status === '异常').length} 场` },
      { label: '代课中', value: `${todayCourses.filter(c => c.status === '代课中').length} 场` },
    ];
  }
  if (segment === 'payIncome') {
    const pending = teachers.filter(t => t.pendingPayAmount > 0);
    return [
      { label: '待核条数', value: `${pending.length} 条` },
      { label: '待核金额', value: formatStaffCny(pending.reduce((s, t) => s + t.pendingPayAmount, 0)) },
      { label: '异常', value: `${teachers.filter(t => t.payStatus === '异常待处理').length} 条` },
      { label: '待财务复核', value: `${teachers.filter(t => t.payStatus === '待财务复核').length} 条` },
    ];
  }
  if (segment === 'growth') {
    return [
      { label: '晋级观察', value: formatStaffCount(teachers.filter(t => t.growthStatus === '晋级观察').length) },
      { label: '保级风险', value: formatStaffCount(teachers.filter(t => t.growthStatus === '保级风险').length) },
      { label: '降级预警', value: formatStaffCount(teachers.filter(t => t.growthStatus === '降级预警').length) },
      { label: '待店长复核', value: formatStaffCount(teachers.filter(t => /观察|风险|预警/.test(t.growthStatus)).length) },
    ];
  }
  if (segment === 'leaveSubstitute') {
    return [
      { label: '待审核', value: `${leaveSubstitutes.filter(l => l.status === '待审核').length} 项` },
      { label: '代课', value: `${leaveSubstitutes.filter(l => l.applyType === '代课').length} 项` },
      { label: '影响排课', value: `${leaveSubstitutes.filter(l => /影响/.test(l.status)).length} 项` },
      { label: '影响会员', value: `${leaveSubstitutes.reduce((s, l) => s + l.affectedMembers, 0)} 人` },
    ];
  }
  return [
    { label: '角色类型', value: `${new Set(teachers.map(t => t.permissionProfile.backendRole)).size} 种` },
    { label: '敏感权限', value: `${teachers.filter(t => t.permissionProfile.sensitiveFlags.length > 0).length} 人` },
    { label: 'METeach 开通', value: formatStaffCount(teachers.filter(t => t.meteachLabel.includes('已开通') || t.meteachLabel.includes('导师') || t.meteachLabel.includes('管理')).length) },
    { label: '权限变更', value: '1 条待审' },
  ];
};

export const STAFF_FILTER_OPTIONS = {
  stores: ['全部', ...STORES, '总部'],
  employmentTypes: [
    '全部',
    '全职老师',
    '兼职老师',
    '店长兼老师',
    '纯管理店长',
    '销售型店长',
    '导师',
    '管培生',
    '教务',
    '财务',
    '总部管理员',
  ],
  levels: ['全部', 'T1', 'T2', 'T3', 'T4', 'T5', 'P1', 'P2', 'G1', 'G2', '—'],
  statuses: ['全部', '在岗', '暂停排课'],
  risks: ['全部', '有风险', '高价值', '成长风险', '课时费待核', '代课频繁', '新老师', '请假', '暂停排课'],
};
