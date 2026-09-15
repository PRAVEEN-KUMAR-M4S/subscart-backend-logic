const express = require('express');
const router = express.Router();
const {
    getAllSubscriptions,
    getSubscription,
    togglePause,
    addSlot
} = require('../controllers/subscriptionController');
const { getOrdersForDate } = require('../controllers/orderController');

// List all subscriptions (must come before /:id)
router.get('/', getAllSubscriptions);

// Subscription routes
router.get('/:id', getSubscription);
router.post('/:id/pause', togglePause);
router.post('/:id/slots', addSlot);

// Orders within subscription context
router.get('/:id/orders', getOrdersForDate);

module.exports = router;
