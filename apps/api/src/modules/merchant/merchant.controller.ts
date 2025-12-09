import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { QueryMerchantsDto } from './dto/query-merchants.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Merchant } from './entities/merchant.entity';
import { Category } from './entities/category.entity';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get merchant list' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: QueryMerchantsDto) {
    return this.merchantService.findAll(query);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get merchant categories' })
  @ApiResponse({ status: 200 })
  async getCategories(): Promise<Category[]> {
    return this.merchantService.getCategories();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get merchant details' })
  @ApiResponse({ status: 200 })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Merchant> {
    return this.merchantService.findById(id);
  }
}
