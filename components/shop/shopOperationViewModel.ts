/** 门店管理模块局部 demo 数据 */

import { formatShopCny } from './shopFormatters';

export type ShopSegment =
  | 'stores'
  | 'rooms'
  | 'hours'
  | 'staff'
  | 'courseTypes'
  | 'costs'
  | 'quality';

export type ShopEntityType =
  | 'store'
  | 'room'
  | 'hours'
  | 'staff'
  | 'courseType'
  | 'cost'
  | 'quality';

export type ShopActionGroup =
  | 'capacity'
  | 'hoursGap'
  | 'qualityPending'
  | 'costRisk';

export interface ShopListFilters {
  query: string;
  status: string;
  storeType: string;
  risk: string;
  region: string;
}

export const DEFAULT_SHOP_FILTERS: ShopListFilters = {
  query: '',
  status: '全部',
  storeType: '全部',
  risk: '全部',
  region: '全部',
};

export const SHOP_FILTER_OPTIONS = {
  statuses: ['全部', '运营中', '筹备中', '暂停运营', '待整改', '正常'],
  storeTypes: ['全部', '直营门店', '授权门店', '筹备门店', '暂停运营'],
  risks: ['全部', '低', '中', '高'],
  regions: ['全部', '滨江', '城西', '西湖', '万象', '云谷', '宝龙'],
};

export const SHOP_WORKBENCH_SEGMENTS: { id: ShopSegment; label: string }[] = [
  { id: 'stores', label: '门店列表' },
  { id: 'rooms', label: '教室 / 房间' },
  { id: 'hours', label: '营业时间' },
  { id: 'staff', label: '员工归属' },
  { id: 'courseTypes', label: '课程类型' },
  { id: 'costs', label: '成本结构' },
  { id: 'quality', label: '质检与状态' },
];

export const SHOP_SEGMENT_HINTS: Record<ShopSegment, string> = {
  stores: '门店资料、运营状态与今日经营简况',
  rooms: '教室容量、使用率与可排课程',
  hours: '营业时段、节假日与可排课窗口',
  staff: '店长、老师、管家等员工归属与权限',
  courseTypes: '门店可排课程类型与教室匹配',
  costs: '租金、人工等固定成本与经营压力',
  quality: '环境卫生、设备、接待等质检记录',
};

export interface ShopMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface ShopInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface ShopStoreRecord {
  id: string;
  segment: 'stores';
  storeName: string;
  storeType: string;
  status: string;
  region: string;
  manager: string;
  todayCourses: number;
  todayBookings: number;
  riskLevel: string;
}

export interface ShopRoomRecord {
  id: string;
  segment: 'rooms';
  roomName: string;
  storeName: string;
  roomType: string;
  capacity: number;
  courseTypes: string;
  todayUsage: string;
  status: string;
  riskLevel: string;
}

export interface ShopBusinessHourRecord {
  id: string;
  segment: 'hours';
  storeName: string;
  dayType: string;
  businessHours: string;
  earliestClass: string;
  latestClass: string;
  holidayRule: string;
  status: string;
}

export interface ShopStaffAssignmentRecord {
  id: string;
  segment: 'staff';
  staffName: string;
  role: string;
  primaryStore: string;
  crossStores: string;
  todayShift: string;
  permScope: string;
  status: string;
}

export interface ShopCourseTypeRecord {
  id: string;
  segment: 'courseTypes';
  storeName: string;
  courseType: string;
  availableRooms: string;
  defaultCapacity: number;
  teachers: string;
  applicableCards: string;
  status: string;
}

export interface ShopCostRecord {
  id: string;
  segment: 'costs';
  storeName: string;
  rent: number;
  propertyFee: number;
  laborCost: number;
  otherFixed: number;
  totalFixed: number;
  costRisk: string;
}

export interface ShopQualityRecord {
  id: string;
  segment: 'quality';
  recordNo: string;
  storeName: string;
  qualityType: string;
  issueSummary: string;
  owner: string;
  deadline: string;
  status: string;
  riskLevel: string;
}

export type ShopTableRow =
  | ShopStoreRecord
  | ShopRoomRecord
  | ShopBusinessHourRecord
  | ShopStaffAssignmentRecord
  | ShopCourseTypeRecord
  | ShopCostRecord
  | ShopQualityRecord;

export interface ShopActionItem {
  id: string;
  group: ShopActionGroup;
  entityType: ShopEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  riskLine: string;
  evidenceChain: string[];
  openTab?: ShopDetailTabId;
}

export type ShopDetailTabId =
  | 'overview'
  | 'capacity'
  | 'schedule'
  | 'staff'
  | 'cost'
  | 'quality';

export interface ShopJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface ShopRoomBrief {
  name: string;
  type: string;
  capacity: number;
  usage: string;
}

export interface ShopDetailRecord {
  id: string;
  entityType: ShopEntityType;
  segment: ShopSegment;
  title: string;
  subtitle: string;
  storeType: string;
  status: string;
  region: string;
  riskLevel: string;
  affectsScheduling: boolean;
  todaySuggestion: string;
  judgment: ShopJudgment;
  storeName: string;
  manager: string;
  todayCourses: number;
  todayBookings: number;
  todayAttendance: number;
  currentRisks: string[];
  rooms: ShopRoomBrief[];
  peakUsage: string;
  capacityRisk: string;
  businessHours: string;
  classWindow: string;
  holidayRules: string;
  closureNotes: string;
  scheduleImpact: string;
  staffSummary: { role: string; count: number }[];
  crossStorePerm: string;
  permissionBoundaries: string[];
  rent: number;
  propertyFee: number;
  laborCost: number;
  otherFixed: number;
  totalFixed: number;
  dailyBreakEven: string;
  capacityEstimate: string;
  costRisk: string;
  qualityRecords: { no: string; type: string; status: string }[];
  qualityOwner: string;
  qualityDeadline: string;
  handleSteps: string[];
  operationLogs: string[];
  evidenceChain: string[];
}

export interface ShopOperationSnapshot {
  metrics: ShopMetric[];
  insights: ShopInsight[];
  stores: ShopStoreRecord[];
  rooms: ShopRoomRecord[];
  hours: ShopBusinessHourRecord[];
  staff: ShopStaffAssignmentRecord[];
  courseTypes: ShopCourseTypeRecord[];
  costs: ShopCostRecord[];
  quality: ShopQualityRecord[];
  details: ShopDetailRecord[];
  actionQueue: ShopActionItem[];
}

const STORE_DEFS = [
  { name: '万象馆', type: '直营门店', status: '运营中', region: '万象', manager: '张店长' },
  { name: '城西馆', type: '直营门店', status: '运营中', region: '城西', manager: '李店长' },
  { name: '滨江馆', type: '直营门店', status: '运营中', region: '滨江', manager: '王店长' },
  { name: '西湖馆', type: '授权门店', status: '运营中', region: '西湖', manager: '陈店长' },
  { name: '云谷馆', type: '授权门店', status: '运营中', region: '云谷', manager: '赵店长' },
  { name: '滨江宝龙馆', type: '筹备门店', status: '筹备中', region: '宝龙', manager: '待定' },
];

const ROOM_TYPES = [
  '瑜伽大教室',
  '普拉提小班教室',
  '私教室',
  '核心床教室',
  '凯迪拉克教室',
  '多功能教室',
];

const STAFF_ROLES = ['店长', '老师', '管家', '教务', '前台', '财务协同', '兼职老师'];
const COURSE_TYPES = ['团课', '小班', '私教', '教培', '活动课'];
const QUALITY_TYPES = [
  '环境卫生',
  '教室设备',
  '前台接待',
  '老师执行',
  '合同物料',
  '品牌视觉',
  '会员投诉',
  '安全隐患',
];
const DAY_TYPES = ['工作日', '周末', '节假日', '特殊闭馆'];

const permBoundaries = [
  '店长只能看本门店经营与会员，不默认查看全公司财务。',
  '老师只看自己课程、排课、课后反馈和被授权的会员练习信息。',
  '财务看成本与结算，不默认修改门店规则。',
  '总部可配置门店规则，敏感修改需留痕（前端演示）。',
];

const mkJudgment = (status: string, risk: string): ShopJudgment => ({
  summary:
    status.includes('筹备') || status.includes('待')
      ? '门店经营资产存在待补齐项，可能影响排课与测算'
      : risk === '高'
        ? '容量或成本压力偏高，建议优先复核排课产能'
        : '门店经营资产状态正常，建议按周期巡检',
  stuck: status.includes('筹备') ? '筹备资料未齐' : risk === '高' ? '风险项待处理' : '—',
  nextStep: '按建议动作复核，需审批后执行（前端演示）',
});

const buildDetails = (
  stores: ShopStoreRecord[],
  rooms: ShopRoomRecord[],
  costs: ShopCostRecord[],
  quality: ShopQualityRecord[],
): ShopDetailRecord[] => {
  const storeDetails: ShopDetailRecord[] = stores.map(s => {
    const storeRooms = rooms.filter(r => r.storeName === s.storeName);
    const cost = costs.find(c => c.storeName === s.storeName);
    const q = quality.filter(qr => qr.storeName === s.storeName);
    return {
      id: s.id,
      entityType: 'store',
      segment: 'stores',
      title: s.storeName,
      subtitle: `${s.storeType} · ${s.status} · ${s.region}`,
      storeType: s.storeType,
      status: s.status,
      region: s.region,
      riskLevel: s.riskLevel,
      affectsScheduling: s.status !== '筹备中',
      todaySuggestion: `关注 ${s.storeName} 今日 ${s.todayCourses} 节课与 ${s.todayBookings} 个预约的容量匹配`,
      judgment: mkJudgment(s.status, s.riskLevel),
      storeName: s.storeName,
      manager: s.manager,
      todayCourses: s.todayCourses,
      todayBookings: s.todayBookings,
      todayAttendance: Math.round(s.todayBookings * 0.82),
      currentRisks: s.riskLevel === '高' ? ['晚高峰容量偏紧', '成本占比需复核'] : ['—'],
      rooms: storeRooms.map(r => ({
        name: r.roomName,
        type: r.roomType,
        capacity: r.capacity,
        usage: r.todayUsage,
      })),
      peakUsage: storeRooms.some(r => parseInt(r.todayUsage) > 85) ? '晚高峰 > 85%' : '正常',
      capacityRisk: storeRooms.some(r => parseInt(r.todayUsage) > 85) ? '2 间教室利用率偏高' : '—',
      businessHours: '09:00 – 22:00',
      classWindow: '09:30 – 21:30',
      holidayRules: s.storeName === '滨江馆' ? '节假日待补齐' : '已配置',
      closureNotes: '—',
      scheduleImpact: '影响课程预约、取消与通知口径',
      staffSummary: [
        { role: '店长', count: 1 },
        { role: '老师', count: 8 },
        { role: '管家', count: 3 },
      ],
      crossStorePerm: s.storeType === '授权门店' ? '限本馆' : '可跨店排课',
      permissionBoundaries: permBoundaries,
      rent: cost?.rent ?? 0,
      propertyFee: cost?.propertyFee ?? 0,
      laborCost: cost?.laborCost ?? 0,
      otherFixed: cost?.otherFixed ?? 0,
      totalFixed: cost?.totalFixed ?? 0,
      dailyBreakEven: cost ? formatShopCny(Math.round(cost.totalFixed / 30)) : '—',
      capacityEstimate: `${storeRooms.reduce((n, r) => n + r.capacity, 0)} 人次/日`,
      costRisk: cost?.costRisk ?? '—',
      qualityRecords: q.map(qr => ({ no: qr.recordNo, type: qr.qualityType, status: qr.status })),
      qualityOwner: q[0]?.owner ?? '—',
      qualityDeadline: q[0]?.deadline ?? '—',
      handleSteps: ['核对教室容量', '补齐营业时间', '跟进质检整改'],
      operationLogs: ['2026-05-14 · 系统 · 门店配置预览（前端演示）'],
      evidenceChain: ['门店', '教室', '排课', '预约'],
    };
  });

  const roomDetails: ShopDetailRecord[] = rooms.map(r => {
    const store = stores.find(s => s.storeName === r.storeName)!;
    return {
      ...storeDetails.find(d => d.id === store.id)!,
      id: r.id,
      entityType: 'room',
      segment: 'rooms',
      title: r.roomName,
      subtitle: `${r.storeName} · ${r.roomType} · ${r.status}`,
      todaySuggestion: `今日使用率 ${r.todayUsage}，关注晚高峰排课冲突`,
      judgment: mkJudgment(r.status, r.riskLevel),
      capacityRisk: parseInt(r.todayUsage) > 85 ? '利用率超过 85%' : '—',
      peakUsage: r.todayUsage,
      evidenceChain: ['门店', '教室', '排课', '预约'],
    };
  });

  const qualityDetails: ShopDetailRecord[] = quality.map(q => {
    const store = stores.find(s => s.storeName === q.storeName)!;
    const base = storeDetails.find(d => d.id === store.id)!;
    return {
      ...base,
      id: q.id,
      entityType: 'quality',
      segment: 'quality',
      title: q.recordNo,
      subtitle: `${q.storeName} · ${q.qualityType} · ${q.status}`,
      riskLevel: q.riskLevel,
      todaySuggestion: q.issueSummary,
      qualityOwner: q.owner,
      qualityDeadline: q.deadline,
      handleSteps: ['指派责任人', '限期整改', '总部复核'],
      evidenceChain: ['门店', '质检', '整改', '复核'],
    };
  });

  const costDetails: ShopDetailRecord[] = costs.map(c => {
    const store = stores.find(s => s.storeName === c.storeName)!;
    const base = storeDetails.find(d => d.id === store.id)!;
    return {
      ...base,
      id: c.id,
      entityType: 'cost',
      segment: 'costs',
      title: `${c.storeName} 成本结构`,
      subtitle: `${c.storeName} · 月固定 ${formatShopCny(c.totalFixed)}`,
      costRisk: c.costRisk,
      todaySuggestion: c.costRisk === '偏高' ? '固定成本占比偏高，建议复核排课产能' : '成本结构正常',
      evidenceChain: ['门店', '成本', '排课', '测算'],
    };
  });

  return [...storeDetails, ...roomDetails, ...qualityDetails, ...costDetails];
};

export const buildShopOperationSnapshot = (): ShopOperationSnapshot => {
  const stores: ShopStoreRecord[] = STORE_DEFS.map((s, i) => ({
    id: `shop-store-${i + 1}`,
    segment: 'stores',
    storeName: s.name,
    storeType: s.type,
    status: s.status,
    region: s.region,
    manager: s.manager,
    todayCourses: s.status === '筹备中' ? 0 : [12, 10, 14, 9, 8, 0][i],
    todayBookings: s.status === '筹备中' ? 0 : [86, 72, 95, 58, 44, 0][i],
    riskLevel: i === 2 || i === 5 ? '高' : i === 3 ? '中' : '低',
  }));

  const rooms: ShopRoomRecord[] = Array.from({ length: 18 }, (_, i) => {
    const store = STORE_DEFS[i % 5];
    const type = ROOM_TYPES[i % ROOM_TYPES.length];
    const usage = [72, 88, 65, 91, 55, 78, 83, 60, 45, 70, 86, 58, 74, 62, 90, 68, 52, 77][i];
    return {
      id: `shop-room-${i + 1}`,
      segment: 'rooms',
      roomName: `${type.replace('教室', '')}${(i % 3) + 1}号`,
      storeName: store.name,
      roomType: type,
      capacity: type.includes('私教') ? 2 : type.includes('小班') ? 8 : 20,
      courseTypes: type.includes('私教') ? '私教' : type.includes('小班') ? '小班 / 普拉提' : '团课 / 活动课',
      todayUsage: `${usage}%`,
      status: usage > 85 ? '紧张' : '正常',
      riskLevel: usage > 85 ? '高' : usage > 70 ? '中' : '低',
    };
  });

  const hours: ShopBusinessHourRecord[] = Array.from({ length: 12 }, (_, i) => {
    const store = STORE_DEFS[i % 6];
    const dayType = DAY_TYPES[i % DAY_TYPES.length];
    return {
      id: `shop-hour-${i + 1}`,
      segment: 'hours',
      storeName: store.name,
      dayType,
      businessHours: dayType === '特殊闭馆' ? '闭馆' : '09:00 – 22:00',
      earliestClass: '09:30',
      latestClass: '21:30',
      holidayRule: store.name === '滨江馆' && dayType === '节假日' ? '未配置' : '总部模板',
      status: store.name === '滨江馆' && dayType === '节假日' ? '待补齐' : '正常',
    };
  });

  const staff: ShopStaffAssignmentRecord[] = Array.from({ length: 16 }, (_, i) => ({
    id: `shop-staff-${i + 1}`,
    segment: 'staff',
    staffName: ['张敏', '李悦', '王晨', '陈曦', '赵琳', '刘洋', '周婷', '吴昊'][i % 8] + (i > 7 ? `${i}` : ''),
    role: STAFF_ROLES[i % STAFF_ROLES.length],
    primaryStore: STORE_DEFS[i % 5].name,
    crossStores: i % 4 === 0 ? '城西馆 / 万象馆' : '—',
    todayShift: i % 3 === 0 ? '早班' : i % 3 === 1 ? '晚班' : '全天',
    permScope: STAFF_ROLES[i % STAFF_ROLES.length] === '店长' ? '本店经营' : '本店课程',
    status: '在职',
  }));

  const courseTypes: ShopCourseTypeRecord[] = Array.from({ length: 12 }, (_, i) => ({
    id: `shop-ct-${i + 1}`,
    segment: 'courseTypes',
    storeName: STORE_DEFS[i % 5].name,
    courseType: COURSE_TYPES[i % COURSE_TYPES.length],
    availableRooms: '瑜伽大教室 / 小班教室',
    defaultCapacity: COURSE_TYPES[i % COURSE_TYPES.length] === '私教' ? 1 : 12,
    teachers: '3 位',
    applicableCards: '瑜伽月卡 / 锦鲤卡 Flow',
    status: '已启用',
  }));

  const costs: ShopCostRecord[] = STORE_DEFS.filter(s => s.status !== '筹备中').map((s, i) => {
    const rent = [98000, 86000, 112000, 72000, 68000][i];
    const property = [12000, 10000, 14000, 9000, 8500][i];
    const labor = [185000, 168000, 210000, 142000, 128000][i];
    const other = [18000, 15000, 22000, 12000, 11000][i];
    const total = rent + property + labor + other;
    return {
      id: `shop-cost-${i + 1}`,
      segment: 'costs',
      storeName: s.name,
      rent,
      propertyFee: property,
      laborCost: labor,
      otherFixed: other,
      totalFixed: total,
      costRisk: i === 2 ? '偏高' : '正常',
    };
  });

  const quality: ShopQualityRecord[] = Array.from({ length: 10 }, (_, i) => ({
    id: `shop-qa-${i + 1}`,
    segment: 'quality',
    recordNo: `QA-20260514-${String(i + 1).padStart(3, '0')}`,
    storeName: STORE_DEFS[i % 5].name,
    qualityType: QUALITY_TYPES[i % QUALITY_TYPES.length],
    issueSummary: ['地垫清洁待加强', '核心床螺丝松动', '前台话术不一致', '老师迟到 5 分钟'][i % 4],
    owner: STORE_DEFS[i % 5].manager,
    deadline: `2026-05-${18 + (i % 5)}`,
    status: i < 3 ? '待整改' : i < 6 ? '整改中' : '已复核',
    riskLevel: i < 3 ? '高' : '中',
  }));

  const details = buildDetails(stores, rooms, costs, quality);

  const operatingStores = stores.filter(s => s.status === '运营中').length;
  const totalCapacity = rooms.reduce((n, r) => n + r.capacity, 0);
  const totalStaff = staff.length;
  const totalFixed = costs.reduce((n, c) => n + c.totalFixed, 0);
  const riskCount =
    stores.filter(s => s.riskLevel === '高').length +
    quality.filter(q => q.status === '待整改').length;

  const metrics: ShopMetric[] = [
    {
      id: 'sm1',
      label: '运营门店',
      value: `${operatingStores} 家`,
      hint: '直营 / 授权 / 筹备',
    },
    { id: 'sm2', label: '教室数量', value: `${rooms.length} 间`, hint: '团课 / 小班 / 私教' },
    {
      id: 'sm3',
      label: '今日可用容量',
      value: `${totalCapacity * 4} 人次`,
      hint: '按课表与房间计算',
    },
    {
      id: 'sm4',
      label: '门店员工',
      value: `${totalStaff} 人`,
      hint: '店长 / 老师 / 管家',
    },
    {
      id: 'sm5',
      label: '月固定成本',
      value: formatShopCny(totalFixed),
      hint: '租金 / 人工 / 物业',
      tone: 'amber',
    },
    {
      id: 'sm6',
      label: '门店风险',
      value: `${riskCount} 项`,
      hint: '容量 / 质检 / 成本异常',
      tone: 'rose',
    },
  ];

  const insights: ShopInsight[] = [
    {
      id: 'si1',
      tag: '教室容量不足',
      line: '2 家门店晚高峰教室利用率超过 85%',
      actionLabel: '查看',
      actionKey: 'rooms',
    },
    {
      id: 'si2',
      tag: '营业时间缺失',
      line: '1 家门店节假日营业时间未配置',
      actionLabel: '补齐',
      actionKey: 'hours',
    },
    {
      id: 'si3',
      tag: '成本压力偏高',
      line: '滨江馆固定成本占比偏高，建议复核排课产能',
      actionLabel: '分析',
      actionKey: 'costs',
    },
    {
      id: 'si4',
      tag: '质检待处理',
      line: '3 条门店质检记录尚未完成整改',
      actionLabel: '处理',
      actionKey: 'quality',
    },
  ];

  const actionQueue: ShopActionItem[] = [
    {
      id: 'sq1',
      group: 'capacity',
      entityType: 'room',
      entityId: 'shop-room-2',
      title: '滨江馆 · 普拉提小班 2号',
      statusLabel: '容量紧张',
      riskLine: '晚高峰利用率 88%，可能影响排课',
      evidenceChain: ['门店', '教室', '排课', '预约'],
      openTab: 'capacity',
    },
    {
      id: 'sq2',
      group: 'capacity',
      entityType: 'store',
      entityId: 'shop-store-3',
      title: '滨江馆',
      statusLabel: '排课异常',
      riskLine: '今日预约接近教室上限',
      evidenceChain: ['门店', '教室', '排课', '预约'],
    },
    {
      id: 'sq3',
      group: 'capacity',
      entityType: 'room',
      entityId: 'shop-room-4',
      title: '万象馆 · 瑜伽大教室 1号',
      statusLabel: '利用率 91%',
      riskLine: '建议复核晚高峰排课',
      evidenceChain: ['门店', '教室', '排课', '预约'],
    },
    {
      id: 'sq4',
      group: 'hoursGap',
      entityType: 'hours',
      entityId: 'shop-hour-3',
      title: '滨江馆 · 节假日',
      statusLabel: '待补齐',
      riskLine: '节假日营业时间未配置',
      evidenceChain: ['门店', '营业时间', '课表', '通知'],
      openTab: 'schedule',
    },
    {
      id: 'sq5',
      group: 'hoursGap',
      entityType: 'hours',
      entityId: 'shop-hour-7',
      title: '滨江馆 · 周末',
      statusLabel: '规则缺失',
      riskLine: '影响周末排课窗口',
      evidenceChain: ['门店', '营业时间', '课表', '通知'],
    },
    {
      id: 'sq6',
      group: 'qualityPending',
      entityType: 'quality',
      entityId: 'shop-qa-1',
      title: 'QA-20260514-001',
      statusLabel: '待整改',
      riskLine: '环境卫生问题待处理',
      evidenceChain: ['门店', '质检', '整改', '复核'],
      openTab: 'quality',
    },
    {
      id: 'sq7',
      group: 'qualityPending',
      entityType: 'quality',
      entityId: 'shop-qa-2',
      title: 'QA-20260514-002',
      statusLabel: '待整改',
      riskLine: '核心床设备需检修',
      evidenceChain: ['门店', '质检', '整改', '复核'],
    },
    {
      id: 'sq8',
      group: 'qualityPending',
      entityType: 'quality',
      entityId: 'shop-qa-3',
      title: 'QA-20260514-003',
      statusLabel: '待整改',
      riskLine: '前台接待话术不一致',
      evidenceChain: ['门店', '质检', '整改', '复核'],
    },
    {
      id: 'sq9',
      group: 'costRisk',
      entityType: 'cost',
      entityId: 'shop-cost-3',
      title: '滨江馆成本',
      statusLabel: '成本偏高',
      riskLine: '月固定成本占比偏高',
      evidenceChain: ['门店', '成本', '排课', '测算'],
      openTab: 'cost',
    },
    {
      id: 'sq10',
      group: 'costRisk',
      entityType: 'store',
      entityId: 'shop-store-3',
      title: '滨江馆经营',
      statusLabel: '测算预警',
      riskLine: '排课产能需匹配固定成本',
      evidenceChain: ['门店', '成本', '排课', '测算'],
    },
    {
      id: 'sq11',
      group: 'capacity',
      entityType: 'room',
      entityId: 'shop-room-15',
      title: '西湖馆 · 核心床 1号',
      statusLabel: '利用率 90%',
      riskLine: '小班教室接近满员',
      evidenceChain: ['门店', '教室', '排课', '预约'],
    },
    {
      id: 'sq12',
      group: 'hoursGap',
      entityType: 'store',
      entityId: 'shop-store-6',
      title: '滨江宝龙馆',
      statusLabel: '筹备中',
      riskLine: '营业时间模板待配置',
      evidenceChain: ['门店', '营业时间', '课表', '通知'],
    },
  ];

  return {
    metrics,
    insights,
    stores,
    rooms,
    hours,
    staff,
    courseTypes,
    costs,
    quality,
    details,
    actionQueue,
  };
};

export const findShopDetail = (snapshot: ShopOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getShopRows = (snapshot: ShopOperationSnapshot, segment: ShopSegment): ShopTableRow[] => {
  switch (segment) {
    case 'stores':
      return snapshot.stores;
    case 'rooms':
      return snapshot.rooms;
    case 'hours':
      return snapshot.hours;
    case 'staff':
      return snapshot.staff;
    case 'courseTypes':
      return snapshot.courseTypes;
    case 'costs':
      return snapshot.costs;
    case 'quality':
      return snapshot.quality;
    default:
      return [];
  }
};

export const filterShopRows = (
  rows: ShopTableRow[],
  filters: ShopListFilters,
): ShopTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    const status =
      'status' in row
        ? row.status
        : 'approvalStatus' in row
          ? (row as never).approvalStatus
          : '正常';
    const storeType = 'storeType' in row ? row.storeType : '';
    const risk = 'riskLevel' in row ? row.riskLevel : 'costRisk' in row ? row.costRisk : '低';
    const region = 'region' in row ? row.region : 'storeName' in row ? row.storeName : '';
    if (filters.status !== '全部' && !String(status).includes(filters.status.replace('中', ''))) {
      if (filters.status === '运营中' && status !== '运营中' && status !== '正常' && status !== '在职' && status !== '已启用')
        return false;
      if (filters.status === '筹备中' && !/筹备|待补齐/.test(String(status))) return false;
      if (filters.status === '待整改' && !/待整改|整改中|紧张/.test(String(status))) return false;
    }
    if (filters.storeType !== '全部' && storeType && storeType !== filters.storeType) return false;
    if (filters.risk !== '全部') {
      const riskVal = risk === '偏高' ? '高' : risk;
      if (riskVal !== filters.risk && !(filters.risk === '高' && (riskVal === '偏高' || risk === '高'))) return false;
    }
    if (filters.region !== '全部' && !String(region).includes(filters.region)) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computeShopSegmentMiniSummary = (
  snapshot: ShopOperationSnapshot,
  segment: ShopSegment,
): { label: string; value: string }[] => {
  const rows = getShopRows(snapshot, segment);
  const pending = rows.filter(r => {
    const s = 'status' in r ? r.status : '';
    return /待|筹备|紧张|整改/.test(String(s));
  }).length;
  const high = rows.filter(r => {
    if ('riskLevel' in r) return r.riskLevel === '高';
    if ('costRisk' in r) return r.costRisk === '偏高';
    return false;
  }).length;
  return [
    { label: '本段记录', value: `${rows.length} 条` },
    { label: '待处理', value: `${pending} 条` },
    { label: '高风险', value: `${high} 条` },
    { label: '涉及门店', value: `${new Set(rows.map(r => ('storeName' in r ? r.storeName : (r as ShopStoreRecord).storeName))).size} 家` },
  ];
};
