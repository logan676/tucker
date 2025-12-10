import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export type ImageType = 'logo' | 'banner' | 'product' | 'document' | 'general';

const TRANSFORMATIONS: Record<ImageType, object> = {
  logo: { width: 200, height: 200, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
  banner: { width: 800, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
  product: { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
  document: { quality: 'auto', fetch_format: 'auto' },
  general: { quality: 'auto', fetch_format: 'auto' },
};

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary credentials not configured. Upload functionality will not work.');
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    imageType: ImageType = 'general',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }

    try {
      const result = await this.uploadToCloudinary(file.buffer, {
        folder: `tucker/${folder}`,
        transformation: TRANSFORMATIONS[imageType],
        resource_type: 'image',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
    imageType: ImageType = 'general',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const maxFiles = 10;
    if (files.length > maxFiles) {
      throw new BadRequestException(`Maximum ${maxFiles} files allowed per upload`);
    }

    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, folder, imageType)),
    );

    return results;
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new BadRequestException('Failed to delete image');
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Cloudinary batch delete error:', error);
      throw new BadRequestException('Failed to delete images');
    }
  }

  private uploadToCloudinary(
    buffer: Buffer,
    options: object,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
