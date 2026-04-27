const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    budgetMode: { type: String, enum: ['normal', 'survival'], default: 'normal' },
    meals: [{
        name: String,
        cost: Number,
        calories: Number,
        type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] }
    }]
});

module.exports = mongoose.model('Diet', dietSchema);