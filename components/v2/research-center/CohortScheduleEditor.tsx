import React, { useCallback, useMemo, useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import {
  computeScheduleSummary,
  getVisibleScheduleItems,
  validateScheduleDraft,
} from './researchCenterCalculations';
import {
  PAY_METHOD_OPTIONS,
  RYT200_COURSE_TEMPLATES,
  defaultCalcPayForSession,
  formatDateShort,
  getClassroomOptions,
  getTeacherPay,
  getTeacherSelectOptions,
  getVenueSelectOptions,
} from './researchCenterOptions';
import {
  ResearchDateField,
  ResearchFieldError,
  ResearchNumberField,
  ResearchSelect,
  ResearchTextField,
  ResearchTimeField,
  ResearchToggle,
  StaffSelector,
} from './researchFormFields';
import type { CohortConfig, ScheduleDraft, ScheduleItem, ScheduleSessionType } from './researchCenterV2.viewModel';

const SESSION_TYPES: ScheduleSessionType[] = ['正常教学', '体能训练', '实践', '自习', '考试', '结业'];
const VISIBLE_COUNT = 3;

function createEmptyDraft(cohort: CohortConfig): ScheduleDraft {
  return {
    dateIso: cohort.startDate,
    date: formatDateShort(cohort.startDate),
    startTime: '09:00',
    endTime: '12:00',
    content: '',
    contentTemplateId: '',
    customContent: '',
    teacher: '',
    venue: cohort.venue,
    classroom: cohort.classroom,
    sessionType: '正常教学',
    calcPay: true,
    payMethod: '按天',
    payAmount: 0,
    customPayReason: '',
    note: '',
    cohortId: cohort.id,
    status: '待确认',
  };
}

interface CohortScheduleEditorProps {
  cohort: CohortConfig;
  schedules: ScheduleItem[];
  canDirectManage: boolean;
  onAdd: (draft: ScheduleDraft) => boolean;
  onUpdate: (id: string, patch: Partial<ScheduleItem>) => boolean;
  onDelete: (id: string) => void;
  onToast: (msg: string) => void;
  onOpenFullSchedule?: () => void;
  onChangeTeacher?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

const CohortScheduleEditor: React.FC<CohortScheduleEditorProps> = ({
  cohort,
  schedules,
  canDirectManage,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  onOpenFullSchedule,
  onChangeTeacher,
  onReschedule,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showFullTimetable, setShowFullTimetable] = useState(false);
  const [headMoreOpen, setHeadMoreOpen] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft>(() => createEmptyDraft(cohort));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ScheduleItem>>({});
  const [menuId, setMenuId] = useState<string | null>(null);

  const summary = useMemo(() => computeScheduleSummary(cohort, schedules), [cohort, schedules]);
  const visible = useMemo(
    () => getVisibleScheduleItems(schedules, showAll, undefined, VISIBLE_COUNT),
    [schedules, showAll],
  );

  const groupedTimetable = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    [...schedules]
      .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`))
      .forEach(item => {
        const list = map.get(item.dateIso) ?? [];
        list.push(item);
        map.set(item.dateIso, list);
      });
    return [...map.entries()];
  }, [schedules]);

  const applyTeacherDefaults = useCallback((teacher: string, sessionType: ScheduleSessionType, current: ScheduleDraft) => {
    const config = getTeacherPay(teacher);
    const calcPay = defaultCalcPayForSession(sessionType);
    if (!config) {
      return { ...current, teacher, calcPay, payAmount: calcPay ? current.payAmount : 0 };
    }
    return {
      ...current,
      teacher,
      calcPay,
      payMethod: config.payMethod,
      payAmount: calcPay ? config.defaultAmount : 0,
      customPayReason: '',
    };
  }, []);

  const handleSessionTypeChange = useCallback((type: ScheduleSessionType) => {
    setDraft(prev => {
      const calcPay = defaultCalcPayForSession(type);
      return { ...prev, sessionType: type, calcPay, payAmount: calcPay ? prev.payAmount : 0 };
    });
  }, []);

  const handleContentTemplateChange = useCallback((template: string) => {
    setDraft(prev => ({
      ...prev,
      contentTemplateId: template,
      content: template === '自定义课程' ? prev.customContent ?? '' : template,
      customContent: template === '自定义课程' ? prev.customContent ?? '' : '',
    }));
  }, []);

  const saveNew = useCallback(() => {
    const content =
      draft.contentTemplateId === '自定义课程'
        ? (draft.customContent ?? '').trim()
        : draft.content.trim();
    const payload: ScheduleDraft = {
      ...draft,
      content,
      date: formatDateShort(draft.dateIso),
    };
    const errors = validateScheduleDraft(payload, cohort);
    if (Object.keys(errors).length) {
      setFormErrors(errors as Record<string, string>);
      return;
    }
    const saved = onAdd(payload);
    if (!saved) return;
    setDraft(createEmptyDraft(cohort));
    setFormErrors({});
    setShowForm(false);
    onToast('已保存');
  }, [cohort, draft, onAdd, onToast]);

  const startEdit = useCallback((item: ScheduleItem) => {
    setEditingId(item.id);
    setEditDraft({ ...item });
    setMenuId(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const errors = validateScheduleDraft(
      {
        dateIso: editDraft.dateIso ?? '',
        startTime: editDraft.startTime ?? '',
        endTime: editDraft.endTime ?? '',
        content: editDraft.content ?? '',
        teacher: editDraft.teacher ?? '',
        venue: editDraft.venue ?? '',
        classroom: editDraft.classroom ?? '',
        calcPay: editDraft.calcPay ?? false,
        payAmount: editDraft.payAmount ?? 0,
        customPayReason: editDraft.customPayReason,
      },
      cohort,
    );
    if (Object.keys(errors).length) {
      onToast(Object.values(errors)[0] ?? '请检查课次信息');
      return;
    }
    const saved = onUpdate(editingId, {
      ...editDraft,
      date: formatDateShort(editDraft.dateIso ?? ''),
    });
    if (!saved) return;
    setEditingId(null);
    onToast('已保存');
  }, [cohort, editDraft, editingId, onToast, onUpdate]);

  const confirmDelete = useCallback(
    (id: string) => {
      if (window.confirm('确认删除这个课次？')) {
        onDelete(id);
        onToast('课次已删除');
        setMenuId(null);
      }
    },
    [onDelete, onToast],
  );

  const payLabel = (item: ScheduleItem) => {
    if (!item.calcPay) return '不计课酬';
    const suffix = item.customPayReason ? '（特殊课酬）' : '';
    return `${item.payAmount.toLocaleString()}元${suffix}`;
  };

  const renderCourseForm = (
    values: ScheduleDraft | Partial<ScheduleItem>,
    onChange: (patch: Partial<ScheduleDraft>) => void,
    errors: Record<string, string>,
    isEdit = false,
  ) => {
    const contentTemplate = values.contentTemplateId ?? values.content ?? '';
    const isCustom = contentTemplate === '自定义课程';

    return (
      <div className="met-rc-v2-schedule__form-grid">
        <label>
          日期
          <ResearchDateField
            value={values.dateIso ?? ''}
            min={cohort.startDate}
            max={cohort.endDate}
            onChange={v => onChange({ dateIso: v, date: formatDateShort(v) })}
          />
          <ResearchFieldError message={errors.dateIso} />
        </label>
        <label>
          开始时间
          <ResearchTimeField value={values.startTime ?? ''} onChange={v => onChange({ startTime: v })} />
          <ResearchFieldError message={errors.startTime} />
        </label>
        <label>
          结束时间
          <ResearchTimeField value={values.endTime ?? ''} onChange={v => onChange({ endTime: v })} />
          <ResearchFieldError message={errors.endTime} />
        </label>
        <label>
          课程内容
          <ResearchSelect
            value={isCustom ? '自定义课程' : String(contentTemplate)}
            options={RYT200_COURSE_TEMPLATES.map(t => ({ value: t, label: t }))}
            onChange={v => {
              if (isEdit) {
                onChange({ contentTemplateId: v, content: v === '自定义课程' ? values.content ?? '' : v });
              } else {
                handleContentTemplateChange(v);
              }
            }}
            placeholder="请选择课程"
          />
          {isCustom ? (
            <ResearchTextField
              value={String((values as ScheduleDraft).customContent ?? values.content ?? '')}
              onChange={v => onChange({ customContent: v, content: v, contentTemplateId: '自定义课程' })}
              placeholder="请输入自定义课程名称"
            />
          ) : null}
          <ResearchFieldError message={errors.content} />
        </label>
        <label>
          导师
          <StaffSelector
            value={values.teacher ?? ''}
            options={getTeacherSelectOptions()}
            onChange={v => {
              if (isEdit) {
                const config = getTeacherPay(v);
                onChange({
                  teacher: v,
                  calcPay: defaultCalcPayForSession((values.sessionType ?? '正常教学') as ScheduleSessionType),
                  payMethod: config?.payMethod,
                  payAmount: config?.defaultAmount ?? 0,
                });
              } else {
                setDraft(prev => applyTeacherDefaults(v, prev.sessionType, prev));
              }
            }}
            placeholder="请选择导师"
          />
          <ResearchFieldError message={errors.teacher} />
        </label>
        <label>
          场地
          <ResearchSelect
            value={values.venue ?? ''}
            options={getVenueSelectOptions()}
            onChange={v => onChange({ venue: v, classroom: v === cohort.venue ? cohort.classroom : '' })}
          />
          <ResearchFieldError message={errors.venue} />
        </label>
        <label>
          教室
          <ResearchSelect
            value={values.classroom ?? ''}
            options={getClassroomOptions(values.venue ?? cohort.venue)}
            onChange={v => onChange({ classroom: v })}
            placeholder="请选择教室"
          />
          <ResearchFieldError message={errors.classroom} />
        </label>
        <label>
          课次类型
          <ResearchSelect
            value={values.sessionType ?? '正常教学'}
            options={SESSION_TYPES.map(t => ({ value: t, label: t }))}
            onChange={v => {
              const type = v as ScheduleSessionType;
              if (isEdit) {
                onChange({ sessionType: type, calcPay: defaultCalcPayForSession(type) });
              } else {
                handleSessionTypeChange(type);
              }
            }}
          />
        </label>
        <label className="met-rc-v2-schedule__toggle-field">
          是否计算课酬
          <ResearchToggle
            checked={values.calcPay ?? false}
            onChange={checked => onChange({ calcPay: checked, payAmount: checked ? values.payAmount ?? 0 : 0 })}
          />
        </label>
        {values.calcPay ? (
          <>
            <label>
              课酬方式
              <ResearchSelect
                value={values.payMethod ?? '按天'}
                options={PAY_METHOD_OPTIONS.map(m => ({ value: m, label: m }))}
                onChange={v => onChange({ payMethod: v as ScheduleDraft['payMethod'] })}
              />
            </label>
            <label>
              课酬金额
              <ResearchNumberField
                value={values.payAmount ?? 0}
                onChange={v => {
                  const amount = v === '' ? 0 : v;
                  const config = getTeacherPay(values.teacher ?? '');
                  const isSpecial = config ? amount !== config.defaultAmount : false;
                  onChange({
                    payAmount: amount,
                    customPayReason: isSpecial ? values.customPayReason ?? '' : '',
                  });
                }}
                min={0}
                suffix="元"
              />
              <ResearchFieldError message={errors.payAmount} />
            </label>
            {(() => {
              const config = getTeacherPay(values.teacher ?? '');
              const isSpecial = values.calcPay && config && (values.payAmount ?? 0) !== config.defaultAmount;
              return isSpecial ? (
                <label>
                  调整原因
                  <ResearchTextField
                    value={values.customPayReason ?? ''}
                    onChange={v => onChange({ customPayReason: v })}
                    placeholder="本课次特殊课酬需填写原因"
                  />
                  <ResearchFieldError message={errors.customPayReason} />
                </label>
              ) : null;
            })()}
          </>
        ) : null}
        <label>
          备注
          <ResearchTextField value={values.note ?? ''} onChange={v => onChange({ note: v })} />
        </label>
      </div>
    );
  };

  return (
    <section className="met-rc-v2-schedule">
      <div className="met-rc-v2-schedule__head">
        <div>
          <h3 className="met-rc-v2-schedule__title">本期课程表</h3>
          <p className="met-rc-v2-schedule__subtitle">
            计划教学{summary.plannedDays}天｜已排 {summary.scheduledDays} 个教学日｜共 {summary.sessionCount} 个课次｜导师课酬合计 {summary.mentorCostTotal.toLocaleString()} 元｜还有 {summary.pendingDays} 个教学日待安排
          </p>
        </div>
        <div className="met-rc-v2-schedule__head-actions">
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
            onClick={() => {
              setDraft(createEmptyDraft(cohort));
              setFormErrors({});
              setShowForm(v => !v);
            }}
          >
            添加课程
          </button>
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
            onClick={() => (onOpenFullSchedule ? onOpenFullSchedule() : setShowFullTimetable(true))}
          >
            查看完整课表
          </button>
          <div className="met-rc-v2-more">
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              aria-expanded={headMoreOpen}
              onClick={() => setHeadMoreOpen(v => !v)}
            >
              更多
            </button>
            {headMoreOpen ? (
              <div className="met-rc-v2-more__menu">
                <button
                  type="button"
                  onClick={() => {
                    onToast('已生成26天课表草稿（待确认），请查看完整课表后发布');
                    setHeadMoreOpen(false);
                  }}
                >
                  批量生成26天课表
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {!visible.hasUpcoming ? (
        <p className="met-rc-v2-schedule__notice">当前暂无后续课程，以下为最近已排课次。</p>
      ) : null}

      {showForm ? (
        <div className="met-rc-v2-schedule__form">
          {renderCourseForm(draft, patch => setDraft(prev => ({ ...prev, ...patch })), formErrors)}
          <div className="met-rc-v2-schedule__form-actions">
            <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={saveNew}>保存</button>
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              onClick={() => {
                setShowForm(false);
                setFormErrors({});
              }}
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="met-rc-v2-schedule__list">
        {visible.items.map(item =>
          editingId === item.id ? (
            <div key={item.id} className="met-rc-v2-schedule__item is-editing">
              {renderCourseForm(
                editDraft,
                patch => setEditDraft(prev => ({ ...prev, ...patch })),
                {},
                true,
              )}
              <div className="met-rc-v2-schedule__form-actions">
                <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={saveEdit}>保存</button>
                <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => setEditingId(null)}>取消</button>
              </div>
            </div>
          ) : (
            <article key={item.id} className="met-rc-v2-schedule__item met-rc-v2-schedule__item--compact">
              <div className="met-rc-v2-schedule__item-main">
                <div className="met-rc-v2-schedule__item-line1">
                  {item.date} {item.startTime}—{item.endTime}
                </div>
                <div className="met-rc-v2-schedule__item-line2">
                  {item.content} · {item.teacher} · {item.classroom} · {payLabel(item)}
                </div>
              </div>
              {canDirectManage ? (
                <div className="met-rc-v2-schedule__item-actions">
                  <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => startEdit(item)}>编辑</button>
                  <div className="met-rc-v2-row-more">
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      onClick={() => setMenuId(prev => (prev === item.id ? null : item.id))}
                      aria-label="更多操作"
                    >
                      <MoreHorizontal size={14} aria-hidden />
                    </button>
                    {menuId === item.id ? (
                      <div className="met-rc-v2-row-more__menu">
                        <button type="button" onClick={() => { (onChangeTeacher ? onChangeTeacher(item.id) : onToast('更换导师（待建设）')); setMenuId(null); }}>更换导师</button>
                        <button type="button" onClick={() => { (onReschedule ? onReschedule(item.id) : onToast('改期（待建设）')); setMenuId(null); }}>改期</button>
                        <button type="button" className="is-danger" onClick={() => confirmDelete(item.id)}>删除</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          ),
        )}
      </div>

      {!showAll && visible.hiddenCount > 0 ? (
        <button type="button" className="met-rc-v2-schedule__more-link" onClick={() => setShowAll(true)}>
          还有{visible.hiddenCount}个课次，查看完整课表
        </button>
      ) : null}
      {showAll && visible.hiddenCount > 0 ? (
        <button type="button" className="met-rc-v2-schedule__more-link" onClick={() => setShowAll(false)}>
          收起课表
        </button>
      ) : null}

      {showFullTimetable ? (
        <div className="met-rc-v2-timetable-drawer" role="dialog" aria-label="完整课表">
          <div className="met-rc-v2-timetable-drawer__panel">
            <header className="met-rc-v2-timetable-drawer__head">
              <div>
                <h4>{cohort.displayTitle} · 课程表</h4>
                <p>按教学日分组展示本期全部课次</p>
              </div>
              <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => setShowFullTimetable(false)}>
                <X size={14} aria-hidden />
              </button>
            </header>
            <div className="met-rc-v2-timetable-drawer__body">
              {groupedTimetable.map(([dateIso, items]) => (
                <section key={dateIso} className="met-rc-v2-timetable-day">
                  <h5>{formatDateShort(dateIso)}</h5>
                  <ul>
                    {items.map(item => (
                      <li key={item.id}>
                        <span>{item.startTime}—{item.endTime}</span>
                        <span>{item.content}</span>
                        <span>{item.teacher}</span>
                        <span>{item.classroom}</span>
                        <span>{payLabel(item)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CohortScheduleEditor;
