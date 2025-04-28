const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const jwt = require('jsonwebtoken');

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

router.get('/', async (req, res) => {
  try {
    const pets = await Pet.getAll();
    console.log('Sending pets:', pets);
    res.json(pets);
  } catch (err) {
    console.error('GET /api/pets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/pets received:', req.body);
    const petData = {
      ...req.body,
      user_id: req.user.id
    };
    const pet = await Pet.create(petData);
    console.log('Created pet:', pet);
    res.status(201).json(pet);
  } catch (err) {
    console.error('POST /api/pets error:', err);
    res.status(400).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;