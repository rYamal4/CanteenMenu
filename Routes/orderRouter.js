const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

// View order history
router.get('/', orderController.getOrders);

// Place order (from cart)
router.post('/place', orderController.placeOrder);

module.exports = router;
