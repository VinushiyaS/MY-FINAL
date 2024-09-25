const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  name: { type: String, required: true },
  batsman: { type: String, enum: ['Right', 'Left'], required: true },
  bowler: { type: Boolean, required: true },
  allrounder: { type: Boolean, required: true },
  number: { type: Number, required: true }
});

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
