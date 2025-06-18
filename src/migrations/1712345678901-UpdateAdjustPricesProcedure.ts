import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAdjustPricesProcedure1712345678905 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE PROCEDURE adjust_product_prices(
        percent numeric,
        brand_filter text DEFAULT NULL,
        category_id_filter integer DEFAULT NULL,
        increase boolean DEFAULT TRUE
      )
      LANGUAGE plpgsql
      AS $$
      DECLARE
        update_query text;
        conditions text := '';
      BEGIN
        IF brand_filter IS NOT NULL THEN
          conditions := conditions || ' AND brand = ''' || brand_filter || '''';
        END IF;
        
        IF category_id_filter IS NOT NULL THEN
          conditions := conditions || ' AND categoryid = ' || category_id_filter;
        END IF;
        
        IF length(conditions) > 0 THEN
          conditions := 'WHERE ' || substring(conditions from 6);
        END IF;
        
        IF increase THEN
          update_query := 'UPDATE products SET price = price * (1 + ' || percent / 100 || ') ' || conditions;
        ELSE
          update_query := 'UPDATE products SET price = price * (1 - ' || percent / 100 || ') ' || conditions;
        END IF;
        
        EXECUTE update_query;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE PROCEDURE adjust_product_prices(
        percent numeric,
        brand_filter text DEFAULT NULL,
        category_id_filter integer DEFAULT NULL,
        increase boolean DEFAULT TRUE
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        IF increase THEN
          UPDATE products
          SET price = price * (1 + percent / 100)
          WHERE (brand_filter IS NULL OR brand = brand_filter)
            AND (category_id_filter IS NULL OR categoryid = category_id_filter);
        ELSE
          UPDATE products
          SET price = price * (1 - percent / 100)
          WHERE (brand_filter IS NULL OR brand = brand_filter)
            AND (category_id_filter IS NULL OR categoryid = category_id_filter);
        END IF;
      END;
      $$;
    `);
  }
}