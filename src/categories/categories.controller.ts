import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Logger } from '@nestjs/common';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination and sorting' })
  @ApiResponse({ status: 200, description: 'Return paginated and sorted categories', type: [Category] })
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
    return this.categoriesService.findAllPaginated(page, limit, sort, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Return category by ID', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'The category has been successfully created', type: Category })
  @ApiResponse({ status: 400, description: 'Category with this name already exists' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with associated products' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(+id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete categories' })
  @ApiBody({ type: [Number] })
  @ApiResponse({ status: 200, description: 'Categories deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete categories with associated products' })
  async bulkDelete(@Body() body: { ids: number[] }): Promise<void> {
    return this.categoriesService.bulkDelete(body.ids);
  }

  @Get('check-name/:name')
  @ApiOperation({ summary: 'Check if category name exists' })
  @ApiParam({ name: 'name', type: String })
  @ApiResponse({ status: 200, description: 'Returns whether name exists', type: Object })
  async checkNameExists(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.categoriesService.checkNameExists(name);
  }
}