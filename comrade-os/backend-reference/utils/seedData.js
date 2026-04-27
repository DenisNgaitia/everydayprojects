const User = require('../models/User');
const Finance = require('../models/Finance');
const Schedule = require('../models/Schedule');
const Diet = require('../models/Diet');
const Study = require('../models/Study');
const Fitness = require('../models/Fitness');

const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

async function seedData() {
    const existingUser = await User.findById(DEMO_USER_ID);
    if (!existingUser) {
        await User.create({ _id: DEMO_USER_ID, name: 'Comrade Student', xp: 150, badges: ['Disciplined Comrade'] });
        await Finance.create({
            userId: DEMO_USER_ID, incomeWeekly: 200, balance: 185, expenses: [
                { category: 'Food', amount: 15, date: new Date() },
                { category: 'Transport', amount: 5, date: new Date() }
            ]
        });
        await Schedule.create({ userId: DEMO_USER_ID, sleepHours: 7, studyHours: 4, freeTimeHours: 5 });
        await Diet.create({ userId: DEMO_USER_ID, budgetMode: 'normal' });
        await Study.create({ userId: DEMO_USER_ID, notes: [] });
        await Fitness.create({ userId: DEMO_USER_ID });
        console.log('Demo data seeded.');
    }
}

module.exports = seedData;