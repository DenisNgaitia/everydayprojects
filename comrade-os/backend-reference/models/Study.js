const mongoose = require('mongoose');

const studySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: [{
        title: String,
        content: String,
        summary: String,
        flashcards: [{ front: String, back: String }],
        questions: [{ question: String, answer: String }],
        createdAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Study', studySchema);