import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ description: 'Unique coupon code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Coupon name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Coupon description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, description: 'Type of discount' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Minimum order amount to use coupon' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount (for percentage coupons)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiProperty({ description: 'Start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Total usage limit (0 = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLimit?: number;

  @ApiPropertyOptional({ description: 'Per user usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Restrict to specific merchant' })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional({ description: 'Restrict to specific categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Merchant ID' })
  @IsUUID()
  merchantId: string;

  @ApiProperty({ description: 'Order total amount' })
  @IsNumber()
  @Min(0)
  orderAmount: number;
}

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  minOrderAmount: number;

  @ApiProperty()
  maxDiscount: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}

export class ApplyCouponResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty()
  discountAmount: number;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  coupon?: CouponResponseDto;
}
