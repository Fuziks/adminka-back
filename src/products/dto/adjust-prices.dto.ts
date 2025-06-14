import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class AdjustPricesDto {
  @IsNumber()
  percent: number;

  @IsOptional()
  brand?: string;

  @IsOptional()
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  increase?: boolean = true;
}
