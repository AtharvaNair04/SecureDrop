import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(10000)
  description: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;
}
