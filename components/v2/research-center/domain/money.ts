/**
 * Money helpers for Research Center V2.0.
 * Canonical storage unit in the prototype: integer 元 (yuan).
 * Fen helpers exist for future remote API payloads (1 元 = 100 分).
 */

/** Integer yuan amount (no fractional cents in prototype). */
export type MoneyYuan = number;

/** Integer fen amount for API / accounting interchange. */
export type MoneyFen = number;

export function yuanToFen(yuan: MoneyYuan): MoneyFen {
  return Math.round(Number(yuan) || 0) * 100;
}

export function fenToYuan(fen: MoneyFen): MoneyYuan {
  return Math.round(Number(fen) || 0) / 100;
}

export function assertMoneyYuan(value: unknown, field = 'amount'): MoneyYuan {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${field} 必须为非负整数金额（元）`);
  }
  return Math.round(n);
}

export function nowIso(): string {
  return new Date().toISOString();
}
