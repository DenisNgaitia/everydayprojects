const express = require('express');
const router = express.Router();
const Diet = require('../models/Diet');
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

router.get('/', async (req, res) => {
    try {
        let diet = await Diet.findOne({ userId: DEMO_USER_ID });
        if (!diet) {
            diet = await Diet.create({
                userId: DEMO_USER_ID,
                budgetMode: 'normal',
                meals: [
                    { name: 'Oatmeal with banana', cost: 1.5, calories: 350, type: 'breakfast' },
                    { name: 'Rice & beans', cost: 2.0, calories: 500, type: 'lunch' },
                    { name: 'Pasta with tomato sauce', cost: 2.5, calories: 600, type: 'dinner' },
                    { name: 'Apple & peanut butter', cost: 1.0, calories: 200, type: 'snack' }
                ]
            });
        }
        res.json(diet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/mode', async (req, res) => {
    try {
        const { budgetMode } = req.body;
        const diet = await Diet.findOne({ userId: DEMO_USER_ID });
        diet.budgetMode = budgetMode;
        // Adjust meals for survival mode
        if (budgetMode === 'survival') {
            diet.meals = [
                { name: 'Ramen with egg', cost: 0.8, calories: 400, type: 'lunch' },
                { name: 'PB&J sandwich', cost: 0.9, calories: 350, type: 'dinner' },
                { name: 'Banana', cost: 0.3, calories: 100, type: 'snack' }
            ];
        }
        await diet.save();
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 5 } });
        res.json(diet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;