import React, { useEffect, useMemo, useState } from 'react';
import { findPartnerDetail, type PartnerOperationSnapshot } from './partnerOperationViewModel';
import { PARTNER_PREVIEW_TOAST } from './partnerDemoToast';
import PartnerDetailTabs, { type PartnerDetailTabId } from './PartnerDetailTabs';
import {
  PartnerGovernanceChain,
  PartnerJudgmentBox,
  PartnerLogTimeline,
  PartnerModalBlock,
  PartnerModalDl,
  PartnerModalPanel,
  PartnerTag,
} from './partnerModalShared';

interface PartnerDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: PartnerOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: PartnerDetailTabId;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<PartnerDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findPartnerDetail(snapshot, entityId) : undefined),
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
      <PartnerJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <PartnerModalPanel title="合作门店信息">
        <PartnerModalDl
          rows={[
            { label: '门店名称', value: detail.storeName },
            { label: '合作类型', value: detail.coopType },
            { label: '授权层级', value: detail.authLevel },
            { label: '当前状态', value: detail.status },
          ]}
        />
      </PartnerModalPanel>
      <PartnerModalPanel title="核心指标">
        <PartnerModalDl rows={detail.coreMetrics.map(m => ({ label: m.label, value: m.value }))} />
      </PartnerModalPanel>
      <PartnerModalPanel title="核心风险">
        <p className="met-partner-detail-tip">{detail.judgment.stuck !== '—' ? detail.judgment.stuck : '暂无显著风险'}</p>
      </PartnerModalPanel>
      <PartnerModalPanel title="建议下一步">
        <p className="met-partner-detail-tip">{detail.judgment.nextStep}</p>
      </PartnerModalPanel>
    </>
  );

  const renderAuthScope = () => (
    <>
      <PartnerModalPanel title="授权范围">
        <PartnerModalDl
          rows={[
            { label: '授权编号', value: detail.authNo },
            { label: '授权内容', value: detail.authContents.join(' / ') },
            { label: '可使用范围', value: detail.usableScope },
            { label: '不可使用范围', value: detail.forbiddenScope },
            { label: '到期时间', value: detail.expiryTime },
            { label: '合同 / 协议状态', value: detail.contractStatus },
            { label: '边界说明', value: detail.boundaryNote },
          ]}
        />
      </PartnerModalPanel>
    </>
  );

  const renderBrand = () => (
    <PartnerModalPanel title="品牌与规范">
      <PartnerModalDl
        rows={[
          { label: '品牌展示名称', value: detail.brandDisplayName },
          { label: '线上平台名称', value: detail.onlinePlatformName },
          { label: '视觉规范', value: detail.visualStandard },
          { label: '课程命名', value: detail.courseNaming },
          { label: '物料使用', value: detail.materialUsage },
          { label: '检查结果', value: detail.brandCheckResult },
          { label: '整改建议', value: detail.brandFixAdvice },
        ]}
      />
    </PartnerModalPanel>
  );

  const renderData = () => (
    <>
      <PartnerModalPanel title="数据与系统">
        <PartnerModalDl
          rows={[
            { label: '数据回传状态', value: detail.dataSyncStatus },
            { label: '系统服务等级', value: detail.systemServiceLevel },
            { label: '异常字段', value: detail.anomalyFields },
            { label: '最近回传时间', value: detail.lastSyncTime },
          ]}
        />
      </PartnerModalPanel>
      <PartnerModalPanel title="数据摘要">
        <table className="met-partner-mini-table">
          <thead>
            <tr>
              <th>数据类型</th>
              <th>状态</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {detail.dataSummary.map(d => (
              <tr key={d.type}>
                <td>{d.type}</td>
                <td><PartnerTag text={d.status} /></td>
                <td>{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PartnerModalPanel>
    </>
  );

  const renderQuality = () => (
    <>
      <PartnerModalPanel title="最近质检记录">
        <table className="met-partner-mini-table">
          <thead>
            <tr>
              <th>质检编号</th>
              <th>类型</th>
              <th>等级</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {detail.qualityRecords.map(q => (
              <tr key={q.no}>
                <td>{q.no}</td>
                <td>{q.type}</td>
                <td><PartnerTag text={q.level} kind="risk" /></td>
                <td><PartnerTag text={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </PartnerModalPanel>
      <PartnerModalPanel title="整改项">
        {detail.fixItems.length > 0 ? (
          <ul className="met-partner-detail-list">
            {detail.fixItems.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="met-partner-detail-tip">暂无待整改项</p>
        )}
        <PartnerModalDl
          rows={[
            { label: '负责人', value: detail.fixOwner },
            { label: '截止时间', value: detail.fixDeadline },
            { label: '整改状态', value: detail.fixStatus },
          ]}
        />
      </PartnerModalPanel>
      <PartnerModalPanel title="操作日志">
        <PartnerLogTimeline logs={detail.operationLogs} />
      </PartnerModalPanel>
    </>
  );

  const renderRenewal = () => (
    <PartnerModalPanel title="续约与退出">
      <PartnerModalDl
        rows={[
          { label: '授权到期', value: detail.renewalExpiry },
          { label: '续约意向', value: detail.renewalIntent },
          { label: '续约风险', value: detail.renewalRisk },
          { label: '退出 / 摘牌条件', value: detail.exitConditions },
          { label: '下一步动作', value: detail.nextAction },
          { label: '责任角色', value: detail.responsibleRole },
          { label: '风险提示', value: detail.renewalRiskNote },
        ]}
      />
    </PartnerModalPanel>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'authScope': return renderAuthScope();
      case 'brand': return renderBrand();
      case 'data': return renderData();
      case 'quality': return renderQuality();
      case 'renewal': return renderRenewal();
      default: return renderOverview();
    }
  };

  return (
    <div className="met-partner-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-partner-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-partner-detail-header">
          <div className="met-partner-detail-header__main">
            <h2 id="partner-detail-title">{detail.title}</h2>
            <p className="met-partner-detail-header__meta">{detail.subtitle}</p>
            <div className="met-partner-detail-header__chips">
              <PartnerTag text={detail.status} />
              <PartnerTag text={detail.riskLevel} kind="risk" />
              {detail.isDemo ? <span className="met-partner-detail-chip">前端演示</span> : null}
            </div>
            <p className="met-partner-detail-header__suggest">
              <span className="met-partner-detail-header__suggest-label">治理建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-partner-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <PartnerDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-partner-detail-body custom-scroll">
          <PartnerModalBlock title="治理链路">
            <PartnerGovernanceChain steps={detail.governanceChain} />
          </PartnerModalBlock>
          {tabBody()}
          <p className="met-partner-detail-tip">
            更新时间：{detail.updatedAt} · {detail.caliberNote} · 本页仅作合作治理预览，不构成法律或经营承诺
          </p>
        </div>

        <footer className="met-partner-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`授权预览 · ${PARTNER_PREVIEW_TOAST}`)}
          >
            授权预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`质检预览 · ${PARTNER_PREVIEW_TOAST}`)}
          >
            质检预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`发布授权规则预览 · ${PARTNER_PREVIEW_TOAST}`)}
          >
            发布授权规则
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default PartnerDetailModal;
