import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'categoryid' })
  id: number;

  @Index()
  @Column({ name: 'categoryname', length: 255, unique: true })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}