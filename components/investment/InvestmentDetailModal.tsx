import React, { useEffect, useMemo, useState } from 'react';
import { findInvestmentDetail, type InvestmentOperationSnapshot } from './investmentOperationViewModel';
import { INVESTMENT_PREVIEW_TOAST } from './investmentDemoToast';
import InvestmentDetailTabs, { type InvestmentDetailTabId } from './InvestmentDetailTabs';
import {
  InvestmentCalcChain,
  InvestmentJudgmentBox,
  InvestmentModalBlock,
  InvestmentModalDl,
  InvestmentModalPanel,
  InvestmentStructureTable,
  InvestmentTag,
} from './investmentModalShared';

interface InvestmentDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: InvestmentOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: InvestmentDetailTabId;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<InvestmentDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findInvestmentDetail(snapshot, entityId) : undefined),
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
      <InvestmentJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <InvestmentModalPanel title="方案基础信息">
        <InvestmentModalDl
          rows={[
            { label: '项目名称', value: detail.projectName },
            { label: '城市 / 区域', value: detail.region },
            { label: '面积', value: detail.area },
            { label: '门店类型', value: detail.storeType },
          ]}
        />
      </InvestmentModalPanel>
      <InvestmentModalPanel title="核心指标">
        <InvestmentModalDl rows={detail.coreMetrics.map(m => ({ label: m.label, value: m.value }))} />
      </InvestmentModalPanel>
    </>
  );

  const renderCost = () => (
    <>
      <InvestmentModalPanel title="初始投入结构">
        <InvestmentStructureTable rows={detail.capexStructure} />
      </InvestmentModalPanel>
      <InvestmentModalPanel title="月固定成本结构">
        <InvestmentStructureTable rows={detail.fixedCostStructure} />
      </InvestmentModalPanel>
      <InvestmentModalDl
        rows={[
          { label: '超预算项', value: detail.overBudgetItems.join(' / ') || '无' },
          { label: '刚性成本说明', value: detail.rigidCostNote },
        ]}
      />
    </>
  );

  const renderRevenue = () => (
    <InvestmentModalPanel title="收入与产能假设">
      <table className="met-investment-mini-table">
        <thead>
          <tr>
            <th>收入类型</th>
            <th>月成交量</th>
            <th>月收入</th>
            <th>产能利用率</th>
          </tr>
        </thead>
        <tbody>
          {detail.revenueAssumptions.map(r => (
            <tr key={r.type}>
              <td>{r.type}</td>
              <td>{r.volume}</td>
              <td>{r.revenue}</td>
              <td>{r.utilization}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="met-investment-detail-tip">测算预览 · 以排课产能与转化假设为准</p>
    </InvestmentModalPanel>
  );

  const renderPayback = () => (
    <InvestmentModalPanel title="保本与回本">
      <InvestmentModalDl
        rows={[
          { label: '保本收入', value: detail.breakevenRevenue },
          { label: '当前预测收入', value: detail.predictedRevenue },
          { label: '月净现金流', value: detail.monthlyNetCashflow },
          { label: '回本周期', value: detail.paybackPeriod },
          { label: '安全垫判断', value: detail.safetyMargin },
        ]}
      />
      <p className="met-investment-detail-tip">本测算不构成投资承诺 · 以合同、财务、排课产能和银行流水为准</p>
    </InvestmentModalPanel>
  );

  const renderSensitivity = () => (
    <>
      <InvestmentModalPanel title="敏感性影响">
        <table className="met-investment-mini-table">
          <thead>
            <tr>
              <th>参数</th>
              <th>当前值</th>
              <th>调整后</th>
              <th>回本影响</th>
              <th>现金流影响</th>
            </tr>
          </thead>
          <tbody>
            {detail.sensitivityLines.map(s => (
              <tr key={s.param}>
                <td>{s.param}</td>
                <td>{s.current}</td>
                <td>{s.adjusted}</td>
                <td>{s.paybackImpact}</td>
                <td>{s.cashflowImpact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InvestmentModalPanel>
      {detail.highImpactParams.length > 0 ? (
        <InvestmentModalBlock title="高影响参数提示">
          <ul className="met-investment-detail-list">
            {detail.highImpactParams.map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </InvestmentModalBlock>
      ) : null}
    </>
  );

  const renderCaliber = () => (
    <InvestmentModalPanel title="测算口径">
      <table className="met-investment-mini-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>定义</th>
            <th>计算假设</th>
            <th>数据来源</th>
          </tr>
        </thead>
        <tbody>
          {detail.caliberItems.map(c => (
            <tr key={c.metric}>
              <td>{c.metric}</td>
              <td>{c.definition}</td>
              <td>{c.assumption}</td>
              <td>{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="met-investment-detail-tip">
        更新时间：{detail.updatedAt} · {detail.isDemo ? '当前为前端演示数据' : ''} · 最终应以真实合同、财务、排课产能和银行流水为准
      </p>
    </InvestmentModalPanel>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'cost': return renderCost();
      case 'revenue': return renderRevenue();
      case 'payback': return renderPayback();
      case 'sensitivity': return renderSensitivity();
      case 'caliber': return renderCaliber();
      default: return renderOverview();
    }
  };

  return (
    <div className="met-investment-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-investment-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="investment-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-investment-detail-header">
          <div className="met-investment-detail-header__main">
            <h2 id="investment-detail-title">{detail.title}</h2>
            <p className="met-investment-detail-header__meta">{detail.subtitle}</p>
            <div className="met-investment-detail-header__chips">
              <InvestmentTag text={detail.status} />
              <InvestmentTag text={detail.riskLevel} kind="risk" />
              {detail.isDemo ? <span className="met-investment-detail-chip">前端演示</span> : null}
            </div>
            <p className="met-investment-detail-header__suggest">
              <span className="met-investment-detail-header__suggest-label">测算建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-investment-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <InvestmentDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-investment-detail-body custom-scroll">
          <InvestmentModalBlock title="测算链路">
            <InvestmentCalcChain steps={detail.calcChain} />
          </InvestmentModalBlock>
          {tabBody()}
        </div>

        <footer className="met-investment-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`导出测算预览 · ${INVESTMENT_PREVIEW_TOAST}`)}
          >
            导出测算预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`保存方案预览 · ${INVESTMENT_PREVIEW_TOAST}`)}
          >
            保存方案预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`生成投资测算预览 · ${INVESTMENT_PREVIEW_TOAST}`)}
          >
            生成投资测算预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default InvestmentDetailModal;
