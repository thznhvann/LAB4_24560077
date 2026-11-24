const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'shopadmin_super_secret_key_2026';

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: missing token.' });
        }

        const token = authHeader.slice(7).trim();
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: user not found.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized: invalid or expired token.' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: only admin users can perform this action.'
        });
    }
    next();
}

module.exports = { authenticate, requireAdmin, JWT_SECRET };