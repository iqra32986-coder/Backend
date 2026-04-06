const express = require('express');
const router = express.Router();
const { addOrderItems, getOrders, getMyOrders, trackOrder, getRestaurantOrders, updateOrderStatus, jazzCashCallback } = require('../controllers/orderController');
const { protect, restaurantOnly, adminOnly, adminOrRestaurant } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, adminOnly, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/restaurant').get(protect, restaurantOnly, getRestaurantOrders);
router.route('/track/:trackingId').get(trackOrder);
router.route('/:id/status').put(protect, adminOrRestaurant, updateOrderStatus);

// JazzCash public webhook callback
router.route('/jazzcash/callback').post(jazzCashCallback);

module.exports = router;
