const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

router.get('/', async (req, res) => {
  try {
    const pets = await Pet.getAll();
    res.json(pets);
  } catch (err) {
    console.error('GET /api/pets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/pets received:', req.body); 
    const pet = await Pet.create(req.body);
    console.log('Created pet:', pet); 
    res.status(201).json(pet);
  } catch (err) {
    console.error('POST /api/pets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;