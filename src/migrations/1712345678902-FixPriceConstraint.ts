import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPriceConstraint1712345678902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('products');
    
    if (tableExists) {
      await queryRunner.query(`DELETE FROM products WHERE price <= 0`);
    } else {
      console.warn('Таблица products не существует, миграция пропущена');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Миграция FixPriceConstraint не может быть отменена');
  }
}