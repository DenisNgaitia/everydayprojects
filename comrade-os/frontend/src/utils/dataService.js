// localStorage-based data service
// Replaces the Express + MongoDB backend entirely

function get(key) {
    try {
        const data = localStorage.getItem(`comradeos_${key}`);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function set(key, data) {
    localStorage.setItem(`comradeos_${key}`, JSON.stringify(data));
}

// ─── User ────────────────────────────────────────────
export function getUser() {
    return get('user') || { name: 'Comrade', xp: 0, badges: [] };
}

export function addXP(amount) {
    const user = getUser();
    user.xp += amount;
    // Award badges at milestones
    if (user.xp >= 100 && !user.badges.includes('Disciplined Comrade')) {
        user.badges.push('Disciplined Comrade');
    }
    if (user.xp >= 500 && !user.badges.includes('Campus Legend')) {
        user.badges.push('Campus Legend');
    }
    if (user.xp >= 1000 && !user.badges.includes('Comrade Supreme')) {
        user.badges.push('Comrade Supreme');
    }
    set('user', user);
    return user;
}

export function updateUserName(name) {
    const user = getUser();
    user.name = name;
    set('user', user);
    return user;
}

// ─── Finance ─────────────────────────────────────────
export function getFinance() {
    return get('finance') || { incomeWeekly: 2000, balance: 2000, expenses: [] };
}

export function addExpense(category, amount) {
    const finance = getFinance();
    finance.expenses.push({
        id: Date.now(),
        category,
        amount: Number(amount),
        date: new Date().toISOString()
    });
    finance.balance -= Number(amount);
    set('finance', finance);
    addXP(5);
    return finance;
}

export function setIncome(incomeWeekly) {
    const finance = getFinance();
    finance.incomeWeekly = Number(incomeWeekly);
    set('finance', finance);
    return finance;
}

export function updateBalance(newBalance) {
    const finance = getFinance();
    finance.balance = newBalance;
    set('finance', finance);
    return finance;
}

export function resetWeeklyFinance() {
    const finance = getFinance();
    finance.balance = finance.incomeWeekly;
    finance.expenses = [];
    set('finance', finance);
    return finance;
}

// ─── Schedule ────────────────────────────────────────
export function getSchedule() {
    return get('schedule') || {
        sleepHours: 7, studyHours: 4, freeTimeHours: 5,
        optimalSchedule: []
    };
}

export function updateSchedule(sleepHours, studyHours, freeTimeHours) {
    const schedule = getSchedule();
    if (sleepHours !== undefined) schedule.sleepHours = sleepHours;
    if (studyHours !== undefined) schedule.studyHours = studyHours;
    if (freeTimeHours !== undefined) schedule.freeTimeHours = freeTimeHours;
    set('schedule', schedule);
    addXP(5);
    return schedule;
}

// ─── Diet ────────────────────────────────────────────
import { survivalMeals, normalMeals } from './seedData';

export function getDiet() {
    return get('diet') || { budgetMode: 'normal', meals: normalMeals };
}

export function setDietMode(mode) {
    const diet = getDiet();
    diet.budgetMode = mode;
    diet.meals = mode === 'survival' ? survivalMeals : normalMeals;
    set('diet', diet);
    addXP(5);
    return diet;
}

// ─── Study — Subjects / Topics / Notes ───────────────────────────────────────

/**
 * Data shape (stored under comradeos_study):
 * {
 *   subjects: [{ id, name, color, createdAt }],
 *   topics:   [{ id, subjectId, name, completed, createdAt }],
 *   notes:    [{
 *     id, subjectId, topicId, title, content, tags[],
 *     summary, flashcards[], questions[],
 *     completed, createdAt, updatedAt
 *   }]
 * }
 */
export function getStudy() {
    const raw = get('study') || {};
    return {
        subjects: raw.subjects || [],
        topics:   raw.topics   || [],
        notes:    raw.notes    || [],
    };
}

function saveStudy(study) {
    set('study', study);
}

// ── Subjects ──────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
    '#00e5ff', '#ff2bd6', '#8b5cf6', '#39ff14', '#ffe500', '#ff6b35',
];

export function addSubject(name) {
    const study = getStudy();
    const idx = study.subjects.length % SUBJECT_COLORS.length;
    const subject = {
        id: Date.now(),
        name: name.trim(),
        color: SUBJECT_COLORS[idx],
        createdAt: new Date().toISOString(),
    };
    study.subjects.push(subject);
    saveStudy(study);
    addXP(5);
    return study;
}

export function deleteSubject(subjectId) {
    const study = getStudy();
    study.subjects = study.subjects.filter(s => s.id !== subjectId);
    study.topics = study.topics.filter(t => t.subjectId !== subjectId);
    study.notes  = study.notes.filter(n => n.subjectId !== subjectId);
    saveStudy(study);
    return study;
}

// ── Topics ────────────────────────────────────────────────────────────────────

export function addTopic(subjectId, name) {
    const study = getStudy();
    const topic = {
        id: Date.now(),
        subjectId,
        name: name.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
    };
    study.topics.push(topic);
    saveStudy(study);
    addXP(5);
    return study;
}

export function toggleTopicComplete(topicId) {
    const study = getStudy();
    study.topics = study.topics.map(t =>
        t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    saveStudy(study);
    return study;
}

export function deleteTopic(topicId) {
    const study = getStudy();
    study.topics = study.topics.filter(t => t.id !== topicId);
    study.notes  = study.notes.filter(n => n.topicId !== topicId);
    saveStudy(study);
    return study;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function addNote(title, content, { subjectId = null, topicId = null, tags = [] } = {}) {
    const study = getStudy();
    const summary = `Summary of "${title}": ${content.substring(0, 120)}...`;
    const flashcards = [
        { front: `What is the main idea of ${title}?`, back: content.split('.')[0] || content.substring(0, 80) },
        { front: `Explain a key concept from "${title}"`, back: content.split('.')[1] || 'Review your notes for details.' },
    ];
    const questions = [
        { question: `Explain the concept of ${title}`, answer: `Based on your notes: ${content.substring(0, 100)}...` },
        { question: `What are the key takeaways from ${title}?`, answer: 'Review the flashcards above for a quick summary.' },
    ];
    study.notes.unshift({
        id: Date.now(),
        subjectId,
        topicId,
        title,
        content,
        tags,
        summary,
        flashcards,
        questions,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    saveStudy(study);
    addXP(20);
    return study;
}

export function updateNote(noteId, { title, content, tags, completed }) {
    const study = getStudy();
    study.notes = study.notes.map(n => {
        if (n.id !== noteId) return n;
        const updated = { ...n, updatedAt: new Date().toISOString() };
        if (title     !== undefined) updated.title     = title;
        if (content   !== undefined) {
            updated.content = content;
            updated.summary = `Summary of "${updated.title}": ${content.substring(0, 120)}...`;
        }
        if (tags      !== undefined) updated.tags      = tags;
        if (completed !== undefined) updated.completed = completed;
        return updated;
    });
    saveStudy(study);
    return study;
}

export function toggleNoteComplete(noteId) {
    const study = getStudy();
    study.notes = study.notes.map(n =>
        n.id === noteId ? { ...n, completed: !n.completed } : n
    );
    saveStudy(study);
    return study;
}

export function deleteNote(noteId) {
    const study = getStudy();
    study.notes = study.notes.filter(n => n.id !== noteId);
    saveStudy(study);
    return study;
}


// ─── Fitness ─────────────────────────────────────────
export function getFitness() {
    return get('fitness') || {
        lastSleepQuality: 7, energyLevel: 7, availableMinutes: 45,
        suggestedWorkout: { type: 'Bodyweight circuit', duration: 20, intensity: 'moderate' }
    };
}

export function updateFitness(sleepQuality, energyLevel, availableMinutes) {
    const fitness = getFitness();
    if (sleepQuality !== undefined) fitness.lastSleepQuality = sleepQuality;
    if (energyLevel !== undefined) fitness.energyLevel = energyLevel;
    if (availableMinutes !== undefined) fitness.availableMinutes = availableMinutes;

    // Suggest workout based on inputs
    if (energyLevel < 4 || sleepQuality < 4) {
        fitness.suggestedWorkout = { type: 'Stretching / Yoga', duration: 15, intensity: 'low' };
    } else if (availableMinutes < 30) {
        fitness.suggestedWorkout = { type: 'HIIT (15 min)', duration: 15, intensity: 'high' };
    } else if (energyLevel > 7 && availableMinutes >= 45) {
        fitness.suggestedWorkout = { type: 'Full Body Strength', duration: 50, intensity: 'high' };
    } else {
        fitness.suggestedWorkout = { type: 'Bodyweight Circuit', duration: 30, intensity: 'moderate' };
    }

    set('fitness', fitness);
    addXP(10);
    return fitness;
}

// ─── Load All Data ───────────────────────────────────────────────────────────
export function getAllData() {
    return {
        user: getUser(),
        finance: getFinance(),
        schedule: getSchedule(),
        diet: getDiet(),
        study: getStudy(),
        fitness: getFitness()
    };
}

// ─── Survival Calculator ─────────────────────────────────────────────────────

/**
 * calculateSurvivalDays(balance, expenses)
 *
 * Given the current balance and an array of expense objects, computes:
 *   - dailyAverage  : average KES spent per day across the recorded period
 *   - survivalDays  : projected days until balance hits zero at current burn rate
 *   - weeklyBurnRate: total of all recorded expenses
 *   - categoryTotals: { [category]: totalAmount } map
 *   - dailyBreakdown: array of { date, total } objects for charting
 *
 * All arithmetic is purely functional — no side effects, no storage writes.
 *
 * @param {number} balance  - current account balance in KES
 * @param {Array}  expenses - array of { id, category, amount, date } objects
 * @returns {Object}
 */
export function calculateSurvivalDays(balance, expenses) {
    if (!expenses || expenses.length === 0) {
        return {
            dailyAverage: 0,
            survivalDays: balance > 0 ? Infinity : 0,
            weeklyBurnRate: 0,
            categoryTotals: {},
            dailyBreakdown: [],
        };
    }

    // ── Category totals ──────────────────────────────────────────────────
    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    // ── Daily breakdown ──────────────────────────────────────────────────
    // Group expenses by calendar date (YYYY-MM-DD)
    const byDay = expenses.reduce((acc, exp) => {
        const day = exp.date ? exp.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
        acc[day] = (acc[day] || 0) + exp.amount;
        return acc;
    }, {});

    // Sort days chronologically and build an array for charting
    const dailyBreakdown = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({ date, total }));

    // ── Daily average ────────────────────────────────────────────────────
    // Use unique day count so a single day of heavy spending doesn't skew
    const uniqueDays = dailyBreakdown.length;
    const weeklyBurnRate = expenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyAverage = uniqueDays > 0 ? weeklyBurnRate / uniqueDays : 0;

    // ── Survival projection ──────────────────────────────────────────────
    const survivalDays = dailyAverage > 0
        ? Math.floor(balance / dailyAverage)
        : balance > 0 ? 999 : 0;

    return {
        dailyAverage: Math.round(dailyAverage),
        survivalDays,
        weeklyBurnRate,
        categoryTotals,
        dailyBreakdown,
    };
}
