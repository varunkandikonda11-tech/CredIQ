import { useState } from "react";
import { Badge7 } from "@/components/ui/cta69-utils/badge7";
import { Button12 } from "@/components/ui/cta69-utils/button12";
import { Surface } from "@/components/ui/surface";
import { useCurrency } from "@/context/CurrencyContext";
import {
  formatMoney,
  fromCanonicalUsd,
  toCanonicalUsd,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  AccountTypes,
  IntakeAnswers,
  MissedPaymentWindow,
  NegativeEventRecency,
} from "@/types/intake";

interface BorrowerIntakeWizardProps {
  initial: IntakeAnswers;
  onSubmit: (answers: IntakeAnswers) => void;
}

const ACCOUNT_OPTIONS: Array<{ key: keyof AccountTypes; label: string }> = [
  { key: "mortgage", label: "Mortgage" },
  { key: "creditCard", label: "Credit Card" },
  { key: "autoLoan", label: "Auto Loan" },
  { key: "studentLoan", label: "Student Loan" },
  { key: "otherLoan", label: "Other Loan" },
  { key: "consumerFinance", label: "Consumer Finance Account" },
];

const MISSED_OPTIONS: Array<{ value: MissedPaymentWindow; label: string }> = [
  { value: "never", label: "Never" },
  { value: "30", label: "Within 30 days" },
  { value: "60", label: "31–60 days ago" },
  { value: "90", label: "61–90 days ago" },
  { value: "120plus", label: "More than 90 days ago" },
];

const NEGATIVE_OPTIONS: Array<{ value: NegativeEventRecency; label: string }> = [
  { value: "none", label: "No negative events" },
  { value: "0-12", label: "Within the last 12 months" },
  { value: "13-24", label: "13–24 months ago" },
  { value: "25plus", label: "More than 2 years ago" },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="block font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </label>
  );
}

function MoneyInput({
  label,
  usdValue,
  onUsdChange,
}: {
  label: string;
  usdValue: number;
  onUsdChange: (usd: number) => void;
}) {
  const { currency } = useCurrency();
  const display = fromCanonicalUsd(usdValue, currency);

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <p className="text-xs text-muted-foreground">
        Entered as {currency === "INR" ? "rupees" : "dollars"} — converted at 1 USD = 96 INR.
      </p>
      <input
        type="number"
        min={0}
        step={currency === "INR" ? 1000 : 100}
        value={Math.round(display)}
        onChange={(event) =>
          onUsdChange(toCanonicalUsd(Number(event.target.value) || 0, currency))
        }
        className="w-full rounded-xl bg-surface-inset px-4 py-3 text-lg font-semibold tabular-nums outline-none ring-1 ring-white/5 focus:ring-primary/50"
      />
      <p className="text-sm text-muted-foreground">{formatMoney(display, currency)}</p>
    </div>
  );
}

function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-white text-black"
              : "bg-surface-inset text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function BorrowerIntakeWizard({
  initial,
  onSubmit,
}: BorrowerIntakeWizardProps) {
  const [answers, setAnswers] = useState<IntakeAnswers>(initial);

  const patch = (partial: Partial<IntakeAnswers>) =>
    setAnswers((current) => ({ ...current, ...partial }));

  return (
    <section className="mx-auto max-w-3xl">
      <Badge7 label="credit score calculator" />
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        What is my credit score?
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Although credit scores are calculated differently by the various credit
        bureaus, you can get an estimate of what your score may be by using this
        calculator. The three main things that help you have a good credit score
        are first, having a long history of making all debt payments on time,
        second using the proper mix of credit, and third not maxing out on
        available credit.
      </p>

      <form
        className="mt-10 space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(answers);
        }}
      >
        <Surface className="space-y-6 rounded-2xl px-6 py-6">
          <FieldLabel>Have you had a credit card or loan for at least 6 months?</FieldLabel>
          <ChoiceRow
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={answers.hasCreditSixMonths ? "yes" : "no"}
            onChange={(next) => patch({ hasCreditSixMonths: next === "yes" })}
          />

          <div className="space-y-2">
            <FieldLabel>
              How many years ago did you get your first credit card or loan? (0 to 120)
            </FieldLabel>
            <input
              type="number"
              min={0}
              max={120}
              step={1}
              value={answers.yearsSinceFirstCredit}
              onChange={(event) =>
                patch({
                  yearsSinceFirstCredit: Math.min(
                    120,
                    Math.max(0, Number(event.target.value) || 0),
                  ),
                })
              }
              className="w-full max-w-xs rounded-xl bg-surface-inset px-4 py-3 text-lg font-semibold tabular-nums outline-none ring-1 ring-white/5 focus:ring-primary/50"
            />
          </div>
        </Surface>

        <Surface className="space-y-4 rounded-2xl px-6 py-6">
          <FieldLabel>
            Check each type of credit account or loan that you have on your credit report, whether open or closed.
          </FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {ACCOUNT_OPTIONS.map((option) => {
              const checked = answers.accountTypes[option.key];
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    patch({
                      accountTypes: {
                        ...answers.accountTypes,
                        [option.key]: !checked,
                      },
                    })
                  }
                  className={cn(
                    "rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    checked
                      ? "bg-white text-black"
                      : "bg-surface-inset text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Surface>

        <Surface className="space-y-6 rounded-2xl px-6 py-6">
          <div className="space-y-2">
            <FieldLabel>How many times have you applied for credit in the last year?</FieldLabel>
            <input
              type="number"
              min={0}
              max={30}
              step={1}
              value={answers.creditApplicationsLastYear}
              onChange={(event) =>
                patch({
                  creditApplicationsLastYear: Math.max(
                    0,
                    Number(event.target.value) || 0,
                  ),
                })
              }
              className="w-full max-w-xs rounded-xl bg-surface-inset px-4 py-3 text-lg font-semibold tabular-nums outline-none ring-1 ring-white/5 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>When did you last miss a payment on any of your credit accounts?</FieldLabel>
            <ChoiceRow
              options={MISSED_OPTIONS}
              value={answers.lastMissedPayment}
              onChange={(lastMissedPayment) => patch({ lastMissedPayment })}
            />
          </div>
        </Surface>

        <Surface className="space-y-6 rounded-2xl px-6 py-6">
          <MoneyInput
            label="Annual income"
            usdValue={answers.annualIncome}
            onUsdChange={(annualIncome) => patch({ annualIncome })}
          />
          <MoneyInput
            label="What is your total credit limit? (Add up the credit limits on all your credit card accounts.)"
            usdValue={answers.totalCreditLimit}
            onUsdChange={(totalCreditLimit) => patch({ totalCreditLimit })}
          />
          <MoneyInput
            label="What is your current total credit balance? (Add up the balances on all your credit card accounts.)"
            usdValue={answers.totalCreditBalance}
            onUsdChange={(totalCreditBalance) => patch({ totalCreditBalance })}
          />
        </Surface>

        <Surface className="space-y-6 rounded-2xl px-6 py-6">
          <FieldLabel>
            Have you ever had any of the following negative events listed on your credit report? (Bankruptcy, foreclosure, repossession of property, tax lien, collection agency referral, or other negative report.)
          </FieldLabel>
          <ChoiceRow
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={answers.hasNegativeEvents ? "yes" : "no"}
            onChange={(next) =>
              patch({
                hasNegativeEvents: next === "yes",
                negativeEventRecency:
                  next === "no" ? "none" : answers.negativeEventRecency === "none"
                    ? "0-12"
                    : answers.negativeEventRecency,
              })
            }
          />

          {answers.hasNegativeEvents ? (
            <div className="space-y-3">
              <FieldLabel>
                If you answered Yes, how long ago did the most recent negative event occur?
              </FieldLabel>
              <ChoiceRow
                options={NEGATIVE_OPTIONS.filter((item) => item.value !== "none")}
                value={answers.negativeEventRecency}
                onChange={(negativeEventRecency) =>
                  patch({ negativeEventRecency })
                }
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No negative events</p>
          )}
        </Surface>

        <div className="flex justify-start pb-8">
          <Button12
            label="Calculate score"
            onClick={() => onSubmit(answers)}
          />
        </div>
      </form>
    </section>
  );
}
