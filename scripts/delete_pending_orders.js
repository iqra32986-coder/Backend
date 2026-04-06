const mongoose = require('mongoose');
const Order = require('./models/Order');
const dotenv = require('dotenv');

dotenv.config();

const deletePendingOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const result = await Order.deleteMany({ status: 'Pending' });
        console.log(`Successfully deleted ${result.deletedCount} pending orders.`);

        process.exit();
    } catch (error) {
        console.error('Error deleting orders:', error);
        process.exit(1);
    }
};

deletePendingOrders();
