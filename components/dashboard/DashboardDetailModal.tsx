import React, { useEffect, useMemo, useState } from 'react';
import { findDashboardDetail, type DashboardOperationSnapshot } from './dashboardOperationViewModel';
import { DASHBOARD_PREVIEW_TOAST } from './dashboardDemoToast';
import DashboardDetailTabs, { type DashboardDetailTabId } from './DashboardDetailTabs';
import {
  DashboardEvidenceChain,
  DashboardJudgmentBox,
  DashboardLogTimeline,
  DashboardModalBlock,
  DashboardModalDl,
  DashboardModalPanel,
  DashboardTag,
} from './dashboardModalShared';

interface DashboardDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: DashboardOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: DashboardDetailTabId;
}

const DashboardDetailModal: React.FC<DashboardDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardDetailTabId>('judgment');

  const detail = useMemo(
    () => (entityId ? findDashboardDetail(snapshot, entityId) : undefined),
    [entityId, snapshot],
  );

  useEffect(() => {
    if (!open) setActiveTab('judgment');
    else if (initialTab) setActiveTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !detail) return null;

  const renderJudgment = () => (
    <>
      <DashboardJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <DashboardModalPanel title="经营判断">
        <DashboardModalDl
          rows={[
            { label: '当前事项', value: detail.currentItem },
            { label: '风险等级', value: detail.riskLevel },
            { label: '影响范围', value: detail.impactScope },
            { label: '建议下一步', value: detail.judgment.nextStep },
            { label: '责任角色', value: detail.ownerRole },
            { label: '截止时间', value: detail.deadline },
          ]}
        />
      </DashboardModalPanel>
    </>
  );

  const renderEvidence = () => (
    <DashboardModalPanel title="证据链">
      <DashboardModalDl
        rows={[
          { label: '关联模块', value: detail.relatedModules.join(' / ') },
          { label: '关联对象', value: detail.relatedObject },
          { label: '当前卡点', value: detail.stuckPoint },
          { label: '上游记录', value: detail.upstreamRecords.join('；') },
          { label: '下游影响', value: detail.downstreamImpact.join('；') },
          { label: '缺失证据', value: detail.missingEvidence },
          { label: '日志提示', value: detail.logHint },
        ]}
      />
    </DashboardModalPanel>
  );

  const renderStore = () => (
    <DashboardModalPanel title="门店影响">
      <DashboardModalDl
        rows={[
          { label: '影响门店', value: detail.affectedStores.join('、') },
          { label: '影响指标', value: detail.affectedMetrics.join('、') },
          { label: '今日表现', value: detail.todayPerformance },
          { label: '近 7 天趋势', value: detail.trend7d },
          { label: '店长责任', value: detail.storeManagerDuty },
          { label: '总部介入', value: detail.hqIntervention },
        ]}
      />
    </DashboardModalPanel>
  );

  const renderMemberCourse = () => (
    <DashboardModalPanel title="会员 / 课程影响">
      <DashboardModalDl
        rows={[
          { label: '影响会员', value: detail.affectedMembers },
          { label: '影响课程', value: detail.affectedCourses },
          { label: '预约 / 到课 / 耗课', value: detail.bookingAttendance },
          { label: '续费 / 流失风险', value: detail.renewalChurnRisk },
          { label: '处理建议', value: detail.handlerAdvice },
        ]}
      />
    </DashboardModalPanel>
  );

  const renderFinance = () => (
    <DashboardModalPanel title="财务影响">
      <DashboardModalDl
        rows={[
          { label: '关联金额', value: detail.relatedAmount },
          { label: '现金流影响', value: detail.cashflowImpact },
          { label: '预收负债影响', value: detail.liabilityImpact },
          { label: '确认收入影响', value: detail.revenueImpact },
          { label: '课时费影响', value: detail.feeImpact },
          { label: '财务复核', value: detail.financeReviewNeeded },
        ]}
      />
    </DashboardModalPanel>
  );

  const renderRecords = () => (
    <>
      <DashboardModalPanel title="处理记录">
        <DashboardLogTimeline logs={detail.operationLogs} />
      </DashboardModalPanel>
      <DashboardModalPanel title="后续动作">
        <p className="met-dashboard-detail-tip">{detail.followUpAction}</p>
        <DashboardModalDl
          rows={[
            { label: '当前状态', value: detail.status },
            { label: '责任角色', value: detail.ownerRole },
          ]}
        />
      </DashboardModalPanel>
    </>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'judgment': return renderJudgment();
      case 'evidence': return renderEvidence();
      case 'store': return renderStore();
      case 'memberCourse': return renderMemberCourse();
      case 'finance': return renderFinance();
      case 'records': return renderRecords();
      default: return renderJudgment();
    }
  };

  return (
    <div className="met-dashboard-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-dashboard-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-dashboard-detail-header">
          <div className="met-dashboard-detail-header__main">
            <h2 id="dashboard-detail-title">{detail.title}</h2>
            <p className="met-dashboard-detail-header__meta">{detail.subtitle}</p>
            <div className="met-dashboard-detail-header__chips">
              <DashboardTag text={detail.status} />
              <DashboardTag text={detail.riskLevel} kind="risk" />
              {detail.isDemo ? <span className="met-dashboard-detail-chip">前端演示</span> : null}
            </div>
            <p className="met-dashboard-detail-header__suggest">
              <span className="met-dashboard-detail-header__suggest-label">今日建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-dashboard-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <DashboardDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-dashboard-detail-body custom-scroll">
          <DashboardModalBlock title="证据链概览">
            <DashboardEvidenceChain steps={detail.evidenceChain} />
          </DashboardModalBlock>
          {tabBody()}
          <p className="met-dashboard-detail-tip">
            更新时间：{detail.updatedAt} · {detail.caliberNote} · 本页仅作经营总览预览，不作为最终财务或人事结论
          </p>
        </div>

        <footer className="met-dashboard-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`经营判断预览 · ${DASHBOARD_PREVIEW_TOAST}`)}
          >
            经营判断预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`导出经营摘要预览 · ${DASHBOARD_PREVIEW_TOAST}`)}
          >
            导出经营摘要
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`今日行动清单预览 · ${DASHBOARD_PREVIEW_TOAST}`)}
          >
            今日行动清单
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default DashboardDetailModal;
