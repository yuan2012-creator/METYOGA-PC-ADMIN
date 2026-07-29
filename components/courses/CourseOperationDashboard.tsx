import React, { useCallback, useMemo, useState } from 'react';
import {
  applySessionFormPatch,
  buildCourseOperationSnapshot,
  buildDraftSessionFromTemplate,
  buildWeekDayHeaders,
  dateIsoForDayIndex,
  getWeekRangeLabel,
  isLocalDraftSession,
  resolveSessionDetail,
  type CourseTemplateItem,
  type ScheduleSessionItem,
} from './courseOperationViewModel';
import CourseMetricCard from './CourseMetricCard';
import CourseLibraryPanel from './CourseLibraryPanel';
import WeeklyScheduleBoard from './WeeklyScheduleBoard';
import CourseOptimizationPanel from './CourseOptimizationPanel';
import CourseSessionDetailDrawer, {
  type CourseDrawerViewMode,
} from './CourseSessionDetailDrawer';
import SchedulePublishModal from './SchedulePublishModal';
import CourseLibraryModal from './CourseLibraryModal';
import CourseTemplateFormModal, {
  type CourseTemplateFormValues,
} from './CourseTemplateFormModal';
import type { ScheduleFormDraft } from './CourseScheduleFormDrawer';
import type { SessionMenuAction } from './CourseSessionActionMenu';

const headerGhostBtn = 'met-today-header-btn';

const demoValidationHints = [
  '老师时间冲突：周晴 18:00 已有排课',
  '教室冲突：B厅 该时段已被占用',
  '老师资质不匹配：当前老师等级低于课程要求',
  '容量超过教室限制：B厅 最多 16 人',
  '不符合门店营业时间：该时段门店已打烊',
];

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'bookable', label: '可预约' },
  { value: 'full', label: '已满员' },
  { value: 'exception', label: '异常待处理' },
];

const emptyFormDraft = (weekOffset: number): ScheduleFormDraft => ({
  template: '',
  date: dateIsoForDayIndex(0, weekOffset),
  time: '18:00',
  teacher: '',
  room: '',
  capacity: '18',
  stores: '城西旗舰店',
  bookingDeadline: '开课前 2 小时',
  cancelRule: '开课前 4 小时可免费取消',
  isPublic: true,
  note: '',
});

const formDraftFromSession = (session: ScheduleSessionItem, weekOffset: number): ScheduleFormDraft => ({
  template: session.name,
  date: dateIsoForDayIndex(session.dayIndex, weekOffset),
  time: session.timeSlot,
  teacher: session.teacher === '待指定' ? '' : session.teacher,
  room: session.room === '待指定' ? '' : session.room,
  capacity: String(session.capacity),
  stores: '城西旗舰店',
  bookingDeadline: '开课前 2 小时',
  cancelRule: '开课前 4 小时可免费取消',
  isPublic: true,
  note: '',
});

const CourseOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildCourseOperationSnapshot(), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [localTemplates, setLocalTemplates] = useState<CourseTemplateItem[]>(() =>
    snapshot.templates.map(t => ({ ...t, updatedAt: t.updatedAt ?? '2026-05-10' })),
  );
  const [localSessions, setLocalSessions] = useState<ScheduleSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<CourseDrawerViewMode>('detail');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formDraft, setFormDraft] = useState<ScheduleFormDraft>(emptyFormDraft(0));
  const [publishOpen, setPublishOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState<'create' | 'edit'>('create');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const weekDayHeaders = useMemo(() => buildWeekDayHeaders(weekOffset), [weekOffset]);
  const weekRangeLabel = useMemo(() => getWeekRangeLabel(weekOffset), [weekOffset]);

  const visibleSessions = useMemo(() => {
    const demo = weekOffset === 0 ? snapshot.sessions : [];
    const local = localSessions.filter(s => (s.weekOffset ?? 0) === weekOffset);
    return [...demo, ...local];
  }, [snapshot.sessions, localSessions, weekOffset]);

  const sessionDetail = useMemo(() => {
    if (!selectedSessionId) return null;
    return resolveSessionDetail(selectedSessionId, visibleSessions);
  }, [selectedSessionId, visibleSessions]);

  const editingTemplate = useMemo(
    () => localTemplates.find(t => t.id === editingTemplateId) ?? null,
    [localTemplates, editingTemplateId],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  };

  const openDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setDrawerView('detail');
    setDrawerOpen(true);
  };

  const openEditForm = (draft: ScheduleFormDraft, mode: 'create' | 'edit', sessionId?: string) => {
    if (sessionId) setSelectedSessionId(sessionId);
    setFormDraft(draft);
    setFormMode(mode);
    setDrawerView('edit');
    setDrawerOpen(true);
  };

  const handleDropTemplate = useCallback(
    (dayIndex: number, timeSlot: string, templateId: string) => {
      const template = localTemplates.find(t => t.id === templateId);
      if (!template?.schedulable) {
        showToast('该课程模板不可排课');
        return;
      }
      const id = `local-${Date.now()}`;
      const session = buildDraftSessionFromTemplate(template, dayIndex, timeSlot, id, weekOffset);
      setLocalSessions(prev => [...prev, session]);
      setSelectedSessionId(id);
      openEditForm(formDraftFromSession(session, weekOffset), 'create', id);
      showToast('已生成排课草稿，请完善老师与教室');
    },
    [localTemplates, weekOffset],
  );

  const handleSessionAction = (sessionId: string, action: SessionMenuAction) => {
    const session = visibleSessions.find(s => s.id === sessionId);
    if (!session) return;

    if (action === 'detail') {
      openDetail(sessionId);
      return;
    }
    if (action === 'edit') {
      openEditForm(formDraftFromSession(session, weekOffset), 'edit', sessionId);
      return;
    }
    if (action === 'delete') {
      if (!isLocalDraftSession(sessionId)) {
        showToast('仅本地草稿可删除');
        return;
      }
      setDeleteConfirmId(sessionId);
      return;
    }
    if (action === 'reschedule') {
      setSelectedSessionId(sessionId);
      setRescheduleOpen(true);
      return;
    }
    if (action === 'cancel') {
      setSelectedSessionId(sessionId);
      setCancelOpen(true);
    }
  };

  const handleDrawerAction = (action: string) => {
    if (!selectedSessionId) return;
    handleSessionAction(selectedSessionId, action as SessionMenuAction);
  };

  const handleSaveDraft = () => {
    if (!selectedSessionId || !isLocalDraftSession(selectedSessionId)) {
      showToast('仅本地草稿可在此保存');
      setDrawerView('detail');
      return;
    }
    setLocalSessions(prev =>
      prev.map(s =>
        s.id === selectedSessionId
          ? applySessionFormPatch(s, formDraft, localTemplates, weekOffset)
          : s,
      ),
    );
    setDrawerView('detail');
    showToast('排课草稿已保存，日历已更新');
  };

  const confirmDeleteDraft = () => {
    if (!deleteConfirmId) return;
    setLocalSessions(prev => prev.filter(s => s.id !== deleteConfirmId));
    if (selectedSessionId === deleteConfirmId) {
      setDrawerOpen(false);
      setSelectedSessionId(null);
    }
    setDeleteConfirmId(null);
    showToast('已删除排课草稿');
  };

  const openTemplateForm = (mode: 'create' | 'edit', templateId?: string) => {
    setTemplateFormMode(mode);
    setEditingTemplateId(templateId ?? null);
    setTemplateFormOpen(true);
  };

  const handleSaveTemplate = (values: CourseTemplateFormValues) => {
    if (templateFormMode === 'edit' && editingTemplateId) {
      setLocalTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplateId
            ? {
                ...t,
                name: values.name,
                type: values.type,
                durationMin: Number(values.durationMin) || 60,
                defaultCapacity: Number(values.defaultCapacity) || 1,
                defaultPoints: Number(values.defaultPoints) || 0,
                stores: values.stores,
                teacherLevel: values.teacherLevel,
                schedulable: values.schedulable,
                description: values.description,
                remark: values.remark,
                updatedAt: '2026-05-16',
              }
            : t,
        ),
      );
      showToast('课程模板已更新（本地）');
    } else {
      const id = `tpl-local-${Date.now()}`;
      setLocalTemplates(prev => [
        ...prev,
        {
          id,
          name: values.name,
          type: values.type,
          durationMin: Number(values.durationMin) || 60,
          defaultCapacity: Number(values.defaultCapacity) || 1,
          defaultPoints: Number(values.defaultPoints) || 0,
          stores: values.stores,
          teacherLevel: values.teacherLevel,
          schedulable: values.schedulable,
          description: values.description,
          remark: values.remark,
          updatedAt: '2026-05-16',
        },
      ]);
      showToast('已新增本地课程模板');
    }
    setTemplateFormOpen(false);
  };

  const selectedIsLocalDraft =
    selectedSessionId != null && isLocalDraftSession(selectedSessionId);

  return (
    <div
      className="met-today-page met-course-page flex h-full min-h-0 w-full flex-col overflow-hidden animate-fadeIn"
      style={{ backgroundColor: 'var(--met-bg-page)' }}
    >
      <header className="met-today-header shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="met-today-header__title-area min-w-0">
            <h1>课程运营</h1>
            <p>管理课程供给、排课发布、预约效率与耗课结构</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 lg:gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] p-0.5">
              <button
                type="button"
                onClick={() => setWeekOffset(o => o - 1)}
                className="rounded-md px-2.5 py-1.5 text-xs text-[#565D56] hover:bg-white"
              >
                上一周
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  weekOffset === 0 ? 'bg-[#2C2F32] text-white' : 'text-[#565D56] hover:bg-white'
                }`}
              >
                本周
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(o => o + 1)}
                className="rounded-md px-2.5 py-1.5 text-xs text-[#565D56] hover:bg-white"
              >
                下一周
              </button>
            </div>
            <span className="hidden text-[11px] tabular-nums text-[#8A908A] sm:inline">{weekRangeLabel}</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#E1E3DD] bg-white px-3 py-2 text-xs text-[#565D56] focus:outline-none"
            >
              {STATUS_FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => showToast('课表下载功能待接入')}
              className={headerGhostBtn}
            >
              <i className="fa-solid fa-download text-[11px] opacity-70" aria-hidden />
              下载课表
            </button>
            <button
              type="button"
              onClick={() => openEditForm(emptyFormDraft(weekOffset), 'create')}
              className={headerGhostBtn}
            >
              <i className="fa-solid fa-plus text-[11px] opacity-70" aria-hidden />
              新建排课
            </button>
            <button type="button" onClick={() => setPublishOpen(true)} className="met-ink-button !text-xs">
              发布本周课表
            </button>
          </div>
        </div>
      </header>

      <div className="met-today-page__body custom-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="met-course-workspace mx-auto w-full">
          <section className="met-course-page__metrics met-today-page__metrics grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {snapshot.metrics.map(metric => (
              <CourseMetricCard key={metric.id} item={metric} />
            ))}
          </section>

          <CourseOptimizationPanel
            tips={snapshot.optimizationTips}
            selectedTipId={selectedTipId}
            onSelectTip={setSelectedTipId}
            onTipAction={(_, action) => showToast(`${action}（演示占位）`)}
          />

          <div className="met-course-schedule-row">
            <CourseLibraryPanel
              templates={localTemplates}
              onViewDetail={id => showToast(`模板 ${id} 详情（演示）`)}
              onAddToDraft={id => {
                const tpl = localTemplates.find(t => t.id === id);
                if (!tpl) return;
                const idNew = `local-${Date.now()}`;
                const session = buildDraftSessionFromTemplate(tpl, 0, '10:00', idNew, weekOffset);
                setLocalSessions(prev => [...prev, session]);
                openEditForm(formDraftFromSession(session, weekOffset), 'create', idNew);
              }}
              onOpenFullLibrary={() => setLibraryModalOpen(true)}
              onAddTemplate={() => openTemplateForm('create')}
            />
            <WeeklyScheduleBoard
              weekDayHeaders={weekDayHeaders}
              sessions={visibleSessions}
              selectedSessionId={selectedSessionId}
              statusFilter={statusFilter}
              onSelectSession={openDetail}
              onDropTemplate={handleDropTemplate}
              onSessionAction={handleSessionAction}
            />
          </div>
        </div>
      </div>

      <CourseSessionDetailDrawer
        open={drawerOpen}
        viewMode={drawerView}
        detail={sessionDetail}
        formDraft={formDraft}
        formMode={formMode}
        validationHints={drawerView === 'edit' && formMode === 'create' ? demoValidationHints : []}
        isLocalDraft={selectedIsLocalDraft}
        onClose={() => setDrawerOpen(false)}
        onAction={handleDrawerAction}
        onFormChange={patch => setFormDraft(prev => ({ ...prev, ...patch }))}
        onSaveDraft={handleSaveDraft}
        onBackToDetail={() => setDrawerView('detail')}
        onDeleteDraft={() => setDeleteConfirmId(selectedSessionId)}
      />

      <CourseLibraryModal
        open={libraryModalOpen}
        templates={localTemplates}
        onClose={() => setLibraryModalOpen(false)}
        onAddTemplate={() => {
          setLibraryModalOpen(false);
          openTemplateForm('create');
        }}
        onEditTemplate={id => {
          setLibraryModalOpen(false);
          openTemplateForm('edit', id);
        }}
        onViewDetail={id => showToast(`模板 ${id} 详情（演示）`)}
        onToggleSchedulable={id => {
          setLocalTemplates(prev =>
            prev.map(t => (t.id === id ? { ...t, schedulable: !t.schedulable } : t)),
          );
          showToast('模板状态已切换（本地）');
        }}
        onAddToDraft={id => {
          const tpl = localTemplates.find(t => t.id === id);
          if (!tpl) return;
          const idNew = `local-${Date.now()}`;
          const session = buildDraftSessionFromTemplate(tpl, 0, '10:00', idNew, weekOffset);
          setLocalSessions(prev => [...prev, session]);
          setLibraryModalOpen(false);
          openEditForm(formDraftFromSession(session, weekOffset), 'create', idNew);
        }}
      />

      <CourseTemplateFormModal
        open={templateFormOpen}
        mode={templateFormMode}
        initial={editingTemplate}
        onClose={() => setTemplateFormOpen(false)}
        onSave={handleSaveTemplate}
      />

      <SchedulePublishModal
        open={publishOpen}
        preview={snapshot.publishPreview}
        onClose={() => setPublishOpen(false)}
        onDefer={() => {
          setPublishOpen(false);
          showToast('已暂缓发布');
        }}
        onBackEdit={() => {
          setPublishOpen(false);
          showToast('请返回课表修改草稿场次');
        }}
        onPublishCompliant={() => {
          setPublishOpen(false);
          showToast(`已发布 ${snapshot.publishPreview.publishable} 场合规场次（演示）`);
        }}
      />

      {deleteConfirmId ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-[#222622]/18"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] p-6">
            <h2 className="text-base font-semibold text-[#222622]">删除排课草稿</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#70776F]">
              确认删除该本地草稿场次？删除后不可恢复，不会影响已发布场次。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-[#E1E3DD] px-4 py-2 text-xs text-[#565D56]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDeleteDraft}
                className="rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] px-4 py-2 text-xs text-[#8A6A3A]"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rescheduleOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-[#222622]/18"
            onClick={() => setRescheduleOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] p-6">
            <h2 className="text-base font-semibold text-[#222622]">发起调课</h2>
            <p className="mt-1 text-xs text-[#8A908A]">提交后由教务审核，不会直接变更场次状态</p>
            <dl className="mt-4 space-y-2 text-xs">
              <p className="text-[#70776F]">已预约会员将收到变更通知（演示说明）</p>
              <label className="block">
                <span className="text-[#8A908A]">操作原因</span>
                <textarea className="mt-1 w-full rounded border border-[#E1E3DD] px-2 py-1.5" rows={2} />
              </label>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="rounded-lg border border-[#E1E3DD] px-4 py-2 text-xs text-[#565D56]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setRescheduleOpen(false);
                  showToast('调课申请已提交（演示）');
                }}
                className="met-ink-button !text-xs"
              >
                提交调课申请
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-[#222622]/18"
            onClick={() => setCancelOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] p-6">
            <h2 className="text-base font-semibold text-[#222622]">取消课程</h2>
            <p className="mt-1 text-xs text-[#8A908A]">提交后进入审核，不会静默取消场次</p>
            <dl className="mt-4 space-y-2 text-xs">
              <p className="text-[#70776F]">已预约会员：14 人</p>
              <label className="block">
                <span className="text-[#8A908A]">取消原因</span>
                <textarea className="mt-1 w-full rounded border border-[#E1E3DD] px-2 py-1.5" rows={2} />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>发送取消通知</span>
              </label>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="rounded-lg border border-[#E1E3DD] px-4 py-2 text-xs text-[#565D56]"
              >
                返回
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelOpen(false);
                  showToast('取消申请已提交（演示）');
                }}
                className="rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] px-4 py-2 text-xs text-[#8A6A3A]"
              >
                提交取消申请
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-[#E1E3DD] bg-[#FCFCFA] px-4 py-2 text-xs text-[#222622] shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default CourseOperationDashboard;
