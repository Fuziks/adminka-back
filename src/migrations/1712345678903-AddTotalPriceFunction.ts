import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalPriceFunctions1712345678903 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_total_products_price()
      RETURNS DECIMAL(10,2) AS $$
      DECLARE
        total DECIMAL(10,2);
      BEGIN
        SELECT COALESCE(SUM(price), 0) INTO total FROM products;
        RETURN total;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_category_products_price(category_id INT)
      RETURNS DECIMAL(10,2) AS $$
      DECLARE
        total DECIMAL(10,2);
      BEGIN
        SELECT COALESCE(SUM(price), 0) INTO total 
        FROM products 
        WHERE categoryid = category_id;
        RETURN total;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP FUNCTION IF EXISTS calculate_total_products_price()');
    await queryRunner.query('DROP FUNCTION IF EXISTS calculate_category_products_price(INT)');
  }
}