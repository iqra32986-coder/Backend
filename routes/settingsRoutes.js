const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @desc    Get specific public setting by key (e.g., hallStatus)
// @route   GET /api/settings/:key
// @access  Public
router.get('/:key', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (setting) {
            res.json(setting);
        } else {
            // If doesn't exist, return a default
            res.json({ key: req.params.key, value: 'Available Space' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
