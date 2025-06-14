import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPriceConstraint1712345678902 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM products WHERE price <= 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}