const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'], // Add committeeLeader here
        default: 'user', // Default can still be 'user'
    },
});

module.exports = mongoose.model('User', UserSchema);
