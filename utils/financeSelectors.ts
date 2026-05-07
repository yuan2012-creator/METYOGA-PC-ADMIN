import type {
  FinanceLedgerEntry,
  Order,
  Payment,
  Refund,
} from '../types';

const COLLECTED_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];
const PENDING_ORDER_STATUSES: Order['status'][] = ['draft', 'pending_payment', 'paid'];
const PENDING_REFUND_STATUSES: Refund['status'][] = ['requested', 'reviewing', 'approved', 'processing'];

export interface FinanceDateRange {
  start: string;
  end: string;
}

const getDateOnlyTime = (date: string, endOfDay = false): number => (
  new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}+08:00`).getTime()
);

export const isWithinFinanceDateRange = (
  iso: string | undefined,
  dateRange: FinanceDateRange
): boolean => {
  if (!iso) return false;

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp >= getDateOnlyTime(dateRange.start) && timestamp <= getDateOnlyTime(dateRange.end, true);
};

export const filterOrdersByDateRange = (
  orders: Order[],
  dateRange: FinanceDateRange
): Order[] => (
  orders.filter(order => isWithinFinanceDateRange(order.createdAt, dateRange))
);

export const filterPaymentsByDateRange = (
  payments: Payment[],
  dateRange: FinanceDateRange
): Payment[] => (
  payments.filter(payment => (
    isWithinFinanceDateRange(payment.paidAt ?? payment.initiatedAt, dateRange)
  ))
);

export const filterRefundsByDateRange = (
  refunds: Refund[],
  dateRange: FinanceDateRange
): Refund[] => (
  refunds.filter(refund => (
    isWithinFinanceDateRange(refund.completedAt ?? refund.approvedAt ?? refund.requestedAt, dateRange)
  ))
);

export const filterLedgerEntriesByDateRange = (
  entries: FinanceLedgerEntry[],
  dateRange: FinanceDateRange
): FinanceLedgerEntry[] => (
  entries.filter(entry => isWithinFinanceDateRange(entry.occurredAt, dateRange))
);

export const sumPayments = (payments: Payment[]): number => (
  payments
    .filter(payment => COLLECTED_PAYMENT_STATUSES.includes(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0)
);

export const sumRefunds = (
  refunds: Refund[],
  statuses?: Refund['status'][]
): number => (
  refunds
    .filter(refund => !statuses || statuses.includes(refund.status))
    .reduce((sum, refund) => sum + refund.amount, 0)
);

export const sumLedgerByDirection = (
  entries: FinanceLedgerEntry[],
  direction: FinanceLedgerEntry['direction']
): number => (
  entries
    .filter(entry => entry.direction === direction)
    .reduce((sum, entry) => sum + entry.amount, 0)
);

export const sumRecognizedIncome = (entries: FinanceLedgerEntry[]): number => (
  sumLedgerByDirection(entries, 'liability_decrease')
);

export const countOrders = (orders: Order[]): number => orders.length;

export const countPayments = (payments: Payment[]): number => payments.length;

export const countRefunds = (refunds: Refund[]): number => refunds.length;

export const countPendingOrders = (orders: Order[]): number => (
  orders.filter(order => PENDING_ORDER_STATUSES.includes(order.status)).length
);

export const countPendingRefunds = (refunds: Refund[]): number => (
  refunds.filter(refund => PENDING_REFUND_STATUSES.includes(refund.status)).length
);

export const getPendingRefunds = (refunds: Refund[]): Refund[] => (
  refunds.filter(refund => PENDING_REFUND_STATUSES.includes(refund.status))
);

export const getPendingOrders = (orders: Order[]): Order[] => (
  orders.filter(order => PENDING_ORDER_STATUSES.includes(order.status))
);
