import { formatMoney } from "@/lib/currency";
import { countAccountTypes } from "@/lib/factorEngine";
import { useCurrency } from "@/context/CurrencyContext";
import type { IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";

interface ScoreReportProps {
  intake: IntakeAnswers;
  breakdown: ScoreBreakdown;
}

export function ScoreReport({ intake, breakdown }: ScoreReportProps) {
  const { currency } = useCurrency();
  const printed = new Date().toLocaleString();

  return (
    <div id="score-report" className="score-report hidden print:block">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-neutral-500">
        CreditIQ educational estimate
      </p>
      <h1 className="mt-2 text-3xl font-bold">Score report</h1>
      <p className="mt-1 text-sm text-neutral-600">{printed}</p>

      <p className="mt-8 text-6xl font-bold tabular-nums">{breakdown.score}</p>
      <p className="mt-1 text-lg">
        {breakdown.bandLabel} · 300–850 FICO-style estimate (not a bureau score)
      </p>
      <p className="mt-3 max-w-xl text-sm text-neutral-600">{breakdown.insight}</p>

      <h2 className="mt-10 text-lg font-semibold">Five factors</h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500">
            <th className="py-2">Factor</th>
            <th>Points</th>
            <th>% of max</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.factors.map((factor) => (
            <tr key={factor.key} className="border-t border-neutral-200">
              <td className="py-2">{factor.label}</td>
              <td>
                {factor.points} / {Math.round(factor.maxPoints)}
              </td>
              <td>{factor.percentOfMax}%</td>
              <td>{factor.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-10 text-lg font-semibold">Intake recap</h2>
      <ul className="mt-3 space-y-1 text-sm">
        <li>Credit age: {intake.yearsSinceFirstCredit} years</li>
        <li>Account types: {countAccountTypes(intake)}</li>
        <li>Applications last year: {intake.creditApplicationsLastYear}</li>
        <li>Last missed payment: {intake.lastMissedPayment}</li>
        <li>
          Limit {formatMoney(intake.totalCreditLimit, currency)} · balance{" "}
          {formatMoney(intake.totalCreditBalance, currency)}
        </li>
        <li>
          Income (display only) {formatMoney(intake.annualIncome, currency)}
        </li>
      </ul>

      <p className="mt-10 text-xs text-neutral-500">
        Disclaimer: CreditIQ is a hackathon demo. This number is an educational
        FICO-style estimate, not Equifax, Experian, TransUnion, FICO, or
        VantageScore. It is not credit advice or a promise of approval.
      </p>
    </div>
  );
}

export function printScoreReport() {
  window.print();
}
