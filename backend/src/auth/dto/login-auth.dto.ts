import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginAuthDto {
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
}
