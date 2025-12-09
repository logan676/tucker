import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import stripeConfig from '@/config/stripe.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    ConfigModule.forFeature(stripeConfig),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService],
})
export class PaymentModule {}
