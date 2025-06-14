import { IsString, MinLength, MaxLength, Matches} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-zA-Zа-яА-Я0-9\s]+$/)
  name: string;
}