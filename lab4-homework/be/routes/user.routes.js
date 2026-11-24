const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.put('/me', authenticate, async (req, res, next) => {
    try {
        const { fullName, age, gender } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }

        req.user.fullName = fullName.trim();
        if (age !== undefined && age !== '') {
            req.user.age = Number(age);
        }
        if (['male', 'female', 'other'].includes(gender)) {
            req.user.gender = gender;
        }

        await req.user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: req.user.toSafeObject()
        });
    } catch (err) {
        next(err);
    }
});

router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please choose an image file.' });
        }

        req.user.avatarUrl = `/uploads/${req.file.filename}`;
        await req.user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully.',
            data: req.user.toSafeObject()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;