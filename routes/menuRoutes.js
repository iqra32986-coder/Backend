const express = require('express');
const router = express.Router();
const { getMenuItems, getRestaurantMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, restaurantOnly, adminOrRestaurant } = require('../middleware/authMiddleware');

router.route('/').get(getMenuItems).post(protect, restaurantOnly, createMenuItem);
router.route('/restaurant/:id').get(getRestaurantMenuItems);
router.route('/:id').put(protect, adminOrRestaurant, updateMenuItem).delete(protect, adminOrRestaurant, deleteMenuItem);

module.exports = router;
