const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const { upload } = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

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

// Подключение маршрутов (оставляем только user.js)
app.use('/api/users', require('./routes/user'));

// Загрузка изображений
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    console.log('Загружено изображение:', req.file.path);
    res.json({ imageUrl: req.file.path });
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    res.status(500).json({ error: 'Ошибка при загрузке изображения' });
  }
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, phone, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role',
      [name, phone, hashedPassword, 'user']
    );
    console.log('Server: POST /api/register, пользователь создан:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Server: Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query('SELECT id, name, phone, password_hash, role FROM users WHERE phone = $1', [phone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Неверный пароль' });

    const userRole = user.role || 'user';
    const token = jwt.sign({ id: user.id, phone: user.phone, role: userRole }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Server: POST /api/login, токен выдан:', user.id, 'role:', userRole);
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: userRole } });
  } catch (error) {
    console.error('Server: Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение всех животных (исключаем удалённые)
app.get('/api/pets', async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT p.*, u.name, u.phone, pms.status AS status_moderation, pms.comment AS moderation_comment
    FROM pets p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN pet_moderation_status pms ON p.id = pms.pet_id
    WHERE (pms.status = 'approved' OR pms.status IS NULL)
    AND p.deleted_at IS NULL
  `;

  if (status) {
    query += ` AND p.status = $1`;
  }

  try {
    const result = status ? await pool.query(query, [status]) : await pool.query(query);
    console.log('Server: GET /api/pets, отправлено:', result.rows.length, 'животных');
    res.json(result.rows);
  } catch (error) {
    console.error('Server: Ошибка получения животных:', error);
    res.status(500).json({ error: 'Ошибка при получении списка животных' });
  }
});

// Получение всех животных для администратора (включая pending, исключаем удалённые)
app.get('/api/pets/admin', authenticateToken, async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT p.*, u.name, u.phone, pms.status AS status_moderation, pms.comment AS moderation_comment
    FROM pets p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN pet_moderation_status pms ON p.id = pms.pet_id
    WHERE p.deleted_at IS NULL
  `;

  if (status) {
    query += ` AND p.status = $1`;
  }

  try {
    const result = status ? await pool.query(query, [status]) : await pool.query(query);
    console.log('Server: GET /api/pets/admin, отправлено:', result.rows.length, 'животных');
    res.json(result.rows);
  } catch (error) {
    console.error('Server: Ошибка получения животных для админа:', error);
    res.status(500).json({ error: 'Ошибка при получении списка животных' });
  }
});

// Получение животных на модерации (pending) для администратора (исключаем удалённые)
app.get('/api/pets/admin/pending', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ только для администраторов' });
  }

  try {
    const result = await pool.query(
      `
      SELECT p.*, u.name, u.phone, pms.status AS status_moderation, pms.comment AS moderation_comment
      FROM pets p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN pet_moderation_status pms ON p.id = pms.pet_id
      WHERE pms.status = 'pending'
      AND p.deleted_at IS NULL
      `
    );
    console.log('Server: GET /api/pets/admin/pending, отправлено:', result.rows.length, 'животных на модерации');
    res.json(result.rows);
  } catch (error) {
    console.error('Server: Ошибка получения животных на модерации:', error);
    res.status(500).json({ error: 'Ошибка при получении списка животных на модерации' });
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
    const moderationResult = await pool.query(
      'INSERT INTO pet_moderation_status (pet_id, status) VALUES ($1, $2) RETURNING *',
      [pet.id, 'pending']
    );

    if (moderationResult.rows.length === 0) {
      throw new Error('Не удалось создать запись модерации');
    }

    const userResult = await pool.query('SELECT name, phone FROM users WHERE id = $1', [pet.user_id]);
    pet.name = userResult.rows[0].name;
    pet.phone = userResult.rows[0].phone;
    pet.status_moderation = moderationResult.rows[0].status;

    console.log('Server: POST /api/pets, добавлено (на модерации):', pet);
    res.json(pet);
  } catch (error) {
    console.error('Server: Ошибка добавления животного:', error);
    res.status(500).json({ error: 'Ошибка при добавлении животного: ' + error.message });
  }
});

// Обновление животного
app.put('/api/pets/:id', authenticateToken, async (req, res) => {
  const petId = req.params.id;
  const { type, description, lat, lng, image, status } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT user_id, deleted_at FROM pets WHERE id = $1', [petId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }
    if (result.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Животное уже удалено' });
    }
    if (result.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав для редактирования этого животного' });
    }

    if (!['Потеряно', 'Найдено'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    const updateResult = await pool.query(
      'UPDATE pets SET type = $1, description = $2, lat = $3, lng = $4, image = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [type, description, lat, lng, image, status, petId]
    );

    const updatedPet = updateResult.rows[0];
    const userResult = await pool.query('SELECT name, phone FROM users WHERE id = $1', [updatedPet.user_id]);
    const moderationResult = await pool.query('SELECT status, comment FROM pet_moderation_status WHERE pet_id = $1', [petId]);
    updatedPet.name = userResult.rows[0].name;
    updatedPet.phone = userResult.rows[0].phone;
    updatedPet.status_moderation = moderationResult.rows[0]?.status || 'pending';
    updatedPet.moderation_comment = moderationResult.rows[0]?.comment || null;

    console.log('Server: PUT /api/pets/:id, обновлено:', updatedPet);
    res.json(updatedPet);
  } catch (err) {
    console.error('Server: PUT /api/pets/:id error:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении животного' });
  }
});

// Удаление животного (теперь используем мягкое удаление)
app.delete('/api/pets/:id', authenticateToken, async (req, res) => {
  const petId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { reason } = req.body;

  try {
    // Проверяем, существует ли запись и не удалена ли она уже
    const petResult = await pool.query(
      'SELECT id, user_id, deleted_at FROM pets WHERE id = $1',
      [petId]
    );
    if (petResult.rows.length === 0) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }
    const pet = petResult.rows[0];
    if (pet.deleted_at !== null) {
      return res.status(400).json({ error: 'Животное уже удалено' });
    }
    if (userRole !== 'admin' && pet.user_id !== userId) {
      return res.status(403).json({ error: 'Нет прав для удаления этого животного' });
    }

    // Проверяем причину удаления для не-админов
    if (userRole !== 'admin' && (!reason || !['Животное нашлось', 'Животное так и не нашлось, я потерял надежду'].includes(reason))) {
      return res.status(400).json({ error: 'Необходимо указать корректную причину удаления' });
    }

    // Выполняем мягкое удаление
    await pool.query(
      'UPDATE pets SET deleted_at = NOW(), deletion_reason = $1 WHERE id = $2',
      [reason || null, petId]
    );

    console.log('Server: DELETE /api/pets/:id, помечено как удалённое:', petId, 'причина:', reason || 'не указана');
    res.json({ message: 'Животное помечено как удалённое' });
  } catch (err) {
    console.error('Server: DELETE /api/pets/:id error:', err);
    res.status(500).json({ error: 'Ошибка при удалении животного: ' + err.message });
  }
});

// Получение животных пользователя (исключаем удалённые)
app.get('/api/pets/user', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.name, u.phone, pms.status AS status_moderation, pms.comment AS moderation_comment ' +
      'FROM pets p ' +
      'JOIN users u ON p.user_id = u.id ' +
      'LEFT JOIN pet_moderation_status pms ON p.id = pms.pet_id ' +
      'WHERE p.user_id = $1 ' +
      'AND p.deleted_at IS NULL',
      [req.user.id]
    );
    console.log('Server: GET /api/pets/user, отправлено:', result.rows.length, 'животных');
    res.json(result.rows);
  } catch (err) {
    console.error('Server: GET /api/pets/user error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Модерация объявлений
app.put('/api/pets/moderate/:id', authenticateToken, async (req, res) => {
  const petId = req.params.id;
  const { status_moderation, comment } = req.body;

  if (!['approved', 'rejected'].includes(status_moderation)) {
    return res.status(400).json({ error: 'Недопустимый статус модерации' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ только для администраторов' });
  }

  try {
    const petResult = await pool.query('SELECT id, deleted_at FROM pets WHERE id = $1', [petId]);
    if (petResult.rows.length === 0) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }
    if (petResult.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Животное удалено и не может быть отмодерировано' });
    }

    const moderationResult = await pool.query(
      'UPDATE pet_moderation_status SET status = $1, comment = $2, moderated_at = NOW() WHERE pet_id = $3 RETURNING *',
      [status_moderation, comment || null, petId]
    );

    if (moderationResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO pet_moderation_status (pet_id, status, comment, moderated_at) VALUES ($1, $2, $3, NOW())',
        [petId, status_moderation, comment || null]
      );
    }

    const updatedPetResult = await pool.query(
      'SELECT p.*, u.name, u.phone, pms.status AS status_moderation, pms.comment AS moderation_comment ' +
      'FROM pets p ' +
      'JOIN users u ON p.user_id = u.id ' +
      'LEFT JOIN pet_moderation_status pms ON p.id = pms.pet_id ' +
      'WHERE p.id = $1',
      [petId]
    );

    const updatedPet = updatedPetResult.rows[0];
    console.log('Server: PUT /api/pets/moderate/:id, модерация:', updatedPet);
    res.json(updatedPet);
  } catch (err) {
    console.error('Server: PUT /api/pets/moderate/:id error:', err);
    res.status(500).json({ error: 'Ошибка сервера при модерации' });
  }
});

// Получение данных пользователя
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Server: GET /api/users/me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление профиля пользователя
app.put('/api/users/me', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, phone, role',
      [name, phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Server: PUT /api/users/me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение комментариев к объявлению
app.get('/api/pets/:id/comments', async (req, res) => {
  const petId = req.params.id;
  try {
    const petCheck = await pool.query('SELECT deleted_at FROM pets WHERE id = $1', [petId]);
    if (petCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }
    if (petCheck.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Объявление удалено' });
    }

    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.pet_id = $1
       ORDER BY c.created_at DESC`,
      [petId]
    );
    console.log(`Server: GET /api/pets/${petId}/comments, отправлено: ${result.rows.length} комментариев`);
    res.json(result.rows);
  } catch (error) {
    console.error('Server: Ошибка получения комментариев:', error);
    res.status(500).json({ error: 'Ошибка при получении комментариев' });
  }
});

// Добавление комментария
app.post('/api/comments', authenticateToken, async (req, res) => {
  const { pet_id, content } = req.body;
  const userId = req.user.id;

  if (!content || !pet_id) {
    return res.status(400).json({ error: 'Не указан текст комментария или ID объявления' });
  }

  try {
    // Проверяем, существует ли объявление и не удалено ли оно
    const petCheck = await pool.query('SELECT user_id, type, deleted_at FROM pets WHERE id = $1', [pet_id]);
    if (petCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }
    if (petCheck.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Объявление удалено' });
    }
    const pet = petCheck.rows[0];

    // Создаём комментарий
    const result = await pool.query(
      'INSERT INTO comments (pet_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [pet_id, userId, content]
    );
    const comment = result.rows[0];

    // Получаем имя комментатора
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    comment.name = userResult.rows[0].name;

    // Создаём уведомление для владельца, если комментатор не владелец
    if (pet.user_id !== userId) {
      const notificationMessage = `Новый комментарий от ${comment.name}: ${comment.content}`;
      await pool.query(
        'INSERT INTO notifications (user_id, pet_id, comment_id, type, message, created_at, read) VALUES ($1, $2, $3, $4, $5, NOW(), $6)',
        [pet.user_id, pet_id, comment.id, 'new_comment', notificationMessage, false]
      );
      console.log(`Server: Создано уведомление для userId=${pet.user_id}, pet_id=${pet_id}, comment_id=${comment.id}`);
    } else {
      console.log(`Server: Уведомление не создано, так как комментатор (userId=${userId}) является владельцем объявления`);
    }

    console.log('Server: POST /api/comments, добавлен комментарий:', comment);
    res.json(comment);
  } catch (error) {
    console.error('Server: Ошибка добавления комментария или создания уведомления:', error);
    res.status(500).json({ error: 'Ошибка при добавлении комментария' });
  }
});

// Удаление комментария (для админов или владельца комментария)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Проверяем, существует ли комментарий и принадлежит ли он пользователю
    const comment = await pool.query('SELECT user_id, pet_id FROM comments WHERE id = $1', [commentId]);
    if (comment.rowCount === 0) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    // Проверяем, не удалено ли объявление
    const petCheck = await pool.query('SELECT deleted_at FROM pets WHERE id = $1', [comment.rows[0].pet_id]);
    if (petCheck.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Объявление удалено, комментарий нельзя удалить' });
    }

    // Разрешаем удаление, если пользователь — админ или владелец комментария
    if (userRole !== 'admin' && comment.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Доступ запрещён. Вы не автор комментария или не администратор.' });
    }

    // Удаляем комментарий
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    console.log(`Server: DELETE /api/comments/${commentId}, удалён пользователем userId=${userId}, role=${userRole}`);
    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('Server: Ошибка удаления комментария:', error);
    res.status(500).json({ error: 'Ошибка при удалении комментария' });
  }
});

// Получение уведомлений пользователя
app.get('/api/notifications', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT n.id, n.pet_id, n.comment_id, n.type, n.message, n.created_at, n.read, p.type AS pet_type
       FROM notifications n
       JOIN pets p ON n.pet_id = p.id
       WHERE n.user_id = $1
       AND p.deleted_at IS NULL
       ORDER BY n.created_at DESC`,
      [userId]
    );
    console.log(`Server: GET /api/notifications, отправлено ${result.rows.length} уведомлений для userId=${userId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Server: Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Отметка уведомления как прочитанного
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  try {
    const notificationCheck = await pool.query(
      'SELECT n.pet_id FROM notifications n WHERE n.id = $1 AND n.user_id = $2',
      [notificationId, userId]
    );
    if (notificationCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Уведомление не найдено или не принадлежит пользователю' });
    }

    const petCheck = await pool.query('SELECT deleted_at FROM pets WHERE id = $1', [notificationCheck.rows[0].pet_id]);
    if (petCheck.rows[0].deleted_at !== null) {
      return res.status(400).json({ error: 'Объявление удалено, уведомление нельзя обновить' });
    }

    const result = await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );
    console.log(`Server: PATCH /api/notifications/${notificationId}/read, уведомление отмечено прочитанным для userId=${userId}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Server: Ошибка обновления уведомления:', error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомления' });
  }
});

// Обработка 404 для API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Статические файлы
app.use(express.static(path.join(__dirname, '../client/build')));

// Если путь не найден среди API, отправляем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});