require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── Public Routes ────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.json({
        status: 'ComradeOS API Running',
        version: '1.0.0',
        auth: 'JWT',
        timestamp: new Date().toISOString(),
    });
});

// ─── Protected Example Route ──────────────────────────────────────────────────
// All future module API routes (finance, study, etc.) should be mounted here
// behind the verifyToken middleware when you migrate from localStorage to API.

app.get('/api/protected/ping', verifyToken, (req, res) => {
    res.json({
        message: `Hello ${req.user.name}! You are authenticated.`,
        user: req.user,
    });
});

// ─── Connect to MongoDB and Start ────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comradeos')
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🚀 ComradeOS API running on port ${PORT}`);
            console.log(`   Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
