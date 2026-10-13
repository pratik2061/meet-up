import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'fullName must be a string' })
  @Matches(/^[A-Za-z ]+$/, {
    message: 'fullName can only contain letters and spaces',
  })
  @MaxLength(50, { message: 'fullName must be at most 50 characters long' })
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  fullName?: string;

  @IsString()
  @Matches(/^\d+$/, {
    message: 'Phone number must contain only digits',
  })
  @Length(10, 10, { message: 'phoneNumber must be exactly 10 characters long' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  phoneNumber?: string;

  @IsString()
  @Matches(/^[A-Za-z0-9\-, ]+$/, {
    message: 'Address can only contain letters, numbers, hyphen, and spaces',
  })
  @Length(5, 50, {
    message: 'address must be between 5 and 50 characters long',
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  address?: string;
}
