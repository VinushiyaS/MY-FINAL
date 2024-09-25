// routes/subscription.js
const express = require('express');
const router = express.Router();
const Subscription = require('../modals/Subscription'); // Correct path to your Subscription model

// Get all subscriptions
router.get('/', async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel a subscription
router.post('/cancel/:id', async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        subscription.status = 'Cancelled';
        await subscription.save();
        res.json({ message: 'Subscription cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
