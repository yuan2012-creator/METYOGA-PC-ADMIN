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
  actions: { label: string; toastMessage: string }[];
}

export interface StaffV2Snapshot {
  meta: StaffV2Meta;
  filters: StaffV2Filters;
  warroom: StaffV2Warroom;
  teacherApplications: StaffV2TeacherApplications;
  workloadHeatmap: StaffV2WorkloadHeatmap;
  courseCoverage: StaffV2CourseCoverage;
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
    meta: { title: '师资与团队', subtitle: '滨江馆 · 师资供给、负载与成长管理' },
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
