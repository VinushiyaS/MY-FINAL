// models/Tournament.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bidPoints: { type: Number, default: 0 },
});

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    auctionDate: { type: Date, required: true },
    teams: [{ type: String, required: true }],
    players: [playerSchema], // Array of players
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
