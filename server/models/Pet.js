require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? true : false
});

const Pet = {
  async getAll() {
    try {
      const result = await pool.query('SELECT * FROM pets');
      return result.rows;
    } catch (err) {
      console.error('Error in getAll:', err);
      throw err;
    }
  },

  async create(data) {
    try {
      const { type, description, location, lat, lng, image } = data;
      const result = await pool.query(
        'INSERT INTO pets (type, description, location, lat, lng, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [type, description, location, lat || null, lng || null, image || null]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error in create:', err);
      throw err;
    }
  }
};

module.exports = Pet;