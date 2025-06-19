import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AppDataSource } from './config/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    CategoriesModule,
    ProductsModule,
  ],
})
export class AppModule {}