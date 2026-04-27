const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DEMO_USER_ID = '64a1f0b2e8d5f9a1b2c3d4e5';

router.get('/', async (req, res) => {
    try {
        const user = await User.findById(DEMO_USER_ID);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;