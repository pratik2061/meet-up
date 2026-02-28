import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'generated/prisma/enums';
export class CreateAuthDto {
  @IsString()
  @Matches(/^[A-Za-z ]+$/, {
    message: 'fullName can only contain letters and spaces',
  })
  @MaxLength(50, { message: 'fullName must be at most 50 characters long' })
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  @IsNotEmpty({ message: 'fullName is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  fullName!: string;

  @IsEmail()
  @Length(5, 150, {
    message: 'email must be between 5 and 150 characters long',
  })
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  email!: string;

  @IsString()
  @Length(8, 50, {
    message: 'password must be between 8 and 50 characters long',
  })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;

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

  @IsString()
  @Matches(/^\d+$/, {
    message: 'Phone number must contain only digits',
  })
  @Length(10, 10, { message: 'phoneNumber must be exactly 10 characters long' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(Role, { message: 'Role is not valid' })
  @IsOptional()
  role?: string;
}
