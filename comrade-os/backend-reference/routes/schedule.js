const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

router.get('/', async (req, res) => {
    try {
        let schedule = await Schedule.findOne({ userId: DEMO_USER_ID });
        if (!schedule) {
            schedule = await Schedule.create({
                userId: DEMO_USER_ID,
                optimalSchedule: [
                    { time: '07:00', activity: 'Wake up + stretch' },
                    { time: '08:00', activity: 'Breakfast' },
                    { time: '09:00', activity: 'Study session' },
                    { time: '12:00', activity: 'Lunch' },
                    { time: '13:00', activity: 'Classes / study' },
                    { time: '18:00', activity: 'Dinner' },
                    { time: '19:00', activity: 'Free time / fitness' },
                    { time: '22:00', activity: 'Wind down' },
                    { time: '23:00', activity: 'Sleep' }
                ]
            });
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const { sleepHours, studyHours, freeTimeHours } = req.body;
        const schedule = await Schedule.findOne({ userId: DEMO_USER_ID });
        if (sleepHours !== undefined) schedule.sleepHours = sleepHours;
        if (studyHours !== undefined) schedule.studyHours = studyHours;
        if (freeTimeHours !== undefined) schedule.freeTimeHours = freeTimeHours;
        await schedule.save();
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 5 } });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;