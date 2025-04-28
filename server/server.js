const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// ====== API маршруты ======

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
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

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Проверка токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// Получение всех животных
app.get('/api/pets', async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT p.*, u.phone
    FROM pets p
    JOIN users u ON p.user_id = u.id
  `;

  if (status) {
    query += ` WHERE p.status = $1`;
  }

  try {
    const result = status
      ? await pool.query(query, [status])
      : await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Ошибка при получении списка животных' });
  }
});

// Добавление нового животного
app.post('/api/pets', authenticateToken, async (req, res) => {
  const { type, description, lat, lng, image, status } = req.body;
  const userId = req.user.id;

  try {
    if (!['Потеряно', 'Найдено'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    const petResult = await pool.query(
      'INSERT INTO pets (type, description, lat, lng, image, user_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [type, description, lat, lng, image, userId, status]
    );

    const pet = petResult.rows[0];
    const userResult = await pool.query('SELECT phone FROM users WHERE id = $1', [pet.user_id]);
    pet.phone = userResult.rows[0].phone;

    res.json(pet);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Ошибка при добавлении животного' });
  }
});

// ====== Статические файлы ======

// Обслуживаем React-фронтенд
app.use(express.static(path.join(__dirname, '../client/build')));

// Если путь не найден среди API, отправляем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ====== Запуск сервера ======

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
