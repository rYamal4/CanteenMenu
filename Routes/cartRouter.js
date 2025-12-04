const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');

// View cart
router.get('/', cartController.getCart);

// Add to cart
router.post('/add', cartController.addToCart);

// Update quantity
router.post('/:id/update', cartController.updateCartItem);

// Remove from cart
router.post('/:id/remove', cartController.removeFromCart);

// Clear cart
router.post('/clear', cartController.clearCart);

module.exports = router;
