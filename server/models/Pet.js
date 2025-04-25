const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const Pet = {
  async getAll() {
    const result = await pool.query('SELECT * FROM pets');
    return result.rows;
  },

  async create(data) {
    const { type, description, location, lat, lng, image } = data;
    const result = await pool.query(
      'INSERT INTO pets (type, description, location, lat, lng, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [type, description, location, lat, lng, image]
    );
    return result.rows[0];
  }
};

module.exports = Pet;