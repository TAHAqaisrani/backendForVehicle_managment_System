import dotenv from 'dotenv';
dotenv.config();

export default {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'vehicle_service_db',
  },
  migrations: {
    directory: './db/migrations',
    extension: 'js',
  },
  seeds: {
    directory: './db/seeds',
    extension: 'js',
  },
};
