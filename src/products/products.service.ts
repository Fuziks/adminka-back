import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    sort: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Promise<{ data: Product[]; total: number }> {
    try {
      const [data, total] = await this.productsRepository.findAndCount({
        relations: ['category'],
        order: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to get products: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: number): Promise<Product> {
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
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new BadRequestException(`Товар с названием "${createProductDto.name}" уже существует.`);
    }

    const product = new Product();
    product.name = createProductDto.name;
    product.brand = createProductDto.brand;
    product.price = createProductDto.price;

    if (createProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      
      if (!category) {
        throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
      }
      product.category = category;
    }

    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productsRepository.findOne({
        where: { name: updateProductDto.name },
      });
      
      if (existingProduct) {
        throw new BadRequestException(`Товар с названием "${updateProductDto.name}" уже существует.`);
      }
    }

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

  async checkNameExists(name: string): Promise<{ exists: boolean }> {
    const product = await this.productsRepository.findOne({
      where: { name },
    });
    return { exists: !!product };
  }
}