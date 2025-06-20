import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustPricesDto } from './dto/adjust-prices.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { Logger } from '@nestjs/common';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and sorting' })
  @ApiResponse({ status: 200, description: 'Return paginated and sorted products', type: [Product] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field (default: id)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: ASC)' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = 'id',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.productsService.findAllPaginated(page, limit, sort, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Return product by ID', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'The product has been successfully created', type: Product })
  @ApiResponse({ status: 400, description: 'Product with this name already exists' })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Product with this name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(+id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiResponse({ status: 200, description: 'Return products by category', type: [Product] })
  findByCategory(@Param('categoryId') categoryId: string): Promise<Product[]> {
    return this.productsService.findByCategory(+categoryId);
  }

  @Post('adjust-prices')
  @ApiOperation({ summary: 'Adjust product prices' })
  @ApiBody({ type: AdjustPricesDto })
  @ApiResponse({ status: 200, description: 'Prices adjusted successfully' })
  adjustPrices(@Body() adjustPricesDto: AdjustPricesDto): Promise<void> {
    return this.productsService.adjustPrices(
      adjustPricesDto.percent,
      adjustPricesDto.brand,
      adjustPricesDto.categoryId,
      adjustPricesDto.increase,
    );
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete products' })
  @ApiBody({ type: [Number] })
  @ApiResponse({ status: 200, description: 'Products deleted successfully' })
  async bulkDelete(@Body() body: { ids: number[] }): Promise<void> {
    return this.productsService.bulkDelete(body.ids);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update products' })
  @ApiBody({ type: BulkUpdateDto })
  @ApiResponse({ status: 200, description: 'Products updated successfully' })
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDto): Promise<void> {
    return this.productsService.bulkUpdate(
      bulkUpdateDto.ids,
      {
        ...(bulkUpdateDto.price !== undefined && { price: bulkUpdateDto.price }),
        ...(bulkUpdateDto.categoryId !== undefined && { categoryId: bulkUpdateDto.categoryId })
      }
    );
  }

  @Get('check-name/:name')
  @ApiOperation({ summary: 'Check if product name exists' })
  @ApiParam({ name: 'name', type: String })
  @ApiResponse({ status: 200, description: 'Returns whether name exists', type: Object })
  async checkNameExists(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.productsService.checkNameExists(name);
  }
}