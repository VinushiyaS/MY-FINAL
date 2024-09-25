const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dotenv = require('dotenv');
const subscription = require('./routes/subscription');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const playerRoutes = require('./routes/player');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like 'SendGrid' or 'Mailgun'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // Ensure this route is correctly set up
app.use('/api/admin', adminRoutes);
app.use('/api/players', playerRoutes); // Changed to /api/players for consistency
app.use('/api/subscriptions', subscription);

// Scheduled task for subscription expiry notifications
cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date();
        const twoDaysAhead = new Date(today);
        twoDaysAhead.setDate(today.getDate() + 2);

        const expiringSubscriptions = await Subscription.find({
            expiryDate: { $lte: twoDaysAhead, $gte: today },
            status: 'Active'
        });

        expiringSubscriptions.forEach(subscription => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: subscription.email,
                subject: 'Subscription Expiry Notice',
                text: `Dear ${subscription.name},\n\nYour subscription is about to expire on ${subscription.expiryDate}. Please renew it to avoid service interruption.\n\nThank you.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        });
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
