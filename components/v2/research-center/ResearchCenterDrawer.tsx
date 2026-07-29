import React, { useEffect, useMemo, useState } from 'react';
import type {
  EnrollmentDraft,
  EnrollmentRecord,
  FollowUpDraft,
  InterviewResultDraft,
  InterviewResultValue,
  InterviewScheduleDraft,
  LeadDraft,
  LeadRecord,
  ReceiptDraft,
  RefundDraft,
  ResearchCenterDrawerContent,
} from './researchCenterV2.viewModel';
import {
  BUDGET_RANGE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  COURSE_OPTIONS,
  FOLLOW_UP_METHOD_OPTIONS,
  INTENT_LEVEL_OPTIONS,
  INTERVIEW_MODE_OPTIONS,
  INTERVIEW_RESULT_OPTIONS,
  LEAD_STAGE_OPTIONS,
  MOCK_TODAY_ISO,
  PAYMENT_CHANNEL_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  RECRUITMENT_STAFF_OPTIONS,
  SOURCE_CHANNEL_OPTIONS,
  TRAINING_STAFF_OPTIONS,
} from './researchCenterOptions';
import {
  getSuggestedActionForStage,
  suggestNextLeadStage,
  validateLeadStageTransition,
} from './researchCenterCalculations';
import { ResearchFieldError, StaffSelector } from './researchFormFields';

export type ResearchCenterDrawerState =
  | { type: 'content'; key: string }
  | { type: 'lead'; id: string }
  | { type: 'enrollment'; leadId?: string }
  | { type: 'assign-owner' }
  | { type: 'new-lead' }
  | { type: 'follow-up'; leadId?: string }
  | { type: 'interview'; leadId?: string; mode?: 'schedule' | 'result' }
  | { type: 'edit-stage'; leadId?: string }
  | { type: 'record-payment'; enrollmentId?: string }
  | { type: 'refund'; enrollmentId?: string }
  | { type: 'join-cohort'; enrollmentId?: string }
  | null;

interface CohortOption {
  id: string;
  displayTitle: string;
  standardPrice: number;
  recruitmentOwner: string;
}

interface ResearchCenterDrawerProps {
  drawer: ResearchCenterDrawerState;
  content: ResearchCenterDrawerContent | null;
  leads: LeadRecord[];
  enrollments: EnrollmentRecord[];
  cohorts: CohortOption[];
  activeCohortId: string;
  cohortPrice: number;
  onClose: () => void;
  onToast: (msg: string) => void;
  onSaveEnrollment: (draft: EnrollmentDraft) => { ok: boolean; error?: string };
  onRecordReceipt: (draft: ReceiptDraft) => { ok: boolean; error?: string };
  onJoinCohort: (enrollmentId: string) => { ok: boolean; error?: string };
  onRefundEnrollment: (draft: RefundDraft) => { ok: boolean; error?: string };
  onAssignOwner: (owner: string) => void;
  onConfigurePayment: () => void;
  onOpenDrawer: (key: string) => void;
  onOpenEnrollment: (leadId?: string) => void;
  onAddLead: (draft: LeadDraft) => { ok: boolean; id?: string; error?: string };
  onAddFollowUp: (draft: FollowUpDraft) => { ok: boolean; error?: string };
  onUpdateLeadFields: (
    leadId: string,
    patch: Partial<Pick<LeadRecord, 'intentLevel' | 'stage' | 'owner' | 'course' | 'expectedAmount'>>,
    options?: { forceReason?: string },
  ) => { ok: boolean; error?: string; warning?: string };
  onScheduleInterview: (draft: InterviewScheduleDraft) => { ok: boolean; error?: string };
  onRecordInterviewResult: (draft: InterviewResultDraft) => { ok: boolean; error?: string };
  /** Navigate to another drawer variant (e.g. from lead detail → record-payment). */
  onSetDrawer?: (drawer: ResearchCenterDrawerState) => void;
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('zh-CN')} 元`;
}

function defaultOwner(): string {
  return RECRUITMENT_STAFF_OPTIONS.find(o => o.value !== '待指定')?.value ?? '芳芳';
}

function createDefaultLeadDraft(activeCohortId: string, cohortPrice: number): LeadDraft {
  return {
    name: '',
    phone: '',
    wechat: '',
    course: COURSE_OPTIONS[0],
    source: SOURCE_CHANNEL_OPTIONS[0],
    learningBase: '',
    learningPurpose: '',
    budgetNote: BUDGET_RANGE_OPTIONS[3],
    timeCondition: '',
    intentLevel: INTENT_LEVEL_OPTIONS[0].value,
    owner: defaultOwner(),
    expectedAmount: cohortPrice,
    targetCohortId: activeCohortId,
    nextFollowUpDate: MOCK_TODAY_ISO,
    note: '',
  };
}

function createDefaultFollowForm(): FollowUpDraft {
  return {
    leadId: '',
    method: FOLLOW_UP_METHOD_OPTIONS[0],
    result: '',
    intentLevel: INTENT_LEVEL_OPTIONS[1].value,
    stage: LEAD_STAGE_OPTIONS[0],
    nextStep: '',
    nextFollowUpDate: MOCK_TODAY_ISO,
    note: '',
  };
}

function createDefaultInterviewSchedule(): InterviewScheduleDraft {
  return {
    leadId: '',
    scheduledAt: MOCK_TODAY_ISO,
    interviewMode: INTERVIEW_MODE_OPTIONS[0],
    interviewer: TRAINING_STAFF_OPTIONS.find(o => o.value === '教培负责人')?.value ?? '教培负责人',
    suggestedCourse: COURSE_OPTIONS[0],
    note: '',
  };
}

function createDefaultInterviewResult(): InterviewResultDraft {
  return {
    leadId: '',
    result: INTERVIEW_RESULT_OPTIONS[0],
    foundationEval: '',
    timeEval: '',
    goalEval: '',
    suggestedCourse: COURSE_OPTIONS[0],
    riskNote: '',
    interviewer: TRAINING_STAFF_OPTIONS.find(o => o.value === '教培负责人')?.value ?? '教培负责人',
    note: '',
  };
}

function createDefaultEnrollment(activeCohortId: string, cohortPrice: number, owner: string): EnrollmentDraft {
  return {
    mode: 'existing',
    leadId: '',
    newName: '',
    cohortId: activeCohortId,
    course: COURSE_OPTIONS[0],
    standardPrice: cohortPrice,
    dealPrice: cohortPrice,
    paymentMethod: PAYMENT_CHANNEL_OPTIONS[0],
    paymentStatus: PAYMENT_STATUS_OPTIONS[0],
    contractStatus: CONTRACT_STATUS_OPTIONS[0],
    owner,
    note: '',
    initialReceiptAmount: 0,
  };
}

function createDefaultReceipt(): ReceiptDraft {
  return {
    enrollmentId: '',
    amount: 0,
    paymentMethod: PAYMENT_CHANNEL_OPTIONS[0],
    date: MOCK_TODAY_ISO,
    operator: defaultOwner(),
    note: '',
  };
}

function createDefaultRefund(): RefundDraft {
  return {
    enrollmentId: '',
    amount: 0,
    reason: '',
    date: MOCK_TODAY_ISO,
    operator: defaultOwner(),
    exitCohort: true,
  };
}

const ResearchCenterDrawer: React.FC<ResearchCenterDrawerProps> = ({
  drawer,
  content,
  leads,
  enrollments,
  cohorts,
  activeCohortId,
  cohortPrice,
  onClose,
  onToast,
  onSaveEnrollment,
  onRecordReceipt,
  onJoinCohort,
  onRefundEnrollment,
  onAssignOwner,
  onConfigurePayment,
  onOpenDrawer,
  onOpenEnrollment,
  onAddLead,
  onAddFollowUp,
  onUpdateLeadFields,
  onScheduleInterview,
  onRecordInterviewResult,
  onSetDrawer,
}) => {
  const drawerKey = drawer ? JSON.stringify(drawer) : '';

  const [saving, setSaving] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<LeadDraft>(() => createDefaultLeadDraft(activeCohortId, cohortPrice));
  const [followForm, setFollowForm] = useState<FollowUpDraft>(createDefaultFollowForm);
  const [interviewScheduleForm, setInterviewScheduleForm] = useState<InterviewScheduleDraft>(createDefaultInterviewSchedule);
  const [interviewResultForm, setInterviewResultForm] = useState<InterviewResultDraft>(createDefaultInterviewResult);
  const [stageForm, setStageForm] = useState({
    leadId: '',
    stage: LEAD_STAGE_OPTIONS[0],
    intentLevel: INTENT_LEVEL_OPTIONS[1].value,
    forceReason: '',
  });
  const [stageFieldError, setStageFieldError] = useState<string | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentDraft>(() =>
    createDefaultEnrollment(activeCohortId, cohortPrice, defaultOwner()),
  );
  const [receiptForm, setReceiptForm] = useState<ReceiptDraft>(createDefaultReceipt);
  const [refundForm, setRefundForm] = useState<RefundDraft>(createDefaultRefund);
  const [assignOwnerName, setAssignOwnerName] = useState(defaultOwner());
  const [joinConfirmId, setJoinConfirmId] = useState<string | null>(null);

  const cohortById = useMemo(() => new Map(cohorts.map(c => [c.id, c])), [cohorts]);

  useEffect(() => {
    setSaving(false);
    setStageFieldError(null);
    setJoinConfirmId(null);
    setNewLeadForm(createDefaultLeadDraft(activeCohortId, cohortPrice));
    setFollowForm(createDefaultFollowForm());
    setInterviewScheduleForm(createDefaultInterviewSchedule());
    setInterviewResultForm(createDefaultInterviewResult());
    setStageForm({
      leadId: '',
      stage: LEAD_STAGE_OPTIONS[0],
      intentLevel: INTENT_LEVEL_OPTIONS[1].value,
      forceReason: '',
    });
    setEnrollmentForm(createDefaultEnrollment(activeCohortId, cohortPrice, defaultOwner()));
    setReceiptForm(createDefaultReceipt());
    setRefundForm(createDefaultRefund());
    setAssignOwnerName(defaultOwner());

    if (!drawer) return;

    const prefillLead = (leadId: string | undefined) => leads.find(l => l.id === leadId);

    if (drawer.type === 'new-lead') {
      setNewLeadForm(createDefaultLeadDraft(activeCohortId, cohortPrice));
    }

    if (drawer.type === 'follow-up') {
      const lead = prefillLead(drawer.leadId);
      setFollowForm({
        leadId: drawer.leadId ?? '',
        method: FOLLOW_UP_METHOD_OPTIONS[0],
        result: '',
        intentLevel: lead?.intentLevel ?? INTENT_LEVEL_OPTIONS[1].value,
        stage: String(lead?.stage ?? LEAD_STAGE_OPTIONS[0]),
        nextStep: lead?.suggestedAction ?? '',
        nextFollowUpDate: lead?.nextFollowUpDate ?? MOCK_TODAY_ISO,
        note: '',
      });
    }

    if (drawer.type === 'interview') {
      const lead = prefillLead(drawer.leadId);
      const mode = drawer.mode ?? 'schedule';
      if (mode === 'schedule') {
        setInterviewScheduleForm({
          leadId: drawer.leadId ?? '',
          scheduledAt: MOCK_TODAY_ISO,
          interviewMode: lead?.interview?.interviewMode ?? INTERVIEW_MODE_OPTIONS[0],
          interviewer: lead?.interview?.interviewer ?? defaultInterviewer(),
          suggestedCourse: lead?.course ?? COURSE_OPTIONS[0],
          note: lead?.interview?.note ?? '',
        });
      } else {
        setInterviewResultForm({
          leadId: drawer.leadId ?? '',
          result: lead?.interview?.result ?? INTERVIEW_RESULT_OPTIONS[0],
          foundationEval: lead?.interview?.foundationEval ?? '',
          timeEval: lead?.interview?.timeEval ?? '',
          goalEval: lead?.interview?.goalEval ?? '',
          suggestedCourse: lead?.course ?? COURSE_OPTIONS[0],
          riskNote: lead?.interview?.riskNote ?? '',
          interviewer: lead?.interview?.interviewer ?? defaultInterviewer(),
          note: lead?.interview?.note ?? '',
        });
      }
    }

    if (drawer.type === 'edit-stage') {
      const lead = prefillLead(drawer.leadId);
      setStageForm({
        leadId: drawer.leadId ?? '',
        stage: String(lead?.stage ?? LEAD_STAGE_OPTIONS[0]),
        intentLevel: lead?.intentLevel ?? INTENT_LEVEL_OPTIONS[1].value,
        forceReason: '',
      });
    }

    if (drawer.type === 'enrollment') {
      const lead = prefillLead(drawer.leadId);
      const cohort = cohortById.get(activeCohortId);
      const price = cohort?.standardPrice ?? cohortPrice;
      setEnrollmentForm({
        mode: 'existing',
        leadId: drawer.leadId ?? '',
        newName: '',
        cohortId: activeCohortId,
        course: lead?.course ?? COURSE_OPTIONS[0],
        standardPrice: price,
        dealPrice: lead?.expectedAmount ?? price,
        paymentMethod: PAYMENT_CHANNEL_OPTIONS[0],
        paymentStatus: PAYMENT_STATUS_OPTIONS[0],
        contractStatus: CONTRACT_STATUS_OPTIONS[0],
        owner: lead?.owner && lead.owner !== '待指定' ? lead.owner : defaultOwner(),
        note: '',
        initialReceiptAmount: 0,
      });
    }

    if (drawer.type === 'record-payment') {
      const enrollment = enrollments.find(e => e.id === drawer.enrollmentId && !e.refunded);
      setReceiptForm({
        enrollmentId: enrollment?.id ?? drawer.enrollmentId ?? '',
        amount: 0,
        paymentMethod: enrollment?.paymentMethod ?? PAYMENT_CHANNEL_OPTIONS[0],
        date: MOCK_TODAY_ISO,
        operator: enrollment?.owner ?? defaultOwner(),
        note: '',
      });
    }

    if (drawer.type === 'refund') {
      const enrollment = enrollments.find(e => e.id === drawer.enrollmentId && !e.refunded);
      setRefundForm({
        enrollmentId: enrollment?.id ?? drawer.enrollmentId ?? '',
        amount: enrollment?.paidAmount ?? 0,
        reason: '',
        date: MOCK_TODAY_ISO,
        operator: enrollment?.owner ?? defaultOwner(),
        exitCohort: true,
      });
    }

    if (drawer.type === 'join-cohort' && drawer.enrollmentId) {
      setJoinConfirmId(drawer.enrollmentId);
    }

    if (drawer.type === 'assign-owner') {
      const cohort = cohortById.get(activeCohortId);
      setAssignOwnerName(
        cohort?.recruitmentOwner && cohort.recruitmentOwner !== '待指定'
          ? cohort.recruitmentOwner
          : defaultOwner(),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when drawer identity changes
  }, [drawerKey]);

  const availableEnrollmentLeads = useMemo(
    () =>
      leads.filter(l => {
        const cohortId = enrollmentForm.cohortId;
        if ((l.enrolledCohortIds ?? []).includes(cohortId)) return false;
        const dup = enrollments.some(e => e.leadId === l.id && e.cohortId === cohortId && !e.refunded);
        return !dup;
      }),
    [enrollmentForm.cohortId, enrollments, leads],
  );

  const activeReceiptEnrollment = useMemo(
    () => enrollments.find(e => e.id === receiptForm.enrollmentId && !e.refunded),
    [enrollments, receiptForm.enrollmentId],
  );

  const activeRefundEnrollment = useMemo(
    () => enrollments.find(e => e.id === refundForm.enrollmentId && !e.refunded),
    [enrollments, refundForm.enrollmentId],
  );

  const joinReadyEnrollments = useMemo(
    () =>
      enrollments.filter(
        e => e.paymentStatus === '已付清' && !e.joined && !e.refunded,
      ),
    [enrollments],
  );

  const receiptEligibleEnrollments = useMemo(
    () => enrollments.filter(e => !e.refunded && e.paidAmount < e.dealPrice),
    [enrollments],
  );

  const refundEligibleEnrollments = useMemo(
    () => enrollments.filter(e => !e.refunded && e.paidAmount > 0),
    [enrollments],
  );

  if (!drawer) return null;

  const navigateDrawer = (next: ResearchCenterDrawerState) => {
    if (onSetDrawer) onSetDrawer(next);
    else onToast('请从页面入口打开该操作');
  };

  const shell = (title: string, subtitle: string, body: React.ReactNode, footer?: React.ReactNode) => (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭" onClick={onClose} />
      <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog" aria-modal="true">
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">{title}</h2>
            <p className="met-v2-drawer-subtitle">{subtitle}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="met-v2-drawer-body">
          {body}
          {footer}
        </div>
      </aside>
    </>
  );

  const inlineFooter = (primaryLabel: string, onPrimary: () => void, options?: { disabled?: boolean; secondaryLabel?: string }) => (
    <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
      <button
        type="button"
        className="met-v2-drawer-footer-btn"
        disabled={options?.disabled ?? saving}
        onClick={onPrimary}
      >
        {saving ? '保存中…' : primaryLabel}
      </button>
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        {options?.secondaryLabel ?? '取消'}
      </button>
    </div>
  );

  if (drawer.type === 'new-lead') {
    return shell(
      '新增咨询',
      '录入咨询者基础信息，进入招生状态流',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            姓名 *
            <input
              className="met-rc-v2-input"
              value={newLeadForm.name}
              onChange={e => setNewLeadForm(f => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label>
            手机号
            <input
              className="met-rc-v2-input"
              value={newLeadForm.phone}
              onChange={e => setNewLeadForm(f => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label>
            微信号
            <input
              className="met-rc-v2-input"
              value={newLeadForm.wechat}
              onChange={e => setNewLeadForm(f => ({ ...f, wechat: e.target.value }))}
            />
          </label>
          <label>
            来源渠道
            <select
              className="met-rc-v2-input"
              value={newLeadForm.source}
              onChange={e => setNewLeadForm(f => ({ ...f, source: e.target.value }))}
            >
              {SOURCE_CHANNEL_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            意向课程
            <select
              className="met-rc-v2-input"
              value={newLeadForm.course}
              onChange={e => setNewLeadForm(f => ({ ...f, course: e.target.value }))}
            >
              {COURSE_OPTIONS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            目标班期
            <select
              className="met-rc-v2-input"
              value={newLeadForm.targetCohortId}
              onChange={e => {
                const cohort = cohortById.get(e.target.value);
                setNewLeadForm(f => ({
                  ...f,
                  targetCohortId: e.target.value,
                  expectedAmount: cohort?.standardPrice ?? f.expectedAmount,
                }));
              }}
            >
              {cohorts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.displayTitle}
                </option>
              ))}
            </select>
          </label>
          <label>
            学习基础
            <input
              className="met-rc-v2-input"
              value={newLeadForm.learningBase}
              placeholder="如：有一年瑜伽练习基础"
              onChange={e => setNewLeadForm(f => ({ ...f, learningBase: e.target.value }))}
            />
          </label>
          <label>
            学习目的
            <input
              className="met-rc-v2-input"
              value={newLeadForm.learningPurpose}
              placeholder="如：转型成为瑜伽老师"
              onChange={e => setNewLeadForm(f => ({ ...f, learningPurpose: e.target.value }))}
            />
          </label>
          <label>
            预算区间
            <select
              className="met-rc-v2-input"
              value={newLeadForm.budgetNote}
              onChange={e => setNewLeadForm(f => ({ ...f, budgetNote: e.target.value }))}
            >
              {BUDGET_RANGE_OPTIONS.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            时间条件
            <input
              className="met-rc-v2-input"
              value={newLeadForm.timeCondition}
              placeholder="如：可以参加2026年7月27日班"
              onChange={e => setNewLeadForm(f => ({ ...f, timeCondition: e.target.value }))}
            />
          </label>
          <label>
            意向等级
            <select
              className="met-rc-v2-input"
              value={newLeadForm.intentLevel}
              onChange={e => setNewLeadForm(f => ({ ...f, intentLevel: e.target.value }))}
            >
              {INTENT_LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            负责人
            <StaffSelector
              value={newLeadForm.owner}
              options={RECRUITMENT_STAFF_OPTIONS}
              onChange={owner => setNewLeadForm(f => ({ ...f, owner }))}
            />
          </label>
          <label>
            下次跟进日期
            <input
              className="met-rc-v2-input"
              type="date"
              value={newLeadForm.nextFollowUpDate}
              onChange={e => setNewLeadForm(f => ({ ...f, nextFollowUpDate: e.target.value }))}
            />
          </label>
          <label>
            备注
            <input
              className="met-rc-v2-input"
              value={newLeadForm.note}
              onChange={e => setNewLeadForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>
        {inlineFooter('保存咨询', () => {
          if (saving) return;
          if (!newLeadForm.name.trim()) {
            onToast('请填写姓名');
            return;
          }
          setSaving(true);
          const result = onAddLead(newLeadForm);
          if (!result.ok) {
            onToast(result.error || '保存失败');
            setSaving(false);
            return;
          }
          onToast(`已新增咨询：${newLeadForm.name.trim()}（新咨询）`);
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'follow-up') {
    return shell(
      '记录跟进',
      '追加跟进记录并更新意向与阶段',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            咨询者
            <select
              className="met-rc-v2-input"
              value={followForm.leadId}
              onChange={e => {
                const lead = leads.find(l => l.id === e.target.value);
                setFollowForm(f => ({
                  ...f,
                  leadId: e.target.value,
                  intentLevel: lead?.intentLevel ?? f.intentLevel,
                  stage: String(lead?.stage ?? f.stage),
                  nextStep: lead?.suggestedAction ?? f.nextStep,
                  nextFollowUpDate: lead?.nextFollowUpDate ?? f.nextFollowUpDate,
                }));
              }}
            >
              <option value="">请选择</option>
              {leads.filter(l => !l.enrolled).map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.stage}
                </option>
              ))}
            </select>
          </label>
          <label>
            跟进方式
            <select
              className="met-rc-v2-input"
              value={followForm.method}
              onChange={e => setFollowForm(f => ({ ...f, method: e.target.value }))}
            >
              {FOLLOW_UP_METHOD_OPTIONS.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            跟进结果
            <input
              className="met-rc-v2-input"
              value={followForm.result}
              onChange={e => setFollowForm(f => ({ ...f, result: e.target.value }))}
            />
          </label>
          <label>
            意向等级
            <select
              className="met-rc-v2-input"
              value={followForm.intentLevel}
              onChange={e => setFollowForm(f => ({ ...f, intentLevel: e.target.value }))}
            >
              {INTENT_LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            阶段
            <select
              className="met-rc-v2-input"
              value={followForm.stage}
              onChange={e => setFollowForm(f => ({ ...f, stage: e.target.value }))}
            >
              {LEAD_STAGE_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            下次跟进日期
            <input
              className="met-rc-v2-input"
              type="date"
              value={followForm.nextFollowUpDate}
              onChange={e => setFollowForm(f => ({ ...f, nextFollowUpDate: e.target.value }))}
            />
          </label>
          <label>
            下一步
            <input
              className="met-rc-v2-input"
              value={followForm.nextStep}
              onChange={e => setFollowForm(f => ({ ...f, nextStep: e.target.value }))}
            />
          </label>
          <label>
            备注
            <input
              className="met-rc-v2-input"
              value={followForm.note}
              onChange={e => setFollowForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>
        {inlineFooter('保存跟进', () => {
          if (!followForm.leadId) {
            onToast('请选择咨询者');
            return;
          }
          if (!followForm.result.trim()) {
            onToast('请填写跟进结果');
            return;
          }
          const result = onAddFollowUp(followForm);
          if (!result.ok) {
            onToast(result.error || '跟进保存失败');
            return;
          }
          onToast('跟进已记录');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'interview') {
    const mode = drawer.mode ?? 'schedule';

    if (mode === 'result') {
      return shell(
        '录入面试结果',
        '录入评估与结论，推进面试通过 / 已面试',
        <>
          <div className="met-rc-v2-drawer-form">
            <label>
              咨询者
              <select
                className="met-rc-v2-input"
                value={interviewResultForm.leadId}
                onChange={e => {
                  const lead = leads.find(l => l.id === e.target.value);
                  setInterviewResultForm(f => ({
                    ...f,
                    leadId: e.target.value,
                    suggestedCourse: lead?.course ?? f.suggestedCourse,
                    interviewer: lead?.interview?.interviewer ?? f.interviewer,
                  }));
                }}
              >
                <option value="">请选择</option>
                {leads.filter(l => !l.enrolled).map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.stage}
                  </option>
                ))}
              </select>
            </label>
            <label>
              面试结果
              <select
                className="met-rc-v2-input"
                value={interviewResultForm.result}
                onChange={e =>
                  setInterviewResultForm(f => ({ ...f, result: e.target.value as InterviewResultValue }))
                }
              >
                {INTERVIEW_RESULT_OPTIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              基础评估
              <input
                className="met-rc-v2-input"
                value={interviewResultForm.foundationEval}
                onChange={e => setInterviewResultForm(f => ({ ...f, foundationEval: e.target.value }))}
              />
            </label>
            <label>
              时间评估
              <input
                className="met-rc-v2-input"
                value={interviewResultForm.timeEval}
                onChange={e => setInterviewResultForm(f => ({ ...f, timeEval: e.target.value }))}
              />
            </label>
            <label>
              目标评估
              <input
                className="met-rc-v2-input"
                value={interviewResultForm.goalEval}
                onChange={e => setInterviewResultForm(f => ({ ...f, goalEval: e.target.value }))}
              />
            </label>
            <label>
              建议课程
              <select
                className="met-rc-v2-input"
                value={interviewResultForm.suggestedCourse}
                onChange={e => setInterviewResultForm(f => ({ ...f, suggestedCourse: e.target.value }))}
              >
                {COURSE_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              风险提示
              <input
                className="met-rc-v2-input"
                value={interviewResultForm.riskNote}
                onChange={e => setInterviewResultForm(f => ({ ...f, riskNote: e.target.value }))}
              />
            </label>
            <label>
              面试官
              <StaffSelector
                value={interviewResultForm.interviewer}
                options={TRAINING_STAFF_OPTIONS}
                onChange={interviewer => setInterviewResultForm(f => ({ ...f, interviewer }))}
              />
            </label>
            <label>
              备注
              <input
                className="met-rc-v2-input"
                value={interviewResultForm.note}
                onChange={e => setInterviewResultForm(f => ({ ...f, note: e.target.value }))}
              />
            </label>
          </div>
          {inlineFooter('保存结果', () => {
            if (!interviewResultForm.leadId) {
              onToast('请选择咨询者');
              return;
            }
            const result = onRecordInterviewResult(interviewResultForm);
            if (!result.ok) {
              onToast(result.error || '保存失败');
              return;
            }
            onToast(`面试结果已录入 → ${interviewResultForm.result}`);
            onClose();
          })}
        </>,
      );
    }

    return shell(
      '安排面试',
      '确认面试时间、方式与面试官',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            咨询者
            <select
              className="met-rc-v2-input"
              value={interviewScheduleForm.leadId}
              onChange={e => {
                const lead = leads.find(l => l.id === e.target.value);
                setInterviewScheduleForm(f => ({
                  ...f,
                  leadId: e.target.value,
                  suggestedCourse: lead?.course ?? f.suggestedCourse,
                }));
              }}
            >
              <option value="">请选择</option>
              {leads.filter(l => !l.enrolled).map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.stage}
                </option>
              ))}
            </select>
          </label>
          <label>
            面试日期
            <input
              className="met-rc-v2-input"
              type="date"
              value={interviewScheduleForm.scheduledAt}
              onChange={e => setInterviewScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))}
            />
          </label>
          <label>
            面试方式
            <select
              className="met-rc-v2-input"
              value={interviewScheduleForm.interviewMode}
              onChange={e => setInterviewScheduleForm(f => ({ ...f, interviewMode: e.target.value }))}
            >
              {INTERVIEW_MODE_OPTIONS.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            面试官
            <StaffSelector
              value={interviewScheduleForm.interviewer}
              options={TRAINING_STAFF_OPTIONS}
              onChange={interviewer => setInterviewScheduleForm(f => ({ ...f, interviewer }))}
            />
          </label>
          <label>
            建议课程
            <select
              className="met-rc-v2-input"
              value={interviewScheduleForm.suggestedCourse}
              onChange={e => setInterviewScheduleForm(f => ({ ...f, suggestedCourse: e.target.value }))}
            >
              {COURSE_OPTIONS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            备注
            <input
              className="met-rc-v2-input"
              value={interviewScheduleForm.note}
              onChange={e => setInterviewScheduleForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>
        {inlineFooter('保存安排', () => {
          if (!interviewScheduleForm.leadId) {
            onToast('请选择咨询者');
            return;
          }
          const result = onScheduleInterview(interviewScheduleForm);
          if (!result.ok) {
            onToast(result.error || '保存失败');
            return;
          }
          onToast('已安排面试 → 待面试');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'edit-stage') {
    const currentLead = leads.find(l => l.id === stageForm.leadId);
    const recommend = currentLead ? suggestNextLeadStage(String(currentLead.stage)) : null;

    return shell(
      '修改阶段 / 意向',
      recommend
        ? `建议下一状态：${recommend}（${getSuggestedActionForStage(recommend)}）`
        : '按状态流推进，禁止不合理跳转',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            咨询者
            <select
              className="met-rc-v2-input"
              value={stageForm.leadId}
              onChange={e => {
                const lead = leads.find(l => l.id === e.target.value);
                setStageFieldError(null);
                setStageForm({
                  leadId: e.target.value,
                  stage: String(lead?.stage ?? LEAD_STAGE_OPTIONS[0]),
                  intentLevel: lead?.intentLevel ?? INTENT_LEVEL_OPTIONS[1].value,
                  forceReason: '',
                });
              }}
            >
              <option value="">请选择</option>
              {leads.filter(l => !l.enrolled).map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.stage}
                </option>
              ))}
            </select>
          </label>
          <label>
            意向等级
            <select
              className="met-rc-v2-input"
              value={stageForm.intentLevel}
              onChange={e => setStageForm(f => ({ ...f, intentLevel: e.target.value }))}
            >
              {INTENT_LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            当前阶段
            <select
              className="met-rc-v2-input"
              value={stageForm.stage}
              onChange={e => {
                setStageFieldError(null);
                setStageForm(f => ({ ...f, stage: e.target.value }));
              }}
            >
              {LEAD_STAGE_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            强制跳转原因（总部管理员）
            <input
              className="met-rc-v2-input"
              value={stageForm.forceReason}
              placeholder="跨阶段跳转时必填"
              onChange={e => {
                setStageFieldError(null);
                setStageForm(f => ({ ...f, forceReason: e.target.value }));
              }}
            />
          </label>
          <ResearchFieldError message={stageFieldError} />
          {currentLead?.anomaly ? <p className="met-rc-v2-field-error">{currentLead.anomaly}</p> : null}
          {recommend ? (
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              onClick={() => {
                setStageFieldError(null);
                setStageForm(f => ({ ...f, stage: recommend }));
              }}
            >
              采用建议状态：{recommend}
            </button>
          ) : null}
        </div>
        {inlineFooter('保存', () => {
          if (!stageForm.leadId) {
            onToast('请选择咨询者');
            return;
          }
          if (!currentLead) {
            onToast('咨询者不存在');
            return;
          }
          const forceOpts = stageForm.forceReason.trim()
            ? { forceReason: stageForm.forceReason.trim() }
            : undefined;
          const validation = validateLeadStageTransition(
            String(currentLead.stage),
            stageForm.stage,
            currentLead,
            forceOpts,
          );
          if (!validation.ok) {
            if (validation.requireForceReason && !stageForm.forceReason.trim()) {
              setStageFieldError('请填写强制跳转原因');
              onToast(validation.error || '需要填写强制跳转原因');
              return;
            }
            onToast(validation.error || '状态修改失败');
            return;
          }
          const result = onUpdateLeadFields(
            stageForm.leadId,
            { stage: stageForm.stage, intentLevel: stageForm.intentLevel },
            forceOpts,
          );
          if (!result.ok) {
            onToast(result.error || '状态修改失败');
            return;
          }
          if (result.warning) onToast(result.warning);
          else onToast('阶段已更新');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'enrollment') {
    const selectedLead = leads.find(l => l.id === enrollmentForm.leadId);
    const selectedCohort = cohortById.get(enrollmentForm.cohortId);

    return shell(
      '添加报名',
      '通过业务动作更新实缴人数与收款，不可直接改数字',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            所属班期 *
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.cohortId}
              onChange={e => {
                const cohort = cohortById.get(e.target.value);
                setEnrollmentForm(f => ({
                  ...f,
                  cohortId: e.target.value,
                  standardPrice: cohort?.standardPrice ?? f.standardPrice,
                  dealPrice: cohort?.standardPrice ?? f.dealPrice,
                }));
              }}
            >
              {cohorts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.displayTitle}
                </option>
              ))}
            </select>
          </label>
          <label>
            报名来源
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.mode}
              onChange={e =>
                setEnrollmentForm(f => ({
                  ...f,
                  mode: e.target.value as EnrollmentDraft['mode'],
                  leadId: e.target.value === 'existing' ? f.leadId : '',
                  newName: e.target.value === 'new' ? f.newName : '',
                }))
              }
            >
              <option value="existing">选择已有咨询者</option>
              <option value="new">新增学员</option>
            </select>
          </label>
          {enrollmentForm.mode === 'existing' ? (
            <label>
              咨询者
              <select
                className="met-rc-v2-input"
                value={enrollmentForm.leadId ?? ''}
                onChange={e => {
                  const lead = leads.find(l => l.id === e.target.value);
                  setEnrollmentForm(f => ({
                    ...f,
                    leadId: e.target.value,
                    course: lead?.course ?? f.course,
                    dealPrice: lead?.expectedAmount ?? f.dealPrice,
                    owner: lead?.owner && lead.owner !== '待指定' ? lead.owner : f.owner,
                  }));
                }}
              >
                <option value="">请选择</option>
                {availableEnrollmentLeads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} · {l.stage}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              学员姓名 *
              <input
                className="met-rc-v2-input"
                value={enrollmentForm.newName ?? ''}
                onChange={e => setEnrollmentForm(f => ({ ...f, newName: e.target.value }))}
              />
            </label>
          )}
          {selectedLead ? (
            <p className="met-rc-v2-drawer__note">
              自动带出：{selectedLead.name} · {selectedLead.course} · 负责人 {selectedLead.owner}
            </p>
          ) : null}
          <label>
            课程
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.course}
              onChange={e => setEnrollmentForm(f => ({ ...f, course: e.target.value }))}
            >
              {COURSE_OPTIONS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            标准价格（只读）
            <input className="met-rc-v2-input" type="number" readOnly value={enrollmentForm.standardPrice} />
          </label>
          <label>
            成交价格 *
            <input
              className="met-rc-v2-input"
              type="number"
              value={enrollmentForm.dealPrice}
              onChange={e => setEnrollmentForm(f => ({ ...f, dealPrice: Number(e.target.value) }))}
            />
          </label>
          <label>
            支付方式 *
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.paymentMethod}
              onChange={e => setEnrollmentForm(f => ({ ...f, paymentMethod: e.target.value }))}
            >
              {PAYMENT_CHANNEL_OPTIONS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            付款状态
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.paymentStatus}
              onChange={e => setEnrollmentForm(f => ({ ...f, paymentStatus: e.target.value }))}
            >
              {PAYMENT_STATUS_OPTIONS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            合同状态
            <select
              className="met-rc-v2-input"
              value={enrollmentForm.contractStatus}
              onChange={e => setEnrollmentForm(f => ({ ...f, contractStatus: e.target.value }))}
            >
              {CONTRACT_STATUS_OPTIONS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            负责人
            <StaffSelector
              value={enrollmentForm.owner}
              options={RECRUITMENT_STAFF_OPTIONS}
              onChange={owner => setEnrollmentForm(f => ({ ...f, owner }))}
            />
          </label>
          <label>
            初始收款金额
            <input
              className="met-rc-v2-input"
              type="number"
              min={0}
              value={enrollmentForm.initialReceiptAmount ?? 0}
              onChange={e =>
                setEnrollmentForm(f => ({ ...f, initialReceiptAmount: Number(e.target.value) || 0 }))
              }
            />
          </label>
          <label>
            备注
            <input
              className="met-rc-v2-input"
              value={enrollmentForm.note ?? ''}
              onChange={e => setEnrollmentForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
          {selectedCohort ? (
            <p className="met-rc-v2-drawer__note">班期负责人：{selectedCohort.recruitmentOwner}</p>
          ) : null}
        </div>
        {inlineFooter('保存报名', () => {
          if (saving) return;
          if (!enrollmentForm.cohortId) {
            onToast('请选择班期');
            return;
          }
          if (enrollmentForm.mode === 'existing' && !enrollmentForm.leadId) {
            onToast('请选择咨询者');
            return;
          }
          if (enrollmentForm.mode === 'new' && !enrollmentForm.newName?.trim()) {
            onToast('请填写学员姓名');
            return;
          }
          if (!(enrollmentForm.dealPrice > 0)) {
            onToast('成交价格必须大于0');
            return;
          }
          if (!enrollmentForm.paymentMethod) {
            onToast('请选择支付方式');
            return;
          }
          setSaving(true);
          const result = onSaveEnrollment(enrollmentForm);
          if (!result.ok) {
            onToast(result.error || '保存失败');
            setSaving(false);
            return;
          }
          onToast('报名已保存，人数与财务数字已联动更新');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'record-payment') {
    const remaining = activeReceiptEnrollment
      ? Math.max(0, activeReceiptEnrollment.dealPrice - activeReceiptEnrollment.paidAmount)
      : 0;

    return shell(
      '录入收款',
      '登记实际到账，自动更新付款状态与财务数字',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            报名记录
            <select
              className="met-rc-v2-input"
              value={receiptForm.enrollmentId}
              onChange={e => {
                const enrollment = enrollments.find(x => x.id === e.target.value);
                setReceiptForm(f => ({
                  ...f,
                  enrollmentId: e.target.value,
                  paymentMethod: enrollment?.paymentMethod ?? f.paymentMethod,
                  operator: enrollment?.owner ?? f.operator,
                }));
              }}
            >
              <option value="">请选择</option>
              {receiptEligibleEnrollments.map(e => (
                <option key={e.id} value={e.id}>
                  {e.studentName} · {cohortById.get(e.cohortId)?.displayTitle ?? e.cohortId} · 未收{' '}
                  {Math.max(0, e.dealPrice - e.paidAmount).toLocaleString()}元
                </option>
              ))}
            </select>
          </label>
          {activeReceiptEnrollment ? (
            <>
              <p className="met-rc-v2-drawer__note">
                班期：{cohortById.get(activeReceiptEnrollment.cohortId)?.displayTitle ?? activeReceiptEnrollment.cohortId}
              </p>
              <p className="met-rc-v2-drawer__note">
                成交价 {formatMoney(activeReceiptEnrollment.dealPrice)} · 已收{' '}
                {formatMoney(activeReceiptEnrollment.paidAmount)} · 未收 {formatMoney(remaining)}
              </p>
            </>
          ) : null}
          <label>
            本次收款金额 *
            <input
              className="met-rc-v2-input"
              type="number"
              min={0}
              value={receiptForm.amount || ''}
              onChange={e => setReceiptForm(f => ({ ...f, amount: Number(e.target.value) || 0 }))}
            />
          </label>
          <label>
            支付方式 *
            <select
              className="met-rc-v2-input"
              value={receiptForm.paymentMethod}
              onChange={e => setReceiptForm(f => ({ ...f, paymentMethod: e.target.value }))}
            >
              {PAYMENT_CHANNEL_OPTIONS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            到账日期
            <input
              className="met-rc-v2-input"
              type="date"
              value={receiptForm.date}
              onChange={e => setReceiptForm(f => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label>
            经办人
            <StaffSelector
              value={receiptForm.operator}
              options={RECRUITMENT_STAFF_OPTIONS}
              onChange={operator => setReceiptForm(f => ({ ...f, operator }))}
            />
          </label>
          <label>
            备注
            <input
              className="met-rc-v2-input"
              value={receiptForm.note}
              onChange={e => setReceiptForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>
        {inlineFooter('提交收款', () => {
          if (saving) return;
          if (!receiptForm.enrollmentId) {
            onToast('请选择报名记录');
            return;
          }
          if (!(receiptForm.amount > 0)) {
            onToast('请填写收款金额');
            return;
          }
          if (!receiptForm.paymentMethod) {
            onToast('请选择支付方式');
            return;
          }
          setSaving(true);
          const result = onRecordReceipt(receiptForm);
          if (!result.ok) {
            onToast(result.error || '收款失败');
            setSaving(false);
            return;
          }
          onToast('收款已登记');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'refund') {
    return shell(
      '发起退款',
      '冲回实收与人数，需填写退款原因',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            报名记录
            <select
              className="met-rc-v2-input"
              value={refundForm.enrollmentId}
              onChange={e => {
                const enrollment = enrollments.find(x => x.id === e.target.value);
                setRefundForm(f => ({
                  ...f,
                  enrollmentId: e.target.value,
                  amount: enrollment?.paidAmount ?? 0,
                  operator: enrollment?.owner ?? f.operator,
                }));
              }}
            >
              <option value="">请选择</option>
              {refundEligibleEnrollments.map(e => (
                <option key={e.id} value={e.id}>
                  {e.studentName} · 已收 {e.paidAmount.toLocaleString()}元
                </option>
              ))}
            </select>
          </label>
          {activeRefundEnrollment ? (
            <p className="met-rc-v2-drawer__note">
              可退金额：{formatMoney(activeRefundEnrollment.paidAmount)}
            </p>
          ) : null}
          <label>
            退款金额 *
            <input
              className="met-rc-v2-input"
              type="number"
              min={0}
              value={refundForm.amount || ''}
              onChange={e => setRefundForm(f => ({ ...f, amount: Number(e.target.value) || 0 }))}
            />
          </label>
          <label>
            退款原因 *
            <input
              className="met-rc-v2-input"
              value={refundForm.reason}
              onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))}
            />
          </label>
          <label>
            退款日期
            <input
              className="met-rc-v2-input"
              type="date"
              value={refundForm.date}
              onChange={e => setRefundForm(f => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label>
            经办人
            <StaffSelector
              value={refundForm.operator}
              options={RECRUITMENT_STAFF_OPTIONS}
              onChange={operator => setRefundForm(f => ({ ...f, operator }))}
            />
          </label>
          <label className="met-rc-v2-toggle-wrap">
            <input
              type="checkbox"
              checked={refundForm.exitCohort}
              onChange={e => setRefundForm(f => ({ ...f, exitCohort: e.target.checked }))}
            />
            退出班期（冲回实缴人数）
          </label>
        </div>
        {inlineFooter('确认退款', () => {
          if (saving) return;
          if (!refundForm.enrollmentId) {
            onToast('请选择报名记录');
            return;
          }
          if (!(refundForm.amount > 0)) {
            onToast('请填写退款金额');
            return;
          }
          if (!refundForm.reason.trim()) {
            onToast('请填写退款原因');
            return;
          }
          if (
            activeRefundEnrollment &&
            !window.confirm(
              `确认退款 ${activeRefundEnrollment.studentName} ${refundForm.amount.toLocaleString()} 元？将冲回人数、实收与利润。`,
            )
          ) {
            return;
          }
          setSaving(true);
          const result = onRefundEnrollment(refundForm);
          if (!result.ok) {
            onToast(result.error || '退款失败');
            setSaving(false);
            return;
          }
          onToast('退款已完成并冲回财务数字');
          onClose();
        })}
      </>,
    );
  }

  if (drawer.type === 'join-cohort') {
    const single = drawer.enrollmentId
      ? joinReadyEnrollments.find(e => e.id === drawer.enrollmentId)
      : joinConfirmId
        ? joinReadyEnrollments.find(e => e.id === joinConfirmId)
        : null;

    if (single) {
      return shell(
        '确认入班',
        `${single.studentName} · ${cohortById.get(single.cohortId)?.displayTitle ?? single.cohortId}`,
        <>
          <section className="met-rc-v2-drawer__section">
            <p className="met-rc-v2-drawer__note">
              已付清 {formatMoney(single.paidAmount)}，确认后将计入实缴人数并更新学员阶段为「已入班」。
            </p>
          </section>
          {inlineFooter('确认入班', () => {
            const result = onJoinCohort(single.id);
            onToast(result.ok ? `${single.studentName} 已确认入班` : result.error || '入班失败');
            if (result.ok) onClose();
          })}
        </>,
      );
    }

    return shell(
      '确认入班',
      '已付清且尚未入班的学员',
      <>
        {joinReadyEnrollments.length === 0 ? (
          <p className="met-rc-v2-drawer__note">暂无待入班学员</p>
        ) : (
          <section className="met-rc-v2-drawer__section">
            <h3>待入班名单</h3>
            {joinReadyEnrollments.map(e => (
              <div key={e.id} className="met-rc-v2-drawer__row">
                <span>
                  {e.studentName} · {cohortById.get(e.cohortId)?.displayTitle ?? e.cohortId} ·{' '}
                  {formatMoney(e.paidAmount)}
                </span>
                <button
                  type="button"
                  className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                  onClick={() => {
                    const result = onJoinCohort(e.id);
                    onToast(result.ok ? `${e.studentName} 已确认入班` : result.error || '入班失败');
                    if (result.ok) onClose();
                  }}
                >
                  确认入班
                </button>
              </div>
            ))}
          </section>
        )}
        <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
          <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </>,
    );
  }

  if (drawer.type === 'assign-owner') {
    return shell(
      '指定招生负责人',
      '同步到班期与待指定线索',
      <>
        <div className="met-rc-v2-drawer-form">
          <label>
            负责人
            <StaffSelector
              value={assignOwnerName}
              options={RECRUITMENT_STAFF_OPTIONS}
              onChange={setAssignOwnerName}
            />
          </label>
        </div>
        {inlineFooter('保存', () => {
          if (!assignOwnerName.trim() || assignOwnerName === '待指定') {
            onToast('请选择负责人');
            return;
          }
          onAssignOwner(assignOwnerName.trim());
          onToast(`已指定负责人：${assignOwnerName.trim()}`);
          onClose();
        }, { secondaryLabel: '取消' })}
      </>,
    );
  }

  if (drawer.type === 'lead') {
    const lead = leads.find(l => l.id === drawer.id);
    if (!lead) {
      return shell('暂无详情', '', <p>咨询者不存在</p>);
    }
    const leadEnrolls = enrollments.filter(e => e.leadId === lead.id && !e.refunded);

    return shell(
      `咨询跟进 · ${lead.name}`,
      `${lead.course} · ${lead.stage}`,
      <>
        <section className="met-rc-v2-drawer__section">
          <h3>联系方式</h3>
          <div className="met-rc-v2-drawer__row">
            <span>手机</span>
            <span>{lead.phone || '—'}</span>
          </div>
          <div className="met-rc-v2-drawer__row">
            <span>微信</span>
            <span>{lead.wechat || '—'}</span>
          </div>
          <div className="met-rc-v2-drawer__row">
            <span>来源</span>
            <span>{lead.source || '—'}</span>
          </div>
        </section>
        <section className="met-rc-v2-drawer__section">
          <h3>线索信息</h3>
          {[
            ['意向等级', `${lead.intentLevel}意向`],
            ['当前阶段', String(lead.stage)],
            ['学习基础', lead.learningBase || '—'],
            ['学习目的', lead.learningPurpose || '—'],
            ['预算', lead.budgetNote || '—'],
            ['时间条件', lead.timeCondition || '—'],
            ['负责人', lead.owner],
            ['下一步', lead.suggestedAction],
          ].map(([label, value]) => (
            <div key={label} className="met-rc-v2-drawer__row">
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          {lead.anomaly ? <p className="met-rc-v2-field-error">{lead.anomaly}</p> : null}
        </section>
        {(lead.followUps?.length ?? 0) > 0 ? (
          <section className="met-rc-v2-drawer__section">
            <h3>跟进时间线</h3>
            {lead.followUps!.map(fu => (
              <div key={fu.id} className="met-rc-v2-drawer__row">
                <span>
                  {fu.createdAt} · {fu.method}
                  {fu.stage ? ` · ${fu.stage}` : ''}
                </span>
                <span>{fu.result}</span>
              </div>
            ))}
          </section>
        ) : null}
        {lead.interview ? (
          <section className="met-rc-v2-drawer__section">
            <h3>面试</h3>
            <div className="met-rc-v2-drawer__row">
              <span>状态</span>
              <span>{lead.interview.status}</span>
            </div>
            {lead.interview.scheduledAt ? (
              <div className="met-rc-v2-drawer__row">
                <span>安排时间</span>
                <span>{lead.interview.scheduledAt}</span>
              </div>
            ) : null}
            {lead.interview.interviewMode ? (
              <div className="met-rc-v2-drawer__row">
                <span>方式</span>
                <span>{lead.interview.interviewMode}</span>
              </div>
            ) : null}
            {lead.interview.result ? (
              <div className="met-rc-v2-drawer__row">
                <span>结果</span>
                <span>{lead.interview.result}</span>
              </div>
            ) : null}
            {lead.interview.interviewer ? (
              <div className="met-rc-v2-drawer__row">
                <span>面试官</span>
                <span>{lead.interview.interviewer}</span>
              </div>
            ) : null}
            {lead.interview.foundationEval ? (
              <div className="met-rc-v2-drawer__row">
                <span>基础评估</span>
                <span>{lead.interview.foundationEval}</span>
              </div>
            ) : null}
            {lead.interview.note ? (
              <div className="met-rc-v2-drawer__row">
                <span>备注</span>
                <span>{lead.interview.note}</span>
              </div>
            ) : null}
          </section>
        ) : null}
        {leadEnrolls.length > 0 ? (
          <section className="met-rc-v2-drawer__section">
            <h3>报名记录</h3>
            {leadEnrolls.map(e => (
              <div key={e.id} className="met-rc-v2-drawer__row met-rc-v2-drawer__row--stack">
                <span>
                  {cohortById.get(e.cohortId)?.displayTitle ?? e.cohortId} · {e.paymentStatus} ·{' '}
                  {formatMoney(e.paidAmount)} / {formatMoney(e.dealPrice)}
                  {e.joined ? ' · 已入班' : ' · 未入班'}
                </span>
                <span className="met-rc-v2-drawer__row-actions">
                  {e.paidAmount < e.dealPrice ? (
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      onClick={() => navigateDrawer({ type: 'record-payment', enrollmentId: e.id })}
                    >
                      录入收款
                    </button>
                  ) : null}
                  {e.paymentStatus === '已付清' && !e.joined ? (
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      onClick={() => navigateDrawer({ type: 'join-cohort', enrollmentId: e.id })}
                    >
                      确认入班
                    </button>
                  ) : null}
                  {e.paidAmount > 0 ? (
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      onClick={() => navigateDrawer({ type: 'refund', enrollmentId: e.id })}
                    >
                      发起退款
                    </button>
                  ) : null}
                </span>
              </div>
            ))}
          </section>
        ) : null}
        <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
          <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onOpenEnrollment(lead.id)}>
            添加报名
          </button>
          <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </>,
    );
  }

  if (drawer.type === 'content') {
    if (!content) {
      return shell('暂无详情', '', <p>内容不存在</p>);
    }

    return (
      <>
        <button type="button" className="met-v2-drawer-overlay" aria-label="关闭" onClick={onClose} />
        <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog" aria-modal="true">
          <div className="met-v2-drawer-header">
            <div>
              <h2 className="met-v2-drawer-title">{content.title}</h2>
              <p className="met-v2-drawer-subtitle">{content.subtitle}</p>
            </div>
            <button type="button" className="met-v2-drawer-close" aria-label="关闭" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="met-v2-drawer-body">
            {content.sections.map(section => (
              <section key={section.title} className="met-rc-v2-drawer__section">
                <h3>{section.title}</h3>
                {section.rows.map(row => (
                  <div key={`${section.title}-${row.label}-${row.value}`} className="met-rc-v2-drawer__row">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
              </section>
            ))}
            {content.notes?.map(note => (
              <p key={note} className="met-rc-v2-drawer__note">
                {note}
              </p>
            ))}
            <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
              {content.footerActions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className="met-v2-drawer-footer-btn"
                  onClick={() => {
                    if (action.label === '关闭') onClose();
                    else if (action.label === '制定行动') onOpenDrawer('action-plan');
                    else if (action.label === '添加报名') onOpenEnrollment();
                    else if (action.label === '录入收款') navigateDrawer({ type: 'record-payment' });
                    else if (action.label.includes('配置')) {
                      onConfigurePayment();
                      onToast('付款计划已配置（mock）');
                    } else onToast(`${action.label}（待建设）`);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </>
    );
  }

  return shell('暂无详情', '', <p>未知抽屉类型</p>);
};

function defaultInterviewer(): string {
  return TRAINING_STAFF_OPTIONS.find(o => o.value === '教培负责人')?.value ?? '教培负责人';
}

export default ResearchCenterDrawer;
