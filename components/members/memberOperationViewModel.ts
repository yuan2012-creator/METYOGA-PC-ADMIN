/** 会员经营页局部 demo 数据（不接全局 mock / 真实接口） */

import { enrichMember, STAGE_CODES } from './memberDemoBuilders';
import type { MemberAvatarTone } from './memberAvatarUtils';

export type StageCode = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export interface StageMeta {
  stageCode: StageCode;
  stageName: string;
  lifecycleSubStatus: string;
  stageReason: string;
  nextStageTarget: string;
}

export type ClassFrequencyLevel = '高频' | '稳定' | '低频' | '沉睡';

export interface PracticeProfile {
  classFrequencyLevel: ClassFrequencyLevel;
  classFrequencySummary: string;
  preferredCourseTypes: string[];
  preferredTimeSlots: string[];
  preferredStores: string[];
  preferredTeachers: string[];
  exerciseGoal: string;
  attentionNotes: string[];
  habitTags: string[];
  lastCourseName?: string;
  intensityPreference?: string;
  unsuitableContent?: string[];
}

/** PC 后台与 METeach 老师端同源练习档案（由 practiceProfile / serviceTeam 等派生） */
export interface TeacherSyncProfile {
  visibleName: string;
  simplifiedStageLabel: string;
  visiblePracticeGoals: string;
  visibleCoursePreferences: string;
  visibleTimePreferences: string;
  visibleStorePreferences: string;
  visibleTeacherPreferences: string;
  visibleAttentionNotes: string;
  visibleRecentCourseFeedback: string;
  visiblePrivateTrainingGoal: string;
  teacherNotes: string;
  needsAfterClassFeedback: boolean;
  needsButlerFollowUp: boolean;
  visibleClassFrequency: string;
  visibleLastVisit: string;
  lastSyncedAt: string;
  syncSource: '系统生成' | '管家维护' | '老师反馈';
  updatedBy: string;
  syncedFieldCount: number;
  pendingConfirmFieldCount: number;
  lastTeacherFeedbackAt: string;
  suggestButlerFollowUp: boolean;
  suggestPrivateTraining: boolean;
  needsLowerIntensity: boolean;
  needsAfterClassAttention: boolean;
  recentTeacherFeedback: string;
  hiddenFields: string[];
}

export interface CourseRecord {
  id: string;
  courseDate: string;
  courseName: string;
  courseType: '团课' | '小班' | '私教' | '教培';
  teacherName: string;
  storeName: string;
  roomName: string;
  bookingStatus: '已预约' | '已取消' | '候补' | '爽约';
  attendanceStatus: '已到课' | '未到课' | '请假' | '爽约';
  consumedAssetName: string;
  consumedPointsOrTimes: string;
  feedbackNote?: string;
  teacherNote?: string;
}

export interface PrivateTrainingRecord {
  id: string;
  packageName: string;
  coachName: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  lastSessionDate: string;
  nextSuggestedAction: string;
  trainingGoal: string;
  coachAssessment: string;
  conversionStatus: '体验中' | '待成交' | '已成交' | '续费窗口' | '暂停中';
}

export interface PointLedgerItem {
  id: string;
  date: string;
  type: '获得' | '使用' | '过期' | '调整';
  reason: string;
  points: number;
  operator: string;
}

export interface PointsProfile {
  currentPoints: number;
  totalEarnedPoints: number;
  totalUsedPoints: number;
  expiringPoints: number;
  expiringDate?: string;
  latestPointRecords: PointLedgerItem[];
}

export interface OrderRecord {
  orderNo: string;
  productName: string;
  paidAmount: number;
  paidAt: string;
  paymentStatus: string;
  contractStatus: string;
  assetGeneratedStatus: string;
}

export interface ConsumptionRecord {
  id: string;
  date: string;
  courseName: string;
  teacherName: string;
  assetName: string;
  consumedPointsOrTimes: string;
  confirmationStatus: '待确认' | '已确认' | '异常待处理';
}

export interface ConsumptionProfile {
  totalPaidAmount: number;
  totalRefundAmount: number;
  netPaidAmount: number;
  totalConsumedPoints: number;
  totalConsumedTimes: number;
  latestOrders: OrderRecord[];
  latestConsumptionRecords: ConsumptionRecord[];
  hasUnconfirmedConsumption?: boolean;
}

export interface ServiceTeam {
  ownerButler: string;
  storeManager: string;
  mainTeachers: string[];
  privateCoach?: string;
  lastTeacherFeedback: string;
  lastButlerFollowUp: string;
  handoverNotes: string;
  teacherVisibleNotes: string;
  needsPostClassFeedback?: boolean;
  avoidHighIntensity?: boolean;
  hasTeacherNote?: boolean;
}

export type MemberLifecycleStage =
  | '潜客'
  | '体验预约'
  | '体验到课'
  | '体验未成交'
  | '新会员'
  | '活跃会员'
  | '稳定会员'
  | '续费窗口'
  | '沉睡风险'
  | '流失风险'
  | '已流失'
  | '高价值会员';

export type MemberIdentity = '潜客' | '体验期' | '持卡会员';

export type AssetStatus =
  | '生效中'
  | '即将到期'
  | '已过期'
  | '已冻结'
  | '已转出'
  | '已作废'
  | '退款处理中';

export type RiskTagType =
  | '快到期'
  | '即将耗尽'
  | '余额不足'
  | '高余额低到课'
  | '流失风险'
  | '体验未成交'
  | '爽约频繁'
  | '退款风险'
  | '需店长介入'
  | '高价值';

export type SuggestedActionType =
  | '续费提醒'
  | '唤醒跟进'
  | '体验转化跟进'
  | '私教转化'
  | '日常维护'
  | '店长介入'
  | '课程邀约'
  | '成交跟进'
  | '投诉安抚'
  | '风险复核';

export type ActionTaskStatus = '待处理' | '处理中' | '已完成' | '已逾期';

export interface MemberMetricItem {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  hint?: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface MemberInsightItem {
  id: string;
  category: string;
  summary: string;
  countLabel: string;
  action: string;
  actionKey: string;
}

export interface MemberRiskTag {
  type: RiskTagType;
  reason: string;
}

export interface MemberAssetRecord {
  id: string;
  memberId: string;
  name: string;
  assetCode: string;
  category: string;
  sourceOrder: string;
  contractStatus: string;
  remaining: string;
  total: string;
  validUntil: string;
  store: string;
  status: AssetStatus;
  freezeTransferRefund?: string;
  rules?: string;
  usageSummary?: string;
  riskNote?: string;
}

export interface FollowUpRecord {
  id: string;
  at: string;
  operator: string;
  type: string;
  summary: string;
  nextAt?: string;
  result: string;
}

export interface MemberRecord extends StageMeta {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  /** 列表/详情头像首字（局部派生，非全局 types） */
  avatarText: string;
  avatarTone: MemberAvatarTone;
  identity: MemberIdentity;
  lifecycleStage: MemberLifecycleStage;
  primaryAsset: string;
  remainingLabel: string;
  expireLabel: string;
  lastVisitLabel: string;
  store: string;
  manager: string;
  riskTags: MemberRiskTag[];
  suggestedAction: SuggestedActionType;
  suggestedActionReason: string;
  actionDueLabel: string;
  needFollowToday: boolean;
  systemJudgment: string;
  assets: MemberAssetRecord[];
  followUps: FollowUpRecord[];
  practiceProfile: PracticeProfile;
  courseRecords: CourseRecord[];
  privateTrainingRecords: PrivateTrainingRecord[];
  pointsProfile?: PointsProfile;
  consumptionProfile?: ConsumptionProfile;
  serviceTeam: ServiceTeam;
  teacherSyncProfile: TeacherSyncProfile;
  attendanceSummary: {
    bookings30d: number;
    checkins30d: number;
    cancels30d: number;
    noShows30d: number;
    consumption30d: number;
  };
  orders: { id: string; title: string; payStatus: string; contractStatus: string; at: string }[];
}

export interface ActionQueueItem {
  id: string;
  memberId: string;
  memberName: string;
  category: string;
  reason: string;
  action: SuggestedActionType;
  manager: string;
  dueLabel: string;
  status: ActionTaskStatus;
  group: 'today' | 'expiring' | 'highBalance' | 'trial' | 'manager';
}

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];
const MANAGERS = ['管家A', '管家B', '管家C', '店长张三', '运营林生'];

const maskPhone = (n: number): string => {
  const bases = ['138', '159', '186', '137', '177'];
  return `${bases[n % 5]}****${String(1000 + n).slice(-4)}`;
};

const assetTemplates: Omit<MemberAssetRecord, 'id' | 'memberId'>[] = [
  { name: '初遇卡 Spark', assetCode: 'A-SP-001', category: '额度型期限卡', sourceOrder: 'ORD-2026-0412', contractStatus: '已签署', remaining: '18 点', total: '30 点', validUntil: '2026-08-12', store: '万象馆', status: '生效中' },
  { name: '锦鲤卡 Flow', assetCode: 'A-FL-018', category: '额度型期限卡', sourceOrder: 'ORD-2026-0388', contractStatus: '已签署', remaining: '6 点', total: '20 点', validUntil: '2026-06-20', store: '城西馆', status: '即将到期' },
  { name: '天选卡 Prime', assetCode: 'A-PR-022', category: '额度型期限卡', sourceOrder: 'ORD-2025-1201', contractStatus: '已签署', remaining: '32 点', total: '50 点', validUntil: '2026-11-01', store: '滨江馆', status: '生效中', freezeTransferRefund: '无异常' },
  { name: '硬核卡 Core', assetCode: 'A-CR-009', category: '额度型期限卡', sourceOrder: 'ORD-2026-0105', contractStatus: '已签署', remaining: '2 点', total: '15 点', validUntil: '2026-05-28', store: '西湖馆', status: '即将到期' },
  { name: '自由卡 Flex', assetCode: 'A-FX-031', category: '额度型期限卡', sourceOrder: 'ORD-2026-0202', contractStatus: '待补签', remaining: '12 点', total: '25 点', validUntil: '2026-09-15', store: '云谷馆', status: '生效中' },
  { name: '瑜伽月卡', assetCode: 'A-YM-104', category: '瑜伽畅练期限卡', sourceOrder: 'ORD-2026-0333', contractStatus: '已签署', remaining: '不限次', total: '月卡', validUntil: '2026-06-05', store: '万象馆', status: '即将到期' },
  { name: '瑜伽季卡', assetCode: 'A-YQ-077', category: '瑜伽畅练期限卡', sourceOrder: 'ORD-2025-0901', contractStatus: '已签署', remaining: '不限次', total: '季卡', validUntil: '2026-07-30', store: '城西馆', status: '生效中' },
  { name: '瑜伽年卡', assetCode: 'A-YY-200', category: '瑜伽畅练期限卡', sourceOrder: 'ORD-2025-1108', contractStatus: '已签署', remaining: '不限次', total: '年卡', validUntil: '2027-02-01', store: '万象馆', status: '生效中' },
  { name: '私教体验课', assetCode: 'A-PT-202', category: '私教体验', sourceOrder: 'ORD-2026-0442', contractStatus: '已签署', remaining: '1 节', total: '1 节', validUntil: '2026-05-28', store: '滨江馆', status: '生效中' },
  { name: '普拉提月卡', assetCode: 'A-PM-056', category: '普拉提期限卡', sourceOrder: 'ORD-2026-0288', contractStatus: '已签署', remaining: '8 次', total: '12 次', validUntil: '2026-08-01', store: '滨江馆', status: '生效中' },
  { name: '核心床小班卡', assetCode: 'A-PB-063', category: '普拉提小班卡', sourceOrder: 'ORD-2026-0156', contractStatus: '已签署', remaining: '3 次', total: '10 次', validUntil: '2026-06-18', store: '西湖馆', status: '生效中' },
  { name: '私教体验包', assetCode: 'A-PT-201', category: '私教体验', sourceOrder: 'ORD-2026-0440', contractStatus: '已签署', remaining: '1 次', total: '1 次', validUntil: '2026-05-25', store: '云谷馆', status: '生效中' },
  { name: '私教正式课包', assetCode: 'A-PP-188', category: '私教资产', sourceOrder: 'ORD-2026-0118', contractStatus: '已签署', remaining: '16 节', total: '24 节', validUntil: '2026-12-31', store: '万象馆', status: '生效中' },
  { name: '新客体验课', assetCode: 'A-TR-301', category: '体验类资产', sourceOrder: 'ORD-2026-0455', contractStatus: '待签署', remaining: '1 次', total: '1 次', validUntil: '2026-05-20', store: '城西馆', status: '生效中' },
  { name: '小班体验包', assetCode: 'A-TB-302', category: '体验类资产', sourceOrder: 'ORD-2026-0448', contractStatus: '已签署', remaining: '1 次', total: '1 次', validUntil: '2026-05-22', store: '滨江馆', status: '生效中' },
  { name: '普拉提教培早鸟名额', assetCode: 'A-ED-401', category: '教培类资产', sourceOrder: 'ORD-2026-0088', contractStatus: '已签署', remaining: '名额保留', total: '1 名额', validUntil: '2026-10-01', store: '云谷馆', status: '生效中' },
  { name: '教培复训权益', assetCode: 'A-ED-402', category: '教培类资产', sourceOrder: 'ORD-2025-0666', contractStatus: '已签署', remaining: '复训 1 次', total: '1 次', validUntil: '2027-03-01', store: '万象馆', status: '已冻结', freezeTransferRefund: '冻结：个人原因暂停 15 天' },
];

const memberDefs: Array<{
  name: string;
  stage: MemberLifecycleStage;
  identity: MemberIdentity;
  primaryAsset: string;
  remaining: string;
  expire: string;
  lastVisit: string;
  risks: MemberRiskTag[];
  action: SuggestedActionType;
  actionReason: string;
  judgment: string;
  today: boolean;
  assetIdx: number[];
}> = [
  { name: '方可', stage: '潜客', identity: '潜客', primaryAsset: '—', remaining: '—', expire: '—', lastVisit: '未到馆', risks: [], action: '成交跟进', actionReason: '咨询后 3 天未预约体验', judgment: '潜客阶段，建议邀请体验课并确认到店时间。', today: true, assetIdx: [] },
  { name: '陆宁', stage: '潜客', identity: '潜客', primaryAsset: '—', remaining: '—', expire: '—', lastVisit: '未到馆', risks: [{ type: '体验未成交', reason: '已留资 7 天未预约' }], action: '体验转化跟进', actionReason: '需确认体验意向', judgment: '对普拉提兴趣较高，建议匹配核心床体验。', today: true, assetIdx: [] },
  { name: '宋雅', stage: '体验预约', identity: '体验期', primaryAsset: '新客体验课', remaining: '1 次', expire: '2026-05-20', lastVisit: '未到馆', risks: [{ type: '爽约频繁', reason: '已预约 2 次未到' }], action: '课程邀约', actionReason: '体验课待到店', judgment: '已预约体验，需课前提醒并确认交通时间。', today: true, assetIdx: [11] },
  { name: '蒋禾', stage: '体验预约', identity: '体验期', primaryAsset: '私教体验课', remaining: '1 次', expire: '2026-05-25', lastVisit: '未到馆', risks: [], action: '课程邀约', actionReason: '私教体验待到店', judgment: '私教体验预约中，建议管家提前沟通诉求。', today: false, assetIdx: [9] },
  { name: '叶琳', stage: '体验到课', identity: '体验期', primaryAsset: '小班体验包', remaining: '0 次', expire: '2026-05-22', lastVisit: '昨天', risks: [], action: '体验转化跟进', actionReason: '体验后待跟进', judgment: '昨日完成小班体验，反馈良好，建议 48h 内转化沟通。', today: true, assetIdx: [12] },
  { name: '唐舒', stage: '体验到课', identity: '体验期', primaryAsset: '新客体验课', remaining: '0 次', expire: '2026-05-18', lastVisit: '2 天前', risks: [], action: '私教转化', actionReason: '体验后咨询私教', judgment: '体验后对私教有兴趣，可推荐私教体验包升级路径。', today: false, assetIdx: [11] },
  { name: '顾晴', stage: '体验未成交', identity: '体验期', primaryAsset: '新客体验课', remaining: '0 次', expire: '已用完', lastVisit: '5 天前', risks: [{ type: '体验未成交', reason: '体验后 5 天未成交' }], action: '体验转化跟进', actionReason: '成交窗口变冷', judgment: '体验后 5 天未成交，管家仅跟进 1 次，建议本周二次触达。', today: true, assetIdx: [11] },
  { name: '孙然', stage: '体验未成交', identity: '体验期', primaryAsset: '小班体验包', remaining: '0 次', expire: '已用完', lastVisit: '6 天前', risks: [{ type: '体验未成交', reason: '体验后 6 天未购买' }], action: '成交跟进', actionReason: '需确认价格顾虑', judgment: '对价格敏感，建议介绍初遇卡 Spark 入门方案。', today: true, assetIdx: [12] },
  { name: '刘一宁', stage: '新会员', identity: '持卡会员', primaryAsset: '初遇卡 Spark', remaining: '28 点', expire: '2026-08-12', lastVisit: '3 天前', risks: [], action: '日常维护', actionReason: '新会员适应期', judgment: '新购 18 天内，建议安排 2 节适合课程建立节奏。', today: false, assetIdx: [0] },
  { name: '何佳', stage: '新会员', identity: '持卡会员', primaryAsset: '瑜伽月卡', remaining: '不限次', expire: '2026-06-05', lastVisit: '昨天', risks: [{ type: '快到期', reason: '月卡 18 天后到期' }], action: '续费提醒', actionReason: '新会员即将首到期', judgment: '新会员月卡即将到期，可到课稳定后提前沟通续费。', today: true, assetIdx: [5] },
  { name: '周岚', stage: '活跃会员', identity: '持卡会员', primaryAsset: '锦鲤卡 Flow', remaining: '14 点', expire: '2026-09-01', lastVisit: '昨天', risks: [], action: '日常维护', actionReason: '到课稳定', judgment: '近 14 天到课 4 次，维持良好互动即可。', today: false, assetIdx: [1] },
  { name: '许安琪', stage: '活跃会员', identity: '持卡会员', primaryAsset: '普拉提月卡', remaining: '6 次', expire: '2026-08-01', lastVisit: '2 天前', risks: [], action: '课程邀约', actionReason: '可尝试小班加课', judgment: '普拉提到课积极，可推荐核心床小班加练。', today: false, assetIdx: [7] },
  { name: '张薇', stage: '稳定会员', identity: '持卡会员', primaryAsset: '天选卡 Prime', remaining: '32 点', expire: '2026-11-01', lastVisit: '3 天前', risks: [{ type: '高价值', reason: '高频到课 + 高余额' }], action: '日常维护', actionReason: '稳定维护', judgment: '稳定会员，保持每周 2 次到课节奏。', today: false, assetIdx: [2] },
  { name: '李静', stage: '稳定会员', identity: '持卡会员', primaryAsset: '瑜伽季卡', remaining: '不限次', expire: '2026-07-30', lastVisit: '4 天前', risks: [], action: '日常维护', actionReason: '关系维护', judgment: '季卡会员到课规律，适合邀请主题活动。', today: false, assetIdx: [6] },
  { name: '赵婉儿', stage: '续费窗口', identity: '持卡会员', primaryAsset: '硬核卡 Core', remaining: '2 点', expire: '2026-05-28', lastVisit: '昨天', risks: [{ type: '快到期', reason: '18 天后到期' }, { type: '即将耗尽', reason: '仅剩 2 点' }], action: '续费提醒', actionReason: '续费窗口', judgment: '快到期且点数将尽，近 14 天仍有 3 次到课，建议本周优先沟通续费。', today: true, assetIdx: [3] },
  { name: '林青', stage: '续费窗口', identity: '持卡会员', primaryAsset: '自由卡 Flex', remaining: '12 点', expire: '2026-09-15', lastVisit: '2 天前', risks: [{ type: '高价值', reason: '高频活跃' }], action: '续费提醒', actionReason: '可升级天选卡', judgment: '高频活跃，适合推荐升级至天选卡 Prime。', today: true, assetIdx: [4] },
  { name: '陈小雨', stage: '沉睡风险', identity: '持卡会员', primaryAsset: '天选卡 Prime', remaining: '32 点', expire: '2026-11-01', lastVisit: '10 天前', risks: [{ type: '高余额低到课', reason: '剩余 32 点，近 10 天未到' }], action: '唤醒跟进', actionReason: '恢复到课节奏', judgment: '剩余 32 点，近 10 天未到课，建议先邀约适合课程再谈续费。', today: true, assetIdx: [2] },
  { name: '王梦', stage: '沉睡风险', identity: '持卡会员', primaryAsset: '锦鲤卡 Flow', remaining: '18 点', expire: '2026-06-20', lastVisit: '12 天前', risks: [{ type: '高余额低到课', reason: '7 天未到课' }, { type: '快到期', reason: '30 天内到期' }], action: '唤醒跟进', actionReason: '沉睡唤醒', judgment: '权益仍充足但到课下降，需了解时间冲突原因。', today: true, assetIdx: [1] },
  { name: '赵婉儿', stage: '流失风险', identity: '持卡会员', primaryAsset: '瑜伽月卡', remaining: '不限次', expire: '2026-06-05', lastVisit: '18 天前', risks: [{ type: '流失风险', reason: '14 天以上未到' }], action: '唤醒跟进', actionReason: '流失挽回', judgment: '月卡即将到期且久未到课，需评估续费意愿。', today: true, assetIdx: [5] },
  { name: '李静', stage: '流失风险', identity: '持卡会员', primaryAsset: '核心床小班卡', remaining: '1 次', expire: '2026-06-18', lastVisit: '22 天前', risks: [{ type: '流失风险', reason: '20 天未到' }, { type: '余额不足', reason: '仅剩 1 次' }], action: '续费提醒', actionReason: '末次权益消耗', judgment: '剩余 1 次且久未到，建议确认是否续课或转卡。', today: false, assetIdx: [8] },
  { name: '周岚', stage: '已流失', identity: '持卡会员', primaryAsset: '初遇卡 Spark', remaining: '0 点', expire: '已过期', lastVisit: '45 天前', risks: [{ type: '流失风险', reason: '已过期 30 天' }], action: '风险复核', actionReason: '流失复盘', judgment: '卡项已过期，可纳入唤醒名单观察 90 天。', today: false, assetIdx: [0] },
  { name: '许安琪', stage: '已流失', identity: '持卡会员', primaryAsset: '瑜伽季卡', remaining: '—', expire: '已过期', lastVisit: '60 天前', risks: [], action: '风险复核', actionReason: '长期未到', judgment: '季卡过期且长期未到，记录流失原因供运营分析。', today: false, assetIdx: [6] },
  { name: '张薇', stage: '高价值会员', identity: '持卡会员', primaryAsset: '私教正式课包', remaining: '16 节', expire: '2026-12-31', lastVisit: '昨天', risks: [{ type: '高价值', reason: '私教 + 团课双活跃' }], action: '日常维护', actionReason: '高价值维护', judgment: '高价值会员，保持私教节奏并关注满意度。', today: false, assetIdx: [10] },
  { name: '林青', stage: '高价值会员', identity: '持卡会员', primaryAsset: '天选卡 Prime', remaining: '28 点', expire: '2026-11-01', lastVisit: '2 天前', risks: [{ type: '高价值', reason: '复购 2 次' }, { type: '高价值', reason: '私教潜力会员' }], action: '私教转化', actionReason: '可加私教包', judgment: '团课活跃且余额充足，适合推荐私教正式课包。', today: false, assetIdx: [2, 10] },
  { name: '陈小雨', stage: '流失风险', identity: '持卡会员', primaryAsset: '自由卡 Flex', remaining: '8 点', expire: '2026-07-01', lastVisit: '16 天前', risks: [{ type: '退款风险', reason: '曾咨询退款' }, { type: '需店长介入', reason: '投诉跟进中' }], action: '店长介入', actionReason: '投诉安抚', judgment: '会员曾咨询退款，当前剩余权益较高，建议店长查看沟通记录。', today: true, assetIdx: [4] },
  { name: '王梦', stage: '续费窗口', identity: '持卡会员', primaryAsset: '普拉提月卡', remaining: '2 次', expire: '2026-06-12', lastVisit: '5 天前', risks: [{ type: '即将耗尽', reason: '仅剩 2 次' }], action: '续费提醒', actionReason: '次数将尽', judgment: '次数将尽且仍保持到课，建议续费普拉提月卡或小班包。', today: true, assetIdx: [7] },
  { name: '何佳', stage: '沉睡风险', identity: '持卡会员', primaryAsset: '核心床小班卡', remaining: '5 次', expire: '2026-08-20', lastVisit: '9 天前', risks: [{ type: '高余额低到课', reason: '7 天未到' }], action: '唤醒跟进', actionReason: '小班唤醒', judgment: '小班剩余 5 次但近 9 天未到，建议邀约晚间小班。', today: true, assetIdx: [8] },
  { name: '刘一宁', stage: '活跃会员', identity: '持卡会员', primaryAsset: '教培复训权益', remaining: '复训 1 次', expire: '2027-03-01', lastVisit: '7 天前', risks: [], action: '日常维护', actionReason: '教培学员', judgment: '教培权益冻结已解除申请中，跟进教务安排。', today: false, assetIdx: [14] },
  { name: '顾晴', stage: '体验未成交', identity: '体验期', primaryAsset: '私教体验包', remaining: '0 次', expire: '已用完', lastVisit: '4 天前', risks: [{ type: '体验未成交', reason: '体验后 4 天' }], action: '体验转化跟进', actionReason: '跟进不足', judgment: '私教体验已完成，需补充二次跟进记录。', today: true, assetIdx: [9] },
  { name: '方可', stage: '流失风险', identity: '潜客', primaryAsset: '—', remaining: '—', expire: '—', lastVisit: '30 天前', risks: [{ type: '流失风险', reason: '潜客 30 天无响应' }], action: '成交跟进', actionReason: '最后一次触达', judgment: '潜客长期无响应，可转入低频培育。', today: false, assetIdx: [] },
  { name: '陆宁', stage: '新会员', identity: '持卡会员', primaryAsset: '硬核卡 Core', remaining: '10 点', expire: '2026-10-10', lastVisit: '昨天', risks: [], action: '日常维护', actionReason: '新会员建档', judgment: '新会员第二周，确认课程偏好与时段。', today: false, assetIdx: [3] },
  { name: '宋雅', stage: '稳定会员', identity: '持卡会员', primaryAsset: '瑜伽年卡', remaining: '不限次', expire: '2027-02-01', lastVisit: '5 天前', risks: [], action: '日常维护', actionReason: '年卡维护', judgment: '年卡稳定会员，季度回访即可。', today: false, assetIdx: [6] },
  { name: '蒋禾', stage: '续费窗口', identity: '持卡会员', primaryAsset: '初遇卡 Spark', remaining: '4 点', expire: '2026-05-30', lastVisit: '3 天前', risks: [{ type: '快到期', reason: '12 天后到期' }, { type: '即将耗尽', reason: '仅剩 4 点' }], action: '续费提醒', actionReason: '续费窗口', judgment: '点数与有效期同步进入窗口，建议本周沟通。', today: true, assetIdx: [0] },
  { name: '叶琳', stage: '高价值会员', identity: '持卡会员', primaryAsset: '普拉提教培早鸟名额', remaining: '名额保留', expire: '2026-10-01', lastVisit: '6 天前', risks: [{ type: '高价值', reason: '教培意向' }], action: '日常维护', actionReason: '教培维护', judgment: '教培早鸟名额会员，关注开课通知与资料准备。', today: false, assetIdx: [13] },
  { name: '唐舒', stage: '沉睡风险', identity: '持卡会员', primaryAsset: '自由卡 Flex', remaining: '20 点', expire: '2026-12-01', lastVisit: '11 天前', risks: [{ type: '高余额低到课', reason: '11 天未到' }], action: '唤醒跟进', actionReason: '唤醒', judgment: '余额充足但到课下降，了解是否换工作时段。', today: true, assetIdx: [4] },
  { name: '孙然', stage: '流失风险', identity: '持卡会员', primaryAsset: '锦鲤卡 Flow', remaining: '3 点', expire: '2026-05-25', lastVisit: '20 天前', risks: [{ type: '流失风险', reason: '18 天未到' }, { type: '爽约频繁', reason: '近月爽约 2 次' }], action: '唤醒跟进', actionReason: '挽回', judgment: '久未到且爽约记录偏多，需谨慎邀约并确认意愿。', today: true, assetIdx: [1] },
  { name: '何佳', stage: '续费窗口', identity: '持卡会员', primaryAsset: '瑜伽月卡', remaining: '不限次', expire: '2026-06-05', lastVisit: '昨天', risks: [{ type: '快到期', reason: '月卡即将到期' }], action: '续费提醒', actionReason: '月卡续费', judgment: '月卡 18 天内到期，近 14 天到课 3 次，适合续费沟通。', today: true, assetIdx: [5] },
];

// Fix duplicate names - assign unique ids and fix 赵婉儿 duplicate
const NAME_POOL = [
  '王梦', '陈小雨', '林青', '赵婉儿', '李静', '张薇', '许安琪', '周岚', '何佳', '刘一宁',
  '孙然', '顾晴', '唐舒', '叶琳', '蒋禾', '宋雅', '方可', '陆宁', '沈悦', '韩雪',
  '莫婷', '郑悦', '冯娜', '邓丽', '程璐', '曹颖', '袁洁', '彭丹', '谢琳', '潘婷',
  '董慧', '吕倩',
];

const buildMembersBase = () =>
  memberDefs.map((def, i) => {
    const id = `m-${String(i + 1).padStart(3, '0')}`;
    const assets: MemberAssetRecord[] = def.assetIdx.map((idx, j) => {
      const tpl = assetTemplates[idx];
      return {
        ...tpl,
        id: `asset-${id}-${j}`,
        memberId: id,
        rules: '适用团课/小班扣点规则以合同为准',
        usageSummary: '近 30 天有使用记录',
        riskNote: tpl.status === '即将到期' ? '建议关注到期前续费' : undefined,
      };
    });
    if (def.primaryAsset === '瑜伽年卡' && assets.length === 0) {
      assets.push({
        ...assetTemplates[6],
        id: `asset-${id}-y`,
        memberId: id,
        name: '瑜伽年卡',
        assetCode: 'A-YY-200',
        validUntil: '2027-02-01',
      });
    }
    return {
      id,
      name: NAME_POOL[i] ?? def.name,
      phone: maskPhone(i),
      memberCode: `MY${2026000 + i}`,
      identity: def.identity,
      lifecycleStage: def.stage,
      primaryAsset: def.primaryAsset,
      remainingLabel: def.remaining,
      expireLabel: def.expire,
      lastVisitLabel: def.lastVisit,
      store: STORES[i % STORES.length],
      manager: MANAGERS[i % MANAGERS.length],
      riskTags: def.risks,
      suggestedAction: def.action,
      suggestedActionReason: def.actionReason,
      needFollowToday: def.today,
      systemJudgment: def.judgment,
      assets,
      followUps: [
        {
          id: `fu-${id}-1`,
          at: '05-14 10:20',
          operator: MANAGERS[i % MANAGERS.length],
          type: def.action,
          summary: def.actionReason,
          nextAt: '05-17',
          result: '待继续跟进',
        },
      ],
      attendanceSummary: {
        bookings30d: 4 + (i % 5),
        checkins30d: 3 + (i % 4),
        cancels30d: i % 3,
        noShows30d: i % 2,
        consumption30d: 2 + (i % 6),
      },
      orders: def.assetIdx.length
        ? [
            {
              id: `ord-${id}`,
              title: assets[0]?.sourceOrder ?? '—',
              payStatus: '已支付',
              contractStatus: assets[0]?.contractStatus ?? '已签署',
              at: '2026-04-20',
            },
          ]
        : [],
    };
  });

const buildMembers = (): MemberRecord[] => buildMembersBase().map((m, i) => enrichMember(m, i));

const metrics: MemberMetricItem[] = [
  { id: 'mm1', label: '有效会员', value: '186', subLabel: '人', hint: '当前仍有可用权益' },
  { id: 'mm2', label: '今日需跟进', value: '24', subLabel: '人', hint: '含续费 / 唤醒 / 体验转化', tone: 'amber' },
  { id: 'mm3', label: '快到期会员', value: '18', subLabel: '人', hint: '30 天内到期', tone: 'amber' },
  { id: 'mm4', label: '高余额低到课', value: '13', subLabel: '人', hint: '权益多但到课少', tone: 'amber' },
  { id: 'mm5', label: '续费机会', value: '21', subLabel: '人', hint: '高频 / 快耗尽 / 快到期' },
  { id: 'mm6', label: '流失风险', value: '9', subLabel: '人', hint: '14 天以上未到或投诉风险', tone: 'rose' },
];

const insights: MemberInsightItem[] = [
  {
    id: 'mi1',
    category: '续费窗口',
    summary: '8 位会员进入续费窗口，其中 3 位近 14 天仍保持到课',
    countLabel: '8 人',
    action: '查看名单',
    actionKey: 'renewal',
  },
  {
    id: 'mi2',
    category: '高余额低到课',
    summary: '13 位会员剩余权益较高但 7 天未到课，建议先恢复到课节奏',
    countLabel: '13 人',
    action: '创建任务',
    actionKey: 'wake',
  },
  {
    id: 'mi3',
    category: '体验后未成交',
    summary: '5 位体验会员超过 3 天未完成转化跟进，成交窗口正在变冷',
    countLabel: '5 人',
    action: '分配管家',
    actionKey: 'trial',
  },
  {
    id: 'mi4',
    category: '店长介入会员',
    summary: '3 位会员存在投诉、退款咨询或关系风险，建议店长亲自查看',
    countLabel: '3 人',
    action: '查看风险',
    actionKey: 'manager',
  },
];

export const buildMemberOperationSnapshot = () => {
  const members = buildMembers();
  const actionQueue: ActionQueueItem[] = [];

  members.forEach(m => {
    if (m.needFollowToday) {
      actionQueue.push({
        id: `aq-t-${m.id}`,
        memberId: m.id,
        memberName: m.name,
        category: m.suggestedAction,
        reason: m.suggestedActionReason,
        action: m.suggestedAction,
        manager: m.manager,
        dueLabel: '今日',
        status: '待处理',
        group: 'today',
      });
    }
    if (m.riskTags.some(r => r.type === '快到期' || r.type === '即将耗尽')) {
      actionQueue.push({
        id: `aq-e-${m.id}`,
        memberId: m.id,
        memberName: m.name,
        category: '快到期',
        reason: m.riskTags.find(r => r.type === '快到期' || r.type === '即将耗尽')?.reason ?? '',
        action: '续费提醒',
        manager: m.manager,
        dueLabel: '本周',
        status: '待处理',
        group: 'expiring',
      });
    }
    if (m.riskTags.some(r => r.type === '高余额低到课')) {
      actionQueue.push({
        id: `aq-h-${m.id}`,
        memberId: m.id,
        memberName: m.name,
        category: '高余额低到课',
        reason: m.riskTags.find(r => r.type === '高余额低到课')?.reason ?? '',
        action: '唤醒跟进',
        manager: m.manager,
        dueLabel: '3 日内',
        status: '待处理',
        group: 'highBalance',
      });
    }
    if (m.lifecycleStage === '体验未成交' || m.riskTags.some(r => r.type === '体验未成交')) {
      actionQueue.push({
        id: `aq-tr-${m.id}`,
        memberId: m.id,
        memberName: m.name,
        category: '体验未成交',
        reason: m.suggestedActionReason,
        action: '体验转化跟进',
        manager: m.manager,
        dueLabel: '48h 内',
        status: '待处理',
        group: 'trial',
      });
    }
    if (m.riskTags.some(r => r.type === '需店长介入' || r.type === '退款风险')) {
      actionQueue.push({
        id: `aq-mg-${m.id}`,
        memberId: m.id,
        memberName: m.name,
        category: '店长介入',
        reason: m.riskTags.map(r => r.reason).join('；'),
        action: '店长介入',
        manager: '店长张三',
        dueLabel: '今日',
        status: '待处理',
        group: 'manager',
      });
    }
  });

  const getMember = (id: string) => members.find(m => m.id === id) ?? null;
  const getAsset = (assetId: string) => {
    for (const m of members) {
      const a = m.assets.find(x => x.id === assetId);
      if (a) return { asset: a, member: m };
    }
    return null;
  };

  return {
    metrics,
    insights,
    members,
    actionQueue,
    lifecycleStages: [
      '潜客', '体验预约', '体验到课', '体验未成交', '新会员', '活跃会员',
      '稳定会员', '续费窗口', '沉睡风险', '流失风险', '已流失', '高价值会员',
    ] as MemberLifecycleStage[],
    stageCodes: STAGE_CODES,
    getMember,
    getAsset,
  };
};

export const stageBadgeClass = (code: StageCode): string => {
  if (code === 'S6') return 'bg-[#FAF4F0] text-[#9A6B63] ring-1 ring-[#E8DFD0]';
  if (code === 'S5') return 'bg-[#F4F6F3] text-[#4A5C4F] ring-1 ring-[#E1E3DD]';
  if (code === 'S4') return 'bg-[#F0F3F1] text-[#4A5C4F] ring-1 ring-[#E1E3DD]';
  if (code === 'S2' || code === 'S3') return 'bg-[#FAF6F0] text-[#8A6A3A] ring-1 ring-[#E8DFD0]';
  return 'bg-[#F0F1ED] text-[#565D56] ring-1 ring-[#E1E3DD]';
};

export const riskBadgeClass = (type: RiskTagType): string => {
  if (type === '需店长介入' || type === '退款风险' || type === '流失风险') {
    return 'bg-[#FAF4F0] text-[#9A6B63] ring-1 ring-[#E8DFD0]';
  }
  if (type === '高余额低到课' || type === '快到期' || type === '即将耗尽' || type === '体验未成交') {
    return 'bg-[#FAF6F0] text-[#8A6A3A] ring-1 ring-[#E8DFD0]';
  }
  if (type === '高价值') return 'bg-[#F4F6F3] text-[#4A5C4F] ring-1 ring-[#E1E3DD]';
  return 'bg-[#F7F8F5] text-[#565D56] ring-1 ring-[#E1E3DD]';
};

export const lifecycleBadgeClass = (stage: MemberLifecycleStage): string => {
  if (stage === '流失风险' || stage === '已流失') return 'bg-[#FAF4F0] text-[#9A6B63]';
  if (stage === '续费窗口' || stage === '沉睡风险' || stage === '体验未成交') return 'bg-[#FAF6F0] text-[#8A6A3A]';
  if (stage === '高价值会员' || stage === '稳定会员' || stage === '活跃会员') return 'bg-[#F4F6F3] text-[#4A5C4F]';
  if (stage === '潜客' || stage === '体验预约' || stage === '体验到课') return 'bg-[#F0F1ED] text-[#565D56]';
  return 'bg-[#F7F8F5] text-[#565D56]';
};
