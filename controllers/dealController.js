const Deal = require('../models/Deal');
const RestaurantProfile = require('../models/RestaurantProfile');

const getDeals = async (req, res) => {
    try {
        const deals = await Deal.find({ active: true })
            .populate({ path: 'restaurant_id', select: 'name bio description location' })
            .populate('items');
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createDeal = async (req, res) => {
    try {
        const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Restaurant Profile not found' });

        const { title, description, discountValue, price, imageUrl, items } = req.body;
        const deal = new Deal({
            restaurant_id: profile._id,
            title,
            description,
            discountValue,
            price,
            imageUrl,
            items
        });
        const savedDeal = await deal.save();
        res.status(201).json(savedDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateDeal = async (req, res) => {
    try {
        const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Restaurant Profile not found' });

        const deal = await Deal.findById(req.params.id);
        if (deal) {
            // Security: Only owner can update
            if (deal.restaurant_id.toString() !== profile._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            
            const { title, description, discountValue, price, imageUrl, items, active } = req.body;
            deal.title = title || deal.title;
            deal.description = description || deal.description;
            deal.discountValue = discountValue || deal.discountValue;
            deal.price = price !== undefined ? price : deal.price;
            deal.imageUrl = imageUrl || deal.imageUrl;
            deal.items = items || deal.items;
            deal.active = active !== undefined ? active : deal.active;

            const updatedDeal = await deal.save();
            res.json(updatedDeal);
        } else {
            res.status(404).json({ message: 'Deal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteDeal = async (req, res) => {
    try {
        const profile = await RestaurantProfile.findOne({ user_id: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Restaurant Profile not found' });

        const deal = await Deal.findById(req.params.id);
        if (deal) {
            if (deal.restaurant_id.toString() !== profile._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await deal.deleteOne();
            res.json({ message: 'Promo deal removed' });
        } else {
            res.status(404).json({ message: 'Deal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getDeals, createDeal, updateDeal, deleteDeal };
