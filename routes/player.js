const express = require('express'); // Import Express
const router = express.Router();    // Initialize the router
const Player = require('../modals/Player'); // Import the Player model

// Add a new player
router.post('/player', async (req, res) => {
  const { teamId, name, batsman, bowler, allrounder, number } = req.body;
  try {
    const newPlayer = new Player({ teamId, name, batsman, bowler, allrounder, number });
    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get players by team
router.get('/players/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const players = await Player.find({ teamId });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a player
router.put('/player/:id', async (req, res) => {
  const { id } = req.params;
  const { name, batsman, bowler, allrounder, number } = req.body;
  try {
    const player = await Player.findById(id);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    player.name = name || player.name;
    player.batsman = batsman || player.batsman;
    player.bowler = bowler || player.bowler;
    player.allrounder = allrounder || player.allrounder;
    player.number = number || player.number;

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; // Export the router
