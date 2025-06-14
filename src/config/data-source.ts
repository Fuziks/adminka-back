import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

dotenv.config({ path: resolve(__dirname, '../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pc_components',
  entities: [Category, Product], 
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, 
  logging: true, 
  migrationsRun: true, 
});