import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { Banner, BannerType } from './entities/banner.entity';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async findActive(@Query('type') type?: BannerType): Promise<Banner[]> {
    return this.bannerService.findActive(type);
  }

  @Post(':id/click')
  async trackClick(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.bannerService.trackClick(id);
    return { success: true };
  }

  @Post(':id/view')
  async trackView(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.bannerService.trackView(id);
    return { success: true };
  }
}

@Controller('admin/banners')
export class AdminBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async findAll(): Promise<Banner[]> {
    return this.bannerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Banner | null> {
    return this.bannerService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Banner>): Promise<Banner> {
    return this.bannerService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Banner>,
  ): Promise<Banner | null> {
    return this.bannerService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.bannerService.remove(id);
    return { success: true };
  }
}
