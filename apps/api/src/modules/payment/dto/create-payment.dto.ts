import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CARD = 'card',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export class PaymentResponseDto {
  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  method: PaymentMethod;

  @ApiProperty({ description: 'Mock payment URL or QR code data' })
  paymentUrl: string;

  @ApiProperty()
  expireAt: Date;
}

export class PaymentCallbackDto {
  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  success: boolean;
}

export class PaymentStatusDto {
  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  status: 'pending' | 'success' | 'failed' | 'expired';

  @ApiProperty()
  paidAt?: Date;
}
