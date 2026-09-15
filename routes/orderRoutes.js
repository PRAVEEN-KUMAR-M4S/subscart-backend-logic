const express = require('express');
const router = express.Router();
const {
    skipOrder,
    swapMeal,
    moveOrder,
    rescheduleOrder,
    skipItem,
    swapItem,
    moveItem,
    addItem
} = require('../controllers/orderController');

// Order-level action routes
router.patch('/:orderId/skip', skipOrder);
router.patch('/:orderId/swap', swapMeal);
router.patch('/:orderId/move', moveOrder);
router.patch('/:orderId/reschedule', rescheduleOrder);

// Per-item action routes
router.patch('/:orderId/items/:itemId/skip', skipItem);
router.patch('/:orderId/items/:itemId/swap', swapItem);
router.patch('/:orderId/items/:itemId/move', moveItem);
router.post('/:orderId/items', addItem);

module.exports = router;
