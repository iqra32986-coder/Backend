const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getAnalytics, getSettings, updateSetting, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/users').get(protect, adminOnly, getUsers);
router.route('/users/:id').delete(protect, adminOnly, deleteUser);
router.route('/users/:id/role').patch(protect, adminOnly, updateUserRole);
router.route('/analytics').get(protect, adminOnly, getAnalytics);
router.route('/settings').get(getSettings).post(protect, adminOnly, updateSetting);

module.exports = router;
