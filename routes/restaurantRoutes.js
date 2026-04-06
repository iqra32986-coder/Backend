const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getAllRestaurants, getRestaurantById, getGlobalStats } = require('../controllers/restaurantController');
const { protect, restaurantOnly } = require('../middleware/authMiddleware');

router.route('/summary').get(getGlobalStats);
router.route('/myprofile').get(protect, restaurantOnly, getMyProfile).put(protect, restaurantOnly, updateMyProfile);
router.route('/').get(getAllRestaurants);
router.route('/:id').get(getRestaurantById);

module.exports = router;
