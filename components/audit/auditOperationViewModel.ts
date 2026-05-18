/** 权限审计模块局部 demo 数据 */

export type AuditSegment = 'roles' | 'approvals' | 'logs' | 'exports' | 'changes' | 'risks';

export type AuditEntityType = 'role' | 'approval' | 'log' | 'export' | 'change' | 'risk';

export type AuditActionGroup = 'approvalPending' | 'riskReview' | 'exportConfirm' | 'logGap';

export interface AuditListFilters {
  query: string;
  status: string;
  risk: string;
  scope: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditListFilters = {
  query: '',
  status: '全部',
  risk: '全部',
  scope: '全部',
};

export const AUDIT_FILTER_OPTIONS = {
  statuses: ['全部', '正常', '待审批', '已通过', '已驳回', '待复核', '已关闭'],
  risks: ['全部', '低', '中', '高'],
  scopes: ['全部', '总部', '门店', '财务', '老师端'],
};

export const AUDIT_WORKBENCH_SEGMENTS: { id: AuditSegment; label: string }[] = [
  { id: 'roles', label: '角色权限' },
  { id: 'approvals', label: '敏感审批' },
  { id: 'logs', label: '操作日志' },
  { id: 'exports', label: '数据导出' },
  { id: 'changes', label: '合同 / 资产变更' },
  { id: 'risks', label: '权限风险' },
];

export const AUDIT_SEGMENT_HINTS: Record<AuditSegment, string> = {
  roles: '查看角色权限、成员范围与敏感权限配置',
  approvals: '退款、补签、合同、资产等敏感操作审批',
  logs: '登录、查看、修改、导出等操作留痕',
  exports: '会员、财务、合同等数据导出与审批记录',
  changes: '合同模板、资产冻结、转卡等关键变更',
  risks: '越权、高频导出、审批缺失等权限风险',
};

export interface AuditMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface AuditInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface AuditRoleRecord {
  id: string;
  segment: 'roles';
  roleName: string;
  scope: string;
  memberCount: number;
  visibleModules: string;
  sensitivePerms: string;
  dataScope: string;
  status: string;
  riskLevel: string;
}

export interface AuditApprovalRecord {
  id: string;
  segment: 'approvals';
  approvalNo: string;
  opType: string;
  applicant: string;
  relatedObject: string;
  currentNode: string;
  riskLevel: string;
  status: string;
}

export interface AuditOperationLogRecord {
  id: string;
  segment: 'logs';
  at: string;
  operator: string;
  role: string;
  module: string;
  action: string;
  relatedObject: string;
  device: string;
  riskLevel: string;
}

export interface AuditExportRecord {
  id: string;
  segment: 'exports';
  exportNo: string;
  exporter: string;
  dataType: string;
  exportRange: string;
  rowCount: number;
  approvalStatus: string;
  purpose: string;
  riskLevel: string;
}

export interface AuditChangeRecord {
  id: string;
  segment: 'changes';
  changeNo: string;
  memberName: string;
  changeTarget: string;
  changeType: string;
  oldSummary: string;
  newSummary: string;
  approvalStatus: string;
  riskLevel: string;
}

export interface AuditRiskRecord {
  id: string;
  segment: 'risks';
  riskType: string;
  subject: string;
  impactScope: string;
  riskReason: string;
  suggestedAction: string;
  riskLevel: string;
  status: string;
}

export type AuditTableRow =
  | AuditRoleRecord
  | AuditApprovalRecord
  | AuditOperationLogRecord
  | AuditExportRecord
  | AuditChangeRecord
  | AuditRiskRecord;

export interface AuditActionItem {
  id: string;
  group: AuditActionGroup;
  entityType: AuditEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  riskLine: string;
  evidenceChain: string[];
  openTab?: 'overview' | 'approval' | 'logs' | 'export' | 'risk';
}

export interface AuditLogTimelineItem {
  at: string;
  by: string;
  action: string;
  target: string;
  device: string;
  note: string;
}

export interface AuditJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface AuditDetailRecord {
  id: string;
  entityType: AuditEntityType;
  segment: AuditSegment;
  title: string;
  subtitle: string;
  status: string;
  riskLevel: string;
  impactScope: string;
  isSensitive: boolean;
  todaySuggestion: string;
  judgment: AuditJudgment;
  relatedObject: string;
  visibleModules: string[];
  allowedActions: string[];
  dataScope: string;
  sensitivePermissions: string[];
  permissionBoundaries: string[];
  applicant: string;
  currentNode: string;
  approver: string;
  approvalStatus: string;
  applyReason: string;
  approvalNote: string;
  approvalNext: string;
  evidenceChain: string[];
  logTimeline: AuditLogTimelineItem[];
  exportType: string;
  exportFields: string;
  exportCount: number;
  exportPurpose: string;
  exportApproved: string;
  downloadRecords: string[];
  exportRiskHint: string;
  riskReason: string;
  impactModules: string[];
  impactAsset: boolean;
  impactFinance: boolean;
  impactContract: boolean;
  impactTeacherIncome: boolean;
  handleSteps: string[];
  handleRecords: string[];
}

export interface AuditOperationSnapshot {
  metrics: AuditMetric[];
  insights: AuditInsight[];
  roles: AuditRoleRecord[];
  approvals: AuditApprovalRecord[];
  logs: AuditOperationLogRecord[];
  exports: AuditExportRecord[];
  changes: AuditChangeRecord[];
  risks: AuditRiskRecord[];
  details: AuditDetailRecord[];
  actionQueue: AuditActionItem[];
}

const ROLES = [
  '总部管理员',
  '总部运营',
  '财务',
  '店长',
  '管家',
  '教务',
  '老师',
  '合作门店管理员',
];

const APPROVAL_TYPES = [
  '退款审批',
  '补签审批',
  '合同修改',
  '资产冻结',
  '转卡申请',
  '课时费复核',
  '数据导出审批',
];

const LOG_ACTIONS = [
  '查看会员详情',
  '修改合同草稿',
  '发起退款申请',
  '查看财务数据',
  '导出会员列表',
  '标记待办处理',
  '查看老师收入',
  '查看审批单',
  '修改角色权限草稿',
];

const EXPORT_TYPES = ['会员数据', '财务数据', '合同数据', '老师课时费', '课程预约记录', '积分记录'];

const CHANGE_TYPES = [
  '合同模板修改',
  '合同状态调整',
  '资产冻结',
  '资产转卡',
  '权益扣减修正',
  '有效期调整',
];

const RISK_TYPES = ['权限过宽', '越权访问', '高频导出', '审批缺失', '异常登录', '敏感操作无备注'];

const mkJudgment = (status: string, risk: string): AuditJudgment => ({
  summary:
    status.includes('待') || status.includes('复核')
      ? '该对象存在待处理节点，需核对权限与审批证据后再执行'
      : risk === '高'
        ? '高风险操作，需优先复核权限边界与审批链路'
        : '审计记录完整，建议按周期抽检',
  stuck: status.includes('待审批') ? '审批未完成' : risk === '高' ? '风险等级偏高' : '—',
  nextStep:
    status.includes('待')
      ? '完成审批或补齐操作日志后归档（前端演示）'
      : '按建议动作复核，需审批后执行',
});

const baseBoundaries = [
  '老师端不可见完整手机号、订单金额、合同、退款审批、财务入账、他人收入、内部经营判断。',
  '店长仅可看本门店经营与会员，不默认查看全公司财务。',
  '财务可看金额与财务链路，不默认修改会员权益。',
  '总部管理员可配置规则，敏感发布与导出仍需留痕。',
];

const buildDetails = (
  roles: AuditRoleRecord[],
  approvals: AuditApprovalRecord[],
  logs: AuditOperationLogRecord[],
  exports: AuditExportRecord[],
  changes: AuditChangeRecord[],
  risks: AuditRiskRecord[],
): AuditDetailRecord[] => {
  const roleDetails: AuditDetailRecord[] = roles.map(r => ({
    id: r.id,
    entityType: 'role',
    segment: 'roles',
    title: r.roleName,
    subtitle: `角色权限 · ${r.scope} · ${r.status}`,
    status: r.status,
    riskLevel: r.riskLevel,
    impactScope: r.scope,
    isSensitive: r.sensitivePerms !== '—',
    todaySuggestion: `复核 ${r.roleName} 的敏感权限与数据范围是否匹配岗位`,
    judgment: mkJudgment(r.status, r.riskLevel),
    relatedObject: r.roleName,
    visibleModules: r.visibleModules.split(' / '),
    allowedActions: ['查看', '编辑本模块', '提交审批', '导出（需审批）'],
    dataScope: r.dataScope,
    sensitivePermissions: r.sensitivePerms.split(' / ').filter(Boolean),
    permissionBoundaries: baseBoundaries,
    applicant: '—',
    currentNode: '—',
    approver: '—',
    approvalStatus: '—',
    applyReason: '—',
    approvalNote: '—',
    approvalNext: '—',
    evidenceChain: ['角色', '权限', '访问', '日志'],
    logTimeline: [],
    exportType: '—',
    exportFields: '—',
    exportCount: 0,
    exportPurpose: '—',
    exportApproved: '—',
    downloadRecords: [],
    exportRiskHint: '—',
    riskReason: r.riskLevel === '高' ? '角色含总部级敏感权限' : '—',
    impactModules: r.visibleModules.split(' / '),
    impactAsset: r.sensitivePerms.includes('资产'),
    impactFinance: r.sensitivePerms.includes('财务') || r.sensitivePerms.includes('退款'),
    impactContract: r.sensitivePerms.includes('合同'),
    impactTeacherIncome: r.roleName === '老师',
    handleSteps: ['核对可见模块', '收口敏感权限', '保留变更日志'],
    handleRecords: ['前端演示：未真实修改角色'],
  }));

  const approvalDetails: AuditDetailRecord[] = approvals.map(a => ({
    id: a.id,
    entityType: 'approval',
    segment: 'approvals',
    title: `${a.opType} ${a.approvalNo}`,
    subtitle: `${a.opType} · ${a.relatedObject} · ${a.status}`,
    status: a.status,
    riskLevel: a.riskLevel,
    impactScope: a.relatedObject,
    isSensitive: true,
    todaySuggestion: `优先处理 ${a.approvalNo}，确认审批链路与执行留痕`,
    judgment: mkJudgment(a.status, a.riskLevel),
    relatedObject: a.relatedObject,
    visibleModules: ['审批中心', '关联业务模块'],
    allowedActions: ['查看', '审批', '驳回', '备注'],
    dataScope: '按审批单授权',
    sensitivePermissions: [a.opType],
    permissionBoundaries: baseBoundaries,
    applicant: a.applicant,
    currentNode: a.currentNode,
    approver: a.currentNode.includes('财务') ? '财务 A' : '店长 B',
    approvalStatus: a.status,
    applyReason: `${a.applicant} 发起 ${a.opType}，需总部/财务复核`,
    approvalNote: a.status === '待审批' ? '待补充审批备注' : '已记录审批意见（前端演示）',
    approvalNext: a.status === '待审批' ? '等待审批通过后执行' : '归档至操作日志',
    evidenceChain: ['申请', '审批', '执行', '日志'],
    logTimeline: [
      {
        at: '2026-05-14 09:12',
        by: a.applicant,
        action: '提交申请',
        target: a.relatedObject,
        device: 'PC 后台 · 192.168.1.24',
        note: '前端演示',
      },
      {
        at: '2026-05-14 10:05',
        by: '系统',
        action: '进入审批节点',
        target: a.approvalNo,
        device: '—',
        note: '待接入真实审批流',
      },
    ],
    exportType: '—',
    exportFields: '—',
    exportCount: 0,
    exportPurpose: '—',
    exportApproved: '—',
    downloadRecords: [],
    exportRiskHint: '—',
    riskReason: `${a.opType} 为敏感操作`,
    impactModules: [a.opType],
    impactAsset: /资产|转卡|冻结/.test(a.opType),
    impactFinance: /退款|课时费/.test(a.opType),
    impactContract: /合同/.test(a.opType),
    impactTeacherIncome: /课时费/.test(a.opType),
    handleSteps: ['核对申请理由', '完成审批', '确认执行日志'],
    handleRecords: ['前端演示：未真实审批'],
  }));

  const logDetails: AuditDetailRecord[] = logs.map(l => ({
    id: l.id,
    entityType: 'log',
    segment: 'logs',
    title: `${l.action} · ${l.relatedObject}`,
    subtitle: `${l.module} · ${l.operator} · ${l.at}`,
    status: '已记录',
    riskLevel: l.riskLevel,
    impactScope: l.module,
    isSensitive: l.riskLevel !== '低',
    todaySuggestion: '核对操作是否在本角色权限范围内',
    judgment: mkJudgment('已记录', l.riskLevel),
    relatedObject: l.relatedObject,
    visibleModules: [l.module],
    allowedActions: [l.action],
    dataScope: l.role,
    sensitivePermissions: l.riskLevel === '高' ? ['敏感查看'] : [],
    permissionBoundaries: baseBoundaries,
    applicant: l.operator,
    currentNode: '—',
    approver: '—',
    approvalStatus: '—',
    applyReason: '—',
    approvalNote: '—',
    approvalNext: '—',
    evidenceChain: ['角色', '权限', '访问', '日志'],
    logTimeline: [
      {
        at: l.at,
        by: l.operator,
        action: l.action,
        target: l.relatedObject,
        device: l.device,
        note: '以操作日志为准',
      },
    ],
    exportType: '—',
    exportFields: '—',
    exportCount: 0,
    exportPurpose: '—',
    exportApproved: '—',
    downloadRecords: [],
    exportRiskHint: '—',
    riskReason: l.riskLevel === '高' ? '高风险操作留痕' : '—',
    impactModules: [l.module],
    impactAsset: l.module.includes('资产'),
    impactFinance: l.module.includes('财务'),
    impactContract: l.module.includes('合同'),
    impactTeacherIncome: l.module.includes('老师'),
    handleSteps: ['核对 IP/设备', '确认权限范围'],
    handleRecords: [],
  }));

  const exportDetails: AuditDetailRecord[] = exports.map(e => ({
    id: e.id,
    entityType: 'export',
    segment: 'exports',
    title: `导出 ${e.exportNo}`,
    subtitle: `${e.dataType} · ${e.exporter} · ${e.approvalStatus}`,
    status: e.approvalStatus,
    riskLevel: e.riskLevel,
    impactScope: e.exportRange,
    isSensitive: true,
    todaySuggestion: '确认导出用途与审批状态，避免超范围导出',
    judgment: mkJudgment(e.approvalStatus, e.riskLevel),
    relatedObject: e.dataType,
    visibleModules: ['数据导出'],
    allowedActions: ['申请导出', '下载（需审批）'],
    dataScope: e.exportRange,
    sensitivePermissions: ['数据导出'],
    permissionBoundaries: baseBoundaries,
    applicant: e.exporter,
    currentNode: e.approvalStatus === '待审批' ? '数据导出审批' : '—',
    approver: '财务 A',
    approvalStatus: e.approvalStatus,
    applyReason: e.purpose,
    approvalNote: '导出用途已登记（前端演示）',
    approvalNext: '审批通过后生成下载记录',
    evidenceChain: ['导出', '审批', '下载', '留痕'],
    logTimeline: [],
    exportType: e.dataType,
    exportFields: `${e.dataType}核心字段`,
    exportCount: e.rowCount,
    exportPurpose: e.purpose,
    exportApproved: e.approvalStatus,
    downloadRecords: ['2026-05-14 11:20 · 已生成下载链接（演示）'],
    exportRiskHint: '高频导出需复核权限与用途',
    riskReason: e.riskLevel === '高' ? '导出条数偏高' : '—',
    impactModules: [e.dataType],
    impactAsset: false,
    impactFinance: e.dataType.includes('财务'),
    impactContract: e.dataType.includes('合同'),
    impactTeacherIncome: e.dataType.includes('课时费'),
    handleSteps: ['确认审批', '核对字段范围', '登记用途'],
    handleRecords: [],
  }));

  const changeDetails: AuditDetailRecord[] = changes.map(c => ({
    id: c.id,
    entityType: 'change',
    segment: 'changes',
    title: `${c.changeType} ${c.changeNo}`,
    subtitle: `${c.memberName} · ${c.changeTarget} · ${c.approvalStatus}`,
    status: c.approvalStatus,
    riskLevel: c.riskLevel,
    impactScope: c.changeTarget,
    isSensitive: true,
    todaySuggestion: '核对变更前后摘要与审批记录是否一致',
    judgment: mkJudgment(c.approvalStatus, c.riskLevel),
    relatedObject: c.memberName,
    visibleModules: ['合同', '资产'],
    allowedActions: ['查看变更', '提交审批'],
    dataScope: '本门店会员',
    sensitivePermissions: [c.changeType],
    permissionBoundaries: baseBoundaries,
    applicant: '管家 A',
    currentNode: c.approvalStatus === '待审批' ? '店长审批' : '—',
    approver: '店长 B',
    approvalStatus: c.approvalStatus,
    applyReason: `${c.changeType}：${c.oldSummary} → ${c.newSummary}`,
    approvalNote: '变更需留痕（前端演示）',
    approvalNext: '审批通过后写入资产/合同日志',
    evidenceChain: ['申请', '审批', '变更', '日志'],
    logTimeline: [
      {
        at: '2026-05-14 08:40',
        by: '管家 A',
        action: '发起变更',
        target: c.changeNo,
        device: 'PC 后台',
        note: c.newSummary,
      },
    ],
    exportType: '—',
    exportFields: '—',
    exportCount: 0,
    exportPurpose: '—',
    exportApproved: '—',
    downloadRecords: [],
    exportRiskHint: '—',
    riskReason: '合同/资产关键变更',
    impactModules: ['合同', '资产'],
    impactAsset: true,
    impactFinance: false,
    impactContract: true,
    impactTeacherIncome: false,
    handleSteps: ['核对原值/新值', '确认审批', '检查日志备注'],
    handleRecords: [],
  }));

  const riskDetails: AuditDetailRecord[] = risks.map(r => ({
    id: r.id,
    entityType: 'risk',
    segment: 'risks',
    title: `${r.riskType} · ${r.subject}`,
    subtitle: `${r.impactScope} · ${r.status}`,
    status: r.status,
    riskLevel: r.riskLevel,
    impactScope: r.impactScope,
    isSensitive: true,
    todaySuggestion: r.suggestedAction,
    judgment: mkJudgment(r.status, r.riskLevel),
    relatedObject: r.subject,
    visibleModules: r.impactScope.split(' / '),
    allowedActions: ['查看风险', '标记复核'],
    dataScope: r.impactScope,
    sensitivePermissions: [r.riskType],
    permissionBoundaries: baseBoundaries,
    applicant: '—',
    currentNode: '—',
    approver: '—',
    approvalStatus: r.status,
    applyReason: r.riskReason,
    approvalNote: '—',
    approvalNext: r.suggestedAction,
    evidenceChain: ['角色', '权限', '访问', '日志'],
    logTimeline: [],
    exportType: '—',
    exportFields: '—',
    exportCount: 0,
    exportPurpose: '—',
    exportApproved: '—',
    downloadRecords: [],
    exportRiskHint: '—',
    riskReason: r.riskReason,
    impactModules: r.impactScope.split(' / '),
    impactAsset: r.riskType.includes('资产') || r.riskType.includes('审批'),
    impactFinance: r.riskType.includes('导出') || r.riskType.includes('越权'),
    impactContract: r.riskType.includes('合同'),
    impactTeacherIncome: false,
    handleSteps: [r.suggestedAction, '补齐审批或日志', '复核权限收口'],
    handleRecords: ['前端演示：未真实处理'],
  }));

  return [
    ...roleDetails,
    ...approvalDetails,
    ...logDetails,
    ...exportDetails,
    ...changeDetails,
    ...riskDetails,
  ];
};

export const buildAuditOperationSnapshot = (): AuditOperationSnapshot => {
  const roles: AuditRoleRecord[] = ROLES.map((name, i) => ({
    id: `audit-role-${i + 1}`,
    segment: 'roles' as const,
    roleName: name,
    scope: i < 2 ? '总部' : i === 2 ? '财务' : i < 5 ? '门店' : i === 5 ? '门店教务' : i === 6 ? '老师端' : '合作门店',
    memberCount: [3, 8, 4, 6, 12, 9, 42, 2][i],
    visibleModules:
      i === 0
        ? '全模块'
        : i === 2
          ? '财务 / 合同 / 报表'
          : i === 6
            ? '课表 / 签到'
            : '会员 / 课程 / 今日运营',
    sensitivePerms:
      i === 0
        ? '退款 / 合同 / 资产 / 导出 / 规则'
        : i === 2
          ? '退款复核 / 财务导出'
          : i === 3
            ? '本店退款申请 / 导出'
            : i === 6
              ? '—'
              : '会员查看 / 导出申请',
    dataScope: i < 2 ? '全公司' : i === 2 ? '全公司财务' : '本门店',
    status: i === 7 ? '待复核' : '正常',
    riskLevel: i === 0 ? '中' : i === 3 || i === 7 ? '高' : i === 6 ? '低' : '中',
  }));

  const approvals: AuditApprovalRecord[] = Array.from({ length: 12 }, (_, i) => {
    const opType = APPROVAL_TYPES[i % APPROVAL_TYPES.length];
    const status = i < 3 ? '待审批' : i < 5 ? '待提交' : i < 8 ? '已通过' : i === 8 ? '已驳回' : i === 9 ? '已撤回' : '已执行';
    return {
      id: `audit-ap-${i + 1}`,
      segment: 'approvals' as const,
      approvalNo: `AP-20260514-${String(i + 1).padStart(3, '0')}`,
      opType,
      applicant: ['管家 A', '教务 B', '财务 C', '店长 D'][i % 4],
      relatedObject: `会员 M${1000 + i} · 万象馆`,
      currentNode: status === '待审批' ? (i % 2 ? '财务复核' : '店长审批') : status,
      riskLevel: i < 4 ? '高' : '中',
      status,
    };
  });

  const logs: AuditOperationLogRecord[] = Array.from({ length: 18 }, (_, i) => ({
    id: `audit-log-${i + 1}`,
    segment: 'logs' as const,
    at: `2026-05-14 ${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    operator: ['总部运营 A', '店长 B', '财务 C', '管家 D', '教务 E'][i % 5],
    role: ['总部运营', '店长', '财务', '管家', '教务'][i % 5],
    module: ['会员', '合同', '财务', '课程', '审批', '导出'][i % 6],
    action: LOG_ACTIONS[i % LOG_ACTIONS.length],
    relatedObject: `对象 #${2000 + i}`,
    device: `PC 后台 · 192.168.1.${20 + (i % 30)}`,
    riskLevel: i % 7 === 0 ? '高' : i % 3 === 0 ? '中' : '低',
  }));

  const exports: AuditExportRecord[] = Array.from({ length: 8 }, (_, i) => ({
    id: `audit-exp-${i + 1}`,
    segment: 'exports' as const,
    exportNo: `EX-20260514-${String(i + 1).padStart(3, '0')}`,
    exporter: ['财务 C', '店长 B', '总部运营 A'][i % 3],
    dataType: EXPORT_TYPES[i % EXPORT_TYPES.length],
    exportRange: i % 2 ? '万象馆' : '全公司',
    rowCount: [120, 860, 45, 3200, 210, 98, 1500, 76][i],
    approvalStatus: i < 2 ? '待审批' : i < 4 ? '已通过' : '已关闭',
    purpose: ['月度对账', '会员运营分析', '合同复核', '课时费核算'][i % 4],
    riskLevel: i < 3 ? '高' : '中',
  }));

  const changes: AuditChangeRecord[] = Array.from({ length: 8 }, (_, i) => ({
    id: `audit-chg-${i + 1}`,
    segment: 'changes' as const,
    changeNo: `CH-20260514-${String(i + 1).padStart(3, '0')}`,
    memberName: `会员 M${1100 + i}`,
    changeTarget: i % 2 ? '锦鲤卡 Flow' : '瑜伽年卡',
    changeType: CHANGE_TYPES[i % CHANGE_TYPES.length],
    oldSummary: '有效期至 2026-08-01',
    newSummary: i % 2 ? '冻结 30 天' : '延期至 2026-12-01',
    approvalStatus: i < 2 ? '待审批' : '已通过',
    riskLevel: i < 3 ? '高' : '中',
  }));

  const risks: AuditRiskRecord[] = Array.from({ length: 8 }, (_, i) => ({
    id: `audit-risk-${i + 1}`,
    segment: 'risks' as const,
    riskType: RISK_TYPES[i % RISK_TYPES.length],
    subject: i % 2 ? '店长角色 · 城西馆' : `人员：运营${i}`,
    impactScope: i % 2 ? '门店 / 财务' : '总部 / 导出',
    riskReason:
      i === 0
        ? '门店角色含总部级导出权限'
        : i === 1
          ? '今日会员导出 9 次高于日常'
          : '审批单缺少备注',
    suggestedAction: i < 2 ? '收口权限并复核' : '补齐审批备注',
    riskLevel: i < 3 ? '高' : '中',
    status: i < 4 ? '待复核' : '处理中',
  }));

  const details = buildDetails(roles, approvals, logs, exports, changes, risks);

  const pendingApprovals = approvals.filter(a => a.status === '待审批' || a.status === '待提交').length;
  const sensitiveCount = roles.reduce((n, r) => n + r.sensitivePerms.split('/').filter(Boolean).length, 0);
  const todayLogs = logs.length;
  const exportCount = exports.length;
  const riskCount = risks.filter(r => r.status === '待复核').length;

  const metrics: AuditMetric[] = [
    { id: 'm1', label: '角色数量', value: `${roles.length} 个`, hint: '总部 / 店长 / 财务 / 老师' },
    {
      id: 'm2',
      label: '敏感权限',
      value: `${sensitiveCount} 项`,
      hint: '退款 / 合同 / 资产 / 导出',
      tone: 'amber',
    },
    {
      id: 'm3',
      label: '待审批',
      value: `${pendingApprovals} 项`,
      hint: '补签 / 退款 / 权益调整',
      tone: 'rose',
    },
    { id: 'm4', label: '今日操作', value: `${todayLogs} 条`, hint: '登录 / 查看 / 修改 / 导出' },
    {
      id: 'm5',
      label: '数据导出',
      value: `${exportCount} 次`,
      hint: '会员 / 财务 / 合同',
      tone: 'amber',
    },
    {
      id: 'm6',
      label: '风险操作',
      value: `${riskCount} 项`,
      hint: '越权 / 高频 / 未审批',
      tone: 'rose',
    },
  ];

  const insights: AuditInsight[] = [
    {
      id: 'ins-1',
      tag: '敏感操作未审批',
      line: '3 项退款 / 补签操作尚未完成审批',
      actionLabel: '去复核',
      actionKey: 'approvals',
    },
    {
      id: 'ins-2',
      tag: '数据导出偏高',
      line: '今日会员数据导出次数高于日常水平',
      actionLabel: '查看',
      actionKey: 'exports',
    },
    {
      id: 'ins-3',
      tag: '角色权限过宽',
      line: '2 个门店角色含总部级权限，建议收口',
      actionLabel: '检查',
      actionKey: 'roles',
    },
    {
      id: 'ins-4',
      tag: '操作日志缺口',
      line: '部分资产变更缺少审批备注',
      actionLabel: '补齐',
      actionKey: 'logs',
    },
  ];

  const actionQueue: AuditActionItem[] = [
    {
      id: 'aq-1',
      group: 'approvalPending',
      entityType: 'approval',
      entityId: 'audit-ap-1',
      title: '退款审批 AP-20260514-001',
      statusLabel: '待审批',
      riskLine: '退款需财务复核，不可直接改权益',
      evidenceChain: ['申请', '审批', '执行', '日志'],
      openTab: 'approval',
    },
    {
      id: 'aq-2',
      group: 'approvalPending',
      entityType: 'approval',
      entityId: 'audit-ap-2',
      title: '补签审批 AP-20260514-002',
      statusLabel: '待审批',
      riskLine: '补签影响耗课与积分口径',
      evidenceChain: ['申请', '审批', '执行', '日志'],
    },
    {
      id: 'aq-3',
      group: 'approvalPending',
      entityType: 'approval',
      entityId: 'audit-ap-3',
      title: '合同修改 AP-20260514-003',
      statusLabel: '待审批',
      riskLine: '合同条款变更需留痕',
      evidenceChain: ['申请', '审批', '变更', '日志'],
    },
    {
      id: 'aq-4',
      group: 'riskReview',
      entityType: 'risk',
      entityId: 'audit-risk-1',
      title: '权限过宽 · 店长角色',
      statusLabel: '高风险',
      riskLine: '门店角色含总部级导出权限',
      evidenceChain: ['角色', '权限', '访问', '日志'],
      openTab: 'risk',
    },
    {
      id: 'aq-5',
      group: 'riskReview',
      entityType: 'risk',
      entityId: 'audit-risk-2',
      title: '高频导出',
      statusLabel: '待复核',
      riskLine: '今日会员导出次数偏高',
      evidenceChain: ['导出', '审批', '下载', '留痕'],
    },
    {
      id: 'aq-6',
      group: 'exportConfirm',
      entityType: 'export',
      entityId: 'audit-exp-1',
      title: '会员数据 EX-20260514-001',
      statusLabel: '待审批',
      riskLine: '导出 860 条，需确认用途',
      evidenceChain: ['导出', '审批', '下载', '留痕'],
      openTab: 'export',
    },
    {
      id: 'aq-7',
      group: 'exportConfirm',
      entityType: 'export',
      entityId: 'audit-exp-2',
      title: '财务数据 EX-20260514-002',
      statusLabel: '待审批',
      riskLine: '财务导出需总部审批',
      evidenceChain: ['导出', '审批', '下载', '留痕'],
    },
    {
      id: 'aq-8',
      group: 'logGap',
      entityType: 'change',
      entityId: 'audit-chg-1',
      title: '资产冻结 CH-20260514-001',
      statusLabel: '日志缺口',
      riskLine: '变更缺少审批备注',
      evidenceChain: ['申请', '审批', '变更', '日志'],
      openTab: 'logs',
    },
    {
      id: 'aq-9',
      group: 'logGap',
      entityType: 'log',
      entityId: 'audit-log-3',
      title: '发起退款申请',
      statusLabel: '待补齐',
      riskLine: '操作日志备注不完整',
      evidenceChain: ['角色', '权限', '访问', '日志'],
    },
    {
      id: 'aq-10',
      group: 'logGap',
      entityType: 'change',
      entityId: 'audit-chg-2',
      title: '转卡申请 CH-20260514-002',
      statusLabel: '待补齐',
      riskLine: '转卡链路需补证据',
      evidenceChain: ['申请', '审批', '变更', '日志'],
    },
    {
      id: 'aq-11',
      group: 'approvalPending',
      entityType: 'approval',
      entityId: 'audit-ap-4',
      title: '资产冻结 AP-20260514-004',
      statusLabel: '待提交',
      riskLine: '冻结需原因与天数',
      evidenceChain: ['申请', '审批', '执行', '日志'],
    },
    {
      id: 'aq-12',
      group: 'riskReview',
      entityType: 'risk',
      entityId: 'audit-risk-3',
      title: '审批缺失',
      statusLabel: '中风险',
      riskLine: '敏感操作无审批记录',
      evidenceChain: ['申请', '审批', '执行', '日志'],
    },
  ];

  return { metrics, insights, roles, approvals, logs, exports, changes, risks, details, actionQueue };
};

export const findAuditDetail = (snapshot: AuditOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getAuditRows = (snapshot: AuditOperationSnapshot, segment: AuditSegment): AuditTableRow[] => {
  switch (segment) {
    case 'roles':
      return snapshot.roles;
    case 'approvals':
      return snapshot.approvals;
    case 'logs':
      return snapshot.logs;
    case 'exports':
      return snapshot.exports;
    case 'changes':
      return snapshot.changes;
    case 'risks':
      return snapshot.risks;
    default:
      return [];
  }
};

export const filterAuditRows = (
  rows: AuditTableRow[],
  segment: AuditSegment,
  filters: AuditListFilters,
): AuditTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    const status = 'status' in row ? row.status : 'approvalStatus' in row ? row.approvalStatus : '已记录';
    const risk = 'riskLevel' in row ? row.riskLevel : 'riskLevel' in row ? row.riskLevel : '低';
    const scope =
      'scope' in row
        ? row.scope
        : 'exportRange' in row
          ? row.exportRange
          : 'impactScope' in row
            ? row.impactScope
            : '';
    if (filters.status !== '全部' && !String(status).includes(filters.status.replace('待', ''))) {
      if (filters.status === '待审批' && !/待审批|待提交|待复核/.test(String(status))) return false;
      if (filters.status === '已通过' && !/已通过|已执行|正常/.test(String(status))) return false;
      if (filters.status === '已驳回' && !status.includes('驳回')) return false;
      if (filters.status === '正常' && status !== '正常' && status !== '已记录') return false;
      if (filters.status === '待复核' && !status.includes('复核')) return false;
      if (filters.status === '已关闭' && !status.includes('关闭')) return false;
    }
    if (filters.risk !== '全部' && risk !== filters.risk) return false;
    if (filters.scope !== '全部') {
      const scopeKey = filters.scope;
      const scopeStr = String(scope);
      const moduleStr = 'module' in row ? String(row.module) : '';
      if (scopeKey === '财务' && !scopeStr.includes('财务') && moduleStr !== '财务') return false;
      if (scopeKey === '老师端' && !scopeStr.includes('老师')) return false;
      if (scopeKey === '总部' && !scopeStr.includes('总部') && !scopeStr.includes('全公司')) return false;
      if (scopeKey === '门店' && !scopeStr.includes('门店') && !scopeStr.includes('馆')) return false;
    }
    if (!q) return true;
    const hay = JSON.stringify(row).toLowerCase();
    return hay.includes(q);
  });
};

export const computeAuditSegmentMiniSummary = (
  snapshot: AuditOperationSnapshot,
  segment: AuditSegment,
): { label: string; value: string }[] => {
  const rows = getAuditRows(snapshot, segment);
  const pending = rows.filter(r => {
    const s = 'status' in r ? r.status : 'approvalStatus' in r ? r.approvalStatus : '';
    return /待|复核/.test(String(s));
  }).length;
  const high = rows.filter(r => 'riskLevel' in r && r.riskLevel === '高').length;
  return [
    { label: '本段记录', value: `${rows.length} 条` },
    { label: '待处理', value: `${pending} 条` },
    { label: '高风险', value: `${high} 条` },
    { label: '今日新增', value: `${Math.min(rows.length, 6)} 条` },
  ];
};
