import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';
import { BulkUpdateDto } from './dto/bulk-update.dto';

@Injectable()
export class ProductsService {
  search(arg0: string): Product[] | PromiseLike<Product[]> {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(ProductsService.name);
  
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAllPaginated(
    page: number,
    limit: number,
    sort: string,
    order: 'ASC' | 'DESC',
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const validSortFields = ['id', 'name', 'price', 'brand'];
    const sortField = validSortFields.includes(sort) ? sort : 'id';
    
    const [data, total] = await this.productsRepository.findAndCount({
      relations: ['category'],
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

  async findOne(id: number): Promise<Product> {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new Product();
    product.name = createProductDto.name;
    product.brand = createProductDto.brand;
    product.price = createProductDto.price;

    if (createProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createProductDto.categoryId} not found`,
        );
      }
      product.category = category;
    }

    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    if (updateProductDto.categoryId !== undefined) {
      if (updateProductDto.categoryId) {
        const category = await this.categoriesRepository.findOne({
          where: { id: updateProductDto.categoryId },
        });
        
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${updateProductDto.categoryId} not found`,
          );
        }
        product.category = category;
      } else {
        product.category = null;
      }
    }

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    
    if (updateProductDto.brand !== undefined) {
      product.brand = updateProductDto.brand;
    }
    
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }

    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productsRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
    });
  }

  async adjustPrices(
    percent: number,
    brand?: string,
    categoryId?: number,
    increase: boolean = true,
  ): Promise<void> {
    await this.productsRepository.query(
      'CALL adjust_product_prices($1, $2, $3, $4)',
      [percent, brand || null, categoryId || null, increase],
    );
  }

  async bulkDelete(ids: number[]): Promise<void> {
    await this.productsRepository.delete(ids);
  }

  async bulkUpdate(ids: number[], updateData: Partial<UpdateProductDto>): Promise<void> {
    const updateOptions: any = {
      name: updateData.name,
      brand: updateData.brand,
      price: updateData.price
    };

    if (updateData.categoryId !== undefined) {
      if (updateData.categoryId) {
        const category = await this.categoriesRepository.findOne({
          where: { id: updateData.categoryId }
        });
        
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${updateData.categoryId} not found`
          );
        }
        updateOptions.category = category;
      } else {
        updateOptions.category = null;
      }
    }

    await this.productsRepository.update(ids, updateOptions);
  }
}