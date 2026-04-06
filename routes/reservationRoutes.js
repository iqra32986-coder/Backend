const express = require('express');
const router = express.Router();
const { createReservation, getRestaurantReservations, getGlobalReservations, updateReservationStatus, getGlobalTables } = require('../controllers/reservationController');
const { protect, restaurantOnly, adminOrRestaurant } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReservation).get(protect, getGlobalReservations);
router.route('/tables').get(getGlobalTables);
router.route('/restaurant').get(protect, adminOrRestaurant, getRestaurantReservations);
router.route('/:id/status').put(protect, adminOrRestaurant, updateReservationStatus);

module.exports = router;
