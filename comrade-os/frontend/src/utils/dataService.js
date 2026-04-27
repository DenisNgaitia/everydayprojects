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

// ─── Study ───────────────────────────────────────────
export function getStudy() {
    return get('study') || { notes: [] };
}

export function addNote(title, content) {
    const study = getStudy();
    // Simulate AI summarization
    const summary = `Summary of "${title}": ${content.substring(0, 120)}...`;
    const flashcards = [
        { front: `What is the main idea of ${title}?`, back: content.split('.')[0] || content.substring(0, 80) },
        { front: `Explain a key concept from "${title}"`, back: content.split('.')[1] || 'Review your notes for details.' }
    ];
    const questions = [
        { question: `Explain the concept of ${title}`, answer: `Based on your notes: ${content.substring(0, 100)}...` },
        { question: `What are the key takeaways from ${title}?`, answer: 'Review the flashcards above for a quick summary.' }
    ];

    study.notes.unshift({
        id: Date.now(),
        title,
        content,
        summary,
        flashcards,
        questions,
        createdAt: new Date().toISOString()
    });
    set('study', study);
    addXP(20);
    return study;
}

export function deleteNote(noteId) {
    const study = getStudy();
    study.notes = study.notes.filter(n => n.id !== noteId);
    set('study', study);
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

// ─── Load All Data ───────────────────────────────────
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
