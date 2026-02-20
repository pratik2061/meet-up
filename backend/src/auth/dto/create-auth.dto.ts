import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateAuthDto {
  @IsString()
  @Matches(/^[A-Za-z ]+$/, {
    message: 'fullName can only contain letters and spaces',
  })
  @MaxLength(50, { message: 'fullName must be at most 50 characters long' })
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  @IsNotEmpty({ message: 'fullName is required' })
  fullName!: string;

  @IsEmail()
  @Length(5, 150, {
    message: 'email must be between 5 and 150 characters long',
  })
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString()
  @Length(8, 50, {
    message: 'password nust be between 8 and 50 characters long',
  })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9\- ]+$/, {
    message: 'Address can only contain letters, numbers, hyphen, and spaces',
  })
  @Length(5, 50, {
    message: 'address must be between 5 and 50 characters long',
  })
  @IsNotEmpty({ message: 'address is required' })
  @Transform(({ value }) => value?.trim())
  address!: string;
}
