import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJobPostDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(12000)
  description!: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}

