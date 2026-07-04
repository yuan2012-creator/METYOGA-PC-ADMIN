export type StaffV2SuggestionSource = 'system_rule' | 'pending_config';

export type StaffV2Priority = 'P0' | 'P1' | 'P2';

export type StaffV2WorkloadTone = 'idle' | 'normal' | 'available' | 'high' | 'leave';

export type StaffV2AttentionTone = 'risk' | 'opportunity' | 'dispatch' | 'growth';

export type StaffV2CoverageStatus = 'tight' | 'stable' | 'fillable' | 'schedule_tight';

export type StaffV2IssueOrigin =
  | 'system'
  | 'teacher_app'
  | 'course_link'
  | 'growth_review'
  | 'material_review';

export type StaffV2AvailabilityTone = 'available' | 'high_load' | 'restricted' | 'mentoring';

export type StaffV2ApplicationType =
  | 'leave'
  | 'substitute'
  | 'resign'
  | 'material'
  | 'promotion';

export interface StaffV2Meta {
  title: string;
  subtitle: string;
}

export interface StaffV2Filters {
  storeLabel: string;
  roleLabel: string;
  courseTypeLabel: string;
  levelLabel: string;
  statusLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  archiveLinkLabel: string;
}

export interface StaffV2SectionHeader {
  title: string;
  subtitle: string;
}

export interface StaffV2EvidenceMetric {
  label: string;
  value: string;
}

export interface StaffV2SupplySummary {
  section: StaffV2SectionHeader;
  title: string;
  conclusion: string;
  description: string;
  statusTags: string[];
  suggestionSource: StaffV2SuggestionSource;
  suggestionSourceLabel: string;
  evidence: StaffV2EvidenceMetric[];
  actionLabel: string;
}

export type StaffSupplyStatus = 'healthy' | 'watch' | 'warning' | 'highRisk';

export interface StaffSupplyEvidenceItem {
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface StaffSupplySummaryData {
  status: StaffSupplyStatus;
  statusLabel: string;
  headline: string;
  conclusion: string;
  impactTags: string[];
  sourceLabel: string;
  updatedAt: string;
  evidenceItems: StaffSupplyEvidenceItem[];
  evidenceButtonLabel: string;
  evidenceToastMessage: string;
}

export interface StaffPriorityAction {
  id: string;
  priority: StaffV2Priority;
  title: string;
  impact: string;
  owner: string;
  sourceModules: string[];
  suggestedAction: string;
  ctaLabel: string;
  ctaToast: string;
}

export interface StaffPriorityActionsSection {
  title: string;
  subtitle: string;
  items: StaffPriorityAction[];
}

export interface TeacherRequestStabilityItem {
  id: string;
  priority: StaffV2Priority;
  typeLabel: string;
  teacher: string;
  involvedCourse: string;
  impact: string;
  status: string;
  suggestedAction: string;
  ctaLabel: string;
  ctaToast: string;
  relatedTeacherId?: string;
}

export interface TeacherRequestStabilitySection {
  title: string;
  subtitle: string;
  items: TeacherRequestStabilityItem[];
}

export interface TeacherWorkloadRepresentative {
  name: string;
  note: string;
}

export interface TeacherWorkloadSummaryBlock {
  highLoadCount: string;
  normalLoadCount: string;
  fillableCount: string;
  substituteCount: string;
  representativeTeachers: TeacherWorkloadRepresentative[];
}

export interface CourseCoverageSummaryItem {
  id: string;
  courseType: string;
  statusLabel: string;
  availableTeachers: string;
  riskNote: string;
  suggestedAction: string;
}

export interface SubstituteResourceBlock {
  fillableSlots: string;
  substituteTeachers: string;
  recommendedCourses: string;
  ctaLabel: string;
  ctaToast: string;
}

export interface TeacherSupplyCoverageSummary {
  title: string;
  subtitle: string;
  workload: TeacherWorkloadSummaryBlock;
  courseCoverage: CourseCoverageSummaryItem[];
  substituteResource: SubstituteResourceBlock;
}

export interface TeacherOwnedMemberRisk {
  teacherId: string;
  teacherName: string;
  ownedMembers: number;
  riskMembers: number;
  newMemberActivationRisk?: number;
  lowFrequencyRisk?: number;
  renewalWindowRisk?: number;
  lastFollowUp: string;
  suggestedAction: string;
  ctaLabel: string;
}

export interface TeacherOwnedMemberRisksSection {
  title: string;
  subtitle: string;
  teachers: TeacherOwnedMemberRisk[];
}

export interface TeacherContributionSummaryItem {
  id: string;
  name: string;
  statusLabel: string;
  contributionNote: string;
  qualityNote: string;
  riskNote?: string;
}

export interface TeacherGrowthSummarySection {
  title: string;
  subtitle: string;
  contribution: {
    title: string;
    items: TeacherContributionSummaryItem[];
  };
  growth: {
    title: string;
    pendingReviewTeachers: string;
    pendingMaterials: string;
    pendingObservations: string;
    promotionWatch: string;
    ctaLabel: string;
    ctaToast: string;
  };
}

export interface StaffV2AttentionHighlight {
  id: string;
  title: string;
  count: string;
  description: string;
  tone: StaffV2AttentionTone;
  actionLabel: string;
  toastMessage?: string;
}

export interface StaffV2AttentionPanel {
  title: string;
  items: StaffV2AttentionHighlight[];
}

export interface StaffV2Warroom {
  section: StaffV2SectionHeader;
  supplySummary: StaffV2SupplySummary;
  attentionPanel: StaffV2AttentionPanel;
  availabilitySummary: StaffV2AvailabilitySummary;
}

export interface StaffV2AvailabilityItem {
  id: string;
  title: string;
  teachers: string;
  description: string;
  tone: StaffV2AvailabilityTone;
}

export interface StaffV2AvailabilitySummary {
  title: string;
  items: StaffV2AvailabilityItem[];
}

export interface StaffV2HeatmapLegendItem {
  label: string;
  tone: StaffV2WorkloadTone;
}

export interface StaffV2WorkloadCell {
  id: string;
  teacher: string;
  day: string;
  sessionCount: number;
  peakCount?: number;
  statusLabel: string;
  tone: StaffV2WorkloadTone;
}

export interface StaffV2WorkloadHeatmap {
  title: string;
  subtitle: string;
  teacherLabels: string[];
  dayLabels: string[];
  legend: StaffV2HeatmapLegendItem[];
  cells: StaffV2WorkloadCell[];
}

export interface StaffV2CoverageIndicator {
  label: string;
  level: 'low' | 'mid' | 'high';
}

export interface StaffV2CoverageRoleMap {
  primary: string;
  substitute: string;
  mentoring: string;
}

export interface StaffV2CourseCoverageItem {
  id: string;
  courseType: string;
  teacherCount: string;
  weeklySessions: string;
  fillRate: string;
  coverageStatus: string;
  coverageTone: StaffV2CoverageStatus;
  roleMap: StaffV2CoverageRoleMap;
  risk: string;
  suggestionAction: string;
  actionLabel: string;
  indicators: StaffV2CoverageIndicator[];
  toastMessage?: string;
}

export interface StaffV2CourseCoverage {
  title: string;
  subtitle: string;
  items: StaffV2CourseCoverageItem[];
}

export interface StaffV2TeacherContributionItem {
  id: string;
  name: string;
  level: string;
  specialties: string;
  weeklySessions: string;
  estimatedConsumption: string;
  fillRate: string;
  memberRating: string;
  statusLabel: string;
  riskOrOpportunity: string;
  riskOrOpportunityTone: 'risk' | 'opportunity' | 'neutral';
  nextAction: string;
  loadPercent: number;
  contributionPercent: number;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

export interface StaffV2TeacherContribution {
  title: string;
  subtitle: string;
  teachers: StaffV2TeacherContributionItem[];
}

export interface StaffV2IssueItem {
  id: string;
  priority: StaffV2Priority;
  title: string;
  origin: StaffV2IssueOrigin;
  originLabel: string;
  fact: string;
  impact: string;
  owner?: string;
  suggestionSource: StaffV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  relatedTeacherId?: string;
  toastMessage?: string;
}

export interface StaffV2IssueQueue {
  title: string;
  subtitle: string;
  items: StaffV2IssueItem[];
}

export interface StaffV2LevelDistribution {
  level: string;
  count: string;
}

export interface StaffV2ReviewItem {
  id: string;
  teacher: string;
  topic: string;
}

export interface StaffV2CertReminder {
  id: string;
  text: string;
}

export interface StaffV2GrowthAction {
  id: string;
  label: string;
  toastMessage: string;
}

export interface StaffV2PromotionReviewItem {
  id: string;
  teacher: string;
  summary: string;
}

export interface StaffV2MaterialReviewItem {
  id: string;
  text: string;
}

export interface StaffV2GrowthCoaching {
  title: string;
  subtitle: string;
  levelDistribution: StaffV2LevelDistribution[];
  promotionReviews: StaffV2PromotionReviewItem[];
  materialReviews: StaffV2MaterialReviewItem[];
  nextActions: StaffV2GrowthAction[];
}

export interface StaffV2TeacherApplicationItem {
  id: string;
  type: StaffV2ApplicationType;
  typeLabel: string;
  teacher: string;
  summary: string;
  detail: string;
  impact?: string;
  status: string;
  assignee: string;
  actionLabel: string;
  toastMessage: string;
  relatedTeacherId?: string;
}

export interface StaffV2TeacherApplications {
  title: string;
  subtitle: string;
  items: StaffV2TeacherApplicationItem[];
}

export interface StaffOwnedMemberStageDistribution {
  stage: string;
  stageLabel: string;
  count: number;
}

export interface StaffOwnedMemberSummary {
  id: string;
  teacherId: string;
  name: string;
  level: string;
  totalMembers: number;
  activeMembers: number;
  highRiskMembers: number;
  followedThisWeek: number;
  pendingFollowUp: number;
  mainRisks: string;
  nextAction: string;
  stageDistribution: StaffOwnedMemberStageDistribution[];
  actionLabel: string;
}

export interface StaffOwnedMemberQueueItem {
  id: string;
  priority: StaffV2Priority;
  title: string;
  fact: string;
  impact: string;
  teacherAppStatus: string;
  relatedModules: string;
  suggestionSource: StaffV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  toastMessage: string;
  relatedTeacherId?: string;
}

export interface StaffOwnedMemberRecentAction {
  memberName: string;
  stageLabel: string;
  actionStatus: string;
  detail: string;
}

export interface StaffOwnedMemberDrawerSummary {
  overview: {
    totalMembers: string;
    activeMembers: string;
    highRiskMembers: string;
    followedThisWeek: string;
    pendingFollowUp: string;
    notVisited14Days: string;
    newMemberInactive: string;
    renewalWindow: string;
  };
  stageDistribution: StaffOwnedMemberStageDistribution[];
  recentActions: StaffOwnedMemberRecentAction[];
  riskNotes: string[];
  actions: { label: string; toastMessage: string }[];
}

export interface StaffOwnedMemberManagement {
  title: string;
  subtitle: string;
  teacherSummaries: StaffOwnedMemberSummary[];
  queue: StaffOwnedMemberQueueItem[];
}

export interface StaffV2TeacherProfile {
  phone: string;
  joinDate: string;
  employmentType: string;
  roleType: string;
  store: string;
  manager: string;
  employmentStatus: string;
  crossStore: string;
  canTeachIndependently: string;
  canSubstitute: string;
  privacyNote: string;
}

export interface StaffV2TeacherQualification {
  teachableCourses: string;
  substituteCourses: string;
  restrictedCourses: string;
  certifications: string;
  certStatus: string;
  internalAssessment: string;
  attachmentStatus: string;
}

export interface StaffV2TeacherAppPermissionSummary {
  visible: string[];
  operable: string[];
  restricted: string[];
}

export interface StaffV2TeacherRecord {
  label: string;
  category?: 'course' | 'leave' | 'material' | 'permission';
}

export interface StaffV2TeacherDetail {
  id: string;
  title: string;
  subtitle: string;
  name: string;
  level: string;
  specialties: string;
  store: string;
  statusLabel: string;
  weeklySessions: string;
  peakSessions: string;
  profile: StaffV2TeacherProfile;
  qualifications: StaffV2TeacherQualification;
  appPermissions: StaffV2TeacherAppPermissionSummary;
  supply: {
    weeklySessions: string;
    peakSessions: string;
    adjustableSlot: string;
    substituteFor: string;
    currentRisk: string;
    pendingApplications: string;
  };
  contribution: {
    estimatedConsumption: string;
    theoreticalConsumption: string;
    fillRate: string;
    waitlistLinked: string;
    memberRating: string;
  };
  growth: {
    level: string;
    promotionDirection: string;
    mentoringStatus: string;
    certifications: string;
    monthlyReview: string;
    pendingMaterials: string;
    lastReviewDate: string;
  };
  recentRecords: StaffV2TeacherRecord[];
  ownedMemberDetail: StaffOwnedMemberDrawerSummary;
  actions: { label: string; toastMessage: string }[];
}

export interface StaffV2Snapshot {
  meta: StaffV2Meta;
  filters: StaffV2Filters;
  staffSupplySummary: StaffSupplySummaryData;
  staffPriorityActions: StaffPriorityActionsSection;
  teacherRequestStability: TeacherRequestStabilitySection;
  teacherSupplyCoverageSummary: TeacherSupplyCoverageSummary;
  teacherOwnedMemberRisks: TeacherOwnedMemberRisksSection;
  staffIssueReviewQueue: StaffV2IssueQueue;
  teacherGrowthSummary: TeacherGrowthSummarySection;
  warroom: StaffV2Warroom;
  teacherApplications: StaffV2TeacherApplications;
  workloadHeatmap: StaffV2WorkloadHeatmap;
  courseCoverage: StaffV2CourseCoverage;
  ownedMemberManagement: StaffOwnedMemberManagement;
  teacherContribution: StaffV2TeacherContribution;
  staffIssueQueue: StaffV2IssueQueue;
  growthCoaching: StaffV2GrowthCoaching;
  teacherDetailMap: Record<string, StaffV2TeacherDetail>;
}

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TEACHER_LABELS = ['Mia', 'Anna', 'Nora', 'Leo', '陈悦'];

type WorkloadSeed = Omit<StaffV2WorkloadCell, 'id'>;

function buildWorkloadCells(): StaffV2WorkloadCell[] {
  const seeds: WorkloadSeed[] = [
    { teacher: 'Mia', day: '周一', sessionCount: 3, peakCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Mia', day: '周二', sessionCount: 2, peakCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Mia', day: '周三', sessionCount: 3, peakCount: 2, statusLabel: '负载偏高', tone: 'high' },
    { teacher: 'Mia', day: '周四', sessionCount: 2, peakCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Mia', day: '周五', sessionCount: 4, peakCount: 2, statusLabel: '负载偏高', tone: 'high' },
    { teacher: 'Mia', day: '周六', sessionCount: 2, peakCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Mia', day: '周日', sessionCount: 2, peakCount: 0, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Anna', day: '周一', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Anna', day: '周二', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Anna', day: '周三', sessionCount: 2, statusLabel: '可补排 10:30', tone: 'available' },
    { teacher: 'Anna', day: '周四', sessionCount: 2, peakCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Anna', day: '周五', sessionCount: 3, peakCount: 2, statusLabel: '负载偏高', tone: 'high' },
    { teacher: 'Anna', day: '周六', sessionCount: 1, statusLabel: '空闲', tone: 'idle' },
    { teacher: 'Anna', day: '周日', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Nora', day: '周一', sessionCount: 1, statusLabel: '空闲', tone: 'idle' },
    { teacher: 'Nora', day: '周二', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Nora', day: '周三', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Nora', day: '周四', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Nora', day: '周五', sessionCount: 2, statusLabel: '可补排 19:45', tone: 'available' },
    { teacher: 'Nora', day: '周六', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Nora', day: '周日', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: 'Leo', day: '周一', sessionCount: 2, statusLabel: '私教为主', tone: 'normal' },
    { teacher: 'Leo', day: '周二', sessionCount: 3, statusLabel: '私教 3 节', tone: 'normal' },
    { teacher: 'Leo', day: '周三', sessionCount: 2, statusLabel: '私教为主', tone: 'normal' },
    { teacher: 'Leo', day: '周四', sessionCount: 2, statusLabel: '私教为主', tone: 'normal' },
    { teacher: 'Leo', day: '周五', sessionCount: 3, statusLabel: '档期紧', tone: 'high' },
    { teacher: 'Leo', day: '周六', sessionCount: 2, statusLabel: '私教为主', tone: 'normal' },
    { teacher: 'Leo', day: '周日', sessionCount: 2, statusLabel: '不建议团课', tone: 'normal' },
    { teacher: '陈悦', day: '周一', sessionCount: 1, statusLabel: '带教中', tone: 'normal' },
    { teacher: '陈悦', day: '周二', sessionCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: '陈悦', day: '周三', sessionCount: 0, statusLabel: '空闲', tone: 'idle' },
    { teacher: '陈悦', day: '周四', sessionCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: '陈悦', day: '周五', sessionCount: 2, statusLabel: '正常', tone: 'normal' },
    { teacher: '陈悦', day: '周六', sessionCount: 1, statusLabel: '正常', tone: 'normal' },
    { teacher: '陈悦', day: '周日', sessionCount: 0, statusLabel: '请假', tone: 'leave' },
  ];
  return seeds.map((seed, i) => ({ id: `wl-${i}`, ...seed }));
}

const OWNED_MEMBER_STAGES: Omit<StaffOwnedMemberStageDistribution, 'count'>[] = [
  { stage: 'S0', stageLabel: 'S0 新线索' },
  { stage: 'S1', stageLabel: 'S1 体验待转化' },
  { stage: 'S2', stageLabel: 'S2 新成交激活' },
  { stage: 'S3', stageLabel: 'S3 稳定活跃' },
  { stage: 'S4', stageLabel: 'S4 低频风险' },
  { stage: 'S5', stageLabel: 'S5 续费窗口' },
  { stage: 'S6', stageLabel: 'S6 沉睡流失' },
];

function buildStageDistribution(counts: number[]): StaffOwnedMemberStageDistribution[] {
  return OWNED_MEMBER_STAGES.map((item, i) => ({
    ...item,
    count: counts[i] ?? 0,
  }));
}

const OWNED_MEMBER_DRAWER_ACTIONS = [
  { label: '查看全部名下会员', toastMessage: '查看全部名下会员（待建设）' },
  { label: '提醒老师跟进', toastMessage: '提醒老师跟进（待建设）' },
  { label: '同步会员经营', toastMessage: '同步会员经营（待建设）' },
];

function buildOwnedMemberDrawerDetail(
  teacherId: string,
  totals: {
    total: number;
    active: number;
    highRisk: number;
    followed: number;
    pending: number;
    notVisited14: number;
    newInactive: number;
    renewal: number;
  },
  stageCounts: number[],
  recentActions: StaffOwnedMemberRecentAction[],
  riskNotes: string[],
): StaffOwnedMemberDrawerSummary {
  return {
    overview: {
      totalMembers: `${totals.total} 人`,
      activeMembers: `${totals.active} 人`,
      highRiskMembers: `${totals.highRisk} 人`,
      followedThisWeek: `${totals.followed} 人`,
      pendingFollowUp: `${totals.pending} 人`,
      notVisited14Days: `${totals.notVisited14} 人`,
      newMemberInactive: `${totals.newInactive} 人`,
      renewalWindow: `${totals.renewal} 人`,
    },
    stageDistribution: buildStageDistribution(stageCounts),
    recentActions,
    riskNotes,
    actions: OWNED_MEMBER_DRAWER_ACTIONS,
  };
}

const OWNED_MEMBER_DETAIL_BY_TEACHER: Record<string, StaffOwnedMemberDrawerSummary> = {
  'teacher-mia': buildOwnedMemberDrawerDetail(
    'teacher-mia',
    { total: 32, active: 18, highRisk: 5, followed: 12, pending: 4, notVisited14: 6, newInactive: 1, renewal: 3 },
    [2, 4, 5, 12, 5, 3, 1],
    [
      { memberName: '王静怡', stageLabel: 'S3 稳定活跃', actionStatus: '已约下一节', detail: '老师端已记录' },
      { memberName: '许倩', stageLabel: 'S4 低频风险', actionStatus: '待跟进', detail: '近 21 天未到店' },
      { memberName: '陈雨', stageLabel: 'S1 体验待转化', actionStatus: '待回访', detail: '体验后 24h 未记录' },
      { memberName: '何珊', stageLabel: 'S5 续费窗口', actionStatus: '待沟通', detail: '剩余 18 点' },
    ],
    [
      '高余额低耗课会员需优先跟进',
      '新成交 7 天内未预约需提醒老师处理',
      '续费窗口会员需同步管家或会员经营',
      '老师端跟进记录会进入会员证据链',
    ],
  ),
  'teacher-anna': buildOwnedMemberDrawerDetail(
    'teacher-anna',
    { total: 28, active: 15, highRisk: 3, followed: 10, pending: 2, notVisited14: 4, newInactive: 3, renewal: 2 },
    [1, 5, 6, 10, 3, 2, 1],
    [
      { memberName: '林晓', stageLabel: 'S2 新成交激活', actionStatus: '待约下一节', detail: '成交后 5 天未预约' },
      { memberName: '周敏', stageLabel: 'S3 稳定活跃', actionStatus: '已跟进', detail: '本周已记录沟通' },
      { memberName: '张悦', stageLabel: 'S1 体验待转化', actionStatus: '待回访', detail: '体验课反馈待补' },
      { memberName: '刘芳', stageLabel: 'S4 低频风险', actionStatus: '待观察', detail: '近 18 天未到店' },
    ],
    [
      '新会员未激活需优先安排首次正式预约',
      '体验待转化会员需 24h 内完成回访记录',
      '老师端约课动作会同步到会员经营',
    ],
  ),
  'teacher-nora': buildOwnedMemberDrawerDetail(
    'teacher-nora',
    { total: 24, active: 16, highRisk: 2, followed: 9, pending: 1, notVisited14: 5, newInactive: 0, renewal: 1 },
    [1, 3, 4, 11, 3, 1, 1],
    [
      { memberName: '赵琳', stageLabel: 'S3 稳定活跃', actionStatus: '已约下一节', detail: '连续 3 周练习' },
      { memberName: '孙婷', stageLabel: 'S4 低频风险', actionStatus: '待邀约', detail: '近 14 天未预约' },
      { memberName: '吴佳', stageLabel: 'S3 稳定活跃', actionStatus: '已记录', detail: '课后记录完整' },
      { memberName: '郑雪', stageLabel: 'S4 低频风险', actionStatus: '待观察', detail: '练习频率下降' },
    ],
    [
      '低频会员需筛选适配课程并点对点邀约',
      '预约连续性下降需同步课程与排课',
    ],
  ),
  'teacher-leo': buildOwnedMemberDrawerDetail(
    'teacher-leo',
    { total: 21, active: 13, highRisk: 4, followed: 8, pending: 3, notVisited14: 3, newInactive: 0, renewal: 2 },
    [0, 2, 3, 9, 4, 2, 1],
    [
      { memberName: '黄薇', stageLabel: 'S5 续费窗口', actionStatus: '待沟通', detail: '无最近沟通记录' },
      { memberName: '钱璐', stageLabel: 'S5 续费窗口', actionStatus: '待沟通', detail: '剩余 12 点' },
      { memberName: '沈洁', stageLabel: 'S3 稳定活跃', actionStatus: '已约下一节', detail: '私教课已排' },
      { memberName: '韩冰', stageLabel: 'S4 低频风险', actionStatus: '待跟进', detail: '近 20 天未到店' },
    ],
    [
      '续费窗口会员需补充沟通记录',
      '必要时同步管家或会员经营继续处理',
    ],
  ),
  'teacher-chen': buildOwnedMemberDrawerDetail(
    'teacher-chen',
    { total: 18, active: 11, highRisk: 1, followed: 7, pending: 1, notVisited14: 2, newInactive: 0, renewal: 0 },
    [2, 4, 3, 6, 2, 1, 0],
    [
      { memberName: '冯娜', stageLabel: 'S3 稳定活跃', actionStatus: '已记录', detail: '基础流课后记录完整' },
      { memberName: '曹颖', stageLabel: 'S2 新成交激活', actionStatus: '已约下一节', detail: '跟课会员' },
      { memberName: '丁悦', stageLabel: 'S3 稳定活跃', actionStatus: '记录待补', detail: '近 7 天 1 节课缺记录' },
      { memberName: '蒋雯', stageLabel: 'S4 低频风险', actionStatus: '待观察', detail: '课程频率下降' },
    ],
    [
      '课后记录不完整会影响会员服务留痕',
      '带教期间名下会员跟进需店长协同观察',
    ],
  ),
};

function buildOwnedMemberSummaries(
  teachers: StaffV2TeacherContributionItem[],
): StaffOwnedMemberSummary[] {
  const specs: Omit<StaffOwnedMemberSummary, 'id' | 'teacherId' | 'name' | 'level' | 'stageDistribution' | 'actionLabel'>[] = [
    {
      totalMembers: 32,
      activeMembers: 18,
      highRiskMembers: 5,
      followedThisWeek: 12,
      pendingFollowUp: 4,
      mainRisks: '高余额低耗课 / 临期未续',
      nextAction: '提醒完成 4 名会员跟进',
    },
    {
      totalMembers: 28,
      activeMembers: 15,
      highRiskMembers: 3,
      followedThisWeek: 10,
      pendingFollowUp: 2,
      mainRisks: '新会员未激活',
      nextAction: '补充课后记录',
    },
    {
      totalMembers: 24,
      activeMembers: 16,
      highRiskMembers: 2,
      followedThisWeek: 9,
      pendingFollowUp: 1,
      mainRisks: '低频到店',
      nextAction: '安排下一节',
    },
    {
      totalMembers: 21,
      activeMembers: 13,
      highRiskMembers: 4,
      followedThisWeek: 8,
      pendingFollowUp: 3,
      mainRisks: '续费窗口',
      nextAction: '同步会员经营',
    },
    {
      totalMembers: 18,
      activeMembers: 11,
      highRiskMembers: 1,
      followedThisWeek: 7,
      pendingFollowUp: 1,
      mainRisks: '课程频率下降',
      nextAction: '观察',
    },
  ];

  const stageCountsByTeacher: number[][] = [
    [2, 4, 5, 12, 5, 3, 1],
    [1, 5, 6, 10, 3, 2, 1],
    [1, 3, 4, 11, 3, 1, 1],
    [0, 2, 3, 9, 4, 2, 1],
    [2, 4, 3, 6, 2, 1, 0],
  ];

  return teachers.map((teacher, i) => ({
    id: `om-${teacher.id}`,
    teacherId: teacher.id,
    name: teacher.name,
    level: teacher.level,
    actionLabel: '查看名下会员',
    stageDistribution: buildStageDistribution(stageCountsByTeacher[i] ?? []),
    ...specs[i],
  }));
}

const MIA_APP_PERMISSIONS: StaffV2TeacherAppPermissionSummary = {
  visible: ['自己课表', '当前课程名单', '自己相关会员', '收入预估', '成长进度', '教学资料'],
  operable: ['当前课程签到', '课后记录', '请假申请', '代课申请', '调课申请', '资料上传', '会员跟进记录'],
  restricted: ['发布排课', '修改课程规则', '修改会员资产', '审批自己的请假', '修改课时费', '修改等级', '处理退费 / 转卡 / 冻结'],
};

const MIA_DETAIL: StaffV2TeacherDetail = {
  id: 'teacher-mia',
  title: 'Mia · 老师详情',
  subtitle: 'T4 · 普拉提小班 / 私教 · 滨江馆',
  name: 'Mia',
  level: 'T4',
  specialties: '普拉提小班 / 私教',
  store: '滨江馆',
  statusLabel: '负载偏高',
  weeklySessions: '18 节',
  peakSessions: '7 节',
  profile: {
    phone: '138****6721',
    joinDate: '2023-08-16',
    employmentType: '全职老师',
    roleType: '小班 / 私教老师',
    store: '滨江馆',
    manager: '课程负责人 · 周航',
    employmentStatus: '在职',
    crossStore: '可申请',
    canTeachIndependently: '是',
    canSubstitute: '部分课程可代',
    privacyNote: '手机号在真实系统中需按权限展示，本页面为 mock',
  },
  qualifications: {
    teachableCourses: '普拉提小班、私教、评估课',
    substituteCourses: '普拉提小班、私教',
    restrictedCourses: '内观流、阴瑜伽',
    certifications: '普拉提小班认证、私教评估认证',
    certStatus: '有效',
    internalAssessment: '已通过',
    attachmentStatus: '已归档',
  },
  appPermissions: MIA_APP_PERMISSIONS,
  supply: {
    weeklySessions: '18 节',
    peakSessions: '7 节',
    adjustableSlot: '周四 19:30',
    substituteFor: '普拉提小班 / 私教',
    currentRisk: '负载偏高',
    pendingApplications: '1 条待处理',
  },
  contribution: {
    estimatedConsumption: '96 点',
    theoreticalConsumption: '132 点',
    fillRate: '86%',
    waitlistLinked: '4 人',
    memberRating: '4.8',
  },
  growth: {
    level: 'T4',
    promotionDirection: 'T4 稳定观察',
    mentoringStatus: '可带教 T2/T3',
    certifications: '普拉提小班 / 私教',
    monthlyReview: '晚高峰负载复盘',
    pendingMaterials: '无',
    lastReviewDate: '2026-06-01',
  },
  recentRecords: [
    { label: '课程调整：周四 19:30 普拉提小班', category: 'course' },
    { label: '代课记录：无', category: 'course' },
    { label: '会员反馈：课堂节奏稳定，核心控制强', category: 'course' },
    { label: '带教记录：陈悦基础流跟课 1 次', category: 'course' },
    { label: '请假申请：周五 19:30 普拉提小班（待审核）', category: 'leave' },
    { label: '资料审核：无待审', category: 'material' },
    { label: '权限变更：无近期变更', category: 'permission' },
  ],
  ownedMemberDetail: OWNED_MEMBER_DETAIL_BY_TEACHER['teacher-mia'],
  actions: [
    { label: '调整排课', toastMessage: '进入课程与排课调整（待建设）' },
    { label: '记录复盘', toastMessage: '进入成长与带教（待建设）' },
    { label: '安排带教', toastMessage: '进入成长与带教（待建设）' },
    { label: '查看老师端记录', toastMessage: '进入老师端记录（待建设）' },
    { label: '查看资料审核', toastMessage: '进入资料审核（待建设）' },
  ],
};

function buildGenericDetail(teacher: StaffV2TeacherContributionItem): StaffV2TeacherDetail {
  return {
    id: teacher.id,
    title: `${teacher.name} · 老师详情`,
    subtitle: `${teacher.level} · ${teacher.specialties} · 滨江馆`,
    name: teacher.name,
    level: teacher.level,
    specialties: teacher.specialties,
    store: '滨江馆',
    statusLabel: teacher.statusLabel,
    weeklySessions: teacher.weeklySessions,
    peakSessions: teacher.name === 'Leo' ? '—' : '3 节',
    profile: {
      phone: '138****0000',
      joinDate: '2024-01-10',
      employmentType: '全职老师',
      roleType: teacher.specialties,
      store: '滨江馆',
      manager: '课程负责人 · 周航',
      employmentStatus: '在职',
      crossStore: teacher.name === 'Leo' ? '否' : '可申请',
      canTeachIndependently: teacher.name === '陈悦' ? '部分课程' : '是',
      canSubstitute: teacher.name === 'Leo' ? '私教可代' : '部分课程可代',
      privacyNote: '手机号在真实系统中需按权限展示，本页面为 mock',
    },
    qualifications: {
      teachableCourses: teacher.specialties,
      substituteCourses: teacher.specialties.split(' / ')[0],
      restrictedCourses: teacher.name === 'Leo' ? '团课类' : '—',
      certifications: `${teacher.specialties} 相关认证`,
      certStatus: '有效',
      internalAssessment: teacher.name === '陈悦' ? '观察期' : '已通过',
      attachmentStatus: teacher.name === '陈悦' ? '待补充' : '已归档',
    },
    appPermissions: MIA_APP_PERMISSIONS,
    supply: {
      weeklySessions: teacher.weeklySessions,
      peakSessions: teacher.name === 'Mia' ? '7 节' : teacher.name === 'Anna' ? '4 节' : '2 节',
      adjustableSlot: teacher.name === 'Anna' ? '周三 10:30–12:00' : teacher.name === 'Nora' ? '周五 19:45' : '—',
      substituteFor: teacher.specialties,
      currentRisk: teacher.riskOrOpportunityTone === 'risk' ? teacher.riskOrOpportunity : '暂无',
      pendingApplications: teacher.name === 'Mia' ? '1 条待处理' : '0 条',
    },
    contribution: {
      estimatedConsumption: teacher.estimatedConsumption,
      theoreticalConsumption: teacher.name === 'Leo' ? '128 点' : '96 点',
      fillRate: teacher.fillRate,
      waitlistLinked: teacher.name === 'Nora' ? '2 人' : '0 人',
      memberRating: teacher.memberRating,
    },
    growth: {
      level: teacher.level,
      promotionDirection: teacher.name === 'Nora' ? 'T3 → T4 初评中' : teacher.name === '陈悦' ? 'T2 观察期' : `${teacher.level} 稳定`,
      mentoringStatus: teacher.name === '陈悦' ? '带教中' : '可带教 T2',
      certifications: teacher.specialties,
      monthlyReview: teacher.name === '陈悦' ? '基础流稳定性复盘' : teacher.name === 'Mia' ? '晚高峰负载复盘' : '—',
      pendingMaterials: teacher.name === '陈悦' ? '基础流过课视频待审' : '无',
      lastReviewDate: '2026-06-01',
    },
    recentRecords: [
      { label: `课程调整：${teacher.weeklySessions} 本周排课`, category: 'course' },
      { label: '代课记录：占位', category: 'course' },
      { label: `会员反馈：评分 ${teacher.memberRating}`, category: 'course' },
      { label: '请假申请记录：占位', category: 'leave' },
      { label: '资料审核记录：占位', category: 'material' },
    ],
    ownedMemberDetail: OWNED_MEMBER_DETAIL_BY_TEACHER[teacher.id] ?? buildOwnedMemberDrawerDetail(
      teacher.id,
      { total: 20, active: 12, highRisk: 2, followed: 8, pending: 2, notVisited14: 3, newInactive: 1, renewal: 1 },
      [1, 3, 4, 8, 2, 1, 1],
      [
        { memberName: '会员 A', stageLabel: 'S3 稳定活跃', actionStatus: '已记录', detail: '老师端已记录' },
        { memberName: '会员 B', stageLabel: 'S4 低频风险', actionStatus: '待跟进', detail: '近 14 天未到店' },
      ],
      ['老师端跟进记录会进入会员证据链'],
    ),
    actions: [
      { label: '调整排课', toastMessage: '进入课程与排课调整（待建设）' },
      { label: '记录复盘', toastMessage: '进入成长与带教（待建设）' },
      { label: '查看老师端记录', toastMessage: '进入老师端记录（待建设）' },
    ],
  };
}

export function buildStaffV2Snapshot(): StaffV2Snapshot {
  const teachers: StaffV2TeacherContributionItem[] = [
    {
      id: 'teacher-mia', name: 'Mia', level: 'T4', specialties: '普拉提小班 / 私教',
      weeklySessions: '18 节', estimatedConsumption: '96 点', fillRate: '86%', memberRating: '4.8',
      statusLabel: '负载偏高',
      riskOrOpportunity: '晚高峰集中，普拉提小班依赖高',
      riskOrOpportunityTone: 'risk',
      nextAction: '调配 Nora 分担晚课',
      loadPercent: 88, contributionPercent: 92,
      primaryActionLabel: '详情', secondaryActionLabel: '调整',
    },
    {
      id: 'teacher-anna', name: 'Anna', level: 'T4', specialties: '阴瑜伽 / 肩颈舒缓',
      weeklySessions: '14 节', estimatedConsumption: '72 点', fillRate: '78%', memberRating: '4.7',
      statusLabel: '稳定',
      riskOrOpportunity: '周三上午可补排',
      riskOrOpportunityTone: 'opportunity',
      nextAction: '补排低强度课程',
      loadPercent: 62, contributionPercent: 72,
      primaryActionLabel: '详情', secondaryActionLabel: '补排',
    },
    {
      id: 'teacher-nora', name: 'Nora', level: 'T3', specialties: '流瑜伽 / 内观流',
      weeklySessions: '11 节', estimatedConsumption: '54 点', fillRate: '81%', memberRating: '4.8',
      statusLabel: '可承接',
      riskOrOpportunity: '周五 19:45 可加课',
      riskOrOpportunityTone: 'opportunity',
      nextAction: '评估流瑜伽加课',
      loadPercent: 48, contributionPercent: 58,
      primaryActionLabel: '详情', secondaryActionLabel: '加课',
    },
    {
      id: 'teacher-leo', name: 'Leo', level: 'T5', specialties: '私教 / 评估',
      weeklySessions: '16 节', estimatedConsumption: '128 点', fillRate: '稳定', memberRating: '4.9',
      statusLabel: '私教为主',
      riskOrOpportunity: '团课可用性低',
      riskOrOpportunityTone: 'risk',
      nextAction: '查看私教档期',
      loadPercent: 72, contributionPercent: 95,
      primaryActionLabel: '详情', secondaryActionLabel: '查看',
    },
    {
      id: 'teacher-chen', name: '陈悦', level: 'T2', specialties: '基础流 / 代课',
      weeklySessions: '6 节', estimatedConsumption: '24 点', fillRate: '68%', memberRating: '4.6',
      statusLabel: '带教中',
      riskOrOpportunity: '满课率波动，暂不独立排小班',
      riskOrOpportunityTone: 'risk',
      nextAction: '安排 2 次跟课复盘',
      loadPercent: 38, contributionPercent: 32,
      primaryActionLabel: '详情', secondaryActionLabel: '带教',
    },
  ];

  const teacherDetailMap: Record<string, StaffV2TeacherDetail> = {
    'teacher-mia': MIA_DETAIL,
  };
  teachers.forEach(t => {
    if (!teacherDetailMap[t.id]) teacherDetailMap[t.id] = buildGenericDetail(t);
  });

  return {
    meta: { title: '师资与团队', subtitle: '滨江馆 · 师资供给、老师负载、申请处理与成长带教' },
    filters: {
      storeLabel: '滨江馆',
      roleLabel: '全部老师',
      courseTypeLabel: '全部课程',
      levelLabel: '全部等级',
      statusLabel: '全部状态',
      primaryActionLabel: '新增老师',
      secondaryActionLabel: '成长规则',
      archiveLinkLabel: '师资档案',
    },
    staffSupplySummary: {
      status: 'watch',
      statusLabel: '观察',
      headline: '师资供给状态：观察',
      conclusion:
        '本周整体师资供给基本可承接排课，但晚间普拉提和周末小班存在供给压力，2 位老师负载偏高，1 位老师可补排。当前应优先处理代课 / 请假申请、晚间课程补排和老师名下会员风险。',
      impactTags: ['课程供给', '老师负载', '代课申请', '名下会员'],
      sourceLabel: '系统规则建议',
      updatedAt: '2026-06-26 09:30',
      evidenceItems: [
        { label: '可用老师', value: '12 人' },
        { label: '负载偏高', value: '2 人', isWarning: true },
        { label: '可代课老师', value: '4 人' },
        { label: '老师端待处理申请', value: '5 条', isWarning: true },
        { label: '老师名下会员风险', value: '9 人', isWarning: true },
        { label: '课程覆盖风险', value: '晚间普拉提 / 周末小班', isWarning: true },
      ],
      evidenceButtonLabel: '查看师资判断依据',
      evidenceToastMessage: '查看师资判断依据（待建设）',
    },
    staffPriorityActions: {
      title: '本周师资优先动作',
      subtitle: '优先处理会影响排课、代课、会员承接和教学稳定性的事项',
      items: [
        {
          id: 'spa-1',
          priority: 'P0',
          title: '处理 3 条代课 / 请假申请',
          impact: '本周课程稳定性',
          owner: '店长 / 教学负责人',
          sourceModules: ['老师端申请', '课程与排课'],
          suggestedAction: '确认代课老师与课程名单，避免临时取消课程',
          ctaLabel: '去处理',
          ctaToast: '进入老师申请处理（待建设）',
        },
        {
          id: 'spa-2',
          priority: 'P1',
          title: '补充晚间普拉提小班老师',
          impact: '耗课目标与会员预约体验',
          owner: '教学负责人',
          sourceModules: ['课程与排课', '师资与团队'],
          suggestedAction: '优先协调可代课老师或调整老师空闲时间',
          ctaLabel: '去协调',
          ctaToast: '进入师资协调（待建设）',
        },
        {
          id: 'spa-3',
          priority: 'P1',
          title: '跟进 9 名老师名下风险会员',
          impact: '会员低频、续费和老师承接质量',
          owner: '对应老师 / 管家',
          sourceModules: ['师资与团队', '会员经营'],
          suggestedAction: '让老师补充课后反馈或安排下一节课',
          ctaLabel: '去跟进',
          ctaToast: '进入名下会员跟进（待建设）',
        },
        {
          id: 'spa-4',
          priority: 'P2',
          title: '安排 2 位新老师带教复盘',
          impact: '教学质量与成长稳定性',
          owner: '教学负责人 / 导师',
          sourceModules: ['成长与带教'],
          suggestedAction: '安排听课、复盘和课程反馈',
          ctaLabel: '去安排',
          ctaToast: '进入成长带教安排（待建设）',
        },
      ],
    },
    teacherRequestStability: {
      title: '老师端申请与排课稳定',
      subtitle: '请假、代课、调课和资料申请会直接影响课程交付',
      items: [
        {
          id: 'trs-1',
          priority: 'P0',
          typeLabel: '请假',
          teacher: 'Nora',
          involvedCourse: '周三 19:30 普拉提小班',
          impact: '已预约 5 人，需要代课',
          status: '待店长审核',
          suggestedAction: '安排 Mia 代课或调整课程',
          ctaLabel: '处理申请',
          ctaToast: '进入老师申请处理（待建设）',
          relatedTeacherId: 'teacher-nora',
        },
        {
          id: 'trs-2',
          priority: 'P1',
          typeLabel: '代课',
          teacher: 'Anna',
          involvedCourse: '周六上午瑜伽小班',
          impact: '课程可正常开课，但需确认会员通知',
          status: '待教务确认',
          suggestedAction: '确认代课老师与通知记录',
          ctaLabel: '确认代课',
          ctaToast: '进入老师申请处理（待建设）',
          relatedTeacherId: 'teacher-anna',
        },
        {
          id: 'trs-3',
          priority: 'P1',
          typeLabel: '资料审核',
          teacher: '陈悦',
          involvedCourse: '证书 / 课程视频',
          impact: '可授课程配置未完成',
          status: '待教学负责人审核',
          suggestedAction: '教学负责人审核后开放课程类型',
          ctaLabel: '审核资料',
          ctaToast: '进入老师申请处理（待建设）',
          relatedTeacherId: 'teacher-chen',
        },
        {
          id: 'trs-4',
          priority: 'P2',
          typeLabel: '调课',
          teacher: 'Mia',
          involvedCourse: '周五 19:30 普拉提小班',
          impact: '晚高峰课程需重新协调',
          status: '待确认',
          suggestedAction: '评估代课老师与会员通知',
          ctaLabel: '处理申请',
          ctaToast: '进入老师申请处理（待建设）',
          relatedTeacherId: 'teacher-mia',
        },
      ],
    },
    teacherSupplyCoverageSummary: {
      title: '师资供给与课程覆盖',
      subtitle: '判断哪些老师过载、哪些课程缺老师、哪些时段可以补排',
      workload: {
        highLoadCount: '2 人',
        normalLoadCount: '8 人',
        fillableCount: '1 人',
        substituteCount: '4 人',
        representativeTeachers: [
          { name: 'Mia', note: '负载偏高，晚间课较多' },
          { name: 'Anna', note: '正常，可承接周末小班' },
          { name: 'Nora', note: '本周请假，需代课安排' },
          { name: '陈悦', note: '可补排，适合基础瑜伽' },
        ],
      },
      courseCoverage: [
        {
          id: 'ccs-1',
          courseType: '普拉提小班',
          statusLabel: '观察',
          availableTeachers: '3 人',
          riskNote: '晚间供给不足',
          suggestedAction: '协调 Nora / Anna 承接晚高峰',
        },
        {
          id: 'ccs-2',
          courseType: '瑜伽小班',
          statusLabel: '正常',
          availableTeachers: '4 人',
          riskNote: '周末时段稳定',
          suggestedAction: '保持现有排课结构',
        },
        {
          id: 'ccs-3',
          courseType: '团课',
          statusLabel: '正常',
          availableTeachers: '5 人',
          riskNote: '覆盖充足',
          suggestedAction: '关注满课率与候补释放',
        },
        {
          id: 'ccs-4',
          courseType: '私教',
          statusLabel: '观察',
          availableTeachers: '3 人',
          riskNote: 'T4/T5 老师时段紧张',
          suggestedAction: '控制私教与小班冲突',
        },
        {
          id: 'ccs-5',
          courseType: '教培 / 内训',
          statusLabel: '待安排',
          availableTeachers: '2 人',
          riskNote: '需提前锁定导师档期',
          suggestedAction: '教学负责人安排内训计划',
        },
      ],
      substituteResource: {
        fillableSlots: '6 个',
        substituteTeachers: '4 人',
        recommendedCourses: '周六上午普拉提小班 / 周三晚间基础小班',
        ctaLabel: '查看可补排资源',
        ctaToast: '进入可补排资源（待建设）',
      },
    },
    teacherOwnedMemberRisks: {
      title: '老师名下会员风险',
      subtitle: '老师名下会员的低频、续费和新成交激活，会影响会员经营与老师承接质量',
      teachers: [
        {
          teacherId: 'teacher-mia',
          teacherName: 'Mia',
          ownedMembers: 36,
          riskMembers: 4,
          lowFrequencyRisk: 2,
          renewalWindowRisk: 2,
          lastFollowUp: '3 天前',
          suggestedAction: '补充课后反馈，安排下一节私教',
          ctaLabel: '查看名下会员',
        },
        {
          teacherId: 'teacher-anna',
          teacherName: 'Anna',
          ownedMembers: 28,
          riskMembers: 3,
          newMemberActivationRisk: 2,
          lastFollowUp: '2 天前',
          suggestedAction: '安排首次课后反馈',
          ctaLabel: '查看名下会员',
        },
        {
          teacherId: 'teacher-nora',
          teacherName: 'Nora',
          ownedMembers: 22,
          riskMembers: 2,
          renewalWindowRisk: 1,
          lastFollowUp: '5 天前',
          suggestedAction: '与管家同步续费窗口会员情况',
          ctaLabel: '查看名下会员',
        },
      ],
    },
    staffIssueReviewQueue: {
      title: '师资问题队列',
      subtitle: '用于复盘供给、覆盖、申请、成长和名下会员风险',
      items: [
        {
          id: 'sir-1',
          priority: 'P1',
          title: '周末小班师资覆盖不足',
          origin: 'course_link',
          originLabel: '课程与排课',
          fact: '周六上午 2 节小班仅 1 位主授老师',
          impact: '周末耗课与会员预约体验',
          owner: '教学负责人',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '评估 Anna / Nora 补排周末小班',
          actionLabel: '去协调',
          toastMessage: '进入师资协调（待建设）',
        },
        {
          id: 'sir-2',
          priority: 'P1',
          title: '教培 / 内训待安排',
          origin: 'growth_review',
          originLabel: '成长与带教',
          fact: '本月内训计划尚未锁定导师档期',
          impact: '新老师成长与教学质量',
          owner: '教学负责人',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          suggestionAction: '提前安排导师与听课计划',
          actionLabel: '去安排',
          toastMessage: '进入成长带教安排（待建设）',
        },
        {
          id: 'sir-3',
          priority: 'P1',
          title: 'T4/T5 私教时段紧张',
          origin: 'system',
          originLabel: '系统判断',
          fact: 'Leo / Mia 晚间私教档期接近上限',
          impact: '高价值会员预约体验',
          owner: '店长',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '控制私教与小班冲突，必要时调整排课',
          actionLabel: '查看档期',
          toastMessage: '进入课程与排课（待建设）',
          relatedTeacherId: 'teacher-leo',
        },
        {
          id: 'sir-4',
          priority: 'P2',
          title: '新老师独立授课资格待确认',
          origin: 'material_review',
          originLabel: '资料审核',
          fact: '陈悦基础流过课视频已提交，普拉提小班仍不可独立',
          impact: '课程供给与带教安排',
          owner: '教学负责人',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '完成资料审核后再开放课程类型',
          actionLabel: '审核资料',
          toastMessage: '进入老师申请处理（待建设）',
          relatedTeacherId: 'teacher-chen',
        },
        {
          id: 'sir-5',
          priority: 'P2',
          title: '跨店代课规则待同步',
          origin: 'teacher_app',
          originLabel: '老师端申请',
          fact: '2 位老师提交跨店代课意向，规则说明未同步',
          impact: '代课安排与会员通知',
          owner: '教务',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          suggestionAction: '同步跨店代课规则与老师端说明',
          actionLabel: '去同步',
          toastMessage: '进入师资规则配置（待建设）',
        },
      ],
    },
    teacherGrowthSummary: {
      title: '老师贡献与成长带教',
      subtitle: '关注教学稳定性、成长路径和带教安排，不展示工资或课时费明细',
      contribution: {
        title: '老师贡献与稳定性摘要',
        items: [
          {
            id: 'tcs-1',
            name: 'Mia',
            statusLabel: '稳定授课',
            contributionNote: '普拉提小班主力，本周 18 节',
            qualityNote: '会员评分 4.8，满课率 86%',
            riskNote: '晚高峰集中，需分担',
          },
          {
            id: 'tcs-2',
            name: 'Anna',
            statusLabel: '稳定授课',
            contributionNote: '阴瑜伽 / 肩颈舒缓覆盖稳定',
            qualityNote: '会员承接质量良好',
          },
          {
            id: 'tcs-3',
            name: 'Nora',
            statusLabel: '可承接加课',
            contributionNote: '流瑜伽 / 内观流贡献稳定',
            qualityNote: '适合周末小班补排',
          },
        ],
      },
      growth: {
        title: '成长与带教入口',
        pendingReviewTeachers: '2 人',
        pendingMaterials: '3 份',
        pendingObservations: '2 次',
        promotionWatch: '1 人',
        ctaLabel: '查看成长与带教',
        ctaToast: '进入成长带教安排（待建设）',
      },
    },
    warroom: {
      section: {
        title: '本周师资供给判断',
        subtitle: '结合课程需求、老师负载、可补排时段和成长状态判断本周团队是否稳定',
      },
      supplySummary: {
        section: { title: '师资供给结论', subtitle: '' },
        title: '师资供给结论',
        conclusion: '本周整体供给可控，但晚高峰普拉提师资偏紧',
        description: 'Mia 晚高峰负载偏高，Nora 可承接周五 19:45 加课；普拉提小班仍是主要供给压力来源。',
        statusTags: ['P1 晚高峰压力'],
        suggestionSource: 'system_rule',
        suggestionSourceLabel: '系统规则建议',
        evidence: [
          { label: '活跃老师', value: '8 人' },
          { label: '本周排课', value: '72 节' },
          { label: '晚高峰课程', value: '26 节' },
          { label: '可补排时段', value: '4 个' },
        ],
        actionLabel: '查看供给证据',
      },
      attentionPanel: {
        title: '本周师资风险与机会',
        items: [
          { id: 'ah-1', title: '晚高峰负载偏高', count: '2 人', description: 'Mia / Anna 晚间排课接近上限', tone: 'risk', actionLabel: '调整', toastMessage: '进入课程与排课调整（待建设）' },
          { id: 'ah-2', title: '可补排老师', count: '3 人', description: 'Nora / Anna / Leo 有可用档期', tone: 'opportunity', actionLabel: '补排', toastMessage: '进入补排建议（待建设）' },
          { id: 'ah-3', title: '代课候选', count: '2 人', description: 'Nora 可承接流瑜伽，Anna 可承接修复类', tone: 'dispatch', actionLabel: '代课', toastMessage: '进入代课安排（待建设）' },
          { id: 'ah-4', title: '需带教老师', count: '2 人', description: '新老师稳定性仍需观察', tone: 'growth', actionLabel: '带教', toastMessage: '进入成长与带教（待建设）' },
        ],
      },
      availabilitySummary: {
        title: '本周可用状态',
        items: [
          { id: 'av-1', title: '可补排', teachers: 'Nora / Anna / Leo', description: '本周有可用档期', tone: 'available' },
          { id: 'av-2', title: '负载偏高', teachers: 'Mia / Anna', description: '晚高峰排课接近上限', tone: 'high_load' },
          { id: 'av-3', title: '仅私教 / 受限排课', teachers: 'Leo', description: '私教为主，不建议临时排团课', tone: 'restricted' },
          { id: 'av-4', title: '带教中不可独立', teachers: '陈悦', description: '基础流可跟课，普拉提小班不可独立', tone: 'mentoring' },
        ],
      },
    },
    teacherApplications: {
      title: '老师端待处理申请',
      subtitle: '来自老师端小程序的请假、代课、调课、补签、资料和成长申请',
      items: [
        {
          id: 'ta-1', type: 'leave', typeLabel: '请假申请', teacher: 'Mia',
          summary: '周五 19:30 普拉提小班', detail: '原因：身体不适',
          impact: '需确认是否由 Nora 代课', status: '待店长审核', assignee: '店长 · 林悦',
          actionLabel: '审核', toastMessage: '进入请假审批流（待建设）', relatedTeacherId: 'teacher-mia',
        },
        {
          id: 'ta-2', type: 'substitute', typeLabel: '代课申请', teacher: 'Nora',
          summary: '周五 19:45 流瑜伽加课候选', detail: '可承接同类课程',
          status: '待教务确认', assignee: '教务 · 王敏',
          actionLabel: '确认', toastMessage: '进入代课审批流（待建设）', relatedTeacherId: 'teacher-nora',
        },
        {
          id: 'ta-3', type: 'resign', typeLabel: '补签申请', teacher: 'Anna',
          summary: '昨日肩颈舒缓', detail: '1 名会员扫码失败，老师提交补签说明',
          status: '待核对', assignee: '教务 · 王敏',
          actionLabel: '核对', toastMessage: '进入补签审批流（待建设）', relatedTeacherId: 'teacher-anna',
        },
        {
          id: 'ta-4', type: 'material', typeLabel: '资料审核', teacher: '陈悦',
          summary: '基础流过课视频', detail: '申请独立授课资格',
          status: '待教学负责人审核', assignee: '教学负责人 · 周航',
          actionLabel: '审核', toastMessage: '进入资料审核（待建设）', relatedTeacherId: 'teacher-chen',
        },
        {
          id: 'ta-5', type: 'promotion', typeLabel: '晋级评定', teacher: 'Nora',
          summary: 'T3 → T4', detail: '本月指标已达成 4/6 项',
          status: '待初评', assignee: '店长 · 林悦',
          actionLabel: '初评', toastMessage: '进入晋级评定（待建设）', relatedTeacherId: 'teacher-nora',
        },
      ],
    },
    workloadHeatmap: {
      title: '老师负载热力',
      subtitle: '按本周排课、晚高峰、连续上课和可用档期判断老师负载',
      teacherLabels: TEACHER_LABELS,
      dayLabels: DAY_LABELS,
      legend: [
        { label: '空闲', tone: 'idle' },
        { label: '正常', tone: 'normal' },
        { label: '可补排', tone: 'available' },
        { label: '负载偏高', tone: 'high' },
        { label: '请假 / 不可排', tone: 'leave' },
      ],
      cells: buildWorkloadCells(),
    },
    courseCoverage: {
      title: '课程类型师资覆盖',
      subtitle: '按课程类型查看可授课老师、供给风险与加课能力',
      items: [
        {
          id: 'cc-1', courseType: '普拉提小班', teacherCount: '3 人', weeklySessions: '18 节', fillRate: '82%',
          coverageStatus: '偏紧', coverageTone: 'tight',
          roleMap: { primary: 'Mia', substitute: 'Nora', mentoring: '陈悦' },
          risk: '晚高峰依赖 Mia',
          suggestionAction: '安排 Nora 承接晚高峰小班，陈悦继续跟课', actionLabel: '查看',
          indicators: [{ label: '师资覆盖', level: 'low' }, { label: '需求热度', level: 'high' }, { label: '加课能力', level: 'mid' }],
        },
        {
          id: 'cc-2', courseType: '流瑜伽', teacherCount: '4 人', weeklySessions: '12 节', fillRate: '88%',
          coverageStatus: '稳定', coverageTone: 'stable',
          roleMap: { primary: 'Nora', substitute: 'Anna', mentoring: '陈悦' },
          risk: '候补时段需加课',
          suggestionAction: '评估 Nora 周五 19:45 加课', actionLabel: '加课', toastMessage: '进入加课建议（待建设）',
          indicators: [{ label: '师资覆盖', level: 'high' }, { label: '需求热度', level: 'high' }, { label: '加课能力', level: 'mid' }],
        },
        {
          id: 'cc-3', courseType: '内观流', teacherCount: '2 人', weeklySessions: '4 节', fillRate: '64%',
          coverageStatus: '可补员', coverageTone: 'fillable',
          roleMap: { primary: 'Nora', substitute: 'Anna', mentoring: '暂无' },
          risk: '可代课老师仅 2 人',
          suggestionAction: '补充代课老师池', actionLabel: '匹配', toastMessage: '进入会员经营匹配名单（待建设）',
          indicators: [{ label: '师资覆盖', level: 'low' }, { label: '需求热度', level: 'mid' }, { label: '加课能力', level: 'low' }],
        },
        {
          id: 'cc-4', courseType: '肩颈舒缓', teacherCount: '4 人', weeklySessions: '8 节', fillRate: '76%',
          coverageStatus: '稳定', coverageTone: 'stable',
          roleMap: { primary: 'Anna', substitute: '陈悦', mentoring: '陈悦' },
          risk: '适合低频会员召回，需保证教学稳定',
          suggestionAction: '用于 S4 低频会员召回', actionLabel: '查看',
          indicators: [{ label: '师资覆盖', level: 'high' }, { label: '需求热度', level: 'mid' }, { label: '加课能力', level: 'mid' }],
        },
        {
          id: 'cc-5', courseType: '私教 / 评估', teacherCount: '3 人', weeklySessions: '16 节', fillRate: '稳定',
          coverageStatus: '档期紧', coverageTone: 'schedule_tight',
          roleMap: { primary: 'Leo', substitute: 'Mia', mentoring: '暂无' },
          risk: 'Leo 档期紧',
          suggestionAction: '控制私教与小班冲突', actionLabel: '查看',
          indicators: [{ label: '师资覆盖', level: 'mid' }, { label: '需求热度', level: 'high' }, { label: '加课能力', level: 'low' }],
        },
      ],
    },
    ownedMemberManagement: {
      title: '老师名下会员管理',
      subtitle: '查看老师负责会员的阶段分布、跟进状态、预约连续性和风险承接',
      teacherSummaries: buildOwnedMemberSummaries(teachers),
      queue: [
        {
          id: 'omq-1',
          priority: 'P0',
          title: 'Mia 名下 4 名高余额低耗课会员未完成跟进',
          fact: '剩余点数均超过 60 点，近 30 天到店 ≤ 2 次',
          impact: 'Mia 名下会员 4 人',
          teacherAppStatus: '待跟进',
          relatedModules: '会员经营 / 课程与排课',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '提醒老师完成跟进，并同步会员经营',
          actionLabel: '提醒老师',
          toastMessage: '提醒老师跟进（待建设）',
          relatedTeacherId: 'teacher-mia',
        },
        {
          id: 'omq-2',
          priority: 'P1',
          title: 'Anna 名下新会员 7 天未预约',
          fact: '3 名新成交会员 7 天内未完成首次正式预约',
          impact: 'Anna 名下会员 3 人',
          teacherAppStatus: '待约下一节',
          relatedModules: '会员经营 / 今日运营',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          suggestionAction: '安排老师点对点邀约',
          actionLabel: '分配跟进',
          toastMessage: '分配跟进（待建设）',
          relatedTeacherId: 'teacher-anna',
        },
        {
          id: 'omq-3',
          priority: 'P1',
          title: 'Leo 名下续费窗口会员未记录沟通',
          fact: '2 名会员进入 S5 续费窗口，但无最近沟通记录',
          impact: 'Leo 名下会员 2 人',
          teacherAppStatus: '未记录',
          relatedModules: '会员经营',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '补充沟通记录，必要时同步管家',
          actionLabel: '记录提醒',
          toastMessage: '记录提醒（待建设）',
          relatedTeacherId: 'teacher-leo',
        },
        {
          id: 'omq-4',
          priority: 'P1',
          title: 'Nora 名下低频会员预约连续性下降',
          fact: '5 名会员近 14 天未预约，历史练习频率下降',
          impact: 'Nora 名下会员 5 人',
          teacherAppStatus: '待观察',
          relatedModules: '课程与排课 / 会员经营',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '筛选适配课程，发起点对点邀约',
          actionLabel: '查看名单',
          toastMessage: '查看名单（待建设）',
          relatedTeacherId: 'teacher-nora',
        },
        {
          id: 'omq-5',
          priority: 'P2',
          title: '陈悦名下会员课后记录不完整',
          fact: '近 7 天有 3 节课缺少课后记录',
          impact: '陈悦名下会员 6 人',
          teacherAppStatus: '记录待补',
          relatedModules: '今日运营 / 师资与团队',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          suggestionAction: '提醒补充课后记录',
          actionLabel: '提醒',
          toastMessage: '提醒老师跟进（待建设）',
          relatedTeacherId: 'teacher-chen',
        },
      ],
    },
    teacherContribution: {
      title: '老师贡献与稳定性',
      subtitle: '按耗课贡献、满课率、会员反馈和排课稳定性查看老师状态',
      teachers,
    },
    staffIssueQueue: {
      title: '师资问题队列',
      subtitle: '负载、代课、请假、带教与课程稳定性问题',
      items: [
        {
          id: 'si-1', priority: 'P1', title: 'Mia 晚高峰负载偏高',
          origin: 'system', originLabel: '系统识别',
          fact: '本周晚高峰排课 7 节，高于建议上限', impact: '课程稳定性 / 老师状态',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '由 Nora 分担周五 19:45 加课', actionLabel: '调整',
          relatedTeacherId: 'teacher-mia', toastMessage: '进入课程与排课调整（待建设）',
        },
        {
          id: 'si-2', priority: 'P1', title: '普拉提小班师资偏紧',
          origin: 'course_link', originLabel: '课程与排课联动',
          fact: '晚高峰普拉提主要依赖 Mia', impact: '加课能力 / 课程供给',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '安排 Nora 进入小班带教', actionLabel: '带教',
          relatedTeacherId: 'teacher-nora', toastMessage: '进入成长与带教（待建设）',
        },
        {
          id: 'si-3', priority: 'P1', title: 'Mia 请假申请待审核',
          origin: 'teacher_app', originLabel: '老师端申请',
          fact: 'Mia 提交周五晚课请假申请', impact: '课程稳定 / 代课安排',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '确认是否由 Nora 代课', actionLabel: '审核',
          relatedTeacherId: 'teacher-mia', toastMessage: '进入请假审批流（待建设）',
        },
        {
          id: 'si-4', priority: 'P2', title: '陈悦独立授课资格待审',
          origin: 'material_review', originLabel: '资料审核',
          fact: '陈悦已提交基础流过课视频', impact: '独立排课资格 / 师资覆盖',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          suggestionAction: '教学负责人审核后决定是否开放独立排课', actionLabel: '审核',
          relatedTeacherId: 'teacher-chen', toastMessage: '进入资料审核（待建设）',
        },
        {
          id: 'si-5', priority: 'P2', title: 'Nora 晋级初评待处理',
          origin: 'growth_review', originLabel: '成长评定',
          fact: 'T3 → T4 指标达成 4/6 项', impact: '等级晋升 / 师资梯队',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          suggestionAction: '店长完成初评并提交教学总监复核', actionLabel: '初评',
          relatedTeacherId: 'teacher-nora', toastMessage: '进入晋级评定（待建设）',
        },
      ],
    },
    growthCoaching: {
      title: '成长与带教',
      subtitle: '查看老师等级、带教进度与下次复盘动作',
      levelDistribution: [
        { level: 'T2', count: '1 人' },
        { level: 'T3', count: '1 人' },
        { level: 'T4', count: '2 人' },
        { level: 'T5', count: '1 人' },
      ],
      promotionReviews: [
        { id: 'pr-1', teacher: 'Nora', summary: 'T3 → T4，达成 4/6 项，待店长初评' },
        { id: 'pr-2', teacher: '陈悦', summary: 'T2 观察期，待 2 次跟课复盘' },
        { id: 'pr-3', teacher: 'Mia', summary: 'T4 稳定，需晚高峰负载复盘' },
        { id: 'pr-4', teacher: 'Anna', summary: 'T4 稳定，适合带教陈悦' },
      ],
      materialReviews: [
        { id: 'mr-1', text: '陈悦：基础流过课视频，待审核' },
        { id: 'mr-2', text: 'Nora：普拉提小班带教记录，需补充' },
        { id: 'mr-3', text: 'RYT / 继续教育记录：2 人待更新' },
        { id: 'mr-4', text: '证书即将过期：1 人' },
      ],
      nextActions: [
        { id: 'ga-1', label: '安排带教', toastMessage: '进入成长与带教二级页（待建设）' },
        { id: 'ga-2', label: '上传证书', toastMessage: '进入成长与带教二级页（待建设）' },
        { id: 'ga-3', label: '记录复盘', toastMessage: '进入成长与带教二级页（待建设）' },
        { id: 'ga-4', label: '提交初评', toastMessage: '进入成长与带教二级页（待建设）' },
        { id: 'ga-5', label: '调整排课', toastMessage: '进入课程与排课调整（待建设）' },
      ],
    },
    teacherDetailMap,
  };
}

export function getStaffSupplyStatusClass(status: StaffSupplyStatus): string {
  switch (status) {
    case 'healthy':
      return 'met-staff-v2-status--healthy';
    case 'watch':
      return 'met-staff-v2-status--watch';
    case 'warning':
      return 'met-staff-v2-status--warning';
    case 'highRisk':
      return 'met-staff-v2-status--high-risk';
    default:
      return 'met-staff-v2-status--watch';
  }
}

export function getWorkloadToneClass(tone: StaffV2WorkloadTone): string {
  const map: Record<StaffV2WorkloadTone, string> = {
    idle: 'is-idle',
    normal: 'is-normal',
    available: 'is-available',
    high: 'is-high',
    leave: 'is-leave',
  };
  return map[tone];
}

export function getAttentionToneClass(tone: StaffV2AttentionTone): string {
  const map: Record<StaffV2AttentionTone, string> = {
    risk: 'is-risk',
    opportunity: 'is-opportunity',
    dispatch: 'is-dispatch',
    growth: 'is-growth',
  };
  return map[tone];
}

export function getCoverageToneClass(tone: StaffV2CoverageStatus): string {
  const map: Record<StaffV2CoverageStatus, string> = {
    tight: 'is-tight',
    stable: 'is-stable',
    fillable: 'is-fillable',
    schedule_tight: 'is-schedule-tight',
  };
  return map[tone];
}

export function getIndicatorDotCount(level: 'low' | 'mid' | 'high'): number {
  return { low: 1, mid: 2, high: 3 }[level];
}

export function getAvailabilityToneClass(tone: StaffV2AvailabilityTone): string {
  const map: Record<StaffV2AvailabilityTone, string> = {
    available: 'is-available',
    high_load: 'is-high-load',
    restricted: 'is-restricted',
    mentoring: 'is-mentoring',
  };
  return map[tone];
}

export function getIssueOriginClass(origin: StaffV2IssueOrigin): string {
  const map: Record<StaffV2IssueOrigin, string> = {
    system: 'is-system',
    teacher_app: 'is-teacher-app',
    course_link: 'is-course-link',
    growth_review: 'is-growth-review',
    material_review: 'is-material-review',
  };
  return map[origin];
}

export function getApplicationTypeClass(type: StaffV2ApplicationType): string {
  const map: Record<StaffV2ApplicationType, string> = {
    leave: 'is-leave',
    substitute: 'is-substitute',
    resign: 'is-resign',
    material: 'is-material',
    promotion: 'is-promotion',
  };
  return map[type];
}
