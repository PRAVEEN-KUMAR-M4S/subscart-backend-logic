require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const mealRoutes = require('./routes/mealRoutes');

const app = express();

// Middleware
app.use(express.json());

// CORS — allow requests from Flutter (Android emulator / device)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`  Body:`, JSON.stringify(req.body, null, 2));
    }
    // Log response
    const originalSend = res.send;
    res.send = function(body) {
        if (res.statusCode >= 400) {
            console.log(`  Response ${res.statusCode}:`, body);
        } else {
            console.log(`  Response ${res.statusCode}: OK`);
        }
        return originalSend.call(this, body);
    };
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Subscart API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local:  http://localhost:${PORT}`);
    console.log(`LAN:    http://0.0.0.0:${PORT}`);
});
