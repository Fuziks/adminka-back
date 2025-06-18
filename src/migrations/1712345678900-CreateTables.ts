import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1712345678900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE categories (
        categoryid SERIAL PRIMARY KEY,
        categoryname VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE products (
        productid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        price DECIMAL(10,2),
        categoryid INT REFERENCES categories(categoryid)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE products`);
    await queryRunner.query(`DROP TABLE categories`);
  }
}