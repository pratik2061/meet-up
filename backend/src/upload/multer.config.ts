import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { memoryStorage } from "multer";

export const multerMemoryConfig = {
    storage: memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ]
        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true)
        } else {
            callback(new BadRequestException('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'), false)
        }
    }
}