const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        const { fullName, age, gender, email, password, type } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: fullName.trim(),
            age: age !== undefined ? Number(age) : undefined,
            gender: ['male', 'female', 'other'].includes(gender) ? gender : 'male',
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            type: type === 'admin' ? 'admin' : 'normal'
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: user.toSafeObject()
        });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, type: user.type },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: user.toSafeObject()
            }
        });
    } catch (err) {
        next(err);
    }
});

router.get('/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: req.user.toSafeObject()
    });
});

module.exports = router;