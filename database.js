require('dotenv').config()
const mysql = require('mysql')
const util = require('util')
const config = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  charset: 'utf8mb4',
  timezone: 'Z',
}
const pool = mysql.createPool(config)
// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }
  if (connection) connection.release()
  return
})
pool.query = util.promisify(pool.query)
module.exports = pool