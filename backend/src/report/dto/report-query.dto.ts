import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['all', 'user'])
  scope?: 'all' | 'user';

  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: 'csv' | 'json';
}
