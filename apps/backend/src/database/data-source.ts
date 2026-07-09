import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file in the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'thrivelab_db',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Entities are located inside the src folder
  entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
  // Enable logs in the development environment
  logging: process.env.NODE_ENV === 'dev',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
