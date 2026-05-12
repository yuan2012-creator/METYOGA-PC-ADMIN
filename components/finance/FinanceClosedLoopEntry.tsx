import React, { useMemo } from 'react';
import type {
  Contract,
  FinanceLedgerEntry,
  MemberAsset,
  Order,
  Payment,
  Refund,
} from '../../types';
import type {
  ClosedLoopFivePillars,
  ClosedLoopRefundAssetRiskRow,
  FinancePendingItem,
} from '../../utils/financeSelectors';
import { formatMallSensitiveOrderDisplay } from '../../utils/mallSelectors';

export interface FinanceClosedLoopEntryProps {
  dateRangeLabel: string;
  fivePillars: ClosedLoopFivePillars;
  pendingItems: FinancePendingItem[];
  refundAssetRisks: ClosedLoopRefundAssetRiskRow[];
  deferredLiabilityDetailCount: number;
  pendingRecognitionDetailCount: number;
  teacherSessionPayCheckCount: number;
  ledgerPendingWireRowCount: number;
  onNavigateToRevenueDeferred: () => void;
  onNavigateToRevenuePending: () => void;
  onNavigateToRevenueTeacherPay: () => void;
  onNavigateToRevenueLedgerPending: () => void;
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  ledgerEntries: FinanceLedgerEntry[];
}

const fmtMoney = (n: number): string => `¥${Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const paidLike = (p: Payment) => p.status === 'paid' || p.status === 'reconciled';

const ledgerSourceZh = (e: FinanceLedgerEntry): string => {
  const map: Record<FinanceLedgerEntry['sourceType'], string> = {
    payment: '收款（预收负债侧）',
    refund: '退款',
    course_consumption: '耗课 / 待确认收入（模块内估算）',
    payroll: '老师课时费（模块内估算）',
    adjustment: '调整',
  };
  return map[e.sourceType] ?? e.sourceType;
};

const directionZh = (d: FinanceLedgerEntry['direction']): string => {
  const map: Record<FinanceLedgerEntry['direction'], string> = {
    income: '现金流入（非收入）',
    expense: '现金流出',
    liability_increase: '负债增加（预收）',
    liability_decrease: '负债减少（履约 / 消课）',
  };
  return map[d] ?? d;
};

const pickExampleOrder = (
  orders: Order[],
  payments: Payment[],
  ledgerEntries: FinanceLedgerEntry[]
): Order | null => {
  const withLedger = orders.find(o =>
    ledgerEntries.some(l => l.orderId === o.id && l.sourceType === 'payment')
  );
  if (withLedger) return withLedger;
  const withPay = orders.find(o => payments.some(p => p.orderId === o.id && paidLike(p)));
  return withPay ?? orders[0] ?? null;
};

const PILLAR_ROWS: Array<{
  key: keyof ClosedLoopFivePillars;
  label: string;
  hint: string;
}> = [
  {
    key: 'collectedCash',
    label: '实收金额',
    hint: '会员已支付的现金流入，不等于收入',
  },
  {
    key: 'refundRegistered',
    label: '退款金额',
    hint: '已登记退款或待核对退款，不等于财务已完成处理',
  },
  {
    key: 'netCollection',
    label: '净收款',
    hint: '实收减退款后的经营参考值',
  },
  {
    key: 'deferredLiability',
    label: '预收负债',
    hint: '会员已付款但尚未完成课程交付的权益金额',
  },
  {
    key: 'pendingRecognitionIncomeEstimate',
    label: '待确认收入',
    hint: '已发生耗课或到课交付，但尚未进入可核对正式分录链路的收入估算（模块内估算）',
  },
];

const FinanceClosedLoopEntry: React.FC<FinanceClosedLoopEntryProps> = ({
  dateRangeLabel,
  fivePillars,
  pendingItems,
  refundAssetRisks,
  deferredLiabilityDetailCount,
  pendingRecognitionDetailCount,
  teacherSessionPayCheckCount,
  ledgerPendingWireRowCount,
  onNavigateToRevenueDeferred,
  onNavigateToRevenuePending,
  onNavigateToRevenueTeacherPay,
  onNavigateToRevenueLedgerPending,
  orders,
  contracts,
  payments,
  refunds,
  memberAssets,
  ledgerEntries,
}) => {
  const example = useMemo(
    () => pickExampleOrder(orders, payments, ledgerEntries),
    [orders, payments, ledgerEntries]
  );

  const chain = useMemo(() => {
    if (!example) return null;
    const contract =
      contracts.find(c => c.id === example.contractId) ??
      contracts.find(c => c.orderId === example.id);
    const orderPayments = payments.filter(p => p.orderId === example.id);
    const orderAssets = memberAssets.filter(a => a.sourceOrderId === example.id);
    const orderRefunds = refunds.filter(r => r.orderId === example.id);
    const orderLedger = ledgerEntries.filter(l => l.orderId === example.id);
    return { contract, orderPayments, orderAssets, orderRefunds, orderLedger };
  }, [example, contracts, payments, memberAssets, refunds, ledgerEntries]);

  const mainFlowSteps = [
    { n: 1, t: '订单', d: '商品与成交金额起点；后续环节均应对齐订单号。' },
    { n: 2, t: '支付', d: '实收现金流入；形成预收负债，不等于收入。' },
    { n: 3, t: '合同', d: '约束交付与退款口径；与订单、资产关联。' },
    { n: 4, t: '会员资产', d: '权益载体；预约 / 签到从这里扣减额度。' },
    { n: 5, t: '预约 / 签到', d: '履约前置；到课后进入耗课与待确认收入链路。' },
    { n: 6, t: '耗课', d: '交付发生；确认收入需以后续真实耗课记录为准。' },
    { n: 7, t: '待确认收入', d: '模块内估算；待生成正式分录、待接入真实财务分录。' },
    { n: 8, t: '老师课时费', d: '模块内估算；与课表、完课记录对齐，仅用于经营核对。' },
    { n: 9, t: '财务分录', d: '当前为 mock 入口展示；正式总账分录待生成、待接入真实财务分录服务。' },
  ];

  const refundFlowSteps = [
    { n: 1, t: '订单', d: '定位原交易与会员。' },
    { n: 2, t: '支付', d: '核对原收款渠道与金额。' },
    { n: 3, t: '退款', d: '登记与审核；不等于已完成全部财务处理。' },
    { n: 4, t: '资产处理', d: '冻结、冲减或作废权益；需与剩余课包一致。' },
    { n: 5, t: '财务分录', d: '待生成正式分录；待接入真实财务分录。' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 leading-relaxed">
        <p className="font-bold text-amber-950 mb-1">财务闭环入口（只读说明）</p>
        <p>
          本页用于把<strong>订单 → 支付 → 合同 → 会员资产 → 预约 / 签到 → 耗课 → 待确认收入 → 老师课时费 → 财务分录</strong>
          以及<strong>退款并行链路</strong>讲清楚。当前数据均为前端 mock，<strong>不向业务接口写入收款/退款/总账分录实体、不调后端</strong>。
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">闭环总览（只读）</div>
        <p className="text-base text-gray-900 font-medium leading-relaxed">
          订单 → 支付 → 合同 → 会员资产 → 耗课 → 待确认收入 → 老师课时费 → 财务分录
        </p>
        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          收款与预收解决「钱先到哪里」；待确认收入解决「课已交付但分录未闭合」；老师课时费为成本侧<strong>模块内估算</strong>（<strong>不生成工资单</strong>、<strong>不视为费用已闭合</strong>）；财务分录统一<strong>待生成正式分录</strong>、<strong>待接入真实财务分录服务</strong>。全程<strong>仅用于经营核对</strong>。
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h3 className="font-bold text-lg text-gray-900">待处理财务事项</h3>
          <span className="text-xs text-gray-500 font-mono">与查询区间一致：{dateRangeLabel}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          以下列表仅用于经营核对；不涉及真实财务写入，不同步会员经营，不同步财务。
        </p>
        {pendingItems.length === 0 ? (
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500">暂无待处理事项（仍建议按日巡检）。</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingItems.map(item => (
              <div
                key={item.id}
                className={`flex justify-between gap-3 rounded-xl border p-4 ${
                  item.tone === 'refund'
                    ? 'border-red-100 bg-red-50/70'
                    : 'border-blue-100 bg-blue-50/70'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-mono">{item.sourceSummary}</div>
                </div>
                <span className={`text-xs font-bold shrink-0 h-fit px-2 py-1 rounded-lg ${
                  item.tone === 'refund' ? 'text-red-700 bg-white/80' : 'text-blue-700 bg-white/80'
                }`}>
                  {item.actionLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h3 className="font-bold text-lg text-gray-900">五个财务口径（查询区间）</h3>
          <span className="text-xs text-gray-500">{dateRangeLabel}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          下列金额均为<strong>模块内估算</strong>，待接入真实财务分录后以上线口径为准；仅用于经营核对。
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLAR_ROWS.map(row => (
            <div key={row.key} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex flex-col">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">{row.label}</div>
              <div className="text-xl font-bold font-mono text-gray-900 mb-2">{fmtMoney(fivePillars[row.key])}</div>
              <p className="text-[11px] text-gray-600 leading-snug mt-auto">{row.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onNavigateToRevenueDeferred}
          className="text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-black/30 transition"
        >
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">明细入口</div>
          <div className="text-lg font-bold text-gray-900 mt-1">预收负债明细</div>
          <div className="text-2xl font-mono font-bold text-gray-900 mt-2">{deferredLiabilityDetailCount} 条</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            查看已收款未完成交付的权益与预收负债余额（模块内估算）。完整表格在「收入与预收」。
          </p>
          <span className="text-xs font-bold text-blue-600 mt-3 inline-block">打开「收入与预收」并定位 →</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToRevenuePending}
          className="text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-black/30 transition"
        >
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">明细入口</div>
          <div className="text-lg font-bold text-gray-900 mt-1">待确认收入明细</div>
          <div className="text-2xl font-mono font-bold text-gray-900 mt-2">{pendingRecognitionDetailCount} 条</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            查看场次、到课与耗课侧待确认收入（模块内估算）及待生成正式分录说明。完整表格在「收入与预收」。
          </p>
          <span className="text-xs font-bold text-blue-600 mt-3 inline-block">打开「收入与预收」并定位 →</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToRevenueTeacherPay}
          className="text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-black/30 transition"
        >
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">明细入口</div>
          <div className="text-lg font-bold text-gray-900 mt-1">老师课时费核对</div>
          <div className="text-2xl font-mono font-bold text-gray-900 mt-2">{teacherSessionPayCheckCount} 条</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            场次、到课人数与课时费<strong>模块内估算</strong>；<strong>不生成工资单</strong>。完整表格在「收入与预收」。
          </p>
          <span className="text-xs font-bold text-blue-600 mt-3 inline-block">打开「收入与预收」并定位 →</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToRevenueLedgerPending}
          className="text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-black/30 transition"
        >
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">明细入口</div>
          <div className="text-lg font-bold text-gray-900 mt-1">财务分录待接入</div>
          <div className="text-2xl font-mono font-bold text-gray-900 mt-2">{ledgerPendingWireRowCount} 条</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            来源类型、对象与待生成分录说明（模块内估算）。完整表格在「收入与预收」。
          </p>
          <span className="text-xs font-bold text-blue-600 mt-3 inline-block">打开「收入与预收」并定位 →</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-3">主链路（正向履约）</h3>
        <p className="text-xs text-gray-500 mb-4">
          顺序强调资金流、权益与课耗的先后依赖；确认收入需以后续真实耗课记录为准。
        </p>
        <div className="flex flex-wrap gap-2 items-stretch">
          {mainFlowSteps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex-1 min-w-[108px] rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                <div className="text-[10px] font-black text-gray-400 mb-1">步骤 {s.n}</div>
                <div className="text-sm font-bold text-gray-900">{s.t}</div>
                <p className="text-[11px] text-gray-600 mt-2 leading-snug">{s.d}</p>
              </div>
              {i < mainFlowSteps.length - 1 && (
                <div className="hidden sm:flex items-center text-gray-300 text-lg font-bold px-0.5">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-3">退款链路（与正向履约并行）</h3>
        <p className="text-xs text-gray-500 mb-4">
          订单 → 支付 → 退款 → 资产处理 → 财务分录；任一步骤都应对齐订单与会员，仅用于经营核对。
        </p>
        <div className="flex flex-wrap gap-2 items-stretch">
          {refundFlowSteps.map((s, i) => (
            <React.Fragment key={`r-${s.n}`}>
              <div className="flex-1 min-w-[108px] rounded-xl border border-red-50 bg-red-50/40 p-3">
                <div className="text-[10px] font-black text-red-300 mb-1">退款 {s.n}</div>
                <div className="text-sm font-bold text-gray-900">{s.t}</div>
                <p className="text-[11px] text-gray-600 mt-2 leading-snug">{s.d}</p>
              </div>
              {i < refundFlowSteps.length - 1 && (
                <div className="hidden sm:flex items-center text-red-200 text-lg font-bold px-0.5">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-3">退款与资产风险（核对清单）</h3>
        <p className="text-xs text-gray-600 mb-4">
          下列为常见风险模板；命中行来自当前 mock 扫描，未命中时仍须按规则例行核对。
        </p>
        <ul className="space-y-4">
          {refundAssetRisks.map(risk => (
            <li key={risk.id} className="rounded-xl border border-orange-100 bg-white p-4">
              <div className="text-sm font-bold text-gray-900">{risk.title}</div>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-gray-700">
                {risk.detailLines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-2">示例：从一条订单串起关联数据（全量 mock）</h3>
        {!example || !chain ? (
          <p className="text-sm text-gray-500">当前 mock 中暂无可用于演示的订单。</p>
        ) : (
          <div className="space-y-5 text-sm">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">订单</div>
              <p className="text-gray-900 font-medium">{formatMallSensitiveOrderDisplay(example)}</p>
              <p className="text-xs text-gray-500 mt-1">主状态：{example.status}</p>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">合同</div>
              {chain.contract ? (
                <p className="text-gray-800">
                  {chain.contract.title?.trim() || '未命名合同'} · 状态 {chain.contract.status}
                </p>
              ) : (
                <p className="text-gray-500">本单 mock 未挂合同（仅演示缺口）。</p>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">支付</div>
              {chain.orderPayments.length === 0 ? (
                <p className="text-gray-500">暂无支付记录。</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {chain.orderPayments.map(p => (
                    <li key={p.id}>
                      {p.id} · {p.status} · {fmtMoney(p.amount)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">会员资产（来源订单一致）</div>
              {chain.orderAssets.length === 0 ? (
                <p className="text-gray-500">暂无资产记录。</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {chain.orderAssets.map(a => (
                    <li key={a.id}>
                      {a.name} · {a.status} · 剩余权益口径见资产模块（仅用于经营核对）
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">退款（登记）</div>
              {chain.orderRefunds.length === 0 ? (
                <p className="text-gray-500">本单暂无退款登记。</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {chain.orderRefunds.map(r => (
                    <li key={r.id}>
                      {r.id} · {r.status} · {fmtMoney(r.amount)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">耗课 / 待确认收入 / 老师课时费</div>
              <p className="text-gray-600 text-xs leading-relaxed mb-2">
                预约、签到与完课记录在课程运营侧维护；本页将耗课与<strong>待确认收入</strong>（模块内估算）及老师课时费与分录类型对齐：
                <code className="text-[11px] bg-gray-100 px-1 rounded mx-0.5">course_consumption</code>、
                <code className="text-[11px] bg-gray-100 px-1 rounded mx-0.5">payroll</code>。
                正式口径待生成正式分录、待接入真实财务分录。
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">财务分录（mock，同一订单）</div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-600 mb-3 space-y-1">
                <p>· 当前为 <strong>mock / 入口展示</strong>，<strong>尚未生成正式 FinanceLedger</strong>。</p>
                <p>
                  · 后续需由<strong>订单、支付、退款、耗课、老师课时费</strong>等事实数据生成<strong>待生成正式分录</strong>，并<strong>待接入真实财务分录</strong>。
                </p>
                <p>· 下列表格仅为演示占位，仅用于经营核对。</p>
              </div>
              {chain.orderLedger.length === 0 ? (
                <p className="text-gray-500">暂无分录占位。</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold">
                      <tr>
                        <th className="p-2 pl-3">分录 id（演示）</th>
                        <th className="p-2">来源类型</th>
                        <th className="p-2">方向</th>
                        <th className="p-2">金额</th>
                        <th className="p-2 pr-3">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {chain.orderLedger.map(e => (
                        <tr key={e.id} className="text-gray-800">
                          <td className="p-2 pl-3 font-mono">{e.id}</td>
                          <td className="p-2">{ledgerSourceZh(e)}</td>
                          <td className="p-2">{directionZh(e.direction)}</td>
                          <td className="p-2">{fmtMoney(e.amount)}</td>
                          <td className="p-2 pr-3 text-gray-600">{e.description ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceClosedLoopEntry;
