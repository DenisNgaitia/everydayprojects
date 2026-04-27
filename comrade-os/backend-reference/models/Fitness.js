const mongoose = require('mongoose');

const fitnessSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastSleepQuality: { type: Number, min: 1, max: 10, default: 7 },
    energyLevel: { type: Number, min: 1, max: 10, default: 7 },
    availableMinutes: { type: Number, default: 45 },
    suggestedWorkout: {
        type: String,
        duration: Number,
        intensity: String
    }
});

module.exports = mongoose.model('Fitness', fitnessSchema);