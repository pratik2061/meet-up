import { UUID } from 'crypto';

export interface TokenPayLoad {
  id: UUID;
  email: string;
  createdAt: Date;
  exp: number;
}
