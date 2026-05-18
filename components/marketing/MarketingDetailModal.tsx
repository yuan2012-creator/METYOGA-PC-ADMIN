import React, { useEffect, useMemo, useState } from 'react';
import { findMarketingDetail, type MarketingOperationSnapshot } from './marketingOperationViewModel';
import { MARKETING_PREVIEW_TOAST } from './marketingDemoToast';
import MarketingDetailTabs, { type MarketingDetailTabId } from './MarketingDetailTabs';
import { formatMarketingCny } from './marketingFormatters';
import {
  MarketingConversionTable,
  MarketingCostBlock,
  MarketingCostTable,
  MarketingEvidenceChain,
  MarketingJudgmentBox,
  MarketingLogTimeline,
  MarketingModalBlock,
  MarketingModalDl,
  MarketingModalPanel,
  MarketingSignupTable,
  MarketingTag,
} from './marketingModalShared';

interface MarketingDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: MarketingOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: MarketingDetailTabId;
}

const MarketingDetailModal: React.FC<MarketingDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<MarketingDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findMarketingDetail(snapshot, entityId) : undefined),
    [entityId, snapshot],
  );

  useEffect(() => {
    if (!open) setActiveTab('overview');
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

  const renderOverview = () => (
    <>
      <MarketingJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <MarketingModalPanel title="活动基础信息">
        <MarketingModalDl
          rows={[
            { label: '活动类型', value: detail.activityType },
            { label: '适用门店', value: detail.stores },
            { label: '活动目标', value: detail.activityGoal },
            { label: '活动周期', value: detail.activityTime },
            { label: '目标人群', value: detail.targetAudience },
            { label: '当前阶段', value: detail.currentPhase },
          ]}
        />
      </MarketingModalPanel>
      <MarketingModalPanel title="当前报名 / 到店 / 成交">
        <MarketingModalDl
          rows={[
            { label: '报名人数', value: `${detail.signupCount} 人` },
            { label: '到店人数', value: `${detail.arrivalCount} 人` },
            {
              label: '成交金额',
              value: (
                <>
                  {formatMarketingCny(detail.revenue)}
                  <span className="met-marketing-detail-tip-inline">（{detail.revenueNote}）</span>
                </>
              ),
            },
            { label: '预算成本', value: formatMarketingCny(detail.budget) },
            { label: '实际成本', value: formatMarketingCny(detail.actual) },
            { label: '当前风险', value: detail.currentRisks.filter(r => r !== '—').join(' / ') || '无' },
            { label: '建议下一步', value: detail.judgment.nextStep },
          ]}
        />
      </MarketingModalPanel>
    </>
  );

  const renderSignup = () => (
    <>
      <MarketingModalPanel title="报名到店统计">
        <MarketingModalDl
          rows={[
            { label: '报名总数', value: `${detail.signupCount} 人` },
            { label: '已确认', value: `${detail.signupConfirmed} 人` },
            { label: '已到店', value: `${detail.signupArrived} 人` },
            { label: '未到店', value: `${detail.signupNoShow} 人` },
            { label: '待提醒', value: `${detail.signupPendingReminder} 人` },
            { label: '报名来源分布', value: detail.sourceDistribution },
            { label: '未到店名单', value: detail.noShowList },
          ]}
        />
      </MarketingModalPanel>
      <MarketingModalPanel title="最近报名名单">
        <MarketingSignupTable rows={detail.recentSignups} />
      </MarketingModalPanel>
      <MarketingModalPanel title="提醒记录">
        <ul className="met-marketing-detail-list">
          {detail.reminderLogs.map(log => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </MarketingModalPanel>
      <MarketingModalBlock title="对管家跟进的影响">
        <p className="met-marketing-detail-tip">
          报名未到将占用管家跟进产能，建议按活动规则批量提醒（前端演示 · 待接入真实服务）
        </p>
      </MarketingModalBlock>
    </>
  );

  const renderConversion = () => (
    <>
      <MarketingModalPanel title="体验转化统计">
        <MarketingModalDl
          rows={[
            { label: '体验人数', value: `${detail.convTrialCount} 人` },
            { label: '已跟进', value: `${detail.convFollowed} 人` },
            { label: '已成交', value: `${detail.convDealt} 人` },
            { label: '未成交', value: `${detail.convNoDeal} 人` },
            { label: '待分配', value: `${detail.convPendingAssign} 人` },
            { label: '店长介入提示', value: detail.managerHint },
          ]}
        />
      </MarketingModalPanel>
      <MarketingModalPanel title="体验转化列表">
        <MarketingConversionTable rows={detail.conversionList} />
      </MarketingModalPanel>
    </>
  );

  const renderCoupon = () => (
    <>
      <MarketingModalPanel title="活动权益">
        <MarketingModalDl
          rows={[
            { label: '权益名称', value: detail.benefitName },
            { label: '权益类型', value: detail.benefitType },
            { label: '发放数量', value: detail.issued ? `${detail.issued} 张` : null },
            { label: '使用数量', value: detail.used ? `${detail.used} 张` : null },
            { label: '剩余数量', value: detail.benefitRemaining ? `${detail.benefitRemaining} 张` : null },
            { label: '有效期', value: detail.validUntil },
            { label: '适用产品', value: detail.applicableProducts },
            { label: '使用门槛', value: detail.benefitThreshold },
            { label: '是否可叠加', value: detail.benefitStackable },
            { label: '风险提示', value: detail.benefitRisk },
          ]}
        />
      </MarketingModalPanel>
      <MarketingModalBlock title="权益边界说明">
        <ul className="met-marketing-detail-list">
          {detail.benefitBoundaries.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="met-marketing-detail-tip">
          本页只做权益规则预览，不做真实发券或作废 · 需审批后执行
        </p>
      </MarketingModalBlock>
    </>
  );

  const renderCost = () => (
    <>
      <MarketingModalPanel title="成本与物料">
        <MarketingCostBlock detail={detail} />
      </MarketingModalPanel>
      <MarketingModalPanel title="成本明细">
        <MarketingCostTable rows={detail.costDetails} />
      </MarketingModalPanel>
    </>
  );

  const renderReview = () => (
    <>
      <MarketingModalPanel title="复盘记录">
        <MarketingModalDl
          rows={[
            { label: '活动目标完成情况', value: detail.reviewGoal },
            { label: '报名到店率', value: detail.arrivalRate },
            { label: '体验成交率', value: detail.reviewDealRate },
            {
              label: '成交金额',
              value: (
                <>
                  {formatMarketingCny(detail.revenue)}
                  <span className="met-marketing-detail-tip-inline">（前端演示）</span>
                </>
              ),
            },
            { label: '预算成本', value: formatMarketingCny(detail.budget) },
            { label: '实际成本', value: formatMarketingCny(detail.actual) },
            { label: 'ROI / 成本回收', value: detail.reviewRoiJudgment },
            { label: '成本收益摘要', value: detail.roiSummary },
            { label: '可复用结论', value: detail.reuseAdvice },
            { label: '下次优化建议', value: detail.reviewOptimizeAdvice },
            { label: '用户反馈', value: detail.userFeedback },
            { label: '员工反馈', value: detail.staffFeedback },
          ]}
        />
      </MarketingModalPanel>
      <MarketingModalBlock title="操作日志">
        <MarketingLogTimeline logs={detail.structuredLogs} />
      </MarketingModalBlock>
    </>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'signup':
        return renderSignup();
      case 'conversion':
        return renderConversion();
      case 'coupon':
        return renderCoupon();
      case 'cost':
        return renderCost();
      case 'review':
        return renderReview();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="met-marketing-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-marketing-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketing-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-marketing-detail-header">
          <div className="met-marketing-detail-header__main">
            <h2 id="marketing-detail-title">{detail.title}</h2>
            <p className="met-marketing-detail-header__meta">{detail.subtitle}</p>
            <div className="met-marketing-detail-header__chips">
              <MarketingTag text={detail.status} />
              <MarketingTag text={detail.riskLevel} kind="risk" />
              {detail.affectsBenefit ? (
                <span className="met-marketing-detail-chip">影响会员权益</span>
              ) : null}
              {detail.needsReview ? (
                <span className="met-marketing-detail-chip">待复盘</span>
              ) : null}
            </div>
            <p className="met-marketing-detail-header__suggest">
              <span className="met-marketing-detail-header__suggest-label">今日建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-marketing-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <MarketingDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-marketing-detail-body custom-scroll">
          <MarketingModalBlock title="证据链">
            <MarketingEvidenceChain steps={detail.evidenceChain} />
          </MarketingModalBlock>
          {tabBody()}
        </div>

        <footer className="met-marketing-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`活动配置预览 · ${MARKETING_PREVIEW_TOAST}`)}
          >
            活动配置预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`权益核对预览 · ${MARKETING_PREVIEW_TOAST}`)}
          >
            权益核对预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`生成复盘结论预览 · ${MARKETING_PREVIEW_TOAST}`)}
          >
            生成复盘结论预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default MarketingDetailModal;
