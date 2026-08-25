import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @Length(5, 150, {
    message: 'email must be between 5 and 150 characters long',
  })
  @IsNotEmpty({ message: 'email is required' })
  @Transform(({ value }: { value: string }) => value.trim())
  email!: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  @Length(8, 50, {
    message: 'password must be between 8 and 50 characters long',
  })
  @IsNotEmpty({ message: 'password is required' })
  password!: string;
}
