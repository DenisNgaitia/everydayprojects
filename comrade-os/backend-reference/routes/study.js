const express = require('express');
const router = express.Router();
const Study = require('../models/Study');
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

router.get('/', async (req, res) => {
    try {
        let study = await Study.findOne({ userId: DEMO_USER_ID });
        if (!study) {
            study = await Study.create({ userId: DEMO_USER_ID, notes: [] });
        }
        res.json(study);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        // Simulate AI summarization, flashcards, questions
        const summary = `Summary of "${title}": ${content.substring(0, 100)}...`;
        const flashcards = [
            { front: `What is the main idea of ${title}?`, back: content.split('.')[0] },
            { front: 'Key term from note', back: 'Definition placeholder' }
        ];
        const questions = [
            { question: `Explain the concept of ${title}`, answer: 'Based on the notes...' }
        ];

        const study = await Study.findOne({ userId: DEMO_USER_ID });
        study.notes.push({ title, content, summary, flashcards, questions });
        await study.save();
        await User.findOneAndUpdate({ _id: DEMO_USER_ID }, { $inc: { xp: 20 } });
        res.json(study);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;