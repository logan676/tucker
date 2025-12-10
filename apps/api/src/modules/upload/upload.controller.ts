import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService, UploadResult, ImageType } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = 'general',
    @Body('type') type: ImageType = 'general',
  ): Promise<UploadResult> {
    return this.uploadService.uploadImage(file, folder, type);
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder: string = 'general',
    @Body('type') type: ImageType = 'general',
  ): Promise<UploadResult[]> {
    return this.uploadService.uploadImages(files, folder, type);
  }

  @Delete('image/:publicId')
  @ApiOperation({ summary: 'Delete an image by public ID' })
  async deleteImage(@Param('publicId') publicId: string): Promise<{ success: boolean }> {
    await this.uploadService.deleteImage(publicId);
    return { success: true };
  }

  @Post('delete-images')
  @ApiOperation({ summary: 'Delete multiple images by public IDs' })
  async deleteImages(@Body('publicIds') publicIds: string[]): Promise<{ success: boolean }> {
    await this.uploadService.deleteImages(publicIds);
    return { success: true };
  }
}
