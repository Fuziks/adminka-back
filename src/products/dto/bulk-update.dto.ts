import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class BulkUpdateDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  brand?: string;
}