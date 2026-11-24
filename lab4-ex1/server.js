const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let products = [
    { id: 1, name: 'Laptop Dell XPS 15', price: 35000000, category: 'Electronics' },
    { id: 2, name: 'Logitech MX Master 3S Mouse', price: 2400000, category: 'Accessories' }
];

app.get('/api/v1/products', (req, res) => {
    const { category } = req.query;
    let result = products;
    if (category) {
        result = products.filter(p => p.category === category);
    }
    res.json({ success: true, count: result.length, data: result });
});

app.post('/api/v1/products', (req, res) => {
    const { name, price, category } = req.body;
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Product name and price are required!' });
    }
    const newProduct = { id: Date.now(), name, price: Number(price), category: category || 'General' };
    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
});

app.put('/api/v1/products/:id', (req, res) => {
    const productId = Number(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `Product ID ${productId} not found` });
    }
    const { name, price, category } = req.body;
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Invalid data' });
    }
    products[index] = { ...products[index], name, price: Number(price), category };
    res.json({ success: true, data: products[index] });
});

app.delete('/api/v1/products/:id', (req, res) => {
    const productId = Number(req.params.id);
    const exists = products.some(p => p.id === productId);
    if (!exists) {
        return res.status(404).json({ success: false, message: `Product ID ${productId} not found` });
    }
    products = products.filter(p => p.id !== productId);
    res.json({ success: true, message: `Deleted product ID ${productId}` });
});

app.listen(PORT, () => {
    console.log(`Backend API running at: http://localhost:${PORT}`);
});