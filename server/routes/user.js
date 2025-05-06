const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER ,
  host: process.env.DB_HOST ,
  database: process.env.DB_NAME ,
  password: process.env.DB_PASSWORD ,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? true : false,
});

// Middleware для проверки токена
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

// Получение данных пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    console.log('Server: GET /api/users/me, отправлено:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Server: GET /api/users/me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление данных пользователя
router.put('/me', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;

  // Валидация входных данных
  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны' });
  }

  // Проверка формата телефона (пример: +7 или 8, затем 10 цифр)
  const phoneRegex = /^((\+7|8)[0-9]{10})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат телефона. Пример: +79991234567 или 89991234567' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, phone',
      [name, phone, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('Server: PUT /api/users/me, обновлено:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Server: PUT /api/users/me error:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении данных' });
  }
});

module.exports = router;