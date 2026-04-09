import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GenerateDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsNumber()
  maxOutputTokens?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;
}
