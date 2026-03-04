import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(
  OmitType(CreateAuthDto, ['role'] as const),
) {}
