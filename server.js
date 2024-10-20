const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dotenv = require('dotenv');
const http = require('http'); // Import http module to work with Socket.IO
const { Server } = require('socket.io'); // Import Socket.IO
const tournamentRoutes = require('./routes/tournamentRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create an HTTP server to work with Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*', // Allow any origin, change this for security in production
        methods: ['GET', 'POST'],
    },
});

// Import routes
const playerRoutes = require('./routes/player');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const subscription = require('./routes/subscription');
const Subscription = require('./modals/Subscription'); // Ensure this model exists

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        setTimeout(connectToMongoDB, 5000); // Retry after 5 seconds if connection fails
    }
};
connectToMongoDB();

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like 'SendGrid' or 'Mailgun'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/subscriptions', subscription);
app.use('/api/tournaments', tournamentRoutes);


// Socket.IO for Live Bidding
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Event listener for starting a new auction
    socket.on('joinAuction', (auctionId) => {
        socket.join(auctionId); // Join a room for the specific auction
        console.log(`Client ${socket.id} joined auction: ${auctionId}`);
    });

    // Event listener for new bids
    socket.on('newBid', (bidData) => {
        const { auctionId, bidAmount, bidderName } = bidData;
        console.log(`New bid: ${bidAmount} by ${bidderName} in auction ${auctionId}`);
        
        // Broadcast the new bid to all clients in the auction room
        io.to(auctionId).emit('bidUpdate', {
            auctionId,
            bidAmount,
            bidderName,
        });
    });

    // Event listener for auction end
    socket.on('endAuction', (auctionId) => {
        console.log(`Auction ${auctionId} ended`);
        io.to(auctionId).emit('auctionEnded', { auctionId });
        socket.leave(auctionId); // Leave the auction room
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Scheduled task for subscription expiry notifications
cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date(new Date().setUTCHours(0, 0, 0, 0)); // Midnight UTC today
        const twoDaysAhead = new Date(today);
        twoDaysAhead.setDate(today.getDate() + 2); // 2 days ahead

        const expiringSubscriptions = await Subscription.find({
            expiryDate: { $lte: twoDaysAhead, $gte: today },
            status: 'Active',
        });

        expiringSubscriptions.forEach((subscription) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: subscription.email,
                subject: 'Subscription Expiry Notice',
                text: `Dear ${subscription.name},\n\nYour subscription is about to expire on ${subscription.expiryDate}. Please renew it to avoid service interruption.\n\nThank you.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log(`Expiry notice sent to ${subscription.email}`);
                }
            });
        });
    } catch (error) {
        console.error('Error during subscription expiry check:', error);
    }
});

// Start HTTP and WebSocket server
server.listen(PORT, () => {
    console.log(`Server and WebSocket listening on port ${PORT}`);
});
