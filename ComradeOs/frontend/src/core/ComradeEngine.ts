/**
 * ComradeEngine — Centralized State Aggregator
 * ─────────────────────────────────────────────
 * Reads live data from all active ComradeOS frontend stores and computes
 * five composite intelligence scores that represent the comrade's overall
 * operational status.
 *
 * ✅  Pure frontend — zero backend mutations.
 * ✅  Gracefully degrades when optional modules (schedule, diet, study,
 *     fitness) have not yet been implemented; scores default to neutral.
 * ✅  Singleton pattern — one engine instance for the whole session.
 *
 * Public API:
 *   getComradeState()    → snapshot of all scores + raw module data
 *   updateFromModules()  → re-reads all store data and recomputes scores
 */

// ─── Store imports (existing) ───────────────────────────────────────────────
import { useFinanceStore } from "@/store/financeStore";
import { useVybeStore } from "@/store/vybeStore";

// ─── Module Input Shapes ────────────────────────────────────────────────────
// These interfaces define what each future module should supply to the engine.
// Modules that are not yet built simply pass `undefined` — the engine will
// use sensible neutral defaults so scores never NaN-crash.

export interface ScheduleModuleInput {
  /** 0-1: ratio of tasks completed today vs planned */
  completionRate: number;
  /** Number of overdue items */
  overdueCount: number;
  /** Whether today's schedule was set at all */
  hasSchedule: boolean;
}

export interface DietModuleInput {
  /** Calories consumed today */
  caloriesConsumed: number;
  /** Target calorie intake */
  caloriesTarget: number;
  /** Number of meals logged today */
  mealsLogged: number;
  /** Whether water intake goal was hit (1 = yes, 0 = no) */
  hydratedToday: 0 | 1;
}

export interface StudyModuleInput {
  /** Hours studied today */
  hoursToday: number;
  /** Weekly target study hours */
  weeklyTarget: number;
  /** Hours studied this week */
  weeklyActual: number;
  /** Pending assignments (unprioritised) */
  pendingAssignments: number;
  /** Assignments due within 24 hours */
  urgentAssignments: number;
}

export interface FitnessModuleInput {
  /** Steps today */
  stepsToday: number;
  /** Step goal */
  stepGoal: number;
  /** 0 = no workout, 1 = completed */
  workoutCompleted: 0 | 1;
  /** Consecutive workout days (streak) */
  streakDays: number;
}

// ─── Composite Score Outputs ────────────────────────────────────────────────

export interface ComradeScores {
  /**
   * ENERGY SCORE  [0–100]
   * How well-fuelled and physically active the comrade is.
   * Driven by: diet quality + fitness activity.
   */
  energyScore: number;

  /**
   * MONEY HEALTH  [0–100]
   * How far the comrade's balance stretches until the next HELB injection.
   * Driven by: current balance, daily budget, burn rate, HELB timeline.
   */
  moneyHealth: number;

  /**
   * DISCIPLINE SCORE  [0–100]
   * How well routines and commitments are being maintained.
   * Driven by: schedule completion rate + fitness streak.
   */
  disciplineScore: number;

  /**
   * ACADEMIC PROGRESS  [0–100]
   * How on-track the comrade is with their academic obligations.
   * Driven by: study hours, assignment urgency, weekly targets.
   */
  academicProgress: number;

  /**
   * SURVIVAL PROBABILITY  [0–100]
   * A composite "will they make it?" index derived from all other scores.
   * Heavily weighted toward finance and discipline — the two most critical
   * survival levers for a campus comrade.
   */
  survivalProbability: number;
}

// ─── Full Engine State ───────────────────────────────────────────────────────

export interface ComradeState {
  scores: ComradeScores;

  /** ISO timestamp of the last update */
  lastUpdated: string;

  /** True when any underlying module is still loading */
  isLoading: boolean;

  /** Aggregated warnings from any module */
  warnings: string[];

  /** Raw snapshots that were used to derive the scores */
  rawModuleData: {
    finance: FinanceSnapshot | null;
    schedule: ScheduleModuleInput | null;
    diet: DietModuleInput | null;
    study: StudyModuleInput | null;
    fitness: FitnessModuleInput | null;
  };
}

/** Internal read-only snapshot from the finance store */
interface FinanceSnapshot {
  currentBalance: number;
  dailyBudget: number;
  daysToHelb: number;
  statusMessage: string;
  isOffline: boolean;
  mlDaysRemaining: number | null;
  avgDailySpend: number | null;
  spendingStreakWarning: string | null;
  categoryBreakdown: Record<string, number>;
}

// ─── Score Computation ───────────────────────────────────────────────────────

/**
 * Clamps a value to [0, 100] and rounds to 1 decimal place.
 */
function clamp(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

/**
 * MONEY HEALTH
 *
 * Formula logic:
 *  - Base: ratio of ML-predicted remaining days to daysToHelb  (0→1)
 *  - If ML data unavailable, fall back to balance / (daysToHelb * dailyBudget)
 *  - Penalty if balance < 3-day buffer
 *  - Bonus if spending streak warning is clear
 */
function computeMoneyHealth(finance: FinanceSnapshot | null): number {
  if (!finance) return 50; // neutral default

  const { currentBalance, dailyBudget, daysToHelb, mlDaysRemaining, spendingStreakWarning } = finance;

  let base: number;

  if (mlDaysRemaining !== null && daysToHelb > 0) {
    // ML-informed: what fraction of the way to HELB can we actually make it?
    base = Math.min(mlDaysRemaining / daysToHelb, 1) * 100;
  } else if (dailyBudget > 0 && daysToHelb > 0) {
    // Fallback: raw balance covers how many days?
    const coverableDays = currentBalance / dailyBudget;
    base = Math.min(coverableDays / daysToHelb, 1) * 100;
  } else {
    base = currentBalance > 0 ? 60 : 10;
  }

  // Danger penalty: less than 3 days of budget left
  const threeDayBuffer = dailyBudget * 3;
  if (currentBalance < threeDayBuffer) {
    base -= 20;
  }

  // Mild bonus: no streak warning = disciplined spending
  if (!spendingStreakWarning) {
    base += 5;
  }

  return clamp(base);
}

/**
 * ENERGY SCORE
 *
 * Formula logic:
 *  - Diet component (50%): calorie adherence + hydration bonus
 *  - Fitness component (50%): step completion + workout bonus
 *  - If modules missing → neutral 50 for that half
 */
function computeEnergyScore(
  diet: DietModuleInput | null,
  fitness: FitnessModuleInput | null
): number {
  let dietComponent = 50;
  let fitnessComponent = 50;

  if (diet) {
    const calorieRatio =
      diet.caloriesTarget > 0
        ? Math.min(diet.caloriesConsumed / diet.caloriesTarget, 1.2) // allow slight over
        : 0.5;
    // Ideal at 1.0; penalise both under and over
    const calorieScore = 100 - Math.abs(calorieRatio - 1) * 80;
    const hydrationBonus = diet.hydratedToday === 1 ? 10 : 0;
    dietComponent = clamp(calorieScore + hydrationBonus);
  }

  if (fitness) {
    const stepRatio =
      fitness.stepGoal > 0
        ? Math.min(fitness.stepsToday / fitness.stepGoal, 1)
        : 0.5;
    const workoutBonus = fitness.workoutCompleted === 1 ? 20 : 0;
    fitnessComponent = clamp(stepRatio * 80 + workoutBonus);
  }

  return clamp(dietComponent * 0.5 + fitnessComponent * 0.5);
}

/**
 * DISCIPLINE SCORE
 *
 * Formula logic:
 *  - Schedule completion rate (60%)
 *  - Fitness streak contribution (40%)
 *  - Overdue penalty per item
 */
function computeDisciplineScore(
  schedule: ScheduleModuleInput | null,
  fitness: FitnessModuleInput | null
): number {
  let scheduleComponent = 50;
  let streakComponent = 50;

  if (schedule) {
    const base = schedule.hasSchedule ? schedule.completionRate * 100 : 40;
    const overduePenalty = Math.min(schedule.overdueCount * 8, 40);
    scheduleComponent = clamp(base - overduePenalty);
  }

  if (fitness) {
    // 7-day streak = max; anything above = capped
    streakComponent = clamp(Math.min(fitness.streakDays / 7, 1) * 100);
  }

  return clamp(scheduleComponent * 0.6 + streakComponent * 0.4);
}

/**
 * ACADEMIC PROGRESS
 *
 * Formula logic:
 *  - Weekly study hours completion ratio (50%)
 *  - Daily study effort (30%)
 *  - Assignment urgency penalty (20% cap)
 */
function computeAcademicProgress(study: StudyModuleInput | null): number {
  if (!study) return 50;

  const weeklyRatio =
    study.weeklyTarget > 0
      ? Math.min(study.weeklyActual / study.weeklyTarget, 1)
      : 0.5;

  // Daily: assume 4h/day is the ideal target
  const dailyIdeal = 4;
  const dailyRatio = Math.min(study.hoursToday / dailyIdeal, 1);

  const urgencyPenalty = Math.min(
    study.urgentAssignments * 15 + study.pendingAssignments * 3,
    40
  );

  const raw =
    weeklyRatio * 50 + dailyRatio * 30 + 20 - urgencyPenalty;

  return clamp(raw);
}

/**
 * SURVIVAL PROBABILITY
 *
 * A weighted composite of all four scores.
 * Weights reflect real campus survival priorities:
 *   Money:      35%  — can't survive without funds
 *   Discipline: 25%  — consistency is the differentiator
 *   Academic:   25%  — why you're here
 *   Energy:     15%  — health is multiplicative, not additive
 */
function computeSurvivalProbability(scores: Omit<ComradeScores, "survivalProbability">): number {
  const { moneyHealth, disciplineScore, academicProgress, energyScore } = scores;

  const weighted =
    moneyHealth * 0.35 +
    disciplineScore * 0.25 +
    academicProgress * 0.25 +
    energyScore * 0.15;

  return clamp(weighted);
}

// ─── Warning Aggregator ──────────────────────────────────────────────────────

function collectWarnings(
  finance: FinanceSnapshot | null,
  schedule: ScheduleModuleInput | null,
  study: StudyModuleInput | null,
  scores: ComradeScores
): string[] {
  const warnings: string[] = [];

  if (finance?.spendingStreakWarning) {
    warnings.push(`💸 Finance: ${finance.spendingStreakWarning}`);
  }

  if (finance && finance.currentBalance < finance.dailyBudget * 3) {
    warnings.push("🚨 Critical: Balance below 3-day buffer. Ration mode activated.");
  }

  if (schedule && schedule.overdueCount > 2) {
    warnings.push(`📋 Schedule: ${schedule.overdueCount} overdue tasks piling up.`);
  }

  if (study && study.urgentAssignments > 0) {
    warnings.push(
      `📚 Academic: ${study.urgentAssignments} assignment${study.urgentAssignments > 1 ? "s" : ""} due within 24 hours!`
    );
  }

  if (scores.survivalProbability < 30) {
    warnings.push("☠️ ALERT: Survival probability critically low. Intervention required.");
  } else if (scores.survivalProbability < 50) {
    warnings.push("⚠️ WARNING: Survival probability below safe threshold.");
  }

  return warnings;
}

// ─── Internal State ──────────────────────────────────────────────────────────

let _state: ComradeState = {
  scores: {
    energyScore: 50,
    moneyHealth: 50,
    disciplineScore: 50,
    academicProgress: 50,
    survivalProbability: 50,
  },
  lastUpdated: new Date().toISOString(),
  isLoading: false,
  warnings: [],
  rawModuleData: {
    finance: null,
    schedule: null,
    diet: null,
    study: null,
    fitness: null,
  },
};

// Optional module inputs — updated via updateFromModules()
let _optionalInputs: {
  schedule?: ScheduleModuleInput;
  diet?: DietModuleInput;
  study?: StudyModuleInput;
  fitness?: FitnessModuleInput;
} = {};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the current ComradeState snapshot.
 * Non-reactive; call updateFromModules() first if you need fresh data.
 */
export function getComradeState(): ComradeState {
  return { ..._state };
}

/**
 * Re-reads all active frontend stores and optional module inputs, then
 * recomputes all five scores and warnings.
 *
 * @param optionalInputs  Pass data from any module that has been built.
 *                        Omit keys for modules not yet implemented.
 *
 * @example
 * // Dashboard with only finance data available:
 * updateFromModules();
 *
 * @example
 * // When study module is added:
 * updateFromModules({
 *   study: { hoursToday: 3, weeklyTarget: 20, weeklyActual: 12,
 *            pendingAssignments: 4, urgentAssignments: 1 }
 * });
 */
export function updateFromModules(
  optionalInputs?: Partial<typeof _optionalInputs>
): ComradeState {
  if (optionalInputs) {
    _optionalInputs = { ..._optionalInputs, ...optionalInputs };
  }

  // ── 1. Read Finance Store ────────────────────────────────────────────────
  const financeStoreState = useFinanceStore.getState();

  const finance: FinanceSnapshot = {
    currentBalance: financeStoreState.currentBalance,
    dailyBudget: financeStoreState.dailyBudget,
    daysToHelb: financeStoreState.daysToHelb,
    statusMessage: financeStoreState.statusMessage,
    isOffline: financeStoreState.isOffline,
    mlDaysRemaining: financeStoreState.analytics?.ml_prediction?.days_remaining ?? null,
    avgDailySpend: financeStoreState.analytics?.daily_average_spend ?? null,
    spendingStreakWarning: financeStoreState.analytics?.spending_streak?.warning ?? null,
    categoryBreakdown: financeStoreState.analytics?.category_breakdown ?? {},
  };

  // ── 2. Read Vybe Store (informational only for now) ──────────────────────
  // Vybe spots are not yet factored into any score but are preserved in raw
  // data so future modules (e.g., a social/lifestyle score) can reference them.
  // const vybeStoreState = useVybeStore.getState(); // reserved for future use

  // ── 3. Read optional module inputs ──────────────────────────────────────
  const { schedule = null, diet = null, study = null, fitness = null } = _optionalInputs;

  // ── 4. Compute individual scores ─────────────────────────────────────────
  const moneyHealth = computeMoneyHealth(finance);
  const energyScore = computeEnergyScore(diet, fitness);
  const disciplineScore = computeDisciplineScore(schedule, fitness);
  const academicProgress = computeAcademicProgress(study);
  const survivalProbability = computeSurvivalProbability({
    moneyHealth,
    energyScore,
    disciplineScore,
    academicProgress,
  });

  const scores: ComradeScores = {
    moneyHealth,
    energyScore,
    disciplineScore,
    academicProgress,
    survivalProbability,
  };

  // ── 5. Collect warnings ──────────────────────────────────────────────────
  const warnings = collectWarnings(finance, schedule, study, scores);

  // ── 6. Persist and return ────────────────────────────────────────────────
  _state = {
    scores,
    lastUpdated: new Date().toISOString(),
    isLoading: financeStoreState.isLoading,
    warnings,
    rawModuleData: {
      finance,
      schedule,
      diet,
      study,
      fitness,
    },
  };

  return getComradeState();
}

// ─── Singleton export ────────────────────────────────────────────────────────

/**
 * ComradeEngine — default export as a singleton facade object.
 * Use this from components/hooks for a clean import path.
 *
 * @example
 * import ComradeEngine from '@/core/ComradeEngine';
 * const state = ComradeEngine.updateFromModules();
 */
const ComradeEngine = {
  getComradeState,
  updateFromModules,
} as const;

export default ComradeEngine;
