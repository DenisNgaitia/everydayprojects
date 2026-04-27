// Simulated AI Decision Engine
// In production, this would call OpenAI or another LLM.
// Here we simulate logic based on user data and the question.

function analyzeDecision(question, userFinance, userSchedule) {
    const lowerQuestion = question.toLowerCase();
    const spendMatch = lowerQuestion.match(/spend (\d+)/);
    const spendAmount = spendMatch ? parseInt(spendMatch[1], 10) : 0;

    const currentBalance = userFinance.balance || 200;
    const weeklyIncome = userFinance.incomeWeekly || 200;
    const weeklyExpenses = userFinance.expenses.reduce((acc, e) => acc + e.amount, 0);
    const daysUntilReset = 7; // assume weekly cycle
    const dailyBurnRate = weeklyExpenses / 7;
    const remainingAfterSpend = currentBalance - spendAmount;
    const daysLeft = remainingAfterSpend / dailyBurnRate;

    // Financial Impact
    let financialImpact = '';
    if (spendAmount > currentBalance) {
        financialImpact = `Insufficient funds! You only have $${currentBalance}. Spending $${spendAmount} would overdraw.`;
    } else if (daysLeft < 3) {
        financialImpact = `After spending $${spendAmount}, you'll have $${remainingAfterSpend.toFixed(2)} left, which will last about ${Math.floor(daysLeft)} days. You'll run out before the week ends.`;
    } else {
        financialImpact = `You can afford it. You'll still have $${remainingAfterSpend.toFixed(2)} and survive the rest of the week.`;
    }

    // Time Impact
    const sleepHours = userSchedule.sleepHours || 7;
    const studyHours = userSchedule.studyHours || 4;
    let timeImpact = 'Spending money might lead to social outings that reduce study time.';
    if (spendAmount > 50) {
        timeImpact += ` A night out could cut sleep to ${sleepHours - 2} hours, affecting tomorrow's focus.`;
    } else {
        timeImpact += ` Minor spending won't affect your schedule much.`;
    }

    // Health Impact
    let healthImpact = 'No major health impact.';
    if (spendAmount > 50) {
        healthImpact = `Possible late night may reduce sleep quality and increase stress.`;
    }

    // Academic Impact
    let academicImpact = 'None, if you manage time well.';
    if (spendAmount > 30 && daysLeft < 5) {
        academicImpact = `Financial stress might distract from studies.`;
    }

    // Survival probability (0-100)
    let survivalProb = 100;
    if (remainingAfterSpend < 20) survivalProb = 20;
    else if (remainingAfterSpend < 50) survivalProb = 60;
    else if (remainingAfterSpend < 100) survivalProb = 85;

    // Verdict
    let verdict = 'Smart';
    if (spendAmount > currentBalance) verdict = 'Bad Decision';
    else if (daysLeft < 2) verdict = 'Risky';
    else if (survivalProb < 50) verdict = 'Risky';

    return {
        question,
        financialImpact,
        timeImpact,
        healthImpact,
        academicImpact,
        survivalProbability: survivalProb,
        verdict,
        riskScore: Math.max(0, 100 - survivalProb),
        adjustedBalance: remainingAfterSpend,
        suggestedMealPlan: remainingAfterSpend < 60 ? 'survival' : 'normal'
    };
}

module.exports = { analyzeDecision };