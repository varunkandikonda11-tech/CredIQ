import { getRiskTier } from "@/lib/riskScore";
import type { IntakeAnswers, MissedPaymentWindow } from "@/types/intake";
import type {
  FactorKey,
  FactorScore,
  ScoreBand,
  ScoreBreakdown,
} from "@/types/score";

const MAX_TOTAL = 550;
const BASE_SCORE = 300;

export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  paymentHistory: 0.35,
  utilization: 0.3,
  creditAge: 0.15,
  creditMix: 0.1,
  newCredit: 0.1,
};

export const FACTOR_LABELS: Record<FactorKey, string> = {
  paymentHistory: "Payment History",
  utilization: "Credit Utilization",
  creditAge: "Credit Age",
  creditMix: "Credit Mix",
  newCredit: "New Credit",
};

export const ACCOUNT_TYPE_ORDER: Array<keyof IntakeAnswers["accountTypes"]> = [
  "creditCard",
  "autoLoan",
  "mortgage",
  "studentLoan",
  "otherLoan",
  "consumerFinance",
];

const MISSED_RATIO: Record<MissedPaymentWindow, number> = {
  never: 0.94,
  "30": 0.72,
  "60": 0.52,
  "90": 0.36,
  "120plus": 0.2,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(points: Array<[number, number]>, x: number) {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1];
    const [x0, y0] = points[i];
    if (x <= x0) {
      const t = (x - x1) / (x0 - x1 || 1);
      return y1 + (y0 - y1) * t;
    }
  }
  return points[points.length - 1][1];
}

function paymentRatio(intake: IntakeAnswers) {
  let ratio = MISSED_RATIO[intake.lastMissedPayment];
  if (intake.hasNegativeEvents) {
    if (intake.negativeEventRecency === "0-12") ratio *= 0.52;
    else if (intake.negativeEventRecency === "13-24") ratio *= 0.74;
    else ratio *= 0.86;
  }
  return clamp(ratio, 0, 1);
}

function utilizationRatio(intake: IntakeAnswers) {
  const limit = Math.max(0, intake.totalCreditLimit);
  if (limit <= 0) return 0.32;
  const util = Math.max(0, intake.totalCreditBalance) / limit;
  return interpolate(
    [
      [0, 0.9],
      [0.01, 0.98],
      [0.09, 1],
      [0.3, 0.54],
      [0.5, 0.34],
      [0.75, 0.16],
      [1, 0.07],
      [1.5, 0.03],
    ],
    util,
  );
}

function creditAgeRatio(intake: IntakeAnswers) {
  if (!intake.hasCreditSixMonths) return 0.16;
  return interpolate(
    [
      [0, 0.2],
      [0.5, 0.3],
      [1, 0.4],
      [3, 0.54],
      [6, 0.7],
      [10, 0.84],
      [15, 0.94],
      [25, 1],
    ],
    intake.yearsSinceFirstCredit,
  );
}

export function countAccountTypes(intake: IntakeAnswers) {
  return ACCOUNT_TYPE_ORDER.filter((key) => intake.accountTypes[key]).length;
}

function mixRatio(intake: IntakeAnswers) {
  const count = countAccountTypes(intake);
  return interpolate(
    [
      [0, 0.12],
      [1, 0.44],
      [2, 0.64],
      [3, 0.82],
      [4, 0.93],
      [5, 1],
      [6, 1],
    ],
    count,
  );
}

function newCreditRatio(intake: IntakeAnswers) {
  return interpolate(
    [
      [0, 1],
      [1, 0.86],
      [2, 0.72],
      [3, 0.56],
      [4, 0.4],
      [6, 0.24],
      [10, 0.12],
    ],
    Math.max(0, intake.creditApplicationsLastYear),
  );
}

function summarize(key: FactorKey, intake: IntakeAnswers, percent: number) {
  switch (key) {
    case "paymentHistory":
      if (intake.hasNegativeEvents) {
        return "Negative items on file are weighing this factor down.";
      }
      if (intake.lastMissedPayment === "never") {
        return `${percent}% of this factor — on-time payments look strong.`;
      }
      return "Recent missed payments are pulling this factor down.";
    case "utilization": {
      const limit = intake.totalCreditLimit;
      const util =
        limit > 0
          ? Math.round((intake.totalCreditBalance / limit) * 100)
          : 0;
      const zone =
        util <= 9
          ? "1–9% is the strongest zone."
          : util <= 30
            ? "Under 30% is healthy; under 10% is strongest."
            : "Over 30% cuts this factor quickly; 100% is near the floor.";
      return `Balance vs limit is ${util}%. ${zone}`;
    }
    case "creditAge":
      return intake.hasCreditSixMonths
        ? `First account opened about ${intake.yearsSinceFirstCredit} years ago. Age only moves with time.`
        : "Thin file — less than 6 months of credit history, so this factor starts low.";
    case "creditMix":
      return `${countAccountTypes(intake)} account type(s) on file. Revolving plus installment mixes score higher.`;
    case "newCredit":
      return `${intake.creditApplicationsLastYear} credit application(s) in the last year. Each extra inquiry trims this bar.`;
  }
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 800) return "excellent";
  if (score >= 740) return "veryGood";
  if (score >= 670) return "good";
  if (score >= 580) return "fair";
  return "poor";
}

export function getScoreBandLabel(band: ScoreBand) {
  switch (band) {
    case "excellent":
      return "Excellent";
    case "veryGood":
      return "Very Good";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
    case "poor":
      return "Poor";
  }
}

export function getBandRangeLabel(band: ScoreBand) {
  switch (band) {
    case "poor":
      return "300–579";
    case "fair":
      return "580–669";
    case "good":
      return "670–739";
    case "veryGood":
      return "740–799";
    case "excellent":
      return "800–850";
  }
}

function insightFrom(factors: FactorScore[], bandLabel: string) {
  const weakest = [...factors].sort(
    (a, b) => a.percentOfMax - b.percentOfMax,
  )[0];
  if (!weakest) {
    return `Your credit profile looks ${bandLabel.toLowerCase()}.`;
  }
  if (weakest.percentOfMax >= 80) {
    return `Your credit profile looks ${bandLabel.toLowerCase()}. Keep on-time payments and utilization low.`;
  }
  switch (weakest.key) {
    case "paymentHistory":
      return "Payment history is the weakest factor. On-time payments will lift this the most.";
    case "utilization":
      return "Utilization is high relative to your limits. Paying down revolving balances helps fastest.";
    case "creditAge":
      return "Credit age is still short. Keep older accounts open and wait — time raises this factor.";
    case "creditMix":
      return "A thinner mix of account types is limiting this factor. Responsible variety can help over time.";
    case "newCredit":
      return "Recent applications are weighing on new credit. Pause new inquiries for a few months.";
  }
}

export function computeFactorScores(intake: IntakeAnswers): ScoreBreakdown {
  const ratios: Record<FactorKey, number> = {
    paymentHistory: paymentRatio(intake),
    utilization: utilizationRatio(intake),
    creditAge: creditAgeRatio(intake),
    creditMix: mixRatio(intake),
    newCredit: newCreditRatio(intake),
  };

  const factors: FactorScore[] = (
    Object.keys(FACTOR_WEIGHTS) as FactorKey[]
  ).map((key) => {
    const maxPoints = FACTOR_WEIGHTS[key] * MAX_TOTAL;
    const points = Math.round(maxPoints * ratios[key]);
    const percentOfMax = Math.round((points / maxPoints) * 100);
    return {
      key,
      label: FACTOR_LABELS[key],
      weight: FACTOR_WEIGHTS[key],
      points,
      maxPoints,
      percentOfMax,
      summary: summarize(key, intake, percentOfMax),
    };
  });

  const totalPoints = factors.reduce((sum, factor) => sum + factor.points, 0);
  const score = clamp(BASE_SCORE + totalPoints, 300, 850);
  const band = getScoreBand(score);
  const bandLabel = getScoreBandLabel(band);

  return {
    score,
    band,
    bandLabel,
    insight: insightFrom(factors, bandLabel),
    factors,
  };
}

export function breakdownToRiskTier(score: number) {
  return getRiskTier(score);
}

export function utilizationPercent(intake: IntakeAnswers) {
  if (intake.totalCreditLimit <= 0) return 0;
  return clamp(
    (intake.totalCreditBalance / intake.totalCreditLimit) * 100,
    0,
    150,
  );
}

export function onTimePercent(intake: IntakeAnswers) {
  switch (intake.lastMissedPayment) {
    case "never":
      return 98;
    case "30":
      return 85;
    case "60":
      return 70;
    case "90":
      return 50;
    case "120plus":
      return 30;
  }
}

export function missedFromOnTime(percent: number): MissedPaymentWindow {
  if (percent >= 92) return "never";
  if (percent >= 80) return "30";
  if (percent >= 62) return "60";
  if (percent >= 42) return "90";
  return "120plus";
}
