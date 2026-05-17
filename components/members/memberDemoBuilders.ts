/** 会员经营局部 demo 数据构建（仅供 memberOperationViewModel 使用） */
import { buildMemberAvatar } from './memberAvatarUtils';
import type {
  ConsumptionProfile,
  CourseRecord,
  MemberLifecycleStage,
  MemberRecord,
  PointsProfile,
  PracticeProfile,
  PrivateTrainingRecord,
  ServiceTeam,
  StageCode,
  StageMeta,
  TeacherSyncProfile,
} from './memberOperationViewModel';

const TEACHERS = ['Lina', 'Mia', 'Sara', 'Tom', '王凯', '林青'];
const COURSE_NAMES = ['流瑜伽 · 晚间舒缓', '阴瑜伽 · 周末修复', '普拉提核心床', '普拉提小班 · 核心', '倒立进阶工作坊', '肩颈理疗团课'];
const ROOMS = ['A厅', 'B厅', '核心床室', '小班室'];

export const lifecycleToStage = (stage: MemberLifecycleStage): StageMeta => {
  const map: Record<MemberLifecycleStage, StageMeta> = {
    潜客: {
      stageCode: 'S0',
      stageName: '潜在线索',
      lifecycleSubStatus: '潜客',
      stageReason: '有咨询或留资，尚未预约体验',
      nextStageTarget: '预约体验课并确认到店',
    },
    体验预约: {
      stageCode: 'S1',
      stageName: '体验预约',
      lifecycleSubStatus: '体验预约',
      stageReason: '已预约体验课，等待到课',
      nextStageTarget: '完成首次体验到课',
    },
    体验到课: {
      stageCode: 'S2',
      stageName: '体验转化',
      lifecycleSubStatus: '体验到课',
      stageReason: '已完成体验，进入转化跟进',
      nextStageTarget: '48 小时内完成转化沟通',
    },
    体验未成交: {
      stageCode: 'S2',
      stageName: '体验转化',
      lifecycleSubStatus: '体验未成交',
      stageReason: '体验后超过 3 天未购买',
      nextStageTarget: '二次触达并确认顾虑',
    },
    新会员: {
      stageCode: 'S3',
      stageName: '新会员激活',
      lifecycleSubStatus: '新会员',
      stageReason: '新购 30 天内，需建立到课习惯',
      nextStageTarget: '近 14 天至少到课 2 次',
    },
    活跃会员: {
      stageCode: 'S4',
      stageName: '稳定活跃',
      lifecycleSubStatus: '活跃会员',
      stageReason: '近 14 天有到课，节奏良好',
      nextStageTarget: '保持每周稳定到课',
    },
    稳定会员: {
      stageCode: 'S4',
      stageName: '稳定活跃',
      lifecycleSubStatus: '稳定会员',
      stageReason: '到课节奏稳定',
      nextStageTarget: '维持关系并适时推荐进阶课',
    },
    续费窗口: {
      stageCode: 'S5',
      stageName: '价值经营',
      lifecycleSubStatus: '续费窗口',
      stageReason: '快到期 / 快耗尽 / 高频活跃',
      nextStageTarget: '本周完成续费沟通',
    },
    高价值会员: {
      stageCode: 'S5',
      stageName: '价值经营',
      lifecycleSubStatus: '高价值会员',
      stageReason: '高频、复购或私教潜力',
      nextStageTarget: '深化私教或升级卡项',
    },
    沉睡风险: {
      stageCode: 'S6',
      stageName: '风险召回',
      lifecycleSubStatus: '沉睡风险',
      stageReason: '7–14 天未到课且仍有权益',
      nextStageTarget: '先恢复到课再谈续费',
    },
    流失风险: {
      stageCode: 'S6',
      stageName: '风险召回',
      lifecycleSubStatus: '流失风险',
      stageReason: '14 天以上未到或权益将尽',
      nextStageTarget: '评估续费意愿并唤醒',
    },
    已流失: {
      stageCode: 'S6',
      stageName: '风险召回',
      lifecycleSubStatus: '已流失',
      stageReason: '过期或长期未到',
      nextStageTarget: '记录原因，纳入观察名单',
    },
  };
  return map[stage];
};

const freqLevels: PracticeProfile['classFrequencyLevel'][] = ['高频', '稳定', '低频', '沉睡'];
const courseTypes = ['流瑜伽', '阴瑜伽', '普拉提核心床', '普拉提小班', '私教', '孕产', '理疗', '倒立进阶'];
const timeSlots = ['工作日晚上', '周末上午', '工作日午间', '不固定'];
const goals = ['减压放松', '体态改善', '肩颈理疗', '核心提升', '私教塑形', '孕产恢复', '进阶练习', '教培学习'];
const notes = ['膝盖不适', '肩颈紧张', '腰椎敏感', '产后恢复', '初学怕强度', '不喜欢过度销售', '需要温和提醒'];
const habits = ['晚间到课', '喜欢固定老师', '容易临时取消', '课程后愿意沟通', '对私教有兴趣', '到店频率不稳定'];

export const buildPracticeProfile = (i: number, stage: MemberLifecycleStage): PracticeProfile => {
  const level =
    stage === '沉睡风险' || stage === '流失风险' || stage === '已流失'
      ? '沉睡'
      : stage === '活跃会员' || stage === '稳定会员' || stage === '高价值会员' || stage === '续费窗口'
        ? i % 3 === 0
          ? '高频'
          : '稳定'
        : stage === '新会员'
          ? '稳定'
          : freqLevels[i % 4];
  const checkins = level === '高频' ? 8 : level === '稳定' ? 5 : level === '低频' ? 2 : 0;
  return {
    classFrequencyLevel: level,
    classFrequencySummary:
      checkins > 0 ? `近 30 天到课 ${checkins} 次，平均每周 ${Math.max(1, Math.round(checkins / 4))} 次` : '近 30 天未到课',
    preferredCourseTypes: [courseTypes[i % 8], courseTypes[(i + 2) % 8]].filter((v, idx, a) => a.indexOf(v) === idx),
    preferredTimeSlots: [timeSlots[i % 4]],
    preferredStores: [],
    preferredTeachers: [TEACHERS[i % 6], TEACHERS[(i + 1) % 6]],
    exerciseGoal: goals[i % goals.length],
    attentionNotes: [notes[i % notes.length]],
    habitTags: [habits[i % 6], habits[(i + 2) % 6]],
    lastCourseName: COURSE_NAMES[i % COURSE_NAMES.length],
    intensityPreference: i % 7 === 0 ? '偏低强度' : '中等强度',
    unsuitableContent: i % 5 === 0 ? ['倒立进阶', '高强度流瑜伽'] : ['过度拉伸'],
  };
};

/** 从同源字段派生老师端同步档案（PC 与 METeach 共用口径） */
export const buildTeacherSyncProfile = (
  base: Pick<MemberRecord, 'name' | 'stageCode' | 'lifecycleSubStatus' | 'lastVisitLabel' | 'practiceProfile' | 'serviceTeam' | 'courseRecords' | 'privateTrainingRecords'>,
  i: number,
): TeacherSyncProfile => {
  const p = base.practiceProfile;
  const team = base.serviceTeam;
  const lastFb = base.courseRecords[0]?.feedbackNote ?? '—';
  const ptGoal = base.privateTrainingRecords[0]?.trainingGoal ?? '—';
  return {
    visibleName: base.name,
    simplifiedStageLabel: `${base.stageCode} · ${base.lifecycleSubStatus}`,
    visiblePracticeGoals: p.exerciseGoal,
    visibleCoursePreferences: p.preferredCourseTypes.join('、'),
    visibleTimePreferences: p.preferredTimeSlots.join('、'),
    visibleStorePreferences: p.preferredStores.join('、'),
    visibleTeacherPreferences: p.preferredTeachers.join('、'),
    visibleAttentionNotes: p.attentionNotes.join('；'),
    visibleRecentCourseFeedback: lastFb,
    visiblePrivateTrainingGoal: ptGoal,
    teacherNotes: team.teacherVisibleNotes,
    needsAfterClassFeedback: !!team.needsPostClassFeedback,
    needsButlerFollowUp: i % 6 === 0,
    visibleClassFrequency: `${p.classFrequencyLevel} · ${p.classFrequencySummary}`,
    visibleLastVisit: base.lastVisitLabel,
    lastSyncedAt: '2026-05-15 09:30',
    syncSource: (['系统生成', '管家维护', '老师反馈'] as const)[i % 3],
    updatedBy: team.ownerButler,
    syncedFieldCount: 15,
    pendingConfirmFieldCount: i % 8 === 0 ? 1 : 0,
    lastTeacherFeedbackAt: '2026-05-13 18:20',
    suggestButlerFollowUp: i % 6 === 0,
    suggestPrivateTraining: base.privateTrainingRecords.length === 0 && i % 4 === 0,
    needsLowerIntensity: !!team.avoidHighIntensity,
    needsAfterClassAttention: !!team.needsPostClassFeedback,
    recentTeacherFeedback: team.lastTeacherFeedback,
    hiddenFields: [
      '完整手机号',
      '身份证 / 地址',
      '订单金额',
      '合同详情',
      '退款记录',
      '消费总额',
      '内部经营判断',
      '高敏感风险标签',
      '续费金额建议',
      '财务确认收入',
    ],
  };
};

export const buildCourseRecords = (i: number, memberId: string, assetName: string): CourseRecord[] => {
  if (i >= 12 && i % 4 === 3) return [];
  const count = 3 + (i % 3);
  return Array.from({ length: count }, (_, j) => ({
    id: `cr-${memberId}-${j}`,
    courseDate: `05-${String(12 - j).padStart(2, '0')}`,
    courseName: COURSE_NAMES[(i + j) % COURSE_NAMES.length],
    courseType: (['团课', '小班', '私教', '教培'] as const)[(i + j) % 4],
    teacherName: TEACHERS[(i + j) % 6],
    storeName: ['万象馆', '城西馆', '滨江馆'][j % 3],
    roomName: ROOMS[j % 4],
    bookingStatus: j === 0 && i % 7 === 0 ? '爽约' : '已预约',
    attendanceStatus: j === 0 && i % 7 === 0 ? '爽约' : '已到课',
    consumedAssetName: assetName !== '—' ? assetName : '新客体验课',
    consumedPointsOrTimes: j % 2 === 0 ? '1 点' : '1 次',
    feedbackNote: j === 0 ? '课后反馈积极' : undefined,
    teacherNote: j === 0 ? '可尝试进阶小班' : undefined,
  }));
};

export const buildPrivateTraining = (i: number, memberId: string, hasPt: boolean): PrivateTrainingRecord[] => {
  if (!hasPt && i % 4 !== 0 && i >= 8) return [];
  const packages = ['私教体验包', '私教正式课包', '产后修复私教', '核心提升私教', '肩颈理疗私教'];
  return [
    {
      id: `pt-${memberId}`,
      packageName: packages[i % packages.length],
      coachName: TEACHERS[(i + 2) % 6],
      totalSessions: i % 2 === 0 ? 24 : 1,
      completedSessions: i % 2 === 0 ? 8 + (i % 6) : 1,
      remainingSessions: i % 2 === 0 ? 16 - (i % 6) : 0,
      lastSessionDate: '05-12',
      nextSuggestedAction: i % 2 === 0 ? '保持每周 1 节节奏' : '可介绍正式课包方案',
      trainingGoal: goals[i % 5],
      coachAssessment: '核心控制有进步，建议继续巩固',
      conversionStatus: (['体验中', '待成交', '已成交', '续费窗口', '暂停中'] as const)[i % 5],
    },
  ];
};

export const buildPointsProfile = (i: number): PointsProfile | undefined => {
  if (i >= 16 && i % 5 === 4) return undefined;
  return {
    currentPoints: 120 + (i % 8) * 40,
    totalEarnedPoints: 800 + i * 20,
    totalUsedPoints: 400 + i * 10,
    expiringPoints: i % 5 === 0 ? 80 : 0,
    expiringDate: i % 5 === 0 ? '2026-06-30' : undefined,
    latestPointRecords: [
      { id: `pt-${i}-1`, date: '05-10', type: '获得', reason: '到课积分', points: 20, operator: '系统' },
      { id: `pt-${i}-2`, date: '05-02', type: '使用', reason: '积分兑换', points: -50, operator: '管家A' },
    ],
  };
};

export const buildConsumptionProfile = (i: number, memberId: string): ConsumptionProfile | undefined => {
  if (i >= 16 && i % 5 === 3) return undefined;
  const paid = 3000 + i * 420;
  return {
    totalPaidAmount: paid,
    totalRefundAmount: i % 11 === 0 ? 500 : 0,
    netPaidAmount: paid - (i % 11 === 0 ? 500 : 0),
    totalConsumedPoints: 40 + i * 3,
    totalConsumedTimes: 12 + (i % 10),
    latestOrders: [
      {
        orderNo: `ORD-2026-${1000 + i}`,
        productName: ['初遇卡 Spark', '瑜伽月卡', '私教正式课包'][i % 3],
        paidAmount: paid,
        paidAt: '2026-04-20',
        paymentStatus: '已支付',
        contractStatus: '已签署',
        assetGeneratedStatus: '已生成',
      },
    ],
    latestConsumptionRecords: [
      {
        id: `cons-${memberId}-1`,
        date: '05-14',
        courseName: COURSE_NAMES[i % 3],
        teacherName: TEACHERS[i % 6],
        assetName: '锦鲤卡 Flow',
        consumedPointsOrTimes: '1 点',
        confirmationStatus: i % 9 === 0 ? '待确认' : '已确认',
      },
    ],
    hasUnconfirmedConsumption: i % 9 === 0,
  };
};

export const buildServiceTeam = (i: number, manager: string, store: string): ServiceTeam => ({
  ownerButler: manager,
  storeManager: '店长张三',
  mainTeachers: [TEACHERS[i % 6], TEACHERS[(i + 1) % 6]],
  privateCoach: i % 3 === 0 ? TEACHERS[(i + 2) % 6] : undefined,
  lastTeacherFeedback: '05-13 · 课后状态良好，建议保持当前强度',
  lastButlerFollowUp: '05-14 · 已确认下次到课时间',
  handoverNotes: '内部：关注续费窗口，勿频繁推销',
  teacherVisibleNotes: '课后避免倒立进阶；膝盖不适需垫高',
  needsPostClassFeedback: i % 4 === 0,
  avoidHighIntensity: i % 7 === 0,
  hasTeacherNote: true,
});

export const STAGE_CODES: StageCode[] = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export const enrichMember = (
  base: Omit<
    MemberRecord,
    | 'stageCode'
    | 'stageName'
    | 'lifecycleSubStatus'
    | 'stageReason'
    | 'nextStageTarget'
    | 'practiceProfile'
    | 'courseRecords'
    | 'privateTrainingRecords'
    | 'pointsProfile'
    | 'consumptionProfile'
    | 'serviceTeam'
    | 'teacherSyncProfile'
    | 'actionDueLabel'
    | 'avatarText'
    | 'avatarTone'
  >,
  i: number,
): MemberRecord => {
  const stageMeta = lifecycleToStage(base.lifecycleStage);
  const hasPt =
    base.assets.some(a => a.category.includes('私教')) ||
    ['私教转化', '高价值会员'].includes(base.lifecycleStage);
  const practiceProfile = {
    ...buildPracticeProfile(i, base.lifecycleStage),
    preferredStores: [base.store],
  };
  const courseRecords = buildCourseRecords(i, base.id, base.primaryAsset);
  const privateTrainingRecords = buildPrivateTraining(i, base.id, hasPt);
  const serviceTeam = buildServiceTeam(i, base.manager, base.store);
  const avatar = buildMemberAvatar(base.name, stageMeta.stageCode, i);
  return {
    ...base,
    ...stageMeta,
    ...avatar,
    lifecycleSubStatus: base.lifecycleStage,
    actionDueLabel: base.needFollowToday ? '今日' : '本周',
    practiceProfile,
    courseRecords,
    privateTrainingRecords,
    pointsProfile: buildPointsProfile(i),
    consumptionProfile: buildConsumptionProfile(i, base.id),
    serviceTeam,
    teacherSyncProfile: buildTeacherSyncProfile(
      {
        name: base.name,
        stageCode: stageMeta.stageCode,
        lifecycleSubStatus: base.lifecycleStage,
        lastVisitLabel: base.lastVisitLabel,
        practiceProfile,
        serviceTeam,
        courseRecords,
        privateTrainingRecords,
      },
      i,
    ),
  };
};
