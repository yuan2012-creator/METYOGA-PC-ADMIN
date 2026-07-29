import React, { useMemo, useState } from 'react';
import {
  ALLOCATION_METHOD_OPTIONS,
  ATTRIBUTION_LEVEL_OPTIONS,
  RENOVATION_DEADLINE,
  RENOVATION_TOTAL,
  type FixedCostItem,
  type PaybackScenarioConfig,
  type RenovationFinanceState,
  type RenovationPaymentNode,
} from '../researchCenterFinanceModel';
import { formatCurrency } from '../researchCenterCalculations';
import {
  computePaybackScenario,
  fixedCostMonthlyTotal,
  validateRenovationNodes,
} from '../researchCenterFinanceCalculations';
import { ResearchDateField, ResearchFieldError, ResearchNumberField, ResearchSelect } from '../researchFormFields';

interface FixedCostManagerProps {
  items: FixedCostItem[];
  onChange: (id: string, patch: Partial<FixedCostItem>) => void;
}

export const FixedCostManager: React.FC<FixedCostManagerProps> = ({ items, onChange }) => {
  const total = fixedCostMonthlyTotal(items);
  return (
    <section className="met-rc-v2-card met-rc-v2-fixed-costs">
      <header className="met-rc-v2-fixed-costs__header">
        <div>
          <h2 className="met-rc-v2-zone__title">固定经营成本</h2>
          <p className="met-rc-v2-zone__subtitle">月度固定成本维护与分摊规则</p>
        </div>
        <strong className="met-rc-v2-fixed-costs__total">月度固定成本合计 {formatCurrency(total)}/月</strong>
      </header>
      <div className="met-rc-v2-fixed-costs__table">
        <div className="met-rc-v2-fixed-costs__cols">
          <span>项目</span><span className="is-num">金额</span><span>生效</span><span>结束</span><span>归属</span><span>分摊</span><span>状态</span>
        </div>
        {items.map(item => (
          <div key={item.id} className="met-rc-v2-fixed-costs__row">
            <span>{item.name}</span>
            <span className="is-num">{formatCurrency(item.monthlyAmount)}/月</span>
            <span>{item.effectiveDate}</span>
            <span>{item.endDate || '—'}</span>
            <ResearchSelect
              value={item.attributionLevel}
              options={ATTRIBUTION_LEVEL_OPTIONS.map(v => ({ value: v, label: v }))}
              onChange={v => onChange(item.id, { attributionLevel: v as FixedCostItem['attributionLevel'] })}
            />
            <ResearchSelect
              value={item.allocationMethod}
              options={ALLOCATION_METHOD_OPTIONS.map(v => ({ value: v, label: v }))}
              onChange={v => onChange(item.id, { allocationMethod: v as FixedCostItem['allocationMethod'] })}
            />
            <span className={['met-rc-v2-fixed-costs__status', `is-${item.status}`].join(' ')}>{item.status}</span>
          </div>
        ))}
      </div>
      <p className="met-rc-v2-fixed-costs__note">
        当前固定经营成本自2026年9月1日起生效，不默认计入2026年7月27日班。
      </p>
    </section>
  );
};

interface RenovationPaymentEditorProps {
  renovation: RenovationFinanceState;
  onChangeNodes: (nodes: RenovationPaymentNode[]) => void;
  onToast: (msg: string) => void;
}

export const RenovationPaymentEditor: React.FC<RenovationPaymentEditorProps> = ({
  renovation,
  onChangeNodes,
  onToast,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalDue = renovation.paymentNodes.reduce((s, n) => s + n.dueAmount, 0);
  const unconfigured = Math.max(0, RENOVATION_TOTAL - totalDue);

  const addNode = () => {
    onChangeNodes([
      ...renovation.paymentNodes,
      { id: `reno-${Date.now()}`, dueDate: '2026-10-01', dueAmount: 0, paidAmount: 0, status: '待确认', note: '' },
    ]);
  };

  const saveNodes = () => {
    const validation = validateRenovationNodes(renovation.paymentNodes);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    onToast('硬装付款计划已保存，现金预测已更新');
  };

  return (
    <section className="met-rc-v2-renovation-panel">
      <header className="met-rc-v2-renovation-panel__head">
        <h3 className="met-rc-v2-renovation-panel__title">硬装付款计划</h3>
        <p className="met-rc-v2-renovation-panel__meta">
          已配置 {formatCurrency(totalDue)} · 未配置 {formatCurrency(unconfigured)} · 最晚 {RENOVATION_DEADLINE}
        </p>
      </header>
      <ResearchFieldError message={errors.total} />
      {renovation.paymentNodes.length ? (
        <div className="met-rc-v2-renovation-pay__nodes">
          {renovation.paymentNodes.map((node, index) => (
            <div key={node.id} className="met-rc-v2-renovation-pay__node">
              <ResearchDateField value={node.dueDate} max={RENOVATION_DEADLINE} onChange={v => {
                const next = renovation.paymentNodes.map(n => n.id === node.id ? { ...n, dueDate: v } : n);
                onChangeNodes(next);
              }} />
              <ResearchNumberField value={node.dueAmount} onChange={v => {
                const next = renovation.paymentNodes.map(n => n.id === node.id ? { ...n, dueAmount: v === '' ? 0 : v } : n);
                onChangeNodes(next);
              }} min={0} prefix="¥" />
              <ResearchNumberField value={node.paidAmount} onChange={v => {
                const next = renovation.paymentNodes.map(n => n.id === node.id ? { ...n, paidAmount: v === '' ? 0 : v } : n);
                onChangeNodes(next);
              }} min={0} prefix="¥" />
              <ResearchSelect value={node.status} options={['待确认', '待付款', '部分支付', '已支付'].map(s => ({ value: s, label: s }))} onChange={v => {
                const next = renovation.paymentNodes.map(n => n.id === node.id ? { ...n, status: v as RenovationPaymentNode['status'] } : n);
                onChangeNodes(next);
              }} />
              <button
                type="button"
                className="met-rc-v2-inline-btn is-danger"
                onClick={() => {
                  if (node.paidAmount > 0 && !window.confirm('该节点已有付款记录，确认删除？')) return;
                  onChangeNodes(renovation.paymentNodes.filter(n => n.id !== node.id));
                }}
              >
                删除
              </button>
              <ResearchFieldError message={errors[`date-${index}`] ?? errors[`paid-${index}`]} />
            </div>
          ))}
        </div>
      ) : (
        <p className="met-rc-v2-renovation-pay__empty">尚未配置付款节点，添加后可同步现金预测。</p>
      )}
      <div className="met-rc-v2-renovation-pay__footer">
        <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={addNode}>添加节点</button>
        <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={saveNodes}>保存计划</button>
      </div>
    </section>
  );
};

interface RenovationFinancePanelProps {
  renovation: RenovationFinanceState;
  onChangeNodes: (nodes: RenovationPaymentNode[]) => void;
  onChangeRenovation: (patch: Partial<RenovationFinanceState>) => void;
  onToast: (msg: string) => void;
}

const RenovationFinancePanel: React.FC<RenovationFinancePanelProps> = ({
  renovation,
  onChangeNodes,
  onChangeRenovation,
  onToast,
}) => {
  const monthlyAmort = renovation.amortizationMonths > 0
    ? Math.round(renovation.totalAmount / renovation.amortizationMonths)
    : 0;
  const remainingAmort = renovation.totalAmount - renovation.cumulativeAmortized;
  const recoveryPct = Math.round((renovation.cumulativeRecoverySurplus / renovation.totalAmount) * 100);
  const nextNode = renovation.paymentNodes
    .filter(n => n.paidAmount < n.dueAmount)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <section className="met-rc-v2-card met-rc-v2-renovation-finance">
      <header className="met-rc-v2-renovation-finance__header">
        <h2 className="met-rc-v2-zone__title">装修财务</h2>
        <p className="met-rc-v2-zone__subtitle">付款计划、利润摊销与经营回本对比</p>
      </header>

      <div className="met-rc-v2-renovation-finance__layout">
        <div className="met-rc-v2-renovation-column">
          <div className="met-rc-v2-renovation-panel">
            <header className="met-rc-v2-renovation-panel__head">
              <h3 className="met-rc-v2-renovation-panel__title">装修实际付款</h3>
            </header>
            <div className="met-rc-v2-renovation-block__rows">
              <div><span>装修总额</span><strong>{formatCurrency(renovation.totalAmount)}</strong></div>
              <div><span>已支付</span><strong>{formatCurrency(renovation.paidAmount)}</strong></div>
              <div><span>未支付</span><strong>{formatCurrency(renovation.totalAmount - renovation.paidAmount)}</strong></div>
              <div><span>下次付款日期</span><strong>{nextNode?.dueDate ?? '待配置'}</strong></div>
              <div><span>下次付款金额</span><strong>{nextNode ? formatCurrency(nextNode.dueAmount - nextNode.paidAmount) : '待配置'}</strong></div>
            </div>
          </div>
          <RenovationPaymentEditor renovation={renovation} onChangeNodes={onChangeNodes} onToast={onToast} />
        </div>

        <div className="met-rc-v2-renovation-column">
          <div className="met-rc-v2-renovation-panel">
            <header className="met-rc-v2-renovation-panel__head">
              <h3 className="met-rc-v2-renovation-panel__title">装修利润摊销</h3>
            </header>
            <div className="met-rc-v2-renovation-block__fields">
              <label>摊销开始<ResearchDateField value={renovation.amortizationStartDate} onChange={v => onChangeRenovation({ amortizationStartDate: v })} /></label>
              <label>摊销月数<ResearchNumberField value={renovation.amortizationMonths} onChange={v => onChangeRenovation({ amortizationMonths: v === '' ? 12 : v })} min={1} /></label>
            </div>
            <div className="met-rc-v2-renovation-block__rows">
              <div><span>每月摊销</span><strong>{formatCurrency(monthlyAmort)}</strong></div>
              <div><span>累计摊销</span><strong>{formatCurrency(renovation.cumulativeAmortized)}</strong></div>
              <div><span>剩余摊销</span><strong>{formatCurrency(remainingAmort)}</strong></div>
            </div>
          </div>

          <div className="met-rc-v2-renovation-panel">
            <header className="met-rc-v2-renovation-panel__head">
              <h3 className="met-rc-v2-renovation-panel__title">装修经营回本</h3>
            </header>
            <div className="met-rc-v2-renovation-block__rows">
              <div><span>回收进度</span><strong>{recoveryPct}%</strong></div>
              <div><span>累计可回收现金</span><strong>{formatCurrency(renovation.cumulativeRecoverySurplus)}</strong></div>
              <div><span>预计回收月份</span><strong>按回本情景测算</strong></div>
            </div>
            <p className="met-rc-v2-renovation-block__formula">
              累计可用于回收装修的经营现金盈余 ÷ {formatCurrency(RENOVATION_TOTAL)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

interface PaybackScenarioCalculatorProps {
  scenarios: PaybackScenarioConfig[];
  activeId: PaybackScenarioConfig['id'];
  onSelect: (id: PaybackScenarioConfig['id']) => void;
  onChange: (id: PaybackScenarioConfig['id'], patch: Partial<PaybackScenarioConfig>) => void;
}

export const PaybackScenarioCalculator: React.FC<PaybackScenarioCalculatorProps> = ({
  scenarios,
  activeId,
  onSelect,
  onChange,
}) => {
  const [showFull, setShowFull] = useState(false);
  const active = scenarios.find(s => s.id === activeId) ?? scenarios[0];
  const result = useMemo(() => computePaybackScenario(active), [active]);

  return (
    <section className="met-rc-v2-card met-rc-v2-payback">
      <header className="met-rc-v2-zone__head">
        <h2 className="met-rc-v2-zone__title">回本情景测算</h2>
        <p className="met-rc-v2-zone__subtitle">经营预测，不代表实际结果</p>
      </header>
      <div className="met-rc-v2-payback__body">
        <div className="met-rc-v2-payback__left">
          <div className="met-rc-v2-payback__tabs">
            {scenarios.map(s => (
              <button key={s.id} type="button" className={['met-rc-v2-payback__tab', activeId === s.id ? 'is-active' : ''].join(' ')} onClick={() => onSelect(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="met-rc-v2-payback__inputs">
            <label>每年开班<ResearchNumberField value={active.cohortsPerYear} onChange={v => onChange(active.id, { cohortsPerYear: v === '' ? 0 : v })} min={0} /></label>
            <label>每班平均人数<ResearchNumberField value={active.avgStudents} onChange={v => onChange(active.id, { avgStudents: v === '' ? 0 : v })} min={0} /></label>
            <label>平均成交价<ResearchNumberField value={active.avgDealPrice} onChange={v => onChange(active.id, { avgDealPrice: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>平均直接成本<ResearchNumberField value={active.avgDirectCost} onChange={v => onChange(active.id, { avgDirectCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>月度固定成本<ResearchNumberField value={active.monthlyFixedCost} onChange={v => onChange(active.id, { monthlyFixedCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>其他现金支出<ResearchNumberField value={active.otherCashOutflow} onChange={v => onChange(active.id, { otherCashOutflow: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
          </div>
        </div>

        <div className="met-rc-v2-payback__right">
          <div className="met-rc-v2-payback__hero">
            <div className="met-rc-v2-payback__hero-item">
              <span>年度经营现金盈余</span>
              <strong className={result.annualCashSurplus < 0 ? 'is-danger' : ''}>{formatCurrency(result.annualCashSurplus)}</strong>
            </div>
            <div className="met-rc-v2-payback__hero-item">
              <span>预计装修回收月份</span>
              <strong>{result.recoveryMonths ? `${result.recoveryMonths}个月` : '暂无法回收'}</strong>
            </div>
            <div className="met-rc-v2-payback__hero-item">
              <span>年末现金余额</span>
              <strong>{formatCurrency(result.yearEndCash)}</strong>
            </div>
          </div>
          <button type="button" className="met-rc-v2-payback__toggle" onClick={() => setShowFull(v => !v)}>
            {showFull ? '收起完整预测' : '查看完整预测'}
          </button>
          {showFull ? (
            <div className="met-rc-v2-payback__detail">
              <div><span>年度实收</span><strong>{formatCurrency(result.annualReceipt)}</strong></div>
              <div><span>年度项目贡献利润</span><strong>{formatCurrency(result.annualContribution)}</strong></div>
              <div><span>年度完整经营利润</span><strong>{formatCurrency(result.annualFullProfit)}</strong></div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default RenovationFinancePanel;
