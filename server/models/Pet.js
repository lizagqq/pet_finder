require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? true : false,
});

const Pet = {
  async getAll() {
    try {
      const result = await pool.query(`
        SELECT p.*, u.phone
        FROM pets p
        JOIN users u ON p.user_id = u.id
      `);
      return result.rows;
    } catch (err) {
      console.error('Error in getAll:', err);
      throw err;
    }
  },

  async create(data) {
    try {
      const { type, description, lat, lng, image, user_id, status } = data;
      if (!['Потеряно', 'Найдено'].includes(status)) {
        throw new Error('Недопустимый статус');
      }
      const result = await pool.query(
        'INSERT INTO pets (type, description, lat, lng, image, user_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
        [type, description, lat || null, lng || null, image || null, user_id, status]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in create:', err);
      throw err;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT p.*, u.phone FROM pets p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        throw new Error('Питомец не найден');
      }
      return result.rows[0];
    } catch (err) {
      console.error('Error in findById:', err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM pets WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        throw new Error('Питомец не найден');
      }
      return result.rows[0];
    } catch (err) {
      console.error('Error in delete:', err);
      throw err;
    }
  },
};

module.exports = Pet;