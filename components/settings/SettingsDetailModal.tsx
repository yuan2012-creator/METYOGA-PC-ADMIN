import React, { useEffect, useMemo, useState } from 'react';
import {
  findSettingsRule,
  formatSettingsDisplay,
  getRuleTodaySuggestion,
  getSegmentLabel,
  SETTINGS_PREVIEW_TOAST,
  type SettingsOperationSnapshot,
} from './settingsOperationViewModel';
import { formatSettingsDateTime, formatSettingsPorts } from './settingsFormatters';
import SettingsDetailTabs, { type SettingsDetailTabId } from './SettingsDetailTabs';
import {
  SettingsConfigRows,
  SettingsJudgmentBox,
  SettingsKeyImpactGrid,
  SettingsModalBlock,
  SettingsModalDl,
  SettingsModalPanel,
  SettingsRiskTable,
  SettingsSyncCompareCards,
  SettingsTag,
  SettingsVersionTimeline,
} from './settingsModalShared';

interface SettingsDetailModalProps {
  open: boolean;
  ruleId: string | null;
  snapshot: SettingsOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: SettingsDetailTabId;
}

const SettingsDetailModal: React.FC<SettingsDetailModalProps> = ({
  open,
  ruleId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsDetailTabId>('overview');

  const rule = useMemo(
    () => (ruleId ? findSettingsRule(snapshot, ruleId) : undefined),
    [ruleId, snapshot],
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

  if (!open || !rule) return null;

  const todaySuggest = getRuleTodaySuggestion(rule);
  const headerMeta = [rule.ruleId, getSegmentLabel(rule.segment), rule.status].join(' · ');

  const renderOverview = () => (
    <>
      <SettingsJudgmentBox
        hint={rule.judgment}
        status={rule.status}
        risk={rule.displayRisk}
      />
      <SettingsModalPanel title="规则摘要">
        <SettingsModalDl
          rows={[
            { label: '规则类型', value: rule.ruleType },
            {
              label: '适用范围',
              value: `${formatSettingsDisplay(rule.applicableStores) ?? ''} ${formatSettingsDisplay(rule.applicableProducts) ?? ''}`.trim(),
            },
            { label: '影响端口', value: formatSettingsPorts(rule.affectedPorts) },
            { label: '敏感等级', value: rule.sensitivity },
          ]}
        />
      </SettingsModalPanel>
      <SettingsModalBlock title="关键影响">
        <SettingsKeyImpactGrid rule={rule} />
      </SettingsModalBlock>
    </>
  );

  const renderContent = () => (
    <SettingsModalBlock title="结构化配置">
      <SettingsConfigRows rule={rule} />
    </SettingsModalBlock>
  );

  const renderSync = () => <SettingsSyncCompareCards rule={rule} />;

  const renderRisk = () => (
    <SettingsModalBlock title="风险检查">
      <SettingsRiskTable items={rule.riskDetails} rule={rule} />
    </SettingsModalBlock>
  );

  const renderApproval = () => (
    <>
      <SettingsModalPanel title="审批与权限">
        <SettingsModalDl
          rows={[
            { label: '谁能查看', value: rule.viewerRoles },
            { label: '谁能编辑', value: rule.editableRoles },
            { label: '谁能提交审核', value: rule.submitterRoles },
            { label: '谁能发布', value: rule.publisherRoles },
            {
              label: '是否需要总部审批',
              value: /总部/.test(rule.approvalRequired) ? '需要' : '视规则类型',
            },
            {
              label: '是否需要财务审批',
              value: /财务/.test(rule.approvalRequired) ? '需要' : null,
            },
            {
              label: '是否属于敏感操作',
              value: rule.sensitivity === '高敏感' || rule.sensitivity === '敏感' ? '是' : '否',
            },
          ]}
        />
      </SettingsModalPanel>
      <SettingsModalBlock title="权限边界说明">
        <ul className="met-settings-detail-list">
          <li>不可在 PC 后台直接改权益或财务数据，需走审批流（前端演示）。</li>
          <li>规则已发布后，会员端 / 老师端展示以已发布版本为准。</li>
          <li>敏感操作必须留痕，需接入真实规则服务与操作日志。</li>
        </ul>
      </SettingsModalBlock>
    </>
  );

  const renderVersion = () => (
    <>
      <SettingsModalPanel title="版本与发布">
        <SettingsModalDl
          rows={[
            { label: '发布状态', value: rule.publishStatus },
            {
              label: '最近修改',
              value: `${formatSettingsDateTime(rule.updatedAt)} · ${rule.updatedBy}`,
            },
          ]}
        />
      </SettingsModalPanel>
      <SettingsModalBlock title="操作日志">
        <SettingsVersionTimeline logs={rule.versionLogs} />
      </SettingsModalBlock>
      <p className="met-settings-detail-tip">
        回滚需总部审批；本页为前端演示，未真实申请发布或回滚。
      </p>
    </>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContent();
      case 'sync':
        return renderSync();
      case 'risk':
        return renderRisk();
      case 'approval':
        return renderApproval();
      case 'version':
        return renderVersion();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="met-settings-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-settings-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-settings-detail-header">
          <div className="met-settings-detail-header__main">
            <h2 id="settings-detail-title">{rule.ruleName}</h2>
            <p className="met-settings-detail-header__meta">{headerMeta}</p>
            <div className="met-settings-detail-header__chips">
              {rule.affectedPorts.map(port => (
                <span key={port} className="met-settings-detail-chip">
                  {port}
                </span>
              ))}
              <SettingsTag text={rule.sensitivity} kind="sensitivity" />
              {formatSettingsDisplay(rule.updatedBy) ? (
                <span className="met-settings-detail-chip">修改人 {rule.updatedBy}</span>
              ) : null}
            </div>
            <p className="met-settings-detail-header__suggest">
              <span className="met-settings-detail-header__suggest-label">今日建议</span>
              {todaySuggest}
            </p>
          </div>
          <button type="button" className="met-settings-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <SettingsDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-settings-detail-body custom-scroll">{tabBody()}</div>

        <footer className="met-settings-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`保存草稿预览 · ${SETTINGS_PREVIEW_TOAST}`)}
          >
            保存草稿预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`提交审核预览 · ${SETTINGS_PREVIEW_TOAST}`)}
          >
            提交审核预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`发布申请预览 · ${SETTINGS_PREVIEW_TOAST}`)}
          >
            发布申请预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default SettingsDetailModal;
