const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.categoryId) {
            filter.categoryId = req.query.categoryId;
        }

        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { name, categoryId, quantity, price } = req.body;
        if (!name || !name.trim() || !categoryId) {
            return res.status(400).json({ success: false, message: 'Product name and category are required.' });
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: 'Selected category does not exist.' });
        }

        const product = await Product.create({
            name: name.trim(),
            categoryId,
            quantity: Number(quantity) || 0,
            price: Number(price) || 0
        });

        await product.populate('categoryId', 'name');
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { name, categoryId, quantity, price } = req.body;
        if (!name || !name.trim() || !categoryId) {
            return res.status(400).json({ success: false, message: 'Product name and category are required.' });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                categoryId,
                quantity: Number(quantity) || 0,
                price: Number(price) || 0
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;