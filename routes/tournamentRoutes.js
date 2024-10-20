const express = require('express');
const router = express.Router();
const Tournament = require('../modals/Tournament'); // Assuming you have the Tournament model

// Route to get all tournaments
router.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

module.exports = router;
