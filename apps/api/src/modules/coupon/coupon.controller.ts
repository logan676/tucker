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
import { CouponService } from './coupon.service';
import {
  CreateCouponDto,
  ApplyCouponDto,
  ApplyCouponResponseDto,
  CouponResponseDto,
} from './dto/create-coupon.dto';
import { Coupon, CouponStatus } from './entities/coupon.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get available coupons for user' })
  @ApiResponse({ status: 200, type: [CouponResponseDto] })
  async getAvailableCoupons(
    @CurrentUser('id') userId: string,
    @Query('merchantId') merchantId?: string,
    @Query('orderAmount') orderAmount?: number,
  ): Promise<CouponResponseDto[]> {
    return this.couponService.getAvailableCoupons(
      userId,
      merchantId,
      orderAmount ? Number(orderAmount) : undefined,
    );
  }

  @Post('validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiResponse({ status: 200, type: ApplyCouponResponseDto })
  async validateCoupon(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyCouponDto,
  ): Promise<ApplyCouponResponseDto> {
    return this.couponService.validateCoupon(userId, dto);
  }
}

@ApiTags('Admin - Coupons')
@Controller('admin/coupons')
export class AdminCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, type: Coupon })
  async create(@Body() dto: CreateCouponDto): Promise<Coupon> {
    return this.couponService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all coupons' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: CouponStatus,
  ): Promise<PaginatedResult<Coupon>> {
    return this.couponService.findAll(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
      status,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiResponse({ status: 200, type: Coupon })
  async findById(@Param('id') id: string): Promise<Coupon> {
    return this.couponService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a coupon' })
  @ApiResponse({ status: 200, type: Coupon })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCouponDto>,
  ): Promise<Coupon> {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disable a coupon' })
  @ApiResponse({ status: 200, type: Coupon })
  async disable(@Param('id') id: string): Promise<Coupon> {
    return this.couponService.disable(id);
  }
}
