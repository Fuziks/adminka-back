import { DataSource } from 'typeorm';
import { resolve } from 'path';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'dpg-d16d6a6mcj7s73c0u000-a.frankfurt-postgres.render.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres1',
  password: process.env.DB_PASSWORD || 'G0xmciPahwAa4G0AbQ9bmrBAxFGGq5gv',
  database: process.env.DB_NAME || 'pc_components_xnjj',
  entities: [Category, Product],
  migrations: [resolve(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: true,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  logging: true,
  migrationsRun: true, 
});