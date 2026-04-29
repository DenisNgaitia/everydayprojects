const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * verifyToken middleware
 *
 * 1. Reads `Authorization: Bearer <token>` from the request header
 * 2. Verifies the JWT signature and expiry
 * 3. Looks up the user in MongoDB (ensures they still exist)
 * 4. Attaches `req.user` with { id, name, email }
 * 5. Returns 401 on any failure
 */
const verifyToken = async (req, res, next) => {
    try {
        // 1. Extract token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const token = authHeader.split(' ')[1];

        // 2. Verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Confirm user still exists (covers deleted accounts, password changes)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'Token valid but user no longer exists.' });
        }

        // 4. Attach to request
        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

module.exports = verifyToken;
