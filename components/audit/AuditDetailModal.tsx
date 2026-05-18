import React, { useEffect, useMemo, useState } from 'react';
import { findAuditDetail, type AuditOperationSnapshot } from './auditOperationViewModel';
import { AUDIT_PREVIEW_TOAST } from './auditDemoToast';
import AuditDetailTabs, { type AuditDetailTabId } from './AuditDetailTabs';
import {
  AuditEvidenceChain,
  AuditImpactGrid,
  AuditJudgmentBox,
  AuditLogTimeline,
  AuditModalBlock,
  AuditModalDl,
  AuditModalPanel,
  AuditTag,
} from './auditModalShared';

interface AuditDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: AuditOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: AuditDetailTabId;
}

const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<AuditDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findAuditDetail(snapshot, entityId) : undefined),
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
      <AuditJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <AuditModalPanel title="审计摘要">
        <AuditModalDl
          rows={[
            { label: '当前状态', value: detail.status },
            { label: '关联对象', value: detail.relatedObject },
            { label: '影响范围', value: detail.impactScope },
            { label: '建议下一步', value: detail.todaySuggestion },
          ]}
        />
      </AuditModalPanel>
    </>
  );

  const renderPermission = () => (
    <>
      <AuditModalPanel title="权限范围">
        <AuditModalDl
          rows={[
            { label: '可见模块', value: detail.visibleModules.join(' / ') },
            { label: '可操作动作', value: detail.allowedActions.join(' / ') },
            { label: '数据范围', value: detail.dataScope },
            { label: '敏感权限', value: detail.sensitivePermissions.join(' / ') },
          ]}
        />
      </AuditModalPanel>
      <AuditModalBlock title="不可见 / 不可操作边界">
        <ul className="met-audit-detail-list">
          {detail.permissionBoundaries.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AuditModalBlock>
    </>
  );

  const renderApproval = () => (
    <>
      <AuditModalPanel title="审批链路">
        <AuditModalDl
          rows={[
            { label: '申请人', value: detail.applicant },
            { label: '当前节点', value: detail.currentNode },
            { label: '审批人', value: detail.approver },
            { label: '审批状态', value: detail.approvalStatus },
            { label: '申请理由', value: detail.applyReason },
            { label: '审批备注', value: detail.approvalNote },
            { label: '下一步', value: detail.approvalNext },
          ]}
        />
      </AuditModalPanel>
      <AuditModalBlock title="证据链">
        <AuditEvidenceChain steps={detail.evidenceChain} />
      </AuditModalBlock>
    </>
  );

  const renderLogs = () => (
    <AuditModalBlock title="操作日志时间线">
      <AuditLogTimeline items={detail.logTimeline} />
    </AuditModalBlock>
  );

  const renderExport = () => (
    <>
      <AuditModalPanel title="数据导出">
        <AuditModalDl
          rows={[
            { label: '导出类型', value: detail.exportType },
            { label: '字段范围', value: detail.exportFields },
            { label: '导出条数', value: detail.exportCount > 0 ? `${detail.exportCount} 条` : null },
            { label: '导出用途', value: detail.exportPurpose },
            { label: '是否审批', value: detail.exportApproved },
            { label: '下载记录', value: detail.downloadRecords.join('；') },
            { label: '风险提示', value: detail.exportRiskHint },
          ]}
        />
      </AuditModalPanel>
    </>
  );

  const renderRisk = () => (
    <>
      <AuditModalPanel title="风险与处理">
        <AuditModalDl
          rows={[
            { label: '风险等级', value: detail.riskLevel },
            { label: '风险原因', value: detail.riskReason },
            { label: '影响模块', value: detail.impactModules.join(' / ') },
          ]}
        />
      </AuditModalPanel>
      <AuditModalBlock title="影响判断">
        <AuditImpactGrid detail={detail} />
      </AuditModalBlock>
      <AuditModalBlock title="建议处理步骤">
        <ul className="met-audit-detail-list">
          {detail.handleSteps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </AuditModalBlock>
      {detail.handleRecords.length > 0 ? (
        <AuditModalBlock title="处理记录">
          <ul className="met-audit-detail-list">
            {detail.handleRecords.map(rec => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </AuditModalBlock>
      ) : null}
    </>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'permission':
        return renderPermission();
      case 'approval':
        return renderApproval();
      case 'logs':
        return renderLogs();
      case 'export':
        return renderExport();
      case 'risk':
        return renderRisk();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="met-audit-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-audit-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-audit-detail-header">
          <div className="met-audit-detail-header__main">
            <h2 id="audit-detail-title">{detail.title}</h2>
            <p className="met-audit-detail-header__meta">{detail.subtitle}</p>
            <div className="met-audit-detail-header__chips">
              <AuditTag text={detail.riskLevel} kind="risk" />
              <AuditTag text={detail.status} />
              <AuditTag text={detail.impactScope} />
              {detail.isSensitive ? (
                <span className="met-audit-detail-chip">敏感操作</span>
              ) : null}
            </div>
            <p className="met-audit-detail-header__suggest">
              <span className="met-audit-detail-header__suggest-label">今日建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-audit-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <AuditDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-audit-detail-body custom-scroll">{tabBody()}</div>

        <footer className="met-audit-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`导出审计预览 · ${AUDIT_PREVIEW_TOAST}`)}
          >
            导出审计预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`提交复核预览 · ${AUDIT_PREVIEW_TOAST}`)}
          >
            提交复核预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`敏感操作复核预览 · ${AUDIT_PREVIEW_TOAST}`)}
          >
            敏感操作复核预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default AuditDetailModal;
