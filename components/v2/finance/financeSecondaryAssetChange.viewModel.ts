export type AssetChangeRequestType = 'refund' | 'freeze' | 'transfer';

export type AssetChangeApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'evidencePending'
  | 'pendingReview'
  | 'approvedMock'
  | 'rejectedMock'
  | 'cancelled'
  | 'completedMock';

export type AssetChangeEvidenceStatus = 'complete' | 'partial' | 'missing';

export type AssetChangePointsDeductStatus =
  | 'notApplicable'
  | 'pendingDeduct'
  | 'deductedMock'
  | 'waived';

export interface AssetChangeEvidenceItem {
  key: string;
  label: string;
  status: 'ok' | 'warn' | 'missing' | 'na';
  statusLabel: string;
}

export interface AssetChangeOperationLog {
  id: string;
  operator: string;
  time: string;
  action: string;
  note: string;
}

export interface AssetChangeApprovalStep {
  key: string;
  label: string;
  status: 'done' | 'current' | 'pending' | 'mock';
  time?: string;
}

export interface AssetChangeDrawerDetail {
  requestId: string;
  requestType: AssetChangeRequestType;
  requestTypeLabel: string;
  drawerTitle: string;
  approvalStatus: AssetChangeApprovalStatus;
  approvalStatusLabel: string;
  currentNode: string;
  owner: string;
  applicant: string;
  createdAt: string;
  updatedAt: string;
  requestReason: string;
  memberName: string;
  maskedPhone: string;
  store: string;
  cardName: string;
  remainingPoints: string;
  validUntil: string;
  hasGiftBenefit: boolean;
  giftBenefitNote: string;
  amountEstimate: string;
  amountEstimateNote: string;
  giftBenefitIncluded: false;
  pointsDeductStatus: AssetChangePointsDeductStatus;
  pointsDeductStatusLabel: string;
  evidenceItems: AssetChangeEvidenceItem[];
  evidenceCompleteness: string;
  approvalSteps: AssetChangeApprovalStep[];
  operationLogs: AssetChangeOperationLog[];
  riskReminder: string;
  suggestedAction: string;
  refundFields?: {
    consumedPoints: string;
    feeRulePlaceholder: string;
    finalAmountLabel: string;
  };
  freezeFields?: {
    freezeDays: string;
    remainingBenefits: string;
    freezeStart: string;
    freezeEnd: string;
    freezeBasis: string;
    finalResultLabel: string;
  };
  transferFields?: {
    fromMember: string;
    toMember: string;
    transferPoints: string;
    feeEstimate: string;
    contractChangeStatus: string;
    finalResultLabel: string;
  };
}

export interface AssetChangeSummaryItem {
  id: string;
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface AssetChangeFilterOption {
  id: string;
  group: string;
  label: string;
  value: string;
}

export interface AssetChangeRequestRow {
  requestId: string;
  requestType: AssetChangeRequestType;
  requestTypeLabel: string;
  memberName: string;
  maskedPhone: string;
  store: string;
  cardName: string;
  remainingPoints: number;
  remainingPointsLabel: string;
  amountEstimate: string;
  amountEstimateNote: string;
  giftBenefitIncluded: false;
  giftBenefitNote: string;
  pointsDeductStatus: AssetChangePointsDeductStatus;
  pointsDeductStatusLabel: string;
  requestReason: string;
  evidenceStatus: AssetChangeEvidenceStatus;
  evidenceStatusLabel: string;
  evidenceCompleteness: string;
  evidenceItems: AssetChangeEvidenceItem[];
  approvalStatus: AssetChangeApprovalStatus;
  approvalStatusLabel: string;
  currentNode: string;
  applicant: string;
  owner: string;
  suggestedAction: string;
  createdAt: string;
  updatedAt: string;
  operationLogs: AssetChangeOperationLog[];
  drawerDetail: AssetChangeDrawerDetail;
}

export interface AssetChangeSnapshot {
  meta: {
    title: string;
    subtitle: string;
    breadcrumbParent: string;
    breadcrumbCurrent: string;
    scopeLabel: string;
    description: string;
    disclaimer: string;
    createToast: string;
  };
  summaryItems: AssetChangeSummaryItem[];
  typeTabs: Array<{ id: string; label: string; value: 'all' | AssetChangeRequestType }>;
  typeDescriptions: Record<AssetChangeRequestType | 'all', string>;
  filterOptions: AssetChangeFilterOption[];
  rows: AssetChangeRequestRow[];
  batchActions: {
    assignOwnerToast: string;
    markEvidencePendingToast: string;
    exportToast: string;
  };
}

const APPROVAL_LABELS: Record<AssetChangeApprovalStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  evidencePending: '证据待补',
  pendingReview: '待复核',
  approvedMock: '已通过 mock',
  rejectedMock: '已驳回 mock',
  cancelled: '已取消',
  completedMock: '已完成 mock',
};

const EVIDENCE_STATUS_LABELS: Record<AssetChangeEvidenceStatus, string> = {
  complete: '证据完整',
  partial: '部分缺失',
  missing: '证据不足',
};

const POINTS_DEDUCT_LABELS: Record<AssetChangePointsDeductStatus, string> = {
  notApplicable: '不涉及',
  pendingDeduct: '待扣回',
  deductedMock: '已扣回 mock',
  waived: '免扣回待复核',
};

const TYPE_LABELS: Record<AssetChangeRequestType, string> = {
  refund: '退费',
  freeze: '冻结',
  transfer: '转卡',
};

const TYPE_SORT: Record<AssetChangeRequestType, number> = {
  refund: 0,
  freeze: 1,
  transfer: 2,
};

const STATUS_SORT: Record<AssetChangeApprovalStatus, number> = {
  evidencePending: 0,
  pendingReview: 1,
  submitted: 2,
  draft: 3,
  approvedMock: 4,
  rejectedMock: 5,
  cancelled: 6,
  completedMock: 7,
};

function buildEvidence(
  items: Array<{ key: string; label: string; status: 'ok' | 'warn' | 'missing' | 'na' }>,
): AssetChangeEvidenceItem[] {
  return items.map(item => ({
    ...item,
    statusLabel:
      item.status === 'ok'
        ? '已具备'
        : item.status === 'warn'
          ? '待补充'
          : item.status === 'missing'
            ? '缺失'
            : '不适用',
  }));
}

function countEvidence(items: AssetChangeEvidenceItem[]): string {
  const applicable = items.filter(i => i.status !== 'na');
  const ok = applicable.filter(i => i.status === 'ok').length;
  return `${ok}/${applicable.length}`;
}

function defaultApprovalSteps(current: string): AssetChangeApprovalStep[] {
  const steps = [
    { key: 'submitted', label: '已提交' },
    { key: 'evidence', label: '证据复核' },
    { key: 'finance', label: '财务复核' },
    { key: 'manager', label: '店长确认' },
    { key: 'hq', label: '总部复核' },
    { key: 'done', label: '完成 mock' },
  ];
  const order = steps.map(s => s.key);
  const idx = order.indexOf(current);
  return steps.map((step, i) => ({
    ...step,
    status:
      i < idx ? 'done' : i === idx ? 'current' : step.key === 'done' ? 'mock' : 'pending',
    time: i <= idx ? '2026-06-2' + i : undefined,
  }));
}

const RAW_ROWS: Omit<AssetChangeRequestRow, 'evidenceCompleteness' | 'approvalStatusLabel' | 'evidenceStatusLabel' | 'pointsDeductStatusLabel'>[] = [
  {
    requestId: 'acr-001',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '周宁',
    maskedPhone: '139****5521',
    store: '滨江馆',
    cardName: '锦鲤卡',
    remainingPoints: 68,
    remainingPointsLabel: '68 点',
    amountEstimate: '约 ¥6,800',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '赠送小班 1 节不计入退费',
    pointsDeductStatus: 'pendingDeduct',
    requestReason: '长期未到店，表达退费意向',
    evidenceStatus: 'missing',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'warn' },
      { key: 'checkin', label: '签到记录', status: 'missing' },
      { key: 'points', label: '积分流水', status: 'warn' },
      { key: 'gift', label: '赠送权益说明', status: 'missing' },
      { key: 'communication', label: '沟通记录', status: 'warn' },
    ]),
    approvalStatus: 'evidencePending',
    currentNode: '证据复核',
    applicant: '周航',
    owner: '财务 · 李婷',
    suggestedAction: '补齐签到记录与赠送权益说明后提交复核',
    createdAt: '2026-06-18 10:20',
    updatedAt: '2026-06-26 09:15',
    operationLogs: [
      { id: 'log-1', operator: '周航', time: '2026-06-18 10:20', action: '提交退费申请', note: '会员表达退费意向' },
      { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-20 14:30', action: '退回补证', note: '签到与赠送权益说明缺失' },
    ],
    drawerDetail: {
      requestId: 'acr-001',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'evidencePending',
      approvalStatusLabel: APPROVAL_LABELS.evidencePending,
      currentNode: '证据复核',
      owner: '财务 · 李婷',
      applicant: '周航',
      createdAt: '2026-06-18 10:20',
      updatedAt: '2026-06-26 09:15',
      requestReason: '长期未到店，表达退费意向',
      memberName: '周宁',
      maskedPhone: '139****5521',
      store: '滨江馆',
      cardName: '锦鲤卡',
      remainingPoints: '68 点',
      validUntil: '2026-09-30',
      hasGiftBenefit: true,
      giftBenefitNote: '赠送小班 1 节不计入退费，需书面说明',
      amountEstimate: '约 ¥6,800',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'pendingDeduct',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.pendingDeduct,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'warn' },
        { key: 'checkin', label: '签到记录', status: 'missing' },
        { key: 'points', label: '积分流水', status: 'warn' },
        { key: 'gift', label: '赠送权益说明', status: 'missing' },
        { key: 'communication', label: '沟通记录', status: 'warn' },
      ]),
      evidenceCompleteness: '3/7',
      approvalSteps: defaultApprovalSteps('evidence'),
      operationLogs: [
        { id: 'log-1', operator: '周航', time: '2026-06-18 10:20', action: '提交退费申请', note: '会员表达退费意向' },
        { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-20 14:30', action: '退回补证', note: '签到与赠送权益说明缺失' },
      ],
      riskReminder: '赠送权益不计入退费，积分不等同现金，最终金额待财务复核',
      suggestedAction: '补齐签到记录与赠送权益说明后提交复核',
      refundFields: {
        consumedPoints: '12 点',
        feeRulePlaceholder: '按合同约定，违约金规则待核对',
        finalAmountLabel: '待财务复核',
      },
    },
  },
  {
    requestId: 'acr-002',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '许倩',
    maskedPhone: '136****8810',
    store: '滨江馆',
    cardName: '天选卡',
    remainingPoints: 96,
    remainingPointsLabel: '96 点',
    amountEstimate: '约 ¥9,600',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'deductedMock',
    requestReason: '工作调动，无法继续练习',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'warn' },
    ]),
    approvalStatus: 'pendingReview',
    currentNode: '财务复核',
    applicant: '周航',
    owner: '财务 · 李婷',
    suggestedAction: '核对耗课与积分扣回后给出复核意见',
    createdAt: '2026-06-15 16:40',
    updatedAt: '2026-06-25 11:00',
    operationLogs: [
      { id: 'log-1', operator: '周航', time: '2026-06-15 16:40', action: '提交退费申请', note: '会员工作调动' },
      { id: 'log-2', operator: '店长 · 陈悦', time: '2026-06-22 09:00', action: '证据初审通过', note: '待财务复核金额' },
    ],
    drawerDetail: {
      requestId: 'acr-002',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'pendingReview',
      approvalStatusLabel: APPROVAL_LABELS.pendingReview,
      currentNode: '财务复核',
      owner: '财务 · 李婷',
      applicant: '周航',
      createdAt: '2026-06-15 16:40',
      updatedAt: '2026-06-25 11:00',
      requestReason: '工作调动，无法继续练习',
      memberName: '许倩',
      maskedPhone: '136****8810',
      store: '滨江馆',
      cardName: '天选卡',
      remainingPoints: '96 点',
      validUntil: '2027-03-15',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益计入退费',
      amountEstimate: '约 ¥9,600',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'deductedMock',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.deductedMock,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'ok' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'warn' },
      ]),
      evidenceCompleteness: '5/6',
      approvalSteps: defaultApprovalSteps('finance'),
      operationLogs: [
        { id: 'log-1', operator: '周航', time: '2026-06-15 16:40', action: '提交退费申请', note: '会员工作调动' },
        { id: 'log-2', operator: '店长 · 陈悦', time: '2026-06-22 09:00', action: '证据初审通过', note: '待财务复核金额' },
      ],
      riskReminder: '积分已扣回 mock，最终金额待财务复核，不代表退款成功',
      suggestedAction: '核对耗课与积分扣回后给出复核意见',
      refundFields: {
        consumedPoints: '24 点',
        feeRulePlaceholder: '按合同第 8 条，未开课部分可退（待核对）',
        finalAmountLabel: '待财务复核',
      },
    },
  },
  {
    requestId: 'acr-003',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '钱敏',
    maskedPhone: '139****1180',
    store: '滨江馆',
    cardName: '天选卡',
    remainingPoints: 92,
    remainingPointsLabel: '92 点',
    amountEstimate: '约 ¥9,200',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'pendingDeduct',
    requestReason: '卡项临期，希望退剩余点数',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'warn' },
      { key: 'points', label: '积分流水', status: 'missing' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'pendingReview',
    currentNode: '财务复核',
    applicant: '林敏',
    owner: '财务 · 李婷',
    suggestedAction: '先完成积分扣回状态确认，再进入金额复核',
    createdAt: '2026-06-20 11:10',
    updatedAt: '2026-06-26 08:40',
    operationLogs: [
      { id: 'log-1', operator: '林敏', time: '2026-06-20 11:10', action: '提交退费申请', note: '卡项临期退费咨询' },
    ],
    drawerDetail: {
      requestId: 'acr-003',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'pendingReview',
      approvalStatusLabel: APPROVAL_LABELS.pendingReview,
      currentNode: '财务复核',
      owner: '财务 · 李婷',
      applicant: '林敏',
      createdAt: '2026-06-20 11:10',
      updatedAt: '2026-06-26 08:40',
      requestReason: '卡项临期，希望退剩余点数',
      memberName: '钱敏',
      maskedPhone: '139****1180',
      store: '滨江馆',
      cardName: '天选卡',
      remainingPoints: '92 点',
      validUntil: '2026-07-15',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益计入退费',
      amountEstimate: '约 ¥9,200',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'pendingDeduct',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.pendingDeduct,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'warn' },
        { key: 'points', label: '积分流水', status: 'missing' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '4/6',
      approvalSteps: defaultApprovalSteps('finance'),
      operationLogs: [
        { id: 'log-1', operator: '林敏', time: '2026-06-20 11:10', action: '提交退费申请', note: '卡项临期退费咨询' },
      ],
      riskReminder: '积分待扣回，积分不等同现金，最终金额待财务复核',
      suggestedAction: '先完成积分扣回状态确认，再进入金额复核',
      refundFields: {
        consumedPoints: '28 点',
        feeRulePlaceholder: '临期退费规则待核对合同条款',
        finalAmountLabel: '待财务复核',
      },
    },
  },
  {
    requestId: 'acr-004',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '唐悦',
    maskedPhone: '137****6623',
    store: '滨江馆',
    cardName: '天选卡',
    remainingPoints: 85,
    remainingPointsLabel: '85 点',
    amountEstimate: '约 ¥8,500',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '赠送体验课 1 节不计入退费',
    pointsDeductStatus: 'waived',
    requestReason: '课程体验不符预期',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
      { key: 'gift', label: '赠送权益说明', status: 'warn' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'submitted',
    currentNode: '证据复核',
    applicant: '林敏',
    owner: '店长 · 陈悦',
    suggestedAction: '补充赠送体验课不计入退费的说明材料',
    createdAt: '2026-06-24 15:30',
    updatedAt: '2026-06-26 10:00',
    operationLogs: [
      { id: 'log-1', operator: '林敏', time: '2026-06-24 15:30', action: '提交退费申请', note: '会员反馈课程体验' },
    ],
    drawerDetail: {
      requestId: 'acr-004',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'submitted',
      approvalStatusLabel: APPROVAL_LABELS.submitted,
      currentNode: '证据复核',
      owner: '店长 · 陈悦',
      applicant: '林敏',
      createdAt: '2026-06-24 15:30',
      updatedAt: '2026-06-26 10:00',
      requestReason: '课程体验不符预期',
      memberName: '唐悦',
      maskedPhone: '137****6623',
      store: '滨江馆',
      cardName: '天选卡',
      remainingPoints: '85 点',
      validUntil: '2027-02-20',
      hasGiftBenefit: true,
      giftBenefitNote: '赠送体验课 1 节不计入退费，需补充说明',
      amountEstimate: '约 ¥8,500',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'waived',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.waived,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'ok' },
        { key: 'gift', label: '赠送权益说明', status: 'warn' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '6/7',
      approvalSteps: defaultApprovalSteps('evidence'),
      operationLogs: [
        { id: 'log-1', operator: '林敏', time: '2026-06-24 15:30', action: '提交退费申请', note: '会员反馈课程体验' },
      ],
      riskReminder: '赠送权益不计入退费，需书面说明后进入复核',
      suggestedAction: '补充赠送体验课不计入退费的说明材料',
      refundFields: {
        consumedPoints: '15 点',
        feeRulePlaceholder: '体验课后退费规则待核对',
        finalAmountLabel: '待财务复核',
      },
    },
  },
  {
    requestId: 'acr-005',
    requestType: 'freeze',
    requestTypeLabel: TYPE_LABELS.freeze,
    memberName: '孙悦',
    maskedPhone: '158****2237',
    store: '滨江馆',
    cardName: '天选卡',
    remainingPoints: 72,
    remainingPointsLabel: '72 点',
    amountEstimate: '—',
    amountEstimateNote: '冻结不涉及退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '冻结期间权益暂停使用',
    pointsDeductStatus: 'notApplicable',
    requestReason: '孕期暂停练习，申请冻结 90 天',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'ok' },
      { key: 'communication', label: '沟通记录', status: 'warn' },
    ]),
    approvalStatus: 'pendingReview',
    currentNode: '店长确认',
    applicant: '周航',
    owner: '店长 · 陈悦',
    suggestedAction: '确认冻结依据与会员沟通记录后审批',
    createdAt: '2026-06-19 09:50',
    updatedAt: '2026-06-25 16:20',
    operationLogs: [
      { id: 'log-1', operator: '周航', time: '2026-06-19 09:50', action: '提交冻结申请', note: '孕期暂停练习' },
      { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-23 11:00', action: '证据初审', note: '待店长确认' },
    ],
    drawerDetail: {
      requestId: 'acr-005',
      requestType: 'freeze',
      requestTypeLabel: TYPE_LABELS.freeze,
      drawerTitle: '冻结申请详情',
      approvalStatus: 'pendingReview',
      approvalStatusLabel: APPROVAL_LABELS.pendingReview,
      currentNode: '店长确认',
      owner: '店长 · 陈悦',
      applicant: '周航',
      createdAt: '2026-06-19 09:50',
      updatedAt: '2026-06-25 16:20',
      requestReason: '孕期暂停练习，申请冻结 90 天',
      memberName: '孙悦',
      maskedPhone: '158****2237',
      store: '滨江馆',
      cardName: '天选卡',
      remainingPoints: '72 点',
      validUntil: '2027-06-01',
      hasGiftBenefit: false,
      giftBenefitNote: '冻结期间权益暂停使用，到期自动恢复',
      amountEstimate: '—',
      amountEstimateNote: '冻结不涉及退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'ok' },
        { key: 'communication', label: '沟通记录', status: 'warn' },
      ]),
      evidenceCompleteness: '4/5',
      approvalSteps: defaultApprovalSteps('manager'),
      operationLogs: [
        { id: 'log-1', operator: '周航', time: '2026-06-19 09:50', action: '提交冻结申请', note: '孕期暂停练习' },
        { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-23 11:00', action: '证据初审', note: '待店长确认' },
      ],
      riskReminder: '冻结不改变预收负债口径，需保留沟通与审批记录',
      suggestedAction: '确认冻结依据与会员沟通记录后审批',
      freezeFields: {
        freezeDays: '90 天',
        remainingBenefits: '72 点',
        freezeStart: '待审批通过后生效',
        freezeEnd: '开始后 90 天',
        freezeBasis: '孕期暂停，合同允许冻结条款',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-006',
    requestType: 'freeze',
    requestTypeLabel: TYPE_LABELS.freeze,
    memberName: '沈岚',
    maskedPhone: '135****4418',
    store: '滨江馆',
    cardName: '锦鲤卡',
    remainingPoints: 78,
    remainingPointsLabel: '78 点',
    amountEstimate: '—',
    amountEstimateNote: '冻结不涉及退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'notApplicable',
    requestReason: '出差外地 60 天，申请临时冻结',
    evidenceStatus: 'missing',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'warn' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'missing' },
    ]),
    approvalStatus: 'evidencePending',
    currentNode: '证据复核',
    applicant: '小乔',
    owner: '财务 · 李婷',
    suggestedAction: '补充冻结条款依据与会员书面确认',
    createdAt: '2026-06-22 14:00',
    updatedAt: '2026-06-26 09:30',
    operationLogs: [
      { id: 'log-1', operator: '小乔', time: '2026-06-22 14:00', action: '提交冻结申请', note: '出差外地暂停' },
    ],
    drawerDetail: {
      requestId: 'acr-006',
      requestType: 'freeze',
      requestTypeLabel: TYPE_LABELS.freeze,
      drawerTitle: '冻结申请详情',
      approvalStatus: 'evidencePending',
      approvalStatusLabel: APPROVAL_LABELS.evidencePending,
      currentNode: '证据复核',
      owner: '财务 · 李婷',
      applicant: '小乔',
      createdAt: '2026-06-22 14:00',
      updatedAt: '2026-06-26 09:30',
      requestReason: '出差外地 60 天，申请临时冻结',
      memberName: '沈岚',
      maskedPhone: '135****4418',
      store: '滨江馆',
      cardName: '锦鲤卡',
      remainingPoints: '78 点',
      validUntil: '2027-04-10',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益',
      amountEstimate: '—',
      amountEstimateNote: '冻结不涉及退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'warn' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'missing' },
      ]),
      evidenceCompleteness: '2/4',
      approvalSteps: defaultApprovalSteps('evidence'),
      operationLogs: [
        { id: 'log-1', operator: '小乔', time: '2026-06-22 14:00', action: '提交冻结申请', note: '出差外地暂停' },
      ],
      riskReminder: '冻结依据不足，需补充合同条款与沟通记录',
      suggestedAction: '补充冻结条款依据与会员书面确认',
      freezeFields: {
        freezeDays: '60 天',
        remainingBenefits: '78 点',
        freezeStart: '待审批通过后生效',
        freezeEnd: '开始后 60 天',
        freezeBasis: '合同冻结条款待核对',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-007',
    requestType: 'freeze',
    requestTypeLabel: TYPE_LABELS.freeze,
    memberName: '郭晨',
    maskedPhone: '136****7702',
    store: '滨江馆',
    cardName: '私教包',
    remainingPoints: 54,
    remainingPointsLabel: '54 点',
    amountEstimate: '—',
    amountEstimateNote: '冻结不涉及退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '私教包冻结需确认教练档期',
    pointsDeductStatus: 'notApplicable',
    requestReason: '伤病恢复，申请冻结 30 天',
    evidenceStatus: 'complete',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'ok' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'submitted',
    currentNode: '财务复核',
    applicant: '林敏',
    owner: '财务 · 李婷',
    suggestedAction: '材料完整，可进入财务复核节点',
    createdAt: '2026-06-10 10:00',
    updatedAt: '2026-06-24 17:00',
    operationLogs: [
      { id: 'log-1', operator: '林敏', time: '2026-06-10 10:00', action: '提交冻结申请', note: '伤病恢复暂停' },
      { id: 'log-2', operator: '店长 · 陈悦', time: '2026-06-18 15:00', action: '店长确认', note: '同意冻结申请' },
    ],
    drawerDetail: {
      requestId: 'acr-007',
      requestType: 'freeze',
      requestTypeLabel: TYPE_LABELS.freeze,
      drawerTitle: '冻结申请详情',
      approvalStatus: 'submitted',
      approvalStatusLabel: APPROVAL_LABELS.submitted,
      currentNode: '财务复核',
      owner: '财务 · 李婷',
      applicant: '林敏',
      createdAt: '2026-06-10 10:00',
      updatedAt: '2026-06-24 17:00',
      requestReason: '伤病恢复，申请冻结 30 天',
      memberName: '郭晨',
      maskedPhone: '136****7702',
      store: '滨江馆',
      cardName: '私教包',
      remainingPoints: '54 点',
      validUntil: '2026-12-30',
      hasGiftBenefit: false,
      giftBenefitNote: '私教包冻结需确认教练档期',
      amountEstimate: '—',
      amountEstimateNote: '冻结不涉及退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'ok' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '5/5',
      approvalSteps: defaultApprovalSteps('finance'),
      operationLogs: [
        { id: 'log-1', operator: '林敏', time: '2026-06-10 10:00', action: '提交冻结申请', note: '伤病恢复暂停' },
        { id: 'log-2', operator: '店长 · 陈悦', time: '2026-06-18 15:00', action: '店长确认', note: '同意冻结申请' },
      ],
      riskReminder: '私教包冻结需同步教练档期安排',
      suggestedAction: '材料完整，可进入财务复核节点',
      freezeFields: {
        freezeDays: '30 天',
        remainingBenefits: '54 点',
        freezeStart: '2026-06-25',
        freezeEnd: '2026-07-25',
        freezeBasis: '伤病恢复，合同允许冻结',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-008',
    requestType: 'transfer',
    requestTypeLabel: TYPE_LABELS.transfer,
    memberName: '叶青',
    maskedPhone: '133****9055',
    store: '滨江馆',
    cardName: '锦鲤卡',
    remainingPoints: 62,
    remainingPointsLabel: '62 点',
    amountEstimate: '手续费约 ¥200',
    amountEstimateNote: '系统规则估算，非最终结算金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '转卡不涉及赠送权益转移',
    pointsDeductStatus: 'notApplicable',
    requestReason: '转赠给家人使用',
    evidenceStatus: 'missing',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'na' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'ok' },
      { key: 'communication', label: '沟通记录', status: 'missing' },
    ]),
    approvalStatus: 'evidencePending',
    currentNode: '证据复核',
    applicant: '陈悦',
    owner: '财务 · 李婷',
    suggestedAction: '补充接收方会员信息与双方确认记录',
    createdAt: '2026-06-23 13:20',
    updatedAt: '2026-06-26 11:10',
    operationLogs: [
      { id: 'log-1', operator: '陈悦', time: '2026-06-23 13:20', action: '提交转卡申请', note: '转赠家人' },
    ],
    drawerDetail: {
      requestId: 'acr-008',
      requestType: 'transfer',
      requestTypeLabel: TYPE_LABELS.transfer,
      drawerTitle: '转卡申请详情',
      approvalStatus: 'evidencePending',
      approvalStatusLabel: APPROVAL_LABELS.evidencePending,
      currentNode: '证据复核',
      owner: '财务 · 李婷',
      applicant: '陈悦',
      createdAt: '2026-06-23 13:20',
      updatedAt: '2026-06-26 11:10',
      requestReason: '转赠给家人使用',
      memberName: '叶青',
      maskedPhone: '133****9055',
      store: '滨江馆',
      cardName: '锦鲤卡',
      remainingPoints: '62 点',
      validUntil: '2027-01-20',
      hasGiftBenefit: false,
      giftBenefitNote: '转卡不涉及赠送权益转移',
      amountEstimate: '手续费约 ¥200',
      amountEstimateNote: '系统规则估算，非最终结算金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'na' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'ok' },
        { key: 'communication', label: '沟通记录', status: 'missing' },
      ]),
      evidenceCompleteness: '3/4',
      approvalSteps: defaultApprovalSteps('evidence'),
      operationLogs: [
        { id: 'log-1', operator: '陈悦', time: '2026-06-23 13:20', action: '提交转卡申请', note: '转赠家人' },
      ],
      riskReminder: '接收方信息待补，转卡需双方书面确认',
      suggestedAction: '补充接收方会员信息与双方确认记录',
      transferFields: {
        fromMember: '叶青 133****9055',
        toMember: '待补充',
        transferPoints: '62 点',
        feeEstimate: '约 ¥200（系统估算）',
        contractChangeStatus: '待确认',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-009',
    requestType: 'transfer',
    requestTypeLabel: TYPE_LABELS.transfer,
    memberName: '韩露',
    maskedPhone: '138****3371',
    store: '滨江馆',
    cardName: '初遇卡',
    remainingPoints: 44,
    remainingPointsLabel: '44 点',
    amountEstimate: '手续费约 ¥150',
    amountEstimateNote: '系统规则估算，非最终结算金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '积分不随转卡转移',
    pointsDeductStatus: 'notApplicable',
    requestReason: '转让给同事继续练习',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'na' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'ok' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'pendingReview',
    currentNode: '财务复核',
    applicant: '林敏',
    owner: '财务 · 李婷',
    suggestedAction: '确认转卡手续费规则后进入合同变更',
    createdAt: '2026-06-17 11:30',
    updatedAt: '2026-06-25 14:00',
    operationLogs: [
      { id: 'log-1', operator: '林敏', time: '2026-06-17 11:30', action: '提交转卡申请', note: '转让给同事' },
      { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-24 10:00', action: '手续费待确认', note: '按总部规则核对' },
    ],
    drawerDetail: {
      requestId: 'acr-009',
      requestType: 'transfer',
      requestTypeLabel: TYPE_LABELS.transfer,
      drawerTitle: '转卡申请详情',
      approvalStatus: 'pendingReview',
      approvalStatusLabel: APPROVAL_LABELS.pendingReview,
      currentNode: '财务复核',
      owner: '财务 · 李婷',
      applicant: '林敏',
      createdAt: '2026-06-17 11:30',
      updatedAt: '2026-06-25 14:00',
      requestReason: '转让给同事继续练习',
      memberName: '韩露',
      maskedPhone: '138****3371',
      store: '滨江馆',
      cardName: '初遇卡',
      remainingPoints: '44 点',
      validUntil: '2027-03-01',
      hasGiftBenefit: false,
      giftBenefitNote: '积分不随转卡转移，不等同现金',
      amountEstimate: '手续费约 ¥150',
      amountEstimateNote: '系统规则估算，非最终结算金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'na' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'ok' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '4/4',
      approvalSteps: defaultApprovalSteps('finance'),
      operationLogs: [
        { id: 'log-1', operator: '林敏', time: '2026-06-17 11:30', action: '提交转卡申请', note: '转让给同事' },
        { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-24 10:00', action: '手续费待确认', note: '按总部规则核对' },
      ],
      riskReminder: '手续费待总部规则确认，积分不随转卡转移',
      suggestedAction: '确认转卡手续费规则后进入合同变更',
      transferFields: {
        fromMember: '韩露 138****3371',
        toMember: '张薇 137****4455',
        transferPoints: '44 点',
        feeEstimate: '约 ¥150（待确认）',
        contractChangeStatus: '待确认',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-010',
    requestType: 'transfer',
    requestTypeLabel: TYPE_LABELS.transfer,
    memberName: '赵宁',
    maskedPhone: '131****9044',
    store: '滨江馆',
    cardName: '锦鲤卡',
    remainingPoints: 36,
    remainingPointsLabel: '36 点',
    amountEstimate: '手续费约 ¥180',
    amountEstimateNote: '系统规则估算，非最终结算金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'notApplicable',
    requestReason: '转至西湖馆继续练习',
    evidenceStatus: 'partial',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'warn' },
      { key: 'payment', label: '支付记录', status: 'na' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'na' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'submitted',
    currentNode: '证据复核',
    applicant: '小乔',
    owner: '店长 · 陈悦',
    suggestedAction: '补充跨店转卡合同变更条款',
    createdAt: '2026-06-21 16:00',
    updatedAt: '2026-06-26 08:00',
    operationLogs: [
      { id: 'log-1', operator: '小乔', time: '2026-06-21 16:00', action: '提交转卡申请', note: '跨店转卡' },
    ],
    drawerDetail: {
      requestId: 'acr-010',
      requestType: 'transfer',
      requestTypeLabel: TYPE_LABELS.transfer,
      drawerTitle: '转卡申请详情',
      approvalStatus: 'submitted',
      approvalStatusLabel: APPROVAL_LABELS.submitted,
      currentNode: '证据复核',
      owner: '店长 · 陈悦',
      applicant: '小乔',
      createdAt: '2026-06-21 16:00',
      updatedAt: '2026-06-26 08:00',
      requestReason: '转至西湖馆继续练习',
      memberName: '赵宁',
      maskedPhone: '131****9044',
      store: '滨江馆',
      cardName: '锦鲤卡',
      remainingPoints: '36 点',
      validUntil: '2026-11-02',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益',
      amountEstimate: '手续费约 ¥180',
      amountEstimateNote: '系统规则估算，非最终结算金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'warn' },
        { key: 'payment', label: '支付记录', status: 'na' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'na' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '3/4',
      approvalSteps: defaultApprovalSteps('evidence'),
      operationLogs: [
        { id: 'log-1', operator: '小乔', time: '2026-06-21 16:00', action: '提交转卡申请', note: '跨店转卡' },
      ],
      riskReminder: '跨店转卡需补充合同变更条款与双方确认',
      suggestedAction: '补充跨店转卡合同变更条款',
      transferFields: {
        fromMember: '赵宁 131****9044',
        toMember: '赵宁（西湖馆）',
        transferPoints: '36 点',
        feeEstimate: '约 ¥180（系统估算）',
        contractChangeStatus: '待确认',
        finalResultLabel: '待审批',
      },
    },
  },
  {
    requestId: 'acr-011',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '李曼',
    maskedPhone: '133****7782',
    store: '滨江馆',
    cardName: '初遇卡',
    remainingPoints: 24,
    remainingPointsLabel: '24 点',
    amountEstimate: '约 ¥2,400',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'notApplicable',
    requestReason: '会员主动取消申请',
    evidenceStatus: 'complete',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'cancelled',
    currentNode: '已取消',
    applicant: '小乔',
    owner: '—',
    suggestedAction: '无需处理，申请已取消',
    createdAt: '2026-06-05 09:00',
    updatedAt: '2026-06-12 14:00',
    operationLogs: [
      { id: 'log-1', operator: '小乔', time: '2026-06-05 09:00', action: '提交退费申请', note: '会员咨询退费' },
      { id: 'log-2', operator: '李曼', time: '2026-06-12 14:00', action: '取消申请', note: '会员决定继续练习' },
    ],
    drawerDetail: {
      requestId: 'acr-011',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'cancelled',
      approvalStatusLabel: APPROVAL_LABELS.cancelled,
      currentNode: '已取消',
      owner: '—',
      applicant: '小乔',
      createdAt: '2026-06-05 09:00',
      updatedAt: '2026-06-12 14:00',
      requestReason: '会员主动取消申请',
      memberName: '李曼',
      maskedPhone: '133****7782',
      store: '滨江馆',
      cardName: '初遇卡',
      remainingPoints: '24 点',
      validUntil: '2026-07-18',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益',
      amountEstimate: '约 ¥2,400',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'notApplicable',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.notApplicable,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'ok' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '6/6',
      approvalSteps: [
        { key: 'submitted', label: '已提交', status: 'done', time: '2026-06-05' },
        { key: 'cancelled', label: '已取消', status: 'done', time: '2026-06-12' },
      ],
      operationLogs: [
        { id: 'log-1', operator: '小乔', time: '2026-06-05 09:00', action: '提交退费申请', note: '会员咨询退费' },
        { id: 'log-2', operator: '会员', time: '2026-06-12 14:00', action: '取消申请', note: '会员决定继续练习' },
      ],
      riskReminder: '申请已取消，不涉及退款执行',
      suggestedAction: '无需处理，申请已取消',
      refundFields: {
        consumedPoints: '24 点',
        feeRulePlaceholder: '—',
        finalAmountLabel: '已取消',
      },
    },
  },
  {
    requestId: 'acr-012',
    requestType: 'refund',
    requestTypeLabel: TYPE_LABELS.refund,
    memberName: '王芳',
    maskedPhone: '137****2290',
    store: '滨江馆',
    cardName: '锦鲤卡',
    remainingPoints: 18,
    remainingPointsLabel: '18 点',
    amountEstimate: '约 ¥1,800',
    amountEstimateNote: '系统规则估算，非最终退款金额',
    giftBenefitIncluded: false,
    giftBenefitNote: '无赠送权益',
    pointsDeductStatus: 'deductedMock',
    requestReason: '搬迁外地，协商退费',
    evidenceStatus: 'complete',
    evidenceItems: buildEvidence([
      { key: 'contract', label: '合同', status: 'ok' },
      { key: 'payment', label: '支付记录', status: 'ok' },
      { key: 'consumption', label: '耗课记录', status: 'ok' },
      { key: 'checkin', label: '签到记录', status: 'ok' },
      { key: 'points', label: '积分流水', status: 'ok' },
      { key: 'gift', label: '赠送权益说明', status: 'na' },
      { key: 'communication', label: '沟通记录', status: 'ok' },
    ]),
    approvalStatus: 'completedMock',
    currentNode: '完成 mock',
    applicant: '陈悦',
    owner: '财务 · 李婷',
    suggestedAction: '流程已完成 mock，仅供演示占位',
    createdAt: '2026-05-28 10:00',
    updatedAt: '2026-06-15 16:00',
    operationLogs: [
      { id: 'log-1', operator: '陈悦', time: '2026-05-28 10:00', action: '提交退费申请', note: '搬迁外地' },
      { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-10 11:00', action: '财务复核 mock', note: '金额估算已记录' },
      { id: 'log-3', operator: '系统', time: '2026-06-15 16:00', action: '完成 mock', note: '占位记录，非真实退款' },
    ],
    drawerDetail: {
      requestId: 'acr-012',
      requestType: 'refund',
      requestTypeLabel: TYPE_LABELS.refund,
      drawerTitle: '退费申请详情',
      approvalStatus: 'completedMock',
      approvalStatusLabel: APPROVAL_LABELS.completedMock,
      currentNode: '完成 mock',
      owner: '财务 · 李婷',
      applicant: '陈悦',
      createdAt: '2026-05-28 10:00',
      updatedAt: '2026-06-15 16:00',
      requestReason: '搬迁外地，协商退费',
      memberName: '王芳',
      maskedPhone: '137****2290',
      store: '滨江馆',
      cardName: '锦鲤卡',
      remainingPoints: '18 点',
      validUntil: '2026-08-30',
      hasGiftBenefit: false,
      giftBenefitNote: '无赠送权益',
      amountEstimate: '约 ¥1,800',
      amountEstimateNote: '系统规则估算，非最终退款金额',
      giftBenefitIncluded: false,
      pointsDeductStatus: 'deductedMock',
      pointsDeductStatusLabel: POINTS_DEDUCT_LABELS.deductedMock,
      evidenceItems: buildEvidence([
        { key: 'contract', label: '合同', status: 'ok' },
        { key: 'payment', label: '支付记录', status: 'ok' },
        { key: 'consumption', label: '耗课记录', status: 'ok' },
        { key: 'checkin', label: '签到记录', status: 'ok' },
        { key: 'points', label: '积分流水', status: 'ok' },
        { key: 'gift', label: '赠送权益说明', status: 'na' },
        { key: 'communication', label: '沟通记录', status: 'ok' },
      ]),
      evidenceCompleteness: '6/6',
      approvalSteps: [
        { key: 'submitted', label: '已提交', status: 'done', time: '2026-05-28' },
        { key: 'evidence', label: '证据复核', status: 'done', time: '2026-06-02' },
        { key: 'finance', label: '财务复核', status: 'done', time: '2026-06-10' },
        { key: 'manager', label: '店长确认', status: 'done', time: '2026-06-12' },
        { key: 'hq', label: '总部复核', status: 'done', time: '2026-06-14' },
        { key: 'done', label: '完成 mock', status: 'mock', time: '2026-06-15' },
      ],
      operationLogs: [
        { id: 'log-1', operator: '陈悦', time: '2026-05-28 10:00', action: '提交退费申请', note: '搬迁外地' },
        { id: 'log-2', operator: '财务 · 李婷', time: '2026-06-10 11:00', action: '财务复核 mock', note: '金额估算已记录' },
        { id: 'log-3', operator: '系统', time: '2026-06-15 16:00', action: '完成 mock', note: '占位记录，非真实退款' },
      ],
      riskReminder: '此为 completedMock 占位记录，不代表退款成功或已到账',
      suggestedAction: '流程已完成 mock，仅供演示占位',
      refundFields: {
        consumedPoints: '42 点',
        feeRulePlaceholder: '按合同协商（mock）',
        finalAmountLabel: '待财务复核（mock 占位）',
      },
    },
  },
];

function enrichRow(
  raw: Omit<
    AssetChangeRequestRow,
    'evidenceCompleteness' | 'approvalStatusLabel' | 'evidenceStatusLabel' | 'pointsDeductStatusLabel'
  >,
): AssetChangeRequestRow {
  return {
    ...raw,
    evidenceCompleteness: countEvidence(raw.evidenceItems),
    approvalStatusLabel: APPROVAL_LABELS[raw.approvalStatus],
    evidenceStatusLabel: EVIDENCE_STATUS_LABELS[raw.evidenceStatus],
    pointsDeductStatusLabel: POINTS_DEDUCT_LABELS[raw.pointsDeductStatus],
    drawerDetail: {
      ...raw.drawerDetail,
      evidenceCompleteness: countEvidence(raw.evidenceItems),
    },
  };
}

function sortRows(rows: AssetChangeRequestRow[]): AssetChangeRequestRow[] {
  return [...rows].sort((a, b) => {
    const statusDiff = STATUS_SORT[a.approvalStatus] - STATUS_SORT[b.approvalStatus];
    if (statusDiff !== 0) return statusDiff;
    const typeDiff = TYPE_SORT[a.requestType] - TYPE_SORT[b.requestType];
    if (typeDiff !== 0) return typeDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function buildAssetChangeSnapshot(): AssetChangeSnapshot {
  const rows = sortRows(RAW_ROWS.map(enrichRow));

  return {
    meta: {
      title: '退费 / 冻结 / 转卡申请',
      subtitle: '统一查看资产变更申请、证据链完整度、审批状态和当前处理人',
      breadcrumbParent: '财务与资产',
      breadcrumbCurrent: '退费·冻结·转卡申请',
      scopeLabel: '滨江馆 · 本月申请 · 财务视角',
      description:
        '承接资产变更申请的筛选、证据链核对和审批状态跟踪，不做真实退款、冻结或转卡执行。',
      disclaimer:
        '本页金额均为系统规则估算，用于复核参考，不代表最终退款金额；赠送权益不计入退费，积分不等同现金，最终以合同、支付、耗课、积分流水和财务复核为准。',
      createToast: '新增资产变更申请（待建设）',
    },
    summaryItems: [
      { id: 'sum-all', label: '全部申请', value: '18' },
      { id: 'sum-review', label: '待复核', value: '8', isWarning: true },
      { id: 'sum-evidence', label: '证据待补', value: '5', isWarning: true },
      { id: 'sum-refund', label: '退费申请', value: '7' },
      { id: 'sum-freeze', label: '冻结申请', value: '6' },
      { id: 'sum-transfer', label: '转卡申请', value: '5' },
      { id: 'sum-new', label: '本周新增', value: '3' },
    ],
    typeTabs: [
      { id: 'tab-all', label: '全部', value: 'all' },
      { id: 'tab-refund', label: '退费', value: 'refund' },
      { id: 'tab-freeze', label: '冻结', value: 'freeze' },
      { id: 'tab-transfer', label: '转卡', value: 'transfer' },
    ],
    typeDescriptions: {
      all: '全部资产变更申请，按证据状态和申请类型排序展示。',
      refund: '重点复核合同、支付、耗课、积分扣回和赠送权益。',
      freeze: '重点复核冻结条件、剩余权益、冻结周期和会员沟通记录。',
      transfer: '重点复核转出方、接收方、手续费、合同变更和操作日志。',
    },
    filterOptions: [
      { id: 'store-all', group: 'store', label: '全部门店', value: 'all' },
      { id: 'store-bj', group: 'store', label: '滨江馆', value: 'binjiang' },
      { id: 'status-all', group: 'status', label: '全部状态', value: 'all' },
      { id: 'status-submitted', group: 'status', label: '已提交', value: 'submitted' },
      { id: 'status-evidence', group: 'status', label: '证据待补', value: 'evidencePending' },
      { id: 'status-review', group: 'status', label: '待复核', value: 'pendingReview' },
      { id: 'status-cancelled', group: 'status', label: '已取消', value: 'cancelled' },
      { id: 'status-completed', group: 'status', label: '已完成 mock', value: 'completedMock' },
      { id: 'evidence-all', group: 'evidence', label: '全部证据', value: 'all' },
      { id: 'evidence-complete', group: 'evidence', label: '证据完整', value: 'complete' },
      { id: 'evidence-partial', group: 'evidence', label: '部分缺失', value: 'partial' },
      { id: 'evidence-missing', group: 'evidence', label: '证据不足', value: 'missing' },
      { id: 'node-all', group: 'node', label: '全部节点', value: 'all' },
      { id: 'node-evidence', group: 'node', label: '证据复核', value: '证据复核' },
      { id: 'node-finance', group: 'node', label: '财务复核', value: '财务复核' },
      { id: 'node-manager', group: 'node', label: '店长确认', value: '店长确认' },
      { id: 'owner-all', group: 'owner', label: '全部负责人', value: 'all' },
      { id: 'owner-lit', group: 'owner', label: '李婷', value: 'lit' },
      { id: 'owner-cy', group: 'owner', label: '陈悦', value: 'chenyue' },
      { id: 'time-all', group: 'time', label: '全部时间', value: 'all' },
      { id: 'time-week', group: 'time', label: '本周', value: 'week' },
      { id: 'time-month', group: 'time', label: '本月', value: 'month' },
    ],
    rows,
    batchActions: {
      assignOwnerToast: '批量分配处理人（待建设）',
      markEvidencePendingToast: '批量标记证据待补（待建设）',
      exportToast: '批量导出申请（待建设）',
    },
  };
}

export function getAssetChangeDrawerDetail(
  rows: AssetChangeRequestRow[],
  requestId: string,
): AssetChangeDrawerDetail | null {
  return rows.find(r => r.requestId === requestId)?.drawerDetail ?? null;
}

export function getAssetChangeTypeClass(type: AssetChangeRequestType): string {
  switch (type) {
    case 'refund':
      return 'met-asset-change__type--refund';
    case 'freeze':
      return 'met-asset-change__type--freeze';
    case 'transfer':
      return 'met-asset-change__type--transfer';
    default:
      return '';
  }
}

export function getAssetChangeStatusClass(status: AssetChangeApprovalStatus): string {
  switch (status) {
    case 'evidencePending':
      return 'met-asset-change__status--warning';
    case 'pendingReview':
      return 'met-asset-change__status--warning';
    case 'cancelled':
      return 'met-asset-change__status--muted';
    case 'completedMock':
    case 'approvedMock':
      return 'met-asset-change__status--mock';
    case 'rejectedMock':
      return 'met-asset-change__status--danger';
    default:
      return '';
  }
}

export function getAssetChangeEvidenceClass(status: AssetChangeEvidenceStatus): string {
  switch (status) {
    case 'missing':
      return 'met-asset-change__evidence--missing';
    case 'partial':
      return 'met-asset-change__evidence--partial';
    default:
      return 'met-asset-change__evidence--complete';
  }
}

export function getAssetChangeEvidenceDotClass(status: 'ok' | 'warn' | 'missing' | 'na'): string {
  switch (status) {
    case 'ok':
      return 'is-ok';
    case 'warn':
      return 'is-warn';
    case 'missing':
      return 'is-missing';
    default:
      return 'is-na';
  }
}
