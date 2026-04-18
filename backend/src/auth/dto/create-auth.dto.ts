import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class CreateAuthDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  @Matches(/^[A-Za-z ]+$/, {
    message: 'fullName can only contain letters and spaces',
  })
  @MaxLength(50, { message: 'fullName must be at most 50 characters long' })
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  @IsNotEmpty({ message: 'fullName is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  fullName!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @Length(5, 150, {
    message: 'email must be between 5 and 150 characters long',
  })
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  @Length(8, 50, {
    message: 'password must be between 8 and 50 characters long',
  })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'The address of the user',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9\-, ]+$/, {
    message: 'Address can only contain letters, numbers, hyphen, and spaces',
  })
  @Length(5, 50, {
    message: 'address must be between 5 and 50 characters long',
  })
  @IsNotEmpty({ message: 'address is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  address!: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user (exactly 10 digits)',
  })
  @IsString()
  @Matches(/^\d+$/, {
    message: 'Phone number must contain only digits',
  })
  @Length(10, 10, { message: 'phoneNumber must be exactly 10 characters long' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  phoneNumber!: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'The profile image Id related to model Image',
  })
  @IsUUID('4', { message: 'profileImageId must be a valid UUID' })
  @IsString()
  @IsOptional()
  profileImageId?: string;

  @ApiPropertyOptional({ enum: Role, description: 'The role of the user' })
  @IsEnum(Role, { message: 'Role is not valid' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ description: 'OAuth access token, if applicable' })
  @IsString()
  @IsOptional()
  accessToken?: string;
}
