import { IsOptional, IsString } from 'class-validator';

export class SearchUsersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  limit?: number;
}
