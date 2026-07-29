import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  computeBreakevenBreakdown,
  defaultEnrollmentDeadline,
  formatCurrency,
  needsStatusConfirm,
  validateCohortPatch,
} from './researchCenterCalculations';
import {
  COHORT_STATUS_OPTIONS,
  COMMISSION_PRESETS,
  RECRUITMENT_STAFF_OPTIONS,
  TRAINING_STAFF_OPTIONS,
  buildAutoCohortTitle,
  findClassroom,
  formatDateDisplay,
  getClassroomOptions,
  getVenueSelectOptions,
} from './researchCenterOptions';
import {
  ResearchDateField,
  ResearchFieldError,
  ResearchInlineEditActions,
  ResearchInlineEditRow,
  ResearchNumberField,
  ResearchSelect,
  ResearchTextField,
  StaffSelector,
  confirmDiscardUnsaved,
} from './researchFormFields';
import type { CohortConfig, ScheduleItem } from './researchCenterV2.viewModel';

type EditableField =
  | 'displayTitle'
  | 'standardPrice'
  | 'startDate'
  | 'endDate'
  | 'enrollmentDeadline'
  | 'venue'
  | 'classroom'
  | 'recruitmentOwner'
  | 'status'
  | 'maxCount'
  | 'lockCount'
  | 'targetCount'
  | 'trainingOwner'
  | 'commissionRate'
  | 'notes';

interface CohortQuickEditorProps {
  cohort: CohortConfig;
  schedules: ScheduleItem[];
  canDirectManage: boolean;
  onSave: (patch: Partial<CohortConfig>) => boolean;
  onAssignOwner: () => void;
  onToast: (msg: string) => void;
  onEditingChange?: (editing: boolean) => void;
}

const FIELD_LABELS: Record<EditableField, string> = {
  displayTitle: '班期名称',
  standardPrice: '班期价格',
  startDate: '开课日期',
  endDate: '结束日期',
  enrollmentDeadline: '招生截止日期',
  venue: '场地',
  classroom: '教室',
  recruitmentOwner: '招生负责人',
  status: '班期状态',
  maxCount: '最大人数',
  lockCount: '建议锁班人数',
  targetCount: '目标人数',
  trainingOwner: '教培负责人',
  commissionRate: '销售提成比例',
  notes: '备注',
};

const PRIMARY_FIELDS: EditableField[] = [
  'displayTitle',
  'standardPrice',
  'startDate',
  'endDate',
  'enrollmentDeadline',
  'venue',
  'classroom',
  'recruitmentOwner',
  'status',
];

const EXPANDED_FIELDS: EditableField[] = [
  'maxCount',
  'lockCount',
  'targetCount',
  'trainingOwner',
  'commissionRate',
  'notes',
];

const CohortQuickEditor: React.FC<CohortQuickEditorProps> = ({
  cohort,
  schedules,
  canDirectManage,
  onSave,
  onAssignOwner,
  onToast,
  onEditingChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState<Record<string, string | number>>({});
  const [commissionMode, setCommissionMode] = useState<string>('preset');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [showBreakevenCalc, setShowBreakevenCalc] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const breakeven = computeBreakevenBreakdown(cohort);
  const venueOptions = useMemo(() => getVenueSelectOptions(), []);

  useEffect(() => {
    onEditingChange?.(editing !== null);
  }, [editing, onEditingChange]);

  const resetEdit = useCallback(() => {
    setEditing(null);
    setDraft({});
    setFieldError(null);
    setCommissionMode('preset');
    setCancelReason('');
  }, []);

  const trySwitchField = useCallback(
    (field: EditableField) => {
      if (editing && editing !== field) {
        if (!confirmDiscardUnsaved()) return false;
        resetEdit();
      }
      return true;
    },
    [editing, resetEdit],
  );

  const startEdit = useCallback(
    (field: EditableField) => {
      if (!canDirectManage || !trySwitchField(field)) return;

      if (field === 'commissionRate') {
        const preset = COMMISSION_PRESETS.find(p => p === cohort.commissionRate);
        setCommissionMode(preset !== undefined ? String(preset) : 'custom');
      }

      const initial: Record<string, string | number> = {
        displayTitle: cohort.displayTitle,
        standardPrice: cohort.standardPrice,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        enrollmentDeadline: cohort.enrollmentDeadline,
        venue: cohort.venue,
        classroom: cohort.classroom,
        recruitmentOwner: cohort.recruitmentOwner,
        status: cohort.status,
        maxCount: cohort.maxCount,
        lockCount: cohort.lockCount,
        targetCount: cohort.targetCount,
        trainingOwner: cohort.trainingOwner,
        commissionRate: Math.round(cohort.commissionRate * 100),
        notes: cohort.notes,
      };

      setDraft({ [field]: initial[field] });
      setFieldError(null);
      setEditing(field);
    },
    [canDirectManage, cohort, trySwitchField],
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;

    let patch: Partial<CohortConfig> = {};
    const value = draft[editing];

    switch (editing) {
      case 'displayTitle':
        patch = { displayTitle: String(value).trim() };
        break;
      case 'standardPrice':
        patch = { standardPrice: Number(value) };
        break;
      case 'startDate': {
        const startDate = String(value);
        patch = {
          startDate,
          displayTitle: cohort.displayTitle === buildAutoCohortTitle(cohort.name, cohort.startDate)
            ? buildAutoCohortTitle(cohort.name, startDate)
            : cohort.displayTitle,
          enrollmentDeadline:
            cohort.enrollmentDeadline === defaultEnrollmentDeadline(cohort.startDate)
              ? defaultEnrollmentDeadline(startDate)
              : cohort.enrollmentDeadline,
        };
        break;
      }
      case 'endDate':
        patch = { endDate: String(value) };
        break;
      case 'enrollmentDeadline':
        patch = { enrollmentDeadline: String(value) };
        break;
      case 'venue': {
        const venue = String(value);
        const validClassrooms = getClassroomOptions(venue).map(o => o.value);
        patch = {
          venue,
          classroom: validClassrooms.includes(cohort.classroom) ? cohort.classroom : '',
        };
        if (!validClassrooms.includes(cohort.classroom)) {
          onToast('场地已切换，请重新选择教室');
        }
        break;
      }
      case 'classroom':
        patch = { classroom: String(value) };
        break;
      case 'recruitmentOwner':
        patch = { recruitmentOwner: String(value) || '待指定' };
        break;
      case 'trainingOwner':
        patch = { trainingOwner: String(value) };
        break;
      case 'status': {
        const nextStatus = String(value);
        const gate = needsStatusConfirm(nextStatus, cohort, schedules);
        if (gate.error) {
          setFieldError(gate.error);
          return;
        }
        if (gate.confirm && !window.confirm(gate.confirm)) return;
        if (gate.reasonRequired) {
          const reason = cancelReason.trim() || window.prompt('班期取消需填写原因：', '') || '';
          if (!reason.trim()) {
            setFieldError('取消班期需填写原因');
            return;
          }
          patch = { status: nextStatus, notes: cohort.notes ? `${cohort.notes}\n取消原因：${reason}` : `取消原因：${reason}` };
          break;
        }
        patch = { status: nextStatus };
        break;
      }
      case 'maxCount':
        patch = { maxCount: Number(value) };
        break;
      case 'lockCount':
        patch = { lockCount: Number(value) };
        break;
      case 'targetCount':
        patch = { targetCount: Number(value) };
        break;
      case 'commissionRate': {
        const rate =
          commissionMode === 'custom'
            ? Number(value) / 100
            : Number(commissionMode);
        patch = { commissionRate: rate };
        break;
      }
      case 'notes':
        patch = { notes: String(value) };
        break;
      default:
        break;
    }

    const errors = validateCohortPatch(patch, cohort, schedules);
    const error = errors[editing];
    if (error) {
      setFieldError(error);
      return;
    }

    const saved = onSave(patch);
    if (!saved) return;
    onToast('已保存');
    resetEdit();
  }, [cancelReason, cohort, commissionMode, draft, editing, onSave, onToast, resetEdit, schedules]);

  const displayValue = (field: EditableField): string => {
    if (field === 'displayTitle') return cohort.displayTitle;
    if (field === 'standardPrice') return `¥${cohort.standardPrice.toLocaleString()}`;
    if (field === 'startDate' || field === 'endDate' || field === 'enrollmentDeadline') {
      return formatDateDisplay(cohort[field]);
    }
    if (field === 'commissionRate') return `${Math.round(cohort.commissionRate * 100)}%`;
    if (['maxCount', 'lockCount', 'targetCount'].includes(field)) {
      return `${cohort[field as 'maxCount' | 'lockCount' | 'targetCount']}人`;
    }
    const v = cohort[field as keyof CohortConfig];
    return String(v ?? '—');
  };

  const renderEditorControl = (field: EditableField) => {
    const value = draft[field];

    switch (field) {
      case 'displayTitle':
        return <ResearchTextField value={String(value ?? '')} onChange={v => setDraft(p => ({ ...p, displayTitle: v }))} />;
      case 'standardPrice':
        return (
          <ResearchNumberField
            value={value === undefined ? '' : Number(value)}
            onChange={v => setDraft(p => ({ ...p, standardPrice: v === '' ? '' : v }))}
            min={0}
            prefix="¥"
          />
        );
      case 'startDate':
        return <ResearchDateField value={String(value ?? '')} onChange={v => setDraft(p => ({ ...p, startDate: v }))} />;
      case 'endDate':
        return (
          <ResearchDateField
            value={String(value ?? '')}
            min={cohort.startDate}
            onChange={v => setDraft(p => ({ ...p, endDate: v }))}
          />
        );
      case 'enrollmentDeadline':
        return (
          <ResearchDateField
            value={String(value ?? '')}
            max={cohort.startDate}
            onChange={v => setDraft(p => ({ ...p, enrollmentDeadline: v }))}
          />
        );
      case 'venue':
        return (
          <ResearchSelect
            value={String(value ?? '')}
            options={venueOptions}
            onChange={v => setDraft(p => ({ ...p, venue: v, classroom: '' }))}
            placeholder="请选择场地"
          />
        );
      case 'classroom':
        return (
          <ResearchSelect
            value={String(value ?? '')}
            options={getClassroomOptions(String(draft.venue ?? cohort.venue))}
            onChange={v => setDraft(p => ({ ...p, classroom: v }))}
            placeholder="请选择教室"
            disabled={!String(draft.venue ?? cohort.venue)}
          />
        );
      case 'recruitmentOwner':
        return (
          <StaffSelector
            value={String(value ?? '')}
            options={RECRUITMENT_STAFF_OPTIONS}
            onChange={v => setDraft(p => ({ ...p, recruitmentOwner: v || '待指定' }))}
          />
        );
      case 'trainingOwner':
        return (
          <StaffSelector
            value={String(value ?? '')}
            options={TRAINING_STAFF_OPTIONS}
            onChange={v => setDraft(p => ({ ...p, trainingOwner: v }))}
            placeholder="请选择教培负责人"
          />
        );
      case 'status':
        return (
          <div className="met-rc-v2-status-edit">
            <ResearchSelect
              value={String(value ?? '')}
              options={COHORT_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
              onChange={v => setDraft(p => ({ ...p, status: v }))}
            />
            {String(value) === '已取消' && cohort.paidCount > 0 ? (
              <ResearchTextField
                value={cancelReason}
                onChange={setCancelReason}
                placeholder="请填写取消原因"
              />
            ) : null}
          </div>
        );
      case 'maxCount':
      case 'lockCount':
      case 'targetCount': {
        const classroom = findClassroom(cohort.venue, cohort.classroom);
        const maxCap = classroom?.maxCapacity ?? 99;
        return (
          <ResearchNumberField
            value={value === undefined ? '' : Number(value)}
            onChange={v => setDraft(p => ({ ...p, [field]: v === '' ? '' : v }))}
            min={field === 'lockCount' ? cohort.breakevenCount : 1}
            max={field === 'targetCount' ? cohort.maxCount : field === 'lockCount' ? cohort.targetCount : maxCap}
          />
        );
      }
      case 'commissionRate':
        return (
          <div className="met-rc-v2-commission-edit">
            <ResearchSelect
              value={commissionMode}
              options={[
                ...COMMISSION_PRESETS.map(p => ({ value: String(p), label: `${Math.round(p * 100)}%` })),
                { value: 'custom', label: '自定义' },
              ]}
              onChange={v => setCommissionMode(v)}
            />
            {commissionMode === 'custom' ? (
              <ResearchNumberField
                value={value === undefined ? '' : Number(value)}
                onChange={v => setDraft(p => ({ ...p, commissionRate: v === '' ? '' : v }))}
                min={0}
                max={100}
                suffix="%"
              />
            ) : null}
          </div>
        );
      case 'notes':
        return <ResearchTextField value={String(value ?? '')} onChange={v => setDraft(p => ({ ...p, notes: v }))} />;
      default:
        return null;
    }
  };

  const renderField = (field: EditableField) => (
    <div key={field} className="met-rc-v2-cohort-editor__field">
      <span className="met-rc-v2-cohort-editor__label">{FIELD_LABELS[field]}</span>
      {editing === field ? (
        <ResearchInlineEditRow
          error={fieldError}
          actions={
            <ResearchInlineEditActions
              onSave={commitEdit}
              onCancel={() => {
                resetEdit();
              }}
            />
          }
        >
          {renderEditorControl(field)}
        </ResearchInlineEditRow>
      ) : (
        <div className="met-rc-v2-cohort-editor__value-row">
          <span>{displayValue(field)}</span>
          {canDirectManage ? (
            field === 'recruitmentOwner' && cohort.recruitmentOwner === '待指定' ? (
              <button type="button" className="met-rc-v2-cohort-editor__assign" onClick={onAssignOwner}>
                指定
              </button>
            ) : (
              <button
                type="button"
                className="met-rc-v2-cohort-editor__edit-trigger"
                onClick={() => startEdit(field)}
                aria-label={`编辑${FIELD_LABELS[field]}`}
              >
                <Pencil size={12} aria-hidden />
                <span>编辑</span>
              </button>
            )
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div className="met-rc-v2-cohort-editor">
      <h3 className="met-rc-v2-cohort-editor__title">班期设置</h3>
      <div className="met-rc-v2-cohort-editor__fields">
        {PRIMARY_FIELDS.map(renderField)}
        {expanded ? (
          <>
            <div className="met-rc-v2-cohort-editor__field met-rc-v2-cohort-editor__field--readonly">
              <span className="met-rc-v2-cohort-editor__label">直接保本人数</span>
              <div className="met-rc-v2-cohort-editor__value-row">
                <span>{cohort.breakevenCount}人</span>
                <span className="met-rc-v2-cohort-editor__system-tag">系统计算</span>
                <button
                  type="button"
                  className="met-rc-v2-cohort-editor__calc-link"
                  onClick={() => setShowBreakevenCalc(v => !v)}
                >
                  查看计算
                </button>
              </div>
            </div>
            {EXPANDED_FIELDS.map(renderField)}
          </>
        ) : null}
      </div>
      {showBreakevenCalc ? (
        <div className="met-rc-v2-breakeven-calc" role="dialog" aria-label="直接保本人数计算依据">
          <p className="met-rc-v2-breakeven-calc__title">直接保本人数计算依据</p>
          <dl className="met-rc-v2-breakeven-calc__list">
            <div><dt>班期固定直接成本</dt><dd>{formatCurrency(breakeven.fixedDirectCost)}</dd></div>
            <div><dt>班期基准价格</dt><dd>{formatCurrency(breakeven.unitPrice)}</dd></div>
            <div><dt>销售提成比例</dt><dd>{Math.round(breakeven.commissionRate * 100)}%</dd></div>
            <div><dt>单人销售提成</dt><dd>{formatCurrency(breakeven.commissionPerStudent)}</dd></div>
            <div><dt>导师直接成本</dt><dd>{formatCurrency(breakeven.mentorDirectCost)}</dd></div>
            <div><dt>住宿成本</dt><dd>{formatCurrency(breakeven.accommodationCost)}</dd></div>
            <div><dt>单人变动成本</dt><dd>{formatCurrency(breakeven.variableCostPerStudent)}</dd></div>
            <div><dt>单人净贡献</dt><dd>{formatCurrency(breakeven.netContributionPerStudent)}</dd></div>
            <div><dt>直接保本人数</dt><dd>向上取整（{formatCurrency(breakeven.fixedDirectCost)} ÷ {formatCurrency(breakeven.netContributionPerStudent)}）= {cohort.breakevenCount}人</dd></div>
          </dl>
          <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => setShowBreakevenCalc(false)}>
            关闭
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="met-rc-v2-cohort-editor__expand"
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '收起更多设置' : '展开更多设置'}
      </button>
    </div>
  );
};

export default CohortQuickEditor;
