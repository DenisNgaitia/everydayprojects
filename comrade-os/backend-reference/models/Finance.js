const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    incomeWeekly: { type: Number, default: 200 },
    expenses: [{
        category: String,
        amount: Number,
        date: { type: Date, default: Date.now }
    }],
    balance: { type: Number, default: 200 }
});

module.exports = mongoose.model('Finance', financeSchema);