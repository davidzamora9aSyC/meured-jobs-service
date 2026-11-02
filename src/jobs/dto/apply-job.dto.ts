import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyJobDto {
  @IsOptional()
  @IsString()
  @MaxLength(6000)
  coverLetter?: string;
}

