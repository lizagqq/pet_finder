const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
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

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Имя, телефон и пароль обязательны' });
  }

  const phoneRegex = /^((\+7|8)[0-9]{10})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат телефона. Пример: +79991234567 или 89991234567' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role',
      [name, phone, password, 'user'] // Устанавливаем роль по умолчанию как 'user'
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Server: POST /api/register error:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Телефон и пароль обязательны' });
  }

  try {
    const result = await pool.query('SELECT id, name, phone, role FROM users WHERE phone = $1 AND password = $2', [phone, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('Server: POST /api/login error:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Получение данных пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone, role FROM users WHERE id = $1', [req.user.id]);
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

  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны' });
  }

  const phoneRegex = /^((\+7|8)[0-9]{10})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат телефона. Пример: +79991234567 или 89991234567' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, phone, role',
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