import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Min } from 'class-validator';
import { Category } from '../../categories/entities/category.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn({ name: 'productid' })
  id: number;

  @Index()
  @Column({ name: 'name', length: 255 })
  name: string;

  @Index()
  @Column({ name: 'brand', length: 255 })
  brand: string;

  @Index()
  @Min(0.01, { message: 'Price must be greater than 0' })
  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryid' })
  category: Category | null;
}