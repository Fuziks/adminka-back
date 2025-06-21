import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    sort: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Promise<{ data: Category[]; total: number }> {
    try {
      const [data, total] = await this.categoriesRepository.findAndCount({
        relations: ['products'],
        order: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to get categories: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category with name "${createCategoryDto.name}" already exists.`);
    }

    const category = new Category();
    category.name = createCategoryDto.name;

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

  async bulkDelete(ids: number[]): Promise<void> {
    const productsCount = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.categoryId IN (:...ids)', { ids })
      .getCount();

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete categories - ${productsCount} products are associated with these categories`
      );
    }

    await this.categoriesRepository.delete(ids);
  }

  async checkNameExists(name: string): Promise<{ exists: boolean }> {
    const category = await this.categoriesRepository.findOne({
      where: { name },
    });
    return { exists: !!category };
  }
}