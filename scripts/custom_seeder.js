const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Deal = require('./models/Deal');

const MONGO_URI = 'mongodb://127.0.0.1:27017/foodcourt';

const REST_1_ID = '69c99c5671064fbafe449e63'; // Restaurant 1
const REST_2_ID = '69c99c5671064fbafe449e6a'; // Blondy Restuerent

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        // 1. Add 4 Premium Items for Blondy Restuerent (Rest 2)
        const blondyItems = [
            {
                restaurant_id: REST_2_ID,
                name: "Golden Saffron Risotto",
                price: 1250,
                category: "Mains",
                imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800&auto=format&fit=crop",
                description: "Creamy arborio rice infused with premium saffron and parmesan."
            },
            {
                restaurant_id: REST_2_ID,
                name: "Truffle Infused Tagliatelle",
                price: 1850,
                category: "Mains",
                imageUrl: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800&auto=format&fit=crop",
                description: "Hand-rolled pasta with black truffle shavings and garlic butter."
            },
            {
                restaurant_id: REST_2_ID,
                name: "Aged Wagyu Sirloin",
                price: 4500,
                category: "Grill",
                imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
                description: "45-day dry-aged wagyu served with charred asparagus."
            },
            {
                restaurant_id: REST_2_ID,
                name: "Artisan Tiramisu",
                price: 850,
                category: "Desserts",
                imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop",
                description: "Espresso-soaked ladyfingers with whipped mascarpone and cocoa."
            }
        ];

        const insertedItems = await MenuItem.insertMany(blondyItems);
        console.log('Inserted 4 items for Blondy Restuerent.');

        // 2. Add 1 specialized item for Restaurant 1 to use in the cross-deal
        const rest1Special = await MenuItem.create({
            restaurant_id: REST_1_ID,
            name: "Royal Mughlai Biryani",
            price: 2200,
            category: "Mains",
            imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop",
            description: "Authentic slow-cooked long grain rice with aromatic spices."
        });

        // 3. Add 6 Dynamic Deals for Restaurant 1
        const rest1Deals = [
            {
                restaurant_id: REST_1_ID,
                title: "The Royal Banquet",
                description: "Experience the ultimate Muqhlai feast with a full spread of appetizers and mains.",
                discountValue: "25% OFF",
                price: 3500,
                imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
                items: [rest1Special._id]
            },
            {
                restaurant_id: REST_1_ID,
                title: "Sunset Savor Combo",
                description: "Perfect for evening diners. Light bites and refreshing mocktails.",
                discountValue: "15% OFF",
                price: 1800,
                imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
            },
            {
                restaurant_id: REST_1_ID,
                title: "Midnight Munchies Platter",
                description: "Late night cravings satisfied with our signature sliders and loaded fries.",
                discountValue: "20% OFF",
                price: 2200,
                imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop"
            },
            {
                restaurant_id: REST_1_ID,
                title: "Healthy Harvest Deal",
                description: "Fresh organic salads and cold-pressed juices for the conscious diner.",
                discountValue: "10% OFF",
                price: 1500,
                imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
            },
            {
                restaurant_id: REST_1_ID,
                title: "Ocean's Bounty Platter",
                description: "Freshly caught seafood grilled to perfection with lemon butter sauce.",
                discountValue: "30% OFF",
                price: 4500,
                imageUrl: "https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=800&auto=format&fit=crop"
            },
            {
                restaurant_id: REST_1_ID,
                title: "Family Weekend Feast",
                description: "A gigantic meal portion suitable for a family of 4. Includes dessert.",
                discountValue: "40% OFF",
                price: 5500,
                imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop"
            }
        ];

        await Deal.insertMany(rest1Deals);
        console.log('Inserted 6 deals for Restaurant 1.');

        // 4. Create the Cross-Restaurant "SmartDine Duo Deal"
        // Using rest1Special and one of Blondy's new items (Tagliatelle)
        await Deal.create({
            title: "SmartDine Unified Feast",
            description: "A unique collaboration! Muqhlai Biryani from Rest 1 combined with Italian Truffle Pasta from Blondy's.",
            discountValue: "EXCLUSIVE",
            price: 3200,
            imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524027a?q=80&w=800&auto=format&fit=crop",
            items: [rest1Special._id, insertedItems[1]._id]
        });
        console.log('Inserted Cross-Restaurant Flagship Deal.');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
