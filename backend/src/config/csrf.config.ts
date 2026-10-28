import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';

const isProd = process.env.NODE_ENV === 'production';

const {
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () =>
    process.env.CSRF_SECRET!,
  getSessionIdentifier: () => '',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    httpOnly: true,
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: Request) => {
    return (
      (req.headers['x-csrf-token'] as string) ||
      (req.headers['x-xsrf-token'] as string) ||
      (req.body?._csrf as string) ||
      null
    );
  },
});

export { generateCsrfToken, validateRequest, doubleCsrfProtection };
