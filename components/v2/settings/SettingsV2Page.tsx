import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildSettingsV2Snapshot,
  getConfigStatusClass,
  getPriorityClass,
  getRiskLevelClass,
  getRiskToneClass,
  getSuggestionSourceClass,
  type ContractDetail,
  type ControlCenterEntry,
  type HighRiskConfigItem,
  type OperationLogDetail,
  type OperationLogItem,
  type PermissionDetail,
  type SettingDetail,
  type SettingsDetailType,
  type SettingsEntryDetail,
  type SettingsEntrySummaryItem,
} from './settingsV2.viewModel';
import './settingsV2.css';

type DrawerState =
  | { type: 'entry'; id: SettingsDetailType }
  | { type: 'log'; id: string }
  | { type: 'setting'; id: string }
  | { type: 'permission'; id: string }
  | { type: 'contract'; id: string }
  | null;

const SettingsV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildSettingsV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const { detailMaps } = snapshot;

  const showToast = useCallback((message: string) => {
    console.log('[SettingsV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

  const handleAction = useCallback(
    (label: string) => {
      const message =
        label.includes('（待建设）') || label.startsWith('进入 ')
          ? label
          : `${label}（待建设）`;
      showToast(message);
    },
    [showToast],
  );

  const openEntryDrawer = useCallback((id: SettingsDetailType) => {
    setDrawer({ type: 'entry', id });
  }, []);

  const openSettingDrawer = useCallback((id: string) => {
    setDrawer({ type: 'setting', id });
  }, []);

  const openPermissionDrawer = useCallback((id: string) => {
    setDrawer({ type: 'permission', id });
  }, []);

  const openContractDrawer = useCallback((id: string) => {
    setDrawer({ type: 'contract', id });
  }, []);

  const openLogDrawer = useCallback((id: string) => {
    setDrawer({ type: 'log', id });
  }, []);

  const openEvidenceDrawer = useCallback(() => {
    openEntryDrawer('rules');
  }, [openEntryDrawer]);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  const drawerEntry: SettingsEntryDetail | null =
    drawer?.type === 'entry' ? detailMaps.entryDetailMap[drawer.id] ?? null : null;

  const drawerSetting: SettingDetail | null =
    drawer?.type === 'setting' ? detailMaps.settingDetailMap[drawer.id] ?? null : null;

  const drawerPermission: PermissionDetail | null =
    drawer?.type === 'permission' ? detailMaps.permissionDetailMap[drawer.id] ?? null : null;

  const drawerContract: ContractDetail | null =
    drawer?.type === 'contract' ? detailMaps.contractDetailMap[drawer.id] ?? null : null;

  const drawerLog: OperationLogDetail | null =
    drawer?.type === 'log' ? detailMaps.logDetailMap[drawer.id] ?? null : null;

  const handleEntryAction = useCallback(
    (entry: ControlCenterEntry) => {
      openEntryDrawer(entry.detailType);
    },
    [openEntryDrawer],
  );

  const handleHighRiskAction = useCallback(
    (item: HighRiskConfigItem) => {
      showToast(item.toastMessage);
      if (item.relatedDetailType) openEntryDrawer(item.relatedDetailType);
    },
    [openEntryDrawer, showToast],
  );

  const handleSummaryItem = useCallback(
    (item: SettingsEntrySummaryItem) => {
      if (item.toastMessage) showToast(item.toastMessage);
      if (item.detailId && item.detailKind === 'setting' && detailMaps.settingDetailMap[item.detailId]) {
        openSettingDrawer(item.detailId);
        return;
      }
      if (item.detailId && item.detailKind === 'permission' && detailMaps.permissionDetailMap[item.detailId]) {
        openPermissionDrawer(item.detailId);
        return;
      }
      if (item.detailId && item.detailKind === 'contract' && detailMaps.contractDetailMap[item.detailId]) {
        openContractDrawer(item.detailId);
        return;
      }
      if (item.detailId && detailMaps.logDetailMap[item.detailId]) {
        openLogDrawer(item.detailId);
        return;
      }
      if (!item.toastMessage && item.actionLabel) {
        showToast(`${item.actionLabel}：${item.label}（待建设）`);
      }
    },
    [detailMaps, openContractDrawer, openLogDrawer, openPermissionDrawer, openSettingDrawer, showToast],
  );

  const handleLogAction = useCallback(
    (item: OperationLogItem) => {
      if (detailMaps.logDetailMap[item.id]) {
        openLogDrawer(item.id);
        return;
      }
      if (item.detailId) {
        if (detailMaps.settingDetailMap[item.detailId]) openSettingDrawer(item.detailId);
        else if (detailMaps.permissionDetailMap[item.detailId]) openPermissionDrawer(item.detailId);
        else if (detailMaps.contractDetailMap[item.detailId]) openContractDrawer(item.detailId);
        else showToast('查看操作日志详情（待建设）');
        return;
      }
      showToast('查看操作日志详情（待建设）');
    },
    [detailMaps, openContractDrawer, openLogDrawer, openPermissionDrawer, openSettingDrawer, showToast],
  );

  const {
    meta,
    filters,
    healthSummary,
    configurationRisks,
    controlCenterEntries,
    highRiskQueue,
    operationLogs,
    auditRequiredActions,
  } = snapshot;

  const renderSettingDrawer = (detail: SettingDetail) => (
    <>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">基础信息</h3>
        {detail.basicInfo.map(row => (
          <div key={row.label} className="met-settings-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">规则内容</h3>
        {detail.ruleContent.map(row => (
          <div key={row.label} className="met-settings-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">影响范围</h3>
        <div className="met-settings-v2-drawer__tags">
          {detail.impactScope.map(s => (
            <span key={s} className="met-settings-v2-drawer__tag">{s}</span>
          ))}
        </div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">风险提示</h3>
        <ul className="met-settings-v2-drawer__list">
          {detail.riskNotes.map(n => <li key={n}>{n}</li>)}
        </ul>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">证据链</h3>
        {detail.evidenceChain.map(row => (
          <div key={row.label} className="met-settings-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <div className="met-settings-v2-drawer__actions">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-settings-v2-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderPermissionDrawer = (detail: PermissionDetail) => (
    <>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">可见范围</h3>
        <div className="met-settings-v2-drawer__tags">
          {detail.visible.map(v => <span key={v} className="met-settings-v2-drawer__tag is-visible">{v}</span>)}
        </div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">可操作范围</h3>
        <div className="met-settings-v2-drawer__tags">
          {detail.operable.map(v => <span key={v} className="met-settings-v2-drawer__tag is-operable">{v}</span>)}
        </div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">不可操作范围</h3>
        <div className="met-settings-v2-drawer__tags">
          {detail.restricted.map(v => <span key={v} className="met-settings-v2-drawer__tag is-restricted">{v}</span>)}
        </div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">敏感字段脱敏</h3>
        <ul className="met-settings-v2-drawer__list">
          {detail.sensitiveFields.map(f => <li key={f}>{f}</li>)}
        </ul>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">审批限制</h3>
        <ul className="met-settings-v2-drawer__list">
          {detail.approvalLimits.map(a => <li key={a}>{a}</li>)}
        </ul>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">操作日志要求</h3>
        <ul className="met-settings-v2-drawer__list">
          {detail.logRequirements.map(l => <li key={l}>{l}</li>)}
        </ul>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">同步状态</h3>
        <p className="met-settings-v2-drawer__highlight">{detail.syncStatus}</p>
      </section>
      <div className="met-settings-v2-drawer__actions">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-settings-v2-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderContractDrawer = (detail: ContractDetail) => (
    <>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">模板信息</h3>
        <div className="met-settings-v2-drawer__row"><span>模板版本</span><span>{detail.version}</span></div>
        <div className="met-settings-v2-drawer__row"><span>适用卡项</span><span>{detail.applicable}</span></div>
        <div className="met-settings-v2-drawer__row"><span>电子签署</span><span>{detail.eSign}</span></div>
        <div className="met-settings-v2-drawer__row"><span>重点条款外显</span><span>{detail.displayTerms}</span></div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">重点条款</h3>
        <ul className="met-settings-v2-drawer__list">
          {detail.keyTerms.map(t => <li key={t}>{t}</li>)}
        </ul>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">关联证据</h3>
        <div className="met-settings-v2-drawer__tags">
          {detail.associations.map(a => <span key={a} className="met-settings-v2-drawer__tag">{a}</span>)}
        </div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">最近修改记录</h3>
        {detail.recentChanges.map(row => (
          <div key={row.label} className="met-settings-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <div className="met-settings-v2-drawer__actions">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-settings-v2-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderEntryDrawer = (detail: SettingsEntryDetail) => (
    <>
      {detail.sections.map(section => (
        <section key={section.title} className="met-settings-v2-drawer__section">
          <h3 className="met-settings-v2-drawer__section-title">{section.title}</h3>
          <div className="met-settings-v2-detail-drawer__list">
            {section.items.map(item => (
              <div key={item.label} className="met-settings-v2-detail-drawer__item">
                <div className="met-settings-v2-detail-drawer__main">
                  <span className="met-settings-v2-detail-drawer__label">{item.label}</span>
                  <span className="met-settings-v2-detail-drawer__summary">{item.summary}</span>
                  {item.status ? <span className="met-settings-v2-detail-drawer__status">{item.status}</span> : null}
                </div>
                {item.actionLabel ? (
                  <button type="button" className="met-settings-v2-btn met-settings-v2-btn--sm" onClick={() => handleSummaryItem(item)}>
                    {item.actionLabel}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="met-settings-v2-drawer__actions">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-settings-v2-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderLogDrawer = (detail: OperationLogDetail) => (
    <>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">操作信息</h3>
        <div className="met-settings-v2-drawer__row"><span>操作人</span><span>{detail.operator}</span></div>
        <div className="met-settings-v2-drawer__row"><span>操作时间</span><span>{detail.time}</span></div>
        <div className="met-settings-v2-drawer__row"><span>影响对象</span><span>{detail.impact}</span></div>
        <div className="met-settings-v2-drawer__row"><span>风险等级</span><span>{detail.riskLevel === 'high' ? '高' : detail.riskLevel === 'medium' ? '中' : '低'}</span></div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">变更内容</h3>
        <div className="met-settings-v2-drawer__row"><span>旧值</span><span>{detail.oldValue}</span></div>
        <div className="met-settings-v2-drawer__row"><span>新值</span><span>{detail.newValue}</span></div>
        <div className="met-settings-v2-drawer__row"><span>审批记录</span><span>{detail.approvalRecord}</span></div>
      </section>
      <section className="met-settings-v2-drawer__section">
        <h3 className="met-settings-v2-drawer__section-title">证据链</h3>
        {detail.evidenceChain.map(row => (
          <div key={row.label} className="met-settings-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <div className="met-settings-v2-drawer__actions">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-settings-v2-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const drawerTitle =
    drawerEntry?.title ?? drawerSetting?.title ?? drawerPermission?.title
    ?? drawerContract?.title ?? drawerLog?.title ?? '';
  const drawerSubtitle =
    drawerEntry?.subtitle ?? drawerSetting?.subtitle ?? drawerPermission?.subtitle
    ?? drawerContract?.subtitle ?? drawerLog?.subtitle ?? '';

  return (
    <div className="met-settings-v2">
      <div className="met-settings-v2__inner">
        <header className="met-settings-v2__header">
          <div className="met-settings-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-settings-v2__header-actions">
            <div className="met-settings-v2__filters">
              <button
                type="button"
                className="met-settings-v2__filter-btn"
                onClick={() => handleAction('切换配置范围筛选')}
              >
                配置范围：{filters.scopeLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-settings-v2__filter-btn"
                onClick={() => handleAction('切换配置类型筛选')}
              >
                配置类型：{filters.typeLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-settings-v2__filter-btn"
                onClick={() => handleAction('切换状态筛选')}
              >
                状态：{filters.statusLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-settings-v2__filter-btn"
                onClick={() => handleAction('切换风险等级筛选')}
              >
                风险等级：{filters.riskLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button type="button" className="met-settings-v2__filter-btn met-settings-v2__filter-btn--ghost" onClick={() => showToast('导出配置清单（待建设）')}>
                {filters.secondaryActionLabel}
              </button>
              <button type="button" className="met-settings-v2__filter-btn met-settings-v2__filter-btn--primary" onClick={() => showToast('新增配置（待建设）')}>
                {filters.primaryActionLabel}
              </button>
            </div>
            <button type="button" className="met-settings-v2__detail-link" onClick={() => showToast('进入操作日志二级页（待建设）')}>
              {filters.logLinkLabel}
            </button>
          </div>
        </header>

        {/* 第一屏：系统配置健康判断 */}
        <section className="met-settings-v2-zone met-settings-v2-zone--health">
          <header className="met-settings-v2-zone__head">
            <h2 className="met-settings-v2-zone__title">{healthSummary.section.title}</h2>
            <p className="met-settings-v2-zone__subtitle">{healthSummary.section.subtitle}</p>
          </header>
          <div className="met-settings-v2-health-layout">
            <div className="met-settings-v2-panel met-settings-v2-panel--conclusion">
              <h3 className="met-settings-v2-panel__title">{healthSummary.title}</h3>
              <p className="met-settings-v2-conclusion">{healthSummary.conclusion}</p>
              <p className="met-settings-v2-conclusion-desc">{healthSummary.description}</p>
              <div className="met-settings-v2-tags">
                {healthSummary.statusTags.map(tag => (
                  <span key={tag} className="met-settings-v2-tag met-settings-v2-tag--warn">{tag}</span>
                ))}
                <span className={['met-settings-v2-source-tag', getSuggestionSourceClass(healthSummary.suggestionSource)].join(' ')}>
                  {healthSummary.suggestionSourceLabel}
                </span>
              </div>
              <div className="met-settings-v2-evidence-grid">
                {healthSummary.evidence.map(ev => (
                  <div
                    key={ev.label}
                    className={[
                      'met-settings-v2-evidence-item',
                      ev.label === '已启用规则' ? 'met-settings-v2-evidence-item--rules' : '',
                      ev.label === '待补配置' ? 'met-settings-v2-evidence-item--pending' : '',
                      ev.label === '角色权限' ? 'met-settings-v2-evidence-item--roles' : '',
                      ev.label === '审批流' ? 'met-settings-v2-evidence-item--approval' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="met-settings-v2-evidence-item__value">{ev.value}</span>
                    <span className="met-settings-v2-evidence-item__label">{ev.label}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="met-settings-v2-btn" onClick={openEvidenceDrawer}>
                {healthSummary.actionLabel}
              </button>
            </div>
            <aside className="met-settings-v2-panel met-settings-v2-panel--risks">
              <h3 className="met-settings-v2-panel__title">{configurationRisks.title}</h3>
              <div className="met-settings-v2-risk-grid met-settings-v2-risk-grid--compact">
                {configurationRisks.items.map(item => (
                  <div key={item.id} className={['met-settings-v2-risk-card met-settings-v2-risk-card--compact', getRiskToneClass(item.tone)].join(' ')}>
                    <div className="met-settings-v2-risk-card__head">
                      <span className="met-settings-v2-risk-card__count">{item.count}</span>
                      <span className="met-settings-v2-risk-card__type">{item.tone === 'risk' ? '风险' : item.tone === 'approval' ? '审批' : item.tone === 'notification' ? '通知' : '权限'}</span>
                    </div>
                    <p className="met-settings-v2-risk-card__title">{item.title}</p>
                    <button type="button" className="met-settings-v2-btn met-settings-v2-btn--sm" onClick={() => {
                      showToast(item.toastMessage);
                      if (item.relatedDetailId) {
                        if (detailMaps.settingDetailMap[item.relatedDetailId]) openSettingDrawer(item.relatedDetailId);
                        else if (detailMaps.permissionDetailMap[item.relatedDetailId]) openPermissionDrawer(item.relatedDetailId);
                      }
                    }}>
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* 第二屏：核心配置入口地图 */}
        <article className="met-settings-v2-zone">
          <header className="met-settings-v2-zone__head">
            <h2 className="met-settings-v2-zone__title">{controlCenterEntries.title}</h2>
            <p className="met-settings-v2-zone__subtitle">{controlCenterEntries.subtitle}</p>
          </header>
          <div className="met-settings-v2-control-map">
            {controlCenterEntries.entries.map(entry => (
              <div key={entry.id} className={['met-settings-v2-control-entry', getConfigStatusClass(entry.statusLevel)].join(' ')}>
                <div className="met-settings-v2-control-entry__head">
                  <h3 className="met-settings-v2-control-entry__title">{entry.title}</h3>
                  <span className="met-settings-v2-control-entry__status">{entry.status}</span>
                </div>
                <p className="met-settings-v2-control-entry__coverage">{entry.coverage}</p>
                <div className="met-settings-v2-control-entry__metrics">
                  {entry.metrics.map(m => (
                    <span key={m.label} className="met-settings-v2-control-entry__metric">
                      {m.label} <strong>{m.value}</strong>
                    </span>
                  ))}
                </div>
                <p className="met-settings-v2-control-entry__risk">{entry.risk}</p>
                <button type="button" className="met-settings-v2-btn met-settings-v2-btn--sm" onClick={() => handleEntryAction(entry)}>
                  {entry.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        {/* 第三屏：高风险配置队列 */}
        <article className="met-settings-v2-zone">
          <header className="met-settings-v2-zone__head">
            <h2 className="met-settings-v2-zone__title">{highRiskQueue.title}</h2>
            <p className="met-settings-v2-zone__subtitle">{highRiskQueue.subtitle}</p>
          </header>
          <div className="met-settings-v2-highrisk-queue">
            {highRiskQueue.items.map(item => (
              <div key={item.id} className={['met-settings-v2-risk-row', `met-settings-v2-risk-row--${item.priority.toLowerCase()}`].join(' ')}>
                <span className={['met-settings-v2-priority', getPriorityClass(item.priority)].join(' ')}>{item.priority}</span>
                <div className="met-settings-v2-risk-row__main">
                  <p className="met-settings-v2-risk-row__title">{item.title}</p>
                  <p className="met-settings-v2-risk-row__fact">{item.fact}</p>
                  <p className="met-settings-v2-risk-row__meta">
                    <span className="met-settings-v2-risk-row__impact-tag">影响：{item.impact}</span>
                    <span className="met-settings-v2-risk-row__module">关联：{item.relatedModules}</span>
                    <span className={['met-settings-v2-source-tag', getSuggestionSourceClass(item.suggestionSource)].join(' ')}>
                      {item.suggestionSourceLabel}
                    </span>
                  </p>
                  <p className="met-settings-v2-risk-row__action">{item.suggestionAction}</p>
                </div>
                <button type="button" className="met-settings-v2-btn met-settings-v2-btn--sm" onClick={() => handleHighRiskAction(item)}>
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        {/* 第四屏：最近操作与证据链 */}
        <article className="met-settings-v2-zone">
          <header className="met-settings-v2-zone__head">
            <h2 className="met-settings-v2-zone__title">{operationLogs.title}</h2>
            <p className="met-settings-v2-zone__subtitle">{operationLogs.subtitle}</p>
          </header>
          <div className="met-settings-v2-log-overview">
            <div className="met-settings-v2-log-overview__logs">
              <h3 className="met-settings-v2-log-overview__subtitle">最近高风险操作</h3>
              {operationLogs.logs.map(log => (
                <div key={log.id} className="met-settings-v2-log-row met-settings-v2-log-row--compact">
                  <div className="met-settings-v2-log-row__main">
                    <p className="met-settings-v2-log-row__action">{log.action}</p>
                    <p className="met-settings-v2-log-row__meta">
                      {log.operator} · {log.time} · 影响：{log.impact}
                    </p>
                  </div>
                  <span className={['met-settings-v2-risk-level', getRiskLevelClass(log.riskLevel)].join(' ')}>
                    {log.riskLevel === 'high' ? '高' : log.riskLevel === 'medium' ? '中' : '低'}
                  </span>
                  <button type="button" className="met-settings-v2-btn met-settings-v2-btn--sm" onClick={() => handleLogAction(log)}>
                    {log.actionLabel}
                  </button>
                </div>
              ))}
            </div>
            <aside className="met-settings-v2-audit-tags">
              <h3 className="met-settings-v2-audit-tags__title">必须留痕的操作类型</h3>
              <div className="met-settings-v2-audit-tags__list">
                {auditRequiredActions.map(a => (
                  <span key={a.label} className="met-settings-v2-audit-tags__tag">{a.label}</span>
                ))}
              </div>
            </aside>
          </div>
        </article>
      </div>

      {drawer ? (
        <>
          <button type="button" className="met-settings-v2-drawer-overlay" aria-label="关闭详情" onClick={closeDrawer} />
          <aside className="met-settings-v2-drawer met-settings-v2-detail-drawer" role="dialog" aria-labelledby="settings-v2-drawer-title">
            <div className="met-settings-v2-drawer__head">
              <div>
                <h2 id="settings-v2-drawer-title" className="met-settings-v2-drawer__title">{drawerTitle}</h2>
                <p className="met-settings-v2-drawer__subtitle">{drawerSubtitle}</p>
              </div>
              <button type="button" className="met-settings-v2-drawer__close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-settings-v2-drawer__body">
              {drawer?.type === 'entry' && drawerEntry ? renderEntryDrawer(drawerEntry) : null}
              {drawer?.type === 'setting' && drawerSetting ? renderSettingDrawer(drawerSetting) : null}
              {drawer?.type === 'permission' && drawerPermission ? renderPermissionDrawer(drawerPermission) : null}
              {drawer?.type === 'contract' && drawerContract ? renderContractDrawer(drawerContract) : null}
              {drawer?.type === 'log' && drawerLog ? renderLogDrawer(drawerLog) : null}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-settings-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default SettingsV2Page;
