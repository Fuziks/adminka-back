import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAllPaginated(
    page: number,
    limit: number,
    sort: string,
    order: 'ASC' | 'DESC',
  ): Promise<{ data: Category[]; total: number; page: number; limit: number }> {
    const validSortFields = ['id', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'id';
    
    const [data, total] = await this.categoriesRepository.findAndCount({
      relations: ['products'],
      order: { [sortField]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  
    category.name = updateCategoryDto.name;
    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    
    const productsCount = await this.productsRepository.count({
      where: { category: { id } }
    });
    
    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ID ${id} - it has ${productsCount} associated products`
      );
    }
    
    await this.categoriesRepository.remove(category);
  }
}