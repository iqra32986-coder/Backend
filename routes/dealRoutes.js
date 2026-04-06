const express = require('express');
const router = express.Router();
const { getDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');
const { protect, restaurantOnly } = require('../middleware/authMiddleware');

router.route('/').get(getDeals).post(protect, restaurantOnly, createDeal);
router.route('/:id').put(protect, restaurantOnly, updateDeal).delete(protect, restaurantOnly, deleteDeal);

module.exports = router;
