import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: ['Large', 'Mild Spicy'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Merchant ID' })
  @IsNotEmpty()
  @IsUUID()
  merchantId: string;

  @ApiProperty({ description: 'Address ID' })
  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: 'No cilantro' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: 'Coupon ID' })
  @IsOptional()
  @IsUUID()
  couponId?: string;
}

export class CreateOrderResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderNo: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  deliveryFee: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  payAmount: number;

  @ApiProperty()
  payExpireAt: Date;
}
