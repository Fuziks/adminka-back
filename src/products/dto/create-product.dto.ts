import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}