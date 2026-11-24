require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { UPLOAD_DIR } = require('./middleware/upload');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopadmin_lab4';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, message: 'File is too large (max 2MB).' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate entry already exists.' });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error.'
    });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`ShopAdmin API running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });