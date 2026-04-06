const MenuItem = require('../models/MenuItem');
const RestaurantProfile = require('../models/RestaurantProfile');

// @desc    Get all menu items (with full audit data for Admin)
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({})
      .populate('restaurant_id', 'name location');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get menu items for a specific restaurant
const getRestaurantMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await MenuItem.find({ restaurant_id: id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new menu item (for restaurant)
const createMenuItem = async (req, res) => {
  try {
    const { name, price, discount, category, ingredients, notes, imageUrl } = req.body;
    const profile = await RestaurantProfile.findOne({ user_id: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Restaurant profile not found' });
    }

    const item = new MenuItem({
      restaurant_id: profile._id,
      name,
      price,
      discount,
      category,
      ingredients,
      notes,
      imageUrl
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { name, price, discount, category, ingredients, notes, imageUrl, active } = req.body;
    
    // Check if user is Admin OR the Restaurant owner of this item
    const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
    const isOwner = profile && item.restaurant_id.toString() === profile._id.toString();
    const isAdmin = req.user && req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.name = name !== undefined ? name : item.name;
    item.price = price !== undefined ? price : item.price;
    item.discount = discount !== undefined ? discount : item.discount;
    item.category = category !== undefined ? category : item.category;
    item.ingredients = ingredients !== undefined ? ingredients : item.ingredients;
    item.notes = notes !== undefined ? notes : item.notes;
    item.imageUrl = imageUrl !== undefined ? imageUrl : item.imageUrl;
    item.active = active !== undefined ? active : item.active;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      // Allow Admin or the Restaurant owner to delete
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMenuItems, getRestaurantMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
