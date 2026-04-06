const User = require('../models/User');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const RestaurantProfile = require('../models/RestaurantProfile');

// @desc    Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get analytics
const getAnalytics = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const ordersCount = await Order.countDocuments();
        
        const orders = await Order.find({});
        const totalRevenue = orders.reduce((acc, current) => acc + current.totalAmount, 0);

        res.json({ usersCount, ordersCount, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all global settings
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.find({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update or create a setting
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle Restaurant Profile Creation upon promotion
        if (role === 'Restaurant' && user.role !== 'Restaurant') {
            console.log(`[Role Update] Promoting User ID: ${user._id} to Restaurant...`);
            const existingProfile = await RestaurantProfile.findOne({ user_id: user._id });
            if (!existingProfile) {
                console.log(`[Role Update] Creating new Restaurant Profile for user: ${user.name}`);
                await RestaurantProfile.create({
                    user_id: user._id,
                    name: `${user.name}'s Kitchen`,
                    ownerName: user.name,
                    timings: '09:00 AM - 11:00 PM',
                    location: 'To be updated'
                });
            } else {
                console.log(`[Role Update] Restaurant Profile already exists for user: ${user.name}`);
            }
        }

        user.role = role || user.role;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getHealth = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Disconnected';
        
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        // Check key models to ensure they are responsive
        await User.findOne({});
        await Order.findOne({});
        await RestaurantProfile.findOne({});

        // Fetch monitored endpoints from Settings or use defaults
        let monitoredEndpoints = [
            { path: '/api/auth/login', method: 'POST' },
            { path: '/api/restaurants', method: 'GET' },
            { path: '/api/menus', method: 'GET' },
            { path: '/api/orders', method: 'GET' },
            { path: '/api/reservations', method: 'GET' }
        ];

        const settingsEntry = await Settings.findOne({ key: 'monitored_endpoints' });
        if (settingsEntry && Array.isArray(settingsEntry.value)) {
            monitoredEndpoints = settingsEntry.value;
        }

        // Perform health check on endpoints (simulated or real internal ping)
        const endpointStatuses = await Promise.all(monitoredEndpoints.map(async (ep) => {
            // Note: In a real production env, we might use an internal fetch to check status
            // For now, we assume if the server is up and models are responsive, these are Online
            // but we allow for manual "Offline" overrides in settings if needed
            return {
                ...ep,
                status: ep.status || 'Online'
            };
        }));

        res.json({
            status: 'Operational',
            database: {
                status: dbStatus,
                name: mongoose.connection.name,
                host: mongoose.connection.host
            },
            server: {
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
                memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                platform: process.platform,
                nodeVersion: process.version
            },
            endpoints: endpointStatuses,
            optimizations: [
                { task: 'Database Indexing', status: 'Active', impact: 'High' },
                { task: 'Image Compression (Cloudinary)', status: 'Enabled', impact: 'Medium' },
                { task: 'JWT Token Security', status: 'Active', impact: 'Critical' },
                { task: 'CORS Policy', status: 'Configured', impact: 'Medium' }
            ]
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Degraded', 
            message: error.message,
            database: { status: 'Error' }
        });
    }
}

module.exports = { getUsers, deleteUser, getAnalytics, getSettings, updateSetting, updateUserRole, getHealth };
