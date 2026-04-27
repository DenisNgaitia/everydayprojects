const express = require('express');
const router = express.Router();
const Fitness = require('../models/Fitness');
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

router.get('/', async (req, res) => {
    try {
        let fitness = await Fitness.findOne({ userId: DEMO_USER_ID });
        if (!fitness) {
            fitness = await Fitness.create({
                userId: DEMO_USER_ID,
                suggestedWorkout: { type: 'Bodyweight circuit', duration: 20, intensity: 'moderate' }
            });
        }
        res.json(fitness);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/update', async (req, res) => {
    try {
        const { sleepQuality, energyLevel, availableMinutes } = req.body;
        const fitness = await Fitness.findOne({ userId: DEMO_USER_ID });
        if (sleepQuality !== undefined) fitness.lastSleepQuality = sleepQuality;
        if (energyLevel !== undefined) fitness.energyLevel = energyLevel;
        if (availableMinutes !== undefined) fitness.availableMinutes = availableMinutes;

        // Simulate workout suggestion based on inputs
        if (energyLevel < 4 || sleepQuality < 4) {
            fitness.suggestedWorkout = { type: 'Stretching / Yoga', duration: 15, intensity: 'low' };
        } else if (availableMinutes < 30) {
            fitness.suggestedWorkout = { type: 'HIIT (15 min)', duration: 15, intensity: 'high' };
        } else {
            fitness.suggestedWorkout = { type: 'Strength training', duration: 45, intensity: 'moderate' };
        }

        await fitness.save();
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 10 } });
        res.json(fitness);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;