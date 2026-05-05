import type {
  FinanceLedgerEntry,
  Order,
  Payment,
  Refund,
} from '../types';

const COLLECTED_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];
const PENDING_ORDER_STATUSES: Order['status'][] = ['draft', 'pending_payment', 'paid'];
const PENDING_REFUND_STATUSES: Refund['status'][] = ['requested', 'reviewing', 'approved', 'processing'];

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
