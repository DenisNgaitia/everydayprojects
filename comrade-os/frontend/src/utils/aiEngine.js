// Simulated AI Decision Engine
// In production, this would call an LLM API.
// Here we simulate logic based on user data and the question.

export function analyzeDecision(question, userFinance, userSchedule) {
    const lowerQuestion = question.toLowerCase();
    const spendMatch = lowerQuestion.match(/spend\s*(?:ksh?|kes)?\s*(\d+)/i) || lowerQuestion.match(/(\d+)/);
    const spendAmount = spendMatch ? parseInt(spendMatch[1], 10) : 0;

    const currentBalance = userFinance?.balance || 2000;
    const weeklyIncome = userFinance?.incomeWeekly || 2000;
    const expenses = userFinance?.expenses || [];
    const weeklyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const dailyBurnRate = weeklyExpenses / 7 || 50;
    const remainingAfterSpend = currentBalance - spendAmount;
    const daysLeft = dailyBurnRate > 0 ? remainingAfterSpend / dailyBurnRate : 99;

    // Financial Impact
    let financialImpact = '';
    if (spendAmount === 0) {
        financialImpact = `I couldn't detect a spend amount. Try asking something like "Should I spend KES 500 tonight?"`;
    } else if (spendAmount > currentBalance) {
        financialImpact = `Insufficient funds! You only have KES ${currentBalance}. Spending KES ${spendAmount} would overdraw.`;
    } else if (daysLeft < 3) {
        financialImpact = `After spending KES ${spendAmount}, you'll have KES ${remainingAfterSpend.toFixed(0)} left, lasting about ${Math.floor(daysLeft)} days. You'll run out before the week ends.`;
    } else {
        financialImpact = `You can afford it. You'll still have KES ${remainingAfterSpend.toFixed(0)} and survive the rest of the week.`;
    }

    // Time Impact
    const sleepHours = userSchedule?.sleepHours || 7;
    const studyHours = userSchedule?.studyHours || 4;
    let timeImpact = 'Spending money might lead to social outings that reduce study time.';
    if (spendAmount > 500) {
        timeImpact += ` A night out could cut sleep to ${sleepHours - 2} hours, affecting tomorrow's focus.`;
    } else {
        timeImpact += ` Minor spending won't affect your schedule much.`;
    }

    // Health Impact
    let healthImpact = 'No major health impact.';
    if (spendAmount > 500) {
        healthImpact = `Possible late night may reduce sleep quality and increase stress.`;
    }

    // Academic Impact
    let academicImpact = 'None, if you manage time well.';
    if (spendAmount > 300 && daysLeft < 5) {
        academicImpact = `Financial stress might distract from studies.`;
    }

    // Survival probability (0-100)
    let survivalProb = 100;
    if (remainingAfterSpend < 200) survivalProb = 20;
    else if (remainingAfterSpend < 500) survivalProb = 60;
    else if (remainingAfterSpend < 1000) survivalProb = 85;

    // Verdict
    let verdict = '✅ Smart Move';
    if (spendAmount > currentBalance) verdict = '❌ Bad Decision';
    else if (daysLeft < 2) verdict = '⚠️ Risky';
    else if (survivalProb < 50) verdict = '⚠️ Risky';

    return {
        question,
        financialImpact,
        timeImpact,
        healthImpact,
        academicImpact,
        survivalProbability: survivalProb,
        verdict,
        riskScore: Math.max(0, 100 - survivalProb),
        adjustedBalance: Math.max(0, remainingAfterSpend),
        suggestedMealPlan: remainingAfterSpend < 600 ? 'survival' : 'normal',
        spendAmount
    };
}
