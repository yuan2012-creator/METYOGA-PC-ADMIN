import React from 'react';
import type { SettingsRuleJudgment, SettingsRuleRow, SettingsRiskDetailItem, SettingsVersionLogEntry } from './settingsOperationViewModel';
import { formatSettingsDisplay, isSettingsEmpty } from './settingsOperationViewModel';
import { settingsSensitivityClass, settingsStatusClass } from './settingsFormatters';

export const SettingsModalPanel: React.FC<{ children: React.ReactNode; title?: string }> = ({
  title,
  children,
}) => (
  <section className="met-settings-info-card">
    {title ? <h4 className="met-settings-info-card__title">{title}</h4> : null}
    <div className="met-settings-info-card__body">{children}</div>
  </section>
);

export const SettingsModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-settings-detail-block">
    <h3 className="met-settings-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const SettingsModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2;
}> = ({ rows, columns = 2 }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '');
  if (visible.length === 0) return null;
  return (
    <dl
      className={`met-settings-field-grid${columns === 1 ? '' : ' met-settings-field-grid--2col'}`}
    >
      {visible.map(r => (
        <div key={r.label} className="met-settings-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const SettingsTag: React.FC<{
  text: string;
  kind?: 'status' | 'risk' | 'sensitivity' | 'neutral';
}> = ({ text, kind = 'status' }) => {
  if (isSettingsEmpty(text)) return null;
  let cls = 'met-settings-chip--neutral';
  if (kind === 'risk') cls = 'met-settings-chip--risk';
  else if (kind === 'sensitivity') cls = `met-settings-chip--${settingsSensitivityClass(text)}`;
  else if (kind === 'status') cls = `met-settings-chip--${settingsStatusClass(text)}`;
  return <span className={`met-settings-chip ${cls}`}>{text}</span>;
};

export const SettingsJudgmentBox: React.FC<{
  hint: SettingsRuleJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-settings-judgment-box" aria-label="系统判断">
    <div className="met-settings-judgment-box__head">
      <h4 className="met-settings-judgment-box__title">系统判断</h4>
      <div className="met-settings-judgment-box__tags">
        {status ? <SettingsTag text={status} kind="status" /> : null}
        {risk && !isSettingsEmpty(risk) ? <SettingsTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-settings-judgment-box__line">{hint.summary}</p>
    <dl className="met-settings-judgment-box__meta">
      {!isSettingsEmpty(hint.stuck) ? (
        <div>
          <dt>当前卡点</dt>
          <dd>{hint.stuck}</dd>
        </div>
      ) : null}
      <div>
        <dt>建议下一步</dt>
        <dd>{hint.nextStep}</dd>
      </div>
    </dl>
    <p className="met-settings-judgment-box__note">本页仅展示规则预览 · 需以审批流和操作日志为准</p>
  </section>
);

export const SettingsImpactChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-settings-impact-chain${compact ? ' met-settings-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-settings-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-settings-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const SettingsKeyImpactGrid: React.FC<{ rule: SettingsRuleRow }> = ({ rule }) => {
  const items = [
    { label: '影响预约', value: rule.keyImpacts.booking ? '是' : '否' },
    { label: '影响会员资产', value: rule.keyImpacts.asset ? '是' : '否' },
    { label: '影响财务', value: rule.keyImpacts.finance ? '是' : '否' },
    { label: '影响合同', value: rule.keyImpacts.contract ? '是' : '否' },
    { label: '需要操作日志', value: rule.keyImpacts.auditRequired ? '是' : '否' },
  ];
  return (
    <div className="met-settings-impact-grid">
      {items.map(item => (
        <div key={item.label} className={`met-settings-impact-grid__item${item.value === '是' ? ' is-on' : ''}`}>
          <span className="met-settings-impact-grid__label">{item.label}</span>
          <span className="met-settings-impact-grid__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export const SettingsConfigRows: React.FC<{ rule: SettingsRuleRow }> = ({ rule }) => (
  <div className="met-settings-config-rows">
    {[
      { label: 'PC 后台计算口径', value: rule.backendLogic },
      { label: '前台展示文案', value: rule.frontendText },
      { label: '老师端执行口径', value: rule.teacherSideLogic },
      { label: '适用课程', value: rule.applicableCourseTypes },
      { label: '适用产品', value: rule.applicableProducts },
      { label: '适用门店', value: rule.applicableStores },
    ].map(row => {
      const value = formatSettingsDisplay(row.value);
      return (
        <div key={row.label} className={`met-settings-config-row${value ? '' : ' is-missing'}`}>
          <span className="met-settings-config-row__label">{row.label}</span>
          <p className="met-settings-config-row__value">{value ?? '未配置 · 待补全'}</p>
        </div>
      );
    })}
    <div className="met-settings-config-row">
      <span className="met-settings-config-row__label">示例说明</span>
      <p className="met-settings-config-row__value">{rule.exampleNote}</p>
    </div>
    {rule.unconfiguredItems.length > 0 ? (
      <div className="met-settings-config-row is-missing">
        <span className="met-settings-config-row__label">未配置项</span>
        <ul className="met-settings-detail-list">
          {rule.unconfiguredItems.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
);

export const SettingsSyncCompareCards: React.FC<{ rule: SettingsRuleRow }> = ({ rule }) => {
  const cards = [
    { title: '会员端看到什么', value: rule.sync.member },
    { title: '老师端能做什么', value: rule.sync.teacher },
    { title: 'PC 后台记录什么', value: rule.sync.backend },
    { title: '财务是否受影响', value: rule.sync.finance },
    { title: '合同是否受影响', value: rule.sync.contract },
    { title: '操作日志是否必需', value: rule.sync.audit },
  ];
  return (
    <section className="met-settings-sync-compare">
      <div
        className={`met-settings-sync-banner${rule.syncAligned ? ' is-aligned' : ' is-conflict'}`}
      >
        <span>{rule.syncAligned ? '三端口径一致' : '三端口径不一致'}</span>
        {!rule.syncAligned ? <span className="met-settings-chip met-settings-chip--risk">需复核</span> : null}
      </div>
      <p className="met-settings-sync-compare__hint">
        同一规则在会员端、老师端与 PC 后台的表现应一致；若文案或计算窗口不同，将影响预约、资产与财务链路。
      </p>
      <div className="met-settings-sync-cards">
        {cards.map(card => (
          <article key={card.title} className="met-settings-sync-card">
            <h4>{card.title}</h4>
            <p>{formatSettingsDisplay(card.value) ?? '未配置'}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export const SettingsRiskTable: React.FC<{ items: SettingsRiskDetailItem[]; rule: SettingsRuleRow }> = ({
  items,
  rule,
}) => (
  <>
    <div className="met-settings-risk-table-wrap">
      <table className="met-settings-risk-table">
        <thead>
          <tr>
            <th>风险项</th>
            <th>影响模块</th>
            <th>风险等级</th>
            <th>处理建议</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={`${item.item}-${item.module}`}>
              <td>{item.item}</td>
              <td>{item.module}</td>
              <td>
                <SettingsTag text={item.level} kind="risk" />
              </td>
              <td>{item.suggestion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <SettingsModalDl
      columns={1}
      rows={[
        { label: '是否需要审批', value: rule.approvalRequired },
        {
          label: '是否影响前台展示',
          value: rule.affectedPorts.includes('会员端') || rule.affectedPorts.includes('老师端') ? '是' : '否',
        },
        { label: '是否影响会员资产', value: rule.keyImpacts.asset ? '是 · 需复核资产处理' : '否' },
        { label: '是否影响财务', value: rule.keyImpacts.finance ? rule.financeImpact : '否' },
        {
          label: '是否影响老师收入',
          value: rule.segment === 'teacherPay' ? '是 · 课时费预估待财务复核' : '否',
        },
      ]}
    />
  </>
);

export const SettingsVersionTimeline: React.FC<{ logs: SettingsVersionLogEntry[] }> = ({ logs }) => (
  <div className="met-settings-version-timeline">
    {logs.map((log, i) => (
      <article key={`${log.at}-${log.action}-${i}`} className="met-settings-version-item">
        <div className="met-settings-version-item__head">
          <time>{log.at}</time>
          <span>{log.by}</span>
          <SettingsTag text={log.publishStatus} kind="status" />
        </div>
        <p className="met-settings-version-item__action">{log.action}</p>
        <p className="met-settings-version-item__reason">修改原因：{log.reason}</p>
        <p className="met-settings-version-item__note">{log.note}</p>
      </article>
    ))}
  </div>
);
