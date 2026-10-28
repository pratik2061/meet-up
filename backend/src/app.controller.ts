import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';
import { generateCsrfToken } from './config/csrf.config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('csrf-token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = generateCsrfToken(req, res);
    return res.json({ csrfToken });
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
