const express = require('express');
const router = express.Router();
const { createReview, getReviews, getReviewsByRestaurant, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview).get(getReviews);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);
router.route('/restaurant/:id').get(getReviewsByRestaurant);

module.exports = router;
