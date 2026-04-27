const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sleepHours: { type: Number, default: 7 },
    studyHours: { type: Number, default: 4 },
    freeTimeHours: { type: Number, default: 5 },
    optimalSchedule: [{
        time: String,
        activity: String
    }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);