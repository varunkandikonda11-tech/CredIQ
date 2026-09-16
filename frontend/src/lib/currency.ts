export type Currency = "USD" | "INR";

export const FX_USD_TO_INR = 96;
export const CURRENCY_STORAGE_KEY = "creditiq-currency";

export const MONEY_KEYS = [
  "annualIncome",
  "outstandingDebt",
  "loanAmount",
] as const;

export type MoneyKey = (typeof MONEY_KEYS)[number];

export function isMoneyKey(key: string): key is MoneyKey {
  return (MONEY_KEYS as readonly string[]).includes(key);
}

export function fromCanonicalUsd(usd: number, currency: Currency): number {
  return currency === "INR" ? usd * FX_USD_TO_INR : usd;
}

export function toCanonicalUsd(amount: number, currency: Currency): number {
  return currency === "INR" ? amount / FX_USD_TO_INR : amount;
}

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === "INR") {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

export function displayBounds(
  minUsd: number,
  maxUsd: number,
  stepUsd: number,
  currency: Currency,
): { min: number; max: number; step: number } {
  if (currency === "USD") {
    return { min: minUsd, max: maxUsd, step: stepUsd };
  }
  return {
    min: minUsd * FX_USD_TO_INR,
    max: maxUsd * FX_USD_TO_INR,
    step: Math.max(1, stepUsd * FX_USD_TO_INR),
  };
}
