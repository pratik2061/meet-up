import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerMemoryConfig } from './multer.config';
import { Throttle } from '@nestjs/throttler';

@Controller('upload')
export class UploadController {
    constructor(
        private readonly uploadService: UploadService
    ) { }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('file')
    @UseInterceptors(FileInterceptor('file', multerMemoryConfig))
    async uploadSingleField(
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException("File is required")
        }
        return await this.uploadService.uploadToR2(file)
    }
}
