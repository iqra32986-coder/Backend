const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const seedUsers = require('./scripts/seeder');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const dealRoutes = require('./routes/dealRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Seed the initial data async without blocking
seedUsers();

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));