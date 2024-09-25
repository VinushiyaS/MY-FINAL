const jwt = require('jsonwebtoken');
const User = require('../modals/User'); // Updated to 'models'

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        req.user = user; // Attach user to req for further use if needed
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = adminMiddleware;
