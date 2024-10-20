// controllers/tournamentController.js
const Tournament = require('../modals/Tournament');

// Get all tournaments
exports.getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new tournament
exports.createTournament = async (req, res) => {
    try {
        const { name, auctionDate, teams, players } = req.body;
        const newTournament = new Tournament({ name, auctionDate, teams, players });
        await newTournament.save();
        res.status(201).json(newTournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single tournament by ID
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a tournament (e.g., add or update players)
exports.updateTournament = async (req, res) => {
    try {
        const updatedTournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
