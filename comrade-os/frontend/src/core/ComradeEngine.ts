/**
 * ComradeEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized state aggregation engine for ComradeOS.
 *
 * Responsibilities:
 *  - Pulls live data from the five frontend modules (finance, schedule, diet,
 *    study, fitness) via the existing localStorage-based dataService layer.
 *  - Computes five composite metrics:
 *      • energyScore          — physical & mental readiness (0–100)
 *      • moneyHealth          — financial runway score (0–100)
 *      • disciplineScore      — time + study consistency (0–100)
 *      • academicProgress     — knowledge accumulation proxy (0–100)
 *      • survivalProbability  — holistic week-end survival estimate (0–100)
 *
 * Contracts:
 *  - getComradeState()    → returns the full ComradeState snapshot
 *  - updateFromModules()  → re-reads all modules and recomputes metrics
 *
 * NOTE: This file is PURE FRONTEND. It does NOT touch any backend endpoint,
 * database, or network request. It only reads from dataService helpers which
 * themselves read from localStorage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Raw Module Shapes ────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
}

export interface FinanceModule {
  incomeWeekly: number;
  balance: number;
  expenses: Expense[];
}

export interface ScheduleEntry {
  time: string;
  activity: string;
}

export interface ScheduleModule {
  sleepHours: number;
  studyHours: number;
  freeTimeHours: number;
  optimalSchedule: ScheduleEntry[];
}

export interface Meal {
  id: number;
  name: string;
  cost: number;
  calories: number;
  type: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface DietModule {
  budgetMode: "normal" | "survival";
  meals: Meal[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyQuestion {
  question: string;
  answer: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  summary: string;
  flashcards: Flashcard[];
  questions: StudyQuestion[];
  createdAt: string;
}

export interface StudyModule {
  notes: Note[];
}

export interface SuggestedWorkout {
  type: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
}

export interface FitnessModule {
  lastSleepQuality: number;   // 1–10
  energyLevel: number;        // 1–10
  availableMinutes: number;
  suggestedWorkout: SuggestedWorkout;
}

export interface UserProfile {
  name: string;
  xp: number;
  badges: string[];
}

// ─── Computed Metrics ─────────────────────────────────────────────────────────

export interface ComradeMetrics {
  /**
   * Physical + mental readiness based on sleep quality, energy level, and
   * recommended sleep hours from schedule. Range: 0–100.
   */
  energyScore: number;

  /**
   * Financial runway score — how well the comrade will survive the week
   * given current balance, weekly income, and burn rate. Range: 0–100.
   */
  moneyHealth: number;

  /**
   * Discipline score derived from adherence to study hours, sleep hygiene,
   * and diet consistency. Range: 0–100.
   */
  disciplineScore: number;

  /**
   * Academic progress proxy — counts notes, flashcards, and questions
   * accumulated over time, normalized against a "well-studied" baseline.
   * Range: 0–100.
   */
  academicProgress: number;

  /**
   * Holistic survival probability — composite of money, energy, diet, and
   * discipline. The single most important number. Range: 0–100.
   */
  survivalProbability: number;
}

// ─── Full Aggregated State ────────────────────────────────────────────────────

export interface ComradeState {
  /** Timestamp of the last updateFromModules() call (ISO 8601). */
  lastUpdated: string;

  /** Raw module snapshots. */
  modules: {
    finance: FinanceModule;
    schedule: ScheduleModule;
    diet: DietModule;
    study: StudyModule;
    fitness: FitnessModule;
  };

  /** The logged-in comrade's profile. */
  user: UserProfile;

  /** Computed composite metrics. */
  metrics: ComradeMetrics;
}

// ─── Internal State Cache ─────────────────────────────────────────────────────

let _state: ComradeState | null = null;

// ─── Metric Computation Helpers ───────────────────────────────────────────────

/**
 * clamp(value, min, max) — keeps a number within [min, max].
 */
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * computeEnergyScore
 *
 * Formula:
 *   Base = energyLevel * 10           (0–100)
 *   Bonus from sleep quality:
 *     sleepQuality >= 8 → +10
 *     sleepQuality >= 6 → +5
 *     sleepQuality < 4  → -15
 *   Bonus from recommended sleep hours in schedule:
 *     sleepHours >= 7  → +5
 *     sleepHours < 5   → -10
 *   Diet bonus:
 *     survival mode    → -10 (caloric deficit risk)
 *     daily calories >= 1500 → +5
 */
function computeEnergyScore(
  fitness: FitnessModule,
  schedule: ScheduleModule,
  diet: DietModule
): number {
  let score = fitness.energyLevel * 10;

  // Sleep quality modifier
  if (fitness.lastSleepQuality >= 8) score += 10;
  else if (fitness.lastSleepQuality >= 6) score += 5;
  else if (fitness.lastSleepQuality < 4) score -= 15;

  // Scheduled sleep hours modifier
  if (schedule.sleepHours >= 7) score += 5;
  else if (schedule.sleepHours < 5) score -= 10;

  // Diet modifier
  const dailyCalories = diet.meals.reduce((sum, m) => sum + m.calories, 0);
  if (diet.budgetMode === "survival") score -= 10;
  else if (dailyCalories >= 1500) score += 5;

  return clamp(Math.round(score));
}

/**
 * computeMoneyHealth
 *
 * Formula:
 *   balanceRatio = balance / incomeWeekly       → proportion of income remaining
 *   weeklyBurnRatio = totalExpenses / incomeWeekly
 *
 *   score = balanceRatio * 80 + (1 - weeklyBurnRatio) * 20
 *   Bonus: balance > incomeWeekly (saved surplus)  → +10
 *   Penalty: balance <= 0                          → force 0
 *   Penalty: budget mode survival                  → -10
 */
function computeMoneyHealth(
  finance: FinanceModule,
  diet: DietModule
): number {
  const { incomeWeekly, balance, expenses } = finance;

  if (balance <= 0) return 0;

  const safeIncome = incomeWeekly > 0 ? incomeWeekly : 2000;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const balanceRatio = clamp(balance / safeIncome, 0, 1);
  const burnRatio = clamp(totalExpenses / safeIncome, 0, 1);

  let score = balanceRatio * 80 + (1 - burnRatio) * 20;

  if (balance > safeIncome) score += 10; // surplus savings bonus
  if (diet.budgetMode === "survival") score -= 10; // financial stress indicator

  return clamp(Math.round(score));
}

/**
 * computeDisciplineScore
 *
 * Formula factors:
 *   1. Study adherence: studyHours mapped 0→0%, 2→40%, 4→70%, 6→90%, 8+→100%
 *   2. Sleep hygiene:   sleepHours 7-9 is optimal (full marks = 25 pts)
 *   3. Note activity:  recent notes created (up to last 7 days) → up to 15 pts
 *   4. Diet adherence: having >= 3 distinct meal types → 10 pts
 *
 * Max = 100
 */
function computeDisciplineScore(
  schedule: ScheduleModule,
  study: StudyModule,
  diet: DietModule
): number {
  // 1. Study hours (max 50 pts)
  const studyMap: [number, number][] = [
    [8, 50], [6, 44], [4, 35], [3, 25], [2, 15], [1, 8], [0, 0],
  ];
  let studyPts = 0;
  for (const [threshold, pts] of studyMap) {
    if (schedule.studyHours >= threshold) { studyPts = pts; break; }
  }

  // 2. Sleep hygiene (max 25 pts)
  let sleepPts = 0;
  const sh = schedule.sleepHours;
  if (sh >= 7 && sh <= 9) sleepPts = 25;
  else if (sh >= 6 && sh < 7) sleepPts = 18;
  else if (sh > 9) sleepPts = 15; // over-sleeping
  else if (sh >= 5) sleepPts = 10;
  else sleepPts = 0;

  // 3. Recent note activity — notes created in the past 7 days (max 15 pts)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentNotes = study.notes.filter((n) => {
    try { return new Date(n.createdAt).getTime() >= sevenDaysAgo; }
    catch { return false; }
  }).length;
  const notePts = clamp(recentNotes * 5, 0, 15);

  // 4. Diet variety (max 10 pts)
  const mealTypes = new Set(diet.meals.map((m) => m.type)).size;
  const dietPts = mealTypes >= 3 ? 10 : mealTypes >= 2 ? 5 : 0;

  return clamp(Math.round(studyPts + sleepPts + notePts + dietPts));
}

/**
 * computeAcademicProgress
 *
 * Models academic growth as an accumulation of study artefacts.
 * Baseline "well-studied" comrade targets:
 *   10 notes, 20 flashcards, 10 practice questions.
 *
 * Score weighted as:
 *   notes       → 50% weight
 *   flashcards  → 30% weight
 *   questions   → 20% weight
 *
 * Each component capped at 1.0 (100%) before weighting.
 */
function computeAcademicProgress(study: StudyModule): number {
  const NOTE_TARGET = 10;
  const FC_TARGET = 20;
  const Q_TARGET = 10;

  const totalNotes = study.notes.length;
  const totalFlashcards = study.notes.reduce(
    (sum, n) => sum + (n.flashcards?.length ?? 0),
    0
  );
  const totalQuestions = study.notes.reduce(
    (sum, n) => sum + (n.questions?.length ?? 0),
    0
  );

  const noteRatio = clamp(totalNotes / NOTE_TARGET, 0, 1);
  const fcRatio = clamp(totalFlashcards / FC_TARGET, 0, 1);
  const qRatio = clamp(totalQuestions / Q_TARGET, 0, 1);

  const score = noteRatio * 50 + fcRatio * 30 + qRatio * 20;
  return clamp(Math.round(score));
}

/**
 * computeSurvivalProbability
 *
 * The most important metric — a holistic end-of-week survival estimate.
 *
 * Weighted composite:
 *   moneyHealth         35%  (can't survive without cash)
 *   energyScore         25%  (can't perform without energy)
 *   disciplineScore     25%  (consistency is survival)
 *   academicProgress    15%  (academic standing matters)
 *
 * Hard penalties applied after weighting:
 *   balance <= 0           → cap at 15
 *   energyScore < 20       → cap at 40
 *   budgetMode=survival    → -8 flat
 */
function computeSurvivalProbability(
  metrics: Omit<ComradeMetrics, "survivalProbability">,
  finance: FinanceModule,
  diet: DietModule
): number {
  let score =
    metrics.moneyHealth * 0.35 +
    metrics.energyScore * 0.25 +
    metrics.disciplineScore * 0.25 +
    metrics.academicProgress * 0.15;

  // Hard floor penalties
  if (finance.balance <= 0) return clamp(Math.min(15, score));
  if (metrics.energyScore < 20) score = Math.min(score, 40);
  if (diet.budgetMode === "survival") score -= 8;

  return clamp(Math.round(score));
}

// ─── Module Data Readers ──────────────────────────────────────────────────────

/**
 * Safely reads a key from localStorage, returns null on failure.
 * Mirrors the get() function inside dataService.js without importing it
 * so that ComradeEngine remains an independent, testable module.
 */
function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`comradeos_${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readFinance(): FinanceModule {
  return readStorage<FinanceModule>("finance") ?? {
    incomeWeekly: 2000,
    balance: 2000,
    expenses: [],
  };
}

function readSchedule(): ScheduleModule {
  return readStorage<ScheduleModule>("schedule") ?? {
    sleepHours: 7,
    studyHours: 4,
    freeTimeHours: 5,
    optimalSchedule: [],
  };
}

function readDiet(): DietModule {
  return readStorage<DietModule>("diet") ?? {
    budgetMode: "normal",
    meals: [],
  };
}

function readStudy(): StudyModule {
  return readStorage<StudyModule>("study") ?? { notes: [] };
}

function readFitness(): FitnessModule {
  return readStorage<FitnessModule>("fitness") ?? {
    lastSleepQuality: 7,
    energyLevel: 7,
    availableMinutes: 45,
    suggestedWorkout: { type: "Bodyweight circuit", duration: 20, intensity: "moderate" },
  };
}

function readUser(): UserProfile {
  return readStorage<UserProfile>("user") ?? {
    name: "Comrade",
    xp: 0,
    badges: [],
  };
}

// ─── Core Engine Functions ────────────────────────────────────────────────────

/**
 * updateFromModules()
 *
 * Re-reads all five module stores from localStorage, recomputes all five
 * composite metrics, updates the internal state cache, and returns the
 * fresh ComradeState snapshot.
 *
 * Call this whenever a module dispatches an update (e.g., in useEffect
 * after a reducer action) to keep the engine in sync.
 */
export function updateFromModules(): ComradeState {
  const finance = readFinance();
  const schedule = readSchedule();
  const diet = readDiet();
  const study = readStudy();
  const fitness = readFitness();
  const user = readUser();

  // Compute intermediate metrics (order matters — survival depends on the rest)
  const energyScore = computeEnergyScore(fitness, schedule, diet);
  const moneyHealth = computeMoneyHealth(finance, diet);
  const disciplineScore = computeDisciplineScore(schedule, study, diet);
  const academicProgress = computeAcademicProgress(study);

  const survivalProbability = computeSurvivalProbability(
    { energyScore, moneyHealth, disciplineScore, academicProgress },
    finance,
    diet
  );

  const metrics: ComradeMetrics = {
    energyScore,
    moneyHealth,
    disciplineScore,
    academicProgress,
    survivalProbability,
  };

  _state = {
    lastUpdated: new Date().toISOString(),
    modules: { finance, schedule, diet, study, fitness },
    user,
    metrics,
  };

  return _state;
}

/**
 * getComradeState()
 *
 * Returns the cached ComradeState. If the engine has never been initialised
 * (e.g., on first import before any React render), it calls updateFromModules()
 * to populate the cache first, then returns the result.
 *
 * Subsequent calls return the cached snapshot until updateFromModules() is
 * called again — keeping reads cheap and synchronous.
 */
export function getComradeState(): ComradeState {
  if (_state === null) {
    return updateFromModules();
  }
  return _state;
}

// ─── Convenience Re-exports ───────────────────────────────────────────────────
// These helpers make it easy to consume individual metrics without destructuring
// the full state object.

export function getMetrics(): ComradeMetrics {
  return getComradeState().metrics;
}

export function getEnergyScore(): number {
  return getComradeState().metrics.energyScore;
}

export function getMoneyHealth(): number {
  return getComradeState().metrics.moneyHealth;
}

export function getDisciplineScore(): number {
  return getComradeState().metrics.disciplineScore;
}

export function getAcademicProgress(): number {
  return getComradeState().metrics.academicProgress;
}

export function getSurvivalProbability(): number {
  return getComradeState().metrics.survivalProbability;
}
