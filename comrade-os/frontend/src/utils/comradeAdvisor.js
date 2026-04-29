/**
 * comradeAdvisor.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligence layer that sits on top of ComradeEngine.
 *
 * Takes a ComradeState snapshot and produces:
 *   1. generateDailySummary(state)  → full daily briefing
 *   2. generateInsights(state)      → prioritised actionable insights
 *   3. answerQuestion(question, state) → context-aware Q&A
 *
 * All functions are PURE — no side effects, no network, no storage writes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

function dayOfWeek() {
    return new Date().toLocaleDateString('en-KE', { weekday: 'long' });
}

function formatDate() {
    return new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function scoreTier(score) {
    if (score >= 75) return { tier: 'strong', emoji: '🟢', label: 'Strong' };
    if (score >= 50) return { tier: 'moderate', emoji: '🟡', label: 'Moderate' };
    if (score >= 30) return { tier: 'weak', emoji: '🟠', label: 'Weak' };
    return { tier: 'critical', emoji: '🔴', label: 'Critical' };
}

// ─── Actionable Insights Generator ────────────────────────────────────────────

/**
 * generateInsights(state) → Insight[]
 *
 * Each insight: { id, priority, icon, category, title, body, action, route }
 *   - priority: 1 (critical) → 5 (informational)
 *   - action:   short imperative text for the CTA button
 *   - route:    internal navigation target (or null)
 */
export function generateInsights(state) {
    const { metrics, modules, user } = state;
    const {
        energyScore, moneyHealth, disciplineScore,
        academicProgress, survivalProbability,
    } = metrics;
    const { finance, schedule, study, diet, fitness } = modules;

    const insights = [];

    // ── MONEY ─────────────────────────────────────────────────────────────

    if (moneyHealth < 20) {
        const totalExp = finance.expenses.reduce((s, e) => s + e.amount, 0);
        insights.push({
            id: 'money-critical',
            priority: 1,
            icon: '🚨',
            category: 'Finance',
            title: 'Funds critically low',
            body: `You have KES ${finance.balance.toLocaleString()} left with KES ${totalExp.toLocaleString()} already spent. Switch to survival diet and freeze all non-essential spending immediately.`,
            action: 'Review finances',
            route: '/finance',
        });
    } else if (moneyHealth < 40) {
        const dailyBudget = finance.incomeWeekly > 0
            ? Math.floor(finance.balance / Math.max(1, Math.ceil((7 - new Date().getDay()) || 1)))
            : 0;
        insights.push({
            id: 'money-low',
            priority: 2,
            icon: '💸',
            category: 'Finance',
            title: 'Reduce spending',
            body: `Money health is at ${moneyHealth}%. Target a daily cap of KES ${dailyBudget} to make it through the week. Track each expense.`,
            action: 'Log expense',
            route: '/finance',
        });
    } else if (moneyHealth >= 80) {
        insights.push({
            id: 'money-surplus',
            priority: 5,
            icon: '💰',
            category: 'Finance',
            title: 'Surplus funds available',
            body: `Balance is healthy at KES ${finance.balance.toLocaleString()}. Consider saving or investing the extra.`,
            action: null,
            route: '/finance',
        });
    }

    // ── ENERGY ────────────────────────────────────────────────────────────

    if (energyScore < 30) {
        insights.push({
            id: 'energy-critical',
            priority: 1,
            icon: '😴',
            category: 'Recovery',
            title: 'Sleep earlier tonight',
            body: `Energy at ${energyScore}% — sleep quality ${fitness.lastSleepQuality}/10. Cancel tonight's plans. Aim for 8+ hours. Skip high-intensity workouts.`,
            action: 'Update fitness',
            route: '/fitness',
        });
    } else if (energyScore < 50) {
        insights.push({
            id: 'energy-low',
            priority: 2,
            icon: '🔋',
            category: 'Recovery',
            title: 'Prioritise recovery',
            body: `Energy at ${energyScore}%. Do a light stretch or yoga today. Go to bed 30 minutes earlier.`,
            action: 'Check fitness',
            route: '/fitness',
        });
    }

    if (schedule.sleepHours < 6) {
        insights.push({
            id: 'sleep-deficit',
            priority: 2,
            icon: '🛏️',
            category: 'Schedule',
            title: 'Increase sleep hours',
            body: `Only ${schedule.sleepHours}h of sleep scheduled. Cognitive performance drops ~25% below 6 hours. Reschedule to hit 7h minimum.`,
            action: 'Fix schedule',
            route: '/schedule',
        });
    }

    // ── DISCIPLINE ────────────────────────────────────────────────────────

    if (disciplineScore < 30) {
        insights.push({
            id: 'discipline-broken',
            priority: 2,
            icon: '📉',
            category: 'Discipline',
            title: 'Rebuild your routine',
            body: `Discipline at ${disciplineScore}/100. Start small: fix sleep schedule, add 1 study hour, log at least 1 note today.`,
            action: 'Plan schedule',
            route: '/schedule',
        });
    } else if (disciplineScore < 50) {
        insights.push({
            id: 'discipline-mid',
            priority: 3,
            icon: '⚡',
            category: 'Discipline',
            title: 'Stay consistent',
            body: `Discipline at ${disciplineScore}/100. You're close to building momentum — study for ${schedule.studyHours < 4 ? '30 more minutes' : 'your full block'} today.`,
            action: null,
            route: null,
        });
    }

    // ── ACADEMIC ──────────────────────────────────────────────────────────

    if (academicProgress < 20) {
        insights.push({
            id: 'academic-empty',
            priority: 2,
            icon: '📖',
            category: 'Study',
            title: 'Start studying — now',
            body: `Academic progress is at ${academicProgress}%. You have ${study.notes?.length || 0} notes. Open your materials and create at least 1 note with flashcards today.`,
            action: 'Add a note',
            route: '/study',
        });
    } else if (academicProgress < 50) {
        // Find the most recent note for context
        const recent = study.notes?.[0];
        const topicHint = recent ? `Continue from "${recent.title}".` : 'Pick up where you left off.';
        insights.push({
            id: 'academic-mid',
            priority: 3,
            icon: '📚',
            category: 'Study',
            title: `Revise ${recent?.title ? `"${recent.title}"` : 'your notes'}`,
            body: `${study.notes?.length || 0} notes logged, progress at ${academicProgress}%. ${topicHint} Review flashcards to retain material.`,
            action: 'Open study',
            route: '/study',
        });
    }

    if (study.notes?.length > 0) {
        const incomplete = study.notes.filter(n => !n.completed);
        if (incomplete.length > 0 && incomplete.length <= 3) {
            insights.push({
                id: 'notes-finish',
                priority: 4,
                icon: '✏️',
                category: 'Study',
                title: `Complete ${incomplete.length} pending note${incomplete.length !== 1 ? 's' : ''}`,
                body: `${incomplete.map(n => `"${n.title}"`).join(', ')} — mark these done once reviewed.`,
                action: 'Open study',
                route: '/study',
            });
        }
    }

    // ── DIET ──────────────────────────────────────────────────────────────

    if (diet.budgetMode === 'survival') {
        insights.push({
            id: 'diet-survival',
            priority: 3,
            icon: '🥣',
            category: 'Diet',
            title: 'Switch back to normal meals when possible',
            body: `Survival diet is active — caloric intake is restricted. This impacts energy and focus. Restore normal meals once finances stabilise.`,
            action: 'Check diet',
            route: '/diet',
        });
    }

    const dailyCal = diet.meals?.reduce((s, m) => s + m.calories, 0) || 0;
    if (dailyCal > 0 && dailyCal < 1200 && diet.budgetMode !== 'survival') {
        insights.push({
            id: 'diet-low-cal',
            priority: 3,
            icon: '🍽️',
            category: 'Diet',
            title: 'Eat more — intake is low',
            body: `Daily calories are ~${dailyCal} kcal, below the 1500 kcal minimum. Add a high-calorie snack or extra meal.`,
            action: 'Update diet',
            route: '/diet',
        });
    }

    // ── SCHEDULE OVERLOAD ─────────────────────────────────────────────────

    const totalH = schedule.sleepHours + schedule.studyHours + schedule.freeTimeHours;
    if (totalH > 24) {
        insights.push({
            id: 'schedule-overload',
            priority: 2,
            icon: '🕐',
            category: 'Schedule',
            title: 'Schedule exceeds 24 hours',
            body: `${totalH}h allocated — that's physically impossible. Cut free time or study hours to fit reality.`,
            action: 'Fix schedule',
            route: '/schedule',
        });
    }

    // ── FITNESS ───────────────────────────────────────────────────────────

    if (fitness.availableMinutes > 0 && fitness.suggestedWorkout) {
        const w = fitness.suggestedWorkout;
        insights.push({
            id: 'workout-suggestion',
            priority: 4,
            icon: '💪',
            category: 'Fitness',
            title: `${w.type} — ${w.duration} minutes`,
            body: `Based on energy (${fitness.energyLevel}/10) and available time (${fitness.availableMinutes} min). Intensity: ${w.intensity}.`,
            action: 'Go to fitness',
            route: '/fitness',
        });
    }

    // ── SURVIVAL META ─────────────────────────────────────────────────────

    if (survivalProbability < 30) {
        insights.unshift({
            id: 'survival-alert',
            priority: 1,
            icon: '🚨',
            category: 'System',
            title: 'Survival probability is critical',
            body: `At ${survivalProbability}%, multiple systems are failing. Execute the highest-priority actions below immediately.`,
            action: null,
            route: null,
        });
    }

    // Sort by priority (1 = most urgent)
    insights.sort((a, b) => a.priority - b.priority);

    return insights;
}

// ─── Daily Summary Generator ──────────────────────────────────────────────────

/**
 * generateDailySummary(state) → DailySummary
 *
 * Returns a structured daily briefing object:
 * {
 *   greeting, date, overallStatus, statusEmoji,
 *   pillars: [{ label, score, tier, emoji }],
 *   headline, briefing,
 *   criticalActions: string[],
 *   schedule: { wake, sleep, studyBlock, freeBlock },
 *   financeSummary, dietSummary, fitnessSummary,
 * }
 */
export function generateDailySummary(state) {
    const { metrics, modules, user } = state;
    const {
        energyScore, moneyHealth, disciplineScore,
        academicProgress, survivalProbability,
    } = metrics;
    const { finance, schedule, study, diet, fitness } = modules;

    // ── Overall status ────────────────────────────────────────────────────
    const survTier = scoreTier(survivalProbability);
    let headline = '';
    let overallStatus = '';

    if (survivalProbability >= 75) {
        headline = `Comrade ${user.name} is operating at full capacity.`;
        overallStatus = 'All systems are nominal. Maintain course and capitalise on momentum.';
    } else if (survivalProbability >= 50) {
        headline = `Comrade ${user.name} is holding — with gaps.`;
        overallStatus = 'Some areas need attention. Prioritise the critical actions below to stabilise.';
    } else if (survivalProbability >= 30) {
        headline = `Comrade ${user.name}, the situation is stressed.`;
        overallStatus = 'Multiple systems are degraded. Immediate corrective action is required.';
    } else {
        headline = `Comrade ${user.name}, this is an emergency briefing.`;
        overallStatus = 'Survival probability is critical. Execute emergency protocols immediately.';
    }

    // ── Pillars ───────────────────────────────────────────────────────────
    const pillars = [
        { label: 'Energy',     score: energyScore,     ...scoreTier(energyScore) },
        { label: 'Money',      score: moneyHealth,     ...scoreTier(moneyHealth) },
        { label: 'Discipline', score: disciplineScore, ...scoreTier(disciplineScore) },
        { label: 'Academic',   score: academicProgress,...scoreTier(academicProgress) },
    ];

    // ── Critical actions (top 3) ──────────────────────────────────────────
    const allInsights = generateInsights(state);
    const criticalActions = allInsights
        .filter(i => i.priority <= 2)
        .slice(0, 3)
        .map(i => i.body);

    // ── Module summaries ──────────────────────────────────────────────────
    const totalExpenses = finance.expenses.reduce((s, e) => s + e.amount, 0);
    const dailyAvg = finance.expenses.length > 0
        ? Math.round(totalExpenses / Math.max(1, new Set(finance.expenses.map(e => (e.date || '').slice(0, 10))).size))
        : 0;

    const financeSummary = `KES ${finance.balance.toLocaleString()} remaining of KES ${finance.incomeWeekly.toLocaleString()} weekly. ${finance.expenses.length} expense${finance.expenses.length !== 1 ? 's' : ''} logged (KES ${totalExpenses.toLocaleString()} total, ~KES ${dailyAvg}/day).`;

    const dietSummary = `Mode: ${diet.budgetMode}. ${diet.meals.length} meal${diet.meals.length !== 1 ? 's' : ''} planned. ~${diet.meals.reduce((s, m) => s + m.calories, 0)} kcal daily.`;

    const fitnessSummary = `Energy: ${fitness.energyLevel}/10. Sleep quality: ${fitness.lastSleepQuality}/10. Suggested: ${fitness.suggestedWorkout?.type || 'Rest'} (${fitness.suggestedWorkout?.duration || 0} min, ${fitness.suggestedWorkout?.intensity || 'low'}).`;

    const scheduleInfo = {
        sleepHours: schedule.sleepHours,
        studyHours: schedule.studyHours,
        freeHours: schedule.freeTimeHours,
        activities: schedule.optimalSchedule || [],
    };

    const noteCount = study.notes?.length || 0;
    const completedNotes = study.notes?.filter(n => n.completed).length || 0;
    const studySummary = `${noteCount} note${noteCount !== 1 ? 's' : ''} (${completedNotes} completed). Academic progress: ${academicProgress}%.`;

    return {
        greeting: `Good ${getGreeting()}`,
        date: formatDate(),
        dayOfWeek: dayOfWeek(),
        userName: user.name,
        xp: user.xp,
        badges: user.badges,
        survivalProbability,
        survivalTier: survTier,
        headline,
        overallStatus,
        pillars,
        criticalActions,
        financeSummary,
        dietSummary,
        fitnessSummary,
        studySummary,
        scheduleInfo,
        insights: allInsights,
    };
}

// ─── Contextual Question Answering ────────────────────────────────────────────

/**
 * answerQuestion(question, state) → AnswerResult
 *
 * Analyses a free-text question against the full ComradeState and returns
 * a structured, context-aware answer — not a generic chatbot response.
 *
 * Returns: { category, answer, suggestions: string[], relatedInsights: Insight[] }
 */
export function answerQuestion(question, state) {
    const q = question.toLowerCase();
    const { metrics, modules, user } = state;
    const { finance, schedule, study, diet, fitness } = modules;
    const allInsights = generateInsights(state);

    // ── Spending / finance questions ──────────────────────────────────────
    const spendMatch = q.match(/spend\s*(?:ksh?|kes)?\s*(\d+)/i) || q.match(/(\d+)\s*(?:bob|shillings?|kes)/i);
    if (spendMatch || /spend|afford|buy|purchase|money|balance|broke/.test(q)) {
        const amount = spendMatch ? parseInt(spendMatch[1], 10) : 0;
        const totalExp = finance.expenses.reduce((s, e) => s + e.amount, 0);
        const daysLeft = totalExp > 0
            ? Math.floor(finance.balance / (totalExp / Math.max(1, new Set(finance.expenses.map(e => (e.date || '').slice(0, 10))).size)))
            : 999;

        let answer = '';
        const suggestions = [];

        if (amount > 0) {
            const remaining = finance.balance - amount;
            if (amount > finance.balance) {
                answer = `You can't afford KES ${amount}. Your balance is KES ${finance.balance.toLocaleString()}. That would overdraw your account.`;
                suggestions.push('Check if you can borrow or defer the expense');
                suggestions.push('Review which existing expenses can be cut');
            } else if (remaining < finance.incomeWeekly * 0.2) {
                answer = `Spending KES ${amount} would leave KES ${remaining.toLocaleString()} — only ${Math.round((remaining / finance.incomeWeekly) * 100)}% of your weekly income. That's risky.`;
                suggestions.push(`Reduce the amount to KES ${Math.floor(finance.balance * 0.3)} or less`);
                suggestions.push('Switch to survival diet to compensate');
            } else {
                answer = `Yes, you can spend KES ${amount}. You'll have KES ${remaining.toLocaleString()} left (~${Math.floor(remaining / Math.max(1, totalExp / 7))} days of runway).`;
                suggestions.push('Log this as an expense to keep tracking accurate');
            }
        } else {
            answer = `Your balance is KES ${finance.balance.toLocaleString()} with ~${daysLeft} day${daysLeft !== 1 ? 's' : ''} of runway. Money health: ${metrics.moneyHealth}/100.`;
            if (metrics.moneyHealth < 40) {
                suggestions.push('Cut non-essential spending immediately');
                suggestions.push('Switch diet to survival mode');
            }
        }

        return {
            category: 'Finance',
            answer,
            suggestions,
            relatedInsights: allInsights.filter(i => i.category === 'Finance'),
        };
    }

    // ── Sleep / energy questions ──────────────────────────────────────────
    if (/sleep|tired|energy|rest|exhausted|fatigue/.test(q)) {
        const answer = `Your energy score is ${metrics.energyScore}/100. Sleep quality: ${fitness.lastSleepQuality}/10. ${
            schedule.sleepHours < 7
                ? `You only have ${schedule.sleepHours}h of sleep scheduled — increase to at least 7h.`
                : `You have ${schedule.sleepHours}h of sleep scheduled, which is good.`
        } ${
            fitness.lastSleepQuality < 5
                ? 'Your recent sleep quality was poor. Avoid screens before bed and skip caffeine after 2pm.'
                : ''
        }`;

        return {
            category: 'Recovery',
            answer,
            suggestions: [
                schedule.sleepHours < 7 ? 'Reschedule to get 7+ hours of sleep' : null,
                fitness.lastSleepQuality < 6 ? 'Improve sleep hygiene — dark room, no screens 1h before bed' : null,
                metrics.energyScore < 40 ? 'Do only light exercise today (stretching/yoga)' : null,
                'Set an alarm for a consistent wake-up time',
            ].filter(Boolean),
            relatedInsights: allInsights.filter(i => i.category === 'Recovery' || i.category === 'Fitness'),
        };
    }

    // ── Study / academic questions ────────────────────────────────────────
    if (/study|note|exam|revise|flashcard|academic|lecture|homework|assignment/.test(q)) {
        const noteCount = study.notes?.length || 0;
        const completed = study.notes?.filter(n => n.completed).length || 0;
        const incomplete = study.notes?.filter(n => !n.completed) || [];
        const recentNote = study.notes?.[0];

        let answer = `Academic progress: ${metrics.academicProgress}/100. ${noteCount} note${noteCount !== 1 ? 's' : ''} (${completed} completed).`;

        if (incomplete.length > 0) {
            answer += ` Pending: ${incomplete.slice(0, 3).map(n => `"${n.title}"`).join(', ')}.`;
        }

        if (recentNote) {
            answer += ` Most recent: "${recentNote.title}".`;
        }

        if (schedule.studyHours < 3) {
            answer += ` You only have ${schedule.studyHours}h of study time — try to increase this.`;
        }

        return {
            category: 'Study',
            answer,
            suggestions: [
                incomplete.length > 0 ? `Review and complete "${incomplete[0]?.title}"` : null,
                'Create a new note for today\'s material',
                schedule.studyHours < 4 ? 'Block at least 4 hours for study in your schedule' : null,
                'Use the flashcard deck to revise previous notes',
            ].filter(Boolean),
            relatedInsights: allInsights.filter(i => i.category === 'Study'),
        };
    }

    // ── Diet / food questions ─────────────────────────────────────────────
    if (/eat|food|diet|meal|hungry|cook|lunch|dinner|breakfast/.test(q)) {
        const dailyCal = diet.meals.reduce((s, m) => s + m.calories, 0);
        const dailyCost = diet.meals.reduce((s, m) => s + m.cost, 0);

        const answer = `Diet mode: ${diet.budgetMode}. ${diet.meals.length} meals planned (~${dailyCal} kcal, KES ${dailyCost}/day). ${
            diet.budgetMode === 'survival'
                ? 'You\'re on survival diet due to tight finances. Prioritise calorie-dense, cheap foods.'
                : dailyCal < 1500
                ? 'Calorie intake seems low — consider adding a snack or larger portions.'
                : 'Nutrition looks adequate.'
        }`;

        return {
            category: 'Diet',
            answer,
            suggestions: [
                diet.budgetMode === 'survival' ? 'Switch back to normal meals when funds allow' : null,
                dailyCal < 1500 ? 'Add a banana + groundnuts snack (~200 kcal, KES 30)' : null,
                'Check the diet page for meal suggestions',
            ].filter(Boolean),
            relatedInsights: allInsights.filter(i => i.category === 'Diet'),
        };
    }

    // ── Schedule / time questions ─────────────────────────────────────────
    if (/schedule|time|busy|free|plan|routine/.test(q)) {
        const total = schedule.sleepHours + schedule.studyHours + schedule.freeTimeHours;

        return {
            category: 'Schedule',
            answer: `Current allocation: ${schedule.sleepHours}h sleep, ${schedule.studyHours}h study, ${schedule.freeTimeHours}h free time (${total}h total). ${
                total > 24 ? 'Warning: that exceeds 24 hours.' : `${24 - total}h unaccounted for — that\'s class time, meals, transit.`
            }`,
            suggestions: [
                total > 24 ? 'Reduce free time or study hours to fit 24h' : null,
                schedule.studyHours < 3 ? 'Increase study time to at least 3 hours' : null,
                'Review your optimal schedule on the schedule page',
            ].filter(Boolean),
            relatedInsights: allInsights.filter(i => i.category === 'Schedule'),
        };
    }

    // ── Fitness / workout questions ───────────────────────────────────────
    if (/workout|exercise|gym|run|fitness|train|muscle/.test(q)) {
        const w = fitness.suggestedWorkout;
        return {
            category: 'Fitness',
            answer: `Energy: ${fitness.energyLevel}/10. Available time: ${fitness.availableMinutes} min. Suggested workout: ${w?.type || 'Rest'} (${w?.duration || 0} min, ${w?.intensity || 'low'} intensity).`,
            suggestions: [
                metrics.energyScore < 40 ? 'Skip the workout — recovery is more important today' : `Do the ${w?.type} workout`,
                'Update your fitness inputs for more accurate suggestions',
            ],
            relatedInsights: allInsights.filter(i => i.category === 'Fitness'),
        };
    }

    // ── Generic / survival / how am I doing ───────────────────────────────
    const summary = generateDailySummary(state);
    return {
        category: 'Overview',
        answer: `${summary.headline} Survival: ${metrics.survivalProbability}/100. ${summary.overallStatus}`,
        suggestions: summary.criticalActions.length > 0
            ? summary.criticalActions
            : ['Keep up the good work — all systems nominal'],
        relatedInsights: allInsights.slice(0, 4),
    };
}
