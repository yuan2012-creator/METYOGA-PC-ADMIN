import type { ScheduleSessionType } from './researchCenterV2.viewModel';
import { LEAD_STAGES } from './domain/enums';

export type PayMethod = '按天' | '按次' | '按小时' | '固定金额';

export interface ClassroomOption {
  id: string;
  label: string;
  maxCapacity: number;
}

export interface VenueOption {
  id: string;
  label: string;
  classrooms: ClassroomOption[];
}

export interface TeacherPayOption {
  name: string;
  defaultAmount: number;
  payMethod: PayMethod;
  hint: string;
}

export const MOCK_TODAY_ISO = '2026-07-13';

export const COHORT_STATUS_OPTIONS = [
  '草稿',
  '招生中',
  '待锁班',
  '条件锁班',
  '已锁班',
  '待开课',
  '进行中',
  '考试中',
  '待发证',
  '已结业',
  '已取消',
] as const;

export type CohortStatusValue = (typeof COHORT_STATUS_OPTIONS)[number];

export const COMMISSION_PRESETS = [0, 0.03, 0.05, 0.08, 0.1] as const;

export const VENUE_OPTIONS: VenueOption[] = [
  {
    id: 'venue-502',
    label: '502室',
    classrooms: [{ id: 'cls-502-main', label: '502主教室', maxCapacity: 12 }],
  },
  {
    id: 'venue-met',
    label: 'MET YOGA研学中心',
    classrooms: [
      { id: 'cls-yoga', label: '瑜伽教室', maxCapacity: 12 },
      { id: 'cls-pilates', label: '普拉提教室', maxCapacity: 8 },
    ],
  },
];

export const RYT200_COURSE_TEMPLATES = [
  '体式基础',
  '解剖基础',
  '瑜伽哲学',
  '呼吸与冥想',
  '编排方法',
  '教学实践',
  '体能训练',
  '自习复盘',
  '模拟授课',
  '理论考试',
  '实操考试',
  '结业仪式',
  '自定义课程',
] as const;

export const TEACHER_PAY_OPTIONS: TeacherPayOption[] = [
  { name: '大鹏', defaultAmount: 2000, payMethod: '按天', hint: '2,000元/天' },
  { name: 'JOYCE', defaultAmount: 2000, payMethod: '按天', hint: '2,000元/天' },
  { name: '一丹', defaultAmount: 1600, payMethod: '按天', hint: '1,600元/天' },
  { name: '董董', defaultAmount: 1200, payMethod: '按天', hint: '1,200元/天' },
  { name: '科科', defaultAmount: 1000, payMethod: '按天', hint: '1,000元/天' },
  { name: '锐霖', defaultAmount: 100, payMethod: '按次', hint: '100元/次' },
  { name: '菜菜', defaultAmount: 1600, payMethod: '按天', hint: '1,600元/天' },
];

export const RECRUITMENT_STAFF_OPTIONS = [
  { value: '待指定', label: '待指定', hint: '尚未指定负责人' },
  { value: '芳芳', label: '芳芳', hint: '研学顾问 · 研学中心' },
  { value: '张明', label: '张明', hint: '招生主管 · 研学中心' },
  { value: '李悦', label: '李悦', hint: '研学顾问 · 总部' },
  { value: '王珊', label: '王珊', hint: '招生经理 · 门店运营' },
];

export const LEAD_STAGE_OPTIONS = LEAD_STAGES;

export const INTENT_LEVEL_OPTIONS = [
  { value: '高', label: '高意向' },
  { value: '中', label: '中意向' },
  { value: '低', label: '低意向' },
] as const;

export const FOLLOW_UP_METHOD_OPTIONS = ['微信', '电话', '面谈', '短信', '其他'] as const;

export const SOURCE_CHANNEL_OPTIONS = [
  '老学员推荐',
  '大众点评',
  '小红书',
  '微信朋友圈',
  '线下活动',
  '门店咨询',
  '员工推荐',
  '其他',
] as const;

export const COURSE_OPTIONS = ['RYT200', 'RYT300', 'YACEP', '普拉提导师课', '其他'] as const;

export const PAYMENT_CHANNEL_OPTIONS = ['微信', '支付宝', '银行转账', 'POS', '现金', '分期', '其他'] as const;

export const PAYMENT_STATUS_OPTIONS = ['未付款', '部分付款', '已付清'] as const;

export const CONTRACT_STATUS_OPTIONS = ['未签约', '已签约', '已作废'] as const;

export const INTERVIEW_MODE_OPTIONS = ['线下面试', '视频面试', '电话面试'] as const;

export const INTERVIEW_RESULT_OPTIONS = [
  '通过',
  '有条件通过',
  '建议其他课程',
  '暂不适合',
  '未到场',
] as const;

export const BUDGET_RANGE_OPTIONS = [
  '8,000元以内',
  '8,000–12,000元',
  '12,000–15,000元',
  '15,000元以内',
  '15,000元以上',
  '待确认',
] as const;

export const TRAINING_STAFF_OPTIONS = [
  { value: '大鹏', label: '大鹏', hint: '教培负责人 · 导师' },
  { value: 'JOYCE', label: 'JOYCE', hint: '教学管理 · 导师' },
  { value: '一丹', label: '一丹', hint: '教培管理 · 导师' },
  { value: '董董', label: '董董', hint: '获授权导师' },
  { value: '教培负责人', label: '教培负责人', hint: '默认面试官' },
];

export const PAY_METHOD_OPTIONS: PayMethod[] = ['按天', '按次', '按小时', '固定金额'];

export function defaultCalcPayForSession(type: ScheduleSessionType): boolean {
  if (type === '自习' || type === '考试' || type === '结业') return false;
  if (type === '实践') return true;
  return true;
}

export function findVenueByLabel(label: string): VenueOption | undefined {
  return VENUE_OPTIONS.find(v => v.label === label);
}

export function findClassroom(venueLabel: string, classroomLabel: string): ClassroomOption | undefined {
  return findVenueByLabel(venueLabel)?.classrooms.find(c => c.label === classroomLabel);
}

export function getClassroomOptions(venueLabel: string) {
  const venue = findVenueByLabel(venueLabel);
  return venue?.classrooms.map(c => ({ value: c.label, label: c.label })) ?? [];
}

export function getVenueSelectOptions() {
  return VENUE_OPTIONS.map(v => ({ value: v.label, label: v.label }));
}

export function getTeacherSelectOptions() {
  return TEACHER_PAY_OPTIONS.map(t => ({
    value: t.name,
    label: t.name,
    hint: t.hint,
  }));
}

export function getTeacherPay(name: string): TeacherPayOption | undefined {
  return TEACHER_PAY_OPTIONS.find(t => t.name === name);
}

export function formatDateDisplay(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

export function formatDateShort(iso: string): string {
  if (!iso) return '—';
  const [, m, d] = iso.split('-').map(Number);
  return `${m}月${d}日`;
}

export function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildAutoCohortTitle(productName: string, startDateIso: string): string {
  return `${productName}｜${formatDateDisplay(startDateIso)}班`;
}
