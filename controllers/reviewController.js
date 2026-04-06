const Review = require('../models/Review');

const createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    const review = await Review.create({
      customer_id: req.user._id,
      targetType,
      targetId,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    let query = {};
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;

    const reviews = await Review.find(query)
        .populate('customer_id', 'name tag')
        .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a specific restaurant
const getReviewsByRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({ targetType: 'Restaurant', targetId: req.params.id })
        .populate('customer_id', 'name tag')
        .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            if (review.customer_id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to edit this review' });
            }
            review.rating = req.body.rating || review.rating;
            review.comment = req.body.comment || review.comment;
            review.status = 'Edited';
            const updated = await review.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            // Allow Owner or Admin to delete
            if (review.customer_id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await review.deleteOne();
            res.json({ message: 'Review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createReview, getReviews, getReviewsByRestaurant, updateReview, deleteReview };
