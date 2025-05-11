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

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const petId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    const isOwner = pet.user_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Нет прав для удаления этого животного' });
    }

    await Pet.delete(petId);
    console.log('Server: DELETE /api/pets/:id, удалено:', petId);
    res.json({ message: 'Животное удалено' });
  } catch (err) {
    console.error('Server: DELETE /api/pets/:id error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;