import React, { useEffect, useMemo, useState } from 'react';
import { findDataCenterDetail, type DataOperationSnapshot } from './dataCenterOperationViewModel';
import { DATA_CENTER_PREVIEW_TOAST } from './dataCenterDemoToast';
import DataCenterDetailTabs, { type DataCenterDetailTabId } from './DataCenterDetailTabs';
import {
  DataAnalysisChain,
  DataJudgmentBox,
  DataModalBlock,
  DataModalDl,
  DataModalPanel,
  DataRelatedTable,
  DataTag,
  DataTrendBars,
} from './dataCenterModalShared';

interface DataCenterDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: DataOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: DataCenterDetailTabId;
}

const DataCenterDetailModal: React.FC<DataCenterDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<DataCenterDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findDataCenterDetail(snapshot, entityId) : undefined),
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
      <DataJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <DataModalPanel title="核心指标">
        <DataModalDl rows={detail.coreMetrics.map(m => ({ label: m.label, value: m.value }))} />
      </DataModalPanel>
      <DataModalPanel title="系统建议">
        <p className="met-data-detail-tip">{detail.todaySuggestion}</p>
      </DataModalPanel>
    </>
  );

  const renderTrend = () => (
    <DataModalPanel title="趋势变化（分析预览）">
      <DataTrendBars title="最近 7 天" points={detail.trend7d} />
      <DataTrendBars title="最近 30 天" points={detail.trend30d} />
      <DataTrendBars title="最近 90 天" points={detail.trend90d} />
      <p className="met-data-detail-tip">趋势条为前端演示，待接入真实数据服务</p>
    </DataModalPanel>
  );

  const renderCompare = () => (
    <DataModalPanel title="对比分析">
      <DataModalDl
        rows={[
          { label: '与上月对比', value: detail.compareLastMonth },
          { label: '与其他门店对比', value: detail.compareOtherStores },
          { label: '与目标值对比', value: detail.compareTarget },
          { label: '偏差原因', value: detail.deviationReason },
        ]}
      />
    </DataModalPanel>
  );

  const renderRelated = () => (
    <>
      <DataModalPanel title="关联明细">
        <DataRelatedTable rows={detail.relatedItems} />
      </DataModalPanel>
      <button
        type="button"
        className="met-data-link-btn"
        onClick={() => onToast(`查看全部预览 · ${DATA_CENTER_PREVIEW_TOAST}`)}
      >
        查看全部预览
      </button>
    </>
  );

  const renderAdvice = () => (
    <>
      <DataModalPanel title="经营建议">
        <table className="met-data-mini-table">
          <thead>
            <tr>
              <th>建议动作</th>
              <th>责任角色</th>
              <th>建议周期</th>
              <th>注意事项</th>
            </tr>
          </thead>
          <tbody>
            {detail.adviceItems.map(a => (
              <tr key={a.action}>
                <td>{a.action}</td>
                <td>{a.role}</td>
                <td>{a.cycle}</td>
                <td>{a.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataModalPanel>
      <DataModalBlock title="证据链说明">
        <DataAnalysisChain steps={detail.evidenceChain} />
        <p className="met-data-detail-tip">分析预览 · 需审批后执行</p>
      </DataModalBlock>
    </>
  );

  const renderCaliber = () => (
    <DataModalPanel title="数据口径">
      <table className="met-data-mini-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>定义</th>
            <th>统计范围</th>
            <th>数据来源</th>
          </tr>
        </thead>
        <tbody>
          {detail.caliberItems.map(c => (
            <tr key={c.metric}>
              <td>{c.metric}</td>
              <td>{c.definition}</td>
              <td>{c.scope}</td>
              <td>{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="met-data-detail-tip">
        更新时间：{detail.updatedAt} · {detail.isDemo ? '当前为前端演示数据' : ''} · 以财务和业务系统真实数据为准
      </p>
    </DataModalPanel>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'trend': return renderTrend();
      case 'compare': return renderCompare();
      case 'related': return renderRelated();
      case 'advice': return renderAdvice();
      case 'caliber': return renderCaliber();
      default: return renderOverview();
    }
  };

  return (
    <div className="met-data-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-data-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-data-detail-header">
          <div className="met-data-detail-header__main">
            <h2 id="data-detail-title">{detail.title}</h2>
            <p className="met-data-detail-header__meta">{detail.subtitle}</p>
            <div className="met-data-detail-header__chips">
              <DataTag text={detail.status} />
              <DataTag text={detail.riskLevel} kind="risk" />
              {detail.isDemo ? (
                <span className="met-data-detail-chip">前端演示</span>
              ) : null}
            </div>
            <p className="met-data-detail-header__suggest">
              <span className="met-data-detail-header__suggest-label">分析建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-data-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <DataCenterDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-data-detail-body custom-scroll">
          <DataModalBlock title="分析链路">
            <DataAnalysisChain steps={detail.evidenceChain} />
          </DataModalBlock>
          {tabBody()}
        </div>

        <footer className="met-data-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`导出分析预览 · ${DATA_CENTER_PREVIEW_TOAST}`)}
          >
            导出分析预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`保存视图预览 · ${DATA_CENTER_PREVIEW_TOAST}`)}
          >
            保存视图预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`生成经营分析预览 · ${DATA_CENTER_PREVIEW_TOAST}`)}
          >
            生成经营分析预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default DataCenterDetailModal;
