const express = require('express');
const router = express.Router();
const User = require('../modals/User'); // Updated to 'models'
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Subscription = require('../modals/Subscription');

// Fetch subscriptions (admin)
router.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Admin routes
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Optionally, you might want to limit what data is returned
        const users = await User.find({ role: 'admin' }); // Adjust query based on needs
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
