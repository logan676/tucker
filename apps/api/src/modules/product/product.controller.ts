import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Public } from '@/common/decorators/public.decorator';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get('merchants/:merchantId/products')
  @ApiOperation({ summary: 'Get merchant menu (products grouped by category)' })
  @ApiResponse({ status: 200 })
  async getProductsByMerchant(@Param('merchantId', ParseUUIDPipe) merchantId: string) {
    return this.productService.getProductsByMerchant(merchantId);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ status: 200 })
  async getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.getProductById(id);
  }
}
