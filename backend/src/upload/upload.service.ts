import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${this.configService.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY')!
            }
        })
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME')!
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')!
    }

    async uploadToR2(file: Express.Multer.File) {
        const fileExtension = file.originalname.split('.').pop() || 'jpg';
        return this.uploadBufferToR2(file.buffer, file.mimetype, fileExtension);
    }

    async uploadBufferToR2(buffer: Buffer, mimetype: string, extension: string = 'jpg') {
        try {
            const uniqueFileName = `${randomUUID()}.${extension}`;
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: mimetype,
            });
            await this.s3Client.send(command);
            return {
                url: `${this.publicUrl}/${uniqueFileName}`,
                key: uniqueFileName,
                mimetype,
                size: buffer.length,
            };
        } catch (error) {
            throw new InternalServerErrorException("An error occurred while uploading buffer to R2");
        }
    }

    async uploadFromUrl(imageUrl: string) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                return null;
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            let extension = 'jpg';
            if (contentType.includes('png')) extension = 'png';
            else if (contentType.includes('webp')) extension = 'webp';
            else if (contentType.includes('gif')) extension = 'gif';

            return await this.uploadBufferToR2(buffer, contentType, extension);
        } catch {
            return null;
        }
    }
}