const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

// Get finance data
router.get('/', async (req, res) => {
    try {
        let finance = await Finance.findOne({ userId: DEMO_USER_ID });
        if (!finance) {
            finance = await Finance.create({ userId: DEMO_USER_ID, balance: 200, incomeWeekly: 200 });
        }
        res.json(finance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add expense
router.post('/expense', async (req, res) => {
    try {
        const { category, amount } = req.body;
        const finance = await Finance.findOne({ userId: DEMO_USER_ID });
        finance.expenses.push({ category, amount });
        finance.balance -= amount;
        await finance.save();

        // Award XP for logging expense
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 5 } });

        res.json(finance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set income
router.put('/income', async (req, res) => {
    try {
        const { incomeWeekly } = req.body;
        const finance = await Finance.findOne({ userId: DEMO_USER_ID });
        finance.incomeWeekly = incomeWeekly;
        await finance.save();
        res.json(finance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;