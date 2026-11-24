const express = require('express');
const Category = require('../models/Category');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const category = await Category.create({ name: name.trim() });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, message: 'Category deleted.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;