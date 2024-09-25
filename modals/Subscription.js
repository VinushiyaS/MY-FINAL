const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subscriptionType: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, default: 'Active' } // 'Active', 'Expired'
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
