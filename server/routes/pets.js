const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

router.get('/', async (req, res) => {
  try {
    const pets = await Pet.getAll();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const pet = await Pet.create(req.body);
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;