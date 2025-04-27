const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pet_finder',
  password: process.env.PG_PASSWORD || 'your_password',
  port: 5432
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    console.log('Decoded user:', user);
    req.user = user;
    next();
  });
};

// Регистрация
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  console.log('Received POST /api/register:', req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, phone, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role',
      [name, phone, hashedPassword, 'user']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Логин
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  console.log('Received POST /api/login:', req.body);
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];
    console.log('Found user:', user);
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword);
    if (!validPassword) return res.status(400).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token:', token);
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение списка животных
app.get('/api/pets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.phone, ps.status
      FROM pets p
      JOIN users u ON p.user_id = u.id
      JOIN pet_statuses ps ON p.id = ps.pet_id
      WHERE ps.is_active = true
    `);
    console.log('Sending pets:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавление животного
app.post('/api/pets', authenticateToken, async (req, res) => {
  const { type, description, lat, lng, image, status } = req.body;
  const userId = req.user.id;
  console.log('Received POST /api/pets:', req.body);
  try {
    // Проверка статуса
    if (!['lost', 'founded'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    // Вставка в pets
    const petResult = await pool.query(
      'INSERT INTO pets (type, description, lat, lng, image, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, description, lat, lng, image, userId]
    );
    const pet = petResult.rows[0];

    // Вставка в pet_statuses
    await pool.query(
      'INSERT INTO pet_statuses (pet_id, status, is_active) VALUES ($1, $2, $3)',
      [pet.id, status, true]
    );

    // Получить телефон и статус для ответа
    const userResult = await pool.query('SELECT phone FROM users WHERE id = $1', [pet.user_id]);
    pet.phone = userResult.rows[0].phone;
    pet.status = status;
    res.json(pet);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Статические файлы и SPA-роутинг
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});