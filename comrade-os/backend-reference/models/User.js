const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, default: 'Comrade' },
    xp: { type: Number, default: 0 },
    badges: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);