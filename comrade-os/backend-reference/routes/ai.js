const express = require('express');
const router = express.Router();
const { analyzeDecision } = require('../utils/aiEngine');
const Finance = require('../models/Finance');
const Schedule = require('../models/Schedule');
const Diet = require('../models/Diet');
const User = require('../models/User');

// Mock user ID for demo (in real app use auth)
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5'; // consistent ObjectId string

router.post('/decide', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Question required' });

        // Get user data
        const finance = await Finance.findOne({ userId: DEMO_USER_ID });
        const schedule = await Schedule.findOne({ userId: DEMO_USER_ID });
        const diet = await Diet.findOne({ userId: DEMO_USER_ID });

        const result = analyzeDecision(question, finance, schedule);

        // Update diet mode based on suggestion
        if (diet && result.suggestedMealPlan) {
            diet.budgetMode = result.suggestedMealPlan;
            await diet.save();
        }

        // Award XP for using the AI
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 10 } });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;