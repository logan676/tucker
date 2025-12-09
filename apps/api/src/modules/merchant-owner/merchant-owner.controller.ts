import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantOwnerService } from './merchant-owner.service';
import {
  DashboardStatsDto,
  QueryMerchantOrdersDto,
  UpdateOrderStatusDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateStoreSettingsDto,
  ToggleStoreOpenDto,
} from './dto/merchant-owner.dto';
import { Order } from '@/modules/order/entities/order.entity';
import { Product } from '@/modules/product/entities/product.entity';
import { Merchant } from '@/modules/merchant/entities/merchant.entity';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { MerchantOwnerGuard } from '@/common/guards/merchant-owner.guard';
import { CurrentMerchant } from '@/common/decorators/current-merchant.decorator';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@ApiTags('Merchant Portal')
@Controller('merchant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MerchantOwnerGuard)
export class MerchantOwnerController {
  constructor(private readonly merchantOwnerService: MerchantOwnerService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Get merchant dashboard stats' })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  async getDashboardStats(
    @CurrentMerchant('id') merchantId: string,
  ): Promise<DashboardStatsDto> {
    return this.merchantOwnerService.getDashboardStats(merchantId);
  }

  // Orders
  @Get('orders')
  @ApiOperation({ summary: 'Get merchant orders' })
  @ApiResponse({ status: 200 })
  async getOrders(
    @CurrentMerchant('id') merchantId: string,
    @Query() query: QueryMerchantOrdersDto,
  ): Promise<PaginatedResult<Order>> {
    return this.merchantOwnerService.getOrders(merchantId, query);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: Order })
  async getOrderById(
    @CurrentMerchant('id') merchantId: string,
    @Param('orderId') orderId: string,
  ): Promise<Order> {
    return this.merchantOwnerService.getOrderById(merchantId, orderId);
  }

  @Put('orders/:orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, type: Order })
  async updateOrderStatus(
    @CurrentMerchant('id') merchantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.merchantOwnerService.updateOrderStatus(merchantId, orderId, dto);
  }

  // Products
  @Get('products')
  @ApiOperation({ summary: 'Get merchant products' })
  @ApiResponse({ status: 200, type: [Product] })
  async getProducts(
    @CurrentMerchant('id') merchantId: string,
  ): Promise<Product[]> {
    return this.merchantOwnerService.getProducts(merchantId);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, type: Product })
  async getProductById(
    @CurrentMerchant('id') merchantId: string,
    @Param('productId') productId: string,
  ): Promise<Product> {
    return this.merchantOwnerService.getProductById(merchantId, productId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, type: Product })
  async createProduct(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: CreateProductDto,
  ): Promise<Product> {
    return this.merchantOwnerService.createProduct(merchantId, dto);
  }

  @Put('products/:productId')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, type: Product })
  async updateProduct(
    @CurrentMerchant('id') merchantId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.merchantOwnerService.updateProduct(merchantId, productId, dto);
  }

  @Delete('products/:productId')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200 })
  async deleteProduct(
    @CurrentMerchant('id') merchantId: string,
    @Param('productId') productId: string,
  ): Promise<{ success: boolean }> {
    await this.merchantOwnerService.deleteProduct(merchantId, productId);
    return { success: true };
  }

  @Put('products/:productId/availability')
  @ApiOperation({ summary: 'Toggle product availability' })
  @ApiResponse({ status: 200, type: Product })
  async toggleProductAvailability(
    @CurrentMerchant('id') merchantId: string,
    @Param('productId') productId: string,
    @Body() dto: { isAvailable: boolean },
  ): Promise<Product> {
    return this.merchantOwnerService.toggleProductAvailability(
      merchantId,
      productId,
      dto.isAvailable,
    );
  }

  // Store Settings
  @Get('store')
  @ApiOperation({ summary: 'Get store settings' })
  @ApiResponse({ status: 200, type: Merchant })
  async getStoreSettings(
    @CurrentMerchant('id') merchantId: string,
  ): Promise<Merchant> {
    return this.merchantOwnerService.getStoreSettings(merchantId);
  }

  @Put('store')
  @ApiOperation({ summary: 'Update store settings' })
  @ApiResponse({ status: 200, type: Merchant })
  async updateStoreSettings(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<Merchant> {
    return this.merchantOwnerService.updateStoreSettings(merchantId, dto);
  }

  @Put('store/open')
  @ApiOperation({ summary: 'Toggle store open/closed' })
  @ApiResponse({ status: 200, type: Merchant })
  async toggleStoreOpen(
    @CurrentMerchant('id') merchantId: string,
    @Body() dto: ToggleStoreOpenDto,
  ): Promise<Merchant> {
    return this.merchantOwnerService.toggleStoreOpen(merchantId, dto.isOpen);
  }
}
