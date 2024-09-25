// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../modals/User'); // Make sure the path is correct

// Register User
exports.register = async (req, res) => {
    const { userName, email, password, role } = req.body;

    // Prevent assigning admin role during user registration
    if (role && role !== 'user') {
        return res.status(403).json({ msg: 'Unauthorized to assign this role' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            userName,
            email,
            password,
            role: 'user', // Set role as 'user' by default
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ msg: 'User registered successfully', role: user.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Updated Register Admin function in authController.js
exports.registerAdmin = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        // Check if there is already an admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(403).json({ msg: 'Only one admin is allowed.' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new admin
        const admin = new User({
            userName,
            email,
            password,
            role: 'admin', // Set role as 'admin'
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);

        await admin.save();
        res.status(201).json({ msg: 'Admin registered successfully', role: admin.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// Login User
exports.login = async (req, res) => {
    const { email, password, role } = req.body; // Get role from req.body

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
// Debugging logs
console.log("User from DB:", user);
console.log("Selected Role:", role);
        // Check if the role matches with the user's role in the database
        if (user.role !== role) {
            return res.status(403).json({ msg: 'Incorrect role selected' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate token
        const payload = {
            user: {
                id: user.id,
                role: user.role,  // Include user role in the payload
            },
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reset Password 
exports.resetPassword = (req, res) => {
    res.send('Reset Password');
};
