const RestaurantProfile = require('../models/RestaurantProfile');
const User = require('../models/User');
const Review = require('../models/Review');

const getMyProfile = async (req, res) => {
  try {
    const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
    if (profile) {
      profile.name = req.body.name || profile.name;
      profile.ownerName = req.body.ownerName || profile.ownerName;
      profile.timings = req.body.timings || profile.timings;
      profile.bio = req.body.bio || profile.bio;
      profile.description = req.body.description || profile.description;
      profile.location = req.body.location !== undefined ? req.body.location : profile.location;
      profile.payments = req.body.payments !== undefined ? req.body.payments : profile.payments;
      profile.categories = req.body.categories !== undefined ? req.body.categories : profile.categories;
      profile.tables = req.body.tables !== undefined ? req.body.tables : profile.tables;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await RestaurantProfile.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const profile = await RestaurantProfile.findById(req.params.id);
    if (profile) {
      const Reservation = require('../models/Reservation');
      const activeReservations = await Reservation.find({ 
          restaurant_id: profile.user_id,
          status: { $in: ['Pending', 'Accepted'] } 
      });

      // Map dynamic status to tables
      const updatedTables = profile.tables.map(t => {
          const matchingRes = activeReservations.find(r => r.tableNumber === t.tableNumber);
          return {
              ...t.toObject(),
              status: matchingRes ? matchingRes.status : (t.status || 'Available')
          };
      });

      const profileObj = profile.toObject();
      profileObj.tables = updatedTables;
      
      res.json(profileObj);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const restaurantsCount = await RestaurantProfile.countDocuments();
    const customersCount = await User.countDocuments({ role: 'Customer' });
    
    // Aggregate Ratings
    const ratingStats = await Review.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      restaurants: restaurantsCount || 0,
      customers: customersCount || 0,
      avgRating: ratingStats.length > 0 ? Number(ratingStats[0].avgRating.toFixed(1)) : 4.9, // Default fallback
      totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllRestaurants, getRestaurantById, getGlobalStats };
