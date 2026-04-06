const mongoose = require('mongoose');
const RestaurantProfile = require('./models/RestaurantProfile');
const MenuItem = require('./models/MenuItem');
const Deal = require('./models/Deal');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/foodcourt';

const fixData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find Restaurant 1
        const restaurantUser = await User.findOne({ name: 'Restaurant 1' });
        if (!restaurantUser) {
            console.error('Restaurant 1 not found');
            process.exit(1);
        }

        const profile = await RestaurantProfile.findOne({ user_id: restaurantUser._id });
        if (!profile) {
            console.error('Profile not found');
            process.exit(1);
        }

        // 2. Clear and Reset Tables (Exactly 2 for Restaurant 1)
        profile.tables = [
            { tableNumber: '1', tableName: 'Window Side', capacity: 4, placement: 'Near Window', isWindowSeat: true, status: 'Available' },
            { tableNumber: '2', tableName: 'Executive Lounge', capacity: 2, placement: 'Interior', isWindowSeat: false, status: 'Available' }
        ];
        await profile.save();
        console.log('Tables reset for Restaurant 1');

        // 3. Remove Existing Menu Items and Deals
        await MenuItem.deleteMany({ restaurant_id: profile._id });
        await Deal.deleteMany({ restaurant_id: profile._id });
        console.log('Old menu and deals cleared');

        // 4. Add 7 Desi Items
        const desiItems = [
            { name: 'Chicken Biryani', price: 550, category: 'Main Course', ingredients: ['Basmati Rice', 'Chicken', 'Spices'], imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop' },
            { name: 'Mutton Karahi', price: 1400, category: 'Main Course', ingredients: ['Mutton', 'Tomato', 'Ginger', 'Chili'], imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop' },
            { name: 'Seekh Kabab (4 pcs)', price: 600, category: 'Appetizer', ingredients: ['Minced Beef', 'Onion', 'Herbs'], imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop' },
            { name: 'Butter Naan', price: 60, category: 'Bread', ingredients: ['Flour', 'Yeast', 'Butter'], imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=800&auto=format&fit=crop' },
            { name: 'Daal Mash', price: 350, category: 'Main Course', ingredients: ['White Lentils', 'Butter', 'Garlic'], imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop' },
            { name: 'Palak Paneer', price: 450, category: 'Main Course', ingredients: ['Spinach', 'Cottage Cheese', 'Cream'], imageUrl: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?q=80&w=800&auto=format&fit=crop' },
            { name: 'Gulab Jamun (2 pcs)', price: 180, category: 'Dessert', ingredients: ['Milk Solids', 'Sugar Syrup'], imageUrl: 'https://images.unsplash.com/photo-1589119908632-488829a2e88a?q=80&w=800&auto=format&fit=crop' }
        ];

        const savedItems = [];
        for (const item of desiItems) {
            const newItem = await MenuItem.create({ ...item, restaurant_id: profile._id });
            savedItems.push(newItem);
        }
        console.log('7 Desi items added');

        // 5. Add a Deal
        await Deal.create({
            restaurant_id: profile._id,
            title: 'Traditional Feast',
            description: 'Experience authentic flavors with our specialty combo.',
            discountValue: '20% OFF',
            price: 1850,
            items: [savedItems[0]._id, savedItems[1]._id], // Biryani and Karahi
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop'
        });
        console.log('Deal added');

        console.log('Data fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing data:', error);
        process.exit(1);
    }
};

fixData();
