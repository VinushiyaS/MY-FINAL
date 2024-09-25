const express = require('express');
const router = express.Router();
const { register, login, resetPassword, registerAdmin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Import the adminMiddleware

// User routes
router.post('/register', register); 
router.post('/login', login);
router.post('/reset-password', resetPassword);

// Admin routes (Protected)
router.post('/admin/register', authMiddleware, adminMiddleware, registerAdmin);


module.exports = router;
