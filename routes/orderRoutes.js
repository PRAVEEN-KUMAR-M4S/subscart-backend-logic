const express = require('express');
const router = express.Router();
const {
    skipOrder,
    swapMeal,
    moveOrder,
    rescheduleOrder
} = require('../controllers/orderController');

// Order action routes
router.patch('/:orderId/skip', skipOrder);
router.patch('/:orderId/swap', swapMeal);
router.patch('/:orderId/move', moveOrder);
router.patch('/:orderId/reschedule', rescheduleOrder);

module.exports = router;
