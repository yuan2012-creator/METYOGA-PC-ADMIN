/**
 * 财务域只读 adapter：snake_case → camelCase；mock 安全兜底；不修改入参对象、无副作用。
 * 口径：模块内估算、待核对、待接入真实财务分录；不推断已入账或已完成真实结算。
 */

import { adaptConsumption, adaptConsumptions } from './courseAdapter';
import { adaptOrder, adaptOrders, adaptPayment, adaptPayments } from './mallAdapter';
import type { MockCourseConsumptionRecord } from '../types';

export { adaptConsumption as adaptFinanceConsumption, adaptConsumptions as adaptFinanceConsumptions };
export const adaptFinancePayment = adaptPayment;
export const adaptFinancePayments = adaptPayments;
export const adaptFinanceOrder = adaptOrder;
export const adaptFinanceOrders = adaptOrders;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v;
  return fallback;
}

function pickNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

/** 财务只读摘要（前端模块内估算；不表示已入账或已同步真实财务） */
export interface FinanceReadonlySummary {
  /** 口径与用途说明 */
  scopeNote: string;
  /** 分录与系统接入说明 */
  ledgerIntegrationNote: string;
  /** 当前 mock 支付条数（待核对） */
  paymentCount: number;
  /** 当前 mock 订单条数（待核对） */
  orderCount: number;
  /** 支付流水金额模块内估算合计（待核对；非确认收入） */
  estimatedPaymentAmountTotal: number;
  /** 耗课条数占位（待接入耗课只读来源；当前为 0） */
  estimatedConsumptionRecordCount: number;
}

const SUMMARY_KEY_MAP: Record<string, string> = {
  scope_note: 'scopeNote',
  ledger_integration_note: 'ledgerIntegrationNote',
  payment_count: 'paymentCount',
  order_count: 'orderCount',
  estimated_payment_amount_total: 'estimatedPaymentAmountTotal',
  estimated_consumption_record_count: 'estimatedConsumptionRecordCount',
};

function normalizeKeys(raw: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(map)) {
    if (snake in out && !(camel in out)) {
      out[camel] = out[snake];
    }
  }
  return out;
}

const DEFAULT_SCOPE_NOTE =
  '本摘要为模块内估算数据，仅供经营核对；待接入真实财务分录后再对齐口径。';

const DEFAULT_LEDGER_NOTE =
  '正式记账、对账与收入确认待接入真实财务系统；当前未同步财务、未生成正式分录。';

export function adaptFinanceReadonlySummary(raw: unknown): FinanceReadonlySummary {
  const base: FinanceReadonlySummary = {
    scopeNote: DEFAULT_SCOPE_NOTE,
    ledgerIntegrationNote: DEFAULT_LEDGER_NOTE,
    paymentCount: 0,
    orderCount: 0,
    estimatedPaymentAmountTotal: 0,
    estimatedConsumptionRecordCount: 0,
  };

  if (!isRecord(raw)) return base;

  const n = normalizeKeys(raw, SUMMARY_KEY_MAP) as Partial<FinanceReadonlySummary>;
  return {
    scopeNote: pickStr(n.scopeNote, base.scopeNote),
    ledgerIntegrationNote: pickStr(n.ledgerIntegrationNote, base.ledgerIntegrationNote),
    paymentCount: pickNum(n.paymentCount, 0),
    orderCount: pickNum(n.orderCount, 0),
    estimatedPaymentAmountTotal: pickNum(n.estimatedPaymentAmountTotal, 0),
    estimatedConsumptionRecordCount: pickNum(n.estimatedConsumptionRecordCount, 0),
  };
}
