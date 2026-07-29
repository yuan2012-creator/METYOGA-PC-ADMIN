import React, { useMemo } from 'react';
import {
  computeSegmentMiniSummary,
  FINANCE_SEGMENT_HINTS,
  FINANCE_WORKBENCH_SEGMENTS,
  type FinanceOperationSnapshot,
  type FinanceWorkbenchSegment,
} from './financeOperationViewModel';
import { formatFinanceCny, formatFinanceDate, financeStatusClass } from './financeFormatters';

interface FinanceWorkspaceTableProps {
  segment: FinanceWorkbenchSegment;
  onSegmentChange: (s: FinanceWorkbenchSegment) => void;
  snapshot: FinanceOperationSnapshot;
  highlightId?: string | null;
  onOpenEntity: (type: 'payment' | 'refund' | 'consumption' | 'teacherFee' | 'settlement' | 'expense', id: string) => void;
  onViewChain: (type: 'payment' | 'refund' | 'consumption' | 'teacherFee' | 'settlement' | 'expense', id: string) => void;
}

type EntityType = 'payment' | 'refund' | 'consumption' | 'teacherFee' | 'settlement' | 'expense';

const Chip: React.FC<{ text: string }> = ({ text }) => {
  const tone = financeStatusClass(text);
  return <span className={`met-finance-chip met-finance-chip--${tone}`}>{text}</span>;
};

const CellCode: React.FC<{ primary: string; secondary?: string }> = ({ primary, secondary }) => (
  <div className="met-finance-cell-code">
    <span className="met-finance-cell-code__primary">{primary}</span>
    {secondary ? <span className="met-finance-cell-code__secondary">{secondary}</span> : null}
  </div>
);

const CellAmount: React.FC<{ value: number }> = ({ value }) => (
  <span className="met-finance-cell-amount">{formatFinanceCny(value)}</span>
);

const RowActions: React.FC<{
  type: EntityType;
  id: string;
  onOpenEntity: FinanceWorkspaceTableProps['onOpenEntity'];
  onViewChain: FinanceWorkspaceTableProps['onViewChain'];
}> = ({ type, id, onOpenEntity, onViewChain }) => (
  <td className="met-finance-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-finance-table-btn" onClick={() => onOpenEntity(type, id)}>
      查看详情
    </button>
    <button type="button" className="met-finance-table-btn" onClick={() => onViewChain(type, id)}>
      查看链路
    </button>
  </td>
);

const SegmentMiniSummary: React.FC<{ segment: FinanceWorkbenchSegment; snapshot: FinanceOperationSnapshot }> = ({
  segment,
  snapshot,
}) => {
  const stats = useMemo(() => computeSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  if (segment === 'reports') return null;
  return (
    <div className="met-finance-segment-summary" role="group" aria-label="本段汇总">
      {stats.map(s => (
        <div key={s.label} className="met-finance-segment-summary__item">
          <span className="met-finance-segment-summary__label">{s.label}</span>
          <span
            className={`met-finance-segment-summary__value${s.isAmount ? ' is-amount' : ''}`}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const FinanceWorkspaceTable: React.FC<FinanceWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  highlightId,
  onOpenEntity,
  onViewChain,
}) => {
  const { report } = snapshot;
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');
  const tableClass = `met-finance-table met-finance-table--${segment}`;

  const renderReports = () => (
    <div className="met-finance-reports">
      <div className="met-finance-segment-summary met-finance-segment-summary--reports" role="group">
        {computeSegmentMiniSummary(snapshot, 'reports').map(s => (
          <div key={s.label} className="met-finance-segment-summary__item">
            <span className="met-finance-segment-summary__label">{s.label}</span>
            <span className={`met-finance-segment-summary__value${s.isAmount ? ' is-amount' : ''}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
      <div className="met-finance-reports__cards">
        {[
          { label: '本月实收', value: formatFinanceCny(report.monthCashIn) },
          { label: '本月确认收入', value: formatFinanceCny(report.monthRecognized) },
          { label: '本月支出', value: formatFinanceCny(report.monthExpense) },
          { label: '预收负债', value: formatFinanceCny(report.deferredLiability) },
          { label: '账户现金余额', value: formatFinanceCny(report.cashBalance) },
          { label: '经营安全垫', value: formatFinanceCny(report.safetyCushion) },
        ].map(c => (
          <div key={c.label} className="met-finance-report-card">
            <span className="met-finance-report-card__label">{c.label}</span>
            <span className="met-finance-report-card__value">{c.value}</span>
          </div>
        ))}
      </div>
      <section className="met-finance-judgments">
        <h3>经营判断</h3>
        <p className="met-finance-judgments__disclaimer">
          当前测算仅供经营判断，最终以财务入账与银行流水为准。
        </p>
        <div className="met-finance-judgment-list">
          <article className="met-finance-judgment-item">
            <p className="met-finance-judgment-item__q">本月确认收入是否大于本月支出</p>
            <span className={`met-finance-judgment-badge is-${report.judgment1}`}>{report.judgment1}</span>
            <p className="met-finance-judgment-item__note">{report.judgment1Note}</p>
          </article>
          <article className="met-finance-judgment-item">
            <p className="met-finance-judgment-item__q">账户现金余额是否大于预收负债</p>
            <span className={`met-finance-judgment-badge is-${report.judgment2}`}>{report.judgment2}</span>
            <p className="met-finance-judgment-item__note">{report.judgment2Note}</p>
          </article>
          <article className="met-finance-judgment-item">
            <p className="met-finance-judgment-item__q">退款与异常支出是否侵蚀现金安全垫</p>
            <span className={`met-finance-judgment-badge is-${report.judgment3 === '正常' ? '通过' : '预警'}`}>
              {report.judgment3}
            </span>
            <p className="met-finance-judgment-item__note">{report.judgment3Note}</p>
          </article>
        </div>
      </section>
    </div>
  );

  const renderTableBody = () => {
    if (segment === 'reports') return renderReports();

    if (segment === 'payments') {
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="met-finance-col-code">支付 / 订单</th>
              <th>会员</th>
              <th>产品</th>
              <th className="met-finance-col-amount">实收金额</th>
              <th>支付方式</th>
              <th className="met-finance-col-status">合同</th>
              <th className="met-finance-col-status">资产</th>
              <th className="met-finance-col-status">财务状态</th>
              <th className="met-finance-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.payments.map(p => (
              <tr key={p.id} className={rowClass(p.id)} onClick={() => onOpenEntity('payment', p.id)}>
                <td className="met-finance-col-code">
                  <CellCode primary={p.payNo} secondary={p.orderNo} />
                </td>
                <td>
                  {p.memberName}
                  <span className="met-finance-table__muted"> {p.phoneMask}</span>
                </td>
                <td>{p.productName}</td>
                <td className="met-finance-col-amount">
                  <CellAmount value={p.amount} />
                </td>
                <td>{p.payMethod}</td>
                <td className="met-finance-col-status"><Chip text={p.contractStatus} /></td>
                <td className="met-finance-col-status"><Chip text={p.assetStatus} /></td>
                <td className="met-finance-col-status"><Chip text={p.financeStatus} /></td>
                <RowActions type="payment" id={p.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'refunds') {
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="met-finance-col-code">退款 / 订单</th>
              <th>会员</th>
              <th>产品</th>
              <th className="met-finance-col-amount">申请金额</th>
              <th className="met-finance-col-amount">可退金额</th>
              <th className="met-finance-col-status">资产处理</th>
              <th className="met-finance-col-status">审批状态</th>
              <th>风险原因</th>
              <th className="met-finance-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.refunds.map(r => (
              <tr key={r.id} className={rowClass(r.id)} onClick={() => onOpenEntity('refund', r.id)}>
                <td className="met-finance-col-code">
                  <CellCode primary={r.refundNo} secondary={r.orderNo} />
                </td>
                <td>
                  {r.memberName}
                  <span className="met-finance-table__muted"> {r.phoneMask}</span>
                </td>
                <td>{r.productName}</td>
                <td className="met-finance-col-amount">
                  <CellAmount value={r.applyAmount} />
                </td>
                <td className="met-finance-col-amount">
                  <CellAmount value={r.refundableAmount} />
                </td>
                <td className="met-finance-col-status"><Chip text={r.assetAction} /></td>
                <td className="met-finance-col-status"><Chip text={r.approvalStatus} /></td>
                <td>{r.riskReason}</td>
                <RowActions type="refund" id={r.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'consumption') {
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="met-finance-col-code">耗课记录</th>
              <th className="met-finance-col-date">日期</th>
              <th>会员</th>
              <th>课程</th>
              <th>老师</th>
              <th>门店</th>
              <th>扣点 / 次数</th>
              <th className="met-finance-col-amount">确认收入</th>
              <th>资产来源</th>
              <th className="met-finance-col-status">状态</th>
              <th className="met-finance-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.consumptions.map(c => (
              <tr key={c.id} className={rowClass(c.id)} onClick={() => onOpenEntity('consumption', c.id)}>
                <td className="met-finance-col-code">
                  <span className="met-finance-cell-code__primary">{c.recordNo}</span>
                </td>
                <td className="met-finance-col-date">{formatFinanceDate(c.date)}</td>
                <td>{c.memberName}</td>
                <td>{c.courseName}</td>
                <td>{c.teacherName}</td>
                <td>{c.storeName}</td>
                <td>{c.deductLabel}</td>
                <td className="met-finance-col-amount">
                  <CellAmount value={c.recognizedRevenue} />
                </td>
                <td>{c.assetSource}</td>
                <td className="met-finance-col-status"><Chip text={c.status} /></td>
                <RowActions type="consumption" id={c.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'teacherFees') {
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="met-finance-col-code">课时记录</th>
              <th className="met-finance-col-date">日期</th>
              <th>老师</th>
              <th>课程</th>
              <th>门店</th>
              <th>课型</th>
              <th>到课</th>
              <th className="met-finance-col-amount">课时费</th>
              <th className="met-finance-col-status">结算状态</th>
              <th className="met-finance-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.teacherFees.map(t => (
              <tr key={t.id} className={rowClass(t.id)} onClick={() => onOpenEntity('teacherFee', t.id)}>
                <td className="met-finance-col-code">
                  <span className="met-finance-cell-code__primary">{t.sessionNo}</span>
                </td>
                <td className="met-finance-col-date">{formatFinanceDate(t.date)}</td>
                <td>{t.teacherName}</td>
                <td>{t.courseName}</td>
                <td>{t.storeName}</td>
                <td>{t.classType}</td>
                <td>{t.attendeeCount}</td>
                <td className="met-finance-col-amount">
                  <CellAmount value={t.feeAmount} />
                </td>
                <td className="met-finance-col-status"><Chip text={t.status} /></td>
                <RowActions type="teacherFee" id={t.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (segment === 'settlements') {
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="met-finance-col-code">结算编号</th>
              <th>消课门店</th>
              <th>售卡门店</th>
              <th>会员</th>
              <th>产品</th>
              <th>点数</th>
              <th className="met-finance-col-amount">结算金额</th>
              <th>结算规则</th>
              <th className="met-finance-col-status">状态</th>
              <th className="met-finance-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.settlements.map(x => (
              <tr key={x.id} className={rowClass(x.id)} onClick={() => onOpenEntity('settlement', x.id)}>
                <td className="met-finance-col-code">
                  <span className="met-finance-cell-code__primary">{x.settlementNo}</span>
                </td>
                <td>{x.consumeStore}</td>
                <td>{x.sellStore}</td>
                <td>{x.memberName}</td>
                <td>{x.productName}</td>
                <td>{x.points}</td>
                <td className="met-finance-col-amount">
                  <CellAmount value={x.amount} />
                </td>
                <td>{x.ruleLabel}</td>
                <td className="met-finance-col-status"><Chip text={x.status} /></td>
                <RowActions type="settlement" id={x.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className={tableClass}>
        <thead>
          <tr>
            <th className="met-finance-col-code">支出 / 日期</th>
            <th>门店</th>
            <th>类目</th>
            <th className="met-finance-col-amount">金额</th>
            <th className="met-finance-col-status">付款</th>
            <th>经办人</th>
            <th className="met-finance-col-status">凭证</th>
            <th className="met-finance-col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.expenses.map(row => (
            <tr key={row.id} className={rowClass(row.id)} onClick={() => onOpenEntity('expense', row.id)}>
              <td className="met-finance-col-code">
                <CellCode primary={row.expenseNo} secondary={formatFinanceDate(row.date)} />
              </td>
              <td>{row.storeName}</td>
              <td>{row.category}</td>
              <td className="met-finance-col-amount">
                <CellAmount value={row.amount} />
              </td>
              <td className="met-finance-col-status"><Chip text={row.payStatus} /></td>
              <td>{row.operator}</td>
              <td className="met-finance-col-status"><Chip text={row.voucherStatus} /></td>
              <RowActions type="expense" id={row.id} onOpenEntity={onOpenEntity} onViewChain={onViewChain} />
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className="met-finance-list-card met-today-surface">
      <header className="met-finance-list-card__head">
        <h2>财务核对工作台</h2>
        <p className="met-finance-list-card__hint">{FINANCE_SEGMENT_HINTS[segment]}</p>
        <div className="met-finance-segments" role="tablist">
          {FINANCE_WORKBENCH_SEGMENTS.map(s => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={segment === s.id}
              className={segment === s.id ? 'is-active' : ''}
              onClick={() => onSegmentChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>
      <SegmentMiniSummary segment={segment} snapshot={snapshot} />
      <div className="met-finance-list-card__table-wrap custom-scroll">{renderTableBody()}</div>
    </section>
  );
};

export default FinanceWorkspaceTable;
