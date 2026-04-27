require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const aiRoutes = require('./routes/ai');
const financeRoutes = require('./routes/finance');
const scheduleRoutes = require('./routes/schedule');
const dietRoutes = require('./routes/diet');
const studyRoutes = require('./routes/study');
const fitnessRoutes = require('./routes/fitness');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/', (req, res) => res.send('ComradeOS API Running'));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comradeos')
    .then(() => {
        console.log('MongoDB connected');
        // Seed sample data if needed
        require('./utils/seedData')();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error(err));