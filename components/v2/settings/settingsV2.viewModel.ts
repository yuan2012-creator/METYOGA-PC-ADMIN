export type SettingsSuggestionSource = 'system_rule' | 'pending_config';
export type SettingsConfigStatus = 'configured' | 'partial' | 'pending';
export type SettingsRiskTone = 'risk' | 'approval' | 'notification' | 'permission';
export type SettingsRiskLevel = 'high' | 'medium' | 'low';
export type SettingsMessageStatus = 'active' | 'pending' | 'draft';
export type SettingsPriority = 'P0' | 'P1' | 'P2';
export type SettingsDetailType =
  | 'rules'
  | 'permission'
  | 'approval'
  | 'contract'
  | 'message'
  | 'params'
  | 'logs'
  | 'productRights';

export interface SettingsMeta {
  title: string;
  subtitle: string;
}

export interface SettingsFilter {
  scopeLabel: string;
  typeLabel: string;
  statusLabel: string;
  riskLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  logLinkLabel: string;
}

export interface SettingsEvidenceMetric {
  label: string;
  value: string;
}

export interface SettingsHealthSummary {
  section: { title: string; subtitle: string };
  title: string;
  conclusion: string;
  description: string;
  statusTags: string[];
  suggestionSource: SettingsSuggestionSource;
  suggestionSourceLabel: string;
  evidence: SettingsEvidenceMetric[];
  actionLabel: string;
}

export interface ConfigurationRiskItem {
  id: string;
  title: string;
  count: string;
  description: string;
  tone: SettingsRiskTone;
  actionLabel: string;
  toastMessage: string;
  relatedDetailId?: string;
}

export interface RuleDomainItem {
  id: string;
  name: string;
  status: string;
  statusLevel: SettingsConfigStatus;
  ruleCount: string;
  coverage: string;
  ports: string;
  risk: string;
  actionLabel: string;
  detailId?: string;
  toastMessage?: string;
}

export interface PermissionRoleItem {
  id: string;
  role: string;
  visible: string[];
  operable: string[];
  restricted: string[];
  risk: string;
  actionLabel: string;
  detailId?: string;
}

export interface ApprovalFlowItem {
  id: string;
  group: string;
  items: string[];
  status: string;
  statusLevel: SettingsConfigStatus;
  risk: string;
  defaultApprover: string;
  needDoubleConfirm: boolean;
  needEvidence: boolean;
  syncNotify: boolean;
  writeLog: boolean;
  actionLabel: string;
  toastMessage: string;
}

export interface ContractTemplateItem {
  id: string;
  name: string;
  status: string;
  statusLevel: SettingsConfigStatus;
  version: string;
  applicable: string;
  keyTerms: string;
  eSign: string;
  risk: string;
  actionLabel: string;
  detailId?: string;
  toastMessage?: string;
}

export interface MessageRuleItem {
  id: string;
  type: string;
  receiver: string;
  trigger: string;
  sendTime: string;
  closable: boolean;
  status: string;
  statusLevel: SettingsMessageStatus;
  risk?: string;
  isHighRisk?: boolean;
}

export interface BusinessParameterItem {
  id: string;
  name: string;
  fields: string[];
  status: string;
  statusLevel: SettingsConfigStatus;
}

export interface OperationLogItem {
  id: string;
  action: string;
  operator: string;
  time: string;
  impact: string;
  riskLevel: SettingsRiskLevel;
  actionLabel: string;
  detailId?: string;
}

export interface AuditRequiredAction {
  label: string;
}

export interface EvidenceChainItem {
  label: string;
  value: string;
}

export interface SettingDetail {
  id: string;
  title: string;
  subtitle: string;
  basicInfo: EvidenceChainItem[];
  ruleContent: EvidenceChainItem[];
  impactScope: string[];
  riskNotes: string[];
  evidenceChain: EvidenceChainItem[];
  actions: { label: string; toastMessage: string }[];
}

export interface PermissionDetail {
  id: string;
  title: string;
  subtitle: string;
  visible: string[];
  operable: string[];
  restricted: string[];
  sensitiveFields: string[];
  approvalLimits: string[];
  logRequirements: string[];
  syncStatus: string;
  actions: { label: string; toastMessage: string }[];
}

export interface ContractDetail {
  id: string;
  title: string;
  subtitle: string;
  version: string;
  applicable: string;
  keyTerms: string[];
  eSign: string;
  displayTerms: string;
  associations: string[];
  recentChanges: EvidenceChainItem[];
  actions: { label: string; toastMessage: string }[];
}

export interface ControlCenterEntry {
  id: string;
  title: string;
  coverage: string;
  metrics: SettingsEvidenceMetric[];
  risk: string;
  status: string;
  statusLevel: SettingsConfigStatus;
  actionLabel: string;
  detailType: SettingsDetailType;
  featured?: boolean;
  navigateTo?: 'product-rights';
}

export interface HighRiskConfigItem {
  id: string;
  priority: SettingsPriority;
  title: string;
  fact: string;
  impact: string;
  relatedModules: string;
  suggestionSource: SettingsSuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  toastMessage: string;
  relatedDetailType?: SettingsDetailType;
}

export interface SettingsEntrySummaryItem {
  label: string;
  summary: string;
  status?: string;
  actionLabel?: string;
  toastMessage?: string;
  detailId?: string;
  detailKind?: 'setting' | 'permission' | 'contract';
}

export interface SettingsEntryDetail {
  id: SettingsDetailType;
  title: string;
  subtitle: string;
  sections: { title: string; items: SettingsEntrySummaryItem[] }[];
  actions: { label: string; toastMessage: string }[];
}

export interface OperationLogDetail {
  id: string;
  title: string;
  subtitle: string;
  operator: string;
  time: string;
  impact: string;
  riskLevel: SettingsRiskLevel;
  oldValue: string;
  newValue: string;
  approvalRecord: string;
  evidenceChain: EvidenceChainItem[];
  actions: { label: string; toastMessage: string }[];
}

export interface SettingsDetailMaps {
  settingDetailMap: Record<string, SettingDetail>;
  permissionDetailMap: Record<string, PermissionDetail>;
  contractDetailMap: Record<string, ContractDetail>;
  entryDetailMap: Record<SettingsDetailType, SettingsEntryDetail>;
  logDetailMap: Record<string, OperationLogDetail>;
}

export interface SettingsV2Snapshot {
  meta: SettingsMeta;
  filters: SettingsFilter;
  healthSummary: SettingsHealthSummary;
  configurationRisks: { title: string; items: ConfigurationRiskItem[] };
  controlCenterEntries: { title: string; subtitle: string; entries: ControlCenterEntry[] };
  highRiskQueue: { title: string; subtitle: string; items: HighRiskConfigItem[] };
  operationLogs: { title: string; subtitle: string; logs: OperationLogItem[] };
  auditRequiredActions: AuditRequiredAction[];
  detailMaps: SettingsDetailMaps;
  ruleMap: { title: string; subtitle: string; domains: RuleDomainItem[] };
  permissionRoles: { title: string; subtitle: string; roles: PermissionRoleItem[] };
  approvalFlows: { title: string; subtitle: string; flows: ApprovalFlowItem[] };
  contractTemplates: {
    title: string;
    subtitle: string;
    templates: ContractTemplateItem[];
    evidenceRequirements: string[];
  };
  messageRules: { title: string; subtitle: string; rules: MessageRuleItem[] };
  businessParameters: { title: string; subtitle: string; items: BusinessParameterItem[] };
}

const BOOKING_RULE_DETAIL: SettingDetail = {
  id: 'rule-booking-cancel',
  title: '预约与取消规则 · 配置详情',
  subtitle: '会员端 / 老师端 / PC 后台共用规则',
  basicInfo: [
    { label: '规则名称', value: '预约与取消规则' },
    { label: '规则状态', value: '已配置' },
    { label: '适用门店', value: '全部门店' },
    { label: '适用端口', value: '会员端 / 老师端 / PC 后台' },
    { label: '当前版本', value: 'v2026.06' },
    { label: '生效时间', value: '2026-06-01 00:00' },
  ],
  ruleContent: [
    { label: '预约窗口', value: '提前 1–7 天可预约' },
    { label: '取消时限', value: '开课前 2 小时可免费取消' },
    { label: '爽约处理', value: '扣 1 点，计入爽约记录' },
    { label: '免责取消', value: '每月 1 次免责取消' },
    { label: '补签规则', value: '需前台申请 + 店长审批' },
  ],
  impactScope: ['会员预约', '老师课表', '今日运营', '课程与排课', '财务确认收入'],
  riskNotes: [
    '补签会影响会员扣点、确认收入和老师课时',
    '修改后需同步消息通知',
  ],
  evidenceChain: [
    { label: '修改人', value: '总部管理员' },
    { label: '修改时间', value: '2026-06-26 10:12' },
    { label: '旧版本', value: 'v2026.04' },
    { label: '新版本', value: 'v2026.06' },
    { label: '审批记录', value: '店长复核通过' },
    { label: '操作日志', value: '已写入' },
  ],
  actions: [
    { label: '编辑规则', toastMessage: '进入规则编辑（待建设）' },
    { label: '查看历史版本', toastMessage: '查看历史版本（待建设）' },
    { label: '记录变更', toastMessage: '记录变更（待建设）' },
  ],
};

const TEACHER_PERMISSION_DETAIL: PermissionDetail = {
  id: 'role-teacher',
  title: '老师角色权限 · 配置详情',
  subtitle: '老师端权限边界',
  visible: [
    '自己课表',
    '当前课程名单',
    '自己相关会员',
    '收入预估',
    '成长进度',
  ],
  operable: [
    '签到确认',
    '课后记录',
    '请假 / 代课 / 调课申请',
    '资料上传',
  ],
  restricted: [
    '发布排课',
    '审批自己申请',
    '修改会员资产',
    '修改课时费',
    '修改等级',
  ],
  sensitiveFields: ['会员手机号完整显示', '合同金额', '其他老师收入'],
  approvalLimits: ['请假需店长审批', '代课需教学负责人确认', '调课需排课协调'],
  logRequirements: ['签到确认', '课后记录', '所有申请操作'],
  syncStatus: '老师端已同步 v2026.06',
  actions: [
    { label: '编辑权限', toastMessage: '进入权限编辑（待建设）' },
    { label: '查看同步日志', toastMessage: '查看同步日志（待建设）' },
  ],
};

const MEMBER_CONTRACT_DETAIL: ContractDetail = {
  id: 'contract-member-service',
  title: '会员服务合同 · 模板详情',
  subtitle: '额度型会籍 / 期限卡 / Flex',
  version: '2026.04',
  applicable: '额度型会籍 / 期限卡 / Flex',
  keyTerms: [
    '赠送权益不退费',
    '退费服务费 10%',
    '转卡手续费 ¥200',
    '预约取消规则',
  ],
  eSign: '已启用',
  displayTerms: '重点条款已在签约页外显',
  associations: ['订单', '卡项资产', '支付记录', '重点条款确认', '操作日志'],
  recentChanges: [
    { label: '最近修改', value: '2026-06-24 16:00' },
    { label: '修改人', value: '总部管理员' },
    { label: '变更内容', value: '补充转卡手续费条款' },
  ],
  actions: [
    { label: '查看模板', toastMessage: '查看合同模板（待建设）' },
    { label: '编辑模板', toastMessage: '进入合同编辑（待建设）' },
  ],
};

export function buildSettingsV2Snapshot(): SettingsV2Snapshot {
  return {
    meta: {
      title: '系统设置',
      subtitle: '总部控制中心 · 规则、权限、审批、合同、消息与证据链',
    },
    filters: {
      scopeLabel: '全部门店',
      typeLabel: '全部类型',
      statusLabel: '全部状态',
      riskLabel: '全部风险',
      primaryActionLabel: '新增配置',
      secondaryActionLabel: '导出配置清单',
      logLinkLabel: '操作日志',
    },
    healthSummary: {
      section: {
        title: '系统配置健康判断',
        subtitle: '检查规则、权限、审批、合同和消息是否支撑前台业务闭环',
      },
      title: '系统配置结论',
      conclusion: '核心经营规则已覆盖，但退费与老师端审批仍需补齐证据链',
      description:
        '会员权益、预约取消、积分、合同模板已完成基础配置；退费/冻结/转卡审批、老师端请假代课、补签核对和消息通知仍需进一步完善。',
      statusTags: ['P1 证据链补齐'],
      suggestionSource: 'system_rule',
      suggestionSourceLabel: '系统规则建议',
      evidence: [
        { label: '已启用规则', value: '42 条' },
        { label: '待补配置', value: '8 项' },
        { label: '角色权限', value: '7 类' },
        { label: '审批流', value: '12 条' },
      ],
      actionLabel: '查看配置证据链',
    },
    configurationRisks: {
      title: '待补齐配置与风险',
      items: [
        {
          id: 'cr-1', title: '退费审批证据链', count: '3 项待补',
          description: '合同、耗课、积分、会员确认需完整', tone: 'risk',
          actionLabel: '补齐', toastMessage: '进入退费证据链补齐（待建设）',
          relatedDetailId: 'rule-refund-transfer',
        },
        {
          id: 'cr-2', title: '老师端审批流', count: '4 条待完善',
          description: '请假、代课、调课、资料审核', tone: 'approval',
          actionLabel: '配置', toastMessage: '进入审批流配置（待建设）',
        },
        {
          id: 'cr-3', title: '消息通知模板', count: '6 条待确认',
          description: '预约提醒、取消、补签、退款进度', tone: 'notification',
          actionLabel: '确认', toastMessage: '进入消息模板确认（待建设）',
        },
        {
          id: 'cr-4', title: '权限边界校验', count: '2 个角色需复核',
          description: '前台/老师敏感信息可见范围', tone: 'permission',
          actionLabel: '复核', toastMessage: '进入权限复核（待建设）',
          relatedDetailId: 'role-teacher',
        },
      ],
    },
    ruleMap: {
      title: '规则配置地图',
      subtitle: '按业务模块查看当前生效规则，保证会员端、老师端和后台口径一致',
      domains: [
        {
          id: 'rd-1', name: '会员权益规则', status: '已配置', statusLevel: 'configured',
          ruleCount: '9 条', coverage: '卡项有效期、点数、赠送权益、预约窗口、请假规则',
          ports: '会员端 / PC 后台', risk: '赠送权益不退费需持续外显',
          actionLabel: '查看规则', detailId: 'rule-member-benefit',
        },
        {
          id: 'rd-2', name: '预约与取消规则', status: '已配置', statusLevel: 'configured',
          ruleCount: '7 条', coverage: '预约窗口、取消时限、免责取消、爽约、补签',
          ports: '会员端 / 老师端 / PC 后台', risk: '补签影响耗课与收入确认',
          actionLabel: '查看规则', detailId: 'rule-booking-cancel',
        },
        {
          id: 'rd-3', name: '签到与耗课规则', status: '待完善', statusLevel: 'pending',
          ruleCount: '6 条', coverage: '扫码签到、老师确认、前台补签、扣点、确认收入',
          ports: '会员端 / 老师端 / 财务', risk: '补签审批证据链需补齐',
          actionLabel: '完善', detailId: 'rule-checkin',
        },
        {
          id: 'rd-4', name: '退费 / 转卡 / 冻结规则', status: '待完善', statusLevel: 'pending',
          ruleCount: '8 条', coverage: '服务费、违约金、手续费、冻结材料、转卡限制',
          ports: '会员经营 / 财务与资产', risk: '合同、耗课、积分、会员确认必须闭环',
          actionLabel: '完善', detailId: 'rule-refund-transfer',
        },
        {
          id: 'rd-5', name: '积分与商城规则', status: '已配置', statusLevel: 'configured',
          ruleCount: '5 条', coverage: '积分获取、积分消耗、兑换、退款积分处理、过期',
          ports: '会员端 / 财务与资产', risk: '退费时积分抵扣需明确',
          actionLabel: '查看规则', detailId: 'rule-points',
        },
        {
          id: 'rd-6', name: '老师端规则', status: '待完善', statusLevel: 'pending',
          ruleCount: '7 条', coverage: '课表查看、请假、代课、调课、补签申请、资料上传',
          ports: '老师端 / 师资与团队', risk: '老师端不能直接改排课、资产、课时费、等级',
          actionLabel: '完善', detailId: 'rule-teacher-app',
        },
        {
          id: 'rd-7', name: '课时费与成长规则', status: '部分配置', statusLevel: 'partial',
          ruleCount: '6 条', coverage: '等级、满课率、课时费预估、成长指标、晋级审核',
          ports: '老师端 / 师资与团队 / 财务', risk: '预估与最终核定必须区分',
          actionLabel: '配置', detailId: 'rule-lesson-fee',
        },
        {
          id: 'rd-8', name: '跨店与结算规则', status: '已配置', statusLevel: 'configured',
          ruleCount: '4 条', coverage: '通馆、消课店70%、卖卡店30%、最低结算点单价 Pmin 105',
          ports: '财务与资产 / 经营总览', risk: '跨店耗课需进入结算证据',
          actionLabel: '查看规则', detailId: 'rule-cross-store',
        },
      ],
    },
    permissionRoles: {
      title: '角色权限矩阵',
      subtitle: '控制总部、店长、前台、老师和运营能看什么、能操作什么、能审批什么',
      roles: [
        {
          id: 'pr-1', role: '总部管理员',
          visible: ['全门店经营', '财务', '会员', '老师', '规则'],
          operable: ['规则配置', '权限配置', '审批复核', '数据导出'],
          restricted: ['不可跳过操作日志记录'],
          risk: '高权限需二次确认', actionLabel: '查看权限', detailId: 'role-admin',
        },
        {
          id: 'pr-2', role: '投资人 / 馆主',
          visible: ['全门店经营摘要', '财务概览', '会员概览'],
          operable: ['查看报表', '审批重大事项'],
          restricted: ['不可修改规则', '不可直接操作会员资产'],
          risk: '敏感财务字段需限制', actionLabel: '查看权限', detailId: 'role-investor',
        },
        {
          id: 'pr-3', role: '店长',
          visible: ['本店经营', '会员', '排课', '老师', '部分财务'],
          operable: ['排课调整', '跟进分配', '老师审批初审'],
          restricted: ['修改总部规则', '财务最终核定'],
          risk: '敏感财务字段需限制', actionLabel: '查看权限', detailId: 'role-store-manager',
        },
        {
          id: 'pr-4', role: '前台 / 管家',
          visible: ['本店会员', '今日运营', '预约签到'],
          operable: ['签到核销', '会员跟进', '补签申请'],
          restricted: ['修改会员资产', '审批退费'],
          risk: '身份证、合同敏感字段需脱敏', actionLabel: '查看权限', detailId: 'role-frontdesk',
        },
        {
          id: 'pr-5', role: '老师',
          visible: ['自己课表', '当前课程名单', '自己相关会员', '收入预估', '成长进度'],
          operable: ['签到确认', '课后记录', '请假/代课/调课申请', '资料上传'],
          restricted: ['发布排课', '审批自己申请', '修改资产', '修改课时费', '修改等级'],
          risk: '老师端权限边界必须严格', actionLabel: '查看权限', detailId: 'role-teacher',
        },
        {
          id: 'pr-6', role: '运营',
          visible: ['活动', '线索', '渠道', '会员经营摘要'],
          operable: ['活动配置', '线索分配', '内容节点'],
          restricted: ['退款', '冻结', '会员资产', '财务核定'],
          risk: '避免群发和过度触达', actionLabel: '查看权限', detailId: 'role-ops',
        },
        {
          id: 'pr-7', role: '财务',
          visible: ['实收', '确认收入', '预收负债', '资产风险', '结算'],
          operable: ['对账', '课时费核定', '结算处理'],
          restricted: ['修改课程', '修改老师等级'],
          risk: '所有资产调整需证据链', actionLabel: '查看权限', detailId: 'role-finance',
        },
      ],
    },
    approvalFlows: {
      title: '审批流配置',
      subtitle: '涉及权益、资产、排课、老师和财务的关键操作必须经过审批和留痕',
      flows: [
        {
          id: 'af-1', group: '会员资产审批',
          items: ['退费申请', '转卡申请', '冻结申请', '赠送权益调整'],
          status: '待完善', statusLevel: 'pending', risk: '需合同、支付、耗课、会员确认',
          defaultApprover: '店长初审 → 总部复核', needDoubleConfirm: true, needEvidence: true,
          syncNotify: true, writeLog: true, actionLabel: '配置',
          toastMessage: '进入审批流配置（待建设）',
        },
        {
          id: 'af-2', group: '课程与签到审批',
          items: ['补签申请', '撤销签到', '手动扣点', '爽约处理'],
          status: '部分配置', statusLevel: 'partial', risk: '影响确认收入和老师课时',
          defaultApprover: '前台申请 → 店长审批', needDoubleConfirm: false, needEvidence: true,
          syncNotify: true, writeLog: true, actionLabel: '配置',
          toastMessage: '进入审批流配置（待建设）',
        },
        {
          id: 'af-3', group: '老师端审批',
          items: ['请假申请', '代课申请', '调课申请', '资料审核', '晋级初评'],
          status: '待完善', statusLevel: 'pending', risk: '影响排课稳定和老师成长',
          defaultApprover: '教学负责人 / 店长', needDoubleConfirm: false, needEvidence: true,
          syncNotify: true, writeLog: true, actionLabel: '配置',
          toastMessage: '进入审批流配置（待建设）',
        },
        {
          id: 'af-4', group: '财务审批',
          items: ['退款复核', '跨店结算', '课时费核定', '支付异常处理'],
          status: '部分配置', statusLevel: 'partial', risk: '影响现金流和财务归档',
          defaultApprover: '财务负责人', needDoubleConfirm: true, needEvidence: true,
          syncNotify: true, writeLog: true, actionLabel: '配置',
          toastMessage: '进入审批流配置（待建设）',
        },
        {
          id: 'af-5', group: '活动与线索审批',
          items: ['活动预算', '渠道合作', '线索导出', '群发触达限制'],
          status: '待确认', statusLevel: 'pending', risk: '避免过度营销和数据外泄',
          defaultApprover: '运营负责人 → 总部确认', needDoubleConfirm: true, needEvidence: false,
          syncNotify: false, writeLog: true, actionLabel: '配置',
          toastMessage: '进入审批流配置（待建设）',
        },
      ],
    },
    contractTemplates: {
      title: '合同与协议配置',
      subtitle: '管理会员合同、重点条款、电子签署和合同证据链',
      templates: [
        {
          id: 'ct-1', name: '会员服务合同', status: '已启用', statusLevel: 'configured',
          version: '2026.04', applicable: '额度型会籍 / 期限卡 / Flex',
          keyTerms: '赠送权益不退费、退费服务费、转卡手续费、预约取消',
          eSign: '已启用', risk: '重点条款必须外显',
          actionLabel: '查看模板', detailId: 'contract-member-service',
        },
        {
          id: 'ct-2', name: '教培服务合同', status: '已启用', statusLevel: 'configured',
          version: '2026.05', applicable: 'RYT200 / RYT300 / RYS500',
          keyTerms: '学习有效期、考试、退费、补课、证书',
          eSign: '待完善', risk: '教培周期长，证据链需完整',
          actionLabel: '查看模板', detailId: 'contract-training',
        },
        {
          id: 'ct-3', name: '退款 / 转卡 / 冻结协议', status: '待完善', statusLevel: 'pending',
          version: '草稿', applicable: '资产变更',
          keyTerms: '剩余权益、服务费、手续费、积分处理、会员确认',
          eSign: '待配置', risk: '纠纷高发',
          actionLabel: '完善', detailId: 'contract-asset-change',
          toastMessage: '进入合同完善（待建设）',
        },
        {
          id: 'ct-4', name: '隐私与授权协议', status: '部分配置', statusLevel: 'partial',
          version: '2026.01', applicable: '会员信息、照片视频、体态评估、老师资料',
          keyTerms: '信息使用、肖像授权、健康告知、隐私保护',
          eSign: '待确认', risk: '敏感信息需授权',
          actionLabel: '查看', detailId: 'contract-privacy',
        },
      ],
      evidenceRequirements: [
        '合同模板版本', '签署人', '签署时间', '订单 / 卡项资产',
        '支付记录', '重点条款确认', '操作日志',
      ],
    },
    messageRules: {
      title: '消息通知配置',
      subtitle: '管理会员端、老师端、PC 后台的消息触发规则和通知模板',
      rules: [
        { id: 'mr-1', type: '预约成功', receiver: '会员端', trigger: '预约确认', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-2', type: '预约前提醒', receiver: '会员端', trigger: '开课前 2 小时', sendTime: '定时', closable: true, status: '已启用', statusLevel: 'active' },
        { id: 'mr-3', type: '取消 / 爽约', receiver: '会员端 / PC 后台', trigger: '取消或爽约', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active', risk: '影响扣点记录' },
        { id: 'mr-4', type: '补签结果', receiver: '会员端 / 老师端', trigger: '补签审批完成', sendTime: '即时', closable: false, status: '待确认', statusLevel: 'pending', isHighRisk: true, risk: '影响耗课与收入' },
        { id: 'mr-5', type: '会员资产临期', receiver: '会员端 / PC 后台', trigger: '到期前 7 天', sendTime: '每日 10:00', closable: true, status: '已启用', statusLevel: 'active' },
        { id: 'mr-6', type: '高余额低耗课', receiver: 'PC 后台', trigger: '余额 > ¥5000 且 30 天未耗课', sendTime: '每周一', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-7', type: '退款 / 冻结 / 转卡进度', receiver: '会员端 / PC 后台', trigger: '审批状态变更', sendTime: '即时', closable: false, status: '待确认', statusLevel: 'pending', isHighRisk: true, risk: '资产变更需留痕' },
        { id: 'mr-8', type: '老师请假 / 代课 / 调课', receiver: '老师端 / PC 后台', trigger: '申请或审批', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-9', type: '资料审核结果', receiver: '老师端', trigger: '审核完成', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-10', type: '新线索分配', receiver: 'PC 后台', trigger: '线索分配', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-11', type: '新会员激活', receiver: 'PC 后台 / 会员端', trigger: '成交后激活', sendTime: '即时', closable: false, status: '已启用', statusLevel: 'active' },
        { id: 'mr-12', type: '财务异常', receiver: 'PC 后台 / 财务', trigger: '对账异常', sendTime: '即时', closable: false, status: '待确认', statusLevel: 'pending', isHighRisk: true, risk: '需及时处理' },
      ],
    },
    businessParameters: {
      title: '门店与业务参数',
      subtitle: '配置门店、通馆、营业时间、点数、结算和基础业务参数',
      items: [
        {
          id: 'bp-1', name: '门店基础配置', status: '已配置', statusLevel: 'configured',
          fields: ['门店名称', '地址', '营业状态', '联系电话', '开放端口'],
        },
        {
          id: 'bp-2', name: '营业时间与预约窗口', status: '已配置', statusLevel: 'configured',
          fields: ['营业时间', '预约提前天数', '取消时限', '免责取消'],
        },
        {
          id: 'bp-3', name: '点数与卡项参数', status: '已配置', statusLevel: 'configured',
          fields: ['1 点 = ¥125', '小班扣点', '私教扣点', 'Flex 规则'],
        },
        {
          id: 'bp-4', name: '通馆与跨店规则', status: '已配置', statusLevel: 'configured',
          fields: ['是否通馆', '消课店 70%', '卖卡店 30%', 'Pmin = 105'],
        },
        {
          id: 'bp-5', name: '积分与商城参数', status: '已配置', statusLevel: 'configured',
          fields: ['开卡积分', '耗课返积分', '积分兑换', '退费积分处理'],
        },
        {
          id: 'bp-6', name: '财务与结算参数', status: '部分配置', statusLevel: 'partial',
          fields: ['支付手续费阶梯', '周结规则', '课时费核定周期', '跨店结算周期'],
        },
      ],
    },
    operationLogs: {
      title: '最近操作与证据链',
      subtitle: '关键操作必须记录操作人、时间、变更前后和影响对象',
      logs: [
        {
          id: 'ol-1', action: '修改预约取消规则', operator: '总部管理员',
          time: '2026-06-26 10:12', impact: '会员端预约', riskLevel: 'medium',
          actionLabel: '查看', detailId: 'rule-booking-cancel',
        },
        {
          id: 'ol-2', action: '审核冻结申请', operator: '店长 · 林敏',
          time: '2026-06-26 11:20', impact: '会员资产', riskLevel: 'high',
          actionLabel: '查看', detailId: 'rule-refund-transfer',
        },
        {
          id: 'ol-3', action: '调整老师可授课程', operator: '教学负责人 · 陈悦',
          time: '2026-06-25 18:40', impact: '排课权限', riskLevel: 'medium',
          actionLabel: '查看', detailId: 'role-teacher',
        },
        {
          id: 'ol-4', action: '导出财务报告', operator: '财务 · 周岚',
          time: '2026-06-25 17:22', impact: '财务数据', riskLevel: 'high',
          actionLabel: '查看',
        },
        {
          id: 'ol-5', action: '更新合同模板', operator: '总部管理员',
          time: '2026-06-24 16:00', impact: '会员合同', riskLevel: 'high',
          actionLabel: '查看', detailId: 'contract-member-service',
        },
        {
          id: 'ol-6', action: '配置活动线索权限', operator: '运营 · 小林',
          time: '2026-06-24 14:10', impact: '线索数据', riskLevel: 'medium',
          actionLabel: '查看', detailId: 'role-ops',
        },
      ],
    },
    auditRequiredActions: [
      { label: '会员资产变更' },
      { label: '退费 / 转卡 / 冻结' },
      { label: '补签 / 手动扣点' },
      { label: '合同模板修改' },
      { label: '权限修改' },
      { label: '财务导出' },
      { label: '老师等级调整' },
      { label: '跨店结算' },
      { label: '活动线索导出' },
    ],
    controlCenterEntries: {
      title: '核心配置入口地图',
      subtitle: '按业务控制范围进入规则、权限、审批、合同、消息和门店参数配置',
      entries: [
        {
          id: 'ce-rules', title: '业务规则',
          coverage: '会员权益、预约取消、签到耗课、积分商城、跨店结算',
          metrics: [
            { label: '已启用', value: '42 条' },
            { label: '待完善', value: '3 条' },
          ],
          risk: '补签与资产变更规则需补齐', status: '部分待完善', statusLevel: 'partial',
          actionLabel: '查看规则', detailType: 'rules',
        },
        {
          id: 'ce-product-rights',
          title: '产品与权益配置',
          coverage: '卡项、积分、赠送权益与合同条款由「产品与权益」统一管理，系统设置仅显示配置健康状态。',
          metrics: [
            { label: '卡项', value: '8 个' },
            { label: '积分商品', value: '12 个' },
            { label: '待绑定合同', value: '2 项' },
            { label: '待确认规则', value: '4 条' },
          ],
          risk: '配置健康状态摘要；详细配置请进入「产品与权益」模块',
          status: '待完善',
          statusLevel: 'pending',
          actionLabel: '进入产品与权益',
          detailType: 'productRights',
          featured: true,
          navigateTo: 'product-rights',
        },
        {
          id: 'ce-permission', title: '角色权限',
          coverage: '总部、投资人、店长、前台、老师、运营、财务',
          metrics: [
            { label: '角色', value: '7 类' },
            { label: '待复核', value: '2 类' },
          ],
          risk: '老师 / 前台敏感字段边界需复核', status: '需复核', statusLevel: 'pending',
          actionLabel: '查看权限', detailType: 'permission',
        },
        {
          id: 'ce-approval', title: '审批流',
          coverage: '退费、冻结、转卡、补签、请假、代课、财务复核',
          metrics: [
            { label: '审批流', value: '12 条' },
            { label: '待完善', value: '4 条' },
          ],
          risk: '资产审批证据链不完整', status: '待完善', statusLevel: 'pending',
          actionLabel: '配置审批', detailType: 'approval',
        },
        {
          id: 'ce-contract', title: '合同与协议',
          coverage: '会员合同、教培合同、退款协议、隐私授权',
          metrics: [
            { label: '模板', value: '4 份' },
            { label: '待完善', value: '2 份' },
          ],
          risk: '退款 / 冻结协议仍为草稿', status: '部分配置', statusLevel: 'partial',
          actionLabel: '查看合同', detailType: 'contract',
        },
        {
          id: 'ce-message', title: '消息通知',
          coverage: '会员端、老师端、PC 后台',
          metrics: [
            { label: '规则', value: '12 条' },
            { label: '待确认', value: '6 条' },
          ],
          risk: '退款、补签、冻结进度通知需确认', status: '待确认', statusLevel: 'pending',
          actionLabel: '查看通知', detailType: 'message',
        },
        {
          id: 'ce-params', title: '门店与业务参数',
          coverage: '门店、营业时间、预约窗口、点数、通馆、积分、结算',
          metrics: [
            { label: '参数组', value: '6 组' },
            { label: '待完善', value: '1 组' },
          ],
          risk: '财务结算参数部分待配置', status: '基本完成', statusLevel: 'configured',
          actionLabel: '查看参数', detailType: 'params',
        },
        {
          id: 'ce-logs', title: '操作日志与证据链',
          coverage: '规则修改、资产审批、合同模板、财务导出、权限变更',
          metrics: [
            { label: '今日日志', value: '18 条' },
            { label: '高风险操作', value: '4 条' },
          ],
          risk: '高权限操作需二次确认', status: '持续记录', statusLevel: 'configured',
          actionLabel: '查看日志', detailType: 'logs',
        },
      ],
    },
    highRiskQueue: {
      title: '高风险配置队列',
      subtitle: '优先处理会影响权益、资产、收入确认和权限边界的配置缺口',
      items: [
        {
          id: 'hr-1', priority: 'P0', title: '退费审批证据链待补',
          fact: '退款 / 转卡 / 冻结协议仍有 3 项证据要求未配置',
          impact: '会员资产、合同争议、财务退款',
          relatedModules: '财务与资产 / 会员经营',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '补齐合同、支付、耗课、会员确认字段',
          actionLabel: '补齐', toastMessage: '进入退费证据链补齐（待建设）',
          relatedDetailType: 'rules',
        },
        {
          id: 'hr-2', priority: 'P0', title: '补签规则影响收入确认',
          fact: '老师端补签申请与财务确认收入尚未完全联动',
          impact: '签到、耗课、老师课时、确认收入',
          relatedModules: '今日运营 / 课程与排课 / 财务与资产',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '配置补签审批与证据链',
          actionLabel: '配置', toastMessage: '进入审批流配置（待建设）',
          relatedDetailType: 'approval',
        },
        {
          id: 'hr-3', priority: 'P1', title: '老师端请假 / 代课审批待完善',
          fact: '请假、代课、调课仍缺少完整审批状态',
          impact: '排课稳定、会员通知、老师端记录',
          relatedModules: '师资与团队 / 课程与排课',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '配置老师端申请审批流',
          actionLabel: '配置', toastMessage: '进入审批流配置（待建设）',
          relatedDetailType: 'approval',
        },
        {
          id: 'hr-4', priority: 'P1', title: '前台敏感字段权限需复核',
          fact: '身份证、合同、联系方式等字段可见范围需复核',
          impact: '会员隐私、合同证据链',
          relatedModules: '会员经营 / 系统设置',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '复核前台 / 管家权限',
          actionLabel: '复核', toastMessage: '进入权限复核（待建设）',
          relatedDetailType: 'permission',
        },
        {
          id: 'hr-5', priority: 'P1', title: '消息通知模板待确认',
          fact: '预约提醒、取消、补签、退款进度等 6 条模板待确认',
          impact: '会员端、老师端、PC 后台待办',
          relatedModules: '今日运营 / 会员经营 / 财务与资产',
          suggestionSource: 'system_rule', suggestionSourceLabel: '系统规则建议',
          suggestionAction: '确认触发条件与模板内容',
          actionLabel: '确认', toastMessage: '进入消息模板确认（待建设）',
          relatedDetailType: 'message',
        },
        {
          id: 'hr-6', priority: 'P2', title: '跨店结算参数需归档',
          fact: '消课店 70%、卖卡店 30%、Pmin 105 已配置但未归档确认',
          impact: '财务结算、经营总览',
          relatedModules: '财务与资产 / 经营总览',
          suggestionSource: 'pending_config', suggestionSourceLabel: '待配置规则',
          suggestionAction: '归档结算规则版本',
          actionLabel: '归档', toastMessage: '进入结算规则归档（待建设）',
          relatedDetailType: 'params',
        },
      ],
    },
    detailMaps: {
      settingDetailMap: {
        'rule-booking-cancel': BOOKING_RULE_DETAIL,
        'rule-refund-transfer': {
          ...BOOKING_RULE_DETAIL,
          id: 'rule-refund-transfer',
          title: '退费 / 转卡 / 冻结规则 · 配置详情',
          subtitle: '会员经营 / 财务与资产共用规则',
          basicInfo: [
            { label: '规则名称', value: '退费 / 转卡 / 冻结规则' },
            { label: '规则状态', value: '待完善' },
            { label: '适用门店', value: '全部门店' },
            { label: '适用端口', value: '会员经营 / 财务与资产' },
            { label: '当前版本', value: '草稿' },
            { label: '生效时间', value: '待发布' },
          ],
          ruleContent: [
            { label: '退费服务费', value: '10%' },
            { label: '转卡手续费', value: '¥200' },
            { label: '冻结材料', value: '需合同 + 会员确认' },
            { label: '积分处理', value: '按原路退回规则' },
            { label: '证据要求', value: '合同、支付、耗课、会员确认' },
          ],
          riskNotes: ['合同、耗课、积分、会员确认必须闭环', '纠纷高发场景需完整证据链'],
        },
      },
      permissionDetailMap: {
        'role-teacher': TEACHER_PERMISSION_DETAIL,
        'role-ops': {
          ...TEACHER_PERMISSION_DETAIL,
          id: 'role-ops',
          title: '运营角色权限 · 配置详情',
          subtitle: '活动与获客权限边界',
          visible: ['活动', '线索', '渠道', '会员经营摘要'],
          operable: ['活动配置', '线索分配', '内容节点'],
          restricted: ['退款', '冻结', '会员资产', '财务核定', '自动群发'],
          syncStatus: 'PC 后台已同步',
        },
      },
      contractDetailMap: {
        'contract-member-service': MEMBER_CONTRACT_DETAIL,
      },
      entryDetailMap: {
        rules: {
          id: 'rules',
          title: '业务规则 · 配置详情',
          subtitle: '8 个规则域摘要',
          sections: [{
            title: '规则域',
            items: [
              { label: '会员权益规则', summary: '9 条 · 已配置', status: '已配置', detailId: 'rule-member-benefit', detailKind: 'setting', actionLabel: '查看', toastMessage: '查看规则详情（待建设）' },
              { label: '预约与取消规则', summary: '7 条 · 已配置', status: '已配置', detailId: 'rule-booking-cancel', detailKind: 'setting', actionLabel: '查看' },
              { label: '签到与耗课规则', summary: '6 条 · 待完善', status: '待完善', actionLabel: '完善', toastMessage: '完善签到规则（待建设）' },
              { label: '退费 / 转卡 / 冻结规则', summary: '8 条 · 待完善', status: '待完善', detailId: 'rule-refund-transfer', detailKind: 'setting', actionLabel: '完善' },
              { label: '积分与商城规则', summary: '5 条 · 已配置', status: '已配置', actionLabel: '查看', toastMessage: '查看规则详情（待建设）' },
              { label: '老师端规则', summary: '7 条 · 待完善', status: '待完善', actionLabel: '完善', toastMessage: '完善老师端规则（待建设）' },
              { label: '课时费与成长规则', summary: '6 条 · 部分配置', status: '部分配置', actionLabel: '配置', toastMessage: '配置课时费规则（待建设）' },
              { label: '跨店与结算规则', summary: '4 条 · 已配置', status: '已配置', actionLabel: '查看', toastMessage: '查看规则详情（待建设）' },
            ],
          }],
          actions: [{ label: '进入规则配置', toastMessage: '进入规则配置（待建设）' }],
        },
        permission: {
          id: 'permission',
          title: '角色权限 · 配置详情',
          subtitle: '7 类角色权限摘要',
          sections: [{
            title: '角色矩阵',
            items: [
              { label: '总部管理员', summary: '全权限 · 高权限需二次确认', actionLabel: '查看', toastMessage: '查看权限详情（待建设）' },
              { label: '投资人 / 馆主', summary: '经营摘要 · 敏感财务字段需限制', actionLabel: '查看', toastMessage: '查看权限详情（待建设）' },
              { label: '店长', summary: '本店经营 · 不可修改总部规则', actionLabel: '查看', toastMessage: '查看权限详情（待建设）' },
              { label: '前台 / 管家', summary: '预约签到 · 敏感字段需脱敏', detailId: 'role-frontdesk', detailKind: 'permission', actionLabel: '复核', toastMessage: '复核前台权限（待建设）' },
              { label: '老师', summary: '课表与成长 · 权限边界必须严格', detailId: 'role-teacher', detailKind: 'permission', actionLabel: '查看' },
              { label: '运营', summary: '活动线索 · 避免群发', detailId: 'role-ops', detailKind: 'permission', actionLabel: '查看' },
              { label: '财务', summary: '财务结算 · 资产调整需证据链', actionLabel: '查看', toastMessage: '查看权限详情（待建设）' },
            ],
          }],
          actions: [{ label: '进入权限配置', toastMessage: '进入权限配置（待建设）' }],
        },
        approval: {
          id: 'approval',
          title: '审批流 · 配置详情',
          subtitle: '5 组审批流摘要',
          sections: [{
            title: '审批分组',
            items: [
              { label: '会员资产审批', summary: '退费、转卡、冻结、赠送权益 · 待完善', status: '待完善', actionLabel: '配置', toastMessage: '进入审批流配置（待建设）' },
              { label: '课程与签到审批', summary: '补签、撤销签到、手动扣点 · 部分配置', status: '部分配置', actionLabel: '配置', toastMessage: '进入审批流配置（待建设）' },
              { label: '老师端审批', summary: '请假、代课、调课、资料审核 · 待完善', status: '待完善', actionLabel: '配置', toastMessage: '进入审批流配置（待建设）' },
              { label: '财务审批', summary: '退款复核、跨店结算、课时费核定 · 部分配置', status: '部分配置', actionLabel: '配置', toastMessage: '进入审批流配置（待建设）' },
              { label: '活动与线索审批', summary: '活动预算、线索导出 · 待确认', status: '待确认', actionLabel: '配置', toastMessage: '进入审批流配置（待建设）' },
            ],
          }],
          actions: [{ label: '进入审批流配置', toastMessage: '进入审批流配置（待建设）' }],
        },
        contract: {
          id: 'contract',
          title: '合同与协议 · 配置详情',
          subtitle: '4 份合同模板摘要',
          sections: [{
            title: '合同模板',
            items: [
              { label: '会员服务合同', summary: '2026.04 · 已启用', status: '已启用', detailId: 'contract-member-service', detailKind: 'contract', actionLabel: '查看' },
              { label: '教培服务合同', summary: '2026.05 · 电子签署待完善', status: '已启用', actionLabel: '查看', toastMessage: '查看合同模板（待建设）' },
              { label: '退款 / 转卡 / 冻结协议', summary: '草稿 · 待完善', status: '待完善', actionLabel: '完善', toastMessage: '进入合同完善（待建设）' },
              { label: '隐私与授权协议', summary: '2026.01 · 部分配置', status: '部分配置', actionLabel: '查看', toastMessage: '查看合同模板（待建设）' },
            ],
          }],
          actions: [{ label: '进入合同配置', toastMessage: '进入合同配置（待建设）' }],
        },
        message: {
          id: 'message',
          title: '消息通知 · 配置详情',
          subtitle: '12 类消息规则摘要',
          sections: [{
            title: '消息类型',
            items: [
              { label: '预约成功 / 预约前提醒', summary: '会员端 · 已启用', status: '已启用' },
              { label: '取消 / 爽约', summary: '会员端 / PC 后台 · 已启用', status: '已启用' },
              { label: '补签结果', summary: '待确认 · 影响耗课与收入', status: '待确认', actionLabel: '确认', toastMessage: '确认消息模板（待建设）' },
              { label: '退款 / 冻结 / 转卡进度', summary: '待确认 · 资产变更需留痕', status: '待确认', actionLabel: '确认', toastMessage: '确认消息模板（待建设）' },
              { label: '老师请假 / 代课 / 调课', summary: '老师端 / PC 后台 · 已启用', status: '已启用' },
              { label: '财务异常', summary: '待确认 · 需及时处理', status: '待确认', actionLabel: '确认', toastMessage: '确认消息模板（待建设）' },
            ],
          }],
          actions: [{ label: '进入消息配置', toastMessage: '进入消息配置（待建设）' }],
        },
        params: {
          id: 'params',
          title: '门店与业务参数 · 配置详情',
          subtitle: '6 类业务参数摘要',
          sections: [{
            title: '参数组',
            items: [
              { label: '门店基础配置', summary: '名称、地址、营业状态 · 已配置', status: '已配置' },
              { label: '营业时间与预约窗口', summary: '营业时间、取消时限 · 已配置', status: '已配置' },
              { label: '点数与卡项参数', summary: '1 点 = ¥125 · 已配置', status: '已配置' },
              { label: '通馆与跨店规则', summary: '70% / 30% / Pmin 105 · 已配置', status: '已配置' },
              { label: '积分与商城参数', summary: '开卡积分、耗课返积分 · 已配置', status: '已配置' },
              { label: '财务与结算参数', summary: '手续费、周结规则 · 部分配置', status: '部分配置', actionLabel: '配置', toastMessage: '配置结算参数（待建设）' },
            ],
          }],
          actions: [{ label: '进入参数配置', toastMessage: '进入参数配置（待建设）' }],
        },
        logs: {
          id: 'logs',
          title: '操作日志与证据链 · 详情',
          subtitle: '最近高风险操作摘要',
          sections: [{
            title: '最近操作',
            items: [
              { label: '修改预约取消规则', summary: '总部管理员 · 2026-06-26 10:12', actionLabel: '查看', detailId: 'ol-1', detailKind: 'setting' },
              { label: '审核冻结申请', summary: '店长 · 林敏 · 2026-06-26 11:20', actionLabel: '查看', detailId: 'ol-2', detailKind: 'setting' },
              { label: '导出财务报告', summary: '财务 · 周岚 · 2026-06-25 17:22', actionLabel: '查看', detailId: 'ol-4', detailKind: 'setting' },
            ],
          }],
          actions: [{ label: '进入操作日志', toastMessage: '进入操作日志二级页（待建设）' }],
        },
        productRights: {
          id: 'productRights',
          title: '产品与权益配置',
          subtitle: '统一管理卡项、点数、预约权益、积分商城、赠送权益与合同绑定',
          sections: [
            {
              title: '配置概览',
              items: [
                { label: '已启用卡项', summary: '8 个', status: '已启用' },
                { label: '草稿卡项', summary: '2 个', status: '草稿' },
                { label: '积分商城上架商品', summary: '12 个', status: '上架' },
                { label: '售罄商品', summary: '3 个', status: '售罄' },
                { label: '待绑定合同', summary: '2 项', status: '待处理' },
                { label: '待确认规则', summary: '4 条', status: '待确认' },
              ],
            },
            {
              title: '配置子域',
              items: [
                {
                  label: '卡项配置',
                  summary: '额度型 / 畅练型 / 体验卡 / 私教包 / 教培产品',
                  status: '部分配置',
                  actionLabel: '查看卡项配置',
                  toastMessage: '查看卡项配置（待建设）',
                },
                {
                  label: '点数与耗课规则',
                  summary: '课程扣点、最低开班、爽约扣点、跨店结算',
                  status: '已配置',
                  actionLabel: '查看点数规则',
                  toastMessage: '查看点数规则（待建设）',
                },
                {
                  label: '预约与权益规则',
                  summary: '预约窗口、取消时限、请假、冻结、转卡、退费',
                  status: '部分配置',
                  actionLabel: '查看预约权益',
                  toastMessage: '查看预约权益（待建设）',
                },
                {
                  label: '积分规则',
                  summary: '积分获取、开卡积分、耗课积分、退费扣回、过期规则',
                  status: '待完善',
                  actionLabel: '查看积分规则',
                  toastMessage: '查看积分规则（待建设）',
                },
                {
                  label: '积分商城配置',
                  summary: '实物、课程权益、周边、服务权益',
                  status: '部分配置',
                  actionLabel: '查看积分商城',
                  toastMessage: '查看积分商城（待建设）',
                },
                {
                  label: '赠送权益配置',
                  summary: '赠送点数、赠送课程、活动权益',
                  status: '待确认',
                  actionLabel: '查看赠送权益',
                  toastMessage: '查看赠送权益（待建设）',
                },
                {
                  label: '合同与条款绑定',
                  summary: '会员合同、退费条款、积分条款、赠送权益条款',
                  status: '待完善',
                  actionLabel: '查看合同绑定',
                  toastMessage: '查看合同绑定（待建设）',
                },
              ],
            },
            {
              title: '权限边界',
              items: [
                { label: '总部管理员', summary: '创建 / 编辑 / 上下架 / 归档 / 查看全部' },
                { label: '运营负责人', summary: '编辑业务规则 / 提交审核 / 查看' },
                { label: '财务', summary: '查看价格、退款、结算、积分影响' },
                { label: '店长', summary: '查看本店适用卡项，可提交调整申请，不可改价格和退费规则' },
                { label: '前台 / 管家', summary: '查看可售卡项和会员权益' },
                { label: '老师', summary: '仅查看课程消耗相关必要信息' },
              ],
            },
            {
              title: '风险提示',
              items: [
                { label: '价格与退费', summary: '不要让店长直接改价格、退费规则、合同' },
                { label: '积分口径', summary: '积分不是现金' },
                { label: '赠送权益', summary: '赠送权益默认不计入退费' },
                { label: '合同同步', summary: '卡项上下架需要合同模板同步' },
                { label: '会员端展示', summary: '会员端展示口径必须与后台配置一致' },
              ],
            },
          ],
          actions: [
            { label: '查看产品与权益配置', toastMessage: '查看产品与权益配置（待建设）' },
            { label: '提交调整申请', toastMessage: '提交调整申请（待建设）' },
            { label: '查看操作日志', toastMessage: '查看操作日志（待建设）' },
          ],
        },
      },
      logDetailMap: {
        'ol-1': {
          id: 'ol-1', title: '修改预约取消规则 · 操作详情',
          subtitle: '会员端预约',
          operator: '总部管理员', time: '2026-06-26 10:12', impact: '会员端预约', riskLevel: 'medium',
          oldValue: '取消时限：开课前 1 小时', newValue: '取消时限：开课前 2 小时',
          approvalRecord: '店长复核通过',
          evidenceChain: [
            { label: '操作人', value: '总部管理员' },
            { label: '操作时间', value: '2026-06-26 10:12' },
            { label: '影响对象', value: '会员端预约' },
            { label: '审批记录', value: '店长复核通过' },
          ],
          actions: [{ label: '查看完整日志', toastMessage: '查看完整日志（待建设）' }],
        },
        'ol-2': {
          id: 'ol-2', title: '审核冻结申请 · 操作详情',
          subtitle: '会员资产',
          operator: '店长 · 林敏', time: '2026-06-26 11:20', impact: '会员资产', riskLevel: 'high',
          oldValue: '冻结申请：待审核', newValue: '冻结申请：已通过',
          approvalRecord: '总部复核通过',
          evidenceChain: [
            { label: '操作人', value: '店长 · 林敏' },
            { label: '操作时间', value: '2026-06-26 11:20' },
            { label: '合同附件', value: '已上传' },
            { label: '会员确认', value: '已确认' },
          ],
          actions: [{ label: '查看完整日志', toastMessage: '查看完整日志（待建设）' }],
        },
        'ol-4': {
          id: 'ol-4', title: '导出财务报告 · 操作详情',
          subtitle: '财务数据',
          operator: '财务 · 周岚', time: '2026-06-25 17:22', impact: '财务数据', riskLevel: 'high',
          oldValue: '—', newValue: '导出 2026-06 财务月报',
          approvalRecord: '二次确认通过',
          evidenceChain: [
            { label: '操作人', value: '财务 · 周岚' },
            { label: '导出范围', value: '全部门店' },
            { label: '二次确认', value: '已通过' },
          ],
          actions: [{ label: '查看完整日志', toastMessage: '查看完整日志（待建设）' }],
        },
      },
    },
  };
}

export function getConfigStatusClass(level: SettingsConfigStatus): string {
  const map: Record<SettingsConfigStatus, string> = {
    configured: 'is-configured',
    partial: 'is-partial',
    pending: 'is-pending',
  };
  return map[level];
}

export function getRiskToneClass(tone: SettingsRiskTone): string {
  const map: Record<SettingsRiskTone, string> = {
    risk: 'is-risk',
    approval: 'is-approval',
    notification: 'is-notification',
    permission: 'is-permission',
  };
  return map[tone];
}

export function getRiskLevelClass(level: SettingsRiskLevel): string {
  const map: Record<SettingsRiskLevel, string> = {
    high: 'is-high',
    medium: 'is-medium',
    low: 'is-low',
  };
  return map[level];
}

export function getMessageStatusClass(level: SettingsMessageStatus): string {
  const map: Record<SettingsMessageStatus, string> = {
    active: 'is-active',
    pending: 'is-pending',
    draft: 'is-draft',
  };
  return map[level];
}

export function getPriorityClass(priority: SettingsPriority): string {
  const map: Record<SettingsPriority, string> = {
    P0: 'is-p0',
    P1: 'is-p1',
    P2: 'is-p2',
  };
  return map[priority];
}

export function getSuggestionSourceClass(source: SettingsSuggestionSource): string {
  return source === 'system_rule' ? 'is-rule' : 'is-pending';
}
